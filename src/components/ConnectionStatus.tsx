import React, { useState, useEffect } from 'react';
import { realtimeService } from '../store/realtimeService';
import { WifiIcon, SignalSlashIcon } from '@heroicons/react/24/outline';

const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribe = realtimeService.onConnectionStatus((status) => {
      setIsConnected(status.connected);
    });

    // Get initial connection status
    setIsConnected(realtimeService.getConnectionStatus());

    return unsubscribe;
  }, []);

  return (
    <div 
      className="fixed top-4 right-4 z-50"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-200 ${
        isConnected 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'bg-red-600 hover:bg-red-700'
      }`}>
        {isConnected ? (
          <WifiIcon className="w-5 h-5 text-white" />
        ) : (
          <SignalSlashIcon className="w-5 h-5 text-white" />
        )}
        <span className="text-white text-sm font-medium">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full mt-2 right-0 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap z-50">
          <div className="flex flex-col gap-1">
            <div className="font-medium">
              {isConnected ? 'Real-time updates active' : 'Real-time updates disconnected'}
            </div>
            <div className="text-gray-400">
              {isConnected 
                ? 'Changes sync across all users instantly' 
                : 'Attempting to reconnect...'
              }
            </div>
          </div>
          {/* Arrow pointing up */}
          <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus; 