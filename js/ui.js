/* ═══════════════════════════════════════════════════════
   OtakuVault — UI: Nav, Mobile Menu, Scroll, Skeleton
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileMenu();
  initScrollAnimations();
  initBackToTop();
  initSearchDropdown();
  setActiveNavLink();
});

// ─── Navigation Active Link ───────────────────────────
function setActiveNavLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link, .mobile-menu__link').forEach(link => {
    const href = link.getAttribute('href')?.split('/').pop() || '';
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
  document.querySelectorAll('.bottom-nav__item').forEach(item => {
    const href = item.getAttribute('href')?.split('/').pop() || '';
    if (href === path || (path === '' && href === 'index.html')) {
      item.classList.add('active');
    }
  });
}

// ─── Sticky Navbar ─────────────────────────────────────
function initNav() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > 10) {
      nav.style.boxShadow = '0 2px 30px rgba(0,0,0,0.12)';
    } else {
      nav.style.boxShadow = 'var(--shadow-nav)';
    }
    lastScroll = current;
  }, { passive: true });
}

// ─── Mobile Menu ──────────────────────────────────────
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay    = document.getElementById('mobile-menu-overlay');
  const closeBtn   = document.getElementById('mobile-menu-close');
  if (!hamburger || !mobileMenu) return;

  function open() {
    mobileMenu.classList.add('open');
    overlay?.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    mobileMenu.classList.remove('open');
    overlay?.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => mobileMenu.classList.contains('open') ? close() : open());
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

// ─── Scroll Reveal Animations ────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ─── Back to Top ──────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── Search Dropdown ─────────────────────────────────
function initSearchDropdown() {
  const input = document.getElementById('navbar-search');
  const dropdown = document.getElementById('search-dropdown');
  if (!input || !dropdown) return;

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) { dropdown.classList.remove('open'); return; }
      const results = (window.PRODUCTS || []).filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.franchiseName.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
      ).slice(0, 6);

      if (results.length === 0) { dropdown.classList.remove('open'); return; }
      dropdown.innerHTML = results.map(p => `
        <a href="product.html?id=${p.id}" class="search-result-item" onclick="dropdown.classList.remove('open')">
          <img src="${p.images[0]}" class="search-result-img" alt="${p.name}" loading="lazy">
          <div>
            <div class="search-result-name">${p.name}</div>
            <div class="search-result-price">${formatPrice(p.price)}</div>
          </div>
        </a>
      `).join('');
      dropdown.classList.add('open');
    }, 200);
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) window.location.href = `shop.html?q=${encodeURIComponent(q)}`;
    }
  });
}

// ─── Accordion ────────────────────────────────────────
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const body = item.querySelector('.accordion-body');
      const wasOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.accordion-body')?.classList.remove('open');
      });
      // Open clicked (if was closed)
      if (!wasOpen) {
        item.classList.add('open');
        body?.classList.add('open');
      }
    });
  });
}
window.initAccordions = initAccordions;

// ─── Tab Switcher ─────────────────────────────────────
function initTabs(tabsSelector = '.tabs') {
  document.querySelectorAll(tabsSelector + ' .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      const container = btn.closest('[data-tabs-container]') || document;
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = container.querySelector(`#${tabId}`);
      if (panel) panel.classList.add('active');
    });
  });
}
window.initTabs = initTabs;

// ─── Carousel Helper ──────────────────────────────────
function initCarousel(scrollId, prevId, nextId) {
  const scroll = document.getElementById(scrollId);
  const prev   = document.getElementById(prevId);
  const next   = document.getElementById(nextId);
  if (!scroll) return;
  const step = () => scroll.querySelector(':scope > *')?.offsetWidth + 16 || 260;
  prev?.addEventListener('click', () => scroll.scrollBy({ left: -step() * 2, behavior: 'smooth' }));
  next?.addEventListener('click', () => scroll.scrollBy({ left:  step() * 2, behavior: 'smooth' }));
}
window.initCarousel = initCarousel;

// ─── Countdown Timer ──────────────────────────────────
function initCountdown(targetDate, daysId, hoursId, minsId, secsId) {
  function update() {
    const now  = new Date().getTime();
    const diff = targetDate - now;
    if (diff <= 0) return;
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (daysId)  document.getElementById(daysId)?.textContent  = String(days).padStart(2, '0');
    if (hoursId) document.getElementById(hoursId)?.textContent = String(hours).padStart(2, '0');
    if (minsId)  document.getElementById(minsId)?.textContent  = String(minutes).padStart(2, '0');
    if (secsId)  document.getElementById(secsId)?.textContent  = String(seconds).padStart(2, '0');
  }
  update();
  setInterval(update, 1000);
}
window.initCountdown = initCountdown;

// ─── Price Range Slider ───────────────────────────────
function initPriceSlider() {
  const slider = document.getElementById('price-slider');
  const display = document.getElementById('price-display');
  if (!slider || !display) return;
  slider.addEventListener('input', () => {
    display.textContent = `₹99 — ${formatPrice(parseInt(slider.value))}`;
    window.currentMaxPrice = parseInt(slider.value);
    if (typeof filterProducts === 'function') filterProducts();
  });
}
window.initPriceSlider = initPriceSlider;

// ─── Skeleton Loader ─────────────────────────────────
function showSkeleton(container, count = 6) {
  container.innerHTML = Array(count).fill(`
    <div class="product-card">
      <div class="product-card__image-wrap skeleton" style="aspect-ratio:1"></div>
      <div class="product-card__body" style="gap:12px">
        <div class="skeleton" style="height:12px;width:60%;border-radius:4px"></div>
        <div class="skeleton" style="height:16px;width:90%;border-radius:4px"></div>
        <div class="skeleton" style="height:12px;width:80%;border-radius:4px"></div>
        <div class="skeleton" style="height:20px;width:50%;border-radius:4px"></div>
      </div>
      <div class="product-card__actions">
        <div class="skeleton" style="height:38px;border-radius:8px"></div>
      </div>
    </div>
  `).join('');
}
window.showSkeleton = showSkeleton;

// ─── Expose formatPrice ───────────────────────────────
// (also in core.js but duplicated here for safety if loaded standalone)
if (typeof window.formatPrice === 'undefined') {
  window.formatPrice = (n) => '₹' + n.toLocaleString('en-IN');
}
