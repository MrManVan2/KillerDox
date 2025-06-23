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
        <div className="flex-1 flex flex-col justify-between py-8 md:py-12 lg:py-16 xl:py-20 px-8 md:px-16 lg:px-24 xl:px-32 max-w-screen-2xl mx-auto w-full min-h-0">
          {/* Top Row - Full Width Distribution */}
          <div className="flex justify-between items-center w-full">
            {/* Offering Slot - Far Left */}
            <SelectableSlot
              type="offerings"
              limit={1}
              asset={selectedOffering}
              placeholderImg="/assets/Templates/Blank Offering.png"
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56"
              borderColorHover="border-yellow-500"
              onSelect={setOffering}
            />
            
            {/* Killer Portrait - Center */}
            <SelectableSlot
              type="killers"
              limit={1}
              asset={selectedKiller}
              placeholderImg="/assets/Templates/Blank Killer.png"
              className="w-52 h-52 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96"
              borderColorHover="border-red-500"
              onSelect={setKiller}
            />
            
            {/* Platform Slot - Far Right */}
            <SelectableSlot
              type="platforms"
              limit={1}
              asset={selectedPlatform}
              placeholderImg="/assets/Templates/Blank Platform.png"
              className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-44 xl:h-44"
              borderColorHover="border-green-500"
              onSelect={setPlatform}
            />
          </div>

          {/* Addon Row - Wide Spread */}
          <div className="flex justify-center gap-24 md:gap-32 lg:gap-40 xl:gap-48">
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
          <div className="flex justify-between items-center w-full max-w-6xl mx-auto">
            {Array.from({ length: 4 }, (_, index) => (
              <SelectableSlot
                key={index}
                type="perks"
                limit={4}
                asset={selectedPerks[index]}
                placeholderImg="/assets/Templates/Blank Perk.png"
                className="w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 xl:w-60 xl:h-60"
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