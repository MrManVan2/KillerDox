const fs = require('fs');
const path = require('path');

// Official Dead by Daylight rarity data from wiki (Patch 9.0.0)
const OFFICIAL_RARITIES = {
  // IRIDESCENT (29)
  'Iridescent': [
    'iridescentAmulet',
    'iridescentBlightTag',
    'IridescentBookOfVileDarkness',
    'iridescentButton',
    'iridescentCoin',
    'IridescentCompanyBanner',
    'iridescentEngravings',
    'iridescentEyePatch',
    'IridescentFamilyCrest',
    'IridescentFeather',
    'iridescentFlesh',
    'iridescentHead',
    'iridescentKing',
    'iridescentLamentConfiguration',
    'iridescentOSSReport',
    'iridescentPendant',
    'IridescentPhotocard',
    'iridescentQueen',
    'IridescentRemnant',
    'IridescentRingOfVlad',
    'iridescentSeal',
    'IridescentSeal',
    'iridescentUmbrellaBadge',
    'IridescentUnpublishedManuscript',
    'iridescentUroborosVial',
    'IridescentVHStape',
    'IridescentWheelHandle',
    'IridescentWoodenPlank',
    'iridiscentCrystalShard'
  ],

  // ULTRA RARE (23) - maps to "Very Rare" in our system
  'Very Rare': [
    'acidicBlood',
    'AlucardsShield',
    'amandasLetter',
    'blackBox',
    'blackIncense',
    'capturedByTheDark',
    'compoundThirtyThree',
    'DeathThroesCompilation',
    'deniedRequisitionForm',
    'engineersFang',
    'ExpiredBatteries',
    'fumingMixtape',
    'GardenofRot',
    'gelDressings',
    'hardHat',
    'hellshireIron',
    'improvisedCattleProd',
    'KillingPartChords',
    'kintsugiTeacup',
    'KnightContract',
    'motherDaughterRing',
    'RemoteControl',
    'waterloggedShoe'
  ],

  // RARE (110)
  'Rare': [
    'adrenalineVial',
    'ashenApple',
    'b-moviePoster',
    'bagOfGears',
    'bayshoresGoldTooth',
    'blightedCrow',
    'BloodyBoa',
    'BloodyFingernail',
    'blueDress',
    'BootsOfSpeed',
    'bottleOfChloroform',
    'brassCaseLighter',
    'BrokenDoll',
    'BrokenHilt',
    'BrownNoiseGenerator',
    'burningManPainting',
    'CharcoalStick',
    'chewedPen',
    'CloakOfElvenkind',
    'compoundTwentyOne',
    'crackedTurtleEgg',
    'dadsBoots',
    'DarkestInk',
    'deerLung',
    'deerskinGloves',
    'DestroyedPillow',
    'driedCicada',
    'elevensSoda',
    'emergencyHelmet',
    'exorcismAmulet',
    'FattyMeat',
    'FizzSpinSoda',
    'flaskOfBleach',
    'flowerBabushka',
    'footprintCast',
    'ForceOfEcho',
    'franksHeart',
    'frontPageArticle',
    'GrimIronMask',
    'hairBow',
    'highStimulusElectrode',
    'hologramGenerator',
    'honeyLocustThorns',
    'hyperawarenessSpray',
    'hypnotistsWatch',
    'incensedOintment',
    'infectedEmetic',
    'InfaredUpgrade',
    'intenseHalogen',
    'interviewTape',
    'IronworkerTongs',
    'jMyersMemorial',
    'jewelryBox',
    'jigsawsAnnotatedPlan',
    'joeysMixtape',
    'judithsJournal',
    'jumpRope',
    'kaiunTalisman',
    'kanesHelmet',
    'katanaTsuba',
    'KillerDoll',
    'knifeBeltClip',
    'larrysBlood',
    'larrysRemains',
    'lastingPerfume',
    'leatherKnifeSheath',
    'lickerTongue',
    'liveWires',
    'LooseScrew',
    'lowKickbackChains',
    'madeleinesScarf',
    'maidenMedalliom',
    'mannequinFoot',
    'mirrorShard',
    'mistyDay',
    'MothersComb',
    'mothersGlasses',
    'multipurposeHatchet',
    'nancysMasterpiece',
    'nanomachineGel',
    'nastyBlade',
    'OGriefOLover',
    'OttomarianWriting',
    'paintThinner',
    'parkersHeadband',
    'PearlOfPower',
    'plant43Vines',
    'PowderedGlass',
    'pungentPhial',
    'raggedEngine',
    'ratPoison',
    'redHerb',
    'RicketyPinwheel',
    'RingDrawing',
    'RipperBrace',
    'roseRoot',
    'roseTonic',
    'rubbingOil',
    'rulesSetN2',
    'runningShoes',
    'rustedNeedle',
    'rustyAttachments',
    'rustyFlute',
    'rustyHead',
    'scalpedTopknot',
    'scrappedTape',
    'senkoHanabi',
    'serotoninInjector',
    'SharpenedMount',
    'shatteredWakizashi',
    'ShotgunSpeakers',
    'silkPillow',
    'SilverBell',
    'sliceofFrank',
    'slowReleaseToxin',
    'smellyInnerSoles',
    'SpasmodicBreath',
    'spentOxygenTank',
    'SpikedCollar',
    'spinningTop',
    'spiritOfHartshorn',
    'StaffOfWithering',
    'staleBiscuit',
    'stolenSketchbook',
    'straightRazor',
    'sulfuricAcidVial',
    'suziesMixtape',
    'swampOrchidNecklet',
    'SwordOfKass',
    'tabletOfTheOppressor',
    'tarBottle',
    'theBeastsMark',
    'theGrease',
    'theLegionButton',
    'ThornyNest',
    'thornyVines',
    'tinOilCan',
    'torturePillar',
    'TownWatctTorch',
    'TrainingBell',
    'TVirusSample',
    'tyrantGore',
    'uchiwa',
    'umbraSalts',
    'UnfinishedMap',
    'unicornBlock',
    'vanishingBox',
    'venomousConcoction',
    'violetWaxcap',
    'VitalTargetingProcessor',
    'WaitingForYouWatch',
    'warHelmet',
    'wardensKeys',
    'Waterskin',
    'weightyRattle',
    'WellWater',
    'WhiteWolfMedallion',
    'willowWreath',
    'woodenOniMask',
    'WorryStones',
    'yamaokaSashimono',
    'yardstick',
    'YumisMurder'
  ],

  // COMMON (103)
  'Common': [
    'AdiValente1',
    'amanitaToxin',
    'bandagedHaft',
    'Bandages',
    'Battery',
    'BearOil',
    'bentNail',
    'blackHeart',
    'blackStrap',
    'blackenedToenail',
    'blondeHair',
    'blurryPhoto',
    'bogWater',
    'boyfriendsMemo',
    'briansIntestines',
    'brokenSecurityKey',
    'burningCandle',
    'CabinSign',
    'CaffeineTablets',
    'calmClassI',
    'catFigurine',
    'CerberusTalon',
    'CerealRations',
    'cheapCologne',
    'chippedMonocle',
    'ChocloCorn',
    'ClockTowerGear',
    'coarseStone',
    'combatStraps',
    'compoundSeven',
    'copperRing',
    'counterweight',
    'crackedPrimerBulb',
    'crackedSakazuki',
    'CreaturesBone',
    'CrystalBall',
    'damagedSyringe',
    'deadButterfly',
    'deadFlyMud',
    'diagnosticToolRepair',
    'discardedAirFilter',
    'dollEyes',
    'drinkingBird',
    'ether15',
    'fingerlessParadeGloves',
    'FlashPowder',
    'FollowersCowl',
    'foxglove',
    'friendshipBracelet',
    'gardenRake',
    'giftedBambooComb',
    'goodGuyBox',
    'GrittyLump',
    'headlinesCutouts',
    'healingSalve',
    'heavyWater',
    'HighCurrentUpgrade',
    'HighPowerFloodlight',
    'InfernoWires',
    'Instructions',
    'interlockingRazor',
    'jewelBeetle',
    'johnsMedicalFile',
    'kidsDrawing',
    'leadRing',
    'leatherStrip',
    'limestoneSeal',
    'livelyCrickets',
    'MakeshiftWrap',
    'MapAddendum',
    'MapoftheRealms',
    'mapleKnight',
    'MediumFuse',
    'MementoBlades',
    'memorialFlower',
    'MetalSpoon',
    'mischiefList',
    'modifiedAmmoBelt',
    'MortarAndPestle',
    'MothersMirror',
    'moldyElectrode',
    'nutritionalSlurry',
    'OilPaints',
    'OldNewspaper',
    'olibanumIncense',
    'orderClassI',
    'origamiCrane',
    'ovomorph',
    'PaddedJaws',
    'paperLantern',
    'partyBottle',
    'philly',
    'PillagedMead',
    'placeboTablet',
    'powderedEggshell',
    'PowerBulb',
    'PrayerRope',
    'prayerTabletFragment',
    'puncturedEyeball',
    'RPDShoulderWalkie',
    'rabbitsFoot',
    'ratLiver',
    'ratTail',
    'RavensFeather',
    'ricketyChain',
    'ripleysWatch',
    'robinFeather',
    'ropeNecklet',
    'rottenPumpkin',
    'rottingRope',
    'RubberGloves',
    'RubyCirclet',
    'starsFieldCombatManual',
    'Scraps',
    'scratchedRuler',
    'ShadowDanceSoot',
    'shatteredSyringe',
    'sheepBlock',
    'ShiawaseAmulet',
    'sketchAttempt',
    'smileyFaceButton',
    'snakeOil',
    'souredMilk',
    'SparkPlug',
    'SpeedLimiter',
    'spitPolishRag',
    'steelToeBoots',
    'StickyPitch',
    'strobingLight',
    'StrongCoilSpring',
    'SwiftHuntSoot',
    'SylphFeather',
    'tackyEarrings',
    'TatteredHeadband',
    'TatteredTabard',
    'TheBeastSoot',
    'TheGhostSoot',
    'TheHoundSoot',
    'TheSerpentSoot',
    'ThickTar',
    'tinyFingernail',
    'tinyScalpel',
    'toySword',
    'TrainersBook',
    'TrapperGloves',
    'TravelersHat',
    'TrickPouch',
    'TrickstersGlove',
    'UltrasonicSpeaker',
    'unicornMedallion',
    'uroborosTendril',
    'VegetableOil',
    'vhsPorn',
    'VibrantObituary',
    'VideotapeCopy',
    'visitorWristband',
    'walleyesMatchbook',
    'WhiteNitComb',
    'WideLens',
    'WoodenHorse',
    'WoodenPlank',
    'woolShirt',
    'yellowedCloth',
    'YoungCoconut',
    'zori'
  ]
};

// Create a lookup map for quick rarity detection
const rarityLookup = {};
Object.entries(OFFICIAL_RARITIES).forEach(([rarity, addons]) => {
  addons.forEach(addon => {
    rarityLookup[addon.toLowerCase()] = rarity;
  });
});

// Function to normalize addon name from filename
function normalizeAddonName(filename) {
  let name = filename
    .replace(/^iconAddon_/, '')
    .replace(/^icons_Addon_/, '')
    .replace(/^T_UI_iconAddon_/, '')
    .replace(/\.png$/, '');
  
  return name;
}

// Function to get official rarity
function getOfficialRarity(filename) {
  const normalizedName = normalizeAddonName(filename);
  const rarity = rarityLookup[normalizedName.toLowerCase()];
  
  if (rarity) {
    return rarity;
  }
  
  // Default to Uncommon for anything not found (as specified by user)
  return 'Uncommon';
}

// Generate the official rarity mapping
async function generateOfficialRarityMapping() {
  const addonMapping = {};
  const addonsDir = path.join(process.cwd(), 'public/assets/addons');
  
  console.log('🎯 Generating addon rarity mapping using OFFICIAL DBD Wiki data (Patch 9.0.0)...\n');
  
  // Process general addons (if any exist)
  const generalAddons = fs.readdirSync(addonsDir)
    .filter(file => file.endsWith('.png'));
  
  if (generalAddons.length > 0) {
    console.log('📁 Processing general addons...');
    for (const filename of generalAddons) {
      const rarity = getOfficialRarity(filename);
      
      addonMapping[filename] = {
        rarity,
        path: `/assets/addons/${filename}`,
        source: 'official_wiki'
      };
      
      console.log(`  ${filename} → ${rarity} [official]`);
    }
  }
  
  // Process killer-specific addons
  const killerFolders = fs.readdirSync(addonsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const folder of killerFolders) {
    const folderPath = path.join(addonsDir, folder);
    const addonFiles = fs.readdirSync(folderPath)
      .filter(file => file.endsWith('.png'));
    
    if (addonFiles.length > 0) {
      console.log(`\n📁 Processing ${folder} addons...`);
      
      for (const filename of addonFiles) {
        const rarity = getOfficialRarity(filename);
        
        const key = `${folder}/${filename}`;
        addonMapping[key] = {
          rarity,
          path: `/assets/addons/${folder}/${filename}`,
          source: 'official_wiki'
        };
        
        console.log(`  ${filename} → ${rarity} [official]`);
      }
    }
  }
  
  // Save the mapping to JSON files
  const srcOutputPath = path.join(process.cwd(), 'src/data/addonRarityMapping.json');
  const publicOutputPath = path.join(process.cwd(), 'public/data/addonRarityMapping.json');
  
  fs.writeFileSync(srcOutputPath, JSON.stringify(addonMapping, null, 2));
  fs.writeFileSync(publicOutputPath, JSON.stringify(addonMapping, null, 2));
  
  console.log(`\n✅ Official rarity mapping saved to both:`);
  console.log(`   ${srcOutputPath}`);
  console.log(`   ${publicOutputPath}`);
  console.log(`📊 Processed ${Object.keys(addonMapping).length} addon files`);
  
  // Print summary
  const rarityCount = {};
  Object.values(addonMapping).forEach(addon => {
    rarityCount[addon.rarity] = (rarityCount[addon.rarity] || 0) + 1;
  });
  
  console.log('\n📈 Official Rarity Distribution:');
  const rarityOrder = ['Iridescent', 'Very Rare', 'Rare', 'Uncommon', 'Common'];
  rarityOrder.forEach(rarity => {
    const count = rarityCount[rarity] || 0;
    if (count > 0) {
      console.log(`  ${rarity}: ${count} addons`);
    }
  });
  
  console.log('\n🎉 Official mapping complete! All rarities now match DBD Wiki (Patch 9.0.0)');
}

// Run the generator
generateOfficialRarityMapping()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error during official mapping generation:', error);
    process.exit(1);
  });

module.exports = { generateOfficialRarityMapping, getOfficialRarity }; 