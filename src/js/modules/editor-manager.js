/**
 * Editor Manager Module
 * Manages the markdown editor functionality
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';

export class EditorManager extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('EditorManager');
    this.textarea = document.getElementById('markdownInput');
    this.history = [];
    this.historyIndex = -1;
  }

  init() {
    this.logger.debug('Initializing EditorManager');
    if (this.textarea) {
      this.textarea.addEventListener('input', () => this.saveState());
      this.saveState(); // Initial state
    }
  }

  saveState() {
    if (!this.textarea) return;
    const { value, selectionStart, selectionEnd } = this.textarea;
    const currentState = { value, selectionStart, selectionEnd };

    // If we are not at the end of the history, truncate it
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(currentState);
    this.historyIndex++;
    this.emit('historyChanged', { canUndo: this.canUndo(), canRedo: this.canRedo() });
  }

  undo() {
    if (this.canUndo()) {
      this.historyIndex--;
      this.restoreState();
    }
  }

  redo() {
    if (this.canRedo()) {
      this.historyIndex++;
      this.restoreState();
    }
  }

  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  restoreState() {
    if (!this.textarea || this.historyIndex < 0 || this.historyIndex >= this.history.length) return;
    const state = this.history[this.historyIndex];
    this.textarea.value = state.value;
    this.textarea.setSelectionRange(state.selectionStart, state.selectionEnd);
    this.app.convertMarkdown();
    this.emit('historyChanged', { canUndo: this.canUndo(), canRedo: this.canRedo() });
  }

  formatText(prefix, suffix = prefix) {
    if (!this.textarea) return;
    
    // Save state before making changes
    this.saveState();
    
    const { selectionStart, selectionEnd, value } = this.textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    // Use manual text replacement instead of execCommand for better compatibility
    const beforeText = value.substring(0, selectionStart);
    const afterText = value.substring(selectionEnd);
    const newText = `${prefix}${selectedText}${suffix}`;
    
    // Store scroll position and focus state before making changes
    const scrollTop = this.textarea.scrollTop;
    const hadFocus = document.activeElement === this.textarea;
    
    this.textarea.value = beforeText + newText + afterText;
    
    // Set cursor position without causing scroll jump
    const newCursorStart = selectionStart + prefix.length;
    const newCursorEnd = newCursorStart + selectedText.length;
    
    // Restore scroll position BEFORE setting selection to prevent jumping
    this.textarea.scrollTop = scrollTop;
    
    if (hadFocus) {
      this.textarea.focus();
    }
    this.textarea.setSelectionRange(newCursorStart, newCursorEnd);
    
    // Ensure scroll position is maintained after selection
    requestAnimationFrame(() => {
      this.textarea.scrollTop = scrollTop;
    });
    
    // Trigger markdown conversion
    if (this.app.convertMarkdown) {
      this.app.convertMarkdown();
    }
  }
}