import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BoardView.css';

function BoardView() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/entries')
      .then(res => setEntries(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="board-view">
      <h1 className="board-title">📌 My Scrapbook Board</h1>
      <div className="board-grid">
        {entries.map(entry => (
          <div key={entry.id} className="board-item" style={{ top: entry.y, left: entry.x }}>
            {entry.image_url && (
              <img 
                src={`http://localhost:5000${entry.image_url}`} 
                alt="scrap entry" 
                className="board-image" 
              />
            )}
            <p className="board-caption">{entry.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoardView;

