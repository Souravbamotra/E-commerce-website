/* ═══════════════════════════════════════════════════════
   OtakuVault — Product Detail Page
   ═══════════════════════════════════════════════════════ */

let currentProduct = null;
let selectedSize   = null;
let quantity       = 1;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  if (!id || !window.PRODUCTS) return;

  currentProduct = window.PRODUCTS.find(p => p.id === id);
  if (!currentProduct) { document.getElementById('product-detail')?.remove(); return; }

  RecentlyViewed.add(id);
  renderProductDetail();
  renderRelated();
  initTabs('[data-tabs-container]');
});

function renderProductDetail() {
  const p = currentProduct;
  document.title = `${p.name} | OtakuVault`;

  // Image
  const mainImg = document.getElementById('main-product-image');
  if (mainImg) mainImg.src = p.images[0];
  if (mainImg) mainImg.alt = p.name;

  // Badges
  const badgesEl = document.getElementById('product-detail-badges');
  if (badgesEl) {
    badgesEl.innerHTML = `
      <span class="badge badge-franchise ${getFranchiseClass(p.franchise)}">${p.franchiseName}</span>
      ${p.isNew ? '<span class="badge badge-new">NEW</span>' : ''}
      ${p.isSale ? `<span class="badge badge-sale">${p.discount}% OFF</span>` : ''}
    `;
  }

  // Title
  const titleEl = document.getElementById('product-title');
  if (titleEl) titleEl.textContent = p.name;

  // Rating
  const ratingEl = document.getElementById('product-rating');
  if (ratingEl) {
    ratingEl.innerHTML = `
      <div class="star-rating">${generateStarHTML(p.rating)}</div>
      <a href="#reviews" style="color:var(--accent-purple);font-size:13px">${p.reviewCount} reviews</a>
      <span style="color:var(--text-tertiary);font-size:13px">·</span>
      <span style="font-size:13px;color:var(--text-secondary)">${p.sold.toLocaleString()} sold</span>
    `;
  }

  // Price
  const priceEl = document.getElementById('product-price');
  if (priceEl) {
    priceEl.innerHTML = `
      <span class="price-current" style="font-size:28px">${formatPrice(p.price)}</span>
      ${p.originalPrice > p.price ? `<span class="price-original" style="font-size:16px">${formatPrice(p.originalPrice)}</span><span class="price-save">You save ${formatPrice(p.originalPrice - p.price)} (${p.discount}%)</span>` : ''}
    `;
  }

  // Live counter + urgency
  const liveEl = document.getElementById('product-live');
  if (liveEl) {
    liveEl.innerHTML = `
      <div class="live-counter"><div class="live-dot"></div><span>${Math.floor(Math.random() * 24) + 5} people viewing this</span></div>
      ${p.stockCount <= 10 ? `<span style="background:rgba(245,158,11,0.1);color:var(--warning);padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;">⏰ Only ${p.stockCount} left!</span>` : ''}
    `;
  }

  // Sizes
  const sizesEl = document.getElementById('size-selector');
  if (sizesEl) {
    if (p.sizes && p.sizes.length > 0) {
      sizesEl.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-weight:600;font-size:14px">Select Size</span>
          <a href="#" style="font-size:12px;color:var(--accent-purple)" onclick="openSizeChart(event)">Size Chart 📏</a>
        </div>
        <div class="size-selector" id="pd-sizes">
          ${p.sizes.map(s => `<div class="size-option" onclick="selectSize('${s}', this)">${s}</div>`).join('')}
        </div>
      `;
    } else {
      sizesEl.style.display = 'none';
    }
  }

  // Description tab
  const descEl = document.getElementById('tab-description');
  if (descEl) {
    descEl.innerHTML = `
      <p style="line-height:1.8;color:var(--text-secondary)">${p.description}</p>
      <div class="trust-badges-mini" style="margin-top:20px;gap:20px">
        <div class="trust-badge-mini">✅ Authentic Product</div>
        <div class="trust-badge-mini">🚚 Ships in 2-5 days</div>
        <div class="trust-badge-mini">🔄 7-day easy returns</div>
        <div class="trust-badge-mini">💳 Secure payment</div>
      </div>
    `;
  }

  // Specs tab
  const specsEl = document.getElementById('tab-specs');
  if (specsEl && p.specs) {
    specsEl.innerHTML = `
      <table style="width:100%;border-collapse:collapse">
        ${Object.entries(p.specs).map(([k, v]) => `
          <tr style="border-bottom:1px solid var(--border-color)">
            <td style="padding:12px 0;font-weight:600;width:40%;color:var(--text-primary);text-transform:capitalize">${k}</td>
            <td style="padding:12px 0;color:var(--text-secondary)">${v}</td>
          </tr>
        `).join('')}
      </table>
    `;
  }

  // Reviews tab
  renderReviews();

  // Shipping tab
  const shipEl = document.getElementById('tab-shipping');
  if (shipEl) {
    shipEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="trust-badge-mini" style="font-size:14px;gap:12px"><span style="font-size:1.4em">🚚</span><div><strong>Free Shipping</strong> on orders above ₹1,500. Standard shipping ₹99.</div></div>
        <div class="trust-badge-mini" style="font-size:14px;gap:12px"><span style="font-size:1.4em">📦</span><div><strong>Delivery:</strong> 2-5 business days for most pin codes across India.</div></div>
        <div class="trust-badge-mini" style="font-size:14px;gap:12px"><span style="font-size:1.4em">🔄</span><div><strong>Returns:</strong> 7-day hassle-free return policy. Unused, original packaging.</div></div>
        <div class="trust-badge-mini" style="font-size:14px;gap:12px"><span style="font-size:1.4em">💳</span><div><strong>COD Available:</strong> Cash on delivery available for orders under ₹2,999.</div></div>
      </div>
    `;
  }

  // Wishlist button sync
  const wishBtn = document.getElementById('pd-wishlist-btn');
  if (wishBtn) {
    wishBtn.classList.toggle('active', Wishlist.has(p.id));
    wishBtn.innerHTML = Wishlist.has(p.id) ? '❤️ Wishlisted' : '🤍 Add to Wishlist';
  }
}

function renderReviews() {
  const el = document.getElementById('tab-reviews');
  if (!el || !window.REVIEWS) return;
  const reviews = window.REVIEWS.filter(r => r.productId === currentProduct.id);
  if (!reviews.length) { el.innerHTML = '<p style="color:var(--text-secondary)">No reviews yet. Be the first!</p>'; return; }

  // Rating breakdown
  const avg = currentProduct.rating;
  const ratingCounts = { 5:0, 4:0, 3:0, 2:0, 1:0 };
  reviews.forEach(r => { ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1; });

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:180px 1fr;gap:32px;margin-bottom:32px">
      <div style="text-align:center">
        <div style="font-size:56px;font-weight:900;color:var(--text-primary)">${avg}</div>
        <div class="star-rating" style="justify-content:center;margin:4px 0">${generateStarHTML(avg)}</div>
        <div style="font-size:13px;color:var(--text-secondary)">${currentProduct.reviewCount} reviews</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;justify-content:center">
        ${[5,4,3,2,1].map(s => `
          <div class="rating-bar-row">
            <span style="font-size:12px;font-weight:600;width:16px;text-align:right">${s}</span>
            <span style="font-size:12px;color:#FBBF24">★</span>
            <div class="rating-bar" style="flex:1">
              <div class="rating-bar-fill" style="width:${((ratingCounts[s] || 0) / reviews.length) * 100}%"></div>
            </div>
            <span style="font-size:12px;color:var(--text-tertiary);width:20px">${ratingCounts[s] || 0}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:20px">
      ${reviews.map(r => `
        <div style="padding:20px;border:1px solid var(--border-color);border-radius:12px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:40px;height:40px;border-radius:50%;background:var(--bg-purple-light);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--accent-purple)">${r.name[0]}</div>
              <div>
                <div style="font-weight:700;font-size:14px">${r.name}</div>
                <div style="font-size:12px;color:var(--text-tertiary)">${r.city} · ${new Date(r.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</div>
              </div>
            </div>
            <div style="color:#FBBF24;font-size:14px">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          </div>
          <p style="font-size:14px;color:var(--text-secondary);line-height:1.7">${r.text}</p>
          ${r.verified ? '<div style="font-size:11px;color:var(--success);margin-top:8px;font-weight:600">✅ Verified Purchase</div>' : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderRelated() {
  // "You May Also Like" — same franchise or category
  const el = document.getElementById('related-products');
  if (el) {
    const related = window.PRODUCTS.filter(p =>
      p.id !== currentProduct.id &&
      (p.franchise === currentProduct.franchise || p.category === currentProduct.category)
    ).slice(0, 6);
    el.innerHTML = related.map(p => buildProductCard(p, { cardWidth: '240px' })).join('');
  }

  // "Complete Your Collection" — same franchise, DIFFERENT category
  const cc = document.getElementById('complete-collection');
  if (cc) {
    const complements = window.PRODUCTS.filter(p =>
      p.id !== currentProduct.id &&
      p.franchise === currentProduct.franchise &&
      p.category !== currentProduct.category
    ).slice(0, 6);
    if (complements.length > 0) {
      cc.innerHTML = complements.map(p => buildProductCard(p, { cardWidth: '240px' })).join('');
    } else {
      // Fallback: show bestsellers from any franchise
      const bestsellers = [...window.PRODUCTS]
        .filter(p => p.id !== currentProduct.id)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 6);
      cc.innerHTML = bestsellers.map(p => buildProductCard(p, { cardWidth: '240px' })).join('');
    }
  }
}

function selectSize(size, el) {
  selectedSize = size;
  document.querySelectorAll('#pd-sizes .size-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

function openSizeChart(e) {
  e.preventDefault();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:480px;padding:24px">
      <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      <h3 style="margin-bottom:20px">Size Chart</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead><tr style="background:var(--bg-secondary)">
          <th style="padding:10px;text-align:left;border:1px solid var(--border-color)">Size</th>
          <th style="padding:10px;border:1px solid var(--border-color)">Chest (in)</th>
          <th style="padding:10px;border:1px solid var(--border-color)">Length (in)</th>
          <th style="padding:10px;border:1px solid var(--border-color)">Shoulder (in)</th>
        </tr></thead>
        <tbody>
          ${[['XS','34','26','16'],['S','36','27','17'],['M','38','28','17.5'],['L','40','29','18'],['XL','42','30','18.5'],['XXL','44','31','19']].map(row => `
            <tr><td style="padding:10px;border:1px solid var(--border-color);font-weight:600">${row[0]}</td>
            <td style="padding:10px;border:1px solid var(--border-color);text-align:center">${row[1]}"</td>
            <td style="padding:10px;border:1px solid var(--border-color);text-align:center">${row[2]}"</td>
            <td style="padding:10px;border:1px solid var(--border-color);text-align:center">${row[3]}"</td></tr>
          `).join('')}
        </tbody>
      </table>
      <p style="font-size:12px;color:var(--text-tertiary);margin-top:12px">Measurements are approximate. When in doubt, size up for the oversized look.</p>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// Notify Me (Out of Stock)
window.handleNotifyMe = function(btn) {
  const input = btn.closest('div').querySelector('input[type=email]');
  const email = input?.value?.trim();
  if (!email || !email.includes('@')) {
    Toast.warning('Please enter a valid email address.', 'Invalid Email');
    input?.focus();
    return;
  }
  btn.textContent = '✅ Notified!';
  btn.disabled = true;
  input.disabled = true;
  Toast.success(`We'll email ${email} when this item is back in stock!`, '🔔 Notification Set');
};

// Add to cart from product detail page
window.addToCartFromDetail = function() {
  if (!currentProduct) return;
  if (currentProduct.sizes?.length > 0 && !selectedSize) {
    Toast.warning('Please select a size first!', 'Select Size');
    document.getElementById('pd-sizes')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  Cart.add(currentProduct, quantity, selectedSize);
};

window.toggleWishlistPD = function() {
  if (!currentProduct) return;
  Wishlist.toggle(currentProduct);
  const btn = document.getElementById('pd-wishlist-btn');
  if (btn) {
    btn.classList.toggle('active', Wishlist.has(currentProduct.id));
    btn.innerHTML = Wishlist.has(currentProduct.id) ? '❤️ Wishlisted' : '🤍 Add to Wishlist';
  }
};

// Quantity buttons
window.changeQty = function(delta) {
  quantity = Math.max(1, Math.min(quantity + delta, currentProduct?.stockCount || 99));
  const el = document.getElementById('pd-qty');
  if (el) el.textContent = quantity;
};

window.openSizeChart = openSizeChart;
