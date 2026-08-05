/**
 * LinkedInify — Analytics Module
 *
 * Typed, fire-and-forget Google Analytics 4 event tracking.
 * Module pattern — no class, no EventEmitter dependency.
 *
 * Usage:
 *   import { initAnalytics, trackEvent } from './analytics-manager.js';
 *   initAnalytics();
 *   trackEvent({ name: 'content_copied', params: { content_type: 'linkedin' } });
 */

import { Config } from '../config/app-config.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('Analytics');

// ── Type Definition ─────────────────────────────────────────────────────────

/**
 * @typedef {
 *   | { name: 'post_converted', params: { content_length: number, has_emoji: boolean } }
 *   | { name: 'content_copied', params: { content_type: 'linkedin' | 'markdown' | 'plain' } }
 *   | { name: 'copy_failed', params: { error: string } }
 *   | { name: 'title_generated', params: { category: string, language: string } }
 *   | { name: 'title_accepted' }
 *   | { name: 'title_regenerated' }
 *   | { name: 'post_saved', params: { content_length: number } }
 *   | { name: 'post_loaded' }
 *   | { name: 'post_deleted' }
 *   | { name: 'draft_auto_saved' }
 *   | { name: 'preview_mode_changed', params: { viewport: 'desktop' | 'mobile' } }
 *   | { name: 'preview_theme_changed', params: { theme: 'dark' | 'light' } }
 *   | { name: 'theme_toggled', params: { theme: 'dark' | 'light' } }
 *   | { name: 'ai_chat_opened' }
 *   | { name: 'pwa_installed' }
 *   | { name: 'error_occurred', params: { category: string, action: string, error: string } }
 * } AnalyticsEvent
 */

// ── Private helpers ──────────────────────────────────────────────────────────

const EMAIL_PATTERN = /[\w.+-]+@[\w.-]+\.\w+/g;

/**
 * Strip email addresses from error messages to prevent PII leakage.
 * @param {string} msg
 * @returns {string}
 */
export function sanitizeError(msg) {
  if (!msg || typeof msg !== 'string') return 'unknown';
  return msg.replace(EMAIL_PATTERN, '[email]').slice(0, 100);
}

/**
 * Determine whether we should actually send events.
 * @returns {boolean}
 */
function shouldTrack() {
  const { enabled, measurementId, trackInDevelopment } = Config.googleAnalytics;
  if (!enabled) return false;
  if (!measurementId) return false;
  const isProduction = import.meta.env.MODE === 'production';
  if (!isProduction && !trackInDevelopment) return false;
  return true;
}

// ── GA script loader ─────────────────────────────────────────────────────────

/**
 * Inject gtag.js and configure GA4 for this SPA.
 * Call once at app boot — safe to call multiple times (guards internally).
 */
export function initAnalytics() {
  if (!shouldTrack()) {
    logger.info('Analytics disabled — skipping init');
    return;
  }

  const { measurementId } = Config.googleAnalytics;

  // Avoid double-injection
  if (document.getElementById('ga-script')) {
    logger.debug('GA script already present');
    return;
  }

  // Initialise dataLayer + gtag function
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.gtag = function gtag() { window.dataLayer.push(arguments); };

  // Load the gtag.js script
  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Configure — send_page_view: false because this is a SPA
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });

  logger.info(`Google Analytics initialised (${measurementId})`);
}

// ── Core tracking function ───────────────────────────────────────────────────

/**
 * Send a typed analytics event to Google Analytics.
 * No-ops gracefully when gtag is unavailable (ad blockers, SSR, disabled).
 *
 * @param {AnalyticsEvent} event
 */
export function trackEvent(event) {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (!shouldTrack()) return;

  try {
    const { name, ...rest } = event;
    const params = 'params' in rest ? rest.params : undefined;
    window.gtag('event', name, params);
    logger.debug(`Tracked: ${name}`, params ?? '');
  } catch (err) {
    logger.error('trackEvent failed:', err);
  }
}
