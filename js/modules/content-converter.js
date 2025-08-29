// ===============================
// CONTENT CONVERTER MODULE
// ===============================

class ContentConverter {
    constructor(app) {
        this.app = app;
    }

    markdownToLinkedIn(markdown) {
        if (!markdown.trim()) return '';

        let converted = markdown;

        // Convert headers (remove markdown syntax)
        converted = converted.replace(/^### (.*$)/gm, '$1');
        converted = converted.replace(/^## (.*$)/gm, '$1');
        converted = converted.replace(/^# (.*$)/gm, '$1');

        // Preserve bold and italic formatting
        converted = converted.replace(/\*\*\*(.*?)\*\*\*/g, '***$1***');
        converted = converted.replace(/\*\*(.*?)\*\*/g, '**$1**');
        converted = converted.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, '*$1*');

        // Convert code blocks to readable format
        converted = converted.replace(/```(\w+)?\n([\s\S]*?)\n```/g, function(match, lang, code) {
            return '\n' + code.trim() + '\n';
        });

        // Convert inline code (remove backticks)
        converted = converted.replace(/`([^`]+)`/g, '$1');

        // Convert blockquotes to thought bubbles
        converted = converted.replace(/^> (.*$)/gm, '💭 $1');

        // Convert lists
        converted = converted.replace(/^[\s]*[-*+] (.*$)/gm, '• $1');

        // Convert ordered lists with proper numbering
        converted = converted.replace(/^[\s]*\d+\. (.*$)/gm, function(match, content, offset, string) {
            const lines = string.substring(0, offset).split('\n');
            const currentLineIndex = lines.length - 1;
            let number = 1;
            
            // Count previous numbered items
            for (let i = currentLineIndex - 1; i >= 0; i--) {
                if (lines[i].match(/^[\s]*\d+\. /)) {
                    number++;
                } else if (lines[i].trim() === '') {
                    continue;
                } else {
                    break;
                }
            }
            
            return number + '. ' + content;
        });

        // Convert markdown links to readable format
        converted = converted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

        // Clean up excessive whitespace while preserving intentional spacing
        converted = converted.replace(/\n{3,}/g, '\n\n');

        return converted.trim();
    }

    // Future: Add export methods for other platforms
    exportToTwitter(content) {
        // Implementation for Twitter format
        return content.substring(0, 280);
    }

    exportToMedium(content) {
        // Implementation for Medium format
        return content;
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentConverter;
}