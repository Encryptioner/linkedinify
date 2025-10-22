/**
 * LinkedInify - Google Analytics Manager
 * Handles Google Analytics 4 integration with privacy-first approach
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';

export class AnalyticsManager extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('AnalyticsManager');
    this.config = this.app.config.googleAnalytics;
    this.initialized = false;
  }

  /**
   * Initialize Google Analytics
   */
  async init() {
    try {
      if (!this.shouldTrack()) {
        this.logger.info('Analytics tracking disabled');
        this.logDisabledReason();
        return;
      }

      this.loadGoogleAnalyticsScript();
      this.initializeGoogleAnalytics();
      this.trackPageView();

      this.initialized = true;
      this.logger.info('Google Analytics initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize Google Analytics:', error);
      this.emit('analyticsError', error);
    }
  }

  /**
   * Determine if tracking should be enabled
   */
  shouldTrack() {
    const { enabled, measurementId, trackInDevelopment } = this.config;

    if (!enabled) return false;
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') return false;

    const isProduction = import.meta.env.MODE === 'production';
    if (!isProduction && !trackInDevelopment) return false;

    return true;
  }

  /**
   * Log reason for disabled tracking
   */
  logDisabledReason() {
    const { enabled, measurementId, trackInDevelopment } = this.config;
    const isProduction = import.meta.env.MODE === 'production';

    if (!enabled) {
      this.logger.info('Reason: Disabled in config');
    } else if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
      this.logger.info('Reason: Invalid or missing measurement ID');
    } else if (!isProduction && !trackInDevelopment) {
      this.logger.info('Reason: Development environment');
    }
  }

  /**
   * Load Google Analytics script dynamically
   */
  loadGoogleAnalyticsScript() {
    const measurementId = this.config.measurementId;

    // Add gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
  }

  /**
   * Initialize Google Analytics with config
   */
  initializeGoogleAnalytics() {
    window.gtag('js', new Date());
    window.gtag('config', this.config.measurementId, {
      send_page_view: false, // We'll send manually
    });

    this.logger.info(`Initialized with ID: ${this.config.measurementId}`);
  }

  /**
   * Track a page view
   */
  trackPageView(path = window.location.pathname) {
    if (!this.initialized || !window.gtag) return;

    try {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: document.title,
      });

      this.logger.debug(`Page view tracked: ${path}`);
    } catch (error) {
      this.logger.error('Page view tracking error:', error);
    }
  }

  /**
   * Track a custom event
   * @param {string} eventName - Name of the event
   * @param {Object} params - Event parameters
   */
  trackEvent(eventName, params = {}) {
    if (!this.initialized || !window.gtag) return;

    try {
      window.gtag('event', eventName, params);
      this.logger.debug(`Event tracked: ${eventName}`, params);
    } catch (error) {
      this.logger.error('Event tracking error:', error);
    }
  }

  /**
   * Track content conversion
   */
  trackConversion() {
    this.trackEvent('convert_content', {
      category: 'Conversion',
      action: 'Markdown to LinkedIn',
    });
  }

  /**
   * Track content copy
   */
  trackCopy(contentType = 'linkedin') {
    this.trackEvent('copy_content', {
      category: 'Engagement',
      content_type: contentType,
    });
  }

  /**
   * Track post save
   */
  trackSavePost() {
    this.trackEvent('save_post', {
      category: 'Content',
      action: 'Save Post',
    });
  }

  /**
   * Track title generation
   */
  trackTitleGeneration(category = 'unknown') {
    this.trackEvent('generate_title', {
      category: 'AI Features',
      title_category: category,
    });
  }

  /**
   * Track theme change
   */
  trackThemeChange(theme) {
    this.trackEvent('change_theme', {
      category: 'Preferences',
      theme: theme,
    });
  }

  /**
   * Track preview mode change
   */
  trackPreviewChange(mode) {
    this.trackEvent('change_preview', {
      category: 'Preferences',
      preview_mode: mode,
    });
  }

  /**
   * Check if analytics is healthy
   */
  isHealthy() {
    return this.initialized || !this.config.enabled;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.removeAllListeners();
    this.logger.debug('Analytics manager cleaned up');
  }
}
