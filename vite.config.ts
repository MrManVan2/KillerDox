import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to serve file listings
    {
      name: 'assets-api',
      configureServer(server) {
        // Helper function to read directory and return file names
        const readDirectory = (dirPath: string) => {
          try {
            const fullPath = path.join(server.config.root, 'public', dirPath)
            const files = fs.readdirSync(fullPath)
            return files.filter(file => !file.startsWith('.'))
          } catch (error) {
            console.error(`Error reading directory ${dirPath}:`, error)
            return []
          }
        }

        // API middleware - must be early in the chain
        server.middlewares.use('/api', (req, res, _next) => {
          // Set CORS and JSON headers
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET')
          
          const url = req.url || ''
          console.log(`API request: ${url}`) // Debug logging
          
          // Handle different API endpoints
          if (url === '/killers') {
            const files = readDirectory('assets/killers')
            console.log(`Killers found: ${files.length}`)
            res.end(JSON.stringify(files))
            return
          }

          if (url === '/perks') {
            res.end(JSON.stringify(readDirectory('assets/perks')))
            return
          }

          if (url === '/offerings') {
            res.end(JSON.stringify(readDirectory('assets/offerings')))
            return
          }

          if (url === '/platforms') {
            res.end(JSON.stringify(readDirectory('assets/platforms')))
            return
          }

          // Handle addon requests
          if (url.startsWith('/addons/')) {
            const pathSegments = url.split('/')
            if (pathSegments.length > 2 && pathSegments[2]) {
              const addonFolder = decodeURIComponent(pathSegments[2])
              console.log(`Loading addons for: ${addonFolder}`)
              res.end(JSON.stringify(readDirectory(`assets/Icons/Addons/${addonFolder}`)))
              return
            }
          }

          // Handle offering rarity requests (legacy)
          if (url.startsWith('/assets/offerings/')) {
            const pathSegments = url.split('/')
            if (pathSegments.length > 3) {
              const rarity = decodeURIComponent(pathSegments[3])
              res.end(JSON.stringify(readDirectory(`assets/offerings/${rarity}`)))
              return
            }
          }

          // If no API route matched, return 404
          console.log(`API route not found: ${url}`)
          res.statusCode = 404
          res.end(JSON.stringify({ error: 'API endpoint not found', url }))
        })
      }
    }
  ],
  server: {
    port: 3000,
    open: true
  }
})
