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
        <div className="flex-1 flex flex-col justify-between py-4 sm:py-6 md:py-8 lg:py-12 xl:py-16 px-2 sm:px-4 md:px-8 lg:px-16 xl:px-24 max-w-screen-2xl mx-auto w-full min-h-0">
          {/* Top Row - Full Width Distribution */}
          <div className="flex justify-between items-center w-full">
            {/* Offering Slot - Far Left */}
            <SelectableSlot
              type="offerings"
              limit={1}
              asset={selectedOffering}
              placeholderImg="/assets/Templates/Blank Offering.png"
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 2xl:w-56 2xl:h-56"
              borderColorHover="border-yellow-500"
              onSelect={setOffering}
            />
            
            {/* Killer Portrait - Center */}
            <SelectableSlot
              type="killers"
              limit={1}
              asset={selectedKiller}
              placeholderImg="/assets/Templates/Blank Killer.png"
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 xl:w-80 xl:h-80 2xl:w-96 2xl:h-96"
              borderColorHover="border-red-500"
              onSelect={setKiller}
            />
            
            {/* Platform Slot - Far Right */}
            <SelectableSlot
              type="platforms"
              limit={1}
              asset={selectedPlatform}
              placeholderImg="/assets/Templates/Blank Platform.png"
              className="w-16 h-16 sm:w-18 sm:h-18 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 2xl:w-44 2xl:h-44"
              borderColorHover="border-green-500"
              onSelect={setPlatform}
            />
          </div>

          {/* Addon Row - Wide Spread */}
          <div className="flex justify-center gap-12 sm:gap-16 md:gap-24 lg:gap-32 xl:gap-40 2xl:gap-48">
            <SelectableSlot
              type="addons"
              limit={2}
              asset={selectedAddons[0]}
              placeholderImg="/assets/Templates/Blank Addon.png"
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-24 lg:h-24 xl:w-28 xl:h-28 2xl:w-36 2xl:h-36"
              borderColorHover="border-purple-500"
              onSelect={addAddon}
              selectedItems={selectedAddons}
            />
            <SelectableSlot
              type="addons"
              limit={2}
              asset={selectedAddons[1]}
              placeholderImg="/assets/Templates/Blank Addon.png"
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-24 lg:h-24 xl:w-28 xl:h-28 2xl:w-36 2xl:h-36"
              borderColorHover="border-purple-500"
              onSelect={addAddon}
              selectedItems={selectedAddons}
            />
          </div>

          {/* Perk Row - Bottom with responsive spacing */}
          <div className="flex justify-between items-center w-full max-w-6xl mx-auto">
            {Array.from({ length: 4 }, (_, index) => (
              <SelectableSlot
                key={index}
                type="perks"
                limit={4}
                asset={selectedPerks[index]}
                placeholderImg="/assets/Templates/Blank Perk.png"
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52 2xl:w-60 2xl:h-60"
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