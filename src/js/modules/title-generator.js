/**
 * Title Generator Module
 * AI-powered title generation for posts based on content analysis
 */

import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';
import { Config } from '../config/app-config.js';

export class TitleGenerator extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('TitleGenerator');
    this.patterns = this.initializePatterns();
  }

  /**
   * Initialize title generation patterns
   */
  initializePatterns() {
    return {
      business: {
        keywords: ['career', 'job', 'work', 'business', 'professional', 'interview', 'resume', 'networking', 'leadership', 'management', 'strategy', 'success', 'growth', 'entrepreneur', 'startup', 'company', 'team', 'project'],
        emojis: ['💼', '📈', '🎯', '💡', '🚀', '⭐', '🏆', '💪'],
        templates: ['Career Insights', 'Professional Tips', 'Business Strategy', 'Work Experience', 'Success Story', 'Leadership Thoughts', 'Industry Update', 'Professional Growth']
      },
      
      technology: {
        keywords: ['code', 'programming', 'software', 'development', 'tech', 'technology', 'computer', 'digital', 'app', 'website', 'platform', 'tool', 'framework', 'api', 'database', 'coding', 'developer', 'engineer', 'algorithm'],
        emojis: ['💻', '⚡', '🔧', '🚀', '⚙️', '🛠️', '💾', '📱'],
        templates: ['Tech Insights', 'Coding Tips', 'Development Guide', 'Programming Tutorial', 'Tech Update', 'Software Review', 'Developer Experience', 'Technology Trends']
      },
      
      education: {
        keywords: ['learn', 'study', 'education', 'course', 'tutorial', 'guide', 'lesson', 'skill', 'knowledge', 'training', 'development', 'improvement', 'practice', 'teaching', 'sharing', 'tips'],
        emojis: ['📚', '🎓', '✨', '🔥', '💡', '🧠', '📝', '🎯'],
        templates: ['Learning Journey', 'Study Notes', 'Educational Content', 'Knowledge Sharing', 'Learning Experience', 'Skill Development', 'Tutorial Guide', 'Educational Insights']
      },
      
      personal: {
        keywords: ['story', 'journey', 'experience', 'life', 'personal', 'motivation', 'inspiration', 'challenge', 'growth', 'reflection', 'milestone', 'achievement', 'lesson', 'advice'],
        emojis: ['🌟', '💪', '🚀', '✨', '💡', '🎯', '🌈', '💫'],
        templates: ['Personal Story', 'Life Lesson', 'Journey Update', 'Milestone Moment', 'Personal Reflection', 'Growth Story', 'Life Update', 'Personal Achievement']
      },
      
      social: {
        keywords: ['community', 'networking', 'connection', 'relationship', 'social', 'collaboration', 'teamwork', 'partnership', 'mentorship', 'leadership', 'influence', 'communication', 'engagement'],
        emojis: ['🤝', '💼', '👥', '🌐', '🔗', '💬', '👋', '🎉'],
        templates: ['Community Update', 'Networking Tips', 'Collaboration Story', 'Team Success', 'Leadership Insight', 'Community Building', 'Social Impact', 'Partnership Update']
      },
      
      creative: {
        keywords: ['design', 'creative', 'art', 'visual', 'content', 'marketing', 'brand', 'campaign', 'innovation', 'creativity', 'inspiration', 'project', 'portfolio', 'showcase'],
        emojis: ['🎨', '✨', '🌟', '💫', '🎭', '🎪', '🌈', '💎'],
        templates: ['Creative Process', 'Design Journey', 'Art Showcase', 'Creative Insights', 'Design Thinking', 'Visual Story', 'Creative Project', 'Artistic Expression']
      }
    };
  }

  /**
   * Initialize title generator
   */
  async init() {
    try {
      this.logger.debug('Initializing title generator');
      this.logger.info('Title generator initialized');
    } catch (error) {
      this.logger.error('Failed to initialize title generator:', error);
      throw error;
    }
  }

  /**
   * Generate title based on content analysis
   */
  generateTitle(content) {
    if (!content || typeof content !== 'string' || !content.trim()) {
      return Config.content.titleGeneration.fallbackTitle;
    }

    try {
      // Analyze content to determine category
      const category = this.analyzeContentCategory(content);
      const pattern = this.patterns[category];
      
      // Generate title based on pattern
      const emoji = this.getRandomElement(pattern.emojis);
      const template = this.getRandomElement(pattern.templates);
      
      // Try to extract meaningful keywords from content
      const contentKeywords = this.extractKeywords(content);
      
      // Create contextual title if possible
      if (contentKeywords.length > 0) {
        const keyword = this.getRandomElement(contentKeywords);
        const variations = [
          `${emoji} ${keyword} ${template}`,
          `${emoji} ${template}: ${keyword}`,
          `${template} - ${keyword} ${emoji}`,
          `${emoji} ${template} About ${keyword}`,
        ];
        
        const title = this.getRandomElement(variations);
        return this.truncateTitle(title);
      }
      
      // Fallback to pattern-based title
      const title = `${emoji} ${template}`;
      return this.truncateTitle(title);
      
    } catch (error) {
      this.logger.error('Failed to generate title:', error);
      return Config.content.titleGeneration.fallbackTitle;
    }
  }

  /**
   * Analyze content to determine the most likely category
   */
  analyzeContentCategory(content) {
    const words = content.toLowerCase().split(/\s+/);
    const categories = Object.keys(this.patterns);
    const scores = {};
    
    // Initialize scores
    categories.forEach(category => {
      scores[category] = 0;
    });
    
    // Score based on keyword matches
    categories.forEach(category => {
      const pattern = this.patterns[category];
      
      pattern.keywords.forEach(keyword => {
        words.forEach(word => {
          // Exact match
          if (word === keyword) {
            scores[category] += 3;
          }
          // Partial match
          else if (word.includes(keyword) || keyword.includes(word)) {
            scores[category] += 1;
          }
        });
      });
    });
    
    // Find category with highest score
    let bestCategory = 'business'; // Default fallback
    let highestScore = 0;
    
    Object.entries(scores).forEach(([category, score]) => {
      if (score > highestScore) {
        highestScore = score;
        bestCategory = category;
      }
    });
    
    this.logger.debug(`Content categorized as: ${bestCategory} (score: ${highestScore})`);
    return bestCategory;
  }

  /**
   * Extract meaningful keywords from content
   */
  extractKeywords(content, maxKeywords = 5) {
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 3) // Filter short words
      .filter(word => !this.isStopWord(word)); // Filter stop words

    // Count word frequency
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Sort by frequency and take top keywords
    const keywords = Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => this.capitalizeFirst(word));

    return keywords;
  }

  /**
   * Check if word is a common stop word
   */
  isStopWord(word) {
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'
    ]);
    
    return stopWords.has(word);
  }

  /**
   * Capitalize first letter of word
   */
  capitalizeFirst(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  /**
   * Get random element from array
   */
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Truncate title to maximum length
   */
  truncateTitle(title) {
    const maxLength = Config.content.titleGeneration.maxLength;
    if (title.length <= maxLength) {
      return title;
    }
    
    return title.substring(0, maxLength - 3) + '...';
  }

  /**
   * Generate multiple title suggestions
   */
  generateMultipleTitles(content, count = 3) {
    const titles = new Set(); // Use Set to avoid duplicates
    
    while (titles.size < count && titles.size < 10) { // Max 10 attempts
      const title = this.generateTitle(content);
      titles.add(title);
    }
    
    return Array.from(titles);
  }

  /**
   * Generate title with specific category
   */
  generateTitleForCategory(content, category) {
    if (!this.patterns[category]) {
      this.logger.warn(`Invalid category: ${category}`);
      return this.generateTitle(content);
    }

    const pattern = this.patterns[category];
    const emoji = this.getRandomElement(pattern.emojis);
    const template = this.getRandomElement(pattern.templates);
    
    const title = `${emoji} ${template}`;
    return this.truncateTitle(title);
  }

  /**
   * Get available categories
   */
  getAvailableCategories() {
    return Object.keys(this.patterns);
  }

  /**
   * Add custom pattern
   */
  addCustomPattern(name, pattern) {
    if (!pattern.keywords || !pattern.emojis || !pattern.templates) {
      throw new Error('Pattern must have keywords, emojis, and templates');
    }
    
    this.patterns[name] = pattern;
    this.logger.info(`Added custom pattern: ${name}`);
  }

  /**
   * Get pattern statistics
   */
  getPatternStats() {
    const stats = {};
    
    Object.entries(this.patterns).forEach(([category, pattern]) => {
      stats[category] = {
        keywords: pattern.keywords.length,
        emojis: pattern.emojis.length,
        templates: pattern.templates.length,
      };
    });
    
    return stats;
  }

  /**
   * Check if title generator is healthy
   */
  isHealthy() {
    return {
      healthy: true,
      patternsLoaded: Object.keys(this.patterns).length,
      categories: this.getAvailableCategories(),
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.removeAllListeners();
    this.logger.debug('Title generator cleaned up');
  }
}