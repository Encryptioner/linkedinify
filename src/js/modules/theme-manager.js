/**
 * Theme Manager Module
 * Handles light/dark theme switching with persistence and smooth transitions
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';
import { Config } from '../config/app-config.js';

export class ThemeManager extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('ThemeManager');
    this.currentTheme = null;
    this.mediaQuery = null;
    this.transitionTimeout = null;
  }

  /**
   * Initialize theme manager
   */
  async init() {
    try {
      this.logger.debug('Initializing theme manager');
      
      // Set up media query for system theme detection
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
      
      // Load saved theme or detect system preference
      await this.loadTheme();
      
      // Set up theme transition handling
      this.setupTransitions();
      
      this.logger.info('Theme manager initialized');
    } catch (error) {
      this.logger.error('Failed to initialize theme manager:', error);
      throw error;
    }
  }

  /**
   * Load theme from storage or detect system preference
   */
  async loadTheme() {
    try {
      const savedTheme = localStorage.getItem(Config.storage.keys.theme);
      const systemTheme = this.mediaQuery?.matches ? 'dark' : 'light';
      const themeToApply = savedTheme || systemTheme || Config.ui.theme.default;
      
      await this.applyTheme(themeToApply, false); // Don't animate on initial load
      
      this.logger.debug(`Theme loaded: ${themeToApply} (saved: ${savedTheme}, system: ${systemTheme})`);
    } catch (error) {
      this.logger.error('Failed to load theme:', error);
      // Fallback to default theme
      await this.applyTheme(Config.ui.theme.default, false);
    }
  }

  /**
   * Apply a theme with optional animation
   */
  async applyTheme(theme, animate = true) {
    if (!Config.ui.theme.available.includes(theme)) {
      this.logger.warn(`Invalid theme: ${theme}. Using default.`);
      theme = Config.ui.theme.default;
    }

    if (this.currentTheme === theme) {
      return; // No change needed
    }

    try {
      this.logger.debug(`Applying theme: ${theme} (animate: ${animate})`);
      
      const root = document.documentElement;
      const previousTheme = this.currentTheme;

      // Add transition class if animating
      if (animate) {
        root.classList.add('theme-transition');
      }

      // Apply theme attribute
      root.setAttribute('data-theme', theme);
      
      // Update current theme
      this.currentTheme = theme;
      
      // Save to storage
      localStorage.setItem(Config.storage.keys.theme, theme);
      
      // Update UI elements
      this.updateThemeButton();
      this.updateFavicon(theme);
      this.updateMetaThemeColor(theme);
      
      // Remove transition class after animation
      if (animate) {
        clearTimeout(this.transitionTimeout);
        this.transitionTimeout = setTimeout(() => {
          root.classList.remove('theme-transition');
        }, Config.ui.animations.duration);
      }

      // Emit theme change event
      this.emit('themeChanged', {
        theme,
        previousTheme,
        timestamp: Date.now(),
      });

      this.logger.info(`Theme applied: ${theme}`);
      
    } catch (error) {
      this.logger.error(`Failed to apply theme ${theme}:`, error);
      throw error;
    }
  }

  /**
   * Toggle between light and dark themes
   */
  async toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    await this.applyTheme(newTheme, true);
    
    this.logger.debug(`Theme toggled to: ${newTheme}`);
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Check if current theme is dark
   */
  isDarkTheme() {
    return this.currentTheme === 'dark';
  }

  /**
   * Update theme toggle button
   */
  updateThemeButton() {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;

    const isDark = this.isDarkTheme();
    button.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    button.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    
    // Add visual feedback
    button.classList.toggle('dark-mode', isDark);
  }

  /**
   * Update favicon based on theme
   */
  updateFavicon(theme) {
    try {
      const favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) return;

      // You could have different favicons for different themes
      // For now, we'll just update the href if needed
      const isDark = theme === 'dark';
      const faviconPath = isDark ? '/icons/favicon-dark.ico' : '/icons/favicon-light.ico';
      
      // Only update if different favicon files exist
      // favicon.href = faviconPath;
      
    } catch (error) {
      this.logger.warn('Failed to update favicon:', error);
    }
  }

  /**
   * Update meta theme color for mobile browsers
   */
  updateMetaThemeColor(theme) {
    try {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) return;

      const colors = {
        light: '#0077b5', // LinkedIn blue
        dark: '#1b1f23',  // Dark theme background
      };

      metaThemeColor.setAttribute('content', colors[theme] || colors.light);
      
    } catch (error) {
      this.logger.warn('Failed to update meta theme color:', error);
    }
  }

  /**
   * Handle system theme preference changes
   */
  handleSystemThemeChange(event) {
    const systemTheme = event.matches ? 'dark' : 'light';
    
    this.logger.debug(`System theme changed to: ${systemTheme}`);
    
    // Only auto-switch if user hasn't manually set a theme
    const savedTheme = localStorage.getItem(Config.storage.keys.theme);
    if (!savedTheme) {
      this.applyTheme(systemTheme, true);
    }

    this.emit('systemThemeChanged', { theme: systemTheme });
  }

  /**
   * Setup CSS transitions for smooth theme changes
   */
  setupTransitions() {
    // Inject transition styles if not already present
    if (document.querySelector('#theme-transitions')) return;

    const style = document.createElement('style');
    style.id = 'theme-transitions';
    style.textContent = `
      .theme-transition,
      .theme-transition *,
      .theme-transition *:before,
      .theme-transition *:after {
        transition: background-color ${Config.ui.animations.duration}ms ${Config.ui.animations.easing},
                   color ${Config.ui.animations.duration}ms ${Config.ui.animations.easing},
                   border-color ${Config.ui.animations.duration}ms ${Config.ui.animations.easing},
                   box-shadow ${Config.ui.animations.duration}ms ${Config.ui.animations.easing} !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Get theme statistics
   */
  getThemeStats() {
    return {
      currentTheme: this.currentTheme,
      available: Config.ui.theme.available,
      systemPreference: this.mediaQuery?.matches ? 'dark' : 'light',
      hasCustomTheme: !!localStorage.getItem(Config.storage.keys.theme),
    };
  }

  /**
   * Reset theme to system default
   */
  async resetToSystem() {
    localStorage.removeItem(Config.storage.keys.theme);
    const systemTheme = this.mediaQuery?.matches ? 'dark' : 'light';
    await this.applyTheme(systemTheme, true);
    
    this.logger.info('Theme reset to system default');
    this.emit('themeReset', { theme: systemTheme });
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange.bind(this));
    }
    
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
    
    this.removeAllListeners();
    this.logger.debug('Theme manager cleaned up');
  }

  /**
   * Check if theme manager is healthy
   */
  isHealthy() {
    return {
      healthy: !!this.currentTheme && Config.ui.theme.available.includes(this.currentTheme),
      currentTheme: this.currentTheme,
      mediaQuerySupported: !!this.mediaQuery,
    };
  }
}