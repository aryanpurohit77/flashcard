import React, { useState } from 'react';
import axios from 'axios';
import './Dashboard.css';


export default function Dashboard({ flashcards, setFlashcards }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  function handleAdd() {
    axios.post('http://localhost:5000/flashcards', { question, answer, options: [] })
      .then(res => {
        setFlashcards([...flashcards, res.data]);
        setQuestion('');
        setAnswer('');
      });
  }

  function handleEdit() {
    axios.put(`http://localhost:5000/flashcards/${selectedCard.id}`, { question, answer, options: [] })
      .then(() => {
        const updatedFlashcards = flashcards.map(card =>
          card.id === selectedCard.id
            ? { ...card, question, answer }
            : card
        );
        setFlashcards(updatedFlashcards);
        setSelectedCard(null);
        setQuestion('');
        setAnswer('');
      });
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="form-group">
        <label htmlFor="question">Question</label>
        <input
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="answer">Answer</label>
        <input
          type="text"
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </div>
      {selectedCard ? (
        <button onClick={handleEdit}>Save Changes</button>
      ) : (
        <button onClick={handleAdd}>Add Flashcard</button>
      )}
      <div className="flashcard-list">
        {flashcards.map(card => (
          <div key={card.id} className="flashcard-item">
            <span>{card.question}</span>
            <button onClick={() => {
              setSelectedCard(card);
              setQuestion(card.question);
              setAnswer(card.answer);
            }}>
              Edit
            </button>
            <button onClick={() => {
              axios.delete(`http://localhost:5000/flashcards/${card.id}`)
                .then(() => {
                  setFlashcards(flashcards.filter(c => c.id !== card.id));
                });
            }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
