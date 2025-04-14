import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AddEntryForm from './components/AddEntryForm';
import CalendarView from './components/CalendarView';
import BoardView from './components/BoardView'; // You’ll make this later

function App() {
  return (
    <Router>
      <div className="App">
        <h1>📔 My Scrapbook</h1>

        <nav>
          <Link to="/">Add Entry</Link> |{" "}
          <Link to="/calendar">Calendar View</Link> |{" "}
          <Link to="/board">Board View</Link>
        </nav>

        <Routes>
          <Route path="/" element={<AddEntryForm />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/board" element={<BoardView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

