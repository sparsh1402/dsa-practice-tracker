import React, { useState } from 'react'
import './GitHubAuth.css'

function GitHubAuth({ onAuth }) {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)

  const [testing, setTesting] = useState(false)

  const testConnection = async (e) => {
    e.preventDefault()
    if (!owner || !repo || !token) {
      alert('Please fill in all fields first')
      return
    }

    setTesting(true)
    try {
      const { Octokit } = await import('@octokit/rest')
      
      // Clean token (remove any whitespace)
      const cleanToken = token.trim()
      
      // Validate token format
      if (!cleanToken.startsWith('ghp_') && !cleanToken.startsWith('github_pat_')) {
        alert('⚠️ Token format looks incorrect. GitHub tokens usually start with "ghp_" or "github_pat_". Please check your token.')
        setTesting(false)
        return
      }
      
      const octokit = new Octokit({ auth: cleanToken })
      
      // Test 1: Check if we can access the repo
      try {
        await octokit.repos.get({
          owner: owner.trim(),
          repo: repo.trim()
        })
      } catch (repoError) {
        if (repoError.status === 401) {
          alert('❌ Authentication failed. The token is invalid or expired. Please:\n1. Check if you copied the full token\n2. Verify the token has "repo" scope\n3. Generate a new token if needed')
          setTesting(false)
          return
        } else if (repoError.status === 404) {
          alert(`❌ Repository "${owner}/${repo}" not found. Please check:\n1. Repository name is correct\n2. Repository exists and is accessible\n3. Username/organization name is correct`)
          setTesting(false)
          return
        } else if (repoError.status === 403) {
          alert('❌ Access forbidden. Please ensure:\n1. Your token has "repo" scope selected\n2. The repository is accessible with this token\n3. If it\'s a private repo, the token has access')
          setTesting(false)
          return
        }
        throw repoError
      }
      
      // Test 2: Check if README exists
      try {
        await octokit.repos.getContent({
          owner: owner.trim(),
          repo: repo.trim(),
          path: 'README.md'
        })
        alert('✅ Connection successful! README.md found. Click "Connect to GitHub" to proceed.')
      } catch (error) {
        // Handle specific error codes for README access
        if (error.status === 404) {
          alert('⚠️ Repository found, but README.md not found. Please create a README.md file first.')
          setTesting(false)
          return
        } else if (error.status === 401) {
          alert('❌ Authentication failed when accessing README.md. The token is invalid or expired. Please:\n1. Check if you copied the full token\n2. Verify the token has "repo" scope\n3. Generate a new token if needed')
          setTesting(false)
          return
        } else if (error.status === 403) {
          alert('❌ Access forbidden when accessing README.md. Please ensure:\n1. Your token has "repo" scope with read/write permissions\n2. The token has access to read repository contents\n3. If it\'s a private repo, verify the token has proper access')
          setTesting(false)
          return
        } else {
          // For other errors (network issues, etc.), rethrow to be caught by outer catch
          throw error
        }
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      alert(`❌ Connection failed: ${error.message || 'Unknown error'}\n\nCheck the browser console (F12) for more details.`)
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (owner && repo && token) {
      onAuth(owner, repo, token)
    } else {
      alert('Please fill in all fields')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Connect to GitHub</h2>
        <p className="auth-description">
          Enter your GitHub repository details to sync your DSA tracker
        </p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="owner">GitHub Username/Organization</label>
            <input
              type="text"
              id="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="your-username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="repo">Repository Name</label>
            <input
              type="text"
              id="repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="dsa-practice-tracker"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="token">
              GitHub Personal Access Token
              <span className="help-icon" title="Create a token at: https://github.com/settings/tokens with 'repo' scope">ℹ️</span>
            </label>
            <div className="token-input-wrapper">
              <input
                type={showToken ? "text" : "password"}
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                required
              />
              <button
                type="button"
                className="toggle-token"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <small>
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Create a token here
              </a> (needs 'repo' scope)
            </small>
          </div>

          <div className="button-group">
            <button 
              type="button" 
              onClick={testConnection}
              disabled={testing || !owner || !repo || !token}
              className="test-button"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button type="submit" className="auth-button">
              Connect to GitHub
            </button>
          </div>
        </form>

        <div className="auth-info">
          <h3>How to get a GitHub Token:</h3>
          <ol>
            <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">GitHub Settings → Developer settings → Personal access tokens</a></li>
            <li>Click "Generate new token (classic)"</li>
            <li>Give it a name (e.g., "DSA Tracker")</li>
            <li>Select the <strong>repo</strong> scope</li>
            <li>Click "Generate token" and copy it</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default GitHubAuth
