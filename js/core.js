/* ═══════════════════════════════════════════════════════
   OtakuVault — Core: Cart, Wishlist, Toast, Utils
   ═══════════════════════════════════════════════════════ */

// ─── Utility Functions ────────────────────────────────
function formatPrice(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

function formatDiscount(original, sale) {
  return Math.round((1 - sale / original) * 100);
}

function getFranchiseClass(franchise) {
  return 'franchise-' + franchise;
}

function getStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function generateStarHTML(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) html += '<svg viewBox="0 0 24 24" fill="#FBBF24" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    else if (i === Math.ceil(rating) && rating % 1 >= 0.5) html += '<svg viewBox="0 0 24 24" width="14" height="14"><defs><linearGradient id="hg"><stop offset="50%" stop-color="#FBBF24"/><stop offset="50%" stop-color="#E5E7EB"/></linearGradient></defs><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#hg)"/></svg>';
    else html += '<svg viewBox="0 0 24 24" fill="#E5E7EB" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  }
  return html;
}

// ─── Toast Notification System ────────────────────────
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'success', title = null, duration = 3000) {
    if (!this.container) this.init();
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>'
    };
    const titles = { success: 'Success', error: 'Error', info: 'Info', warning: 'Warning' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast__icon">${icons[type]}</div>
      <div class="toast__text">
        <div class="toast__title">${title || titles[type]}</div>
        <div class="toast__message">${message}</div>
      </div>
      <div class="toast__close" onclick="this.closest('.toast').remove()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </div>
      <div class="toast__progress"></div>
    `;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
    return toast;
  },

  success(msg, title) { return this.show(msg, 'success', title); },
  error(msg, title)   { return this.show(msg, 'error', title); },
  info(msg, title)    { return this.show(msg, 'info', title); },
  warning(msg, title) { return this.show(msg, 'warning', title); }
};

// ─── Cart ─────────────────────────────────────────────
const Cart = {
  items: [],

  init() {
    try {
      this.items = JSON.parse(localStorage.getItem('ov_cart')) || [];
    } catch { this.items = []; }
    this.updateBadge();
  },

  save() {
    localStorage.setItem('ov_cart', JSON.stringify(this.items));
    this.updateBadge();
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.items }));
  },

  add(product, qty = 1, size = null) {
    const key = product.id + (size ? '-' + size : '');
    const existing = this.items.find(i => i.key === key);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, product.stockCount || 99);
    } else {
      this.items.push({
        key, id: product.id, name: product.name,
        price: product.price, originalPrice: product.originalPrice,
        franchise: product.franchise, franchiseName: product.franchiseName,
        image: product.images[0], size, qty,
        stockCount: product.stockCount || 99
      });
    }
    this.save();
    this.animateBadge();
    Toast.success(`${product.name} added to cart! 🛒`, 'Added to Cart');
  },

  remove(key) {
    this.items = this.items.filter(i => i.key !== key);
    this.save();
    Toast.info('Item removed from cart.', 'Removed');
  },

  update(key, qty) {
    const item = this.items.find(i => i.key === key);
    if (item) {
      if (qty <= 0) { this.remove(key); return; }
      item.qty = Math.min(qty, item.stockCount);
      this.save();
    }
  },

  clear() {
    this.items = [];
    this.save();
  },

  get count() { return this.items.reduce((s, i) => s + i.qty, 0); },
  get subtotal() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  get shipping() { return this.subtotal >= 1500 ? 0 : 99; },
  get total() { return this.subtotal + this.shipping; },

  updateBadge() {
    const badges = document.querySelectorAll('[data-cart-badge]');
    badges.forEach(b => {
      b.textContent = this.count;
      b.style.display = this.count > 0 ? 'flex' : 'none';
    });
  },

  animateBadge() {
    const badges = document.querySelectorAll('[data-cart-badge]');
    badges.forEach(b => {
      b.classList.remove('bouncing');
      void b.offsetWidth;
      b.classList.add('bouncing');
    });
  }
};

// ─── Wishlist ─────────────────────────────────────────
const Wishlist = {
  items: [],

  init() {
    try {
      this.items = JSON.parse(localStorage.getItem('ov_wishlist')) || [];
    } catch { this.items = []; }
    this.updateBadge();
    this.syncHearts();
  },

  save() {
    localStorage.setItem('ov_wishlist', JSON.stringify(this.items));
    this.updateBadge();
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: this.items }));
  },

  toggle(product) {
    const idx = this.items.findIndex(i => i.id === product.id);
    if (idx > -1) {
      this.items.splice(idx, 1);
      Toast.info(`${product.name} removed from wishlist.`, 'Removed from Wishlist');
    } else {
      this.items.push({
        id: product.id, name: product.name, price: product.price,
        originalPrice: product.originalPrice, franchise: product.franchise,
        franchiseName: product.franchiseName, image: product.images[0],
        sizes: product.sizes
      });
      Toast.success(`${product.name} saved to wishlist! ❤️`, 'Added to Wishlist');
    }
    this.save();
    this.syncHearts();
  },

  has(id) { return this.items.some(i => i.id === id); },

  syncHearts() {
    document.querySelectorAll('[data-wishlist-btn]').forEach(btn => {
      const id = parseInt(btn.dataset.productId);
      btn.classList.toggle('wishlisted', this.has(id));
    });
  },

  updateBadge() {
    const badges = document.querySelectorAll('[data-wishlist-badge]');
    badges.forEach(b => {
      b.textContent = this.items.length;
      b.style.display = this.items.length > 0 ? 'flex' : 'none';
    });
  }
};

// ─── Recently Viewed ──────────────────────────────────
const RecentlyViewed = {
  items: [],
  max: 6,

  init() {
    try {
      this.items = JSON.parse(localStorage.getItem('ov_recent')) || [];
    } catch { this.items = []; }
  },

  add(productId) {
    this.items = this.items.filter(id => id !== productId);
    this.items.unshift(productId);
    this.items = this.items.slice(0, this.max);
    localStorage.setItem('ov_recent', JSON.stringify(this.items));
  },

  get() {
    return this.items.map(id => window.PRODUCTS?.find(p => p.id === id)).filter(Boolean);
  }
};

// ─── Product Card Builder ────────────────────────────
function buildProductCard(product, opts = {}) {
  const { showQuickView = true, cardWidth = '' } = opts;
  const wishlisted = Wishlist.has(product.id);
  const stockLow = product.stockCount <= 10 && product.stockCount > 0;

  return `
    <div class="product-card ${cardWidth ? 'carousel-card' : ''}" data-product-id="${product.id}" style="${cardWidth ? 'width:' + cardWidth : ''}">
      <div class="product-card__image-wrap">
        <img
          src="${product.images[0]}"
          alt="${product.name}"
          class="product-card__image"
          loading="lazy"
        >
        <div class="product-card__badges">
          ${product.isNew ? '<span class="badge badge-new badge-new-anim">NEW</span>' : ''}
          ${product.isSale ? `<span class="badge badge-sale">${product.discount}% OFF</span>` : ''}
        </div>
        <button
          class="product-card__wishlist ${wishlisted ? 'wishlisted' : ''}"
          data-wishlist-btn
          data-product-id="${product.id}"
          aria-label="Add to wishlist"
          onclick="handleWishlist(${product.id}, event)"
        >
          <svg class="heart-icon" viewBox="0 0 24 24" fill="${wishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        ${showQuickView ? `
          <div class="product-card__quick-view" onclick="openQuickView(${product.id})">
            Quick View 🔍
          </div>
        ` : ''}
      </div>

      ${stockLow ? `<div class="urgency-bar">⏰ Only ${product.stockCount} left in stock!</div>` : ''}

      <div class="product-card__body">
        <div class="product-card__franchise">
          <span class="badge badge-franchise ${getFranchiseClass(product.franchise)}">${product.franchiseName}</span>
        </div>
        <a href="product.html?id=${product.id}" class="product-card__name">${product.name}</a>
        <div class="product-card__meta">
          <div class="star-rating">
            ${generateStarHTML(product.rating)}
            <span class="rating-text">(${product.reviewCount}) · ${product.sold.toLocaleString()} sold</span>
          </div>
        </div>
        <div class="product-card__pricing">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${product.originalPrice > product.price ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>` : ''}
          <div class="live-counter" style="margin-left:auto">
            <div class="live-dot"></div>
            <span>${Math.floor(Math.random() * 18) + 3} viewing</span>
          </div>
        </div>
      </div>
      <div class="product-card__actions">
        <button
          class="btn btn-primary btn-sm product-card__atc ripple-container"
          onclick="addToCartFromCard(${product.id}, this)"
          ${!product.inStock ? 'disabled' : ''}
        >
          ${product.inStock ? '🛒 Add to Cart' : '😢 Out of Stock'}
        </button>
      </div>
    </div>
  `;
}

// ─── Global Handlers ─────────────────────────────────
function handleWishlist(productId, event) {
  event.stopPropagation();
  event.preventDefault();
  const product = window.PRODUCTS?.find(p => p.id === productId);
  if (!product) return;
  Wishlist.toggle(product);
  const btn = document.querySelector(`[data-wishlist-btn][data-product-id="${productId}"]`);
  if (btn) {
    btn.classList.toggle('wishlisted', Wishlist.has(productId));
    const icon = btn.querySelector('.heart-icon');
    if (icon) {
      icon.setAttribute('fill', Wishlist.has(productId) ? 'currentColor' : 'none');
    }
  }
}

function addToCartFromCard(productId, btn) {
  const product = window.PRODUCTS?.find(p => p.id === productId);
  if (!product) return;
  if (product.sizes && product.sizes.length > 0) {
    openQuickView(productId);
    return;
  }
  addRipple(btn);
  Cart.add(product);
}

function addRipple(el) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  const rect = el.getBoundingClientRect();
  ripple.style.left = '50%';
  ripple.style.top = '50%';
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// ─── Quick View ───────────────────────────────────────
function openQuickView(productId) {
  const product = window.PRODUCTS?.find(p => p.id === productId);
  if (!product) return;

  const sizeOptions = product.sizes.length > 0
    ? `<div>
        <div style="font-weight:600;font-size:13px;margin-bottom:8px;">Select Size:</div>
        <div class="size-selector" id="qv-sizes">
          ${product.sizes.map(s => `<div class="size-option" onclick="this.parentNode.querySelectorAll('.size-option').forEach(x=>x.classList.remove('selected'));this.classList.add('selected')">${s}</div>`).join('')}
        </div>
       </div>` : '';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'quick-view-overlay';
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="Quick view: ${product.name}">
      <button class="modal__close" onclick="document.getElementById('quick-view-overlay').remove()" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="quick-view">
        <div>
          <img src="${product.images[0]}" alt="${product.name}" style="width:100%;border-radius:12px;object-fit:cover;aspect-ratio:1">
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;padding:8px 0">
          <div>
            <span class="badge badge-franchise ${getFranchiseClass(product.franchise)}">${product.franchiseName}</span>
          </div>
          <h3 style="font-size:20px;line-height:1.3">${product.name}</h3>
          <div class="star-rating">${generateStarHTML(product.rating)}<span class="rating-text">${product.rating} (${product.reviewCount} reviews)</span></div>
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <span class="price-current" style="font-size:24px">${formatPrice(product.price)}</span>
            ${product.originalPrice > product.price ? `<span class="price-original">${formatPrice(product.originalPrice)}</span><span class="price-save">Save ${product.discount}%</span>` : ''}
          </div>
          <p style="font-size:14px;color:var(--text-secondary);line-height:1.6">${product.description}</p>
          ${sizeOptions}
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn btn-primary btn-lg" style="flex:1" onclick="addToCartFromQuickView(${product.id})">
              🛒 Add to Cart
            </button>
            <a href="product.html?id=${product.id}" class="btn btn-outlined-purple">
              View Full Details
            </a>
          </div>
          <div class="trust-badges-mini">
            <div class="trust-badge-mini">✅ Authentic</div>
            <div class="trust-badge-mini">🚚 Ships in 2-5 days</div>
            <div class="trust-badge-mini">🔄 Easy Returns</div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); }
  });
}

function addToCartFromQuickView(productId) {
  const product = window.PRODUCTS?.find(p => p.id === productId);
  if (!product) return;
  const sizes = document.querySelector('#qv-sizes');
  let size = null;
  if (sizes) {
    const sel = sizes.querySelector('.size-option.selected');
    if (!sel && product.sizes.length > 0) {
      Toast.warning('Please select a size first!', 'Select Size');
      return;
    }
    if (sel) size = sel.textContent;
  }
  Cart.add(product, 1, size);
  document.getElementById('quick-view-overlay')?.remove();
}

// ─── Init on DOMContentLoaded ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
  Wishlist.init();
  RecentlyViewed.init();
  Toast.init();
});

// Expose globally
window.Cart = Cart;
window.Wishlist = Wishlist;
window.RecentlyViewed = RecentlyViewed;
window.Toast = Toast;
window.formatPrice = formatPrice;
window.buildProductCard = buildProductCard;
window.handleWishlist = handleWishlist;
window.addToCartFromCard = addToCartFromCard;
window.openQuickView = openQuickView;
window.addToCartFromQuickView = addToCartFromQuickView;
window.generateStarHTML = generateStarHTML;
window.getFranchiseClass = getFranchiseClass;
