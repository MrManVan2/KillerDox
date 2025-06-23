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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{
      backgroundImage: 'url(/assets/Templates/Backdrop.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="w-full max-w-2xl space-y-8 -mt-16">
        {/* Killer Icon Logo */}
        <div className="flex justify-center">
          <div className="w-64 h-64 flex items-center justify-center">
            <img 
              src="/assets/Templates/Killer Icon.png" 
              alt="KillerDox Logo"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Enter Password Text Image */}
        <div className="flex justify-center">
          <img 
            src="/assets/Templates/Enter Password.png" 
            alt="Enter Password"
            className="object-contain drop-shadow-lg"
          />
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative w-full h-24">
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
              placeholder=""
              className="absolute inset-0 w-full h-full bg-transparent text-white focus:outline-none text-center font-medium text-4xl border-none"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-lg text-center font-medium drop-shadow-md">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthGate; 