/**
 * History Manager Module
 * Handles post saving, loading, and history management with localStorage
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';
import { Config } from '../config/app-config.js';

export class HistoryManager extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('HistoryManager');
    this.posts = [];
    this.autoSaveTimeout = null;
    this.isOpen = false;
    this.lastSavedContent = null;
    this.lastSavedTitle = null;
  }

  /**
   * Initialize history manager
   */
  async init() {
    try {
      this.logger.debug('Initializing history manager');
      this.setupEventListeners();
      await this.loadHistory();
      this.logger.info('History manager initialized');
    } catch (error) {
      this.logger.error('Failed to initialize history manager:', error);
      throw error;
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // History toggle button
    const historyToggle = document.getElementById('historyToggle');
    if (historyToggle) {
      historyToggle.addEventListener('click', () => this.toggleSidebar());
    }

    // Close history button
    const closeBtn = document.getElementById('closeHistoryBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeSidebar());
    }

    // Handle clicks outside sidebar to close
    document.addEventListener('click', (event) => {
      const sidebar = document.getElementById('historySidebar');
      const toggleBtn = document.getElementById('historyToggle');
      
      if (this.isOpen && sidebar && !sidebar.contains(event.target) && event.target !== toggleBtn) {
        this.closeSidebar();
      }
    });
  }

  /**
   * Load history from localStorage
   */
  async loadHistory() {
    try {
      const stored = localStorage.getItem(Config.storage.keys.posts);
      this.posts = stored ? JSON.parse(stored) : [];
      
      // Validate posts structure
      this.posts = this.posts.filter(post => 
        post && typeof post === 'object' && post.id && post.content
      );

      this.renderHistory();
      this.logger.debug(`Loaded ${this.posts.length} posts from history`);
      
    } catch (error) {
      this.logger.error('Failed to load history:', error);
      this.posts = [];
    }
  }

  /**
   * Save a post to history
   */
  async savePost(title, content) {
    if (!content || typeof content !== 'string' || !content.trim()) {
      throw new Error('Content is required to save a post');
    }

    const trimmedContent = content.trim();
    const finalTitle = title || this.generateTitle(trimmedContent);

    // Check if content or title has changed since last save
    if (this.lastSavedContent === trimmedContent && this.lastSavedTitle === finalTitle) {
      this.logger.debug('Content unchanged, skipping duplicate save');
      this.emit('postNotChanged', { reason: 'No changes detected' });
      return null;
    }

    // Check if identical post already exists
    const duplicatePost = this.posts.find(post => 
      post.content === trimmedContent && post.title === finalTitle
    );

    if (duplicatePost) {
      this.logger.debug('Duplicate post exists, skipping save');
      this.emit('postNotChanged', { reason: 'Duplicate post exists', existingPost: duplicatePost });
      return duplicatePost;
    }

    try {
      const post = {
        id: Date.now().toString(),
        title: finalTitle,
        content: trimmedContent,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        preview: this.generatePreview(trimmedContent),
      };

      // Update last saved state
      this.lastSavedContent = trimmedContent;
      this.lastSavedTitle = finalTitle;

      // Add to beginning of array
      this.posts.unshift(post);

      // Limit history size
      if (this.posts.length > Config.storage.limits.maxHistoryItems) {
        this.posts = this.posts.slice(0, Config.storage.limits.maxHistoryItems);
      }

      // Save to localStorage
      localStorage.setItem(Config.storage.keys.posts, JSON.stringify(this.posts));

      // Update UI
      this.renderHistory();

      this.emit('postSaved', { post });
      this.logger.info(`Post saved: ${post.title}`);
      
      return post.id;
      
    } catch (error) {
      this.logger.error('Failed to save post:', error);
      throw error;
    }
  }

  /**
   * Load a post by ID
   */
  async loadPost(postId) {
    try {
      const post = this.posts.find(p => p.id === postId);
      
      if (!post) {
        throw new Error(`Post not found: ${postId}`);
      }

      const markdownInput = document.getElementById('markdownInput');
      if (markdownInput) {
        markdownInput.value = post.content;
        // Reset saved state to current loaded content
        this.resetSavedState(post.title, post.content);
        // Trigger conversion
        if (this.app.convertMarkdown) {
          await this.app.convertMarkdown();
        }
      }

      this.emit('postLoaded', { post });
      this.logger.info(`Post loaded: ${post.title}`);
      
    } catch (error) {
      this.logger.error(`Failed to load post ${postId}:`, error);
      this.emit('error', error);
    }
  }

  /**
   * Delete a post by ID
   */
  async deletePost(postId) {
    try {
      const postIndex = this.posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) {
        throw new Error(`Post not found: ${postId}`);
      }

      const deletedPost = this.posts.splice(postIndex, 1)[0];
      
      // Save updated history
      localStorage.setItem(Config.storage.keys.posts, JSON.stringify(this.posts));
      
      // Update UI
      this.renderHistory();

      this.emit('postDeleted', { post: deletedPost });
      this.logger.info(`Post deleted: ${deletedPost.title}`);
      
    } catch (error) {
      this.logger.error(`Failed to delete post ${postId}:`, error);
      this.emit('error', error);
    }
  }

  /**
   * Auto-save draft content
   */
  autoSave(content) {
    if (!Config.ui.autoSave.enabled) return;

    clearTimeout(this.autoSaveTimeout);
    
    this.autoSaveTimeout = setTimeout(() => {
      if (content && content.trim()) {
        try {
          localStorage.setItem(Config.storage.keys.draft, content);
          this.emit('draftSaved', { content });
        } catch (error) {
          this.logger.warn('Failed to auto-save draft:', error);
        }
      }
    }, Config.ui.autoSave.delay);
  }

  /**
   * Generate title from content
   */
  generateTitle(content) {
    if (!content) return 'Untitled Post';

    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return 'Untitled Post';

    const firstLine = lines[0].trim();
    
    // Check if first line is a heading
    if (firstLine.startsWith('#')) {
      return firstLine.replace(/^#+\s*/, '').substring(0, Config.content.titleGeneration.maxLength);
    }

    // Use first sentence or line
    const firstSentence = firstLine.split('.')[0] || firstLine;
    return firstSentence.substring(0, Config.content.titleGeneration.maxLength) + 
           (firstSentence.length > Config.content.titleGeneration.maxLength ? '...' : '');
  }

  /**
   * Generate preview text
   */
  generatePreview(content, maxLength = 100) {
    if (!content) return '';
    
    const cleanContent = content
      .replace(/^#+\s*/gm, '') // Remove headings
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/>\s*/gm, '') // Remove quotes
      .replace(/[-*+]\s*/gm, '') // Remove list markers
      .replace(/\d+\.\s*/gm, '') // Remove numbered lists
      .trim();

    return cleanContent.substring(0, maxLength) + (cleanContent.length > maxLength ? '...' : '');
  }

  /**
   * Render history in sidebar
   */
  renderHistory() {
    const container = document.getElementById('historyContent');
    if (!container) return;

    if (this.posts.length === 0) {
      container.innerHTML = '<p class="history-placeholder">No saved posts yet. Create your first post!</p>';
      return;
    }

    const html = this.posts.map(post => `
      <div class="history-item" data-post-id="${post.id}">
        <div class="history-item-header">
          <h4 class="history-item-title">${this.escapeHtml(post.title)}</h4>
          <div class="history-item-actions">
            <button class="history-action-btn load-btn" data-post-id="${post.id}" title="Load post">
              📄
            </button>
            <button class="history-action-btn delete-btn" data-post-id="${post.id}" title="Delete post">
              🗑️
            </button>
          </div>
        </div>
        <p class="history-item-preview">${this.escapeHtml(post.preview)}</p>
        <div class="history-item-meta">
          <span class="history-item-date">${new Date(post.created).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;

    // Add event listeners to buttons
    container.querySelectorAll('.load-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.loadPost(btn.dataset.postId);
      });
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this post?')) {
          this.deletePost(btn.dataset.postId);
        }
      });
    });
  }

  /**
   * Toggle history sidebar
   */
  toggleSidebar() {
    if (this.isOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  /**
   * Open history sidebar
   */
  openSidebar() {
    const sidebar = document.getElementById('historySidebar');
    if (sidebar) {
      sidebar.classList.add('open');
      sidebar.setAttribute('aria-hidden', 'false');
      this.isOpen = true;
      this.renderHistory();
      this.emit('sidebarOpened');
    }
  }

  /**
   * Close history sidebar
   */
  closeSidebar() {
    const sidebar = document.getElementById('historySidebar');
    if (sidebar) {
      sidebar.classList.remove('open');
      sidebar.setAttribute('aria-hidden', 'true');
      this.isOpen = false;
      this.emit('sidebarClosed');
    }
  }

  /**
   * Clear all history
   */
  async clearHistory() {
    try {
      this.posts = [];
      localStorage.removeItem(Config.storage.keys.posts);
      this.renderHistory();
      
      this.emit('historyCleared');
      this.logger.info('History cleared');
      
    } catch (error) {
      this.logger.error('Failed to clear history:', error);
      throw error;
    }
  }

  /**
   * Export history as JSON
   */
  exportHistory() {
    return {
      version: Config.app.version,
      exportDate: new Date().toISOString(),
      posts: this.posts,
    };
  }

  /**
   * Import history from JSON
   */
  async importHistory(data) {
    try {
      if (!data || !Array.isArray(data.posts)) {
        throw new Error('Invalid import data format');
      }

      this.posts = data.posts.filter(post => 
        post && typeof post === 'object' && post.id && post.content
      );

      localStorage.setItem(Config.storage.keys.posts, JSON.stringify(this.posts));
      this.renderHistory();
      
      this.emit('historyImported', { count: this.posts.length });
      this.logger.info(`Imported ${this.posts.length} posts`);
      
    } catch (error) {
      this.logger.error('Failed to import history:', error);
      throw error;
    }
  }

  /**
   * Escape HTML for safe rendering
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get history statistics
   */
  getStats() {
    return {
      totalPosts: this.posts.length,
      oldestPost: this.posts.length > 0 ? this.posts[this.posts.length - 1].created : null,
      newestPost: this.posts.length > 0 ? this.posts[0].created : null,
      averageContentLength: this.posts.length > 0 
        ? Math.round(this.posts.reduce((sum, post) => sum + post.content.length, 0) / this.posts.length)
        : 0,
    };
  }

  /**
   * Check if current content has changed since last save
   */
  hasContentChanged(title, content) {
    if (!content || typeof content !== 'string') {
      return false;
    }

    const trimmedContent = content.trim();
    const finalTitle = title || this.generateTitle(trimmedContent);

    return this.lastSavedContent !== trimmedContent || this.lastSavedTitle !== finalTitle;
  }

  /**
   * Reset last saved state (call when content is loaded from history)
   */
  resetSavedState(title, content) {
    this.lastSavedContent = content?.trim() || null;
    this.lastSavedTitle = title || null;
  }

  /**
   * Check if history manager is healthy
   */
  isHealthy() {
    return {
      healthy: true,
      postsLoaded: this.posts.length,
      storageAvailable: typeof localStorage !== 'undefined',
      sidebarExists: !!document.getElementById('historySidebar'),
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    this.removeAllListeners();
    this.logger.debug('History manager cleaned up');
  }
}