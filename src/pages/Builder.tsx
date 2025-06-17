import React, { useEffect } from 'react';
import { useBuildStore } from '../store/buildStore';

import SelectableSlot from '../components/SelectableSlot';

const Builder: React.FC = () => {
  const {
    selectedKiller,
    selectedPerks,
    selectedAddons,
    selectedOffering,
    selectedPlatform,
    setKiller,
    addPerk,
    addAddon,
    setOffering,
    setPlatform,
    reset,
    initializeSocket,
    syncBuild
  } = useBuildStore();

  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  // Sync build whenever state changes
  useEffect(() => {
    syncBuild();
  }, [selectedKiller, selectedPerks, selectedAddons, selectedOffering, selectedPlatform, syncBuild]);

  const handleResetBuild = () => {
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-8 text-center">KillerDox Builder</h1>
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-4 sm:mb-8">
          {/* Top Row */}
          <div className="flex justify-center">
            {/* Offering Slot */}
            <SelectableSlot
              type="offerings"
              limit={1}
              asset={selectedOffering}
              placeholderImg="/assets/placeholders/offering.png"
              className="w-16 h-16 sm:w-20 sm:h-20"
              borderColorHover="border-yellow-500"
              onSelect={setOffering}
            />
          </div>
          
          <div className="flex justify-center">
            {/* Killer Portrait */}
            <SelectableSlot
              type="killers"
              limit={1}
              asset={selectedKiller}
              placeholderImg="/assets/placeholders/killer.png"
              className="w-24 h-24 sm:w-32 sm:h-32"
              borderColorHover="border-red-500"
              onSelect={setKiller}
            />
          </div>
          
          <div className="flex justify-center">
            {/* Platform Slot */}
            <SelectableSlot
              type="platforms"
              limit={1}
              asset={selectedPlatform}
              placeholderImg="/assets/placeholders/platform.png"
              className="w-16 h-16 sm:w-20 sm:h-20"
              borderColorHover="border-green-500"
              onSelect={setPlatform}
            />
          </div>
        </div>

        {/* Addon Row */}
        <div className="flex justify-center gap-2 sm:gap-6 mb-4 sm:mb-8">
          <SelectableSlot
            type="addons"
            limit={2}
            asset={selectedAddons[0]}
            placeholderImg="/assets/placeholders/addon.png"
            className="w-16 h-16 sm:w-20 sm:h-20"
            borderColorHover="border-purple-500"
            onSelect={addAddon}
            selectedItems={selectedAddons}
          />
          <SelectableSlot
            type="addons"
            limit={2}
            asset={selectedAddons[1]}
            placeholderImg="/assets/placeholders/addon.png"
            className="w-16 h-16 sm:w-20 sm:h-20"
            borderColorHover="border-purple-500"
            onSelect={addAddon}
            selectedItems={selectedAddons}
          />
        </div>

        {/* Perk Row */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-8">
          {[0, 1, 2, 3].map((index) => (
                         <SelectableSlot
               key={index}
               type="perks"
               limit={4}
               asset={selectedPerks[index]}
               placeholderImg="/assets/placeholders/perk.png"
               className="w-16 h-16 sm:w-20 sm:h-20"
               borderColorHover="border-blue-500"
               onSelect={addPerk}
               selectedItems={selectedPerks}
             />
          ))}
        </div>

        {/* Reset Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleResetBuild}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            role="button"
            aria-label="Reset build"
          >
            Reset Build
          </button>
        </div>
      </div>
    </div>
  );
};

export default Builder; 