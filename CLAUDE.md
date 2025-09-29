# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LinkedInify is a Progressive Web App (PWA) that converts Markdown content to LinkedIn-ready posts. It's built with modern modular JavaScript architecture using Vite for development and build processes, with pnpm as the package manager.

**Key Features:**
- 100% offline functionality with service worker caching
- Privacy-first design (no server communication, all data stored locally)
- Multi-language AI-powered title generation
- Real-time LinkedIn preview (light/dark mode, desktop/mobile)
- Rich text editor with toolbar shortcuts
- Local post history with auto-save
- PWA capabilities for mobile/desktop installation

## Development Commands

### Local Development
```bash
# Install dependencies
pnpm install

# Start development server (recommended)
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Build & Deploy
```bash
# Build for production
pnpm run build

# Deploy to GitHub Pages
pnpm run deploy

# Or upload dist/ folder to any static hosting
```

## Architecture & Structure

### Modular Architecture
The application uses a modern modular JavaScript architecture with separate files for each concern:
- **HTML structure** - App layout in `src/index.html`
- **CSS styles** - Responsive design in `src/css/styles.css`
- **JavaScript modules** - ES6 modules in `src/js/modules/`
- **Utilities** - Shared utilities in `src/js/utils/`
- **Configuration** - App config in `src/js/config/`

### Key JavaScript Modules
- **ThemeManager** - Light/dark mode switching with system preference detection
- **PreviewManager** - LinkedIn preview modes (light/dark, desktop/mobile)
- **TitleGenerator** - AI-powered title generation with multi-language patterns
- **HistoryManager** - Local storage and post management with auto-save
- **ContentConverter** - Markdown to LinkedIn text conversion
- **ClipboardManager** - Advanced clipboard functionality with fallbacks
- **KeyboardManager** - Keyboard shortcuts and accessibility
- **UIManager** - General UI interactions and status management
- **ServiceWorkerManager** - PWA offline functionality and updates
- **AIChatManager** - AI chatbot integration with dynamic script loading

### File Structure
```
linkedinify/
├── src/
│   ├── index.html          # Main application HTML
│   ├── css/
│   │   └── styles.css      # Modern CSS with custom properties
│   ├── js/
│   │   ├── app.js          # Main application entry point
│   │   ├── config/
│   │   │   └── app-config.js    # Application configuration
│   │   ├── modules/        # Feature modules
│   │   │   ├── theme-manager.js
│   │   │   ├── preview-manager.js
│   │   │   ├── history-manager.js
│   │   │   ├── content-converter.js
│   │   │   ├── title-generator.js
│   │   │   ├── clipboard-manager.js
│   │   │   ├── keyboard-manager.js
│   │   │   ├── ui-manager.js
│   │   │   └── service-worker-manager.js
│   │   └── utils/          # Shared utilities
│   │       ├── event-emitter.js
│   │       └── logger.js
│   │   └── modules/        # Feature modules (continued)
│   │       └── ai-chat-manager.js
├── public/                 # Static assets (generated)
├── dist/                   # Build output
├── package.json           # pnpm package configuration
├── vite.config.js         # Vite build configuration
├── README.md              # Project documentation
└── CLAUDE.md              # Claude Code guidance
```

### State Management
- Uses vanilla JavaScript with localStorage for persistence
- Event-driven architecture with custom EventEmitter base class
- Each module extends EventEmitter for inter-module communication
- Key storage keys defined in `AppConfig.storageKeys`:
  - `linkedinify_theme` - User's theme preference
  - `linkedinify_posts` - Saved post history
  - `linkedinify_settings` - App settings
  - `linkedinify_drafts` - Auto-saved drafts

### Service Worker Strategy
- **Cache-first strategy** for offline functionality
- Caches all static assets and external dependencies
- Handles offline fallbacks and background sync
- Version-based cache management with automatic updates
- Service worker manager handles registration, updates, and cleanup

## Common Development Tasks

### Adding New Content Patterns
To add new AI title generation patterns:
```javascript
// Edit src/js/modules/title-generator.js
TitleGenerator.patterns.newCategory = {
    keywords: ['keyword1', 'keyword2'],
    emojis: ['🎯', '💡'],
    templates: ['Template 1', 'Template 2']
};
```

### Adding New Themes  
```css
/* Edit src/css/styles.css */
/* Add new CSS custom properties in :root and [data-theme="theme-name"] */
:root {
  --new-theme-color: #ffffff;
}

[data-theme="new-theme"] {
  --background-primary: #custom-color;
}
```

### Creating New Modules
```javascript
// Create new file in src/js/modules/
import { EventEmitter } from '../utils/event-emitter.js';
import { Logger } from '../utils/logger.js';

export class NewModule extends EventEmitter {
  constructor({ app }) {
    super();
    this.app = app;
    this.logger = new Logger('NewModule');
  }

  async init() {
    this.logger.debug('Initializing new module');
  }

  cleanup() {
    this.removeAllListeners();
  }
}
```

### Testing PWA Functionality
- Serve over HTTPS or localhost (required for service workers)
- Test offline functionality in Chrome DevTools > Network > Offline
- Validate PWA installation in DevTools > Application > Manifest
- Use Lighthouse for PWA audit scoring

## Dependencies

### Runtime Dependencies
- **marked** - Markdown parsing library
- **@vite/plugin-pwa** - PWA functionality for Vite

### Development Dependencies
- **vite** - Build tool and dev server
- **vitest** - Testing framework
- **@vitest/ui** - Testing UI
- **eslint** - Code linting
- **prettier** - Code formatting

### Browser Requirements
- Chrome 80+ / Firefox 75+ / Safari 13+ / Edge 80+
- Service Worker support required for offline functionality
- LocalStorage support for data persistence

## Privacy & Security
- **No server communication** - all processing happens client-side
- **No tracking or analytics** - completely privacy-focused
- **Local data only** - uses localStorage, no external data transmission
- **HTTPS required** for service worker functionality in production

## Deployment Notes
- Static hosting compatible (Netlify, Vercel, GitHub Pages, Firebase)
- Requires HTTPS for full PWA functionality
- Build assets using `pnpm run build` and upload `dist/` folder
- Service worker requires proper MIME types configured on server
- PWA icons and manifest are automatically generated during build
- GitHub Pages deployment is automated via GitHub Actions

### Manual Deployment Steps
1. Run `pnpm run build` to generate production assets
2. Upload contents of `dist/` folder to your hosting provider
3. Ensure HTTPS is enabled for PWA functionality
4. Configure server to serve service worker with correct MIME type

## AI Chat Integration

LinkedInify includes a pluggable AI chatbot that provides interactive assistance to users. The chatbot is powered by an external script from the `private-chat` project and integrates seamlessly with the modular architecture.

### Configuration

**AI Chat Settings** in `src/js/config/app-config.js`:
```javascript
aiChat: {
  enabled: true, // Set to false to disable chat widget
  embedScriptUrl: 'https://encryptioner.github.io/private-chat/embed.js',
  systemMessage: '...', // Customizable system prompt
  fallbackEnabled: true, // Try to load without parameters if initial load fails
  debug: isDevelopment, // Enable debug logging in development
}
```

### Architecture

**AIChatManager Module** (`src/js/modules/ai-chat-manager.js`):
- Follows the established EventEmitter pattern
- Integrates with the application lifecycle
- Provides comprehensive error handling and fallback mechanisms
- Supports dynamic configuration and health checking

**Key Features**:
- **Dynamic Script Loading**: Loads the chat embed script with proper error handling
- **URL Parameter Building**: Automatically configures system message and domain
- **Fallback Support**: Attempts to load script without parameters if initial load fails
- **Environment Detection**: Different behavior for development vs production
- **Health Monitoring**: Provides status information for debugging
- **Cleanup Management**: Proper resource cleanup on application shutdown

### How It Works

1. **Initialization**: AIChatManager is initialized as part of the main application startup
2. **Script Loading**: Dynamically injects the chat embed script with proper configuration
3. **Configuration**: Passes system message and domain information via URL parameters
4. **Error Handling**: Provides fallback loading and comprehensive error logging
5. **Integration**: Works seamlessly with other modules through the EventEmitter pattern

### Customization

To customize the AI chatbot:

1. **System Message**: Edit `aiChat.systemMessage` in `app-config.js`
2. **Enable/Disable**: Set `aiChat.enabled` to `false` to disable the widget
3. **Script URL**: Update `aiChat.embedScriptUrl` for different chat service endpoints
4. **Debug Mode**: Enable/disable debug logging with `aiChat.debug`

### Module Lifecycle

```javascript
// Initialization (automatic)
app.getModule('aiChat').init()

// Health checking
app.getModule('aiChat').isHealthy()

// Manual control (if needed)
app.getModule('aiChat').enable()
app.getModule('aiChat').disable()
app.getModule('aiChat').reload()
```

### Dependencies

- Requires the `private-chat` project to be deployed and accessible
- Uses the established EventEmitter and Logger utilities
- No additional npm dependencies required
- Integrates with the existing configuration system

## General Rules
1. Be concise and accurate
2. Consider yourself as experienced professional software engineer and act accordingly
3. You must ensure production ready, professional, scalable and maintainable code
4. You must ensure the website follows responsive design and works good in all screen
5. Ensure the UX and UI follows latest standard and attractive (not pushy) to use
