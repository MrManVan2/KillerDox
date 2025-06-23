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
    
    const { folder } = req.query
    
    if (!folder) {
      return res.status(400).json({ error: 'Folder parameter required' })
    }
    
    // Read addons directory for specific folder
    const addonsPath = path.join(process.cwd(), 'public', 'assets', 'Icons', 'Addons', decodeURIComponent(folder))
    
    if (!fs.existsSync(addonsPath)) {
      return res.status(404).json({ error: 'Addon folder not found', folder })
    }
    
    const files = fs.readdirSync(addonsPath)
    const addonFiles = files.filter(file => !file.startsWith('.'))
    
    res.status(200).json(addonFiles)
  } catch (error) {
    console.error('Error reading addons:', error)
    res.status(500).json({ error: 'Failed to load addons' })
  }
} 