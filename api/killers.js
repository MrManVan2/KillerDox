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
    
    // Read killers directory
    const killersPath = path.join(process.cwd(), 'public', 'assets', 'killers')
    const files = fs.readdirSync(killersPath)
    const killerFiles = files.filter(file => !file.startsWith('.'))
    
    res.status(200).json(killerFiles)
  } catch (error) {
    console.error('Error reading killers:', error)
    res.status(500).json({ error: 'Failed to load killers' })
  }
} 