/**
 * Main Application Tests
 * Integration tests for the LinkedInifyApp class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LinkedInifyApp } from '../js/app.js';

describe('LinkedInifyApp', () => {
  let app;

  beforeEach(() => {
    app = new LinkedInifyApp();
  });

  describe('Initialization', () => {
    it('should create app instance with correct properties', () => {
      expect(app).toBeInstanceOf(LinkedInifyApp);
      expect(app.isInitialized).toBe(false);
      expect(app.modules).toBeInstanceOf(Map);
      expect(app.config).toBeDefined();
      expect(app.logger).toBeDefined();
    });

    it('should initialize modules correctly', async () => {
      // Mock DOM elements
      document.body.innerHTML = `
        <div id="markdownInput"></div>
        <div id="htmlPreview"></div>
        <div id="linkedinPreview"></div>
      `;

      await app.init();
      
      expect(app.isInitialized).toBe(true);
      expect(app.modules.size).toBeGreaterThan(0);
    });
  });

  describe('Module Management', () => {
    beforeEach(async () => {
      document.body.innerHTML = `
        <div id="markdownInput"></div>
        <div id="htmlPreview"></div>
        <div id="linkedinPreview"></div>
      `;
      await app.init();
    });

    it('should get modules by name', () => {
      const themeModule = app.getModule('theme');
      expect(themeModule).toBeDefined();
    });

    it('should throw error for non-existent module', () => {
      expect(() => app.getModule('nonexistent')).toThrow('Module not found: nonexistent');
    });
  });

  describe('Content Processing', () => {
    beforeEach(async () => {
      document.body.innerHTML = `
        <textarea id="markdownInput"># Hello World</textarea>
        <div id="htmlPreview"></div>
        <div id="linkedinPreview"></div>
      `;
      await app.init();
    });

    it('should format text correctly', async () => {
      const textarea = document.getElementById('markdownInput');
      textarea.value = 'Hello World';
      textarea.setSelectionRange(0, 5); // Select "Hello"
      
      await app.formatText('**', '**');
      
      expect(textarea.value).toBe('**Hello** World');
    });

    it('should convert markdown content', async () => {
      const markdownInput = document.getElementById('markdownInput');
      const htmlPreview = document.getElementById('htmlPreview');
      const linkedinPreview = document.getElementById('linkedinPreview');
      
      markdownInput.value = '# Test Heading\n\nThis is a test.';
      
      await app.convertMarkdown();
      
      expect(htmlPreview.innerHTML).toContain('Test Heading');
      expect(linkedinPreview.textContent).toContain('Test Heading');
    });
  });

  describe('Error Handling', () => {
    it('should handle non-critical errors gracefully', () => {
      const error = new Error('Test error');
      
      // Mock UI module
      app.modules.set('ui', {
        showStatus: vi.fn(),
      });
      
      app.handleError(error);
      
      expect(app.modules.get('ui').showStatus).toHaveBeenCalledWith(
        'Error: Test error',
        'error'
      );
    });

    it('should handle critical errors', () => {
      const error = new Error('Critical error');
      
      app.handleCriticalError(error);
      
      // Should create error display
      expect(document.body.innerHTML).toContain('Application Error');
    });
  });

  describe('Health Status', () => {
    beforeEach(async () => {
      document.body.innerHTML = `
        <div id="markdownInput"></div>
        <div id="htmlPreview"></div>
        <div id="linkedinPreview"></div>
      `;
      await app.init();
    });

    it('should return health status', () => {
      const status = app.getHealthStatus();
      
      expect(status).toMatchObject({
        initialized: true,
        modules: expect.any(Object),
        timestamp: expect.any(String),
      });
    });
  });

  describe('Cleanup', () => {
    beforeEach(async () => {
      document.body.innerHTML = `
        <div id="markdownInput"></div>
        <div id="htmlPreview"></div>
        <div id="linkedinPreview"></div>
      `;
      await app.init();
    });

    it('should cleanup resources properly', () => {
      const cleanupSpy = vi.fn();
      
      // Mock modules with cleanup methods
      app.modules.forEach((module) => {
        module.cleanup = cleanupSpy;
      });
      
      app.cleanup();
      
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });
});