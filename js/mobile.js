/* ============================================
   MOBILE.JS - Hamburger menu + font controls
   ============================================ */

(function() {
  'use strict';

  // Inject mobile nav HTML into every page
  function injectMobileNav() {
    // Inject hamburger button into header
    const headerInner = document.querySelector('.header-inner');
    if (headerInner && !document.querySelector('.menu-toggle')) {
      const btn = document.createElement('button');
      btn.className = 'menu-toggle';
      btn.setAttribute('aria-label', 'Mo menu');
      btn.innerHTML = '<span class="menu-bar"></span><span class="menu-bar"></span><span class="menu-bar"></span>';
      headerInner.appendChild(btn);
    }

    // Detect current page for active state
    const page = window.location.pathname.split('/').pop() || 'index.html';

    // Inject overlay
    if (!document.querySelector('.nav-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'nav-overlay';
      overlay.id = 'navOverlay';
      document.body.appendChild(overlay);
    }

    // Inject mobile nav drawer
    if (!document.querySelector('.mobile-nav')) {
      const nav = document.createElement('nav');
      nav.className = 'mobile-nav';
      nav.id = 'mobileNav';
      nav.innerHTML = `
        <a href="index.html" class="mobile-nav-link ${page === 'index.html' ? 'active' : ''}">
          <span class="mobile-nav-icon">&#127968;</span> Trang Chu
        </a>
        <a href="facebook.html" class="mobile-nav-link mnl-fb ${page === 'facebook.html' ? 'active' : ''}">
          <span class="mobile-nav-icon">&#128077;</span> Facebook
        </a>
        <a href="tiktok.html" class="mobile-nav-link mnl-tt ${page === 'tiktok.html' ? 'active' : ''}">
          <span class="mobile-nav-icon">&#127925;</span> TikTok
        </a>
        <a href="youtube.html" class="mobile-nav-link mnl-yt ${page === 'youtube.html' ? 'active' : ''}">
          <span class="mobile-nav-icon">&#9654;</span> YouTube
        </a>
        <div style="margin-top:auto; padding: 20px 0 10px; border-top: 2px solid var(--gray);">
          <p style="font-size:0.9rem; color:var(--text2); text-align:center; margin-bottom:12px;">&#128241; Cong Nghe Vui</p>
          <p style="font-size:0.85rem; color:var(--text3); text-align:center;">&#128150; Danh cho Ong Ba</p>
        </div>
      `;
      document.body.appendChild(nav);
    }

    // Inject font controls
    if (!document.querySelector('.font-controls')) {
      const fc = document.createElement('div');
      fc.className = 'font-controls';
      fc.innerHTML = `
        <button class="font-ctrl-btn" onclick="increaseFontSize()" title="Tang co chu" aria-label="Tang co chu">A+</button>
        <button class="font-ctrl-btn" onclick="decreaseFontSize()" title="Giam co chu" aria-label="Giam co chu">A-</button>
      `;
      document.body.appendChild(fc);
    }
  }

  // Toggle menu open/close
  function setupMenuToggle() {
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.menu-toggle');
      const overlay = document.getElementById('navOverlay');
      const nav = document.getElementById('mobileNav');
      if (!btn && !overlay) return;

      if (btn) {
        const isOpen = btn.classList.toggle('open');
        if (nav) nav.classList.toggle('open', isOpen);
        if (overlay) overlay.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      } else if (e.target === overlay) {
        closeMenu();
      }
    });
  }

  function closeMenu() {
    const btn = document.querySelector('.menu-toggle');
    const nav = document.getElementById('mobileNav');
    const overlay = document.getElementById('navOverlay');
    if (btn) btn.classList.remove('open');
    if (nav) nav.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Close menu when nav link clicked
  function setupNavLinks() {
    document.addEventListener('click', function(e) {
      if (e.target.closest('.mobile-nav-link')) {
        closeMenu();
      }
    });
  }

  // Font size controls
  let fontLevel = parseInt(localStorage.getItem('cngv-font') || '0');
  const fontSizes = [18, 20, 22];

  function applyFontSize() {
    document.documentElement.style.fontSize = fontSizes[fontLevel] + 'px';
    localStorage.setItem('cngv-font', fontLevel);
  }

  window.increaseFontSize = function() {
    if (fontLevel < fontSizes.length - 1) { fontLevel++; applyFontSize(); showFontToast(fontSizes[fontLevel - 1] || fontSizes[fontLevel]); }
    else showFontToast(null, 'Co chu da lon nhat!');
  };

  window.decreaseFontSize = function() {
    if (fontLevel > 0) { fontLevel--; applyFontSize(); }
    else showFontToast(null, 'Co chu da nho nhat!');
  };

  function showFontToast(size, msg) {
    let toast = document.getElementById('font-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'font-toast';
      toast.style.cssText = 'position:fixed;bottom:160px;right:16px;background:#1e293b;color:white;padding:10px 16px;border-radius:12px;font-size:1rem;font-weight:700;z-index:9999;transition:opacity 0.3s';
      document.body.appendChild(toast);
    }
    toast.textContent = msg || ('Co chu: ' + fontSizes[fontLevel] + 'px');
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  }

  // Smooth anchor scrolling on mobile (fix for iOS)
  function setupMobileScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function(e) {
        const id = this.getAttribute('href');
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          closeMenu();
          setTimeout(() => {
            const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top, behavior: 'smooth' });
          }, 350);
        }
      });
    });
  }

  // Swipe to close mobile nav (right swipe)
  function setupSwipeClose() {
    let startX = 0;
    document.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    document.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      const nav = document.getElementById('mobileNav');
      if (nav && nav.classList.contains('open') && dx > 60) {
        closeMenu();
      }
    }, { passive: true });
  }

  // Add active pulse on card tap (touch feedback)
  function setupTouchFeedback() {
    document.querySelectorAll('.app-card, .quick-item, .tip-card').forEach(el => {
      el.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.97)';
      }, { passive: true });
      el.addEventListener('touchend', function() {
        this.style.transform = '';
      }, { passive: true });
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', function() {
    injectMobileNav();
    setupMenuToggle();
    setupNavLinks();
    setupMobileScroll();
    setupSwipeClose();
    setupTouchFeedback();
    applyFontSize();
  });

})();