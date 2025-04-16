import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';

function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [showEntries, setShowEntries] = useState(false);
  const [entryDates, setEntryDates] = useState([]);

  const calendarWrapperStyle = {
    position: 'relative',
    width: '900px',
    height: '750px',
    background: "url('/images/ibook.png') no-repeat center",
    backgroundSize: 'contain',
    margin: '0 auto'
  };


  const fetchEntries = async (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    try {
      const res = await axios.get(`http://localhost:5000/entries?date=${formattedDate}`);
      setEntries(res.data);
      setShowEntries(false);

      // Only store the date if it’s new and has entries
      if (res.data.length > 0 && !entryDates.includes(formattedDate)) {
        setEntryDates((prev) => [...prev, formattedDate]);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
      setEntries([]);
    }
  };

  const fetchEntryDates = async () => {
    try {
      const res = await axios.get('http://localhost:5000/entries/dates');
      setEntryDates(res.data); // e.g. ['2025-04-12', '2025-04-14']
    } catch (err) {
      console.error('Error fetching entry dates:', err);
    }
  };

  useEffect(() => {
    fetchEntries(selectedDate);
    fetchEntryDates();
  }, [selectedDate]);

  return (
    <div className="calendar-fullscreen">
      <h1 className="calendar-header">My Days</h1>

      <div style={calendarWrapperStyle}>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          className="react-calendar"
          tileContent={({ date, view }) =>
            view === 'month' && entryDates.includes(date.toISOString().split('T')[0]) ? (
              <div className="entry-dot" />
            ) : null
          }
        />
      </div>

      {entries.length > 0 ? (
        !showEntries ? (
          <div className="file-container" onClick={() => setShowEntries(true)}>
            <img src="/images/file-icon.png" alt="Open File" className="file-icon" />
          </div>
        ) : (
          <div className="calendar-entries animate-slide-up">
            {entries.map((entry) => (
              <div key={entry.id} className="entry-card">
                {entry.image_url && (
                  <img
                    src={`http://localhost:5000${entry.image_url}`}
                    alt="scrap entry"
                    className="entry-image"
                  />
                )}
                <p className="handwritten">{entry.description}</p>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="calendar-entries">
          <p className="no-entry-text">No entries for this day 💤</p>
        </div>
      )}
    </div>
  );
}

export default CalendarView;



