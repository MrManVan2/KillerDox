import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { AssetType } from '../types';

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: AssetType;
  limit: number;
  onSelect: (asset: any) => void;
  selectedItems?: any[];
}

const AssetPickerModal: React.FC<AssetPickerModalProps> = ({
  isOpen,
  onClose,
  type,
  limit,
  onSelect,
  selectedItems = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);

  // Mock data - in a real app, this would come from an API or data service
  const mockData = {
    killers: [
      { id: 'trapper', name: 'The Trapper', img: '/assets/placeholders/killer.png' },
      { id: 'wraith', name: 'The Wraith', img: '/assets/placeholders/killer.png' },
    ],
    perks: [
      { id: 'brutal-strength', name: 'Brutal Strength', img: '/assets/placeholders/perk.png' },
      { id: 'enduring', name: 'Enduring', img: '/assets/placeholders/perk.png' },
      { id: 'hex-ruin', name: 'Hex: Ruin', img: '/assets/placeholders/perk.png' },
      { id: 'noed', name: 'No One Escapes Death', img: '/assets/placeholders/perk.png' },
    ],
    addons: [
      { id: 'tar-bottle', name: 'Tar Bottle', img: '/assets/placeholders/addon.png', killer: 'The Trapper' },
      { id: 'padded-jaws', name: 'Padded Jaws', img: '/assets/placeholders/addon.png', killer: 'The Trapper' },
    ],
    offerings: [
      { id: 'bloody-party', name: 'Bloody Party Streamers', img: '/assets/placeholders/offering.png' },
      { id: 'macmillan', name: 'MacMillan Estate', img: '/assets/placeholders/offering.png' },
    ],
    platforms: [
      { id: 'steam', name: 'Steam', img: '/assets/placeholders/platform.png' },
      { id: 'epic', name: 'Epic Games', img: '/assets/placeholders/platform.png' },
    ]
  };

  useEffect(() => {
    const assets = mockData[type] || [];
    const filtered = assets.filter(asset =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAssets(filtered);
  }, [type, searchTerm]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSelect = (asset: any) => {
    onSelect(asset);
    
    // Auto-close modal when limit is reached
    if (selectedItems.length + 1 >= limit) {
      onClose();
    }
  };

  const isSelected = (assetId: string) => {
    return selectedItems.some(item => item.id === assetId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg w-full max-w-2xl mx-2 sm:mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white capitalize">
            Select {type.slice(0, -1)} {limit > 1 && `(${selectedItems.length}/${limit})`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>

        {/* Asset Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => handleSelect(asset)}
                className={`relative p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected(asset.id)
                    ? 'bg-blue-600 border-2 border-blue-400'
                    : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                }`}
              >
                <div className="aspect-square mb-2">
                  <img
                    src={asset.img}
                    alt={asset.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <p className="text-sm text-white text-center truncate">
                  {asset.name}
                </p>
                {isSelected(asset.id) && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetPickerModal; 