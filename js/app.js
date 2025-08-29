// ===============================
// LINKEDINIFY - MAIN APPLICATION
// ===============================

class LinkedInifyApp {
    constructor() {
        this.config = {
            version: '1.2.0',
            storageKeys: {
                theme: 'linkedinify_theme',
                posts: 'linkedinify_posts',
                settings: 'linkedinify_settings',
                draft: 'linkedinify_draft'
            },
            maxHistoryItems: 100,
            autoSaveDelay: 500
        };

        this.state = {
            currentTheme: localStorage.getItem(this.config.storageKeys.theme) || 'light',
            linkedinTheme: 'light',
            linkedinView: 'web',
            currentPostId: null,
            isAutoSaving: false
        };

        this.modules = {};
        this.init();
    }

    init() {
        this.initializeModules();
        this.setupEventListeners();
        this.loadInitialState();
    }

    initializeModules() {
        this.modules.theme = new ThemeManager(this);
        this.modules.preview = new PreviewManager(this);
        this.modules.history = new HistoryManager(this);
        this.modules.converter = new ContentConverter(this);
        this.modules.titleGenerator = new TitleGenerator(this);
    }

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.id !== 'markdownInput') return;
            
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'b':
                        e.preventDefault();
                        this.formatText('**', '**');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.formatText('*', '*');
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveCurrentPost();
                        break;
                }
            }
        });

        // Input listener
        const markdownInput = document.getElementById('markdownInput');
        if (markdownInput) {
            markdownInput.addEventListener('input', () => this.convertMarkdown());
        }
    }

    loadInitialState() {
        this.modules.theme.init();
        this.modules.preview.setLinkedInTheme('light');
        this.modules.preview.setLinkedInView('web');
        this.loadDraft();
        this.convertMarkdown();
    }

    // Core functionality methods
    formatText(prefix, suffix) {
        const textarea = document.getElementById('markdownInput');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const replacement = prefix + selectedText + suffix;
        
        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
        
        this.convertMarkdown();
    }

    formatHeading(level) {
        const prefix = '#'.repeat(level) + ' ';
        const textarea = document.getElementById('markdownInput');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        const replacement = prefix + selectedText;
        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
        
        this.convertMarkdown();
    }

    convertMarkdown() {
        const markdown = document.getElementById('markdownInput').value;
        const htmlPreview = document.getElementById('htmlPreview');
        const linkedinPreview = document.getElementById('linkedinPreview');
        
        if (typeof marked !== 'undefined') {
            htmlPreview.innerHTML = marked.parse(markdown);
        } else {
            htmlPreview.innerHTML = '<p style="color: red;">Marked.js library not loaded. Please refresh the page.</p>';
        }
        
        const linkedinText = this.modules.converter.markdownToLinkedIn(markdown);
        linkedinPreview.textContent = linkedinText;
        
        this.autoSave();
    }

    saveCurrentPost() {
        const content = document.getElementById('markdownInput').value.trim();
        if (!content) {
            this.showStatus('Please write some content first!', 'error');
            return;
        }
        
        const postId = this.modules.history.savePost('', content);
        this.state.currentPostId = postId;
        this.showStatus('Post saved successfully!', 'success');
    }

    autoSave() {
        if (this.state.isAutoSaving) return;
        
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            const content = document.getElementById('markdownInput').value.trim();
            if (content) {
                this.state.isAutoSaving = true;
                localStorage.setItem(this.config.storageKeys.draft, content);
                this.state.isAutoSaving = false;
            }
        }, this.config.autoSaveDelay);
    }

    loadDraft() {
        const draft = localStorage.getItem(this.config.storageKeys.draft);
        const markdownInput = document.getElementById('markdownInput');
        if (draft && markdownInput && !markdownInput.value.trim()) {
            markdownInput.value = draft;
            this.convertMarkdown();
        }
    }

    showStatus(message, type = 'success') {
        const status = document.getElementById('status');
        if (status) {
            status.textContent = message;
            status.className = `status ${type}`;
            status.style.display = 'block';
            
            setTimeout(() => {
                status.style.display = 'none';
            }, 4000);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.linkedinifyApp = new LinkedInifyApp();
});