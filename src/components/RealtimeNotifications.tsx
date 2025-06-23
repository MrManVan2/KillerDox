import React, { useState, useEffect } from 'react';
import { realtimeService } from '../store/realtimeService';
import { UserIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  icon?: React.ReactElement;
}

const RealtimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Subscribe to build updates from other users
    const unsubscribeBuildUpdate = realtimeService.onBuildUpdate((_build) => {
      const newNotification: Notification = {
        id: `build-${Date.now()}-${Math.random()}`,
        type: 'build',
        message: `Build updated by another user`,
        timestamp: Date.now(),
        icon: <SparklesIcon className="w-5 h-5" />
      };
      addNotification(newNotification);
    });

    // Subscribe to asset updates from other users
    const unsubscribeAssetUpdate = realtimeService.onAssetUpdate((data) => {
      const assetTypeNames = {
        'killers': 'killer',
        'perks': 'perk',
        'addons': 'addon', 
        'offerings': 'offering',
        'platforms': 'platform'
      };
      
      const typeName = assetTypeNames[data.assetType as keyof typeof assetTypeNames] || data.assetType;
      
      const newNotification: Notification = {
        id: `asset-${Date.now()}-${Math.random()}`,
        type: 'asset',
        message: `Someone selected ${data.asset.name} (${typeName})`,
        timestamp: Date.now(),
        icon: <UserIcon className="w-5 h-5" />
      };
      addNotification(newNotification);
    });

    return () => {
      unsubscribeBuildUpdate();
      unsubscribeAssetUpdate();
    };
  }, []);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 3000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2 max-w-xs">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-gray-900 bg-opacity-95 text-white px-4 py-3 rounded-lg shadow-lg border border-gray-700 animate-slide-in-right"
          onClick={() => removeNotification(notification.id)}
        >
          <div className="flex items-center gap-3">
            <div className="text-blue-400 flex-shrink-0">
              {notification.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="text-gray-400 hover:text-white ml-2 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealtimeNotifications; 