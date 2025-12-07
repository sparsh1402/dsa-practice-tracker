import React, { useState, useEffect } from 'react'
import './App.css'
import QuestionList from './components/QuestionList'
import AddQuestionForm from './components/AddQuestionForm'
import GitHubAuth from './components/GitHubAuth'
import { getGitHubService } from './services/githubService'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [questions, setQuestions] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [repoConfig, setRepoConfig] = useState({
    owner: '',
    repo: '',
    token: ''
  })

  useEffect(() => {
    // Check if GitHub token is stored
    const storedToken = localStorage.getItem('github_token')
    const storedOwner = localStorage.getItem('github_owner')
    const storedRepo = localStorage.getItem('github_repo')
    
    if (storedToken && storedOwner && storedRepo) {
      setRepoConfig({
        owner: storedOwner,
        repo: storedRepo,
        token: storedToken
      })
      setIsAuthenticated(true)
      loadQuestions(storedOwner, storedRepo, storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const loadQuestions = async (owner, repo, token) => {
    try {
      setLoading(true)
      
      // Clean inputs
      const cleanOwner = owner.trim()
      const cleanRepo = repo.trim()
      const cleanToken = token.trim()
      
      // Validate token format
      if (!cleanToken.startsWith('ghp_') && !cleanToken.startsWith('github_pat_')) {
        throw new Error('Invalid token format. GitHub tokens should start with "ghp_" or "github_pat_"')
      }
      
      const githubService = getGitHubService(cleanOwner, cleanRepo, cleanToken)
      const data = await githubService.parseREADME()
      setQuestions(data.questions || [])
      setTopics(data.topics || [])
    } catch (error) {
      console.error('Error loading questions:', error)
      console.error('Full error object:', error)
      
      let errorMessage = 'Error loading questions. '
      
      if (error.status === 401) {
        errorMessage = 'Invalid GitHub token. Please:\n\n' +
          '1. Check if you copied the FULL token (it should start with "ghp_")\n' +
          '2. Verify the token has "repo" scope selected\n' +
          '3. Make sure the token hasn\'t expired\n' +
          '4. Try generating a new token at: https://github.com/settings/tokens'
      } else if (error.status === 404) {
        errorMessage = `Repository "${owner}/${repo}" not found. Please check:\n\n` +
          '1. Repository name is correct (case-sensitive)\n' +
          '2. Username/organization name is correct\n' +
          '3. Repository exists and is accessible'
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden. Please ensure:\n\n' +
          '1. Your token has "repo" scope selected\n' +
          '2. The repository is accessible with this token\n' +
          '3. If it\'s a private repo, verify token has access'
      } else if (error.message) {
        errorMessage += error.message
      } else {
        errorMessage += `Unknown error. Check browser console (F12) for details.`
      }
      
      alert(errorMessage)
      setIsAuthenticated(false)
      localStorage.removeItem('github_token')
      localStorage.removeItem('github_owner')
      localStorage.removeItem('github_repo')
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = (owner, repo, token) => {
    localStorage.setItem('github_token', token)
    localStorage.setItem('github_owner', owner)
    localStorage.setItem('github_repo', repo)
    setRepoConfig({ owner, repo, token })
    setIsAuthenticated(true)
    loadQuestions(owner, repo, token)
  }

  const handleAddQuestion = async (questionData) => {
    try {
      const githubService = getGitHubService(repoConfig.owner, repoConfig.repo, repoConfig.token)
      await githubService.addQuestion(questionData)
      // Reload questions
      await loadQuestions(repoConfig.owner, repoConfig.repo, repoConfig.token)
      alert('Question added successfully!')
    } catch (error) {
      console.error('Error adding question:', error)
      alert('Error adding question. Please try again.')
    }
  }

  const handleAddNote = async (topicIndex, questionIndex, note) => {
    try {
      const githubService = getGitHubService(repoConfig.owner, repoConfig.repo, repoConfig.token)
      await githubService.addNote(topicIndex, questionIndex, note)
      // Reload questions
      await loadQuestions(repoConfig.owner, repoConfig.repo, repoConfig.token)
      alert('Note added successfully!')
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Error adding note. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="container">
          <h1>DSA Practice Tracker 🚀</h1>
          <GitHubAuth onAuth={handleAuth} />
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>DSA Practice Tracker 🚀</h1>
          <p className="subtitle">Track your daily DSA practice - 3 questions per day</p>
        </header>

        <div className="main-content">
          <div className="left-panel">
            <AddQuestionForm onAddQuestion={handleAddQuestion} topics={topics} />
          </div>

          <div className="right-panel">
            <QuestionList 
              questions={questions} 
              topics={topics}
              onAddNote={handleAddNote}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

