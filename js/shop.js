/* ═══════════════════════════════════════════════════════
   OtakuVault — Shop: Filtering, Sorting, Quick View
   ═══════════════════════════════════════════════════════ */

let activeFilters = { franchises: [], categories: [], maxPrice: 5000, availability: 'all', sort: 'trending' };
let visibleCount = 12;
const PAGE_SIZE = 12;

document.addEventListener('DOMContentLoaded', () => {
  if (!window.PRODUCTS) return;

  // Handle URL params (franchise filter from homepage)
  const params = new URLSearchParams(window.location.search);
  const franchiseParam = params.get('franchise');
  const categoryParam  = params.get('category');
  const queryParam     = params.get('q');

  if (franchiseParam) activeFilters.franchises = [franchiseParam];
  if (categoryParam)  activeFilters.categories  = [categoryParam];
  if (queryParam)     window.searchQuery = queryParam.toLowerCase();

  buildFilterSidebar();
  initPriceSlider();
  renderProducts();
  initSortSelect();
  initLoadMore();
  initClearFilters();
  syncFilterUI();
});

function buildFilterSidebar() {
  buildFranchiseFilter();
  buildCategoryFilter();
}

function buildFranchiseFilter() {
  const container = document.getElementById('franchise-filter');
  if (!container) return;
  const counts = {};
  window.PRODUCTS.forEach(p => { counts[p.franchise] = (counts[p.franchise] || 0) + 1; });
  container.innerHTML = window.FRANCHISES
    .filter(f => (counts[f.id] || 0) > 0)
    .map(f => `
      <label class="filter-option">
        <input type="checkbox" value="${f.id}" ${activeFilters.franchises.includes(f.id) ? 'checked' : ''} onchange="toggleFranchise('${f.id}')">
        <span>${f.char} ${f.name}</span>
        <span class="filter-count">${counts[f.id] || 0}</span>
      </label>
    `).join('');
}

function buildCategoryFilter() {
  const container = document.getElementById('category-filter');
  if (!container) return;
  const counts = {};
  window.PRODUCTS.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
  container.innerHTML = window.CATEGORIES.map(c => `
    <label class="filter-option">
      <input type="checkbox" value="${c.id}" ${activeFilters.categories.includes(c.id) ? 'checked' : ''} onchange="toggleCategory('${c.id}')">
      <span>${c.icon} ${c.name}</span>
      <span class="filter-count">${counts[c.id] || 0}</span>
    </label>
  `).join('');
}

function toggleFranchise(id) {
  const idx = activeFilters.franchises.indexOf(id);
  if (idx > -1) activeFilters.franchises.splice(idx, 1);
  else activeFilters.franchises.push(id);
  visibleCount = PAGE_SIZE;
  filterProducts();
}

function toggleCategory(id) {
  const idx = activeFilters.categories.indexOf(id);
  if (idx > -1) activeFilters.categories.splice(idx, 1);
  else activeFilters.categories.push(id);
  visibleCount = PAGE_SIZE;
  filterProducts();
}

function syncFilterUI() {
  document.querySelectorAll('#franchise-filter input[type=checkbox]').forEach(cb => {
    cb.checked = activeFilters.franchises.includes(cb.value);
  });
  document.querySelectorAll('#category-filter input[type=checkbox]').forEach(cb => {
    cb.checked = activeFilters.categories.includes(cb.value);
  });
}

function filterProducts() {
  let results = [...window.PRODUCTS];

  // Search query
  if (window.searchQuery) {
    results = results.filter(p =>
      p.name.toLowerCase().includes(window.searchQuery) ||
      p.franchiseName.toLowerCase().includes(window.searchQuery)
    );
  }

  // Franchise
  if (activeFilters.franchises.length) {
    results = results.filter(p => activeFilters.franchises.includes(p.franchise));
  }

  // Category
  if (activeFilters.categories.length) {
    results = results.filter(p => activeFilters.categories.includes(p.category));
  }

  // Price
  results = results.filter(p => p.price <= (window.currentMaxPrice || activeFilters.maxPrice));

  // Availability
  if (activeFilters.availability === 'instock') results = results.filter(p => p.inStock);
  if (activeFilters.availability === 'preorder') results = results.filter(p => !p.inStock);

  // Sort
  switch (activeFilters.sort) {
    case 'newest':       results.sort((a, b) => b.id - a.id); break;
    case 'price-asc':    results.sort((a, b) => a.price - b.price); break;
    case 'price-desc':   results.sort((a, b) => b.price - a.price); break;
    case 'best-rated':   results.sort((a, b) => b.rating - a.rating); break;
    case 'trending':     results.sort((a, b) => b.sold - a.sold); break;
    default: break;
  }

  window.filteredProducts = results;
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  const countEl = document.getElementById('product-count');
  if (!grid) return;

  const products = window.filteredProducts || window.PRODUCTS || [];
  const visible  = products.slice(0, visibleCount);

  const countText = `Showing <strong>${visible.length}</strong> of <strong>${products.length}</strong> products`;
  if (countEl) countEl.innerHTML = countText;

  if (visible.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px">
        <div style="font-size:3rem;margin-bottom:16px">😿</div>
        <h3 style="margin-bottom:8px">No products found</h3>
        <p style="color:var(--text-secondary)">Try adjusting your filters or <a href="shop.html" style="color:var(--accent-purple)">view all products</a></p>
      </div>
    `;
    return;
  }

  grid.innerHTML = visible.map(p => buildProductCard(p)).join('');
  grid.querySelectorAll('.product-card').forEach((card, i) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${Math.min(i, 5) * 0.08}s`;
    setTimeout(() => card.classList.add('revealed'), 50);
  });

  // Update load more
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    const remaining = products.length - visibleCount;
    if (remaining > 0) {
      loadMoreBtn.style.display = '';
      loadMoreBtn.textContent = `Load More (${remaining} remaining)`;
    } else {
      loadMoreBtn.style.display = 'none';
    }
  }
}

function initSortSelect() {
  const select = document.getElementById('sort-select');
  if (!select) return;
  select.value = activeFilters.sort;
  select.addEventListener('change', () => {
    activeFilters.sort = select.value;
    filterProducts();
  });
}

function initLoadMore() {
  const btn = document.getElementById('load-more-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    renderProducts();
  });
}

function initClearFilters() {
  const btn = document.getElementById('clear-filters');
  if (!btn) return;
  btn.addEventListener('click', () => {
    activeFilters = { franchises: [], categories: [], maxPrice: 5000, availability: 'all', sort: 'trending' };
    window.currentMaxPrice = 5000;
    window.searchQuery = null;
    visibleCount = PAGE_SIZE;
    const slider = document.getElementById('price-slider');
    if (slider) { slider.value = 5000; document.getElementById('price-display').textContent = '₹99 — ₹5,000'; }
    syncFilterUI();
    buildFilterSidebar();
    const select = document.getElementById('sort-select');
    if (select) select.value = 'trending';
    filterProducts();
    Toast.info('All filters cleared.', 'Filters Reset');
  });
}

// Availability radio buttons
document.addEventListener('change', e => {
  if (e.target.name === 'availability') {
    activeFilters.availability = e.target.value;
    filterProducts();
  }
});

window.filterProducts = filterProducts;
window.toggleFranchise = toggleFranchise;
window.toggleCategory = toggleCategory;
