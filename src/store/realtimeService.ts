class RealtimeService {
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private isConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupBroadcastChannel();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('killerdox-updates');
      this.broadcastChannel.addEventListener('message', (event) => {
        this.handleMessage(event.data);
      });
    }
  }

  connect() {
    if (this.isConnected || this.eventSource) return;

    try {
      // Connect to our SSE endpoint
      this.eventSource = new EventSource('/api/realtime/events');
      
      this.eventSource.onopen = () => {
        this.isConnected = true;
        console.log('Connected to real-time updates');
        this.emit('connection:status', { connected: true });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        console.log('Real-time connection error, attempting to reconnect...');
        this.emit('connection:status', { connected: false });
        this.reconnect();
      };
    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectTimer) return;
    
    this.disconnect();
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000); // Reconnect after 3 seconds
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.isConnected = false;
  }

  private handleMessage(data: any) {
    if (data.sessionId === this.sessionId) {
      // Ignore messages from our own session
      return;
    }

    const { type, payload } = data;
    this.emit(type, payload);
  }

  // Broadcast an update to all connected clients
  async broadcast(type: string, payload: any) {
    const message = {
      type,
      payload,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };

    // Send via BroadcastChannel for same-device coordination
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    }

    // Send to server for cross-device coordination
    try {
      await fetch('/api/realtime/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Failed to broadcast message:', error);
    }
  }

  // Subscribe to specific event types
  on(type: string, callback: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        typeListeners.delete(callback);
        if (typeListeners.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  // Emit event to local listeners
  private emit(type: string, payload: any) {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  // Specific methods for different types of updates
  broadcastBuildUpdate(build: any) {
    this.broadcast('build:update', build);
  }

  broadcastBuildReset() {
    this.broadcast('build:reset', {});
  }

  broadcastAssetUpdate(assetType: string, asset: any) {
    this.broadcast('asset:update', { assetType, asset });
  }

  broadcastUserPresence(user: any) {
    this.broadcast('user:presence', user);
  }

  // Subscribe to specific events
  onBuildUpdate(callback: (build: any) => void) {
    return this.on('build:update', callback);
  }

  onBuildReset(callback: () => void) {
    return this.on('build:reset', callback);
  }

  onAssetUpdate(callback: (data: { assetType: string; asset: any }) => void) {
    return this.on('asset:update', callback);
  }

  onUserPresence(callback: (user: any) => void) {
    return this.on('user:presence', callback);
  }

  onConnectionStatus(callback: (status: { connected: boolean }) => void) {
    return this.on('connection:status', callback);
  }
}

export const realtimeService = new RealtimeService(); 