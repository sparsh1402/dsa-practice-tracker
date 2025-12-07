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
      const githubService = getGitHubService(owner, repo, token)
      const data = await githubService.parseREADME()
      setQuestions(data.questions || [])
      setTopics(data.topics || [])
    } catch (error) {
      console.error('Error loading questions:', error)
      let errorMessage = 'Error loading questions. '
      
      if (error.status === 401) {
        errorMessage += 'Invalid GitHub token. Please check your token has the "repo" scope.'
      } else if (error.status === 404) {
        errorMessage += `Repository "${owner}/${repo}" not found or README.md doesn't exist.`
      } else if (error.status === 403) {
        errorMessage += 'Access forbidden. Please check your token permissions.'
      } else {
        errorMessage += `Error: ${error.message || 'Unknown error'}. Please check your GitHub credentials and repository name.`
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

