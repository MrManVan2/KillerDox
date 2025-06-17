import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dead by Daylight rarity color mapping
const RARITY_COLORS = {
  PINK: 'Iridescent',      // Most rare
  PURPLE: 'Very Rare',
  BLUE: 'Rare', 
  YELLOW: 'Uncommon',
  BROWN: 'Common'          // Least rare
};

// Hybrid approach: filename-based detection for obvious cases
function detectRarityFromFilename(filename) {
  const lowerName = filename.toLowerCase();
  
  // Clear filename indicators
  if (lowerName.includes('iridescent')) {
    return 'PINK';
  }
  
  // Some common "very rare" patterns
  const veryRarePatterns = [
    'tombstone', 'fragrant', 'memorial', 'twisted', 'scratched',
    'compound', 'venomous', 'glowing', 'blighted'
  ];
  
  if (veryRarePatterns.some(pattern => lowerName.includes(pattern))) {
    return 'PURPLE';
  }
  
  // Some common "rare" patterns
  const rarePatterns = [
    'bloodied', 'damaged', 'cracked', 'broken', 'torn', 'shattered'
  ];
  
  if (rarePatterns.some(pattern => lowerName.includes(pattern))) {
    return 'BLUE';
  }
  
  return null; // Use color detection
}

// More relaxed color detection
function detectRarityFromPixels(pixels) {
  if (pixels.length === 0) return 'BROWN';
  
  const colorCounts = {
    PINK: 0,
    PURPLE: 0, 
    BLUE: 0,
    YELLOW: 0,
    BROWN: 0
  };
  
  pixels.forEach(([r, g, b]) => {
    // Skip very dark pixels
    const brightness = (r + g + b) / 3;
    if (brightness < 40) return;
    
    // Convert to HSV for better color detection
    const [h, s, v] = rgbToHsv(r, g, b);
    
    // More relaxed saturation threshold
    if (s < 0.25 || v < 0.25) {
      colorCounts.BROWN++;
      return;
    }
    
    // Pink/Magenta detection (Iridescent) - broader but still focused
    if ((h >= 290 && h <= 340) || (h >= 0 && h <= 20)) {
      colorCounts.PINK++;
    }
    // Purple (Very Rare)
    else if (h >= 240 && h <= 289) {
      colorCounts.PURPLE++;
    }
    // Blue (Rare)
    else if (h >= 180 && h <= 239) {
      colorCounts.BLUE++;
    }
    // Yellow/Gold (Uncommon)
    else if (h >= 40 && h <= 80) {
      colorCounts.YELLOW++;
    }
    // Brown/Orange (Common)
    else if (h >= 15 && h <= 39) {
      colorCounts.BROWN++;
    }
    // Everything else defaults to common
    else {
      colorCounts.BROWN++;
    }
  });
  
  // Find the color with the highest count
  let maxCount = 0;
  let dominantColor = 'BROWN';
  
  Object.entries(colorCounts).forEach(([color, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = color;
    }
  });
  
  // Lower threshold for rare colors - need at least 8% to be considered rare
  const totalPixels = pixels.length;
  const percentage = maxCount / totalPixels;
  
  if (dominantColor !== 'BROWN' && percentage < 0.08) {
    return 'BROWN';
  }
  
  return dominantColor;
}

// Convert RGB to HSV
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  let s = max === 0 ? 0 : diff / max;
  let v = max;

  if (diff !== 0) {
    switch (max) {
      case r: h = ((g - b) / diff) % 6; break;
      case g: h = (b - r) / diff + 2; break;
      case b: h = (r - g) / diff + 4; break;
    }
  }
  
  h = h * 60;
  if (h < 0) h += 360;
  
  return [h, s, v];
}

// Image analysis as fallback
async function analyzeImageColor(imagePath) {
  try {
    const { data, info } = await sharp(imagePath)
      .resize(64, 64)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    const pixels = [];
    const channels = info.channels;
    const width = 64;
    const height = 64;
    
    // Sample from border areas
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isBorder = x < 8 || x >= width - 8 || y < 8 || y >= height - 8;
        
        if (isBorder) {
          const pixelIndex = (y * width + x) * channels;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];
          const a = data[pixelIndex + 3] || 255;
          
          if (a > 150) {
            pixels.push([r, g, b]);
          }
        }
      }
    }

    if (pixels.length === 0) {
      return 'BROWN';
    }

    const colorCategory = detectRarityFromPixels(pixels);
    return colorCategory;
  } catch (error) {
    console.error(`Error analyzing ${imagePath}:`, error.message);
    return 'BROWN';
  }
}

// Process all addon files and generate a mapping
async function generateAddonRarityMapping() {
  const addonMapping = {};
  const addonsDir = path.join(process.cwd(), 'public/assets/addons');
  
  console.log('🎨 Analyzing addon colors to determine rarity (hybrid approach)...\n');
  
  // Process general addons
  const generalAddons = fs.readdirSync(addonsDir)
    .filter(file => file.endsWith('.png'));
  
  console.log('📁 Processing general addons...');
  for (const filename of generalAddons) {
    const filePath = path.join(addonsDir, filename);
    
    // Try filename detection first
    let colorCategory = detectRarityFromFilename(filename);
    let detectionMethod = 'filename';
    
    // Fall back to color analysis if filename doesn't match
    if (!colorCategory) {
      colorCategory = await analyzeImageColor(filePath);
      detectionMethod = 'color';
    }
    
    const rarity = RARITY_COLORS[colorCategory];
    
    addonMapping[filename] = {
      rarity,
      colorCategory,
      path: `/assets/addons/${filename}`,
      detectionMethod
    };
    
    console.log(`  ${filename} → ${rarity} (${colorCategory}) [${detectionMethod}]`);
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
        const filePath = path.join(folderPath, filename);
        
        // Try filename detection first
        let colorCategory = detectRarityFromFilename(filename);
        let detectionMethod = 'filename';
        
        // Fall back to color analysis if filename doesn't match
        if (!colorCategory) {
          colorCategory = await analyzeImageColor(filePath);
          detectionMethod = 'color';
        }
        
        const rarity = RARITY_COLORS[colorCategory];
        
        const key = `${folder}/${filename}`;
        addonMapping[key] = {
          rarity,
          colorCategory,
          path: `/assets/addons/${folder}/${filename}`,
          detectionMethod
        };
        
        console.log(`  ${filename} → ${rarity} (${colorCategory}) [${detectionMethod}]`);
      }
    }
  }
  
  // Save the mapping to a JSON file
  const outputPath = path.join(process.cwd(), 'src/data/addonRarityMapping.json');
  fs.writeFileSync(outputPath, JSON.stringify(addonMapping, null, 2));
  
  console.log(`\n✅ Rarity mapping saved to ${outputPath}`);
  console.log(`📊 Processed ${Object.keys(addonMapping).length} addon files`);
  
  // Print summary
  const rarityCount = {};
  const methodCount = {};
  Object.values(addonMapping).forEach(addon => {
    rarityCount[addon.rarity] = (rarityCount[addon.rarity] || 0) + 1;
    methodCount[addon.detectionMethod] = (methodCount[addon.detectionMethod] || 0) + 1;
  });
  
  console.log('\n📈 Rarity Distribution:');
  Object.entries(rarityCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([rarity, count]) => {
      console.log(`  ${rarity}: ${count} addons`);
    });
  
  console.log('\n🔍 Detection Method Distribution:');
  Object.entries(methodCount).forEach(([method, count]) => {
    console.log(`  ${method}: ${count} addons`);
  });
  
  console.log('\n🎉 Hybrid analysis complete!');
}

// Run the analysis
generateAddonRarityMapping()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  });

export { generateAddonRarityMapping, analyzeImageColor, RARITY_COLORS }; 