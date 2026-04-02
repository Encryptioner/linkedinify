# LinkedInify 🚀

> **Transform your Markdown into LinkedIn-ready posts. Privacy-first, AI-powered, works everywhere.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## ✨ Features

### 🔒 **100% Private & Offline**
- No data sent to servers - everything runs in your browser
- Works completely offline after first load
- Install as PWA on mobile/desktop
- No tracking, analytics, or data collection

### 🌍 **Universal Content Support** 
- All languages supported (English, Spanish, Chinese, Arabic...)
- Any content type (business, personal, technical)
- Beginner-friendly interface with advanced features
- AI-powered title generation

### 🎨 **Professional Interface**
- Dark & Light themes with smooth transitions
- LinkedIn preview (Light/Dark mode + Desktop/Mobile)
- Real-time markdown conversion
- Rich text editor with toolbar

### ⚡ **Smart Features**
- Auto-save with intelligent history
- Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+S)
- Copy with both HTML and plain text
- Responsive design for all devices

## 🚀 Quick Start

### Option 1: Use Online (Recommended)
Visit **[LinkedInify.app](https://encryptioner.github.io/linkedinify)**

### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/encryptioner/linkedinify.git
cd linkedinify

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Or build for production
pnpm run build
pnpm run preview
```

### Option 3: Simple HTTP Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using PHP  
php -S localhost:8000
```

## 🏗️ Architecture

### Modern Tech Stack
- **Frontend**: Vanilla JS with ES6+ modules
- **Build Tool**: Vite with PWA plugin
- **Testing**: Vitest with coverage
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Deployment**: GitHub Pages

### Project Structure
```
linkedinify/
├── src/
│   ├── js/
│   │   ├── modules/          # Feature modules
│   │   ├── utils/            # Utility functions
│   │   ├── config/           # Configuration
│   │   └── app.js           # Main application
│   ├── css/                 # Stylesheets
│   └── index.html           # Main HTML
├── public/                  # Static assets
├── .github/workflows/       # CI/CD workflows
└── dist/                    # Build output
```

### Key Modules
- **ThemeManager**: Light/dark theme switching
- **ContentConverter**: Markdown to LinkedIn conversion
- **HistoryManager**: Local storage and post management
- **TitleGenerator**: AI-powered title generation
- **PreviewManager**: LinkedIn preview modes
- **KeyboardManager**: Keyboard shortcuts
- **ClipboardManager**: Advanced copy functionality

## 🛠️ Development

### Prerequisites
- Node.js 16+ and pnpm 8+
- Modern browser with ES6+ support

### Setup Development Environment
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Check code quality
pnpm run lint
pnpm run format

# Build for production
pnpm run build
```

### Code Quality
```bash
# Lint and fix
pnpm run lint

# Format code
pnpm run format

# Full check (lint + build)
pnpm run check
```

## 📱 PWA Installation

### Mobile (iOS/Android)
1. Open in Safari/Chrome
2. Tap Share → "Add to Home Screen" 
3. Use like a native app!

### Desktop (Chrome/Edge/Firefox)
1. Look for install icon in address bar
2. Click to install as desktop app
3. Access from applications menu

## 🎯 How to Use

### Basic Formatting
```markdown
# Big Heading
## Medium Heading  
### Small Heading

**Bold text** and *italic text*

- Bullet point 1
- Bullet point 2

> Inspiring quote

[Link text](https://example.com)
```

### Code Blocks
```javascript
function hello() {
    console.log('Hello LinkedIn!');
}
```

### Advanced Features
- **Toolbar**: Click buttons for instant formatting
- **Keyboard Shortcuts**: Ctrl+B (bold), Ctrl+I (italic), Ctrl+S (save)
- **History**: Save and organize your posts
- **Preview**: See exactly how it looks on LinkedIn

## 🌍 Content Examples

### Business Post
```markdown
# 🚀 5 Career Lessons I Learned This Year

## Key Insights

Building relationships *before* you need them is crucial:

- Attend industry meetups
- Engage meaningfully on LinkedIn  
- Help others without expecting anything

**Key takeaway:** Your career is a marathon, not a sprint.
```

### Technical Tutorial  
```markdown
# 💻 JavaScript Tips That Will Blow Your Mind

## Clean Code Practices

```javascript
// Destructuring magic
const { name, email, age } = user;
```

**Pro tip:** Master these patterns for cleaner code!
```

## 🚀 Deployment

### GitHub Pages (Automatic)
1. **Fork this repository** to your GitHub account
2. **Enable GitHub Actions** in your fork:
   - Go to Settings → Actions → General
   - Select "Allow all actions and reusable workflows"
3. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: "GitHub Actions"
4. **Push to `main` branch** and the workflow will automatically:
   - Install dependencies with pnpm
   - Run tests to ensure code quality
   - Build the production version
   - Deploy to GitHub Pages
5. **Your app will be live** at `https://yourusername.github.io/linkedinify`

### GitHub Pages Setup Guide
The repository includes a complete GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

- ✅ Uses pnpm for fast, reliable builds
- ✅ Builds optimized production bundle
- ✅ Deploys automatically on every push to main
- ✅ Supports custom domains (configure in workflow)

### Manual Deployment
```bash
# Build the project
pnpm run build

# Deploy to GitHub Pages
pnpm run deploy

# Or upload dist/ folder to any static hosting
```

### Supported Platforms
- **GitHub Pages** ✅
- **Netlify** ✅  
- **Vercel** ✅
- **Firebase Hosting** ✅
- **Any static hosting** ✅

## 🤝 Contributing

We welcome contributions! Here's how:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run the full check: `pnpm run check`
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines
- Follow the existing code style (ESLint + Prettier)
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and descriptive
- Ensure all checks pass before submitting PR

### Areas for Contribution
- 🌍 **Translations**: Help translate UI text
- 🎨 **Themes**: Create new color schemes  
- 📝 **Templates**: Add content templates
- 🐛 **Bug Fixes**: Report and fix issues
- 🚀 **Features**: Suggest and implement new features
- 📖 **Documentation**: Improve docs and examples

## 📊 Analytics & Privacy

LinkedInify is built with privacy as the foundation:

- ❌ No Google Analytics or tracking pixels
- ❌ No user data collection 
- ❌ No third-party cookies or scripts
- ❌ No server communication after initial load
- ✅ 100% local processing
- ✅ Open source code
- ✅ Your data stays on your device

## 🔧 Technical Details

### Browser Support
- Chrome 80+ ✅
- Firefox 75+ ✅  
- Safari 13+ ✅
- Edge 80+ ✅
- Mobile browsers ✅

### Performance
- **First Load**: ~300KB (including all assets)
- **Subsequent Loads**: Instant (cached)
- **Offline**: Full functionality
- **Mobile**: Optimized for all screen sizes

### Security
- **Content Security Policy** implemented
- **No external dependencies** at runtime
- **Local storage only** for user data
- **HTTPS required** for service worker

## 🆘 Support

### Common Issues
- **Install button not showing**: Use Chrome/Edge/Firefox
- **Offline not working**: Ensure served via HTTP (not file://)
- **History not saving**: Check browser storage permissions

### Get Help
- 📧 **Email**: [mir.ankur.ruet13@gmail.com](mailto:mir.ankur.ruet13@gmail.com)
- 🐙 **GitHub Issues**: [Report bugs or request features](https://github.com/encryptioner/linkedinify/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/encryptioner/linkedinify/discussions)

## 📄 License

MIT License - feel free to use, modify, and distribute!

See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Marked.js**: Excellent Markdown parser
- **Vite**: Amazing build tool and dev experience
- **Vitest**: Modern testing framework  
- **LinkedIn**: Inspiration for the formatting
- **Community**: Users who provided feedback and suggestions

## 🚀 Roadmap

### v2.0 (Next Release)
- [ ] Export to other platforms (Twitter, Medium)
- [ ] More content templates  
- [ ] Advanced formatting options
- [ ] Collaborative editing

### v2.1 (Future)
- [ ] Browser extension
- [ ] Desktop application (Electron)
- [ ] Plugin system
- [ ] Content scheduling

---

## 👨‍💻 Author
1. Name: Ankur Mursalin
2. Email: mir.ankur.ruet13@gmail.com
3. Website: [https://encryptioner.github.io/](https://encryptioner.github.io/)
4. LinkedIn: [https://www.linkedin.com/in/mir-mursalin-ankur](https://www.linkedin.com/in/mir-mursalin-ankur)
5. Github: [https://github.com/encryptioner](https://github.com/encryptioner)
6. Twitter: [https://x.com/AnkurMursalin](https://x.com/AnkurMursalin)
7. Blog: [https://dev.to/mir_mursalin_ankur](https://dev.to/mir_mursalin_ankur)
8. Nerddevs: [https://nerddevs.com/author/ankur/](https://nerddevs.com/author/ankur/)
9. Project Home Page: [https://encryptioner.github.io/linkedinify](https://encryptioner.github.io/linkedinify)

---

**Made with ❤️ by [Ankur Mursalin](https://github.com/encryptioner)**

*Empowering everyone to share their stories on LinkedIn beautifully*

![LinkedInify Logo](https://img.shields.io/badge/LinkedInify-Markdown%20to%20LinkedIn-0077b5?style=for-the-badge&logo=linkedin)

---

## Support

If you find my work useful, consider supporting it:

[![SupportKori](https://img.shields.io/badge/SupportKori-☕-FFDD00?style=flat-square)](https://www.supportkori.com/mirmursalinankur)
