/* js/main.js — CocoKits Token Architecture Website */

(function () {
  'use strict';

  /* ── Theme ──────────────────────────────────────────────── */
  const THEME_KEY = 'cck-docs-theme';

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const icon  = btn.querySelector('.toggle-icon');
    const label = btn.querySelector('.toggle-label');
    if (icon)  icon.textContent  = theme === 'dark' ? '🌙' : '☀️';
    if (label) label.textContent = theme === 'dark' ? 'Dark mode' : 'Light mode';
  }

  function toggleTheme() {
    const current = getTheme();
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  /* ── Scroll Progress ────────────────────────────────────── */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── Active Nav Link ────────────────────────────────────── */
  function initActiveNav() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-link, .nav-home').forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkFile = href.split('/').pop();

      if (
        linkFile === filename ||
        (filename === 'index.html' && link.classList.contains('nav-home')) ||
        (filename === '' && link.classList.contains('nav-home'))
      ) {
        link.classList.add('active');
        // Scroll nav item into view within sidebar
        link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  /* ── Copy Code Buttons ──────────────────────────────────── */
  function initCopyButtons() {
    document.querySelectorAll('.code-block').forEach(block => {
      const btn = block.querySelector('.copy-btn');
      const pre = block.querySelector('pre code');
      if (!btn || !pre) return;

      btn.addEventListener('click', () => {
        const text = pre.innerText || pre.textContent;
        navigator.clipboard.writeText(text).then(() => {
          const label = btn.querySelector('.copy-label');
          if (label) label.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            if (label) label.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        }).catch(() => {
          // Fallback for older browsers
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        });
      });
    });
  }

  /* ── Mobile Sidebar ─────────────────────────────────────── */
  function initMobileSidebar() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar   = document.getElementById('sidebar');
    const overlay   = document.getElementById('sidebarOverlay');

    if (!toggleBtn || !sidebar) return;

    function openSidebar() {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('open');
      toggleBtn.textContent = '✕';
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      toggleBtn.textContent = '☰';
    }

    toggleBtn.addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar on nav link click (mobile)
    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) closeSidebar();
      });
    });
  }

  /* ── Smooth anchor scrolling ────────────────────────────── */
  function initAnchorScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const id = this.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Init ───────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getTheme());

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    initScrollProgress();
    initActiveNav();
    initCopyButtons();
    initMobileSidebar();
    initAnchorScrolling();
  });
})();
