import { broadcastToConnections } from './events.js';

// Simple in-memory cache for recent messages to prevent duplicates
const recentMessages = new Map();
const MESSAGE_CACHE_DURATION = 60000; // 1 minute

// Clean up old messages periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentMessages.entries()) {
    if (now - timestamp > MESSAGE_CACHE_DURATION) {
      recentMessages.delete(key);
    }
  }
}, 30000); // Clean up every 30 seconds

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, payload, sessionId, timestamp } = req.body;

    if (!type || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields: type, sessionId' });
    }

    // Create a unique message ID to prevent duplicates
    const messageId = `${sessionId}-${type}-${timestamp}`;
    
    // Check if we've seen this message recently
    if (recentMessages.has(messageId)) {
      return res.status(200).json({ success: true, cached: true });
    }

    // Cache this message
    recentMessages.set(messageId, Date.now());

    // Broadcast to all connected clients
    const message = {
      type,
      payload,
      sessionId,
      timestamp: timestamp || Date.now()
    };

    try {
      broadcastToConnections(message);
    } catch (error) {
      console.error('Error broadcasting message:', error);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing broadcast:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 