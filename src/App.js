import React, { useState, useEffect, useRef } from 'react';
import Flashcard from './components/Flashcard';
import Dashboard from './components/Dashboard';
import './App.css';
import axios from 'axios';

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);

  const categoryEl = useRef();
  const amountEl = useRef();

  useEffect(() => {
    axios.get('https://opentdb.com/api_category.php')
      .then(res => setCategories(res.data.trivia_categories));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/flashcards')
      .then(res => setFlashcards(res.data));
  }, []);

  function decodeString(str) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = str;
    return textArea.value;
  }

  function handleSubmit(e) {
    e.preventDefault();
    axios.get('https://opentdb.com/api.php', {
      params: {
        amount: amountEl.current.value,
        category: categoryEl.current.value,
      },
    })
    .then(res => {
      const newFlashcards = res.data.results.map((questionItem, index) => {
        const answer = decodeString(questionItem.correct_answer);
        const options = [
          ...questionItem.incorrect_answers.map(a => decodeString(a)),
          answer,
        ];
        return {
          id: `${index}-${Date.now()}`,
          question: decodeString(questionItem.question),
          answer: answer,
          options: options.sort(() => Math.random() - 0.5),
        };
      });
      setFlashcards(newFlashcards);
      setCurrentIndex(0); // Reset to the first flashcard
    });
  }

  function handleNext() {
    setCurrentIndex(prevIndex => Math.min(prevIndex + 1, flashcards.length - 1));
  }

  function handlePrevious() {
    setCurrentIndex(prevIndex => Math.max(prevIndex - 1, 0));
  }

  return (
    <>
      <form className="header" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" ref={categoryEl}>
            {categories.map(category => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="amount">Number of Questions</label>
          <input
            type="number"
            id="amount"
            min="1"
            step="1"
            defaultValue={10}
            ref={amountEl}
          />
        </div>
        <div className="form-group">
          <button className="btn">Generate</button>
        </div>
        <button className="btn" onClick={() => setShowDashboard(!showDashboard)}>
          {showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
        </button>
      </form>
      {showDashboard && (
        <Dashboard flashcards={flashcards} setFlashcards={setFlashcards} />
      )}
      <div className="container">
        {flashcards.length > 0 && (
          <>
            <Flashcard flashcard={flashcards[currentIndex]} />
            <div className="navigation">
              <button onClick={handlePrevious} disabled={currentIndex === 0}>
                Previous
              </button>
              <button onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
