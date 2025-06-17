import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

const AuthGate: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const isAuthenticated = localStorage.getItem('kd-auth') === 'true';
  
  if (isAuthenticated) {
    return <Navigate to="/builder" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_KILLERDOX_PW;
    
    if (password === correctPassword) {
      localStorage.setItem('kd-auth', 'true');
      window.location.href = '/builder';
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Skull Logo */}
        <div className="flex justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-2xl">
            <svg 
              className="w-20 h-20 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 1.74.5 3.37 1.41 4.84.91 1.47 2.19 2.65 3.59 3.16v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2c1.4-.51 2.68-1.69 3.59-3.16C18.5 12.37 19 10.74 19 9c0-3.87-3.13-7-7-7zm-3 7.5c-.83 0-1.5-.67-1.5-1.5S8.17 7.5 9 7.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm6 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">KillerDox</h1>
          <p className="text-gray-400">Enter the realm of the Entity</p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          
          <button
            type="submit"
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthGate; 