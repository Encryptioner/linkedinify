/**
 * Test Setup Configuration
 * Global test setup for Vitest
 */

import { beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock sessionStorage for testing
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window.matchMedia
const matchMediaMock = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock window.navigator
const navigatorMock = {
  userAgent: 'test-agent',
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  serviceWorker: {
    register: vi.fn().mockResolvedValue({}),
  },
};

// Mock performance API
const performanceMock = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
};

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  
  // Set up DOM mocks
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: matchMediaMock,
  });
  
  Object.defineProperty(window, 'navigator', {
    value: navigatorMock,
  });
  
  Object.defineProperty(window, 'performance', {
    value: performanceMock,
  });
  
  // Mock fetch
  global.fetch = vi.fn();
  
  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  
  // Reset DOM to a clean state
  document.body.innerHTML = '';
  document.documentElement.setAttribute('data-theme', 'light');
});

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks();
  
  // Clean up DOM
  document.body.innerHTML = '';
  
  // Clear any timers
  vi.clearAllTimers();
});