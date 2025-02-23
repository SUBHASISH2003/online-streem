import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Hero() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token'); // Use sessionStorage instead of localStorage
    if (!token) {
      console.error('No token found in sessionStorage. Please log in.');
      alert('Please log in to create a meeting.');
      return;
    }
    try {
      const res = await axios.post(
        'http://localhost:5000/api/meetings/create', // Correct endpoint
        { title, description, startTime: new Date(startTime) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { meetingId } = res.data.meeting;
      navigate(`/meeting?meetingId=${meetingId}`);
    } catch (error) {
      console.error('Error creating meeting:', error.response?.data || error.message);
      alert('Failed to create meeting: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token'); // Use sessionStorage instead of localStorage
    if (!token) {
      console.error('No token found in sessionStorage. Please log in.');
      alert('Please log in to join a meeting.');
      return;
    }
    if (!joinCode) {
      alert('Please enter a meeting code.');
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost:5000/api/meetings/join/${joinCode}`, // Correct endpoint
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { meetingId } = res.data.meeting;
      navigate(`/meeting?meetingId=${meetingId}`);
    } catch (error) {
      console.error('Error joining meeting:', error.response?.data || error.message);
      alert('Failed to join meeting: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  // Temporary login function for testing (optional)
  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login');
      const { token } = res.data;
      sessionStorage.setItem('token', token);
      console.log('Logged in successfully. Token stored in sessionStorage.');
      alert('Logged in successfully!');
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      alert('Login failed!');
    }
  };

  return (
    <div className="container mx-auto p-6 flex-grow">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Advanced Meet</h1>
        <p className="text-lg text-gray-600 mb-6">Host or join high-quality video meetings with ease.</p>

        {/* Temporary Login Button (optional) */}
        <button
          onClick={handleLogin}
          className="bg-green-500 text-white px-4 py-2 rounded-lg mb-6 hover:bg-green-600"
        >
          Login (Test)
        </button>

        {/* Create Meeting Form */}
        <form onSubmit={handleCreateMeeting} className="mb-6">
          <input
            type="text"
            placeholder="Meeting Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded mb-2 w-64"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 border rounded mb-2 w-64"
          />
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="p-2 border rounded mb-2 w-64"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create Meeting
          </button>
        </form>

        {/* Join Meeting Form */}
        <form onSubmit={handleJoinMeeting}>
          <input
            type="text"
            placeholder="Enter Meeting Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="p-2 border rounded mb-2 w-64"
          />
          <button
            type="submit"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
          >
            Join Meeting
          </button>
        </form>
      </div>
    </div>
  );
}

export default Hero;