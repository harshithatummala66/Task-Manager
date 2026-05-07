import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Signup({ setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // 1. Create the account
      await api.post('/auth/signup', { name, email, password });
      
      // 2. Automatically log them in right after signing up
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed. Email might already exist.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSignup} className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
        <input 
          type="text" placeholder="Full Name" required
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={e => setName(e.target.value)}
        />
        <input 
          type="email" placeholder="Email" required
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={e => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Password" required minLength="6"
          className="w-full p-3 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 transition">
          Sign Up
        </button>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account? <Link to="/" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}