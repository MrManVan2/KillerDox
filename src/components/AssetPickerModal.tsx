import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { AssetType, Killer } from '../types';
import { loadKillers, loadPerks, loadAddons, loadOfferings, loadPlatforms } from '../services/assetService';
import { useBuildStore } from '../store/buildStore';

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
  const [loading, setLoading] = useState(false);
  const { selectedKiller } = useBuildStore();

  // Load assets based on type
  const loadAssets = async () => {
    setLoading(true);
    try {
      let assets: any[] = [];
      
      switch (type) {
        case 'killers':
          assets = await loadKillers();
          break;
        case 'perks':
          assets = await loadPerks();
          break;
        case 'addons':
          // Pass selected killer to filter addons appropriately
          assets = await loadAddons(selectedKiller);
          break;
        case 'offerings':
          assets = await loadOfferings();
          break;
        case 'platforms':
          assets = await loadPlatforms();
          break;
        default:
          assets = [];
      }
      
      // Filter by search term
      const filtered = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setFilteredAssets(filtered);
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
      setFilteredAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // Load assets when modal opens or type/killer changes
  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen, type, selectedKiller]);

  // Filter assets when search term changes
  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [searchTerm]);

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
      <div className="relative bg-gray-800 rounded-lg w-full max-w-4xl mx-2 sm:mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white capitalize">
            Select {type.slice(0, -1)} {limit > 1 && `(${selectedItems.length}/${limit})`}
            {type === 'addons' && selectedKiller && (
              <span className="text-sm text-gray-400 block">
                Showing addons for {selectedKiller.name}
              </span>
            )}
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
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-white">Loading {type}...</div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">No {type} found</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
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
                                             onError={(e) => {
                         // Fallback to placeholder if image fails to load
                         const target = e.target as HTMLImageElement;
                         target.src = `/src/assets/Templates/Blank ${type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1, -1)}.png`;
                       }}
                    />
                  </div>
                  <p className="text-sm text-white text-center truncate">
                    {asset.name}
                  </p>
                                     {type === 'addons' && (
                     <div className="text-xs text-center">
                       {asset.rarity && (
                         <p className={`truncate font-medium ${
                           asset.rarity === 'Iridescent' ? 'text-pink-400' :
                           asset.rarity === 'Very Rare' ? 'text-purple-400' :
                           asset.rarity === 'Rare' ? 'text-blue-400' :
                           asset.rarity === 'Uncommon' ? 'text-yellow-400' :
                           'text-amber-600'
                         }`}>
                           {asset.rarity}
                         </p>
                       )}
                       {asset.killer && (
                         <p className="text-gray-500 truncate text-xs">
                           {asset.killer}
                         </p>
                       )}
                     </div>
                   )}
                   {asset.rarity && type !== 'addons' && (
                     <p className="text-xs text-gray-400 text-center truncate">
                       {asset.rarity}
                     </p>
                   )}
                  {isSelected(asset.id) && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetPickerModal; 