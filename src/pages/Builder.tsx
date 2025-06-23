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
    <div className="min-h-screen p-2 sm:p-4 md:p-6 relative" style={{
      backgroundImage: 'url(/assets/Templates/Backdrop.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="w-full min-h-screen flex flex-col">
        {/* Main Content - Mobile-First Responsive Layout */}
        <div className="flex-1 flex flex-col justify-between py-4 sm:py-6 md:py-8 lg:py-14 xl:py-20 px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 max-w-screen-2xl mx-auto w-full">
          
          {/* Mobile Layout: Stack everything vertically on small screens */}
          <div className="block md:hidden space-y-6">
            {/* Mobile Top Row: Offering and Platform */}
            <div className="flex justify-between items-center px-4">
              <SelectableSlot
                type="offerings"
                limit={1}
                asset={selectedOffering}
                placeholderImg="/assets/Templates/Blank Offering.png"
                className="w-20 h-20 sm:w-24 sm:h-24"
                borderColorHover="border-yellow-500"
                onSelect={setOffering}
              />
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
            
            {/* Mobile Killer - Center */}
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
            
            {/* Mobile Addons - Side by side */}
            <div className="flex justify-center gap-8 sm:gap-12">
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
            
            {/* Mobile Perks - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              {Array.from({ length: 4 }, (_, index) => (
                <SelectableSlot
                  key={index}
                  type="perks"
                  limit={4}
                  asset={selectedPerks[index]}
                  placeholderImg="/assets/Templates/Blank Perk.png"
                  className="w-24 h-24 sm:w-28 sm:h-28"
                  borderColorHover="border-green-500"
                  onSelect={addPerk}
                  selectedItems={selectedPerks}
                />
              ))}
            </div>
          </div>
          
          {/* Desktop Layout: Hidden on mobile, shown on medium screens and up */}
          <div className="hidden md:flex md:flex-col md:justify-between md:h-full">
            {/* Desktop Top Row - True Center with Side Elements */}
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

            {/* Desktop Addon Row - Wide Spread */}
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

            {/* Desktop Perk Row - Bottom with responsive spacing */}
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
      </div>





      {/* Reset Button - Trash Icon Bottom Right */}
      <button
        onClick={() => reset()}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110"
        title="Reset Build"
      >
        <TrashIcon className="w-6 h-6 md:w-8 md:h-8" />
      </button>
    </div>
  );
};

export default Builder; 