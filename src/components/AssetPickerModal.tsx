import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { AssetType, Killer, Perk, Addon, Offering, Platform } from '../types';
import { assetService } from '../services/assetService';
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

  useEffect(() => {
    if (!isOpen) return;

    const loadAssets = async () => {
      setLoading(true);
      try {
        let assets: any[] = [];
        
        switch (type) {
          case 'killers':
            assets = await assetService.loadKillers();
            break;
          case 'perks':
            assets = await assetService.loadPerks();
            break;
          case 'addons':
            // Load addons specific to selected killer, or all addons if no killer selected
            if (selectedKiller) {
              assets = await assetService.loadAddons(selectedKiller.name);
            } else {
              assets = await assetService.loadAddons();
            }
            break;
          case 'offerings':
            assets = await assetService.loadOfferings();
            break;
          case 'platforms':
            assets = await assetService.loadPlatforms();
            break;
        }

        // Filter assets based on search term
        const filtered = assets.filter(asset =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // For addons, further filter by selected killer compatibility
        if (type === 'addons' && selectedKiller) {
          const killerFiltered = filtered.filter(addon => 
            !addon.killer || addon.killer === selectedKiller.name
          );
          setFilteredAssets(killerFiltered);
        } else {
          setFilteredAssets(filtered);
        }
      } catch (error) {
        console.error(`Error loading ${type}:`, error);
        setFilteredAssets([]);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, [type, searchTerm, isOpen, selectedKiller]);

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
        className="absolute inset-0"
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
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p className="text-lg mb-2">No {type} found</p>
              {type === 'addons' && selectedKiller && (
                <p className="text-sm">No addons available for {selectedKiller.name}</p>
              )}
              {searchTerm && (
                <p className="text-sm">Try adjusting your search term</p>
              )}
            </div>
          ) : (
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
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        const assetType = type.slice(0, -1); // Remove 's' from end
                        const capitalizedType = assetType.charAt(0).toUpperCase() + assetType.slice(1);
                        
                        // Map asset types to available placeholders
                        const placeholderMap: { [key: string]: string } = {
                          'killer': 'Blank Killer.png',
                          'perk': 'Blank Perk.png', 
                          'addon': 'Blank Addon.png',
                          'offering': 'Blank Offering.png',
                          'platform': 'Blank Killer.png', // Use killer placeholder for platforms
                        };
                        
                        const placeholder = placeholderMap[assetType] || 'Blank Killer.png';
                        target.src = `/assets/placeholders/${placeholder}`;
                      }}
                    />
                  </div>
                  <p className="text-sm text-white text-center truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  {asset.rarity && (
                    <div className={`absolute top-1 left-1 w-3 h-3 rounded-full ${
                      asset.rarity === 'Ultra Rare' ? 'bg-red-500' :
                      asset.rarity === 'Very Rare' ? 'bg-purple-500' :
                      asset.rarity === 'Rare' ? 'bg-green-500' :
                      asset.rarity === 'Uncommon' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} title={asset.rarity}></div>
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