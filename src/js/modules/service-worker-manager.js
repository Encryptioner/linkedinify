/**
 * Service Worker Manager Module
 * Manages PWA functionality, offline caching, and updates
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';
import { Config } from '../config/app-config.js';

export class ServiceWorkerManager extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('ServiceWorkerManager');
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator;
    this.updateCheckInterval = null;
  }

  /**
   * Initialize service worker manager
   */
  async init() {
    try {
      this.logger.debug('Initializing service worker manager');

      if (!this.isSupported) {
        this.logger.warn('Service worker not supported in this browser');
        return;
      }

      if (!Config.features.serviceWorker.enabled) {
        this.logger.info('Service worker disabled in config');
        return;
      }

      await this.registerServiceWorker();
      this.setupUpdateChecking();
      
      this.logger.info('Service worker manager initialized');
    } catch (error) {
      this.logger.error('Failed to initialize service worker manager:', error);
      // Don't throw - service worker is not critical for basic functionality
    }
  }

  /**
   * Register service worker
   */
  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/linkedinify/sw.js', {
        scope: '/linkedinify/',
        updateViaCache: 'none', // Always check for updates
      });

      this.logger.info('Service worker registered:', this.registration.scope);

      // Handle registration events
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdateFound();
      });

      // Handle existing service worker
      if (this.registration.active) {
        this.logger.debug('Service worker already active');
        this.emit('ready', { registration: this.registration });
      }

      // Handle waiting service worker
      if (this.registration.waiting) {
        this.logger.debug('Service worker waiting');
        this.handleWaitingWorker();
      }

      // Handle installing service worker
      if (this.registration.installing) {
        this.logger.debug('Service worker installing');
        this.trackInstallation(this.registration.installing);
      }

      return this.registration;

    } catch (error) {
      this.logger.error('Service worker registration failed:', error);
      this.emit('registrationError', { error });
      throw error;
    }
  }

  /**
   * Handle service worker update found
   */
  handleUpdateFound() {
    const newWorker = this.registration.installing;
    
    this.logger.info('Service worker update found');
    this.emit('updateFound', { worker: newWorker });
    
    if (newWorker) {
      this.trackInstallation(newWorker);
    }
  }

  /**
   * Track service worker installation
   */
  trackInstallation(worker) {
    worker.addEventListener('statechange', () => {
      this.logger.debug(`Service worker state changed: ${worker.state}`);
      
      switch (worker.state) {
        case 'installed':
          if (navigator.serviceWorker.controller) {
            // New service worker installed, update available
            this.logger.info('Service worker update available');
            this.emit('updateAvailable', { worker });
            this.showUpdateNotification();
          } else {
            // First installation
            this.logger.info('Service worker installed for first time');
            this.emit('installed', { worker });
          }
          break;
          
        case 'activated':
          this.logger.info('Service worker activated');
          this.emit('activated', { worker });
          break;
          
        case 'redundant':
          this.logger.warn('Service worker became redundant');
          this.emit('redundant', { worker });
          break;
      }
    });
  }

  /**
   * Handle waiting service worker
   */
  handleWaitingWorker() {
    this.logger.info('Service worker waiting to activate');
    this.emit('waiting', { registration: this.registration });
    this.showUpdateNotification();
  }

  /**
   * Show update notification to user
   */
  showUpdateNotification() {
    // Show a user-friendly update notification
    const uiManager = this.app.getModule('ui');
    if (uiManager) {
      uiManager.showStatus(
        'App update available! Click here to refresh.',
        'info',
        0 // Don't auto-hide
      );
      
      // Make status clickable to trigger update
      const status = document.getElementById('status');
      if (status) {
        status.style.cursor = 'pointer';
        status.addEventListener('click', () => {
          this.skipWaiting();
        }, { once: true });
      }
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting() {
    if (!this.registration || !this.registration.waiting) {
      this.logger.warn('No waiting service worker to skip');
      return;
    }

    try {
      // Tell waiting service worker to skip waiting
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      this.logger.info('Told service worker to skip waiting');
      this.emit('skipWaiting');

    } catch (error) {
      this.logger.error('Failed to skip waiting:', error);
      this.emit('skipWaitingError', { error });
    }
  }

  /**
   * Setup periodic update checking
   */
  setupUpdateChecking() {
    if (!this.registration) return;

    const interval = Config.features.serviceWorker.updateInterval;
    
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, interval);

    // Check for updates when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkForUpdates();
      }
    });

    // Check for updates on page focus
    window.addEventListener('focus', () => {
      this.checkForUpdates();
    });
  }

  /**
   * Check for service worker updates
   */
  async checkForUpdates() {
    if (!this.registration) return;

    try {
      const updatedRegistration = await this.registration.update();
      
      if (updatedRegistration.installing) {
        this.logger.debug('Service worker update check found new version');
      } else {
        this.logger.debug('Service worker update check - no new version');
      }

      return updatedRegistration;

    } catch (error) {
      this.logger.error('Service worker update check failed:', error);
      this.emit('updateCheckError', { error });
    }
  }

  /**
   * Unregister service worker
   */
  async unregister() {
    if (!this.registration) {
      this.logger.warn('No service worker registration to unregister');
      return false;
    }

    try {
      const success = await this.registration.unregister();
      
      if (success) {
        this.logger.info('Service worker unregistered successfully');
        this.registration = null;
        this.emit('unregistered');
      } else {
        this.logger.warn('Service worker unregistration failed');
      }

      return success;

    } catch (error) {
      this.logger.error('Service worker unregistration error:', error);
      this.emit('unregistrationError', { error });
      return false;
    }
  }

  /**
   * Get service worker state
   */
  getState() {
    if (!this.registration) {
      return {
        supported: this.isSupported,
        registered: false,
        state: null,
        scope: null,
      };
    }

    return {
      supported: this.isSupported,
      registered: true,
      state: this.registration.active?.state || 'unknown',
      scope: this.registration.scope,
      waiting: !!this.registration.waiting,
      installing: !!this.registration.installing,
      updateAvailable: !!this.registration.waiting,
    };
  }

  /**
   * Send message to service worker
   */
  async sendMessage(message) {
    if (!this.registration || !this.registration.active) {
      throw new Error('No active service worker to send message to');
    }

    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      this.registration.active.postMessage(message, [channel.port2]);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Service worker message timeout'));
      }, 5000);
    });
  }

  /**
   * Get cache status
   */
  async getCacheStatus() {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const cacheInfo = [];

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          
          cacheInfo.push({
            name: cacheName,
            size: keys.length,
            urls: keys.map(request => request.url),
          });
        }

        return {
          available: true,
          caches: cacheInfo,
          totalCaches: cacheNames.length,
        };
      } else {
        return {
          available: false,
          caches: [],
          totalCaches: 0,
        };
      }
    } catch (error) {
      this.logger.error('Failed to get cache status:', error);
      return {
        available: false,
        error: error.message,
        caches: [],
        totalCaches: 0,
      };
    }
  }

  /**
   * Clear all caches
   */
  async clearCaches() {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );

        this.logger.info(`Cleared ${cacheNames.length} caches`);
        this.emit('cachesCleared', { count: cacheNames.length });
        
        return cacheNames.length;
      }
      
      return 0;
    } catch (error) {
      this.logger.error('Failed to clear caches:', error);
      this.emit('clearCachesError', { error });
      throw error;
    }
  }

  /**
   * Force refresh the application
   */
  forceRefresh() {
    this.logger.info('Forcing application refresh');
    
    // Clear any cached data
    if ('caches' in window) {
      this.clearCaches().then(() => {
        window.location.reload(true);
      }).catch(() => {
        window.location.reload(true);
      });
    } else {
      window.location.reload(true);
    }
  }

  /**
   * Check if service worker manager is healthy
   */
  isHealthy() {
    const state = this.getState();
    
    return {
      healthy: this.isSupported && (state.registered || !Config.features.serviceWorker.enabled),
      supported: this.isSupported,
      registered: state.registered,
      active: state.state === 'activated',
      hasUpdateChecking: !!this.updateCheckInterval,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
    
    this.removeAllListeners();
    this.logger.debug('Service worker manager cleaned up');
  }
}