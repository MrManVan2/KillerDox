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
        <div className="flex-1 flex flex-col justify-between py-4 px-2 max-w-screen-2xl mx-auto w-full h-full md:hidden">
          <div className="h-full flex flex-col justify-between mobile-container-landscape" style={{ paddingTop: '18vh', paddingBottom: '18vh' }}>
            {/* Top Section - Mobile: Row layout like desktop */}
            <div className="relative flex items-center w-full">
              {/* Mobile: Offering at left */}
              <div className="absolute left-0">
                <SelectableSlot
                  type="offerings"
                  limit={1}
                  asset={selectedOffering}
                  placeholderImg="/assets/Templates/Blank Offering.png"
                  className="w-20 h-20 sm:w-26 sm:h-26 mobile-offering"
                  borderColorHover="border-yellow-500"
                  onSelect={setOffering}
                />
              </div>
              
              {/* Killer Portrait - Center */}
              <div className="flex-1 flex justify-center">
                <SelectableSlot
                  type="killers"
                  limit={1}
                  asset={selectedKiller}
                  placeholderImg="/assets/Templates/Blank Killer.png"
                  className="w-32 h-32 sm:w-40 sm:h-40 mobile-killer"
                  borderColorHover="border-red-500"
                  onSelect={setKiller}
                />
              </div>
              
              {/* Mobile: Platform at right */}
              <div className="absolute right-0">
                <SelectableSlot
                  type="platforms"
                  limit={1}
                  asset={selectedPlatform}
                  placeholderImg="/assets/Templates/Blank Platform.png"
                  className="w-16 h-16 sm:w-20 sm:h-20 mobile-platform"
                  borderColorHover="border-green-500"
                  onSelect={setPlatform}
                />
              </div>
            </div>

            {/* Addon Row - Mobile centered */}
            <div className="flex justify-center gap-8 sm:gap-12">
              <SelectableSlot
                type="addons"
                limit={2}
                asset={selectedAddons[0]}
                placeholderImg="/assets/Templates/Blank Addon.png"
                className="w-16 h-16 sm:w-20 sm:h-20 mobile-addon"
                borderColorHover="border-purple-500"
                onSelect={addAddon}
                selectedItems={selectedAddons}
              />
              <SelectableSlot
                type="addons"
                limit={2}
                asset={selectedAddons[1]}
                placeholderImg="/assets/Templates/Blank Addon.png"
                className="w-16 h-16 sm:w-20 sm:h-20 mobile-addon"
                borderColorHover="border-purple-500"
                onSelect={addAddon}
                selectedItems={selectedAddons}
              />
            </div>

            {/* Perk Row - Mobile: Single row of 4 */}
            <div className="flex-shrink-0">
              <div className="flex justify-center items-center gap-2 sm:gap-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <SelectableSlot
                    key={index}
                    type="perks"
                    limit={4}
                    asset={selectedPerks[index]}
                    placeholderImg="/assets/Templates/Blank Perk.png"
                    className="w-20 h-20 sm:w-26 sm:h-26 mobile-perk"
                    borderColorHover="border-green-500"
                    onSelect={addPerk}
                    selectedItems={selectedPerks}
                  />
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
               paddingTop: 'clamp(6vh, 8vh, 12vh)',
               paddingBottom: 'clamp(1vh, 2vh, 4vh)'
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
                    width: 'clamp(120px, 7.2vw, 216px)',
                    height: 'clamp(120px, 7.2vw, 216px)'
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
                    width: 'clamp(200px, 12vw, 360px)',
                    height: 'clamp(200px, 12vw, 360px)'
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
                    width: 'clamp(90px, 5.4vw, 162px)',
                    height: 'clamp(90px, 5.4vw, 162px)'
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
                   width: 'clamp(80px, 4.8vw, 144px)',
                   height: 'clamp(80px, 4.8vw, 144px)'
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
                   width: 'clamp(80px, 4.8vw, 144px)',
                   height: 'clamp(80px, 4.8vw, 144px)'
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
                 gap: 'clamp(40px, 5vw, 120px)',
                 marginBottom: '8vh'
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