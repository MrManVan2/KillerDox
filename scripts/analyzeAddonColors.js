import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rarity mapping based on dominant colors
const RARITY_COLORS = {
  PINK: 'Iridescent',      // Most rare - magenta/pink
  PURPLE: 'Very Rare',     // Second most rare - purple  
  BLUE: 'Rare',           // Third most rare - blue
  YELLOW: 'Uncommon',      // Fourth most rare - yellow/gold
  BROWN: 'Common'          // Least rare - brown/bronze
};

// More precise color detection based on DBD's actual color scheme
function detectRarityFromPixels(pixels) {
  if (pixels.length === 0) return 'BROWN';
  
  // Count colors that match each rarity
  const colorCounts = {
    PINK: 0,
    PURPLE: 0, 
    BLUE: 0,
    YELLOW: 0,
    BROWN: 0
  };
  
  pixels.forEach(([r, g, b]) => {
    // Skip very dark or very light pixels (likely main image content)
    const brightness = (r + g + b) / 3;
    if (brightness < 30 || brightness > 230) return;
    
    // Convert to HSV for better color detection
    const [h, s, v] = rgbToHsv(r, g, b);
    
    // Skip very desaturated colors
    if (s < 0.3) {
      colorCounts.BROWN++;
      return;
    }
    
    // Pink/Magenta (Iridescent) - 280-340 hue range
    if ((h >= 280 && h <= 340) && s >= 0.4 && v >= 0.3) {
      colorCounts.PINK++;
    }
    // Purple (Very Rare) - 240-280 hue range  
    else if ((h >= 240 && h <= 280) && s >= 0.4 && v >= 0.3) {
      colorCounts.PURPLE++;
    }
    // Blue (Rare) - 180-240 hue range
    else if ((h >= 180 && h <= 240) && s >= 0.4 && v >= 0.3) {
      colorCounts.BLUE++;
    }
    // Yellow/Gold (Uncommon) - 40-70 hue range
    else if ((h >= 40 && h <= 70) && s >= 0.4 && v >= 0.4) {
      colorCounts.YELLOW++;
    }
    // Brown/Orange (Common) - everything else or low saturation
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
  
  // Require a minimum threshold for rare colors
  const totalPixels = pixels.length;
  const percentage = maxCount / totalPixels;
  
  // If we don't have enough colored pixels, default to common
  if (dominantColor !== 'BROWN' && percentage < 0.1) {
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

// Analyze image to get rarity-indicating colors from border/background
async function analyzeImageColor(imagePath) {
  try {
    const { data, info } = await sharp(imagePath)
      .resize(64, 64) // Resize for faster processing
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    const pixels = [];
    const channels = info.channels;
    const width = 64;
    const height = 64;
    
    // Sample pixels from border areas and corners where rarity colors are typically found
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Focus on border pixels and corner areas
        const isBorder = x < 8 || x >= width - 8 || y < 8 || y >= height - 8;
        const isCorner = (x < 16 && y < 16) || (x >= width - 16 && y < 16) || 
                        (x < 16 && y >= height - 16) || (x >= width - 16 && y >= height - 16);
        
        if (isBorder || isCorner) {
          const pixelIndex = (y * width + x) * channels;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];
          const a = data[pixelIndex + 3] || 255;
          
          // Skip transparent pixels
          if (a > 128) {
            pixels.push([r, g, b]);
          }
        }
      }
    }

    if (pixels.length === 0) {
      return 'BROWN'; // Default if no valid pixels
    }

    const colorCategory = detectRarityFromPixels(pixels);
    return colorCategory;
  } catch (error) {
    console.error(`Error analyzing ${imagePath}:`, error.message);
    return 'BROWN'; // Default on error
  }
}

// Process all addon files and generate a mapping
async function generateAddonRarityMapping() {
  const addonMapping = {};
  const addonsDir = path.join(process.cwd(), 'public/assets/addons');
  
  console.log('🎨 Analyzing addon colors to determine rarity...\n');
  
  // Process general addons
  const generalAddons = fs.readdirSync(addonsDir)
    .filter(file => file.endsWith('.png'));
  
  console.log('📁 Processing general addons...');
  for (const filename of generalAddons) {
    const filePath = path.join(addonsDir, filename);
    const colorCategory = await analyzeImageColor(filePath);
    const rarity = RARITY_COLORS[colorCategory];
    
    addonMapping[filename] = {
      rarity,
      colorCategory,
      path: `/assets/addons/${filename}`
    };
    
    console.log(`  ${filename} → ${rarity} (${colorCategory})`);
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
        const colorCategory = await analyzeImageColor(filePath);
        const rarity = RARITY_COLORS[colorCategory];
        
        const key = `${folder}/${filename}`;
        addonMapping[key] = {
          rarity,
          colorCategory,
          path: `/assets/addons/${folder}/${filename}`
        };
        
        console.log(`  ${filename} → ${rarity} (${colorCategory})`);
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
  Object.values(addonMapping).forEach(addon => {
    rarityCount[addon.rarity] = (rarityCount[addon.rarity] || 0) + 1;
  });
  
  console.log('\n📈 Rarity Distribution:');
  Object.entries(rarityCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([rarity, count]) => {
      console.log(`  ${rarity}: ${count} addons`);
    });
}

// Run the analysis
generateAddonRarityMapping()
  .then(() => {
    console.log('\n🎉 Color analysis complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  });

export { generateAddonRarityMapping, analyzeImageColor, RARITY_COLORS }; 