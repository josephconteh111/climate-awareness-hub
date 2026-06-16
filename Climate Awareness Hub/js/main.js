// Shared UI helpers: mobile menu + active nav highlighting + theme toggle

(function () {
    // mobile menu toggle
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            nav.classList.toggle('open');
        });
    }

    // highlight active nav link
    const links = document.querySelectorAll('nav a');
    const current = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        if (href === current) a.classList.add('active');
    });

    /* Theme toggle: persist preference and honor system preference */
    const THEME_KEY = 'climate_theme';
    const themeBtn = document.getElementById('theme-toggle');

    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'light') root.classList.add('light-theme');
        else root.classList.remove('light-theme');

        if (themeBtn) {
            const isLight = theme === 'light';
            themeBtn.setAttribute('aria-pressed', String(isLight));
            themeBtn.textContent = isLight ? '☀️' : '🌙';
            themeBtn.setAttribute('title', isLight ? 'Switch to dark mode' : 'Switch to light mode');
        }
    }

    function detectInitialTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        // fall back to system preference
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    // initialize
    const initTheme = detectInitialTheme();
    applyTheme(initTheme);

    // toggle on button click
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
            const next = current === 'light' ? 'dark' : 'light';
            localStorage.setItem(THEME_KEY, next);
            applyTheme(next);
        });
    }

    // respond to system changes if no explicit preference saved
    if (window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: light)');
        mq.addEventListener?.('change', (e) => {
            if (!localStorage.getItem(THEME_KEY)) {
                applyTheme(e.matches ? 'light' : 'dark');
            }
        });
    }

})();