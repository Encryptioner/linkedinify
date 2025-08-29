/**
 * Clipboard Manager Module
 * Advanced clipboard functionality with fallbacks and format support
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';
import { Config } from '../config/app-config.js';

export class ClipboardManager extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('ClipboardManager');
    this.isSupported = typeof navigator !== 'undefined' && 'clipboard' in navigator;
    this.isSecureContext = typeof window !== 'undefined' && window.isSecureContext;
  }

  /**
   * Initialize clipboard manager
   */
  async init() {
    try {
      this.logger.debug('Initializing clipboard manager');
      this.checkCapabilities();
      this.logger.info(`Clipboard manager initialized (supported: ${this.isSupported}, secure: ${this.isSecureContext})`);
    } catch (error) {
      this.logger.error('Failed to initialize clipboard manager:', error);
      throw error;
    }
  }

  /**
   * Check clipboard capabilities
   */
  checkCapabilities() {
    this.capabilities = {
      read: this.isSupported && this.isSecureContext && 'read' in navigator.clipboard,
      write: this.isSupported && this.isSecureContext && 'writeText' in navigator.clipboard,
      readText: this.isSupported && this.isSecureContext && 'readText' in navigator.clipboard,
      writeText: this.isSupported && this.isSecureContext && 'writeText' in navigator.clipboard,
      fallbackSupported: typeof document !== 'undefined' && 'execCommand' in document,
    };

    this.logger.debug('Clipboard capabilities:', this.capabilities);
  }

  /**
   * Copy text to clipboard
   */
  async copyText(text, format = 'text/plain') {
    if (!text || typeof text !== 'string') {
      throw new Error('Text must be a non-empty string');
    }

    try {
      // Try modern clipboard API first
      if (this.capabilities.writeText) {
        await navigator.clipboard.writeText(text);
        this.logger.debug(`Copied ${text.length} characters using Clipboard API`);
        
        this.emit('copied', { 
          text, 
          format, 
          method: 'clipboard-api',
          length: text.length 
        });
        
        return true;
      }
      
      // Fallback to execCommand
      if (this.capabilities.fallbackSupported) {
        const success = this.fallbackCopyText(text);
        if (success) {
          this.logger.debug(`Copied ${text.length} characters using fallback method`);
          
          this.emit('copied', { 
            text, 
            format, 
            method: 'exec-command',
            length: text.length 
          });
          
          return true;
        }
      }
      
      throw new Error('No clipboard method available');
      
    } catch (error) {
      this.logger.error('Failed to copy text:', error);
      this.emit('copyError', { text, error });
      throw error;
    }
  }

  /**
   * Fallback copy method using execCommand
   */
  fallbackCopyText(text) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      textarea.style.opacity = '0';
      
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      return success;
      
    } catch (error) {
      this.logger.error('Fallback copy failed:', error);
      return false;
    }
  }

  /**
   * Read text from clipboard
   */
  async readText() {
    if (!this.capabilities.readText) {
      throw new Error('Reading from clipboard is not supported');
    }

    try {
      const text = await navigator.clipboard.readText();
      
      this.emit('read', { 
        text, 
        length: text.length 
      });
      
      return text;
      
    } catch (error) {
      this.logger.error('Failed to read from clipboard:', error);
      this.emit('readError', { error });
      throw error;
    }
  }

  /**
   * Copy rich content with multiple formats
   */
  async copyRichContent(content) {
    const { text, html } = content;
    
    if (!text) {
      throw new Error('Text content is required');
    }

    try {
      // Try to copy with multiple formats
      if (this.capabilities.write && html) {
        const clipboardItems = [
          new ClipboardItem({
            'text/plain': new Blob([text], { type: 'text/plain' }),
            'text/html': new Blob([html], { type: 'text/html' }),
          })
        ];
        
        await navigator.clipboard.write(clipboardItems);
        
        this.emit('copiedRich', { 
          text, 
          html, 
          method: 'clipboard-api',
          formats: ['text/plain', 'text/html']
        });
        
        return true;
      }
      
      // Fallback to plain text
      return await this.copyText(text);
      
    } catch (error) {
      this.logger.error('Failed to copy rich content:', error);
      
      // Try plain text fallback
      try {
        await this.copyText(text);
        this.logger.warn('Fell back to plain text copy');
        return true;
      } catch (fallbackError) {
        this.emit('copyError', { content, error: fallbackError });
        throw fallbackError;
      }
    }
  }

  /**
   * Copy LinkedIn-ready content
   */
  async copyLinkedInContent() {
    try {
      const linkedinPreview = document.getElementById('linkedinPreview');
      
      if (!linkedinPreview) {
        throw new Error('LinkedIn preview element not found');
      }
      
      const text = linkedinPreview.textContent || linkedinPreview.innerText || '';
      
      if (!text.trim()) {
        throw new Error('No content to copy');
      }
      
      await this.copyText(text, 'text/plain');
      
      this.emit('linkedinCopied', { 
        text, 
        length: text.length 
      });
      
      return text;
      
    } catch (error) {
      this.logger.error('Failed to copy LinkedIn content:', error);
      throw error;
    }
  }

  /**
   * Copy markdown content
   */
  async copyMarkdownContent() {
    try {
      const markdownInput = document.getElementById('markdownInput');
      
      if (!markdownInput) {
        throw new Error('Markdown input element not found');
      }
      
      const text = markdownInput.value || '';
      
      if (!text.trim()) {
        throw new Error('No markdown content to copy');
      }
      
      await this.copyText(text, 'text/markdown');
      
      this.emit('markdownCopied', { 
        text, 
        length: text.length 
      });
      
      return text;
      
    } catch (error) {
      this.logger.error('Failed to copy markdown content:', error);
      throw error;
    }
  }

  /**
   * Copy HTML content
   */
  async copyHtmlContent() {
    try {
      const htmlPreview = document.getElementById('htmlPreview');
      
      if (!htmlPreview) {
        throw new Error('HTML preview element not found');
      }
      
      const html = htmlPreview.innerHTML || '';
      const text = htmlPreview.textContent || htmlPreview.innerText || '';
      
      if (!html.trim() && !text.trim()) {
        throw new Error('No HTML content to copy');
      }
      
      // Try to copy both HTML and plain text
      if (html.trim()) {
        await this.copyRichContent({ text, html });
      } else {
        await this.copyText(text, 'text/plain');
      }
      
      this.emit('htmlCopied', { 
        html, 
        text, 
        length: text.length 
      });
      
      return { html, text };
      
    } catch (error) {
      this.logger.error('Failed to copy HTML content:', error);
      throw error;
    }
  }

  /**
   * Auto-detect and copy content based on active section
   */
  async copyAutoDetect() {
    try {
      // Determine which section is most relevant
      const markdownInput = document.getElementById('markdownInput');
      const linkedinPreview = document.getElementById('linkedinPreview');
      const htmlPreview = document.getElementById('htmlPreview');
      
      const hasMarkdown = markdownInput && markdownInput.value.trim();
      const hasLinkedIn = linkedinPreview && linkedinPreview.textContent.trim();
      const hasHtml = htmlPreview && htmlPreview.innerHTML.trim();
      
      // Priority: LinkedIn > HTML > Markdown
      if (hasLinkedIn) {
        return await this.copyLinkedInContent();
      } else if (hasHtml) {
        return await this.copyHtmlContent();
      } else if (hasMarkdown) {
        return await this.copyMarkdownContent();
      } else {
        throw new Error('No content available to copy');
      }
      
    } catch (error) {
      this.logger.error('Auto-detect copy failed:', error);
      throw error;
    }
  }

  /**
   * Paste content into markdown input
   */
  async pasteToMarkdown() {
    if (!this.capabilities.readText) {
      throw new Error('Reading from clipboard is not supported');
    }

    try {
      const text = await this.readText();
      const markdownInput = document.getElementById('markdownInput');
      
      if (!markdownInput) {
        throw new Error('Markdown input element not found');
      }
      
      // Insert at cursor position or replace selection
      const start = markdownInput.selectionStart;
      const end = markdownInput.selectionEnd;
      const currentValue = markdownInput.value;
      
      markdownInput.value = 
        currentValue.substring(0, start) + 
        text + 
        currentValue.substring(end);
      
      // Move cursor to end of pasted content
      const newPosition = start + text.length;
      markdownInput.setSelectionRange(newPosition, newPosition);
      markdownInput.focus();
      
      // Trigger conversion
      if (this.app.convertMarkdown) {
        await this.app.convertMarkdown();
      }
      
      this.emit('pasted', { 
        text, 
        length: text.length,
        position: newPosition 
      });
      
      return text;
      
    } catch (error) {
      this.logger.error('Failed to paste content:', error);
      throw error;
    }
  }

  /**
   * Clear clipboard (if supported)
   */
  async clearClipboard() {
    try {
      await this.copyText('');
      this.emit('cleared');
      return true;
    } catch (error) {
      this.logger.error('Failed to clear clipboard:', error);
      return false;
    }
  }

  /**
   * Get clipboard permissions status
   */
  async getPermissionsStatus() {
    if (!this.isSupported) {
      return { read: 'unsupported', write: 'unsupported' };
    }

    try {
      const readPermission = await navigator.permissions.query({ name: 'clipboard-read' });
      const writePermission = await navigator.permissions.query({ name: 'clipboard-write' });
      
      return {
        read: readPermission.state,
        write: writePermission.state,
      };
    } catch (error) {
      this.logger.warn('Failed to query clipboard permissions:', error);
      return { read: 'unknown', write: 'unknown' };
    }
  }

  /**
   * Test clipboard functionality
   */
  async testClipboard() {
    const results = {
      supported: this.isSupported,
      secureContext: this.isSecureContext,
      capabilities: this.capabilities,
      permissions: await this.getPermissionsStatus(),
      writeTest: false,
      readTest: false,
    };

    try {
      // Test write
      const testText = 'LinkedInify clipboard test ' + Date.now();
      await this.copyText(testText);
      results.writeTest = true;
      
      // Test read (if supported)
      if (this.capabilities.readText) {
        const readText = await this.readText();
        results.readTest = readText === testText;
      }
      
    } catch (error) {
      this.logger.warn('Clipboard test failed:', error);
    }

    return results;
  }

  /**
   * Get usage statistics
   */
  getStats() {
    // This would typically be stored and retrieved from localStorage
    // For now, return basic info
    return {
      supported: this.isSupported,
      capabilities: this.capabilities,
      lastOperation: Date.now(), // Placeholder
    };
  }

  /**
   * Check if clipboard manager is healthy
   */
  isHealthy() {
    return {
      healthy: true,
      supported: this.isSupported,
      secureContext: this.isSecureContext,
      hasWriteCapability: this.capabilities.writeText || this.capabilities.fallbackSupported,
      hasReadCapability: this.capabilities.readText,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.removeAllListeners();
    this.logger.debug('Clipboard manager cleaned up');
  }
}