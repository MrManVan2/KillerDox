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
    <div className="h-screen p-2 md:p-4 lg:p-6 overflow-hidden" style={{
      backgroundImage: 'url(/assets/Templates/Backdrop.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="w-full h-full flex flex-col">
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 md:mb-6 text-center flex-shrink-0">KillerDox Builder</h1>
        
        {/* Main Content - Centered and Scaled */}
        <div className="flex-1 flex flex-col justify-center items-center min-h-0">
          {/* Main Grid Layout */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 lg:gap-12 xl:gap-16 mb-4 md:mb-6 lg:mb-8">
            {/* Top Row */}
            <div className="flex justify-center">
              {/* Offering Slot */}
              <SelectableSlot
                type="offerings"
                limit={1}
                asset={selectedOffering}
                placeholderImg="/src/assets/Templates/Blank Offering.png"
                className="w-16 h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 xl:w-36 xl:h-36"
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
                placeholderImg="/src/assets/Templates/Blank Killer.png"
                className="w-24 h-24 md:w-32 md:h-32 lg:w-44 lg:h-44 xl:w-56 xl:h-56"
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
                placeholderImg="/src/assets/Platforms/Steam.png"
                className="w-16 h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 xl:w-36 xl:h-36"
                borderColorHover="border-green-500"
                onSelect={setPlatform}
              />
            </div>
          </div>

          {/* Addon Row */}
          <div className="flex justify-center gap-4 md:gap-8 lg:gap-12 xl:gap-16 mb-4 md:mb-6 lg:mb-8">
            <SelectableSlot
              type="addons"
              limit={2}
              asset={selectedAddons[0]}
              placeholderImg="/src/assets/Templates/Blank Addon.png"
              className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40"
              borderColorHover="border-purple-500"
              onSelect={addAddon}
              selectedItems={selectedAddons}
            />
            <SelectableSlot
              type="addons"
              limit={2}
              asset={selectedAddons[1]}
              placeholderImg="/src/assets/Templates/Blank Addon.png"
              className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40"
              borderColorHover="border-purple-500"
              onSelect={addAddon}
              selectedItems={selectedAddons}
            />
          </div>

          {/* Perk Row */}
          <div className="flex justify-center gap-3 md:gap-6 lg:gap-8 xl:gap-12 mb-4 md:mb-6 lg:mb-8">
            {[0, 1, 2, 3].map((index) => (
              <SelectableSlot
                key={index}
                type="perks"
                limit={4}
                asset={selectedPerks[index]}
                placeholderImg="/src/assets/Templates/Blank Perk.png"
                className="w-16 h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 xl:w-36 xl:h-36"
                borderColorHover="border-blue-500"
                onSelect={addPerk}
                selectedItems={selectedPerks}
              />
            ))}
          </div>

          {/* Reset Button */}
          <div className="flex justify-center flex-shrink-0">
            <button 
              onClick={handleResetBuild}
              className="px-6 py-2 md:px-8 md:py-3 lg:px-10 lg:py-4 bg-red-600 hover:bg-red-700 text-white font-medium text-base md:text-lg lg:text-xl rounded-lg transition-colors"
              role="button"
              aria-label="Reset build"
            >
              Reset Build
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder; 