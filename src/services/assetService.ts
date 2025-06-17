import type { Killer, Perk, Addon, Offering, Platform } from '../types';
import { KILLER_CODE_MAPPINGS, getCodeNameFromKiller, getKillerFromCodeName } from '../data/assetMappings';

// Helper function to generate a unique ID from filename
const generateId = (filename: string): string => {
  return filename.replace(/\.(png|jpg|jpeg)$/i, '').toLowerCase().replace(/[^a-z0-9]/g, '-');
};

// Helper function to extract name from filename
const extractName = (filename: string): string => {
  return filename.replace(/\.(png|jpg|jpeg)$/i, '');
};

// Helper function to determine addon rarity from filename patterns
const determineAddonRarity = (filename: string): 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Ultra Rare' => {
  const name = filename.toLowerCase();
  if (name.includes('iridescent') || name.includes('iri_')) return 'Ultra Rare';
  if (name.includes('ultra') || name.includes('purple')) return 'Very Rare';
  if (name.includes('rare') || name.includes('green')) return 'Rare';
  if (name.includes('uncommon') || name.includes('yellow')) return 'Uncommon';
  return 'Common';
};

// Helper function to determine offering rarity
const determineOfferingRarity = (path: string): 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Ultra Rare' => {
  if (path.includes('Very Rare')) return 'Very Rare';
  if (path.includes('Rare')) return 'Rare';
  if (path.includes('Uncommon')) return 'Uncommon';
  if (path.includes('Visceral')) return 'Ultra Rare';
  return 'Common';
};

// Helper function to determine offering type
const determineOfferingType = (filename: string): 'Map' | 'Bloodpoints' | 'Mist' | 'Hook' | 'Other' => {
  const name = filename.toLowerCase();
  if (name.includes('map') || name.includes('estate') || name.includes('realm')) return 'Map';
  if (name.includes('bloodpoint') || name.includes('party') || name.includes('escape')) return 'Bloodpoints';
  if (name.includes('mist') || name.includes('fog')) return 'Mist';
  if (name.includes('hook') || name.includes('meat')) return 'Hook';
  return 'Other';
};

class AssetService {
  private killerCache: Killer[] | null = null;
  private perkCache: Perk[] | null = null;
  private addonCache: Map<string, Addon[]> = new Map(); // Cached by killer name
  private offeringCache: Offering[] | null = null;
  private platformCache: Platform[] | null = null;

  async loadKillers(): Promise<Killer[]> {
    if (this.killerCache) return this.killerCache;

    try {
      // Get list of killer files from the public directory
      const killerFiles = [
        'The Trapper.png',
        'The Wraith.png',
        'The Hillbilly.png',
        'The Nurse.png',
        'The Shape (Michael Myers).png',
        'The Hag.png',
        'The Doctor.png',
        'The Huntress.png',
        'The Cannibal (Bubba Sawyer).png',
        'The Nightmare (Freddy Krueger).png',
        'The Pig (Amanda Young).png',
        'The Clown.png',
        'The Spirit.png',
        'The Legion.png',
        'The Plague.png',
        'The Ghostface.png',
        'The Demogorgon.png',
        'The Oni.png',
        'The Deathslinger.png',
        'The Executioner (Pyramid Head).png',
        'The Blight.png',
        'The Twins.png',
        'The Trickster.png',
        'The Nemesis.png',
        'The Cenobite (Pinhead).png',
        'The Artist.png',
        'The Onryō (Sadako Yamamura).png',
        'The Dredge.png',
        'The Mastermind (Albert Wesker).png',
        'The Knight.png',
        'The Skull Merchant.png',
        'The Singularity.png',
        'The Xenomorph.png',
        'The Good Guy (Chucky).png',
        'The Unknown.png',
        'The Lich (Vecna).png',
        'The Dark Lord (Dracula).png',
        'The Houndmaster.png',
        'The Animatronic (Springtrap).png',
        'The Ghoul (Ken Kaneki).png'
      ];

      this.killerCache = killerFiles.map(filename => ({
        id: generateId(filename),
        name: extractName(filename),
        img: `/assets/killers/${filename}`,
        power: '', // Could be expanded later
        realm: '', // Could be expanded later
        difficulty: 'Intermediate' as const // Could be expanded later
      }));

      return this.killerCache;
    } catch (error) {
      console.error('Error loading killers:', error);
      return [];
    }
  }

  async loadPerks(): Promise<Perk[]> {
    if (this.perkCache) return this.perkCache;

    try {
      // List of perk files - you can expand this list
      const perkFiles = [
        'Barbecue & Chili.png',
        'Hex - Ruin.png',
        'Pop Goes The Weasel.png',
        'Save The Best For Last.png',
        'Corrupt Intervention.png',
        'Infectious Fright.png',
        'Monitor & Abuse.png',
        'Nurse\'s Calling.png',
        'Enduring.png',
        'Spirit Fury.png',
        'Brutal Strength.png',
        'Fire Up.png',
        'Blood Warden.png',
        'Remember Me.png',
        'Play With Your Food.png',
        'Dying Light.png',
        'Overcharge.png',
        'Overwhelming Presence.png',
        'Unnerving Presence.png',
        'Distressing.png',
        'Coulrophobia.png',
        'Franklin\'s Demise.png',
        'Knock Out.png',
        'Sloppy Butcher.png',
        'Thanatophobia.png',
        'A Nurse\'s Calling.png',
        'Stridor.png',
        'Shadowborn.png',
        'Bloodhound.png',
        'Predator.png',
        'Spies From The Shadows.png',
        'Whispers.png',
        'Bitter Murmur.png',
        'Hex - No One Escapes Death.png',
        'Hex - Thrill of The Hunt.png',
        'Hex - The Third Seal.png',
        'Hex - Devour Hope.png',
        'Hex - Huntress Lullaby.png',
        'Territorial Imperative.png',
        'Beast of Prey.png',
        'Hex - Haunted Ground.png',
        'Rancor.png',
        'Make Your Choice.png',
        'Discordance.png',
        'Iron Maiden.png',
        'Mad Grit.png',
        'Infectious Fright.png',
        'Dark Devotion.png',
        'Nemesis.png',
        'Blood Echo.png',
        'Mindbreaker.png',
        'Surge.png',
        'Cruel Limits.png',
        'Thrilling Tremors.png',
        'I\'m All Ears.png',
        'Furtive Chase.png',
        'Trail of Torment.png',
        'Forced Penance.png',
        'Deathbound.png',
        'Hex - Undying.png',
        'Hex - Blood Favor.png',
        'Dragons Grip.png',
        'Oppression.png',
        'Hoarder.png',
        'Coup De Grace.png',
        'Hex - Retribution.png',
        'Gear Head.png',
        'Dead Man Switch.png',
        'Hysteria.png',
        'Lethal Pursuer.png',
        'Eruption.png',
        'Scourge Hook - Pain Resonance.png',
        'Hex - Pentimento.png',
        'Grim Embrace.png',
        'Call of Brine.png',
        'Scourge Hook - Flood of Rage.png',
        'Merciless Storm.png',
        'Dissolution.png',
        'Darkness Revelated.png',
        'Septic Touch.png',
        'Shattered Hope.png',
        'Scourge Hook - Gift of Pain.png',
        'Deadlock.png',
        'No Way Out.png',
        'Starstruck.png',
        'Hex - Crowd Control.png',
        'Surveillance.png',
        'Scourge Hook - Hangmans Trick.png'
      ];

      this.perkCache = perkFiles.map(filename => ({
        id: generateId(filename),
        name: extractName(filename),
        img: `/assets/perks/${filename}`,
        description: '', // Could be expanded later
        character: '', // Could be expanded later
        teachable: true,
        type: 'Killer' as const
      }));

      return this.perkCache;
    } catch (error) {
      console.error('Error loading perks:', error);
      return [];
    }
  }

  async loadAddons(killerName?: string): Promise<Addon[]> {
    try {
      if (killerName) {
        // Load addons for specific killer
        if (this.addonCache.has(killerName)) {
          return this.addonCache.get(killerName)!;
        }

        const codeName = getCodeNameFromKiller(killerName);
        if (!codeName) return [];

        // Try to load addons dynamically from the killer's folder
        const killerAddons = await this.loadAddonsFromFolder(killerName, codeName);
        this.addonCache.set(killerName, killerAddons);
        return killerAddons;
      } else {
        // Load all generic addons
        const allAddons: Addon[] = [];
        
        // Load generic addons (in root addon directory)
        const genericAddonFiles = [
          'iconAddon_spoolOfWire.png',
          'iconAddon_springClamp.png',
          'iconAddon_socketSwivels.png',
          'iconAddon_scraps.png',
          'iconAddon_protectiveGloves.png',
          'iconAddon_instructions.png',
          'iconAddon_metalSaw.png',
          'iconAddon_gripWrench.png',
          'iconAddon_cuttingWire.png',
          'iconAddon_cleanRag.png',
          'iconAddon_brandNewPart.png'
        ];

        genericAddonFiles.forEach(filename => {
          allAddons.push({
            id: generateId(filename),
            name: extractName(filename).replace('iconAddon_', '').replace(/([A-Z])/g, ' $1').trim(),
            img: `/assets/addons/${filename}`,
            rarity: determineAddonRarity(filename),
            killer: undefined, // Generic addon
            description: ''
          });
        });

        return allAddons;
      }
    } catch (error) {
      console.error('Error loading addons:', error);
      return [];
    }
  }

  private async loadAddonsFromFolder(killerName: string, codeName: string): Promise<Addon[]> {
    try {
      // Get killer-specific addon filenames based on what we know exists
      const knownAddonFiles = this.getKnownAddonFilesForKiller(codeName);
      
      const addons: Addon[] = [];
      
      for (const filename of knownAddonFiles) {
        const addonName = this.convertFilenameToAddonName(filename);
        const rarity = this.determineRarityFromFilename(filename);
        
        addons.push({
          id: generateId(`${codeName}_${addonName}`),
          name: addonName,
          img: `/assets/addons/${codeName}/${filename}`,
          rarity: rarity,
          killer: killerName,
          description: ''
        });
      }
      
      return addons;
    } catch (error) {
      console.error(`Error loading addons for ${killerName}:`, error);
      return [];
    }
  }

  private getKnownAddonFilesForKiller(codeName: string): string[] {
    // Map of killer code names to their actual addon files
    // Based on the actual files in your addon directories
    const addonFileMap: { [key: string]: string[] } = {
      'Aurora': [
        'iconAddon_babyTeeth.png',
        'iconAddon_bloodiedBlackHood.png',
        'iconAddon_catFigurine.png',
        'iconAddon_catsEye.png',
        'iconAddon_ceremonialCandelabrum.png',
        'iconAddon_dropOfPerfume.png',
        'iconAddon_forestStew.png',
        'iconAddon_iridescentPendant.png',
        'iconAddon_madeleinesGlove.png',
        'iconAddon_madeleinesScarf.png',
        'iconAddon_rustedNeedle.png',
        'iconAddon_sewerSludge.png',
        'iconAddon_silencingCloth.png',
        'iconAddon_souredMilk.png',
        'iconAddon_spinningTop.png',
        'iconAddon_staleBiscuit.png',
        'iconAddon_tinyFingernail.png',
        'iconAddon_toySword.png',
        'iconAddon_victorsSoldier.png',
        'iconAddon_weightyRattle.png'
      ],
      'Cannibal': [
        'iconAddon_awardwinningChili.png',
        'iconAddon_chili.png',
        'iconAddon_iridescentFlesh.png',
        'iconAddon_knifeScratches.png',
        'iconAddon_theBeastsMark.png',
        'iconAddon_theGrease.png'
      ],
      'Applepie': [
        'iconAddon_b-moviePoster.png',
        'iconAddon_blurryPhoto.png',
        'iconAddon_capturedByTheDark.png',
        'iconAddon_deviceOfUndisclosedOrigin.png',
        'iconAddon_discardedMilkCarton.png',
        'iconAddon_footprintCast.png',
        'iconAddon_frontPageArticle.png',
        'iconAddon_homemadeMask.png',
        'iconAddon_hypnotistsWatch.png',
        'iconAddon_iridescentOSSReport.png',
        'iconAddon_lastKnownRecording.png',
        'iconAddon_notebookOfTheories.png',
        'iconAddon_obscureGameCartridge.png',
        'iconAddon_puncturedEyeball.png',
        'iconAddon_rabbitsFoot.png',
        'iconAddon_serumVial.png',
        'iconAddon_sketchAttempt.png',
        'iconAddon_slashedBackpack.png',
        'iconAddon_vanishingBox.png',
        'iconAddon_victimsMap.png'
      ]
      // More killers can be added here as you discover their addon files
    };
    
    return addonFileMap[codeName] || [];
  }

  private convertFilenameToAddonName(filename: string): string {
    // Convert filename to readable addon name
    let name = filename
      .replace('iconAddon_', '')
      .replace('.png', '')
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
      .trim();
    
    // Capitalize first letter of each word
    name = name.replace(/\b\w/g, letter => letter.toUpperCase());
    
    // Handle special cases
    name = name.replace(/Oss/g, 'OSS');
    name = name.replace(/\s+/g, ' '); // Clean up multiple spaces
    
    return name;
  }

  private determineRarityFromFilename(filename: string): 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Ultra Rare' {
    const name = filename.toLowerCase();
    
    // Ultra Rare indicators
    if (name.includes('iridescent') || name.includes('iri_')) return 'Ultra Rare';
    
    // Very Rare indicators  
    if (name.includes('bloodied') || name.includes('scarf') || name.includes('ceremonial') || 
        name.includes('beast') || name.includes('grease') || name.includes('punctured') ||
        name.includes('serum') || name.includes('sketch') || name.includes('slashed') ||
        name.includes('vanishing') || name.includes('victims') || name.includes('weighty') ||
        name.includes('victor')) return 'Very Rare';
    
    // Rare indicators
    if (name.includes('spinning') || name.includes('stale') || name.includes('tiny') ||
        name.includes('toy') || name.includes('hypnotist') || name.includes('recording') ||
        name.includes('notebook') || name.includes('cartridge') || name.includes('knife')) return 'Rare';
    
    // Uncommon indicators
    if (name.includes('madeleine') || name.includes('rusted') || name.includes('sewer') ||
        name.includes('silencing') || name.includes('soured') || name.includes('discarded') ||
        name.includes('footprint') || name.includes('article') || name.includes('mask') ||
        name.includes('awarding') || name.includes('award')) return 'Uncommon';
    
    // Default to Common
    return 'Common';
  }



  async loadOfferings(): Promise<Offering[]> {
    if (this.offeringCache) return this.offeringCache;

    try {
      // Sample offering structure - you'd need to implement actual file reading
      const offeringCategories = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Visceral'];
      const allOfferings: Offering[] = [];

      // For now, return some placeholder offerings
      const sampleOfferings = [
        { name: 'Bloody Party Streamers', rarity: 'Rare' as const, type: 'Bloodpoints' as const },
        { name: 'Escape! Cake', rarity: 'Rare' as const, type: 'Bloodpoints' as const },
        { name: 'MacMillan Estate', rarity: 'Uncommon' as const, type: 'Map' as const },
        { name: 'Autohaven Wreckers', rarity: 'Uncommon' as const, type: 'Map' as const },
        { name: 'Coldwind Farm', rarity: 'Uncommon' as const, type: 'Map' as const },
        { name: 'Crotus Prenn Asylum', rarity: 'Uncommon' as const, type: 'Map' as const },
        { name: 'Haddonfield', rarity: 'Very Rare' as const, type: 'Map' as const },
        { name: 'The Game', rarity: 'Very Rare' as const, type: 'Map' as const },
      ];

      this.offeringCache = sampleOfferings.map(offering => ({
        id: generateId(offering.name),
        name: offering.name,
        img: '/assets/placeholders/Blank Offering.png', // Placeholder until proper implementation
        rarity: offering.rarity,
        type: offering.type,
        description: ''
      }));

      return this.offeringCache;
    } catch (error) {
      console.error('Error loading offerings:', error);
      return [];
    }
  }

  async loadPlatforms(): Promise<Platform[]> {
    if (this.platformCache) return this.platformCache;

    try {
      const platformFiles = [
        { filename: 'Steam.png', name: 'Steam', shortName: 'PC' },
        { filename: 'Epic Games.png', name: 'Epic Games', shortName: 'EGS' },
        { filename: 'Playstation.png', name: 'PlayStation', shortName: 'PS' },
        { filename: 'XBOX.png', name: 'Xbox', shortName: 'XB' },
        { filename: 'Switch.png', name: 'Nintendo Switch', shortName: 'NSW' },
        { filename: 'Windows.png', name: 'Windows Store', shortName: 'WIN' },
      ];

      this.platformCache = platformFiles.map(platform => ({
        id: generateId(platform.filename),
        name: platform.name,
        img: `/assets/platforms/${platform.filename}`,
        shortName: platform.shortName
      }));

      return this.platformCache;
    } catch (error) {
      console.error('Error loading platforms:', error);
      return [];
    }
  }

  // Method to clear caches (useful for development)
  clearCache(): void {
    this.killerCache = null;
    this.perkCache = null;
    this.addonCache.clear();
    this.offeringCache = null;
    this.platformCache = null;
  }
}

// Export a singleton instance
export const assetService = new AssetService(); 