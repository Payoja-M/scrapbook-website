import axios from 'axios';
import { useState, useRef } from 'react';

function AddEntryForm() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const fileInputRef = useRef(null);  // 👈 new ref

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('description', description);
    if (date) formData.append('date', date);
    if (image) formData.append('image', image);

    try {
      const res = await axios.post('http://localhost:5000/entries', formData);
      console.log('Entry posted:', res.data);

      // Reset form
      setImage(null);
      setDescription('');
      setDate('');
      fileInputRef.current.value = '';  // 👈 clear file input manually
    } catch (err) {
      console.error('Error posting entry:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        📸 Image:
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          ref={fileInputRef}  // 👈 attach ref
        />
      </label>

      <label>
        📝 Description:
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </label>

      <label>
        📅 Date (optional):
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      <button type="submit">Add Entry</button>
    </form>
  );
}

export default AddEntryForm;
