import React, { useEffect } from 'react';
import { useBuildStore } from '../store/buildStore';
import { TrashIcon } from '@heroicons/react/24/outline';

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
    initializeRealtime
  } = useBuildStore();

  useEffect(() => {
    initializeRealtime();
  }, [initializeRealtime]);

  // Remove automatic sync to prevent infinite loops - 
  // sync is now handled by individual actions in the store

  // const handleResetBuild = () => {
  //   reset();
  // };

  return (
    <div className="h-screen p-2 md:p-4 lg:p-6 overflow-hidden relative" style={{
      backgroundImage: 'url(/assets/Templates/Backdrop.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="w-full h-full flex flex-col">
        {/* Main Content - Responsive Vertical Layout */}
        <div className="flex-1 flex flex-col justify-between py-8 md:py-10 lg:py-14 xl:py-20 px-8 md:px-16 lg:px-24 xl:px-32 max-w-screen-2xl mx-auto w-full min-h-0">
          {/* Top Row - True Center with Side Elements */}
          <div className="relative flex items-center w-full">
            {/* Offering Slot - Absolute Left */}
            <div className="absolute left-0">
              <SelectableSlot
                type="offerings"
                limit={1}
                asset={selectedOffering}
                placeholderImg="/assets/Templates/Blank Offering.png"
                className="w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44"
                borderColorHover="border-yellow-500"
                onSelect={setOffering}
              />
            </div>
            
            {/* Killer Portrait - True Center */}
            <div className="flex-1 flex justify-center">
              <SelectableSlot
                type="killers"
                limit={1}
                asset={selectedKiller}
                placeholderImg="/assets/Templates/Blank Killer.png"
                className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72"
                borderColorHover="border-red-500"
                onSelect={setKiller}
              />
            </div>
            
            {/* Platform Slot - Absolute Right */}
            <div className="absolute right-0">
              <SelectableSlot
                type="platforms"
                limit={1}
                asset={selectedPlatform}
                placeholderImg="/assets/Templates/Blank Platform.png"
                className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36"
                borderColorHover="border-green-500"
                onSelect={setPlatform}
              />
            </div>
          </div>

          {/* Addon Row - Wide Spread */}
          <div className="flex justify-center gap-20 md:gap-24 lg:gap-32 xl:gap-36">
            <SelectableSlot
              type="addons"
              limit={2}
              asset={selectedAddons[0]}
              placeholderImg="/assets/Templates/Blank Addon.png"
              className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32"
              borderColorHover="border-purple-500"
              onSelect={addAddon}
              selectedItems={selectedAddons}
            />
            <SelectableSlot
              type="addons"
              limit={2}
              asset={selectedAddons[1]}
              placeholderImg="/assets/Templates/Blank Addon.png"
              className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32"
              borderColorHover="border-purple-500"
              onSelect={addAddon}
              selectedItems={selectedAddons}
            />
          </div>

          {/* Perk Row - Bottom with responsive spacing */}
          <div className="flex justify-between items-center w-full max-w-5xl mx-auto">
            {Array.from({ length: 4 }, (_, index) => (
              <SelectableSlot
                key={index}
                type="perks"
                limit={4}
                asset={selectedPerks[index]}
                placeholderImg="/assets/Templates/Blank Perk.png"
                className="w-36 h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 xl:w-52 xl:h-52"
                borderColorHover="border-green-500"
                onSelect={addPerk}
                selectedItems={selectedPerks}
              />
            ))}
          </div>
        </div>
      </div>





      {/* Reset Button - Trash Icon Bottom Right */}
      <button
        onClick={reset}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110"
        title="Reset Build"
      >
        <TrashIcon className="w-6 h-6 md:w-8 md:h-8" />
      </button>
    </div>
  );
};

export default Builder; 