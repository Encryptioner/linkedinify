/**
 * AI Chat Manager - Handles AI chatbot integration
 * Manages dynamic script loading and chat widget configuration
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';

export class AIChatManager extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('AIChatManager');
    this.config = app.config.aiChat;
    this.isLoaded = false;
    this.isInitialized = false;

    this.logger.debug('AI Chat Manager created');
  }

  /**
   * Initialize the AI chat system
   */
  async init() {
    try {
      this.logger.debug('Initializing AI Chat Manager');

      if (!this.config.enabled) {
        this.logger.info('AI Chat is disabled in configuration');
        return;
      }

      await this.loadChatScript();
      this.isInitialized = true;

      this.logger.debug('AI Chat Manager initialized successfully');
      this.emit('initialized');

    } catch (error) {
      this.logger.error('Failed to initialize AI Chat Manager:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Load the AI chat embed script
   */
  async loadChatScript() {
    return new Promise((resolve, reject) => {
      try {
        // Check if script already exists
        if (document.getElementById('aiChatEmbedScript')) {
          this.logger.info('AI Chat script already loaded');
          this.isLoaded = true;
          resolve();
          return;
        }

        const embedUrl = this.buildEmbedUrl();

        if (this.config.debug) {
          this.logger.debug('Loading AI Chat embed script:', embedUrl);
        }

        if (!embedUrl || embedUrl.trim() === '') {
          const error = new Error('AI Chat embed script URL is empty or invalid');
          this.logger.error(error.message);
          reject(error);
          return;
        }

        const script = document.createElement('script');
        script.id = 'aiChatEmbedScript';
        script.defer = true;
        script.src = embedUrl;

        script.onload = () => {
          this.logger.info('AI Chat embed script loaded successfully');
          this.isLoaded = true;
          this.emit('scriptLoaded');
          resolve();
        };

        script.onerror = (event) => {
          this.logger.error('Failed to load AI Chat embed script:', embedUrl);
          this.logger.error('Error details:', event);

          if (this.config.fallbackEnabled) {
            this.logger.info('Attempting to load script without parameters as fallback...');
            this.loadFallbackScript()
              .then(resolve)
              .catch(reject);
          } else {
            const error = new Error(`Failed to load AI Chat script: ${embedUrl}`);
            this.emit('error', error);
            reject(error);
          }
        };

        document.head.appendChild(script);

      } catch (error) {
        this.logger.error('Error in loadChatScript:', error);
        this.emit('error', error);
        reject(error);
      }
    });
  }

  /**
   * Load fallback script without parameters
   */
  async loadFallbackScript() {
    return new Promise((resolve, reject) => {
      const baseScriptUrl = this.config.embedScriptUrl;

      if (!baseScriptUrl) {
        reject(new Error('No fallback script URL available'));
        return;
      }

      const fallbackScript = document.createElement('script');
      fallbackScript.id = 'aiChatEmbedScriptFallback';
      fallbackScript.defer = true;
      fallbackScript.src = baseScriptUrl;

      fallbackScript.onload = () => {
        this.logger.info('AI Chat embed script loaded successfully (fallback)');
        this.isLoaded = true;
        this.emit('scriptLoaded');
        resolve();
      };

      fallbackScript.onerror = () => {
        const error = new Error('Fallback script loading also failed');
        this.logger.error(error.message);
        this.emit('error', error);
        reject(error);
      };

      document.head.appendChild(fallbackScript);
    });
  }

  /**
   * Build the embed URL with parameters
   */
  buildEmbedUrl() {
    try {
      const baseUrl = this.config.embedScriptUrl;

      if (!this.isValidUrl(baseUrl)) {
        this.logger.error('Invalid embed script URL:', baseUrl);
        return '';
      }

      const systemParam = encodeURIComponent(this.config.systemMessage);
      const domainParam = encodeURIComponent(this.getCurrentDomain());

      const finalUrl = `${baseUrl}?system=${systemParam}&domain=${domainParam}`;

      if (this.config.debug) {
        this.logger.debug('Built AI Chat embed URL:', finalUrl);
        this.logger.debug('Base script URL:', baseUrl);
        this.logger.debug('System param length:', systemParam.length);
        this.logger.debug('Domain param:', domainParam);
      }

      return finalUrl;

    } catch (error) {
      this.logger.error('Error building embed script URL:', error);
      return this.config.embedScriptUrl; // Fallback to base URL
    }
  }

  /**
   * Get current domain for configuration
   */
  getCurrentDomain() {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin + (this.app.config.pwa.scope || '/');
    }
    return this.app.config.app.homepage || 'https://encryptioner.github.io/linkedinify';
  }

  /**
   * Validate URL helper
   */
  isValidUrl(url) {
    if (!url || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if AI Chat is enabled and loaded
   */
  isReady() {
    return this.config.enabled && this.isLoaded && this.isInitialized;
  }

  /**
   * Get health status
   */
  isHealthy() {
    return {
      enabled: this.config.enabled,
      initialized: this.isInitialized,
      loaded: this.isLoaded,
      scriptExists: !!document.getElementById('aiChatEmbedScript') || !!document.getElementById('aiChatEmbedScriptFallback'),
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.logger.debug('Cleaning up AI Chat Manager');

    // Remove scripts
    const scripts = ['aiChatEmbedScript', 'aiChatEmbedScriptFallback'];
    scripts.forEach(scriptId => {
      const script = document.getElementById(scriptId);
      if (script) {
        script.remove();
        this.logger.debug(`Removed script: ${scriptId}`);
      }
    });

    this.isLoaded = false;
    this.isInitialized = false;
    this.removeAllListeners();

    this.logger.debug('AI Chat Manager cleaned up');
  }

  /**
   * Enable AI chat
   */
  enable() {
    if (!this.config.enabled) {
      this.config.enabled = true;
      this.logger.info('AI Chat enabled');
      this.init().catch(error => {
        this.logger.error('Failed to enable AI Chat:', error);
      });
    }
  }

  /**
   * Disable AI chat
   */
  disable() {
    if (this.config.enabled) {
      this.config.enabled = false;
      this.cleanup();
      this.logger.info('AI Chat disabled');
    }
  }

  /**
   * Reload chat script (useful for configuration changes)
   */
  async reload() {
    this.logger.info('Reloading AI Chat script');
    this.cleanup();

    if (this.config.enabled) {
      await this.init();
    }
  }
}