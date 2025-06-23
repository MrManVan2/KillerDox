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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
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
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative w-full h-16">
            {/* Text Box Background Image */}
            <img 
              src="/assets/Templates/Text Box.png" 
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter password..."
              className="absolute inset-0 w-full h-full bg-transparent text-white placeholder-gray-300 focus:outline-none text-center font-medium text-lg border-none"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm text-center font-medium drop-shadow-md">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthGate; 