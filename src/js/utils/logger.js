/**
 * Logger Utility
 * Configurable logging system with levels, formatting, and persistence
 */

import { Config } from '../config/app-config.js';

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const LOG_COLORS = {
  ERROR: '#ff4757',
  WARN: '#ffa502',
  INFO: '#3742fa',
  DEBUG: '#5f27cd',
};

export class Logger {
  constructor(namespace = 'App') {
    this.namespace = namespace;
    this.level = LOG_LEVELS[Config.env.logLevel.toUpperCase()] ?? LOG_LEVELS.INFO;
    this.logs = [];
    this.maxLogs = 1000;
    
    // Performance monitoring
    this.performanceMarks = new Map();
    this.performanceMeasures = new Map();
  }

  /**
   * Format log message with timestamp and namespace
   */
  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.namespace}]`;
    return { prefix, message, args, timestamp, level, namespace: this.namespace };
  }

  /**
   * Store log entry for potential analysis
   */
  storeLog(logEntry) {
    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Output log to console with styling
   */
  outputToConsole(logEntry) {
    const { prefix, message, args, level } = logEntry;
    const color = LOG_COLORS[level];
    
    if (typeof message === 'string') {
      console.log(`%c${prefix}%c ${message}`, `color: ${color}; font-weight: bold`, 'color: inherit', ...args);
    } else {
      console.log(`%c${prefix}`, `color: ${color}; font-weight: bold`, message, ...args);
    }
  }

  /**
   * Core logging method
   */
  log(level, message, ...args) {
    const levelValue = LOG_LEVELS[level];
    
    if (levelValue > this.level) {
      return; // Skip if below current log level
    }

    const logEntry = this.formatMessage(level, message, ...args);
    this.storeLog(logEntry);
    this.outputToConsole(logEntry);

    // Send to external logging service if configured
    if (Config.monitoring.errorReporting.enabled && level === 'ERROR') {
      this.sendToExternalService(logEntry);
    }
  }

  /**
   * Error level logging
   */
  error(message, ...args) {
    this.log('ERROR', message, ...args);
  }

  /**
   * Warning level logging
   */
  warn(message, ...args) {
    this.log('WARN', message, ...args);
  }

  /**
   * Info level logging
   */
  info(message, ...args) {
    this.log('INFO', message, ...args);
  }

  /**
   * Debug level logging
   */
  debug(message, ...args) {
    this.log('DEBUG', message, ...args);
  }

  /**
   * Create a performance mark
   */
  mark(name) {
    const markName = `${this.namespace}:${name}`;
    this.performanceMarks.set(name, performance.now());
    
    if (Config.monitoring.performance.markTiming) {
      performance.mark(markName);
    }
    
    this.debug(`Performance mark: ${name}`);
  }

  /**
   * Measure performance between two marks
   */
  measure(name, startMark, endMark) {
    const measureName = `${this.namespace}:${name}`;
    
    if (startMark && this.performanceMarks.has(startMark)) {
      const startTime = this.performanceMarks.get(startMark);
      const endTime = endMark && this.performanceMarks.has(endMark) 
        ? this.performanceMarks.get(endMark) 
        : performance.now();
      
      const duration = endTime - startTime;
      this.performanceMeasures.set(name, duration);
      
      if (Config.monitoring.performance.measureUserTiming) {
        performance.measure(measureName, `${this.namespace}:${startMark}`, endMark ? `${this.namespace}:${endMark}` : undefined);
      }
      
      this.info(`Performance: ${name} took ${duration.toFixed(2)}ms`);
      return duration;
    }
    
    this.warn(`Performance measurement failed: missing start mark '${startMark}'`);
    return null;
  }

  /**
   * Time a function execution
   */
  async time(name, fn) {
    const startTime = performance.now();
    this.mark(`${name}_start`);
    
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.performanceMeasures.set(name, duration);
      this.info(`${name} completed in ${duration.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.error(`${name} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  /**
   * Create a child logger with extended namespace
   */
  child(childNamespace) {
    return new Logger(`${this.namespace}:${childNamespace}`);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count = 100, level = null) {
    let logs = this.logs.slice(-count);
    
    if (level) {
      const levelValue = LOG_LEVELS[level.toUpperCase()];
      logs = logs.filter(log => LOG_LEVELS[log.level] <= levelValue);
    }
    
    return logs;
  }

  /**
   * Clear stored logs
   */
  clearLogs() {
    this.logs = [];
    this.performanceMarks.clear();
    this.performanceMeasures.clear();
  }

  /**
   * Set log level
   */
  setLevel(level) {
    const levelValue = LOG_LEVELS[level.toUpperCase()];
    if (levelValue !== undefined) {
      this.level = levelValue;
      this.info(`Log level set to ${level.toUpperCase()}`);
    } else {
      this.warn(`Invalid log level: ${level}`);
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const summary = {
      marks: Array.from(this.performanceMarks.entries()),
      measures: Array.from(this.performanceMeasures.entries()),
      totalMeasures: this.performanceMeasures.size,
      averageTime: 0,
    };

    if (summary.totalMeasures > 0) {
      const totalTime = Array.from(this.performanceMeasures.values()).reduce((sum, time) => sum + time, 0);
      summary.averageTime = totalTime / summary.totalMeasures;
    }

    return summary;
  }

  /**
   * Send error logs to external service (placeholder)
   */
  async sendToExternalService(logEntry) {
    // This would integrate with services like Sentry, LogRocket, etc.
    // For privacy-first approach, this is disabled by default
    if (!Config.monitoring.errorReporting.enabled) {
      return;
    }

    try {
      // Example implementation:
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry)
      // });
    } catch (error) {
      console.warn('Failed to send log to external service:', error);
    }
  }

  /**
   * Export logs for download/analysis
   */
  exportLogs(format = 'json') {
    const data = {
      exportedAt: new Date().toISOString(),
      namespace: this.namespace,
      logs: this.logs,
      performance: this.getPerformanceSummary(),
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      // Simple CSV export
      const headers = 'Timestamp,Level,Namespace,Message\n';
      const rows = this.logs.map(log => 
        `${log.timestamp},${log.level},${log.namespace},"${log.message.toString().replace(/"/g, '""')}"`
      ).join('\n');
      return headers + rows;
    }

    return data;
  }
}

// Create default logger instance
export const logger = new Logger('LinkedInify');

// Export LOG_LEVELS for external use
export { LOG_LEVELS };