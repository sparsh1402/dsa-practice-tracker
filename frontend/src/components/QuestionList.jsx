import React, { useState } from 'react'
import './QuestionList.css'

function QuestionList({ questions, topics, onAddNote }) {
  const [expandedTopic, setExpandedTopic] = useState(null)
  const [noteInputs, setNoteInputs] = useState({})

  const toggleTopic = (topicIndex) => {
    setExpandedTopic(expandedTopic === topicIndex ? null : topicIndex)
  }

  const handleNoteChange = (topicIndex, questionIndex, value) => {
    const key = `${topicIndex}-${questionIndex}`
    setNoteInputs(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleAddNote = (topicIndex, questionIndex) => {
    const key = `${topicIndex}-${questionIndex}`
    const note = noteInputs[key]
    if (note && note.trim()) {
      onAddNote(topicIndex, questionIndex, note)
      setNoteInputs(prev => {
        const newInputs = { ...prev }
        delete newInputs[key]
        return newInputs
      })
    }
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="question-list">
        <div className="empty-state">
          <h2>No questions yet</h2>
          <p>Add your first question using the form on the left!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="question-list">
      <h2>Your Questions</h2>
      {topics.map((topic, topicIndex) => {
        const topicQuestions = questions.filter(q => q.topic === topic.id)
        if (topicQuestions.length === 0) return null

        return (
          <div key={topic.id} className="topic-section">
            <div 
              className="topic-header"
              onClick={() => toggleTopic(topicIndex)}
            >
              <h3>
                {topic.id}. {topic.name}
                <span className="question-count">({topicQuestions.length})</span>
              </h3>
              <span className="toggle-icon">
                {expandedTopic === topicIndex ? '▼' : '▶'}
              </span>
            </div>

            {expandedTopic === topicIndex && (
              <div className="questions-container">
                {topicQuestions.map((question, qIndex) => {
                  const noteKey = `${topicIndex}-${qIndex}`
                  return (
                    <div key={qIndex} className="question-card">
                      <div className="question-header">
                        <div className="question-title-row">
                          <input
                            type="checkbox"
                            checked={question.completed}
                            readOnly
                            className="question-checkbox"
                          />
                          <h4>{question.title}</h4>
                          <span className={`difficulty-badge ${question.difficulty?.toLowerCase()}`}>
                            {question.difficulty || 'Easy'}
                          </span>
                        </div>
                        {question.link && (
                          <a 
                            href={question.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="question-link"
                          >
                            🔗 View Problem
                          </a>
                        )}
                      </div>

                      {question.approach && (
                        <div className="question-detail">
                          <strong>Approach:</strong> {question.approach}
                        </div>
                      )}

                      {(question.timeComplexity || question.spaceComplexity) && (
                        <div className="complexity-row">
                          {question.timeComplexity && (
                            <span><strong>Time:</strong> {question.timeComplexity}</span>
                          )}
                          {question.spaceComplexity && (
                            <span><strong>Space:</strong> {question.spaceComplexity}</span>
                          )}
                        </div>
                      )}

                      {question.keyPoints && question.keyPoints.length > 0 && (
                        <div className="question-detail">
                          <strong>Key Points:</strong>
                          <ul>
                            {question.keyPoints.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {question.edgeCases && question.edgeCases.length > 0 && (
                        <div className="question-detail">
                          <strong>Edge Cases:</strong>
                          <ul>
                            {question.edgeCases.map((edgeCase, idx) => (
                              <li key={idx}>{edgeCase}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {question.notes && question.notes.length > 0 && (
                        <div className="question-notes">
                          <strong>Notes:</strong>
                          {question.notes.map((note, idx) => (
                            <div key={idx} className="note-item">
                              {note}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="add-note-section">
                        <textarea
                          placeholder="Add a note about this question..."
                          value={noteInputs[noteKey] || ''}
                          onChange={(e) => handleNoteChange(topicIndex, qIndex, e.target.value)}
                          rows="2"
                          className="note-input"
                        />
                        <button
                          onClick={() => handleAddNote(topicIndex, qIndex)}
                          className="add-note-button"
                          disabled={!noteInputs[noteKey] || !noteInputs[noteKey].trim()}
                        >
                          Add Note
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default QuestionList
