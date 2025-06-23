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
    <div 
      className="w-full overflow-hidden relative"
      style={{
        height: '100vh',
        backgroundImage: 'url(/assets/Templates/Backdrop.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full h-full flex flex-col">
        
        {/* Mobile Layout (md and below) */}
        <div className="flex-1 flex flex-col justify-between py-4 px-2 max-w-screen-2xl mx-auto w-full min-h-0 md:hidden">
          <div className="flex flex-col space-y-6">
            {/* Top Section - Mobile: Column layout */}
            <div className="flex flex-col space-y-4">
              {/* Mobile: Offering at top */}
              <div className="flex justify-center">
                <SelectableSlot
                  type="offerings"
                  limit={1}
                  asset={selectedOffering}
                  placeholderImg="/assets/Templates/Blank Offering.png"
                  className="w-20 h-20 sm:w-24 sm:h-24"
                  borderColorHover="border-yellow-500"
                  onSelect={setOffering}
                />
              </div>
              
              {/* Killer Portrait - Center */}
              <div className="flex justify-center">
                <SelectableSlot
                  type="killers"
                  limit={1}
                  asset={selectedKiller}
                  placeholderImg="/assets/Templates/Blank Killer.png"
                  className="w-32 h-32 sm:w-40 sm:h-40"
                  borderColorHover="border-red-500"
                  onSelect={setKiller}
                />
              </div>
              
              {/* Mobile: Platform below killer */}
              <div className="flex justify-center">
                <SelectableSlot
                  type="platforms"
                  limit={1}
                  asset={selectedPlatform}
                  placeholderImg="/assets/Templates/Blank Platform.png"
                  className="w-16 h-16 sm:w-20 sm:h-20"
                  borderColorHover="border-green-500"
                  onSelect={setPlatform}
                />
              </div>
            </div>

            {/* Addon Row */}
            <div className="flex justify-center gap-8 sm:gap-12 pt-4">
              <SelectableSlot
                type="addons"
                limit={2}
                asset={selectedAddons[0]}
                placeholderImg="/assets/Templates/Blank Addon.png"
                className="w-16 h-16 sm:w-20 sm:h-20"
                borderColorHover="border-purple-500"
                onSelect={addAddon}
                selectedItems={selectedAddons}
              />
              <SelectableSlot
                type="addons"
                limit={2}
                asset={selectedAddons[1]}
                placeholderImg="/assets/Templates/Blank Addon.png"
                className="w-16 h-16 sm:w-20 sm:h-20"
                borderColorHover="border-purple-500"
                onSelect={addAddon}
                selectedItems={selectedAddons}
              />
            </div>

            {/* Perk Row - Mobile: 2x2 Grid */}
            <div className="pt-6">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
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
            </div>
          </div>
        </div>

        {/* Desktop Layout (md and above) - Dynamic Vertical Spacing */}
        <div className="hidden md:block w-full h-full">
          <div 
            className="h-full flex flex-col justify-between px-8 md:px-16 lg:px-24 xl:px-32 max-w-screen-2xl mx-auto"
            style={{
              paddingTop: 'clamp(2vh, 4vh, 8vh)',
              paddingBottom: 'clamp(2vh, 4vh, 8vh)'
            }}
          >
            {/* Top Row - Consistent proportional sizing */}
            <div className="relative flex items-center w-full flex-shrink-0">
              {/* Offering Slot - Absolute Left */}
              <div className="absolute left-0">
                <SelectableSlot
                  type="offerings"
                  limit={1}
                  asset={selectedOffering}
                  placeholderImg="/assets/Templates/Blank Offering.png"
                  style={{
                    width: 'clamp(100px, 6vw, 180px)',
                    height: 'clamp(100px, 6vw, 180px)'
                  }}
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
                  style={{
                    width: 'clamp(250px, 15vw, 450px)',
                    height: 'clamp(250px, 15vw, 450px)'
                  }}
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
                  style={{
                    width: 'clamp(75px, 4.5vw, 135px)',
                    height: 'clamp(75px, 4.5vw, 135px)'
                  }}
                  borderColorHover="border-green-500"
                  onSelect={setPlatform}
                />
              </div>
            </div>

            {/* Addon Row - Vertically centered in available space */}
            <div 
              className="flex justify-center items-center flex-shrink-0"
              style={{
                gap: 'clamp(120px, 10vw, 300px)'
              }}
            >
              <SelectableSlot
                type="addons"
                limit={2}
                asset={selectedAddons[0]}
                placeholderImg="/assets/Templates/Blank Addon.png"
                style={{
                  width: 'clamp(100px, 6vw, 180px)',
                  height: 'clamp(100px, 6vw, 180px)'
                }}
                borderColorHover="border-purple-500"
                onSelect={addAddon}
                selectedItems={selectedAddons}
              />
              <SelectableSlot
                type="addons"
                limit={2}
                asset={selectedAddons[1]}
                placeholderImg="/assets/Templates/Blank Addon.png"
                style={{
                  width: 'clamp(100px, 6vw, 180px)',
                  height: 'clamp(100px, 6vw, 180px)'
                }}
                borderColorHover="border-purple-500"
                onSelect={addAddon}
                selectedItems={selectedAddons}
              />
            </div>

            {/* Perk Row - Bottom with responsive spacing that fills available space */}
            <div 
              className="flex justify-center items-center w-full flex-shrink-0"
              style={{
                gap: 'clamp(40px, 5vw, 120px)'
              }}
            >
              {Array.from({ length: 4 }, (_, index) => (
                <SelectableSlot
                  key={index}
                  type="perks"
                  limit={4}
                  asset={selectedPerks[index]}
                  placeholderImg="/assets/Templates/Blank Perk.png"
                  style={{
                    width: 'clamp(125px, 7.5vw, 225px)',
                    height: 'clamp(125px, 7.5vw, 225px)',
                    flexShrink: 0
                  }}
                  borderColorHover="border-green-500"
                  onSelect={addPerk}
                  selectedItems={selectedPerks}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
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