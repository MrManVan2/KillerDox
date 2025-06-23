const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Exact Dead by Daylight rarity color codes
const RARITY_COLORS = {
  '#d41b50': 'Iridescent',    // Most rare (pink)
  '#77378c': 'Very Rare',     // Second (purple) 
  '#3b66a4': 'Rare',          // Third (blue)
  '#408830': 'Uncommon',      // Fourth (green)
  '#674f3d': 'Common'         // Fifth (brown)
};

// Convert hex to RGB for comparison
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Convert RGB to hex for comparison
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Check if a pixel color matches any of our target colors (with small tolerance for compression artifacts)
function matchesRarityColor(r, g, b, tolerance = 10) {
  for (const [hexColor, rarity] of Object.entries(RARITY_COLORS)) {
    const target = hexToRgb(hexColor);
    
    // Check if RGB values are within tolerance
    if (Math.abs(r - target.r) <= tolerance &&
        Math.abs(g - target.g) <= tolerance &&
        Math.abs(b - target.b) <= tolerance) {
      return rarity;
    }
  }
  return null;
}

// Analyze image for exact color matches
async function analyzeImageForExactColors(imagePath) {
  try {
    // Load image and get raw pixel data
    const { data, info } = await sharp(imagePath)
      .resize(128, 128) // Reasonable size for analysis
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const { width, height, channels } = info;
    
    // Count matches for each rarity color
    const colorCounts = {};
    let totalPixels = 0;
    
    // Sample pixels throughout the image, focusing on edges where rarity borders appear
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        totalPixels++;
        
        // Check if this pixel matches any rarity color
        const matchedRarity = matchesRarityColor(r, g, b);
        if (matchedRarity) {
          colorCounts[matchedRarity] = (colorCounts[matchedRarity] || 0) + 1;
        }
      }
    }
    
    // Find the rarity with the most matching pixels
    let bestRarity = 'Common'; // Default fallback
    let maxCount = 0;
    
    for (const [rarity, count] of Object.entries(colorCounts)) {
      if (count > maxCount) {
        maxCount = count;
        bestRarity = rarity;
      }
    }
    
    // Only return a detection if we found a reasonable number of matching pixels
    const percentage = (maxCount / totalPixels) * 100;
    
    return {
      rarity: maxCount > 5 ? bestRarity : 'Common', // Need at least 5 matching pixels
      confidence: percentage,
      colorCounts,
      method: maxCount > 5 ? 'exact_color_match' : 'default_common'
    };
    
  } catch (error) {
    console.error(`Error analyzing ${imagePath}:`, error.message);
    return {
      rarity: 'Common',
      confidence: 0,
      colorCounts: {},
      method: 'error_fallback'
    };
  }
}

// Generate rarity mapping using exact color detection
async function generateExactColorRarityMapping() {
  const addonMapping = {};
  const addonsDir = path.join(process.cwd(), '..', 'public', 'assets', 'Icons', 'Addons');
  
  console.log('🎯 Analyzing addon colors using EXACT hex color codes...\n');
  console.log('Target colors:');
  Object.entries(RARITY_COLORS).forEach(([hex, rarity]) => {
    console.log(`  ${hex} → ${rarity}`);
  });
  console.log('');
  
  let processedCount = 0;
  const detectionStats = {
    'exact_color_match': 0,
    'default_common': 0,
    'error_fallback': 0
  };
  
  // Process killer-specific addon folders (including Event)
  const killerFolders = fs.readdirSync(addonsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== '.DS_Store')
    .map(dirent => dirent.name);
  
  for (const folder of killerFolders) {
    const folderPath = path.join(addonsDir, folder);
    const addonFiles = fs.readdirSync(folderPath)
      .filter(file => file.endsWith('.png'));
    
    if (addonFiles.length > 0) {
      console.log(`\n📁 Processing ${folder} addons...`);
      
      for (const filename of addonFiles) {
        const imagePath = path.join(folderPath, filename);
        const analysis = await analyzeImageForExactColors(imagePath);
        
        const addonName = path.basename(filename, '.png');
        const key = `${folder}/${addonName}`;
        
        addonMapping[key] = {
          name: addonName,
          rarity: analysis.rarity,
          image: `/assets/Icons/Addons/${folder}/${filename}`,
          killer: folder,
          source: 'exact_color_detection',
          confidence: analysis.confidence,
          method: analysis.method
        };
        
        detectionStats[analysis.method]++;
        processedCount++;
        
        console.log(`  ${filename} → ${analysis.rarity} [${analysis.confidence.toFixed(1)}% confidence]`);
      }
    }
  }
  
  // Save the mapping to JSON files
  const srcOutputPath = path.join(process.cwd(), '..', 'src', 'data', 'addonRarityMapping.json');
  const publicOutputPath = path.join(process.cwd(), '..', 'public', 'data', 'addonRarityMapping.json');
  
  fs.writeFileSync(srcOutputPath, JSON.stringify(addonMapping, null, 2));
  fs.writeFileSync(publicOutputPath, JSON.stringify(addonMapping, null, 2));
  
  console.log(`\n✅ Exact color rarity mapping saved to both:`);
  console.log(`   ${srcOutputPath}`);
  console.log(`   ${publicOutputPath}`);
  console.log(`📊 Processed ${processedCount} addon files`);
  
  // Print detection method stats
  console.log('\n📊 Detection Methods:');
  Object.entries(detectionStats).forEach(([method, count]) => {
    console.log(`  ${method}: ${count} addons`);
  });
  
  // Print rarity distribution
  const rarityCount = {};
  Object.values(addonMapping).forEach(addon => {
    rarityCount[addon.rarity] = (rarityCount[addon.rarity] || 0) + 1;
  });
  
  console.log('\n📈 Exact Color Detection Results:');
  const rarityOrder = ['Iridescent', 'Very Rare', 'Rare', 'Uncommon', 'Common'];
  rarityOrder.forEach(rarity => {
    const count = rarityCount[rarity] || 0;
    if (count > 0) {
      console.log(`  ${rarity}: ${count} addons`);
    }
  });
  
  console.log('\n🎉 Exact color analysis complete!');
}

// Run the exact color analyzer
generateExactColorRarityMapping()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error during exact color analysis:', error);
    process.exit(1);
  });

module.exports = { generateExactColorRarityMapping, analyzeImageForExactColors }; 