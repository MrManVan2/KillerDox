import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Updated color thresholds and mappings for better detection
const RARITY_COLORS = {
  'Iridescent': { hue: [300, 360], saturation: [0.3, 1.0], value: [0.3, 1.0] }, // Pink/Magenta
  'Very Rare': { hue: [240, 300], saturation: [0.3, 1.0], value: [0.3, 1.0] }, // Purple  
  'Rare': { hue: [180, 240], saturation: [0.3, 1.0], value: [0.3, 1.0] }, // Blue
  'Uncommon': { hue: [45, 75], saturation: [0.3, 1.0], value: [0.3, 1.0] }, // Yellow
  'Common': { hue: [15, 45], saturation: [0.2, 1.0], value: [0.2, 0.8] }, // Brown/Orange
};

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;
  
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }
  
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  return [h, s, v];
}

function matchColorToRarity(r, g, b) {
  const [h, s, v] = rgbToHsv(r, g, b);
  
  // Check if the color matches any rarity range
  for (const [rarity, ranges] of Object.entries(RARITY_COLORS)) {
    const hueInRange = (h >= ranges.hue[0] && h <= ranges.hue[1]) || 
                       (ranges.hue[0] > ranges.hue[1] && (h >= ranges.hue[0] || h <= ranges.hue[1]));
    const satInRange = s >= ranges.saturation[0] && s <= ranges.saturation[1];
    const valInRange = v >= ranges.value[0] && v <= ranges.value[1];
    
    if (hueInRange && satInRange && valInRange) {
      return rarity;
    }
  }
  
  return 'Common'; // Default fallback
}

async function analyzeAddonImage(imagePath) {
  try {
    const image = sharp(imagePath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    
    const { width, height, channels } = info;
    const pixelData = [];
    
    // Sample border pixels (top, bottom, left, right edges)
    const samplePositions = [
      // Top edge
      ...Array.from({ length: Math.min(width, 20) }, (_, i) => ({ x: i, y: 0 })),
      // Bottom edge  
      ...Array.from({ length: Math.min(width, 20) }, (_, i) => ({ x: i, y: height - 1 })),
      // Left edge
      ...Array.from({ length: Math.min(height, 20) }, (_, i) => ({ x: 0, y: i })),
      // Right edge
      ...Array.from({ length: Math.min(height, 20) }, (_, i) => ({ x: width - 1, y: i })),
      // Corner samples for better detection
      ...Array.from({ length: 5 }, (_, i) => ({ x: i, y: i })),
      ...Array.from({ length: 5 }, (_, i) => ({ x: width - 1 - i, y: i })),
    ];
    
    for (const pos of samplePositions) {
      const pixelIndex = (pos.y * width + pos.x) * channels;
      if (pixelIndex + 2 < data.length) {
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        pixelData.push({ r, g, b });
      }
    }
    
    // Analyze colors and find the most common rarity
    const rarityVotes = {};
    for (const pixel of pixelData) {
      const rarity = matchColorToRarity(pixel.r, pixel.g, pixel.b);
      rarityVotes[rarity] = (rarityVotes[rarity] || 0) + 1;
    }
    
    // Return the rarity with the most votes (excluding Common unless it's the only one)
    const nonCommonRarities = Object.entries(rarityVotes).filter(([rarity]) => rarity !== 'Common');
    if (nonCommonRarities.length > 0) {
      return nonCommonRarities.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }
    
    return 'Common';
  } catch (error) {
    console.error(`Error analyzing ${imagePath}:`, error.message);
    return 'Common';
  }
}

async function processAddonFolder(folderPath, killerName) {
  console.log(`\nProcessing ${killerName}...`);
  
  try {
    const files = await fs.promises.readdir(folderPath);
    const addonData = {};
    
    for (const file of files) {
      if (file.toLowerCase().endsWith('.png')) {
        const filePath = path.join(folderPath, file);
        const addonName = path.basename(file, '.png');
        const rarity = await analyzeAddonImage(filePath);
        
        addonData[addonName] = {
          name: addonName,
          rarity: rarity,
          image: `/assets/Icons/Addons/${killerName}/${file}`,
          killer: killerName
        };
        
        console.log(`  ${addonName}: ${rarity}`);
      }
    }
    
    return addonData;
  } catch (error) {
    console.error(`Error processing ${killerName}:`, error.message);
    return {};
  }
}

async function generateRarityMapping() {
  const addonsBasePath = path.join(process.cwd(), '..', 'public', 'assets', 'Icons', 'Addons');
  const allAddonData = {};
  const rarityStats = {};
  
  try {
    const folders = await fs.promises.readdir(addonsBasePath);
    
    for (const folder of folders) {
      if (folder === '.DS_Store') continue;
      
      const folderPath = path.join(addonsBasePath, folder);
      const stat = await fs.promises.stat(folderPath);
      
      if (stat.isDirectory()) {
        const addonData = await processAddonFolder(folderPath, folder);
        
        // Merge addon data
        Object.assign(allAddonData, addonData);
        
        // Count rarities
        for (const addon of Object.values(addonData)) {
          rarityStats[addon.rarity] = (rarityStats[addon.rarity] || 0) + 1;
        }
      }
    }
    
    // Save the mapping
    const outputPath = path.join(process.cwd(), '..', 'src', 'data', 'addonRarityMapping.json');
    await fs.promises.writeFile(outputPath, JSON.stringify(allAddonData, null, 2));
    
    console.log('\n=== ANALYSIS COMPLETE ===');
    console.log(`Total addons processed: ${Object.keys(allAddonData).length}`);
    console.log('\nRarity distribution:');
    Object.entries(rarityStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([rarity, count]) => {
        console.log(`  ${rarity}: ${count}`);
      });
    
    console.log(`\nRarity mapping saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error generating rarity mapping:', error);
  }
}

generateRarityMapping(); 