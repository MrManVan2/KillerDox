// In-memory store for active connections (note: this will be per-function instance)
const connections = new Set();

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set up Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ 
    type: 'connection:established', 
    payload: { timestamp: Date.now() } 
  })}\n\n`);

  // Add this connection to our set
  const connectionId = Date.now() + Math.random();
  connections.add({ id: connectionId, res });

  // Send periodic heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ 
        type: 'heartbeat', 
        payload: { timestamp: Date.now() } 
      })}\n\n`);
    } catch (error) {
      // Connection closed
      clearInterval(heartbeat);
      connections.forEach(conn => {
        if (conn.id === connectionId) {
          connections.delete(conn);
        }
      });
    }
  }, 30000); // Send heartbeat every 30 seconds

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    connections.forEach(conn => {
      if (conn.id === connectionId) {
        connections.delete(conn);
      }
    });
  });

  req.on('error', () => {
    clearInterval(heartbeat);
    connections.forEach(conn => {
      if (conn.id === connectionId) {
        connections.delete(conn);
      }
    });
  });
}

// Function to broadcast to all connected clients
export function broadcastToConnections(message) {
  const data = `data: ${JSON.stringify(message)}\n\n`;
  
  const disconnectedConnections = [];
  
  connections.forEach(conn => {
    try {
      conn.res.write(data);
    } catch (error) {
      // Connection is dead, mark for removal
      disconnectedConnections.push(conn);
    }
  });

  // Clean up dead connections
  disconnectedConnections.forEach(conn => {
    connections.delete(conn);
  });
} 