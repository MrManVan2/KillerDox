import type { Killer, Perk, Addon, Offering, Platform } from '../types';

// Import the generated rarity mapping
let rarityMapping: Record<string, { rarity: string; colorCategory: string; path: string }> = {};

// Load the rarity mapping on module initialization
const loadRarityMapping = async () => {
  try {
    const response = await fetch('/data/addonRarityMapping.json');
    if (response.ok) {
      rarityMapping = await response.json();
    }
  } catch (error) {
    console.warn('Could not load rarity mapping, falling back to default rarity detection');
  }
};

// Initialize the mapping
loadRarityMapping();

// Mapping of addon folder codenames to killer names (with full names including parenthetical info)
const KILLER_ADDON_MAPPING: Record<string, string> = {
  'Applepie': 'The Unknown',
  'Aurora': 'The Twins',
  'Cannibal': 'The Cannibal (Bubba Sawyer)',
  'Churros': 'The Lich (Vecna)',
  'Comet': 'The Trickster',
  'Crooked': 'The Hillbilly',
  'DLC2': 'The Shape (Michael Myers)',
  'DLC3': 'The Hag',
  'DLC4': 'The Doctor',
  'DLC5': 'The Huntress',
  'Eclair': 'The Dark Lord (Dracula)',
  'Eclipse': 'The Nemesis',
  'England': 'The Nightmare (Freddy Krueger)',
  'Finland': 'The Pig (Amanda Young)',
  'Gelato': 'The Houndmaster',
  'Gemini': 'The Cenobite (Pinhead)',
  'Guam': 'The Clown',
  'Haiti': 'The Spirit',
  'Icecream': 'The Ghoul (Ken Kaneki)',
  'Ion': 'The Artist',
  'Ketchup': 'The Animatronic (Springtrap)',
  'Kenya': 'The Legion',
  'Kepler': 'The Onryō (Sadako Yamamura)',
  'Mali': 'The Plague',
  'Meteor': 'The Dredge',
  'Nurse': 'The Nurse',
  'Oman': 'The Ghost Face',
  'Orion': 'The Mastermind (Albert Wesker)',
  'Qatar': 'The Demogorgon',
  'Quantum': 'The Knight',
  'Saturn': 'The Skull Merchant',
  'Sweden': 'The Oni',
  'Trapper': 'The Trapper',
  'Ukraine': 'The Deathslinger',
  'Umbra': 'The Singularity',
  'Wales': 'The Executioner (Pyramid Head)',
  'Wormhole': 'The Xenomorph',
  'Wraith': 'The Wraith',
  'Yemen': 'The Blight',
  'Yerkes': 'The Good Guy (Chucky)',
  'Zambia': 'The Unknown', // Fallback for mid-patch
};

// Rarity order for sorting (0 = most rare, 4 = least rare)
const RARITY_ORDER: Record<string, number> = {
  'Iridescent': 0,
  'Very Rare': 1,
  'Rare': 2,
  'Uncommon': 3,
  'Common': 4
};

// Function to get rarity from the mapping or fallback to Common
const getAddonRarity = (filename: string, killerFolder?: string): string => {
  const key = killerFolder ? `${killerFolder}/${filename}` : filename;
  return rarityMapping[key]?.rarity || 'Common';
};

// Function to sort addons by rarity (most rare first)
const sortAddonsByRarity = (addons: Addon[]): Addon[] => {
  const sorted = addons.sort((a, b) => {
    const orderA = RARITY_ORDER[a.rarity || 'Common'];
    const orderB = RARITY_ORDER[b.rarity || 'Common'];
    
    // If same rarity, sort alphabetically by name
    if (orderA === orderB) {
      return a.name.localeCompare(b.name);
    }
    
    return orderA - orderB; // Most rare (0) comes first
  });
  

  
  return sorted;
};

// Function to extract killer name from filename, preserving parenthetical names
const extractKillerName = (filename: string): string => {
  const nameWithoutExtension = filename.replace('.png', '');
  // Keep the full name including parenthetical information for searchability
  return nameWithoutExtension;
};

// Load killers from file system
export const loadKillers = async (): Promise<Killer[]> => {
  try {
    // Get list of killer image files
    const response = await fetch('/api/assets/killers');
    if (!response.ok) {
      // Fallback: create killers based on known files
      const killerFiles = [
        'The Animatronic (Springtrap).png',
        'The Artist.png',
        'The Blight.png',
        'The Cannibal (Bubba Sawyer).png',
        'The Cenobite (Pinhead).png',
        'The Clown.png',
        'The Dark Lord (Dracula).png',
        'The Deathslinger.png',
        'The Demogorgon.png',
        'The Doctor.png',
        'The Dredge.png',
        'The Executioner (Pyramid Head).png',
        'The Ghoul (Ken Kaneki).png',
        'The Ghost Face.png',
        'The Good Guy (Chucky).png',
        'The Hag.png',
        'The Hillbilly.png',
        'The Houndmaster.png',
        'The Huntress.png',
        'The Knight.png',
        'The Legion.png',
        'The Lich (Vecna).png',
        'The Mastermind (Albert Wesker).png',
        'The Nemesis.png',
        'The Nightmare (Freddy Krueger).png',
        'The Nurse.png',
        'The Oni.png',
        'The Onryō (Sadako Yamamura).png',
        'The Pig (Amanda Young).png',
        'The Plague.png',
        'The Shape (Michael Myers).png',
        'The Singularity.png',
        'The Skull Merchant.png',
        'The Spirit.png',
        'The Trapper.png',
        'The Trickster.png',
        'The Twins.png',
        'The Unknown.png',
        'The Wraith.png',
        'The Xenomorph.png'
      ];
      
      return killerFiles.map((filename) => {
        const name = extractKillerName(filename);
        return {
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          img: `/assets/killers/${filename}`
        };
      });
    }
    
    const files = await response.json();
    return files.map((filename: string) => {
      const name = extractKillerName(filename);
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        img: `/assets/killers/${filename}`
      };
    });
  } catch (error) {
    console.error('Error loading killers:', error);
    return [];
  }
};

// Load perks from file system
export const loadPerks = async (): Promise<Perk[]> => {
  try {
    const response = await fetch('/api/assets/perks');
    if (!response.ok) {
      // Fallback to known perks
      const perkFiles = [
        'A Nurses Calling.png',
        'Agitation.png',
        'Alien Instinct.png'
        // Add more as needed
      ];
      
      return perkFiles.map((filename) => {
        const name = filename.replace('.png', '');
        return {
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          img: `/assets/perks/${filename}`
        };
      });
    }
    
    const files = await response.json();
    return files.map((filename: string) => {
      const name = filename.replace('.png', '');
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        img: `/assets/perks/${filename}`
      };
    });
  } catch (error) {
    console.error('Error loading perks:', error);
    return [];
  }
};

// Load addons from file system with killer-specific filtering and rarity sorting
export const loadAddons = async (selectedKiller?: Killer | null): Promise<Addon[]> => {
  try {
    // Ensure rarity mapping is loaded before processing addons
    if (Object.keys(rarityMapping).length === 0) {
      await loadRarityMapping();
    }
    
    const allAddons: Addon[] = [];
    
    // Load general addons (files directly in addons folder)
    try {
      const response = await fetch('/api/assets/addons');
      if (response.ok) {
        const generalFiles = await response.json();
        const generalAddons = generalFiles
          .filter((filename: string) => filename.endsWith('.png'))
          .map((filename: string) => {
            const name = filename.replace('iconAddon_', '').replace('.png', '');
            // Convert camelCase to Title Case
            const displayName = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const rarity = getAddonRarity(filename);
            return {
              id: filename.replace('.png', ''),
              name: displayName,
              img: `/assets/addons/${filename}`,
              killer: null, // General addon
              rarity
            };
          });
        allAddons.push(...generalAddons);
      }
    } catch (error) {
      console.error('Error loading general addons:', error);
    }
    
    // Load killer-specific addons if a killer is selected
    if (selectedKiller) {
      // Find the corresponding addon folder for this killer
      const addonFolderCode = Object.keys(KILLER_ADDON_MAPPING).find(
        code => KILLER_ADDON_MAPPING[code] === selectedKiller.name
      );
      
      if (addonFolderCode) {
        try {
          const response = await fetch(`/api/assets/addons/${addonFolderCode}`);
          if (response.ok) {
            const killerFiles = await response.json();
            const killerAddons = killerFiles
              .filter((filename: string) => filename.endsWith('.png'))
              .map((filename: string) => {
                const name = filename.replace('iconAddon_', '').replace('T_UI_iconAddon_', '').replace('.png', '');
                const displayName = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const rarity = getAddonRarity(filename, addonFolderCode);
                return {
                  id: `${addonFolderCode}_${filename.replace('.png', '')}`,
                  name: displayName,
                  img: `/assets/addons/${addonFolderCode}/${filename}`,
                  killer: selectedKiller.name,
                  rarity
                };
              });
            allAddons.push(...killerAddons);
          }
        } catch (error) {
          console.error(`Error loading addons for ${selectedKiller.name}:`, error);
        }
      }
    } else {
      // If no killer selected, load all killer-specific addons
      for (const [addonFolderCode, killerName] of Object.entries(KILLER_ADDON_MAPPING)) {
        try {
          const response = await fetch(`/api/assets/addons/${addonFolderCode}`);
          if (response.ok) {
            const killerFiles = await response.json();
            const killerAddons = killerFiles
              .filter((filename: string) => filename.endsWith('.png'))
              .map((filename: string) => {
                const name = filename.replace('iconAddon_', '').replace('T_UI_iconAddon_', '').replace('.png', '');
                const displayName = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const rarity = getAddonRarity(filename, addonFolderCode);
                return {
                  id: `${addonFolderCode}_${filename.replace('.png', '')}`,
                  name: displayName,
                  img: `/assets/addons/${addonFolderCode}/${filename}`,
                  killer: killerName,
                  rarity
                };
              });
            allAddons.push(...killerAddons);
          }
        } catch (error) {
          console.error(`Error loading addons for ${killerName}:`, error);
        }
      }
    }
    
    // Sort addons by rarity (most rare first)
    return sortAddonsByRarity(allAddons);
  } catch (error) {
    console.error('Error loading addons:', error);
    return [];
  }
};

// Load offerings from file system, sorted by rarity (most rare to common)
export const loadOfferings = async (): Promise<Offering[]> => {
  try {
    const allOfferings: Offering[] = [];
    
    // Load offerings from each rarity folder in order from most rare to common
    const rarities = ['Event', 'Visceral', 'Very Rare', 'Rare', 'Uncommon', 'Common'];
    
    for (const rarity of rarities) {
      try {
        const response = await fetch(`/api/assets/offerings/${encodeURIComponent(rarity)}`);
        if (response.ok) {
          const files = await response.json();
          const rarityOfferings = files
            .filter((filename: string) => filename.endsWith('.png'))
            .map((filename: string) => {
              const name = filename.replace('.png', '');
              return {
                id: `${rarity.toLowerCase().replace(/\s+/g, '-')}_${name.toLowerCase().replace(/\s+/g, '-')}`,
                name,
                img: `/assets/offerings/${rarity}/${filename}`,
                rarity: rarity as any
              };
            });
          // Sort alphabetically within the same rarity
          rarityOfferings.sort((a: Offering, b: Offering) => a.name.localeCompare(b.name));
          allOfferings.push(...rarityOfferings);
        }
      } catch (error) {
        console.error(`Error loading ${rarity} offerings:`, error);
      }
    }
    
    return allOfferings;
  } catch (error) {
    console.error('Error loading offerings:', error);
    return [];
  }
};

// Load platforms from file system
export const loadPlatforms = async (): Promise<Platform[]> => {
  try {
    const response = await fetch('/api/assets/platforms');
    if (!response.ok) {
      // Fallback to known platforms
      const platformFiles = [
        'Epic Games.png',
        'Nintendo Switch.png',
        'Playstation.png',
        'Steam.png',
        'Stadia.png',
        'Xbox.png'
      ];
      
      return platformFiles.map((filename) => {
        const name = filename.replace('.png', '');
        return {
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          img: `/assets/platforms/${filename}`,
          shortName: name.split(' ')[0]
        };
      });
    }
    
    const files = await response.json();
    return files.map((filename: string) => {
      const name = filename.replace('.png', '');
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        img: `/assets/platforms/${filename}`,
        shortName: name.split(' ')[0]
      };
    });
  } catch (error) {
    console.error('Error loading platforms:', error);
    return [];
  }
}; 