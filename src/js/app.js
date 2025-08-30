/**
 * LinkedInify - Main Application Controller
 * Modern ES6+ architecture with dependency injection and error handling
 */

import { EventEmitter } from './utils/event-emitter.js';
import { Logger } from './utils/logger.js';
import { Config } from './config/app-config.js';
import { ThemeManager } from './modules/theme-manager.js';
import { PreviewManager } from './modules/preview-manager.js';
import { HistoryManager } from './modules/history-manager.js';
import { ContentConverter } from './modules/content-converter.js';
import { TitleGenerator } from './modules/title-generator.js';
import { MarkdownProcessor } from './modules/markdown-processor.js';
import { UIManager } from './modules/ui-manager.js';
import { KeyboardManager } from './modules/keyboard-manager.js';
import { ClipboardManager } from './modules/clipboard-manager.js';
import { ServiceWorkerManager } from './modules/service-worker-manager.js';
import { EditorManager } from './modules/editor-manager.js';

/**
 * Main Application Class
 * Coordinates all modules and manages application lifecycle
 */
class LinkedInifyApp extends EventEmitter {
  constructor() {
    super();
    
    this.config = Config;
    this.logger = new Logger('LinkedInifyApp');
    this.modules = new Map();
    this.isInitialized = false;
    
    this.logger.info('LinkedInify initializing...');
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      this.logger.info('Starting application initialization');
      
      await this.initializeModules();
      this.setupEventListeners();
      this.setupErrorHandling();
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        await this.start();
      }
      
      this.isInitialized = true;
      this.logger.info('Application initialization completed');
      
    } catch (error) {
      this.logger.error('Failed to initialize application:', error);
      this.handleCriticalError(error);
    }
  }

  /**
   * Initialize all application modules
   */
  async initializeModules() {
    const moduleConfigs = [
      ['serviceWorker', ServiceWorkerManager, { app: this }],
      ['theme', ThemeManager, { app: this }],
      ['editor', EditorManager, { app: this }],
      ['markdown', MarkdownProcessor, { app: this }],
      ['converter', ContentConverter, { app: this }],
      ['titleGenerator', TitleGenerator, { app: this }],
      ['preview', PreviewManager, { app: this }],
      ['history', HistoryManager, { app: this }],
      ['keyboard', KeyboardManager, { app: this }],
      ['clipboard', ClipboardManager, { app: this }],
      ['ui', UIManager, { app: this }],
    ];

    for (const [name, ModuleClass, config] of moduleConfigs) {
      try {
        this.logger.debug(`Initializing ${name} module`);
        const module = new ModuleClass(config);
        
        if (typeof module.init === 'function') {
          await module.init();
        }
        
        this.modules.set(name, module);
        this.logger.debug(`${name} module initialized successfully`);
        
      } catch (error) {
        this.logger.error(`Failed to initialize ${name} module:`, error);
        throw new Error(`Module initialization failed: ${name}`);
      }
    }
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Listen to module events
    this.modules.forEach((module, name) => {
      if (module instanceof EventEmitter) {
        module.on('error', error => {
          this.logger.error(`Error from ${name} module:`, error);
          this.emit('moduleError', { module: name, error });
        });
      }
    });

    // Window events
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    window.addEventListener('online', () => {
      this.logger.info('Application is online');
      this.emit('networkStatusChanged', { online: true });
    });

    window.addEventListener('offline', () => {
      this.logger.info('Application is offline');
      this.emit('networkStatusChanged', { online: false });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.logger.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason);
      event.preventDefault();
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    window.addEventListener('error', event => {
      this.logger.error('Global error:', event.error);
      this.handleError(event.error);
    });
  }

  /**
   * Start the application
   */
  async start() {
    try {
      this.logger.info('Starting application');
      
      // Load initial state
      await this.modules.get('theme').loadTheme();
      await this.modules.get('history').loadHistory();
      
      // Initialize UI
      this.modules.get('preview').setInitialMode();
      this.modules.get('ui').showStatus('LinkedInify ready! Start writing your content.', 'info');
      
      // Emit ready event
      this.emit('ready');
      
      this.logger.info('Application started successfully');
      
    } catch (error) {
      this.logger.error('Failed to start application:', error);
      this.handleCriticalError(error);
    }
  }

  /**
   * Get a module by name
   */
  getModule(name) {
    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`Module not found: ${name}`);
    }
    return module;
  }

  /**
   * Convert markdown content
   */
  async convertMarkdown() {
    try {
      const markdownInput = document.getElementById('markdownInput');
      const htmlPreview = document.getElementById('htmlPreview');
      const linkedinPreview = document.getElementById('linkedinPreview');
      
      if (!markdownInput || !htmlPreview || !linkedinPreview) {
        throw new Error('Required DOM elements not found');
      }

      const markdown = markdownInput.value;
      
      // Process HTML preview
      const htmlContent = await this.modules.get('markdown').toHtml(markdown);
      htmlPreview.innerHTML = htmlContent;
      
      // Process LinkedIn preview
      const linkedinContent = await this.modules.get('converter').markdownToLinkedIn(markdown);
      linkedinPreview.textContent = linkedinContent;
      
      // Auto-save
      this.modules.get('history').autoSave(markdown);
      
      this.emit('contentConverted', { markdown, html: htmlContent, linkedin: linkedinContent });
      
    } catch (error) {
      this.logger.error('Failed to convert markdown:', error);
      this.handleError(error);
    }
  }

  /**
   * Save current post
   */
  async saveCurrentPost() {
    try {
      const content = document.getElementById('markdownInput')?.value?.trim();
      if (!content) {
        this.modules.get('ui').showStatus('Please write some content first!', 'error');
        return;
      }
      
      const postId = await this.modules.get('history').savePost('', content);
      this.modules.get('ui').showStatus('Post saved successfully!', 'success');
      
      this.emit('postSaved', { postId, content });
      
    } catch (error) {
      this.logger.error('Failed to save post:', error);
      this.handleError(error);
    }
  }

  /**
   * Handle non-critical errors
   */
  handleError(error) {
    this.modules.get('ui')?.showStatus(
      `Error: ${error.message || 'Something went wrong'}`, 
      'error'
    );
    this.emit('error', error);
  }

  /**
   * Handle critical errors that prevent app functionality
   */
  handleCriticalError(error) {
    this.logger.error('Critical error occurred:', error);
    
    // Show user-friendly error message
    const errorContainer = document.getElementById('error-container') || document.body;
    errorContainer.innerHTML = `
      <div class="critical-error">
        <h2>🚨 Application Error</h2>
        <p>LinkedInify encountered a critical error and cannot continue.</p>
        <p>Please refresh the page to restart the application.</p>
        <button onclick="window.location.reload()" class="error-reload-btn">
          Reload Application
        </button>
        <details style="margin-top: 1rem;">
          <summary>Technical Details</summary>
          <pre>${error.stack || error.message}</pre>
        </details>
      </div>
    `;
    
    this.emit('criticalError', error);
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.logger.info('Cleaning up application resources');
    
    this.modules.forEach((module, name) => {
      try {
        if (typeof module.cleanup === 'function') {
          module.cleanup();
        }
      } catch (error) {
        this.logger.error(`Error cleaning up ${name} module:`, error);
      }
    });
    
    this.removeAllListeners();
  }

  /**
   * Get application health status
   */
  getHealthStatus() {
    const status = {
      initialized: this.isInitialized,
      modules: {},
      timestamp: new Date().toISOString(),
    };

    this.modules.forEach((module, name) => {
      status.modules[name] = {
        loaded: !!module,
        healthy: typeof module.isHealthy === 'function' ? module.isHealthy() : true,
      };
    });

    return status;
  }
}

// Create and export global app instance
const app = new LinkedInifyApp();

// Initialize when module loads
app.init().catch(error => {
  console.error('Failed to initialize LinkedInify:', error);
});

// Export for global access and testing
export { LinkedInifyApp };
export default app;