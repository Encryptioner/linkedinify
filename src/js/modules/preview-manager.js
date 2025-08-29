/**
 * Preview Manager Module
 * Handles LinkedIn preview modes (light/dark theme, desktop/mobile view)
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';
import { Config } from '../config/app-config.js';

export class PreviewManager extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('PreviewManager');
    this.currentLinkedInTheme = 'light';
    this.currentDeviceView = 'web';
  }

  /**
   * Initialize preview manager
   */
  async init() {
    try {
      this.logger.debug('Initializing preview manager');
      this.setupEventListeners();
      this.logger.info('Preview manager initialized');
    } catch (error) {
      this.logger.error('Failed to initialize preview manager:', error);
      throw error;
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen to preview control buttons
    document.addEventListener('click', (event) => {
      const target = event.target;
      
      if (target.matches('.preview-btn[data-theme]')) {
        event.preventDefault();
        this.setLinkedInTheme(target.dataset.theme);
      }
      
      if (target.matches('.preview-btn[data-view]')) {
        event.preventDefault();
        this.setLinkedInView(target.dataset.view);
      }
    });
  }

  /**
   * Set LinkedIn theme (light/dark)
   */
  setLinkedInTheme(theme) {
    if (!['light', 'dark'].includes(theme)) {
      this.logger.warn(`Invalid LinkedIn theme: ${theme}`);
      return;
    }

    try {
      this.currentLinkedInTheme = theme;
      const preview = document.getElementById('linkedinPreview');
      
      if (preview) {
        // Remove existing theme classes
        preview.classList.remove('linkedin-light', 'linkedin-dark');
        // Add new theme class
        preview.classList.add(`linkedin-${theme}`);
      }

      // Update button states
      document.querySelectorAll('.preview-btn[data-theme]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
      });

      this.emit('linkedinThemeChanged', { theme });
      this.logger.debug(`LinkedIn theme set to: ${theme}`);
      
    } catch (error) {
      this.logger.error(`Failed to set LinkedIn theme ${theme}:`, error);
      this.emit('error', error);
    }
  }

  /**
   * Set LinkedIn view (web/mobile)
   */
  setLinkedInView(view) {
    if (!['web', 'mobile'].includes(view)) {
      this.logger.warn(`Invalid LinkedIn view: ${view}`);
      return;
    }

    try {
      this.currentDeviceView = view;
      const preview = document.getElementById('linkedinPreview');
      
      if (preview) {
        // Remove existing view classes
        preview.classList.remove('linkedin-mobile', 'linkedin-desktop');
        // Add new view class
        preview.classList.add(`linkedin-${view === 'mobile' ? 'mobile' : 'desktop'}`);
      }

      // Update button states
      document.querySelectorAll('.preview-btn[data-view]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
      });

      this.emit('linkedinViewChanged', { view });
      this.logger.debug(`LinkedIn view set to: ${view}`);
      
    } catch (error) {
      this.logger.error(`Failed to set LinkedIn view ${view}:`, error);
      this.emit('error', error);
    }
  }

  /**
   * Set initial mode based on config
   */
  setInitialMode() {
    // Set default values if config not available
    this.setLinkedInTheme('light');
    this.setLinkedInView('web');
  }

  /**
   * Get current preview state
   */
  getCurrentState() {
    return {
      linkedinTheme: this.currentLinkedInTheme,
      deviceView: this.currentDeviceView,
    };
  }

  /**
   * Reset to default settings
   */
  resetToDefaults() {
    this.setLinkedInTheme(Config.ui.preview.defaults.linkedinTheme);
    this.setLinkedInView(Config.ui.preview.defaults.deviceView);
    this.emit('previewReset');
  }

  /**
   * Check if preview manager is healthy
   */
  isHealthy() {
    const preview = document.getElementById('linkedinPreview');
    return {
      healthy: !!preview,
      currentLinkedInTheme: this.currentLinkedInTheme,
      currentDeviceView: this.currentDeviceView,
      previewElementExists: !!preview,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.removeAllListeners();
    this.logger.debug('Preview manager cleaned up');
  }
}