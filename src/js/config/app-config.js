/**
 * Application Configuration
 * Centralized configuration management with environment-specific settings
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const Config = {
  // Application metadata
  app: {
    name: 'LinkedInify',
    version: '1.0.0',
    description: 'Convert Markdown to LinkedIn posts offline. Privacy-first, AI-powered, and works everywhere.',
    author: 'Ankur Mursalin',
    repository: 'https://github.com/encryptioner/linkedinify',
    homepage: 'https://ncryptioner.github.io/linkedinify',
  },

  // Environment settings
  env: {
    isDevelopment,
    isProduction,
    logLevel: isDevelopment ? 'debug' : 'info',
  },

  // Storage configuration
  storage: {
    keys: {
      theme: 'linkedinify_theme',
      posts: 'linkedinify_posts',
      settings: 'linkedinify_settings',
      draft: 'linkedinify_draft',
      analytics: 'linkedinify_analytics',
    },
    limits: {
      maxHistoryItems: 100,
      maxDraftSize: 50000, // 50KB
      maxPostSize: 100000, // 100KB
    },
  },

  // UI configuration
  ui: {
    theme: {
      default: 'light',
      available: ['light', 'dark'],
    },
    preview: {
      modes: {
        linkedin: ['light', 'dark'],
        device: ['web', 'mobile'],
      },
      defaults: {
        linkedinTheme: 'light',
        deviceView: 'web',
      },
    },
    animations: {
      duration: 300, // milliseconds
      easing: 'ease-in-out',
    },
    autoSave: {
      delay: 500, // milliseconds
      enabled: true,
    },
  },

  // Content processing
  content: {
    markdown: {
      options: {
        breaks: true,
        gfm: true,
        smartLists: true,
        smartypants: true,
      },
    },
    conversion: {
      preserveEmojis: true,
      maxLineLength: 200,
      codeBlockBorder: '┌──────────────────┐',
    },
    titleGeneration: {
      maxLength: 50,
      fallbackTitle: 'LinkedIn Post',
    },
  },

  // Features configuration
  features: {
    serviceWorker: {
      enabled: isProduction,
      updateInterval: 24 * 60 * 60 * 1000, // 24 hours
    },
    analytics: {
      enabled: false, // Privacy-first: disabled by default
      events: ['app_start', 'content_converted', 'post_saved'],
    },
    clipboard: {
      fallbackEnabled: true,
      formats: ['text/plain', 'text/html'],
    },
    keyboard: {
      shortcuts: {
        bold: 'Ctrl+B',
        italic: 'Ctrl+I',
        save: 'Ctrl+S',
        convert: 'Ctrl+Enter',
      },
    },
  },

  // API endpoints (if any external services are used)
  api: {
    baseUrl: isDevelopment ? 'http://localhost:3000' : 'https://api.linkedinify.app',
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
  },

  // Performance settings
  performance: {
    debounce: {
      input: 300, // Input debounce delay
      resize: 100, // Window resize debounce
      scroll: 16, // Scroll event throttle (60fps)
    },
    lazy: {
      images: true,
      components: true,
    },
  },

  // Security settings
  security: {
    sanitization: {
      html: true,
      allowedTags: ['b', 'i', 'em', 'strong', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br'],
      allowedAttributes: {},
    },
    storage: {
      encryption: false, // Could be enabled for sensitive data
      validation: true,
    },
  },

  // PWA settings
  pwa: {
    name: 'LinkedInify',
    shortName: 'LinkedInify',
    themeColor: '#0077b5',
    backgroundColor: '#ffffff',
    display: 'standalone',
    orientation: 'portrait-primary',
    scope: isProduction ? '/linkedinify/' : '/',
    startUrl: isProduction ? '/linkedinify/' : '/',
  },

  // Monitoring and logging
  monitoring: {
    errorReporting: {
      enabled: isProduction,
      maxErrors: 10,
      cooldown: 60000, // 1 minute
    },
    performance: {
      enabled: isDevelopment,
      markTiming: true,
      measureUserTiming: true,
    },
  },

  // Development tools
  dev: {
    hotReload: isDevelopment,
    debugMode: isDevelopment,
    mockData: isDevelopment,
    skipServiceWorker: isDevelopment,
  },
};

// Environment-specific overrides
if (isDevelopment) {
  Config.storage.limits.maxHistoryItems = 50; // Smaller limit for dev
  Config.ui.animations.duration = 100; // Faster animations for dev
}

// Freeze configuration to prevent accidental mutations
Object.freeze(Config);

export default Config;