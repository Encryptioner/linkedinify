/**
 * Content Converter Module
 * Converts Markdown to LinkedIn-ready plain text
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';

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
   * Convert Markdown to LinkedIn-ready text with proper formatting
   */
  async markdownToLinkedIn(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }

    try {
      let converted = markdown.trim();

      // IMPORTANT: Process blocks BEFORE inline formatting to avoid conflicts
      // Convert unordered lists FIRST (before italic to prevent *item being treated as italic)
      converted = converted.replace(/^[\s]*[-*+] (.*$)/gm, '• $1');

      // Convert ordered lists with proper numbering
      converted = this.convertOrderedLists(converted);

      // Now process inline formatting (lists are already converted, so no conflicts)
      // Convert bold and italic with proper LinkedIn formatting
      converted = converted.replace(/\*\*\*(.*?)\*\*\*/g, '***$1***');
      converted = converted.replace(/\*\*(.*?)\*\*/g, (_match, text) => {
        return this.toBoldUnicode(text);
      });
      // Italic with word boundaries to avoid matching already-converted lists
      converted = converted.replace(/(?<!\*)\*(?!\*)([^*\n]+)(?<!\*)\*(?!\*)/g, (_match, text) => {
        // Skip if already converted to bullet point
        if (text.trim().startsWith('•')) return _match;
        return this.toItalicStyle(text);
      });

      // Now convert headers to bold Unicode characters (inline formatting already processed)
      converted = converted.replace(/^### (.*$)/gm, (_match, text) => {
        return this.toBoldUnicode(text) + '\n';
      });
      converted = converted.replace(/^## (.*$)/gm, (_match, text) => {
        return this.toBoldUnicode(text) + '\n';
      });
      converted = converted.replace(/^# (.*$)/gm, (_match, text) => {
        return this.toBoldUnicode(text) + '\n';
      });

      // Convert code blocks with proper LinkedIn format
      converted = converted.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (_match, lang, code) => {
        const language = (lang || 'CODE').toUpperCase();
        const lines = code.trim().split('\n');
        const codeBlock = lines.map(line => `│ ${line}`).join('\n');
        return `\n┌─── 💻 ${language} ───\n${codeBlock}\n└────────────────────\n`;
      });

      // Convert inline code (keep as is for now)
      converted = converted.replace(/`([^`]+)`/g, '$1');

      // Convert blockquotes
      converted = converted.replace(/^> (.*$)/gm, '💭 $1');

      // Convert markdown links to readable format
      converted = converted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

      // Preserve double newlines but remove triple+
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
   * Detect if text contains non-Latin characters
   * Supports: Arabic, Hebrew, Devanagari, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam,
   *           Thai, Lao, Tibetan, Myanmar, Khmer, Chinese, Japanese, Korean, Cyrillic, Greek, Armenian, Georgian, etc.
   */
  hasNonLatinChars(text) {
    // Comprehensive Unicode ranges for non-Latin scripts
    const nonLatinRegex = /[\u0400-\u04FF\u0500-\u052F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0780-\u07BF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1780-\u17FF\u1800-\u18AF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uAC00-\uD7AF]/;
    return nonLatinRegex.test(text);
  }

  /**
   * Convert text to bold Unicode characters for LinkedIn
   * Clean approach: Latin gets Unicode bold, non-Latin stays plain
   */
  toBoldUnicode(text) {
    const boldMap = {
      'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜',
      'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥',
      'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
      'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶',
      'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿',
      's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
      '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
    };

    // Convert Latin characters to bold Unicode, keep non-Latin characters as-is
    // This creates clean output: "𝗘𝗻𝗴𝗹𝗶𝘀𝗵 and বাংলা" instead of cluttered emoji markers
    return text.split('').map(char => boldMap[char] || char).join('');
  }

  /**
   * Convert text to italic Unicode characters for LinkedIn
   * Uses Mathematical Italic Unicode characters for Latin script
   */
  toItalicUnicode(text) {
    const italicMap = {
      'A': '𝐴', 'B': '𝐵', 'C': '𝐶', 'D': '𝐷', 'E': '𝐸', 'F': '𝐹', 'G': '𝐺', 'H': '𝐻', 'I': '𝐼',
      'J': '𝐽', 'K': '𝐾', 'L': '𝐿', 'M': '𝑀', 'N': '𝑁', 'O': '𝑂', 'P': '𝑃', 'Q': '𝑄', 'R': '𝑅',
      'S': '𝑆', 'T': '𝑇', 'U': '𝑈', 'V': '𝑉', 'W': '𝑊', 'X': '𝑋', 'Y': '𝑌', 'Z': '𝑍',
      'a': '𝑎', 'b': '𝑏', 'c': '𝑐', 'd': '𝑑', 'e': '𝑒', 'f': '𝑓', 'g': '𝑔', 'h': 'ℎ', 'i': '𝑖',
      'j': '𝑗', 'k': '𝑘', 'l': '𝑙', 'm': '𝑚', 'n': '𝑛', 'o': '𝑜', 'p': '𝑝', 'q': '𝑞', 'r': '𝑟',
      's': '𝑠', 't': '𝑡', 'u': '𝑢', 'v': '𝑣', 'w': '𝑤', 'x': '𝑥', 'y': '𝑦', 'z': '𝑧'
    };

    // Convert Latin characters to italic Unicode, keep non-Latin characters as-is
    return text.split('').map(char => italicMap[char] || char).join('');
  }

  /**
   * Alias for backward compatibility
   */
  toItalicStyle(text) {
    return this.toItalicUnicode(text);
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
    converted = converted.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (_match, _lang, code) => {
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