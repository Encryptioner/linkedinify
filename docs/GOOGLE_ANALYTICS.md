# Google Analytics Setup Guide

Quick setup guide for Google Analytics 4 in LinkedInify.

## Quick Setup

### 1. Get Measurement ID

1. Visit [analytics.google.com](https://analytics.google.com/)
2. Admin → Data Streams → Your Stream
3. Copy your Measurement ID (G-XXXXXXXXXX)

### 2. Configure

Open `src/js/config/app-config.js`:

```javascript
googleAnalytics: {
  measurementId: 'G-YOUR-ID-HERE', // Replace with your ID
  enabled: true,                     // Enable tracking
  trackInDevelopment: false,         // Test locally
},
```

### 3. Deploy

```bash
pnpm build
pnpm deploy
```

### 4. Verify

Check browser console for:
```
[Google Analytics] Initialized successfully with ID: G-XXXXXXXXXX
```

## Tracked Events

The Analytics Manager automatically tracks:

- **Content Conversion**: `convert_content`
- **Copy Actions**: `copy_content`
- **Post Save**: `save_post`
- **Title Generation**: `generate_title`
- **Theme Changes**: `change_theme`
- **Preview Mode**: `change_preview`

## Custom Tracking

```javascript
// Get analytics module
const analytics = app.getModule('analytics');

// Track custom event
analytics.trackEvent('custom_event', {
  category: 'Category',
  param: 'value'
});
```

## Privacy First

- **Disabled by default** - respects user privacy
- **No tracking in development** - clean dev environment
- **Configurable** - easy to enable/disable

## Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [LinkedInify Config](../src/js/config/app-config.js)
- [Analytics Manager](../src/js/modules/analytics-manager.js)
