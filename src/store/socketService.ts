import { io, Socket } from 'socket.io-client';
import type { Build } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    // Only connect in development environment
    if (import.meta.env.PROD) {
      console.log('Socket.IO disabled in production');
      return;
    }
    
    if (this.socket) return;
    
    // Connect to localhost in development only
    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001');
    
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Disconnected from socket server');
    });

    this.socket.on('build:update', (build: Build) => {
      // This will be handled by the store
      console.log('Received build update:', build);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emitBuildUpdate(build: Build) {
    if (this.socket && this.isConnected) {
      this.socket.emit('build:update', build);
    }
  }

  emitBuildReset() {
    if (this.socket && this.isConnected) {
      this.socket.emit('build:reset');
    }
  }

  onBuildUpdate(callback: (build: Build) => void) {
    if (this.socket) {
      this.socket.on('build:update', callback);
    }
  }

  onBuildReset(callback: () => void) {
    if (this.socket) {
      this.socket.on('build:reset', callback);
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export const socketService = new SocketService(); 