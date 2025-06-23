import type { Killer, Perk, Offering, Platform } from '../types';
import rarityMapping from '../data/addonRarityMapping.json';

// Killer codename to display name mapping
// const KILLER_ADDON_MAPPING = {
//   'Applepie': 'The Unknown',
//   'Aurora': 'The Twins',
//   'Cannibal': 'The Cannibal',
//   'Churros': 'The Lich',
//   'Comet': 'The Trickster',
//   'DLC2': 'The Shape',
//   'DLC3': 'The Hag',
//   'DLC4': 'The Doctor',
//   'DLC5': 'The Huntress',
//   'Donut': null, // Survivor DLC only
//   'Eclair': 'The Dark Lord',
//   'Eclipse': 'The Nemesis',
//   'England': 'The Nightmare',
//   'Finland': 'The Pig',
//   'Gelato': 'The Houndmaster',
//   'Gemini': 'The Cenobite',
//   'Guam': 'The Clown',
//   'Haiti': 'The Spirit',
//   'Hubble': null, // Mikaela cosmetic patch
//   'Icecream': 'The Ghoul',
//   'Ion': 'The Artist',
//   'Ketchup': 'The Animatronic',
//   'Kenya': 'The Legion',
//   'Kepler': 'The Onryō',
//   'Mali': 'The Plague',
//   'Meteor': 'The Dredge',
//   'Oman': 'The Ghostface',
//   'Orion': 'The Mastermind',
//   'Qatar': 'The Demogorgon',
//   'Quantum': 'The Knight',
//   'Saturn': 'The Skull Merchant',
//   'Sweden': 'The Oni',
//   'Ukraine': 'The Deathslinger',
//   'Umbra': 'The Singularity',
//   'Wales': 'The Executioner',
//   'Wormhole': 'The Xenomorph',
//   'Xipre': null, // Technical folder
//   'Yemen': 'The Blight',
//   'Yerkes': 'The Good Guy',
//   'Zambia': null, // Mid-patch
//   'Zodiac': null // Alan Wake Survivor only
// };

// Reverse mapping for killer display names to proper folder names
const KILLER_NAME_TO_FOLDER = {
  'The Unknown': 'The Unknown',
  'The Twins': 'The Twins',
  'The Cannibal': 'The Cannibal',
  'The Lich': 'The Lich',
  'The Trickster': 'The Trickster',
  'The Shape': 'The Shape',
  'The Hag': 'The Hag',
  'The Doctor': 'The Doctor',
  'The Huntress': 'The Huntress',
  'The Dark Lord': 'The Dark Lord',
  'The Nemesis': 'The Nemesis',
  'The Nightmare': 'The Nightmare',
  'The Pig': 'The Pig',
  'The Houndmaster': 'The Houndmaster',
  'The Cenobite': 'The Cenobite',
  'The Clown': 'The Clown',
  'The Spirit': 'The Spirit',
  'The Ghoul': 'The Ghoul',
  'The Artist': 'The Artist',
  'The Animatronic': 'The Animatronic',
  'The Legion': 'The Legion',
  'The Onryō': 'The Onryō',
  'The Onryō (Sadako Yamamura)': 'The Onryō', // Full name with parenthetical
  'The Plague': 'The Plague',
  'The Dredge': 'The Dredge',
  'The Ghostface': 'The Ghostface',
  'The Ghost Face': 'The Ghostface', // Alternative spelling
  'The Mastermind': 'The Mastermind',
  'The Demogorgon': 'The Demogorgon',
  'The Knight': 'The Knight',
  'The Skull Merchant': 'The Skull Merchant',
  'The Oni': 'The Oni',
  'The Deathslinger': 'The Deathslinger',
  'The Singularity': 'The Singularity',
  'The Executioner': 'The Executioner',
  'The Xenomorph': 'The Xenomorph',
  'The Blight': 'The Blight',
  'The Good Guy': 'The Good Guy',
  'The Nurse': 'The Nurse',
  'The Hillbilly': 'The Hillbilly',
  'The Wraith': 'The Wraith',
  'The Trapper': 'The Trapper',
};

export interface AddonAsset {
  id: string;
  name: string;
  rarity: 'Iridescent' | 'Very Rare' | 'Rare' | 'Uncommon' | 'Common';
  img: string;
  killer?: string;
}

// Rarity order for sorting (most rare first)
const RARITY_ORDER: Record<string, number> = {
  'Iridescent': 0,
  'Very Rare': 1,
  'Rare': 2,
  'Uncommon': 3,
  'Common': 4
};

// Function to get rarity from the mapping or fallback to Common
// const getAddonRarity = (filename: string, killerFolder?: string): string => {
//   const key = killerFolder ? `${killerFolder}/${filename}` : filename;
//   return (rarityMapping as any)[key]?.rarity || 'Common';
// };

// Function to sort addons by rarity (most rare first)
// const sortAddonsByRarity = (addons: Addon[]): Addon[] => {
//   const sorted = addons.sort((a, b) => {
//     const orderA = RARITY_ORDER[a.rarity || 'Common'];
//     const orderB = RARITY_ORDER[b.rarity || 'Common'];
//     
//     // If same rarity, sort alphabetically by name
//     if (orderA === orderB) {
//       return a.name.localeCompare(b.name);
//     }
//     
//     return orderA - orderB; // Most rare (0) comes first
//   });
//   

//   
//   return sorted;
// };

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
    const response = await fetch('/api/killers');
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
        'The Ghostface.png',
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
        const fullName = extractKillerName(filename);
        // Extract display name (remove parenthetical part) but keep full name for search
        const displayName = fullName.includes('(') ? fullName.split('(')[0].trim() : fullName;
        
        return {
          id: fullName.toLowerCase().replace(/\s+/g, '-'),
          name: displayName,
          img: `/assets/killers/${filename}`,
          searchName: fullName // Keep full name for search indexing
        };
      });
    }
    
    const files = await response.json();
    return files.map((filename: string) => {
      const fullName = extractKillerName(filename);
      // Extract display name (remove parenthetical part) but keep full name for search
      const displayName = fullName.includes('(') ? fullName.split('(')[0].trim() : fullName;
      
      return {
        id: fullName.toLowerCase().replace(/\s+/g, '-'),
        name: displayName,
        img: `/assets/killers/${filename}`,
        searchName: fullName // Keep full name for search indexing
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
    const response = await fetch('/api/perks');
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
        // Format display name for Hex and Scourge perks, and fix typos
        const displayName = name
          .replace(/^Hex - /, 'Hex: ')
          .replace(/^Scourge - /, 'Scourge: ')
          .replace(/^Thatanophobia$/, 'Thanatophobia'); // Fix typo
        
        return {
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name: displayName,
          img: `/assets/perks/${filename}`,
          searchName: name // Keep original name for search indexing
        };
      });
    }
    
    const files = await response.json();
    return files.map((filename: string) => {
      const name = filename.replace('.png', '');
      // Format display name for Hex and Scourge perks, and fix typos
      let displayName = name
        .replace(/^Hex - /, 'Hex: ')
        .replace(/^Scourge - /, 'Scourge: ')
        .replace(/^Thatanophobia$/, 'Thanatophobia'); // Fix typo
      
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: displayName,
        img: `/assets/perks/${filename}`,
        searchName: name // Keep original name for search indexing
      };
    });
  } catch (error) {
    console.error('Error loading perks:', error);
    return [];
  }
};

// Load addons from API endpoint
export async function loadAddons(killerName?: string): Promise<AddonAsset[]> {
  try {
    // Get the killer folder name
    const killerFolder = killerName ? (KILLER_NAME_TO_FOLDER as any)[killerName] : null;
    
    if (killerName && !killerFolder) {
      console.warn(`No addon folder found for killer: ${killerName}`);
      return [];
    }

    const allAddons: AddonAsset[] = [];

    // Always include Event addons for all killers
    try {
      const eventResponse = await fetch('/api/addons/Event');
      if (eventResponse.ok) {
        const eventFiles = await eventResponse.json();
        const eventAddons = eventFiles
          .filter((file: string) => file.endsWith('.png'))
          .map((file: string) => {
            const addonName = file.replace('.png', '');
            const addonKey = `Event/${addonName}`;
            const addonData = rarityMapping[addonKey as keyof typeof rarityMapping];
            
            return {
              id: `event_${addonName.toLowerCase().replace(/\s+/g, '-')}`,
              name: addonData?.name || addonName,
              rarity: (addonData?.rarity || 'Common') as AddonAsset['rarity'],
              img: `/assets/Icons/Addons/Event/${file}`,
              killer: 'Event'
            };
          });
        allAddons.push(...eventAddons);
      }
    } catch (error) {
      console.warn('Failed to load Event addons:', error);
    }

    // Load killer-specific addons if a killer is specified
    if (killerFolder) {
      try {
        const killerResponse = await fetch(`/api/addons/${killerFolder}`);
        if (killerResponse.ok) {
          const killerFiles = await killerResponse.json();
          
          // Debug logging for The Onryō specifically
          if (killerFolder.includes('Onryō')) {
            console.log('🐛 DEBUG: Loading addons for', killerFolder);
            console.log('🐛 DEBUG: Found files:', killerFiles.length);
          }
          
          const killerAddons = killerFiles
            .filter((file: string) => file.endsWith('.png'))
            .map((file: string) => {
              const addonName = file.replace('.png', '');
              const addonKey = `${killerFolder}/${addonName}`;
              
              // Normalize Unicode characters to handle different representations of ō
              const normalizedKey = addonKey.normalize('NFD');
              let addonData = rarityMapping[addonKey as keyof typeof rarityMapping];
              
              // If not found with original key, try with normalized key
              if (!addonData) {
                addonData = rarityMapping[normalizedKey as keyof typeof rarityMapping];
              }
              
              // If still not found, try finding a key that matches when both are normalized
              if (!addonData) {
                const matchingKey = Object.keys(rarityMapping).find(key => 
                  key.normalize('NFD') === normalizedKey || key.normalize('NFC') === addonKey.normalize('NFC')
                );
                if (matchingKey) {
                  addonData = rarityMapping[matchingKey as keyof typeof rarityMapping];
                }
              }
              
              // Debug logging for The Onryō and The Executioner specifically
              if (killerFolder.includes('Onryō') || killerFolder.includes('Executioner')) {
                console.log(`🐛 DEBUG: Killer: ${killerFolder}`);
                console.log(`🐛 DEBUG: Addon "${addonName}"`);
                console.log(`🐛 DEBUG: Key "${addonKey}"`);
                console.log(`🐛 DEBUG: Found mapping: ${addonData ? 'YES' : 'NO'}`);
                if (addonData) {
                  console.log(`🐛 DEBUG: Display Name: "${addonData.name}"`);
                  console.log(`🐛 DEBUG: Rarity: ${addonData.rarity}`);
                }
              }
              
              return {
                id: `${killerFolder.toLowerCase().replace(/\s+/g, '-')}_${addonName.toLowerCase().replace(/\s+/g, '-')}`,
                name: addonData?.name || addonName,
                rarity: (addonData?.rarity || 'Common') as AddonAsset['rarity'],
                img: `/assets/Icons/Addons/${killerFolder}/${file}`,
                killer: killerFolder
              };
            });
          allAddons.push(...killerAddons);
        }
      } catch (error) {
        console.warn(`Failed to load addons for killer ${killerFolder}:`, error);
      }
    }

    // Sort by rarity (most rare first) then alphabetically by name
    // Event addons should come last
    return allAddons.sort((a, b) => {
      // Event addons always come last
      if (a.killer === 'Event' && b.killer !== 'Event') return 1;
      if (b.killer === 'Event' && a.killer !== 'Event') return -1;
      
      // If both are Event addons, sort alphabetically
      if (a.killer === 'Event' && b.killer === 'Event') {
        return a.name.localeCompare(b.name);
      }
      
      // For non-Event addons, sort by rarity first
      const rarityDiff = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      return a.name.localeCompare(b.name);
    });

  } catch (error) {
    console.error('Error loading addons:', error);
    return [];
  }
}

// Load offerings from file system, sorted by rarity (most rare to common)
export const loadOfferings = async (): Promise<Offering[]> => {
  try {
    const allOfferings: Offering[] = [];
    
    // Load offerings from each rarity folder in order from most rare to common
    const rarities = ['Event', 'Visceral', 'Very Rare', 'Rare', 'Uncommon', 'Common'];
    
    for (const rarity of rarities) {
      try {
        const response = await fetch(`/api/offerings/${encodeURIComponent(rarity)}`);
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
    const response = await fetch('/api/platforms');
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