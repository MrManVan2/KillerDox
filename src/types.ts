export interface Killer {
  id: string;
  name: string;
  img: string;
  power?: string;
  realm?: string;
  difficulty?: 'Easy' | 'Intermediate' | 'Hard';
}

export interface Perk {
  id: string;
  name: string;
  img: string;
  description?: string;
  character?: string;
  teachable?: boolean;
  type?: 'Killer' | 'Survivor';
}

export interface Addon {
  id: string;
  name: string;
  img: string;
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Visceral';
  killer?: string;
  description?: string;
}

export interface Offering {
  id: string;
  name: string;
  img: string;
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Ultra Rare';
  description?: string;
  type?: 'Map' | 'Bloodpoints' | 'Mist' | 'Hook' | 'Other';
}

export interface Platform {
  id: string;
  name: string;
  img: string;
  shortName?: string;
}

export interface Build {
  killer: Killer | null;
  perks: Perk[];
  addons: Addon[];
  offering: Offering | null;
  platform: Platform | null;
}

export type AssetType = 'killers' | 'perks' | 'addons' | 'offerings' | 'platforms'; 