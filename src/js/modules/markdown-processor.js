/**
 * Markdown Processor Module
 * Handles markdown parsing and HTML generation
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';
import { Config } from '../config/app-config.js';
import { marked } from 'marked';

export class MarkdownProcessor extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('MarkdownProcessor');
  }

  /**
   * Initialize markdown processor
   */
  async init() {
    try {
      this.logger.debug('Initializing markdown processor');
      this.setupMarkedOptions();
      this.logger.info('Markdown processor initialized');
    } catch (error) {
      this.logger.error('Failed to initialize markdown processor:', error);
      throw error;
    }
  }

  /**
   * Setup marked.js options
   */
  setupMarkedOptions() {
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        ...Config.content.markdown.options,
        sanitize: false,
        silent: false,
      });
    }
  }

  /**
   * Convert markdown to HTML
   */
  async toHtml(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }

    try {
      if (!marked) {
        this.logger.warn('Marked.js not available, returning plain text');
        return this.fallbackHtmlConversion(markdown);
      }

      const html = marked.parse(markdown);
      
      // Sanitize HTML if enabled
      const sanitized = Config.security.sanitization.html 
        ? this.sanitizeHtml(html)
        : html;

      this.emit('htmlGenerated', { 
        markdown, 
        html: sanitized,
        length: sanitized.length 
      });

      return sanitized;

    } catch (error) {
      this.logger.error('Failed to convert markdown to HTML:', error);
      this.emit('error', error);
      return this.fallbackHtmlConversion(markdown);
    }
  }

  /**
   * Fallback HTML conversion when marked.js is not available
   */
  fallbackHtmlConversion(markdown) {
    let html = markdown;

    // Basic conversions
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  /**
   * Sanitize HTML to prevent XSS
   */
  sanitizeHtml(html) {
    const allowedTags = new Set(Config.security.sanitization.allowedTags);
    const allowedAttributes = Config.security.sanitization.allowedAttributes;

    // Create temporary element for parsing
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Recursively clean elements
    this.cleanElement(tempDiv, allowedTags, allowedAttributes);

    return tempDiv.innerHTML;
  }

  /**
   * Clean HTML element recursively
   */
  cleanElement(element, allowedTags, allowedAttributes) {
    const children = Array.from(element.children);
    
    children.forEach(child => {
      const tagName = child.tagName.toLowerCase();
      
      if (!allowedTags.has(tagName)) {
        // Replace with text content
        const textNode = document.createTextNode(child.textContent);
        child.parentNode.replaceChild(textNode, child);
      } else {
        // Clean attributes
        const attributes = Array.from(child.attributes);
        attributes.forEach(attr => {
          const attrName = attr.name.toLowerCase();
          const allowedAttrs = allowedAttributes[tagName] || [];
          
          if (!allowedAttrs.includes(attrName)) {
            child.removeAttribute(attr.name);
          }
        });
        
        // Recursively clean children
        this.cleanElement(child, allowedTags, allowedAttributes);
      }
    });
  }

  /**
   * Convert HTML back to markdown (useful for editing)
   */
  htmlToMarkdown(html) {
    if (!html) return '';

    let markdown = html;

    // Convert common HTML tags back to markdown
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1');
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1');
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1');
    markdown = markdown.replace(/<h4>(.*?)<\/h4>/g, '#### $1');
    markdown = markdown.replace(/<h5>(.*?)<\/h5>/g, '##### $1');
    markdown = markdown.replace(/<h6>(.*?)<\/h6>/g, '###### $1');

    markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    markdown = markdown.replace(/<b>(.*?)<\/b>/g, '**$1**');
    markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
    markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');
    markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`');

    markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)');
    
    markdown = markdown.replace(/<ul>(.*?)<\/ul>/gs, (match, content) => {
      return content.replace(/<li>(.*?)<\/li>/g, '- $1');
    });
    
    markdown = markdown.replace(/<ol>(.*?)<\/ol>/gs, (match, content) => {
      let counter = 1;
      return content.replace(/<li>(.*?)<\/li>/g, () => `${counter++}. $1`);
    });

    markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/gs, (match, content) => {
      return content.split('\n').map(line => `> ${line}`).join('\n');
    });

    markdown = markdown.replace(/<br\s*\/?>/g, '\n');
    markdown = markdown.replace(/<p>(.*?)<\/p>/gs, '\n$1\n');

    // Clean up extra whitespace
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

    return markdown;
  }

  /**
   * Extract plain text from markdown
   */
  toPlainText(markdown) {
    if (!markdown) return '';

    let text = markdown;

    // Remove markdown syntax
    text = text.replace(/^#{1,6}\s+/gm, ''); // Headers
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
    text = text.replace(/\*(.*?)\*/g, '$1'); // Italic
    text = text.replace(/`(.*?)`/g, '$1'); // Inline code
    text = text.replace(/```[\s\S]*?```/g, ''); // Code blocks
    text = text.replace(/^\s*[-*+]\s+/gm, ''); // List items
    text = text.replace(/^\s*\d+\.\s+/gm, ''); // Numbered lists
    text = text.replace(/^>\s+/gm, ''); // Blockquotes
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links

    // Clean up whitespace
    text = text.replace(/\n{2,}/g, '\n').trim();

    return text;
  }

  /**
   * Get markdown statistics
   */
  getMarkdownStats(markdown) {
    if (!markdown) return null;

    const plainText = this.toPlainText(markdown);
    const lines = markdown.split('\n');
    
    // Count different elements
    const headers = (markdown.match(/^#{1,6}\s+/gm) || []).length;
    const boldText = (markdown.match(/\*\*(.*?)\*\*/g) || []).length;
    const italicText = (markdown.match(/\*(.*?)\*/g) || []).length;
    const codeBlocks = (markdown.match(/```[\s\S]*?```/g) || []).length;
    const inlineCode = (markdown.match(/`(.*?)`/g) || []).length;
    const links = (markdown.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
    const images = (markdown.match(/!\[([^\]]*)\]\([^)]+\)/g) || []).length;
    const lists = (markdown.match(/^\s*[-*+]\s+/gm) || []).length;
    const numberedLists = (markdown.match(/^\s*\d+\.\s+/gm) || []).length;
    const blockquotes = (markdown.match(/^>\s+/gm) || []).length;

    return {
      characters: markdown.length,
      words: plainText.split(/\s+/).filter(word => word.length > 0).length,
      lines: lines.length,
      paragraphs: markdown.split(/\n\s*\n/).filter(p => p.trim()).length,
      headers,
      boldText,
      italicText,
      codeBlocks,
      inlineCode,
      links,
      images,
      lists,
      numberedLists,
      blockquotes,
      readingTime: Math.ceil(plainText.split(/\s+/).length / 200), // 200 WPM
    };
  }

  /**
   * Validate markdown syntax
   */
  validateMarkdown(markdown) {
    const issues = [];

    if (!markdown) {
      return { valid: true, issues };
    }

    // Check for unclosed code blocks
    const codeBlockCount = (markdown.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      issues.push('Unclosed code block detected');
    }

    // Check for unclosed inline code
    const inlineCodeCount = (markdown.match(/(?<!`)`(?!`)/g) || []).length;
    if (inlineCodeCount % 2 !== 0) {
      issues.push('Unclosed inline code detected');
    }

    // Check for malformed links
    const malformedLinks = markdown.match(/\[([^\]]*)\]\s*\([^)]*$/gm);
    if (malformedLinks) {
      issues.push(`${malformedLinks.length} malformed link(s) detected`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Check if markdown processor is healthy
   */
  isHealthy() {
    return {
      healthy: true,
      markedAvailable: typeof marked !== 'undefined',
      configLoaded: !!Config.content.markdown,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.removeAllListeners();
    this.logger.debug('Markdown processor cleaned up');
  }
}