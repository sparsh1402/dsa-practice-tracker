import React, { useState } from 'react'
import './AddQuestionForm.css'

const TOPICS = [
  { id: 1, name: 'Arrays & Strings' },
  { id: 2, name: 'Linked Lists' },
  { id: 3, name: 'Stacks & Queues' },
  { id: 4, name: 'Trees' },
  { id: 5, name: 'Graphs' },
  { id: 6, name: 'Dynamic Programming' },
  { id: 7, name: 'Backtracking' },
  { id: 8, name: 'Greedy Algorithms' },
  { id: 9, name: 'Binary Search' },
  { id: 10, name: 'Hash Tables' },
  { id: 11, name: 'Heaps' },
  { id: 12, name: 'Sliding Window' },
  { id: 13, name: 'Two Pointers' },
  { id: 14, name: 'Bit Manipulation' }
]

function AddQuestionForm({ onAddQuestion, topics }) {
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    difficulty: 'Easy',
    link: '',
    approach: '',
    timeComplexity: '',
    spaceComplexity: '',
    keyPoints: '',
    edgeCases: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.topic) {
      alert('Please fill in title and topic')
      return
    }

    onAddQuestion(formData)
    
    // Reset form
    setFormData({
      title: '',
      topic: '',
      difficulty: 'Easy',
      link: '',
      approach: '',
      timeComplexity: '',
      spaceComplexity: '',
      keyPoints: '',
      edgeCases: ''
    })
  }

  return (
    <div className="add-question-form">
      <h2>Add New Question</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Question Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Two Sum"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="topic">Topic *</label>
          <select
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
          >
            <option value="">Select a topic</option>
            {TOPICS.map(topic => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="link">Problem Link</label>
          <input
            type="url"
            id="link"
            name="link"
            value={formData.link}
            onChange={handleChange}
            placeholder="https://leetcode.com/problems/..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="approach">Approach</label>
          <textarea
            id="approach"
            name="approach"
            value={formData.approach}
            onChange={handleChange}
            rows="3"
            placeholder="Describe your approach..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="timeComplexity">Time Complexity</label>
            <input
              type="text"
              id="timeComplexity"
              name="timeComplexity"
              value={formData.timeComplexity}
              onChange={handleChange}
              placeholder="O(n)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="spaceComplexity">Space Complexity</label>
            <input
              type="text"
              id="spaceComplexity"
              name="spaceComplexity"
              value={formData.spaceComplexity}
              onChange={handleChange}
              placeholder="O(1)"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="keyPoints">Key Points (one per line)</label>
          <textarea
            id="keyPoints"
            name="keyPoints"
            value={formData.keyPoints}
            onChange={handleChange}
            rows="3"
            placeholder="Key point 1&#10;Key point 2"
          />
        </div>

        <div className="form-group">
          <label htmlFor="edgeCases">Edge Cases (one per line)</label>
          <textarea
            id="edgeCases"
            name="edgeCases"
            value={formData.edgeCases}
            onChange={handleChange}
            rows="2"
            placeholder="Empty array&#10;Single element"
          />
        </div>

        <button type="submit" className="submit-button">
          Add Question
        </button>
      </form>
    </div>
  )
}

export default AddQuestionForm

