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
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{
      backgroundImage: 'url(/assets/Templates/Backdrop.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="w-full max-w-md space-y-8">
        {/* Killer Icon Logo */}
        <div className="flex justify-center">
          <div className="w-32 h-32 flex items-center justify-center">
            <img 
              src="/assets/Templates/Killer Icon.png" 
              alt="KillerDox Logo"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">KillerDox</h1>
          <p className="text-gray-300 drop-shadow-md">Enter the realm of the Entity</p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            {/* Text Box Background */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: 'url(/assets/Templates/Text Box.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.8
              }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="relative w-full px-6 py-4 bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-center font-medium text-lg"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm text-center font-medium drop-shadow-md">{error}</div>
          )}
          
          <button
            type="submit"
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 hover:scale-105 active:scale-95 drop-shadow-lg"
          >
            Enter the Fog
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthGate; 