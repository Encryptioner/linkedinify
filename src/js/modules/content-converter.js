/**
 * Content Converter Module
 * Converts Markdown to LinkedIn-ready plain text
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';
import { Config } from '../config/app-config.js';

export class ContentConverter extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('ContentConverter');
  }

  /**
   * Initialize content converter
   */
  async init() {
    try {
      this.logger.debug('Initializing content converter');
      this.logger.info('Content converter initialized');
    } catch (error) {
      this.logger.error('Failed to initialize content converter:', error);
      throw error;
    }
  }

  /**
   * Convert Markdown to LinkedIn-ready text
   */
  async markdownToLinkedIn(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }

    try {
      let converted = markdown.trim();

      // Convert headers (remove markdown syntax, keep content)
      converted = converted.replace(/^### (.*$)/gm, '$1');
      converted = converted.replace(/^## (.*$)/gm, '$1');
      converted = converted.replace(/^# (.*$)/gm, '$1');

      // Preserve bold and italic formatting (LinkedIn supports these)
      converted = converted.replace(/\*\*\*(.*?)\*\*\*/g, '***$1***');
      converted = converted.replace(/\*\*(.*?)\*\*/g, '**$1**');
      converted = converted.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, '*$1*');

      // Convert code blocks to readable format
      converted = converted.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
        const lines = code.trim().split('\n');
        const border = '─'.repeat(Math.min(40, Math.max(...lines.map(line => line.length))));
        return `\n┌─${border}─┐\n${lines.map(line => `│ ${line.padEnd(Math.max(...lines.map(l => l.length)))} │`).join('\n')}\n└─${border}─┘\n`;
      });

      // Convert inline code (remove backticks but preserve content)
      converted = converted.replace(/`([^`]+)`/g, '$1');

      // Convert blockquotes to thought bubbles or quotes
      converted = converted.replace(/^> (.*$)/gm, '💭 $1');

      // Convert unordered lists
      converted = converted.replace(/^[\s]*[-*+] (.*$)/gm, '• $1');

      // Convert ordered lists with proper numbering
      converted = this.convertOrderedLists(converted);

      // Convert markdown links to readable format
      converted = converted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

      // Clean up extra whitespace while preserving intentional spacing
      converted = converted.replace(/\n{3,}/g, '\n\n');

      // Final trim
      converted = converted.trim();

      this.emit('contentConverted', { 
        original: markdown, 
        converted, 
        length: converted.length 
      });

      return converted;

    } catch (error) {
      this.logger.error('Failed to convert markdown:', error);
      this.emit('error', error);
      return markdown; // Return original on error
    }
  }

  /**
   * Convert ordered lists with proper numbering
   */
  convertOrderedLists(text) {
    const lines = text.split('\n');
    const result = [];
    let listNumber = 1;
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const listMatch = line.match(/^[\s]*\d+\. (.*)$/);

      if (listMatch) {
        if (!inList) {
          listNumber = 1;
          inList = true;
        }
        result.push(`${listNumber}. ${listMatch[1]}`);
        listNumber++;
      } else {
        // Reset numbering if we encounter a non-list line
        if (line.trim() !== '') {
          inList = false;
          listNumber = 1;
        }
        result.push(line);
      }
    }

    return result.join('\n');
  }

  /**
   * Convert content for Twitter (character limit)
   */
  async markdownToTwitter(markdown, maxLength = 280) {
    const linkedinText = await this.markdownToLinkedIn(markdown);
    
    if (linkedinText.length <= maxLength) {
      return linkedinText;
    }

    // Truncate with ellipsis
    return linkedinText.substring(0, maxLength - 3) + '...';
  }

  /**
   * Convert content for Medium (preserve more formatting)
   */
  async markdownToMedium(markdown) {
    // Medium supports more markdown, so minimal conversion needed
    let converted = markdown.trim();
    
    // Convert code blocks to Medium-style
    converted = converted.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
      return `\n    ${code.trim().split('\n').join('\n    ')}\n`;
    });

    return converted;
  }

  /**
   * Get content statistics
   */
  getContentStats(text) {
    if (!text) return null;

    const words = text.trim().split(/\s+/).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const lines = text.split('\n').length;
    const paragraphs = text.split('\n\n').filter(p => p.trim()).length;

    return {
      words,
      characters,
      charactersNoSpaces,
      lines,
      paragraphs,
      readingTime: Math.ceil(words / 200), // Assuming 200 WPM
    };
  }

  /**
   * Clean up text for better readability
   */
  cleanupText(text) {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Normalize line breaks
      .trim();
  }

  /**
   * Validate content for LinkedIn
   */
  validateForLinkedIn(text) {
    const maxLength = 3000; // LinkedIn post limit
    const warnings = [];
    
    if (text.length > maxLength) {
      warnings.push(`Content exceeds LinkedIn's ${maxLength} character limit (${text.length} characters)`);
    }

    // Check for excessive hashtags
    const hashtags = (text.match(/#\w+/g) || []).length;
    if (hashtags > 30) {
      warnings.push(`Too many hashtags (${hashtags}). LinkedIn recommends 3-5 hashtags.`);
    }

    // Check for excessive mentions
    const mentions = (text.match(/@\w+/g) || []).length;
    if (mentions > 10) {
      warnings.push(`High number of mentions (${mentions}). Consider reducing for better reach.`);
    }

    return {
      valid: warnings.length === 0,
      warnings,
      stats: this.getContentStats(text),
    };
  }

  /**
   * Generate content preview
   */
  generatePreview(text, maxLength = 100) {
    if (!text) return '';
    
    const preview = text.substring(0, maxLength);
    return preview + (text.length > maxLength ? '...' : '');
  }

  /**
   * Convert HTML to plain text (for pasting into LinkedIn)
   */
  htmlToPlainText(html) {
    // Create temporary element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Convert common HTML elements
    tempDiv.querySelectorAll('strong, b').forEach(el => {
      el.outerHTML = `**${el.textContent}**`;
    });
    
    tempDiv.querySelectorAll('em, i').forEach(el => {
      el.outerHTML = `*${el.textContent}*`;
    });
    
    tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
      el.outerHTML = `\n${el.textContent}\n`;
    });
    
    tempDiv.querySelectorAll('p').forEach(el => {
      el.outerHTML = `\n${el.textContent}\n`;
    });
    
    tempDiv.querySelectorAll('li').forEach(el => {
      el.outerHTML = `\n• ${el.textContent}`;
    });
    
    tempDiv.querySelectorAll('br').forEach(el => {
      el.outerHTML = '\n';
    });
    
    return this.cleanupText(tempDiv.textContent || tempDiv.innerText);
  }

  /**
   * Check if converter is healthy
   */
  isHealthy() {
    return {
      healthy: true,
      conversionMethods: ['markdownToLinkedIn', 'markdownToTwitter', 'markdownToMedium'].length,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.removeAllListeners();
    this.logger.debug('Content converter cleaned up');
  }
}