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
    <div className="min-h-screen p-2 md:p-4 lg:p-6 overflow-hidden relative" style={{
      backgroundImage: 'url(/assets/Templates/Backdrop.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="w-full h-full flex flex-col">
        {/* Mobile-First Responsive Layout */}
        <div className="flex-1 flex flex-col justify-between py-4 md:py-8 lg:py-14 xl:py-20 px-2 md:px-8 lg:px-16 xl:px-32 max-w-screen-2xl mx-auto w-full min-h-0">
          
          {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
          <div className="flex flex-col space-y-6 md:space-y-0">
            
            {/* Top Section - Mobile: Column, Desktop: Row with side elements */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              
              {/* Mobile: Offering at top, Desktop: Left side */}
              <div className="flex justify-center md:justify-start">
                <SelectableSlot
                  type="offerings"
                  limit={1}
                  asset={selectedOffering}
                  placeholderImg="/assets/Templates/Blank Offering.png"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40"
                  borderColorHover="border-yellow-500"
                  onSelect={setOffering}
                />
              </div>
              
              {/* Killer Portrait - Center on all screens */}
              <div className="flex justify-center">
                <SelectableSlot
                  type="killers"
                  limit={1}
                  asset={selectedKiller}
                  placeholderImg="/assets/Templates/Blank Killer.png"
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64"
                  borderColorHover="border-red-500"
                  onSelect={setKiller}
                />
              </div>
              
              {/* Mobile: Platform below killer, Desktop: Right side */}
              <div className="flex justify-center md:justify-end">
                <SelectableSlot
                  type="platforms"
                  limit={1}
                  asset={selectedPlatform}
                  placeholderImg="/assets/Templates/Blank Platform.png"
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32"
                  borderColorHover="border-green-500"
                  onSelect={setPlatform}
                />
              </div>
            </div>

            {/* Addon Row - Responsive spacing */}
            <div className="flex justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-24 xl:gap-32 pt-4 md:pt-8">
              <SelectableSlot
                type="addons"
                limit={2}
                asset={selectedAddons[0]}
                placeholderImg="/assets/Templates/Blank Addon.png"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32"
                borderColorHover="border-purple-500"
                onSelect={addAddon}
                selectedItems={selectedAddons}
              />
              <SelectableSlot
                type="addons"
                limit={2}
                asset={selectedAddons[1]}
                placeholderImg="/assets/Templates/Blank Addon.png"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32"
                borderColorHover="border-purple-500"
                onSelect={addAddon}
                selectedItems={selectedAddons}
              />
            </div>

            {/* Perk Row - Mobile: 2x2 grid, Desktop: 1x4 row */}
            <div className="pt-6 md:pt-12">
              {/* Mobile: 2x2 Grid */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:hidden">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="flex justify-center">
                    <SelectableSlot
                      type="perks"
                      limit={4}
                      asset={selectedPerks[index]}
                      placeholderImg="/assets/Templates/Blank Perk.png"
                      className="w-24 h-24 sm:w-28 sm:h-28"
                      borderColorHover="border-green-500"
                      onSelect={addPerk}
                      selectedItems={selectedPerks}
                    />
                  </div>
                ))}
              </div>
              
              {/* Desktop: Single Row */}
              <div className="hidden md:flex justify-between items-center w-full max-w-5xl mx-auto">
                {Array.from({ length: 4 }, (_, index) => (
                  <SelectableSlot
                    key={index}
                    type="perks"
                    limit={4}
                    asset={selectedPerks[index]}
                    placeholderImg="/assets/Templates/Blank Perk.png"
                    className="w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48"
                    borderColorHover="border-green-500"
                    onSelect={addPerk}
                    selectedItems={selectedPerks}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button - Better mobile positioning */}
      <button
        onClick={() => reset()}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110 bg-black bg-opacity-50 rounded-full p-2 md:p-3 backdrop-blur-sm"
        title="Reset Build"
      >
        <TrashIcon className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
      </button>
    </div>
  );
};

export default Builder; 