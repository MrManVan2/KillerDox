// Simple in-memory state store (will reset on function cold starts, but good enough for demo)
let currentBuildState = {
  killer: null,
  perks: [],
  addons: [],
  offering: null,
  platform: null,
  lastUpdated: Date.now(),
  sessionId: null
};

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Return current state with timestamp
    return res.status(200).json({
      ...currentBuildState,
      timestamp: Date.now()
    });
  }

  if (req.method === 'POST') {
    try {
      const { killer, perks, addons, offering, platform, sessionId } = req.body;
      
      // Update the current state
      currentBuildState = {
        killer,
        perks,
        addons,
        offering,
        platform,
        lastUpdated: Date.now(),
        sessionId
      };

      return res.status(200).json({ 
        success: true, 
        lastUpdated: currentBuildState.lastUpdated 
      });
    } catch (error) {
      console.error('Error updating state:', error);
      return res.status(500).json({ error: 'Failed to update state' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 