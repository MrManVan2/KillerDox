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

        // API endpoints for asset listings
        server.middlewares.use('/api/assets/killers', (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(readDirectory('assets/killers')))
        })

        server.middlewares.use('/api/assets/perks', (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(readDirectory('assets/perks')))
        })

        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api/assets/addons/')) {
            const url = new URL(req.url, `http://${req.headers.host}`)
            const pathSegments = url.pathname.split('/')
            
            if (pathSegments.length > 4 && pathSegments[4]) {
              // Request for specific addon folder (e.g., /api/assets/addons/Applepie)
              const addonFolder = pathSegments[4]
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(readDirectory(`assets/addons/${addonFolder}`)))
              return
            }
          } else if (req.url === '/api/assets/addons') {
            // Request for general addons (files directly in addons folder)
            res.setHeader('Content-Type', 'application/json')
            const files = readDirectory('assets/addons').filter(item => item.endsWith('.png'))
            res.end(JSON.stringify(files))
            return
          }
          next()
        })

        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api/assets/offerings/')) {
            const url = new URL(req.url, `http://${req.headers.host}`)
            const pathSegments = url.pathname.split('/')
            const rarity = pathSegments[4]
            
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(readDirectory(`assets/offerings/${rarity}`)))
            return
          }
          next()
        })

        server.middlewares.use('/api/assets/platforms', (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(readDirectory('assets/platforms')))
        })
      }
    }
  ],
  server: {
    port: 3000,
    open: true
  }
})
