import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Content-Type', 'application/json')
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }
    
    const { rarity } = req.query
    
    if (!rarity) {
      return res.status(400).json({ error: 'Rarity parameter required' })
    }
    
    // Read the specific rarity folder
    const rarityPath = path.join(process.cwd(), 'public', 'assets', 'offerings', rarity)
    
    if (!fs.existsSync(rarityPath)) {
      return res.status(404).json({ error: `Rarity folder not found: ${rarity}` })
    }
    
    const files = fs.readdirSync(rarityPath)
    const offeringFiles = files.filter(file => file.endsWith('.png') && !file.startsWith('.'))
    
    res.status(200).json(offeringFiles)
  } catch (error) {
    console.error('Error reading offerings for rarity:', error)
    res.status(500).json({ error: 'Failed to load offerings' })
  }
} 