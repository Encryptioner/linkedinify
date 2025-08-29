/**
 * Keyboard Manager Module
 * Handles keyboard shortcuts and accessibility
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';
import { Config } from '../config/app-config.js';

export class KeyboardManager extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('KeyboardManager');
    this.shortcuts = new Map();
    this.isEnabled = true;
  }

  /**
   * Initialize keyboard manager
   */
  async init() {
    try {
      this.logger.debug('Initializing keyboard manager');
      this.setupShortcuts();
      this.setupEventListeners();
      this.logger.info('Keyboard manager initialized');
    } catch (error) {
      this.logger.error('Failed to initialize keyboard manager:', error);
      throw error;
    }
  }

  /**
   * Setup keyboard shortcuts
   */
  setupShortcuts() {
    // Text formatting shortcuts
    this.registerShortcut('Ctrl+B', () => this.app.formatText('**', '**'), 'Bold text');
    this.registerShortcut('Ctrl+I', () => this.app.formatText('*', '*'), 'Italic text');
    this.registerShortcut('Ctrl+K', () => this.insertLink(), 'Insert link');
    
    // Document shortcuts
    this.registerShortcut('Ctrl+S', () => this.app.saveCurrentPost(), 'Save post');
    this.registerShortcut('Ctrl+Enter', () => this.app.convertMarkdown(), 'Convert markdown');
    this.registerShortcut('Ctrl+Shift+C', () => this.copyToClipboard(), 'Copy to clipboard');
    
    // UI shortcuts
    this.registerShortcut('Ctrl+H', () => this.toggleHistory(), 'Toggle history');
    this.registerShortcut('Ctrl+Shift+T', () => this.toggleTheme(), 'Toggle theme');
    this.registerShortcut('Ctrl+/', () => this.showShortcutsModal(), 'Show shortcuts help');
    
    // Navigation shortcuts
    this.registerShortcut('Escape', () => this.handleEscape(), 'Close modals');
    
    // Quick formatting
    this.registerShortcut('Ctrl+1', () => this.insertHeading(1), 'Heading 1');
    this.registerShortcut('Ctrl+2', () => this.insertHeading(2), 'Heading 2');
    this.registerShortcut('Ctrl+3', () => this.insertHeading(3), 'Heading 3');
    
    // List shortcuts
    this.registerShortcut('Ctrl+Shift+8', () => this.insertList('- '), 'Bullet list');
    this.registerShortcut('Ctrl+Shift+7', () => this.insertList('1. '), 'Numbered list');
    
    // Code shortcuts
    this.registerShortcut('Ctrl+`', () => this.app.formatText('`', '`'), 'Inline code');
    this.registerShortcut('Ctrl+Shift+`', () => this.insertCodeBlock(), 'Code block');
  }

  /**
   * Register a keyboard shortcut
   */
  registerShortcut(key, handler, description) {
    const normalizedKey = this.normalizeKey(key);
    
    this.shortcuts.set(normalizedKey, {
      handler,
      description,
      key: normalizedKey,
    });
    
    this.logger.debug(`Registered shortcut: ${key} - ${description}`);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregisterShortcut(key) {
    const normalizedKey = this.normalizeKey(key);
    const removed = this.shortcuts.delete(normalizedKey);
    
    if (removed) {
      this.logger.debug(`Unregistered shortcut: ${key}`);
    }
    
    return removed;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this), { passive: false });
    
    // Handle focus management
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
  }

  /**
   * Handle keydown events
   */
  handleKeyDown(event) {
    if (!this.isEnabled) return;

    // Don't handle shortcuts in input fields (except markdown input)
    const target = event.target;
    const isMarkdownInput = target.id === 'markdownInput';
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
    
    // Allow shortcuts in markdown input and non-input elements
    if (!isMarkdownInput && isInput) return;

    const keyCombo = this.getKeyCombo(event);
    const shortcut = this.shortcuts.get(keyCombo);
    
    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        shortcut.handler();
        this.emit('shortcutExecuted', { 
          key: keyCombo, 
          description: shortcut.description 
        });
      } catch (error) {
        this.logger.error(`Error executing shortcut ${keyCombo}:`, error);
        this.emit('shortcutError', { key: keyCombo, error });
      }
    }
  }

  /**
   * Handle focus in events
   */
  handleFocusIn(event) {
    const target = event.target;
    
    // Add focus indicator for accessibility
    if (target.matches('.toolbar-btn, .preview-btn, .history-toggle, .theme-toggle')) {
      target.setAttribute('data-focused', 'true');
    }
    
    this.emit('focusChanged', { target, focused: true });
  }

  /**
   * Handle focus out events
   */
  handleFocusOut(event) {
    const target = event.target;
    
    // Remove focus indicator
    target.removeAttribute('data-focused');
    
    this.emit('focusChanged', { target, focused: false });
  }

  /**
   * Get key combination string from event
   */
  getKeyCombo(event) {
    const parts = [];
    
    if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    
    // Handle special keys
    let key = event.key;
    
    if (key === ' ') key = 'Space';
    else if (key === 'Enter') key = 'Enter';
    else if (key === 'Escape') key = 'Escape';
    else if (key === 'Tab') key = 'Tab';
    else if (key === 'Backspace') key = 'Backspace';
    else if (key === 'Delete') key = 'Delete';
    else if (key.length === 1) key = key.toUpperCase();
    
    parts.push(key);
    
    return parts.join('+');
  }

  /**
   * Normalize key string for consistent storage
   */
  normalizeKey(keyString) {
    return keyString
      .replace(/\s+/g, '')
      .split('+')
      .map(part => {
        if (part.toLowerCase() === 'cmd') return 'Ctrl';
        if (part.toLowerCase() === 'ctrl') return 'Ctrl';
        if (part.toLowerCase() === 'alt') return 'Alt';
        if (part.toLowerCase() === 'shift') return 'Shift';
        return part.toUpperCase();
      })
      .join('+');
  }

  /**
   * Insert heading
   */
  async insertHeading(level) {
    const prefix = '#'.repeat(level) + ' ';
    await this.app.formatText(prefix, '');
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
   * Copy to clipboard
   */
  async copyToClipboard() {
    const uiManager = this.app.getModule('ui');
    if (uiManager && uiManager.copyToClipboard) {
      await uiManager.copyToClipboard();
    }
  }

  /**
   * Toggle history
   */
  toggleHistory() {
    const historyManager = this.app.getModule('history');
    if (historyManager && historyManager.toggleSidebar) {
      historyManager.toggleSidebar();
    }
  }

  /**
   * Toggle theme
   */
  async toggleTheme() {
    const themeManager = this.app.getModule('theme');
    if (themeManager && themeManager.toggle) {
      await themeManager.toggle();
    }
  }

  /**
   * Show shortcuts modal
   */
  showShortcutsModal() {
    const modal = document.getElementById('shortcutsModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      
      // Focus close button for accessibility
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.focus();
      }
      
      this.emit('modalOpened', { modal: 'shortcuts' });
    }
  }

  /**
   * Hide shortcuts modal
   */
  hideShortcutsModal() {
    const modal = document.getElementById('shortcutsModal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      
      // Return focus to markdown input
      const markdownInput = document.getElementById('markdownInput');
      if (markdownInput) {
        markdownInput.focus();
      }
      
      this.emit('modalClosed', { modal: 'shortcuts' });
    }
  }

  /**
   * Handle escape key
   */
  handleEscape() {
    // Close any open modals
    const modals = document.querySelectorAll('.modal[aria-hidden="false"]');
    modals.forEach(modal => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    });
    
    // Close history sidebar if open
    const historySidebar = document.getElementById('historySidebar');
    if (historySidebar && historySidebar.classList.contains('open')) {
      const historyManager = this.app.getModule('history');
      if (historyManager && historyManager.closeSidebar) {
        historyManager.closeSidebar();
      }
    }
    
    this.emit('escapePressed');
  }

  /**
   * Enable keyboard shortcuts
   */
  enable() {
    this.isEnabled = true;
    this.logger.debug('Keyboard shortcuts enabled');
    this.emit('enabled');
  }

  /**
   * Disable keyboard shortcuts
   */
  disable() {
    this.isEnabled = false;
    this.logger.debug('Keyboard shortcuts disabled');
    this.emit('disabled');
  }

  /**
   * Get all registered shortcuts
   */
  getShortcuts() {
    return Array.from(this.shortcuts.entries()).map(([key, data]) => ({
      key,
      description: data.description,
    }));
  }

  /**
   * Get shortcuts by category
   */
  getShortcutsByCategory() {
    const categories = {
      formatting: [],
      document: [],
      navigation: [],
      ui: [],
    };

    this.shortcuts.forEach((data, key) => {
      const { description } = data;
      
      if (description.includes('Bold') || description.includes('Italic') || 
          description.includes('Heading') || description.includes('list') ||
          description.includes('code') || description.includes('link')) {
        categories.formatting.push({ key, description });
      } else if (description.includes('Save') || description.includes('Convert') ||
                 description.includes('Copy')) {
        categories.document.push({ key, description });
      } else if (description.includes('Toggle') || description.includes('Show') ||
                 description.includes('Close')) {
        categories.ui.push({ key, description });
      } else {
        categories.navigation.push({ key, description });
      }
    });

    return categories;
  }

  /**
   * Check if keyboard manager is healthy
   */
  isHealthy() {
    return {
      healthy: true,
      enabled: this.isEnabled,
      shortcutsRegistered: this.shortcuts.size,
      hasEventListeners: true,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('focusin', this.handleFocusIn.bind(this));
    document.removeEventListener('focusout', this.handleFocusOut.bind(this));
    
    this.shortcuts.clear();
    this.removeAllListeners();
    this.logger.debug('Keyboard manager cleaned up');
  }
}