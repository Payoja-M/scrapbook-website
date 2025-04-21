import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Rnd } from 'react-rnd';
import './BoardView.css';

function BoardView() {
  const [entries, setEntries] = useState([]);
  const [showHidden, setShowHidden] = useState(false);
  const historyStack = useRef([]);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [activeCaptionId, setActiveCaptionId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/entries/all')
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(console.error);
  }, [showHidden]);

  useEffect(() => {
    const handleUndo = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (historyStack.current.length > 0) {
          const prev = historyStack.current.pop();
          setEntries(prev);
          prev.forEach(entry => {
            fetch(`http://localhost:5000/entries/${entry.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                x: entry.x,
                y: entry.y,
                width: entry.width,
                height: entry.height,
                captionX: entry.captionX,
                captionY: entry.captionY,
                captionWidth: entry.captionWidth,
                captionHeight: entry.captionHeight,
              }),
            }).catch(console.error);
          });
        }
      }
    };
    window.addEventListener('keydown', handleUndo);
    return () => window.removeEventListener('keydown', handleUndo);
  }, []);

  const updateEntry = (id, updates) => {
    historyStack.current.push([...entries.map(e => ({ ...e }))]);
    const updated = entries.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    setEntries(updated);
    fetch(`http://localhost:5000/entries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(console.error);
  };

  const handleAddImage = () => {
    document.getElementById('imageUpload').click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('description', '');
    formData.append('date', '');
    formData.append('from_board', 'true');

    try {
      const res = await axios.post('http://localhost:5000/entries', formData);
      console.log("✅ Uploaded entry:", res.data);
      setEntries(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Image upload failed:", err.response?.data || err);
    }

    setShowInsertMenu(false);
  };

  const handleAddText = async () => {
    const formData = new FormData();
    formData.append('description', 'New text');
    formData.append('date', '');

    try {
      const res = await axios.post('http://localhost:5000/entries', formData);
      setEntries(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Failed to add text entry:", err.response?.data || err);
    }

    setShowInsertMenu(false);
  };

  return (
    <div className="board-view">
      <h1 className="board-title">My Scrapbook Board</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', position: 'relative' }}>
        <button onClick={() => setShowHidden(prev => !prev)} className="show-hidden-btn">
          {showHidden ? "🖙 Hide Hidden Entries" : "👻 Show Hidden Entries"}
        </button>

        <div className="floating-plus" onClick={() => setShowInsertMenu(prev => !prev)}>
          ＋
        </div>

        {showInsertMenu && (
          <div className="insert-menu">
            <button onClick={handleAddImage}>📷 Add Image</button>
            <button onClick={handleAddText}>📝 Add Text</button>
          </div>
        )}
      </div>

      <div className="board-grid">
        {entries
          .filter(entry => {
            const hidden = entry.hidden_from_board ?? false;
            return showHidden ? hidden : !hidden;
          })
          .map(entry => (
            <React.Fragment key={entry.id}>
              {entry.image_url && (
                <Rnd
                  position={{ x: entry.x || 0, y: entry.y || 0 }}
                  size={{ width: entry.width || 200, height: entry.height || 'auto' }}
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
                  onContextMenu={async (e) => {
                    e.preventDefault();
                    if (showHidden) {
                      const confirmRestore = window.confirm("Restore this to the board?");
                      if (confirmRestore) {
                        await axios.patch(`http://localhost:5000/entries/${entry.id}`, {
                          hidden_from_board: false
                        });
                        setEntries(prev => prev.filter(e => e.id !== entry.id));
                      }
                    } else {
                      const confirmDelete = window.confirm("Hide this from the board?");
                      if (confirmDelete) {
                        await axios.patch(`http://localhost:5000/entries/${entry.id}`, {
                          hidden_from_board: true
                        });
                        setEntries(prev => prev.filter(e => e.id !== entry.id));
                      }
                    }
                  }}
                >
                  <img src={`http://localhost:5000${entry.image_url}`} alt="scrap entry" className="board-image" />
                </Rnd>
              )}

              {entry.description && (
                <Rnd
                  position={{ x: entry.captionX || 0, y: entry.captionY || 0 }}
                  size={{ width: entry.captionWidth || 160, height: entry.captionHeight || 'auto' }}
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
                  className={`caption-wrapper ${!entry.box_visible ? 'transparent' : ''}`}
                  onContextMenu={async (e) => {
                    e.preventDefault();
                    if (showHidden) {
                      const confirmRestore = window.confirm("Restore this to the board?");
                      if (confirmRestore) {
                        await axios.patch(`http://localhost:5000/entries/${entry.id}`, {
                          hidden_from_board: false
                        });
                        setEntries(prev => prev.filter(e => e.id !== entry.id));
                      }
                    } else {
                      const confirmDelete = window.confirm("Hide this from the board?");
                      if (confirmDelete) {
                        await axios.patch(`http://localhost:5000/entries/${entry.id}`, {
                          hidden_from_board: true
                        });
                        setEntries(prev => prev.filter(e => e.id !== entry.id));
                      }
                    }
                  }}
                >
                  <div>
                  <p
                        className={`board-caption ${!entry.box_visible ? 'transparent' : ''}`}
                        contentEditable
                        suppressContentEditableWarning
                        onFocus={() => setActiveCaptionId(entry.id)}
                        onBlur={(e) => {
                            const nextFocus = e.relatedTarget;
                            const wrapper = e.currentTarget.parentElement;

                            if (!wrapper.contains(nextFocus)) {
                            updateEntry(entry.id, { description: e.target.textContent });
                            setActiveCaptionId(null);
                            }
                        }}
                        style={{
                            backgroundColor: entry.box_visible ? (entry.box_color || '#ffeef4') : 'transparent',
                            color: entry.text_color || '#000000',
                            padding: entry.box_visible ? '0.5rem 1rem' : '0',
                            display: 'inline-block'
                        }}
                        >
                        {entry.description}
                        </p>

                    {activeCaptionId === entry.id && (
                      <div className="caption-controls" style={{ position: 'absolute', left: '100%', top: 0, marginLeft: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', marginRight: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={entry.box_visible}
                            onChange={(e) => updateEntry(entry.id, { box_visible: e.target.checked })}
                          /> Show Box
                        </label>

                        {entry.box_visible && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                            <label style={{ fontSize: '0.8rem' }}>
                            Box Color:
                            <input
                                type="color"
                                value={entry.box_color || '#ffe6f0'}
                                onChange={(e) => updateEntry(entry.id, { box_color: e.target.value })}
                                style={{ marginLeft: '0.5rem' }}
                            />
                            </label>

                            <label style={{ fontSize: '0.8rem' }}>
                            Text Color:
                            <input
                                type="color"
                                value={entry.text_color || '#000000'}
                                onChange={(e) => updateEntry(entry.id, { text_color: e.target.value })}
                                style={{ marginLeft: '0.5rem' }}
                            />
                            </label>
                        </div>
                        )}
                      </div>
                    )}
                  </div>
                </Rnd>
              )}
            </React.Fragment>
          ))}
      </div>

      <input
        type="file"
        id="imageUpload"
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default BoardView;
