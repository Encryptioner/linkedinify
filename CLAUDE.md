# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LinkedInify is a Progressive Web App (PWA) that converts Markdown content to LinkedIn-ready posts. It's a client-side application built with vanilla HTML, CSS, and JavaScript that works completely offline after the initial load.

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
# Start development server (Python - recommended)
python -m http.server 8000

# Start development server (Node.js)
npm start
# or
npm run dev

# Generate app icons
python icon-generator.py

# Serve via PHP
php -S localhost:8000
```

### Build & Deploy
```bash
# No build step required - pure vanilla JS
npm run build  # outputs: "No build step required - pure vanilla JS!"

# Deploy to static hosting (Netlify, Vercel, GitHub Pages)
# Simply upload all files to hosting provider
```

## Architecture & Structure

### Single-File Application
The entire application is contained in `index.html` which includes:
- **HTML structure** - App layout and components
- **CSS styles** - Responsive design with light/dark themes
- **JavaScript modules** - Modular component system

### Key JavaScript Modules (all in index.html)
- **AppConfig & AppState** - Global configuration and state management
- **ThemeManager** - Light/dark mode switching
- **PreviewManager** - LinkedIn preview modes (light/dark, desktop/mobile)
- **TitleGenerator** - AI-powered title generation with multi-language patterns
- **HistoryManager** - Local storage for post history
- **MarkdownConverter** - Markdown to LinkedIn text conversion
- **PWA Registration** - Service worker management

### File Structure
```
linkedinify/
├── index.html           # Main application (HTML + CSS + JS)
├── service-worker.js    # PWA offline functionality
├── manifest-json.json   # PWA manifest configuration  
├── package-json.json    # Node.js package configuration
├── readme-file.md       # Project documentation
├── setup-guide.md       # Deployment and setup instructions
├── icon-generator.py    # Python script to generate PWA icons
├── deploy-script.sh     # Deployment automation script
└── license-file.txt     # MIT license
```

### State Management
- Uses vanilla JavaScript with localStorage for persistence
- Key storage keys defined in `AppConfig.storageKeys`:
  - `linkedinify_theme` - User's theme preference
  - `linkedinify_posts` - Saved post history
  - `linkedinify_settings` - App settings

### Service Worker Strategy
- **Cache-first strategy** for offline functionality
- Caches all static assets and external dependencies (marked.js)
- Handles offline fallbacks and background sync preparation
- Version-based cache management (`linkedinify-v1.2`)

## Common Development Tasks

### Adding New Content Patterns
To add new AI title generation patterns:
```javascript
// Add to TitleGenerator.patterns in index.html
TitleGenerator.patterns.newCategory = {
    keywords: ['keyword1', 'keyword2'],
    emojis: ['🎯', '💡'],
    templates: ['Template 1', 'Template 2']
};
```

### Adding New Themes  
```javascript
// Modify CSS variables in :root and [data-theme="dark"] sections
// Update ThemeManager.applyTheme() method if needed
```

### Updating PWA Configuration
- Update version in `service-worker.js` CACHE_NAME
- Modify `manifest-json.json` for PWA settings
- Update `package-json.json` for Node.js metadata

### Adding Toolbar Buttons
```html
<!-- Add to toolbar section in index.html -->
<button class="toolbar-btn" onclick="yourFunction()" title="Description">Label</button>
```

### Testing PWA Functionality
- Serve over HTTPS or localhost (required for service workers)
- Test offline functionality in Chrome DevTools > Network > Offline
- Validate PWA installation in DevTools > Application > Manifest
- Use Lighthouse for PWA audit scoring

## Dependencies

### External Dependencies
- **marked.js v5.1.2** - Markdown parsing (loaded from CDN)
- **http-server** - Development server (Node.js devDependency)

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
- All assets must be uploaded (no build step required)
- Service worker requires proper MIME types configured on server
- Icons should be generated using `icon-generator.py` before deployment