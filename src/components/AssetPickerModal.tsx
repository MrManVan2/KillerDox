import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { AssetType } from '../types';
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [allAssets, setAllAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { selectedKiller } = useBuildStore();
  const clearingSearchRef = useRef(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!clearingSearchRef.current) {
        setDebouncedSearchTerm(searchTerm);
      }
      clearingSearchRef.current = false;
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load assets based on type - only when modal opens or dependencies change
  const loadAssets = useCallback(async () => {
    setLoading(true);
    setIsReady(false);
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
          assets = await loadAddons(selectedKiller?.name);
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
      
      setAllAssets(assets);
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
      setAllAssets([]);
    } finally {
      setLoading(false);
      setIsReady(true);
    }
  }, [type, selectedKiller?.name]);

  // Filter and sort assets based on search term
  const filteredAssets = useMemo(() => {
    // Filter by search term while preserving sort order
    // Use searchName if available (for killers with parenthetical names and perks with Hex/Scourge)
    const filtered = allAssets.filter(asset => {
      const searchText = asset.searchName || asset.name;
      return searchText.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    });
    
    // For addons, re-sort filtered results to maintain rarity order
    if (type === 'addons') {
      const RARITY_ORDER: Record<string, number> = {
        'Iridescent': 0,
        'Very Rare': 1,
        'Rare': 2,
        'Uncommon': 3,
        'Common': 4
      };
      
      filtered.sort((a, b) => {
        // Event addons always come last
        if (a.killer === 'Event' && b.killer !== 'Event') return 1;
        if (b.killer === 'Event' && a.killer !== 'Event') return -1;
        
        // If both are Event addons, sort alphabetically
        if (a.killer === 'Event' && b.killer === 'Event') {
          return a.name.localeCompare(b.name);
        }
        
        // For non-Event addons, sort by rarity first
        const orderA = RARITY_ORDER[a.rarity || 'Common'];
        const orderB = RARITY_ORDER[b.rarity || 'Common'];
        
        // If same rarity, sort alphabetically by name
        if (orderA === orderB) {
          return a.name.localeCompare(b.name);
        }
        
        return orderA - orderB; // Most rare (0) comes first
      });
    }
    
    return filtered;
  }, [allAssets, debouncedSearchTerm, type]);

  // Load assets when modal opens or type/killer changes
  useEffect(() => {
    if (isOpen) {
      loadAssets();
    } else {
      // Reset state when modal closes
      setIsReady(false);
      setSearchTerm('');
      setDebouncedSearchTerm('');
      setAllAssets([]);
    }
  }, [isOpen, loadAssets]);

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
    
    // Clear search term immediately when an item is selected
    clearingSearchRef.current = true;
    setSearchTerm('');
    setDebouncedSearchTerm('');
    
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
      isReady ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative backdrop-blur-sm rounded-lg w-full max-w-4xl mx-2 sm:mx-4 max-h-[90vh] sm:max-h-[85vh] md:max-h-[80vh] flex flex-col border border-gray-600 transform transition-all duration-300 ${
          isReady ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          backgroundImage: 'url(/assets/Templates/Backdrop.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-600">
          <h2 className="text-lg sm:text-xl font-bold text-white capitalize">
            Select {type.slice(0, -1)} {limit > 1 && `(${selectedItems.length}/${limit})`}
            {type === 'addons' && selectedKiller && (
              <span className="text-xs sm:text-sm text-gray-400 block">
                Showing addons for {selectedKiller.name}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 -m-2"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-600">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 sm:py-2 bg-black bg-opacity-60 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              autoFocus
            />
            {searchTerm !== debouncedSearchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              </div>
            )}
          </div>
        </div>

        {/* Asset Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <div className="text-white text-lg">Loading {type}...</div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">No {type} found</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
              {filteredAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  onClick={() => handleSelect(asset)}
                  className={`relative p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 flex flex-col hover:scale-105 active:scale-95 touch-manipulation ${
                    isSelected(asset.id)
                      ? 'bg-blue-600 border-2 border-blue-400'
                      : 'border-2 border-transparent'
                  } ${isReady ? 'animate-fade-in' : ''}`}
                  style={{
                    animationDelay: `${index * 20}ms`
                  }}
                >
                  <div className="aspect-square mb-1 sm:mb-2">
                    <img
                      src={asset.img || asset.image}
                      alt={asset.name}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = `/src/assets/Templates/Blank ${type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1, -1)}.png`;
                      }}
                    />
                  </div>
                  <div className="text-xs sm:text-sm text-white text-center leading-tight min-h-[2rem] sm:min-h-[2.5rem] flex flex-col items-center justify-center">
                    {asset.name.includes('(') ? (
                      <>
                        <span>{asset.name.split('(')[0].trim()}</span>
                        <span>({asset.name.split('(')[1]}</span>
                      </>
                    ) : (
                      <span>{asset.name}</span>
                    )}
                  </div>
                  {type === 'addons' && (
                    <div className="text-xs text-center">
                      {asset.killer === 'Event' ? (
                        <p className="text-orange-400 break-words text-xs leading-tight font-medium">
                          Event
                        </p>
                      ) : asset.rarity && (
                        <p className={`break-words font-medium leading-tight`} style={{
                          color: asset.rarity === 'Iridescent' ? '#d41b50' :   // Pink for Iridescent (most rare)
                                 asset.rarity === 'Very Rare' ? '#77378c' :    // Purple for Very Rare
                                 asset.rarity === 'Rare' ? '#3b66a4' :         // Blue for Rare
                                 asset.rarity === 'Uncommon' ? '#408830' :     // Green for Uncommon
                                 '#674f3d'                                      // Brown for Common
                        }}>
                          {asset.rarity === 'Iridescent' ? 'Visceral' : asset.rarity}
                        </p>
                      )}
                    </div>
                  )}
                  {asset.rarity && type !== 'addons' && (
                    <p className={`text-xs text-center break-words leading-tight font-medium`} style={{
                      color: asset.rarity === 'Event' ? '#fb923c' :         // Orange for Event
                             asset.rarity === 'Iridescent' || asset.rarity === 'Visceral' ? '#d41b50' :   // Pink for Iridescent/Visceral (most rare)
                             asset.rarity === 'Very Rare' ? '#77378c' :    // Purple for Very Rare
                             asset.rarity === 'Rare' ? '#3b66a4' :         // Blue for Rare
                             asset.rarity === 'Uncommon' ? '#408830' :     // Green for Uncommon
                             '#674f3d'                                      // Brown for Common
                    }}>
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