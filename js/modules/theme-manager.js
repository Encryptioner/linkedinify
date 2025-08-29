// ===============================
// THEME MANAGEMENT MODULE
// ===============================

class ThemeManager {
    constructor(app) {
        this.app = app;
    }

    init() {
        this.applyTheme(this.app.state.currentTheme);
        this.updateToggleButton();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.app.state.currentTheme = theme;
        localStorage.setItem(this.app.config.storageKeys.theme, theme);
        this.updateToggleButton();
    }

    toggle() {
        const newTheme = this.app.state.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    updateToggleButton() {
        const button = document.querySelector('.theme-toggle');
        if (button) {
            button.textContent = this.app.state.currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
        }
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}