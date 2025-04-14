import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';

function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState([]);

  const fetchEntries = async (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    try {
      const res = await axios.get(`http://localhost:5000/entries?date=${formattedDate}`);
      setEntries(res.data);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setEntries([]);
    }
  };

  useEffect(() => {
    fetchEntries(selectedDate);
  }, [selectedDate]);

  return (
    <div className="calendar-view-container full-screen">
      <h2 className="page-title">🧷 My Scrapbook Calendar</h2>
      <div className="calendar-content">
        <Calendar onChange={setSelectedDate} value={selectedDate} className="styled-calendar" />
        <div className="entries-container">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <div key={entry.id} className="entry-card fade-in">
                {entry.image_url && (
                  <img src={`http://localhost:5000${entry.image_url}`} alt="entry" className="entry-image" />
                )}
                <p className="handwritten">{entry.description}</p>
              </div>
            ))
          ) : (
            <p className="no-entry-msg">No entries for this day</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
