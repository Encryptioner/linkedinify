/**
 * UI Manager Module
 * Manages UI interactions, status messages, and general interface behavior
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';
import { Config } from '../config/app-config.js';

export class UIManager extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('UIManager');
    this.statusTimeout = null;
  }

  /**
   * Initialize UI manager
   */
  async init() {
    try {
      this.logger.debug('Initializing UI manager');
      this.setupEventListeners();
      this.setupToolbarActions();
      this.setupLoadingStates();
      this.setupHistoryEventListeners();
      this.logger.info('UI manager initialized');
    } catch (error) {
      this.logger.error('Failed to initialize UI manager:', error);
      throw error;
    }
  }

  /**
   * Set up global UI event listeners
   */
  setupEventListeners() {
    // Save post button
    const saveBtn = document.getElementById('savePostBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (this.app.saveCurrentPost) {
          this.app.saveCurrentPost();
        }
      });
    }

    // Load example button
    const loadExampleBtn = document.getElementById('loadExampleBtn');
    if (loadExampleBtn) {
      loadExampleBtn.addEventListener('click', () => {
        this.loadExample();
      });
    }

    // Convert button
    const convertBtn = document.getElementById('convertBtn');
    if (convertBtn) {
      convertBtn.addEventListener('click', () => {
        if (this.app.convertMarkdown) {
          this.app.convertMarkdown();
        }
      });
    }

    // Copy buttons
    const copyBtnLinkedIn = document.getElementById('copyBtnLinkedIn');
    if (copyBtnLinkedIn) {
      copyBtnLinkedIn.addEventListener('click', () => {
        this.copyLinkedInContent();
      });
    }

    const copyBtnHTML = document.getElementById('copyBtnHTML');
    if (copyBtnHTML) {
      copyBtnHTML.addEventListener('click', () => {
        this.copyHTMLContent();
      });
    }

    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Real-time markdown conversion on input
    const markdownInput = document.getElementById('markdownInput');
    if (markdownInput) {
      markdownInput.addEventListener('input', () => {
        if (this.app.convertMarkdown) {
          this.app.convertMarkdown();
        }
      });
    }
  }

  /**
   * Set up toolbar button actions
   */
  setupToolbarActions() {
    document.addEventListener('click', (event) => {
      const target = event.target;
      
      if (target.matches('.toolbar-btn[data-action]')) {
        event.preventDefault();
        this.handleToolbarAction(target.dataset.action);
      }
    });
  }

  /**
   * Handle toolbar button actions
   */
  async handleToolbarAction(action) {
    try {
      this.logger.debug(`Handling toolbar action: ${action}`);
      
      if (!this.app) {
        this.logger.error('App instance not available');
        return;
      }

      switch (action) {
        case 'bold':
          if (typeof this.app.formatText === 'function') {
            await this.app.formatText('**', '**');
          } else {
            this.logger.error('app.formatText is not a function');
          }
          break;
        case 'italic':
          if (typeof this.app.formatText === 'function') {
            await this.app.formatText('*', '*');
          } else {
            this.logger.error('app.formatText is not a function');
          }
          break;
        case 'code':
          if (typeof this.app.formatText === 'function') {
            await this.app.formatText('`', '`');
          } else {
            this.logger.error('app.formatText is not a function');
          }
          break;
        case 'h1':
          await this.formatHeading(1);
          break;
        case 'h2':
          await this.formatHeading(2);
          break;
        case 'h3':
          await this.formatHeading(3);
          break;
        case 'ul':
          await this.insertList('- ');
          break;
        case 'ol':
          await this.insertList('1. ');
          break;
        case 'quote':
          await this.app.formatText('> ', '');
          break;
        case 'codeblock':
          await this.insertCodeBlock();
          break;
        case 'link':
          await this.insertLink();
          break;
        default:
          this.logger.warn(`Unknown toolbar action: ${action}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle toolbar action ${action}:`, error);
      this.showStatus(`Failed to apply ${action} formatting`, 'error');
    }
  }

  /**
   * Format heading
   */
  async formatHeading(level) {
    const prefix = '#'.repeat(level) + ' ';
    const textarea = document.getElementById('markdownInput');
    
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    const replacement = prefix + selectedText;
    
    textarea.value = 
      value.substring(0, selectionStart) + 
      replacement + 
      value.substring(selectionEnd);
    
    textarea.focus();
    textarea.setSelectionRange(
      selectionStart + prefix.length, 
      selectionStart + prefix.length + selectedText.length
    );
    
    if (this.app.convertMarkdown) {
      await this.app.convertMarkdown();
    }
  }

  /**
   * Insert list
   */
  async insertList(prefix) {
    const textarea = document.getElementById('markdownInput');
    if (!textarea) return;

    const { selectionStart, value } = textarea;
    const lines = value.split('\n');
    let currentLine = 0;
    let charCount = 0;
    
    // Find current line
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= selectionStart) {
        currentLine = i;
        break;
      }
      charCount += lines[i].length + 1;
    }
    
    lines[currentLine] = prefix + lines[currentLine];
    textarea.value = lines.join('\n');
    textarea.focus();
    
    if (this.app.convertMarkdown) {
      await this.app.convertMarkdown();
    }
  }

  /**
   * Insert code block
   */
  async insertCodeBlock() {
    const textarea = document.getElementById('markdownInput');
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    const replacement = '```\n' + selectedText + '\n```';
    
    textarea.value = 
      value.substring(0, selectionStart) + 
      replacement + 
      value.substring(selectionEnd);
    
    textarea.focus();
    textarea.setSelectionRange(
      selectionStart + 4, 
      selectionStart + 4 + selectedText.length
    );
    
    if (this.app.convertMarkdown) {
      await this.app.convertMarkdown();
    }
  }

  /**
   * Insert link
   */
  async insertLink() {
    const textarea = document.getElementById('markdownInput');
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    const replacement = `[${selectedText || 'link text'}](https://example.com)`;
    
    textarea.value = 
      value.substring(0, selectionStart) + 
      replacement + 
      value.substring(selectionEnd);
    
    textarea.focus();
    
    if (!selectedText) {
      textarea.setSelectionRange(selectionStart + 1, selectionStart + 10);
    }
    
    if (this.app.convertMarkdown) {
      await this.app.convertMarkdown();
    }
  }

  /**
   * Load example content
   */
  loadExample() {
    const example = `# 🚀 5 Game-Changing LinkedIn Tips for 2024

## Why Your Profile Matters More Than Ever

Your LinkedIn profile is your **digital business card** and *professional story* combined.

Here's what successful professionals do differently:

- Optimize headlines with keywords
- Share valuable industry insights 
- Engage meaningfully with connections
- Post consistently (3-4 times per week)

> "Your network is your net worth" - Porter Gale

### Pro Tip: Use Data

\`\`\`javascript
const engagement = posts.filter(post => 
    post.likes > 100 && post.comments > 10
);
\`\`\`

**Ready to level up your LinkedIn game?**

What's your biggest LinkedIn challenge? Drop it in the comments! 👇

#LinkedIn #Professional #Networking #Career`;

    const markdownInput = document.getElementById('markdownInput');
    if (markdownInput) {
      markdownInput.value = example;
      if (this.app.convertMarkdown) {
        this.app.convertMarkdown();
      }
      this.showStatus('Example content loaded!', 'success');
    }
  }

  /**
   * Copy content to clipboard
   */
  async copyToClipboard() {
    try {
      const content = document.getElementById('linkedinPreview')?.textContent;
      
      if (!content || !content.trim()) {
        this.showStatus('Please convert some content first!', 'error');
        return;
      }

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
        this.showCopySuccess();
      } else {
        this.fallbackCopy(content);
      }
      
    } catch (error) {
      this.logger.error('Failed to copy to clipboard:', error);
      this.showStatus('Copy failed. Please try again.', 'error');
    }
  }

  /**
   * Fallback copy method for older browsers
   */
  fallbackCopy(content) {
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
      document.execCommand('copy');
      this.showCopySuccess();
    } catch (err) {
      this.logger.error('Fallback copy failed:', err);
      this.showStatus('Copy failed. Please select and copy manually.', 'error');
    }
    
    document.body.removeChild(textarea);
  }

  /**
   * Show copy success message
   */
  showCopySuccess() {
    const btn = document.getElementById('copyBtn');
    if (!btn) return;

    const originalText = btn.textContent;
    
    btn.textContent = '✅ Copied!';
    btn.classList.add('copied');
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 2000);
    
    this.showStatus('Copied to clipboard! Ready to paste on LinkedIn.', 'success');
  }

  /**
   * Switch between tabs
   */
  switchTab(tabName) {
    // Update tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      if (content.id === `${tabName}PreviewTab`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    this.emit('tabChanged', { tab: tabName });
  }

  /**
   * Copy LinkedIn content to clipboard
   */
  async copyLinkedInContent() {
    try {
      const content = document.getElementById('linkedinPreview')?.textContent;
      
      if (!content || !content.trim()) {
        this.showStatus('Please convert some content first!', 'error');
        return;
      }

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
        this.showCopySuccessForButton('copyBtnLinkedIn', 'LinkedIn content');
      } else {
        this.fallbackCopy(content);
      }
      
    } catch (error) {
      this.logger.error('Failed to copy LinkedIn content:', error);
      this.showStatus('Copy failed. Please try again.', 'error');
    }
  }

  /**
   * Copy HTML content to clipboard
   */
  async copyHTMLContent() {
    try {
      const content = document.getElementById('htmlPreview')?.innerHTML;
      
      if (!content || !content.trim()) {
        this.showStatus('Please convert some content first!', 'error');
        return;
      }

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
        this.showCopySuccessForButton('copyBtnHTML', 'HTML content');
      } else {
        this.fallbackCopy(content);
      }
      
    } catch (error) {
      this.logger.error('Failed to copy HTML content:', error);
      this.showStatus('Copy failed. Please try again.', 'error');
    }
  }

  /**
   * Show copy success for specific button
   */
  showCopySuccessForButton(buttonId, contentType) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    const originalText = btn.textContent;
    
    btn.textContent = '✅ Copied!';
    btn.classList.add('copied');
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 2000);
    
    this.showStatus(`${contentType} copied to clipboard!`, 'success');
  }

  /**
   * Show status message
   */
  showStatus(message, type = 'info', duration = 4000) {
    const status = document.getElementById('status');
    if (!status) return;

    // Clear previous timeout
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }

    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    // Auto-hide after duration
    this.statusTimeout = setTimeout(() => {
      status.style.display = 'none';
    }, duration);

    this.emit('statusShown', { message, type });
  }

  /**
   * Hide status message
   */
  hideStatus() {
    const status = document.getElementById('status');
    if (status) {
      status.style.display = 'none';
    }
    
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = null;
    }
  }

  /**
   * Setup loading states for async operations
   */
  setupLoadingStates() {
    // Show loading indicators for buttons during async operations
    this.on('operationStart', ({ button }) => {
      if (button) {
        button.disabled = true;
        button.classList.add('loading');
      }
    });

    this.on('operationEnd', ({ button }) => {
      if (button) {
        button.disabled = false;
        button.classList.remove('loading');
      }
    });
  }

  /**
   * Show loading indicator
   */
  showLoading(element) {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    
    if (element) {
      element.classList.add('loading');
      element.disabled = true;
      this.emit('operationStart', { button: element });
    }
  }

  /**
   * Hide loading indicator
   */
  hideLoading(element) {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    
    if (element) {
      element.classList.remove('loading');
      element.disabled = false;
      this.emit('operationEnd', { button: element });
    }
  }

  /**
   * Update UI based on app state
   */
  updateUI(state) {
    // Update button states based on content
    const markdownInput = document.getElementById('markdownInput');
    const hasContent = markdownInput && markdownInput.value.trim().length > 0;
    
    const saveBtn = document.getElementById('savePostBtn');
    const convertBtn = document.getElementById('convertBtn');
    
    if (convertBtn) convertBtn.disabled = !hasContent;
    
    // For save button, check if content has changed since last save
    if (saveBtn) {
      if (!hasContent) {
        saveBtn.disabled = true;
      } else if (this.app.modules?.has('history')) {
        // Check if content has changed since last save
        const hasChanged = this.app.modules.get('history').hasContentChanged('', markdownInput.value);
        saveBtn.disabled = !hasChanged;
      } else {
        saveBtn.disabled = !hasContent;
      }
    }
    
    // Update copy buttons based on preview content
    const copyBtnLinkedIn = document.getElementById('copyBtnLinkedIn');
    const copyBtnHTML = document.getElementById('copyBtnHTML');
    
    if (copyBtnLinkedIn) {
      const linkedinContent = document.getElementById('linkedinPreview')?.textContent;
      copyBtnLinkedIn.disabled = !linkedinContent || !linkedinContent.trim();
    }
    
    if (copyBtnHTML) {
      const htmlContent = document.getElementById('htmlPreview')?.innerHTML;
      copyBtnHTML.disabled = !htmlContent || !htmlContent.trim();
    }
  }

  /**
   * Set up event listeners for history events
   */
  setupHistoryEventListeners() {
    if (this.app.modules?.has('history')) {
      const historyModule = this.app.modules.get('history');
      
      // Listen for post not changed events
      historyModule.on('postNotChanged', (data) => {
        if (data.reason === 'No changes detected') {
          this.showStatus('No changes to save', 'info', 2000);
        } else if (data.reason === 'Duplicate post exists') {
          this.showStatus('This post already exists in history', 'info', 3000);
        }
      });

      // Listen for successful saves
      historyModule.on('postSaved', (data) => {
        this.showStatus(`Post saved: ${data.post.title}`, 'success', 3000);
        // Update UI to reflect new state
        this.updateUI();
      });

      // Listen for post loads
      historyModule.on('postLoaded', (data) => {
        this.showStatus(`Post loaded: ${data.post.title}`, 'success', 2000);
        // Update UI to reflect new state
        this.updateUI();
      });
    }
  }

  /**
   * Get UI state
   */
  getUIState() {
    return {
      statusVisible: document.getElementById('status')?.style.display !== 'none',
      loadingElements: document.querySelectorAll('.loading').length,
    };
  }

  /**
   * Check if UI manager is healthy
   */
  isHealthy() {
    const requiredElements = [
      'markdownInput',
      'htmlPreview', 
      'linkedinPreview',
      'status'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    return {
      healthy: missingElements.length === 0,
      missingElements,
      hasRequiredButtons: !!document.getElementById('savePostBtn'),
      hasTabInterface: !!document.querySelector('.tab-btn'),
      hasCopyButtons: !!(document.getElementById('copyBtnLinkedIn') && document.getElementById('copyBtnHTML')),
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }
    
    this.removeAllListeners();
    this.logger.debug('UI manager cleaned up');
  }
}