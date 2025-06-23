class RealtimeService {
  private pollTimer: NodeJS.Timeout | null = null;
  private sessionId: string;
  private lastKnownUpdate: number = 0;
  private listeners: Map<string, Set<Function>> = new Map();
  private isPolling = false;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  connect() {
    if (this.isPolling) return;
    
    console.log('Starting real-time polling');
    this.isPolling = true;
    this.startPolling();
  }

  private startPolling() {
    // Poll every 2 seconds for updates
    this.pollTimer = setInterval(async () => {
      try {
        const response = await fetch('/api/realtime/state');
        if (response.ok) {
          const data = await response.json();
          
          // Check if this is a newer update from a different session
          if (data.lastUpdated > this.lastKnownUpdate && data.sessionId !== this.sessionId) {
            this.lastKnownUpdate = data.lastUpdated;
            
            // Emit build update
            this.emit('build:update', {
              killer: data.killer,
              perks: data.perks,
              addons: data.addons,
              offering: data.offering,
              platform: data.platform
            });
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);
  }

  disconnect() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.isPolling = false;
  }

  // Broadcast build state to server
  async broadcastBuildUpdate(build: any) {
    try {
      await fetch('/api/realtime/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          killer: build.killer,
          perks: build.perks,
          addons: build.addons,
          offering: build.offering,
          platform: build.platform,
          sessionId: this.sessionId
        }),
      });
    } catch (error) {
      console.error('Failed to broadcast build update:', error);
    }
  }

  async broadcastBuildReset() {
    try {
      await fetch('/api/realtime/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          killer: null,
          perks: [],
          addons: [],
          offering: null,
          platform: null,
          sessionId: this.sessionId
        }),
      });
    } catch (error) {
      console.error('Failed to broadcast build reset:', error);
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
    return this.isPolling;
  }

  // Subscribe to specific events
  onBuildUpdate(callback: (build: any) => void) {
    return this.on('build:update', callback);
  }

  onBuildReset(callback: () => void) {
    return this.on('build:reset', callback);
  }
}

export const realtimeService = new RealtimeService(); 