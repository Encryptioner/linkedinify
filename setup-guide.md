# LinkedInify Setup Guide

This guide will help you set up LinkedInify locally or deploy it to production.

## 📦 Package Contents

```
linkedinify-v1.2/
├── index.html              # Main application file
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── package.json            # Node.js package info
├── README.md               # Documentation
├── LICENSE                 # MIT License
├── SETUP.md                # This setup guide
├── generate-icons.py       # Icon generation script
└── icons/                  # App icons (generate these)
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

## 🚀 Quick Start (Local Development)

### Option 1: Python Server (Recommended)
```bash
# Navigate to project directory
cd linkedinify-v1.2

# Start server
python -m http.server 8000

# Open in browser
open http://localhost:8000
```

### Option 2: Node.js Server
```bash
# Install dependencies
npm install

# Start development server  
npm start

# Or use npx (no install needed)
npx http-server -p 8000
```

### Option 3: PHP Server
```bash
php -S localhost:8000
```

## 🖼️ Generate Icons

### Automatic Generation (Recommended)
```bash
# Install Python Pillow library
pip install Pillow

# Run icon generator
python generate-icons.py
```

### Manual Creation
If you prefer custom icons:
1. Create 8 PNG files in `icons/` folder:
   - `icon-72x72.png`
   - `icon-96x96.png` 
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`
2. Use online generators like [RealFaviconGenerator](https://realfavicongenerator.net/)

## 🌐 Production Deployment

### Static Hosting (Recommended)

#### Netlify
1. Drag the `linkedinify-v1.2` folder to [Netlify Drop](https://app.netlify.com/drop)
2. Your app is live instantly!
3. Free HTTPS and global CDN included

#### Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel` in project directory
3. Follow prompts to deploy

#### GitHub Pages
1. Create GitHub repository
2. Upload all files
3. Enable GitHub Pages in repository settings
4. Access at `https://yourusername.github.io/linkedinify`

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Traditional Web Hosting
1. Upload all files via FTP/SFTP
2. Ensure server supports HTTPS (required for service worker)
3. Configure proper MIME types:
   ```apache
   # .htaccess for Apache
   AddType application/manifest+json .webmanifest
   AddType application/json .json
   ```

## ⚙️ Configuration

### Custom Domain Setup
1. Update `start_url` in `manifest.json`:
   ```json
   {
     "start_url": "https://yourdomain.com/",
     ...
   }
   ```

2. Update service worker cache paths in `sw.js`:
   ```javascript
   const urlsToCache = [
       'https://yourdomain.com/',
       'https://yourdomain.com/index.html',
       // ...
   ];
   ```

### Analytics (Optional)
Add privacy-focused analytics by inserting before `</head>`:
```html
<!-- Simple Analytics (privacy-friendly) -->
<script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
<noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" /></noscript>
```

## 🔧 Customization

### Branding
1. **App Name**: Update in `manifest.json` and `index.html`
2. **Colors**: Modify CSS variables in `index.html`:
   ```css
   :root {
       --primary-color: #your-color;
       --primary-dark: #your-dark-color;
   }
   ```
3. **Logo**: Replace icons in `icons/` folder

### Features
The code is modular - you can easily:
- Add new content patterns in `TitleGenerator.patterns`
- Create new themes in `ThemeManager`
- Add export formats in `ContentConverter`

## 🧪 Testing

### PWA Testing
1. Open Chrome DevTools
2. Go to Application > Manifest
3. Verify manifest loads correctly
4. Test "Add to homescreen"

### Offline Testing  
1. Open DevTools > Network
2. Check "Offline" checkbox
3. Refresh page - should work offline

### Performance Testing
Use Lighthouse (built into Chrome DevTools):
1. Open DevTools > Lighthouse
2. Run PWA audit
3. Should score 90+ in all categories

## 📱 Mobile Testing

### iOS Testing
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Test app functionality

### Android Testing
1. Open in Chrome
2. Tap menu (3 dots)
3. Select "Add to Home screen" 
4. Test app functionality

## 🔒 Security Considerations

### HTTPS Requirement
- Service workers require HTTPS
- Use Let's Encrypt for free SSL certificates
- Most modern hosting provides HTTPS by default

### Content Security Policy (Optional)
Add to `<head>` for enhanced security:
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data:;
    connect-src 'self';
    font-src 'self' data:;
">
```

## 🚨 Troubleshooting

### Service Worker Not Working
- Ensure serving over HTTPS or localhost
- Clear browser cache and storage
- Check browser console for errors

### Icons Not Showing
- Verify all icon files exist in `icons/` folder
- Check file paths in `manifest.json`
- Validate PNG files aren't corrupted

### App Not Installing
- Verify manifest.json is valid
- Ensure service worker is registered
- Check PWA requirements in DevTools

### Offline Functionality Issues
- Service worker must be served over HTTPS
- Check cache strategy in `sw.js`
- Verify all resources are cached

## 📊 Performance Optimization

### Image Optimization
```bash
# Optimize PNG icons (if available)
optipng icons/*.png

# Or use online tools
https://tinypng.com/
```

### Code Minification
For production, consider minifying:
```bash
# Install tools
npm install -g html-minifier clean-css-cli terser

# Minify files
html-minifier --collapse-whitespace index.html > index.min.html
```

## 🔄 Updates & Maintenance

### Version Updates
1. Update version in `package.json`
2. Update cache name in `sw.js`:
   ```javascript
   const CACHE_NAME = 'linkedinify-v1.3';
   ```
3. Test thoroughly before deployment

### Monitoring
- Monitor error logs in hosting platform
- Check PWA install rates
- Monitor Core Web Vitals

## 📞 Support

### Getting Help
- 📧 Email: support@linkedinify.app
- 🐙 GitHub: [Create an issue](https://github.com/ankurmursalin/linkedinify/issues)
- 📝 Documentation: [Read the README](README.md)

### Contributing
See contribution guidelines in [README.md](README.md#-contributing)

## 📈 Analytics & Metrics

### Key Metrics to Track
- PWA install rate
- Offline usage
- Feature usage (toolbar buttons, history, etc.)
- User retention
- Performance metrics

### Privacy-Friendly Options
- [Simple Analytics](https://simpleanalytics.com/)
- [Plausible](https://plausible.io/)
- [Umami](https://umami.is/)

---

**Happy deploying! 🚀**

*If you encounter any issues, please [create an issue](https://github.com/ankurmursalin/linkedinify/issues) on GitHub.*