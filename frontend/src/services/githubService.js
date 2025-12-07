import { Octokit } from '@octokit/rest'

class GitHubService {
  constructor(owner, repo, token) {
    this.owner = owner
    this.repo = repo
    this.octokit = new Octokit({ auth: token })
  }

  // Parse README to extract questions and topics
  async parseREADME() {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: 'README.md'
      })

      if (!data || !data.content) {
        throw new Error('README.md is empty or could not be read')
      }

      const content = Buffer.from(data.content, 'base64').toString('utf-8')
      
      if (!content || content.length === 0) {
        throw new Error('README.md content is empty')
      }

      const parsed = this.parseReadmeContent(content)
      
      // Ensure we always return valid structure
      return {
        topics: parsed.topics || [],
        questions: parsed.questions || []
      }
    } catch (error) {
      console.error('Error fetching README:', error)
      // Add more context to the error
      if (error.status) {
        error.message = `GitHub API error (${error.status}): ${error.message}`
      }
      throw error
    }
  }

  parseReadmeContent(content) {
    const topics = []
    const questions = []
    
    // Topic mapping
    const topicMap = {
      'Arrays & Strings': 1,
      'Linked Lists': 2,
      'Stacks & Queues': 3,
      'Trees': 4,
      'Graphs': 5,
      'Dynamic Programming': 6,
      'Backtracking': 7,
      'Greedy Algorithms': 8,
      'Binary Search': 9,
      'Hash Tables': 10,
      'Heaps': 11,
      'Sliding Window': 12,
      'Two Pointers': 13,
      'Bit Manipulation': 14
    }

    const topicNames = Object.keys(topicMap)
    
    // Extract topics
    topicNames.forEach((name, index) => {
      topics.push({
        id: index + 1,
        name: name
      })
    })

    // If content is empty or doesn't have expected structure, return empty
    if (!content || content.length < 100) {
      console.warn('README content seems too short or empty')
      return { topics, questions }
    }

    // Parse questions from README
    const lines = content.split('\n')
    let currentTopic = null
    let currentQuestion = null
    let inQuestionBlock = false
    let currentKey = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Detect topic headers - more flexible matching
      const topicMatch = line.match(/^###\s+\d+\.\s+(.+)$/)
      if (topicMatch) {
        const topicName = topicMatch[1].trim()
        if (topicMap[topicName]) {
          currentTopic = topicMap[topicName]
        }
        // Reset question block when new topic found
        if (currentQuestion) {
          questions.push(currentQuestion)
          currentQuestion = null
        }
        inQuestionBlock = false
        currentKey = null
        continue
      }

      // Skip "#### Questions:" header
      if (line.match(/^####\s+Questions?:/i)) {
        continue
      }

      // Detect question entries - more flexible matching
      // Matches: "- [ ] Question 1: Title" or "- [x] Question 1: Title"
      const questionMatch = line.match(/^- \[([ x])\]\s*Question\s+\d+:\s*(.+)$/)
      if (questionMatch) {
        if (currentQuestion) {
          questions.push(currentQuestion)
        }
        currentQuestion = {
          topic: currentTopic,
          title: questionMatch[2].trim(),
          completed: questionMatch[1] === 'x',
          keyPoints: [],
          edgeCases: [],
          notes: []
        }
        inQuestionBlock = true
        currentKey = null
        continue
      }

      if (inQuestionBlock && currentQuestion) {
        // Parse question details
        if (line.includes('**Difficulty:**')) {
          const difficultyMatch = line.match(/\*\*Difficulty:\*\*\s*(.+)/)
          if (difficultyMatch) {
            currentQuestion.difficulty = difficultyMatch[1].trim()
          }
        } else if (line.includes('**Solution:**')) {
          const solutionMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/)
          if (solutionMatch) {
            currentQuestion.solutionPath = solutionMatch[2]
            currentQuestion.link = solutionMatch[2]
          }
        } else if (line.includes('**Key Points:**')) {
          currentKey = 'keyPoints'
        } else if (line.includes('**Edge Cases:**')) {
          currentKey = 'edgeCases'
        } else if (line.includes('**Notes:**')) {
          currentKey = 'notes'
        } else if (line.match(/^\s{2,}- (.+)$/)) {
          // Match bullet points with 2+ spaces indentation (sub-items)
          const value = line.replace(/^\s+- /, '').trim()
          if (value && currentKey && currentQuestion[currentKey] && Array.isArray(currentQuestion[currentKey])) {
            // Skip placeholder text
            if (!value.toLowerCase().includes('to be updated') && !value.toLowerCase().includes('[to be updated]')) {
              currentQuestion[currentKey].push(value)
            }
          }
        } else if (line.startsWith('---') || (line.startsWith('###') && line.match(/^###\s+\d+\./))) {
          // End of question block
          if (currentQuestion) {
            questions.push(currentQuestion)
            currentQuestion = null
          }
          inQuestionBlock = false
          currentKey = null
        } else if (line === '' && currentKey) {
          // Empty line might end a section, but keep currentKey for now
          continue
        }
      }
    }

    // Don't forget the last question
    if (currentQuestion) {
      questions.push(currentQuestion)
    }

    console.log(`Parsed ${questions.length} questions from README`)
    return { topics, questions }
  }

  // Add a new question to README
  async addQuestion(questionData) {
    try {
      // Get current README
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: 'README.md'
      })

      let content = Buffer.from(data.content, 'base64').toString('utf-8')
      const sha = data.sha

      // Find the topic section
      const topicNames = [
        'Arrays & Strings', 'Linked Lists', 'Stacks & Queues', 'Trees',
        'Graphs', 'Dynamic Programming', 'Backtracking', 'Greedy Algorithms',
        'Binary Search', 'Hash Tables', 'Heaps', 'Sliding Window',
        'Two Pointers', 'Bit Manipulation'
      ]

      const topicName = topicNames[parseInt(questionData.topic) - 1]
      const topicRegex = new RegExp(`(### ${parseInt(questionData.topic)}\\. ${topicName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?)(---|###)`, 'm')
      
      const match = content.match(topicRegex)
      if (!match) {
        throw new Error(`Topic section not found: ${topicName}`)
      }

      // Count existing questions in this topic
      const existingQuestions = (match[1].match(/- \[/g) || []).length
      const questionNumber = existingQuestions + 1

      // Build question entry
      const questionEntry = this.buildQuestionEntry(questionData, questionNumber, parseInt(questionData.topic))

      // Insert question before the closing ---
      const topicSection = match[1]
      const updatedSection = topicSection + '\n' + questionEntry + '\n'

      // Update content
      content = content.replace(topicRegex, updatedSection + '$2')

      // Update question count
      const countRegex = new RegExp(`(### ${parseInt(questionData.topic)}\\. ${topicName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?- \\*\\*Questions Solved:\\*\\* )\\d+`, 'm')
      const currentCount = parseInt((content.match(countRegex)?.[0] || '0').match(/\d+$/)?.[0] || '0')
      content = content.replace(countRegex, `$1${currentCount + 1}`)

      // Update status if needed
      if (currentCount === 0) {
        content = content.replace(
          new RegExp(`(### ${parseInt(questionData.topic)}\\. ${topicName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?- \\*\\*Status:\\*\\* )🔴 Not Started`, 'm'),
          '$1🟡 In Progress'
        )
      }

      // Update total questions count
      const totalCountMatch = content.match(/- \*\*Total Questions Solved:\*\* (\d+)/)
      if (totalCountMatch) {
        const totalCount = parseInt(totalCountMatch[1])
        content = content.replace(
          /- \*\*Total Questions Solved:\*\* \d+/,
          `- **Total Questions Solved:** ${totalCount + 1}`
        )
      }

      // Update README
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: 'README.md',
        message: `Add question: ${questionData.title}`,
        content: Buffer.from(content).toString('base64'),
        sha: sha
      })

      // Create solution file
      await this.createSolutionFile(questionData, parseInt(questionData.topic))

    } catch (error) {
      console.error('Error adding question:', error)
      throw error
    }
  }

  buildQuestionEntry(questionData, questionNumber, topicNumber) {
    const topicFolders = [
      '01-Arrays-Strings', '02-Linked-Lists', '03-Stacks-Queues', '04-Trees',
      '05-Graphs', '06-Dynamic-Programming', '07-Backtracking', '08-Greedy-Algorithms',
      '09-Binary-Search', '10-Hash-Tables', '11-Heaps', '12-Sliding-Window',
      '13-Two-Pointers', '14-Bit-Manipulation'
    ]

    const folderName = questionData.title.replace(/\s+/g, '-')
    const solutionPath = `${topicFolders[topicNumber - 1]}/${folderName}/solution.md`

    let entry = `- [ ] Question ${questionNumber}: ${questionData.title}\n`
    entry += `  - **Difficulty:** ${questionData.difficulty || 'Easy'}\n`
    entry += `  - **Solution:** [${solutionPath}](${solutionPath})\n`
    
    if (questionData.keyPoints) {
      const points = questionData.keyPoints.split('\n').filter(p => p.trim())
      if (points.length > 0) {
        entry += `  - **Key Points:**\n`
        points.forEach(point => {
          entry += `    - ${point.trim()}\n`
        })
      }
    }

    if (questionData.edgeCases) {
      const cases = questionData.edgeCases.split('\n').filter(c => c.trim())
      if (cases.length > 0) {
        entry += `  - **Edge Cases:**\n`
        cases.forEach(edgeCase => {
          entry += `    - ${edgeCase.trim()}\n`
        })
      }
    }

    return entry
  }

  async createSolutionFile(questionData, topicNumber) {
    const topicFolders = [
      '01-Arrays-Strings', '02-Linked-Lists', '03-Stacks-Queues', '04-Trees',
      '05-Graphs', '06-Dynamic-Programming', '07-Backtracking', '08-Greedy-Algorithms',
      '09-Binary-Search', '10-Hash-Tables', '11-Heaps', '12-Sliding-Window',
      '13-Two-Pointers', '14-Bit-Manipulation'
    ]

    const folderName = questionData.title.replace(/\s+/g, '-')
    const folderPath = `${topicFolders[topicNumber - 1]}/${folderName}`
    const filePath = `${folderPath}/solution.md`

    // Check if file already exists
    try {
      await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: filePath
      })
      // File exists, skip creation
      return
    } catch (error) {
      // File doesn't exist, create it
    }

    // Build solution content
    let solutionContent = `# ${questionData.title}\n\n`
    solutionContent += `## Problem Statement\n`
    solutionContent += `[Paste the problem statement here]\n\n`
    solutionContent += `## Link\n`
    solutionContent += `${questionData.link || '[LeetCode/Codeforces/etc. link]'}\n\n`
    solutionContent += `## Difficulty\n`
    solutionContent += `${questionData.difficulty || 'Easy'}\n\n`
    solutionContent += `## Approach\n`
    solutionContent += `${questionData.approach || '[Describe your approach/algorithm]'}\n\n`
    solutionContent += `## Solution\n\n`
    solutionContent += `### Language: [Python/Java/C++/etc.]\n\n`
    solutionContent += `\`\`\`[language]\n`
    solutionContent += `[Your solution code here]\n`
    solutionContent += `\`\`\`\n\n`
    solutionContent += `## Time Complexity\n`
    solutionContent += `${questionData.timeComplexity || 'O([complexity])'}\n\n`
    solutionContent += `## Space Complexity\n`
    solutionContent += `${questionData.spaceComplexity || 'O([complexity])'}\n\n`

    if (questionData.keyPoints) {
      const points = questionData.keyPoints.split('\n').filter(p => p.trim())
      if (points.length > 0) {
        solutionContent += `## Key Points\n`
        points.forEach(point => {
          solutionContent += `- ${point.trim()}\n`
        })
        solutionContent += `\n`
      }
    }

    if (questionData.edgeCases) {
      const cases = questionData.edgeCases.split('\n').filter(c => c.trim())
      if (cases.length > 0) {
        solutionContent += `## Edge Cases Considered\n`
        cases.forEach(edgeCase => {
          solutionContent += `- ${edgeCase.trim()}\n`
        })
        solutionContent += `\n`
      }
    }

    solutionContent += `## Notes\n`
    solutionContent += `[Any additional notes, learnings, or observations]\n`

    // Create the file
    try {
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: `Add solution file for ${questionData.title}`,
        content: Buffer.from(solutionContent).toString('base64')
      })
    } catch (error) {
      console.error('Error creating solution file:', error)
      // Continue even if file creation fails
    }
  }

  // Add a note to a question
  async addNote(topicIndex, questionIndex, note) {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: 'README.md'
      })

      let content = Buffer.from(data.content, 'base64').toString('utf-8')
      const sha = data.sha

      // This is a simplified version - in a real implementation,
      // you'd need to parse and find the exact question location
      // For now, we'll append notes to the question entry
      
      const topicNames = [
        'Arrays & Strings', 'Linked Lists', 'Stacks & Queues', 'Trees',
        'Graphs', 'Dynamic Programming', 'Backtracking', 'Greedy Algorithms',
        'Binary Search', 'Hash Tables', 'Heaps', 'Sliding Window',
        'Two Pointers', 'Bit Manipulation'
      ]

      const topicName = topicNames[topicIndex]
      const topicNum = topicIndex + 1

      // Find the topic section and the specific question
      const topicRegex = new RegExp(`(### ${topicNum}\\. ${topicName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?)(---|###)`, 'm')
      const match = content.match(topicRegex)
      
      if (match) {
        const topicSection = match[1]
        const questionMatches = [...topicSection.matchAll(/- \[([ x])\] Question \d+:\s*(.+)$/gm)]
        
        if (questionMatches[questionIndex]) {
          const questionTitle = questionMatches[questionIndex][2]
          // Find the question block and add note
          const questionBlockRegex = new RegExp(
            `(- \\[([ x])\\] Question \\d+: ${questionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?)(?=- \\[|---|###)`,
            'm'
          )
          
          const questionMatch = content.match(questionBlockRegex)
          if (questionMatch) {
            let questionBlock = questionMatch[1]
            
            // Check if notes section exists
            if (questionBlock.includes('- **Notes:**')) {
              // Append to existing notes
              questionBlock = questionBlock.replace(
                /(- \*\*Notes:\*\*\n(?:    - .+\n)*)/,
                `$1    - ${note}\n`
              )
            } else {
              // Add new notes section
              questionBlock += `  - **Notes:**\n    - ${note}\n`
            }
            
            content = content.replace(questionBlockRegex, questionBlock)
          }
        }
      }

      // Update README
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: 'README.md',
        message: `Add note to question`,
        content: Buffer.from(content).toString('base64'),
        sha: sha
      })

    } catch (error) {
      console.error('Error adding note:', error)
      throw error
    }
  }
}

let githubServiceInstance = null

export function getGitHubService(owner, repo, token) {
  if (!githubServiceInstance || 
      githubServiceInstance.owner !== owner || 
      githubServiceInstance.repo !== repo) {
    githubServiceInstance = new GitHubService(owner, repo, token)
  }
  return githubServiceInstance
}

export default GitHubService

