/**
 * Theme Manager Tests
 * Unit tests for ThemeManager module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeManager } from '../../js/modules/theme-manager.js';

describe('ThemeManager', () => {
  let themeManager;
  let mockApp;

  beforeEach(() => {
    mockApp = {
      config: {
        storage: {
          keys: {
            theme: 'linkedinify_theme',
          },
        },
        ui: {
          theme: {
            default: 'light',
            available: ['light', 'dark'],
          },
          animations: {
            duration: 300,
            easing: 'ease-in-out',
          },
        },
      },
    };

    themeManager = new ThemeManager({ app: mockApp });
    
    // Mock DOM elements
    document.body.innerHTML = `
      <button class="theme-toggle">Toggle Theme</button>
      <meta name="theme-color" content="#0077b5">
    `;
  });

  describe('Initialization', () => {
    it('should initialize with correct properties', () => {
      expect(themeManager.app).toBe(mockApp);
      expect(themeManager.currentTheme).toBeNull();
    });

    it('should initialize and load theme', async () => {
      await themeManager.init();
      
      expect(themeManager.currentTheme).toBe('light');
    });
  });

  describe('Theme Application', () => {
    beforeEach(async () => {
      await themeManager.init();
    });

    it('should apply light theme', async () => {
      await themeManager.applyTheme('light');
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(themeManager.currentTheme).toBe('light');
      expect(localStorage.getItem).toHaveBeenCalledWith('linkedinify_theme');
    });

    it('should apply dark theme', async () => {
      await themeManager.applyTheme('dark');
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(themeManager.currentTheme).toBe('dark');
    });

    it('should fallback to default for invalid theme', async () => {
      await themeManager.applyTheme('invalid');
      
      expect(themeManager.currentTheme).toBe('light');
    });

    it('should not change if same theme applied', async () => {
      await themeManager.applyTheme('light');
      const spy = vi.spyOn(document.documentElement, 'setAttribute');
      
      await themeManager.applyTheme('light');
      
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Theme Toggle', () => {
    beforeEach(async () => {
      await themeManager.init();
    });

    it('should toggle from light to dark', async () => {
      await themeManager.applyTheme('light');
      await themeManager.toggle();
      
      expect(themeManager.currentTheme).toBe('dark');
    });

    it('should toggle from dark to light', async () => {
      await themeManager.applyTheme('dark');
      await themeManager.toggle();
      
      expect(themeManager.currentTheme).toBe('light');
    });
  });

  describe('Theme Button Update', () => {
    beforeEach(async () => {
      await themeManager.init();
    });

    it('should update button for light theme', async () => {
      await themeManager.applyTheme('light');
      
      const button = document.querySelector('.theme-toggle');
      expect(button.textContent).toBe('🌙 Dark Mode');
    });

    it('should update button for dark theme', async () => {
      await themeManager.applyTheme('dark');
      
      const button = document.querySelector('.theme-toggle');
      expect(button.textContent).toBe('☀️ Light Mode');
    });
  });

  describe('System Theme Detection', () => {
    it('should detect system dark theme', async () => {
      // Mock matchMedia to return dark preference
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const newThemeManager = new ThemeManager({ app: mockApp });
      await newThemeManager.init();
      
      expect(newThemeManager.currentTheme).toBe('dark');
    });

    it('should handle system theme changes', async () => {
      let mediaQueryCallback;
      
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn((event, callback) => {
          mediaQueryCallback = callback;
        }),
        removeEventListener: vi.fn(),
      }));

      await themeManager.init();
      
      // Simulate system theme change
      mediaQueryCallback({ matches: true });
      
      expect(themeManager.currentTheme).toBe('dark');
    });
  });

  describe('Meta Theme Color', () => {
    beforeEach(async () => {
      await themeManager.init();
    });

    it('should update meta theme color for light theme', async () => {
      await themeManager.applyTheme('light');
      
      const meta = document.querySelector('meta[name="theme-color"]');
      expect(meta.getAttribute('content')).toBe('#0077b5');
    });

    it('should update meta theme color for dark theme', async () => {
      await themeManager.applyTheme('dark');
      
      const meta = document.querySelector('meta[name="theme-color"]');
      expect(meta.getAttribute('content')).toBe('#1b1f23');
    });
  });

  describe('Health Check', () => {
    beforeEach(async () => {
      await themeManager.init();
    });

    it('should return healthy status', () => {
      const health = themeManager.isHealthy();
      
      expect(health).toMatchObject({
        healthy: true,
        currentTheme: 'light',
        mediaQuerySupported: expect.any(Boolean),
      });
    });
  });

  describe('Theme Statistics', () => {
    beforeEach(async () => {
      await themeManager.init();
    });

    it('should return theme stats', () => {
      const stats = themeManager.getThemeStats();
      
      expect(stats).toMatchObject({
        currentTheme: 'light',
        available: ['light', 'dark'],
        systemPreference: expect.any(String),
        hasCustomTheme: expect.any(Boolean),
      });
    });
  });

  describe('Cleanup', () => {
    beforeEach(async () => {
      await themeManager.init();
    });

    it('should cleanup resources', () => {
      const removeEventListenerSpy = vi.fn();
      themeManager.mediaQuery = {
        removeEventListener: removeEventListenerSpy,
      };

      themeManager.cleanup();
      
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });
});