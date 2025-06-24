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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [modalHeight, setModalHeight] = useState(600);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

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
      // Mark as initially loaded only once
      if (!hasInitiallyLoaded) {
        setHasInitiallyLoaded(true);
      }
    }
  }, [type, selectedKiller?.name]);

  // Calculate similarity between two strings (0 = no match, 1 = perfect match)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Enhanced similarity calculation that's more forgiving for typos
    const editDistance = (s1: string, s2: string): number => {
      const matrix = [];
      for (let i = 0; i <= s2.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= s1.length; j++) {
        matrix[0][j] = j;
      }
      for (let i = 1; i <= s2.length; i++) {
        for (let j = 1; j <= s1.length; j++) {
          if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1, // substitution
              matrix[i][j - 1] + 1,     // insertion
              matrix[i - 1][j] + 1      // deletion
            );
          }
        }
      }
      return matrix[s2.length][s1.length];
    };
    
    // Calculate basic edit distance similarity
    const distance = editDistance(longer, shorter);
    let similarity = (longer.length - distance) / longer.length;
    
    // Boost similarity for common patterns that indicate user intent
    const searchLower = str1.toLowerCase();
    const targetLower = str2.toLowerCase();
    
    // Boost if search starts with target or target starts with search
    if (targetLower.startsWith(searchLower) || searchLower.startsWith(targetLower)) {
      similarity = Math.max(similarity, 0.8);
    }
    
    // Boost if most characters are present in order (subsequence matching)
    let subsequenceLength = 0;
    let targetIndex = 0;
    for (let i = 0; i < searchLower.length && targetIndex < targetLower.length; i++) {
      if (searchLower[i] === targetLower[targetIndex]) {
        subsequenceLength++;
        targetIndex++;
      }
    }
    const subsequenceSimilarity = subsequenceLength / Math.max(searchLower.length, targetLower.length);
    similarity = Math.max(similarity, subsequenceSimilarity);
    
    return similarity;
  };

  // Filter and sort assets based on search term with fuzzy matching
  const filteredAssets = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return allAssets;
    }
    
    const searchTerm = debouncedSearchTerm.toLowerCase();
    
    // First, try exact matches (includes/contains)
    const exactMatches = allAssets.filter(asset => {
      const searchText = asset.searchName || asset.name;
      return searchText.toLowerCase().includes(searchTerm);
    });
    
    // If we have exact matches, return them
    if (exactMatches.length > 0) {
      const filtered = exactMatches;
      
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
    }
    
    // No exact matches found, try fuzzy matching
    const MIN_SIMILARITY = 0.6; // Minimum similarity threshold (60% confidence with enhanced matching)
    const fuzzyMatches = allAssets
      .map(asset => {
        const searchText = (asset.searchName || asset.name).toLowerCase();
        const similarity = calculateSimilarity(searchTerm, searchText);
        
        // Also check individual words for better matching
        const words = searchText.split(/\s+/);
        const wordSimilarities = words.map((word: string) => calculateSimilarity(searchTerm, word));
        const maxWordSimilarity = Math.max(...wordSimilarities);
        
        // Use the best similarity score
        const bestSimilarity = Math.max(similarity, maxWordSimilarity);
        
        return { asset, similarity: bestSimilarity };
      })
      .filter(item => item.similarity >= MIN_SIMILARITY)
      .sort((a, b) => {
        // Sort by similarity first (best matches first)
        if (b.similarity !== a.similarity) {
          return b.similarity - a.similarity;
        }
        
        // For addons with same similarity, maintain rarity order
        if (type === 'addons') {
          const RARITY_ORDER: Record<string, number> = {
            'Iridescent': 0,
            'Very Rare': 1,
            'Rare': 2,
            'Uncommon': 3,
            'Common': 4
          };
          
          const orderA = RARITY_ORDER[a.asset.rarity || 'Common'];
          const orderB = RARITY_ORDER[b.asset.rarity || 'Common'];
          
          if (orderA !== orderB) {
            return orderA - orderB;
          }
        }
        
        // Finally sort alphabetically
        return a.asset.name.localeCompare(b.asset.name);
      })
      .map(item => item.asset);
    
    return fuzzyMatches;
  }, [allAssets, debouncedSearchTerm, type]);

  // Calculate modal height based on content
  useEffect(() => {
    if (!isReady) return;
    
    const itemCount = filteredAssets.length;
    const baseHeight = 200; // Header + search + padding
    const itemHeight = 140; // Approximate height per item including gaps
    const itemsPerRow = 7; // Based on xl:grid-cols-7
    const rows = Math.ceil(itemCount / itemsPerRow);
    const contentHeight = Math.max(200, Math.min(rows * itemHeight, 500)); // Min 200px, max 500px
    const newHeight = baseHeight + contentHeight;
    
    setModalHeight(newHeight);
  }, [filteredAssets.length, isReady]);

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
      setHasInitiallyLoaded(false);
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
    
    // Auto-focus the search input for the next search (if modal stays open)
    if (selectedItems.length + 1 < limit) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
    
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
        className={`relative backdrop-blur-sm rounded-lg w-full max-w-4xl mx-2 sm:mx-4 flex flex-col border border-gray-600 transform ${
          isReady ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          backgroundImage: 'url(/assets/Templates/Backdrop.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: `${modalHeight}px`,
          maxHeight: '90vh',
          transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease-out, opacity 0.3s ease-out'
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
              ref={searchInputRef}
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
            <div className="flex flex-col items-center justify-center h-64 transition-all duration-300 ease-in-out">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <div className="text-white text-lg">Loading {type}...</div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex items-center justify-center h-32 transition-all duration-300 ease-in-out">
              <div className="text-gray-400">No {type} found</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 transition-all duration-300 ease-in-out">
              {filteredAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  onClick={() => handleSelect(asset)}
                  className={`relative p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out flex flex-col hover:scale-105 active:scale-95 touch-manipulation ${
                    isSelected(asset.id)
                      ? 'bg-blue-600 border-2 border-blue-400'
                      : 'border-2 border-transparent'
                  } ${isReady && !hasInitiallyLoaded ? 'animate-fade-in' : ''}`}
                  style={{
                    animationDelay: !hasInitiallyLoaded ? `${index * 10}ms` : '0ms',
                    opacity: 1,
                    transform: 'translateY(0)'
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