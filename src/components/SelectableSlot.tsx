import React, { useState } from 'react';
import type { AssetType } from '../types';
import AssetPickerModal from './AssetPickerModal';

interface SelectableSlotProps {
  type: AssetType;
  limit: number;
  asset?: any;
  placeholderImg: string;
  className?: string;
  borderColorHover?: string;
  onSelect: (asset: any) => void;
  selectedItems?: any[];
}

const SelectableSlot: React.FC<SelectableSlotProps> = ({
  type,
  limit,
  asset,
  placeholderImg,
  className = "w-20 h-20",
  borderColorHover = "border-blue-500",
  onSelect,
  selectedItems = []
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleSelect = (selectedAsset: any) => {
    onSelect(selectedAsset);
  };

  return (
    <>
      <div
        className={`${className} bg-gray-800 border-4 border-gray-700 rounded-xl flex items-center justify-center hover:${borderColorHover} cursor-pointer transition-all duration-200 relative shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role="button"
        aria-label={asset ? `Selected ${asset.name}` : `Select ${type.slice(0, -1)}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <img
          src={asset ? asset.img : placeholderImg}
          alt={asset ? asset.name : `${type.slice(0, -1)} placeholder`}
          className={`w-full h-full object-cover rounded-lg ${
            asset ? 'opacity-100' : 'opacity-50'
          }`}
        />

        {/* Tooltip */}
        {showTooltip && asset && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm md:text-base rounded-lg whitespace-nowrap z-10 shadow-lg">
            {asset.name}
          </div>
        )}
      </div>

      <AssetPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
        limit={limit}
        onSelect={handleSelect}
        selectedItems={selectedItems}
      />
    </>
  );
};

export default SelectableSlot; 