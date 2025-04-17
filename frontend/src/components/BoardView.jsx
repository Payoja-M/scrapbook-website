import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Rnd } from 'react-rnd';
import './BoardView.css';

function BoardView() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/entries')
      .then(res => setEntries(res.data))
      .catch(err => console.error(err));
  }, []);

  const updateEntry = (id, updates) => {
    // update local state immediately
    setEntries(prev =>
      prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry)
    );

    // send patch to backend
    axios.patch(`http://localhost:5000/entries/${id}`, updates)
      .catch(err => console.error('Failed to update entry:', err));
  };

  return (
    <div className="board-view">
      <h1 className="board-title"> My Scrapbook Board</h1>
      <div className="board-grid">
        {entries.map((entry) => (
          <React.Fragment key={entry.id}>
            {entry.image_url && (
              <Rnd
                default={{
                  x: entry.x || 0,
                  y: entry.y || 0,
                  width: entry.width || 200,
                  height: entry.height || 'auto',
                }}
                bounds="parent"
                onDragStop={(e, d) => updateEntry(entry.id, { x: d.x, y: d.y })}
                onResizeStop={(e, direction, ref, delta, position) =>
                  updateEntry(entry.id, {
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                    x: position.x,
                    y: position.y,
                  })
                }
                className="rnd-wrapper"

                onContextMenu={(e) => {
                    e.preventDefault();
                    const confirmDelete = window.confirm("Delete this entry from the board?");
                    if (confirmDelete) {
                      setEntries(prev => prev.filter(e => e.id !== entry.id));
                    }
                  }}
              >
                <img
                  src={`http://localhost:5000${entry.image_url}`}
                  alt="scrap entry"
                  className="board-image"
                />
              </Rnd>
            )}

            <Rnd
              default={{
                x: entry.captionX || 0,
                y: entry.captionY || 0,
                width: entry.captionWidth || 160,
                height: entry.captionHeight || 'auto',
              }}
              bounds="parent"
              onDragStop={(e, d) => updateEntry(entry.id, { captionX: d.x, captionY: d.y })}
              onResizeStop={(e, direction, ref, delta, position) =>
                updateEntry(entry.id, {
                  captionWidth: ref.offsetWidth,
                  captionHeight: ref.offsetHeight,
                  captionX: position.x,
                  captionY: position.y,
                })
              }
              className="caption-wrapper"

              onContextMenu={(e) => {
                e.preventDefault();
                const confirmDelete = window.confirm("Delete this entry from the board?");
                if (confirmDelete) {
                  setEntries(prev => prev.filter(e => e.id !== entry.id));
                }
              }}
            >
              <p className="board-caption">{entry.description}</p>
            </Rnd>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default BoardView;

