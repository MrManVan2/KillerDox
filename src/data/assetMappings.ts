export interface KillerCodeMapping {
  codeName: string;
  killerName: string;
  killerDisplayName: string;
}

// Comprehensive mapping of addon directory code names to actual killers
export const KILLER_CODE_MAPPINGS: KillerCodeMapping[] = [
  // Original Killers
  { codeName: 'Camper', killerName: 'The Trapper', killerDisplayName: 'The Trapper' },
  { codeName: 'Wraith', killerName: 'The Wraith', killerDisplayName: 'The Wraith' },
  { codeName: 'Hillbilly', killerName: 'The Hillbilly', killerDisplayName: 'The Hillbilly' },
  { codeName: 'Nurse', killerName: 'The Nurse', killerDisplayName: 'The Nurse' },
  { codeName: 'Shape', killerName: 'The Shape', killerDisplayName: 'The Shape (Michael Myers)' },
  { codeName: 'Hag', killerName: 'The Hag', killerDisplayName: 'The Hag' },
  
  // Licensed Killers
  { codeName: 'Cannibal', killerName: 'The Cannibal', killerDisplayName: 'The Cannibal (Bubba Sawyer)' },
  { codeName: 'Applepie', killerName: 'The Nightmare', killerDisplayName: 'The Nightmare (Freddy Krueger)' },
  
  // Original Killers continued
  { codeName: 'Aurora', killerName: 'The Huntress', killerDisplayName: 'The Huntress' },
  { codeName: 'Eclipse', killerName: 'The Doctor', killerDisplayName: 'The Doctor' },
  { codeName: 'Haiti', killerName: 'The Spirit', killerDisplayName: 'The Spirit' },
  { codeName: 'Finland', killerName: 'The Pig', killerDisplayName: 'The Pig (Amanda Young)' },
  { codeName: 'England', killerName: 'The Plague', killerDisplayName: 'The Plague' },
  { codeName: 'Sweden', killerName: 'The Legion', killerDisplayName: 'The Legion' },
  { codeName: 'Kenya', killerName: 'The Clown', killerDisplayName: 'The Clown' },
  
  // More Recent Killers
  { codeName: 'Mali', killerName: 'The Oni', killerDisplayName: 'The Oni' },
  { codeName: 'Ukraine', killerName: 'The Deathslinger', killerDisplayName: 'The Deathslinger' },
  { codeName: 'Wales', killerName: 'The Executioner', killerDisplayName: 'The Executioner (Pyramid Head)' },
  { codeName: 'Qatar', killerName: 'The Blight', killerDisplayName: 'The Blight' },
  { codeName: 'Oman', killerName: 'The Twins', killerDisplayName: 'The Twins' },
  { codeName: 'Comet', killerName: 'The Trickster', killerDisplayName: 'The Trickster' },
  { codeName: 'Meteor', killerName: 'The Nemesis', killerDisplayName: 'The Nemesis' },
  { codeName: 'Hubble', killerName: 'The Cenobite', killerDisplayName: 'The Cenobite (Pinhead)' },
  { codeName: 'Saturn', killerName: 'The Artist', killerDisplayName: 'The Artist' },
  { codeName: 'Orion', killerName: 'The Onryō', killerDisplayName: 'The Onryō (Sadako Yamamura)' },
  { codeName: 'Gemini', killerName: 'The Dredge', killerDisplayName: 'The Dredge' },
  { codeName: 'Ion', killerName: 'The Mastermind', killerDisplayName: 'The Mastermind (Albert Wesker)' },
  { codeName: 'Kepler', killerName: 'The Knight', killerDisplayName: 'The Knight' },
  { codeName: 'Wormhole', killerName: 'The Skull Merchant', killerDisplayName: 'The Skull Merchant' },
  { codeName: 'Quantum', killerName: 'The Singularity', killerDisplayName: 'The Singularity' },
  { codeName: 'Churros', killerName: 'The Xenomorph', killerDisplayName: 'The Xenomorph' },
  { codeName: 'Donut', killerName: 'The Good Guy', killerDisplayName: 'The Good Guy (Chucky)' },
  { codeName: 'Icecream', killerName: 'The Unknown', killerDisplayName: 'The Unknown' },
  { codeName: 'Eclair', killerName: 'The Lich', killerDisplayName: 'The Lich (Vecna)' },
  { codeName: 'Gelato', killerName: 'The Dark Lord', killerDisplayName: 'The Dark Lord (Dracula)' },
  { codeName: 'Ketchup', killerName: 'The Houndmaster', killerDisplayName: 'The Houndmaster' },
  
  // Recent additions that might be DLC codes
  { codeName: 'DLC2', killerName: 'The Demogorgon', killerDisplayName: 'The Demogorgon' },
  { codeName: 'DLC3', killerName: 'The Ghostface', killerDisplayName: 'The Ghostface' },
  { codeName: 'DLC4', killerName: 'The Animatronic', killerDisplayName: 'The Animatronic (Springtrap)' },
  { codeName: 'DLC5', killerName: 'The Ghoul', killerDisplayName: 'The Ghoul (Ken Kaneki)' },
  
  // Remaining code names that need verification
  { codeName: 'Umbra', killerName: 'Unknown Killer 1', killerDisplayName: 'Unknown Killer 1' },
  { codeName: 'Zodiac', killerName: 'Unknown Killer 2', killerDisplayName: 'Unknown Killer 2' },
  { codeName: 'Xipre', killerName: 'Unknown Killer 3', killerDisplayName: 'Unknown Killer 3' },
  { codeName: 'Yerkes', killerName: 'Unknown Killer 4', killerDisplayName: 'Unknown Killer 4' },
  { codeName: 'Guam', killerName: 'Unknown Killer 5', killerDisplayName: 'Unknown Killer 5' },
  { codeName: 'Yemen', killerName: 'Unknown Killer 6', killerDisplayName: 'Unknown Killer 6' },
  { codeName: 'Zambia', killerName: 'Unknown Killer 7', killerDisplayName: 'Unknown Killer 7' },
];

// Helper function to get killer name from code name
export const getKillerFromCodeName = (codeName: string): string | null => {
  const mapping = KILLER_CODE_MAPPINGS.find(m => m.codeName === codeName);
  return mapping ? mapping.killerName : null;
};

// Helper function to get code name from killer name
export const getCodeNameFromKiller = (killerName: string): string | null => {
  const mapping = KILLER_CODE_MAPPINGS.find(m => m.killerName === killerName);
  return mapping ? mapping.codeName : null;
};

// Helper function to get all addons for a specific killer
export const getAddonsForKiller = async (killerName: string): Promise<any[]> => {
  const codeName = getCodeNameFromKiller(killerName);
  if (!codeName) return [];
  
  try {
    // This would need to be implemented based on your backend or file structure
    // For now, returning empty array as placeholder
    return [];
  } catch (error) {
    console.error(`Error loading addons for ${killerName}:`, error);
    return [];
  }
}; 