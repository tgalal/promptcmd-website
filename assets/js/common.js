// Common utilities shared across pages

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy command for home page
function copyCommand(event) {
    const btn = event.target;
    const commandBox = btn.closest('.command-box');
    const command = commandBox.querySelector('.command-text').textContent;
    copyToClipboard(command, btn);
}

// Platform detection
function detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    // Check for macOS
    if (platform.includes('mac') || userAgent.includes('mac')) {
        // Prefer homebrew for macOS users
        return 'homebrew';
    }

    // Check for Windows
    if (platform.includes('win') || userAgent.includes('windows')) {
        return 'powershell';
    }

    // Default to shell for Linux and others
    return 'shell';
}

// Switch platform tabs
function switchPlatform(platform, syncBoth = false) {
    // Update all sections if syncBoth is true, otherwise just update the section that was clicked
    const sections = syncBoth ? document.querySelectorAll('.install-section, .cta-content') :
                                [event.target.closest('.install-section, .cta-content')];

    sections.forEach(section => {
        if (!section) return;

        // Update tabs
        const tabs = section.querySelectorAll('.platform-tab');
        tabs.forEach(tab => {
            if (tab.dataset.platform === platform) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update install methods
        const methods = section.querySelectorAll('.install-method');
        methods.forEach(method => {
            if (method.dataset.platform === platform) {
                method.classList.add('active');
            } else {
                method.classList.remove('active');
            }
        });
    });
}

// Initialize platform detection on page load
document.addEventListener('DOMContentLoaded', () => {
    const defaultPlatform = detectPlatform();

    // Set initial active state for all sections
    document.querySelectorAll('.install-section, .cta-content').forEach(section => {
        // Activate default platform tab
        const defaultTab = section.querySelector(`.platform-tab[data-platform="${defaultPlatform}"]`);
        if (defaultTab) {
            defaultTab.classList.add('active');
        }

        // Activate default install method
        const defaultMethod = section.querySelector(`.install-method[data-platform="${defaultPlatform}"]`);
        if (defaultMethod) {
            defaultMethod.classList.add('active');
        }
    });
});
