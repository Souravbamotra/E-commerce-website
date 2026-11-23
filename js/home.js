/* ═══════════════════════════════════════════════════════
   OtakuVault — Home Page: Carousels, Hero, Franchises
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.PRODUCTS) return;
  renderFranchiseLogos();
  renderTrendingCarousel();
  renderNewDrops();
  renderTestimonials();
  renderRecentlyViewed();
  initCarousels();
  initNewsletterForm();
  simulateLiveCounters();
  initCountdownTimer();
});

// ─── Franchise Logos ────────────────────────────────
function renderFranchiseLogos() {
  const container = document.getElementById('franchise-logos');
  if (!container) return;
  container.innerHTML = window.FRANCHISES.map(f => `
    <a href="shop.html?franchise=${f.id}" class="franchise-logo-card" title="Shop ${f.name}">
      <div class="franchise-logo" style="border-color:${f.color};color:${f.color};font-size:22px;">
        ${f.char}
      </div>
      <span class="franchise-label">${f.name}</span>
    </a>
  `).join('');
}

// ─── Trending Carousel ───────────────────────────────
function renderTrendingCarousel() {
  const container = document.getElementById('trending-carousel');
  if (!container) return;
  const trending = [...window.PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 10);
  container.innerHTML = trending.map(p => buildProductCard(p, { cardWidth: '260px' })).join('');
}

// ─── New Drops ───────────────────────────────────────
function renderNewDrops() {
  const container = document.getElementById('new-drops-grid');
  if (!container) return;
  const newItems = window.PRODUCTS.filter(p => p.isNew).slice(0, 6);
  container.innerHTML = newItems.map(p => buildProductCard(p)).join('');
  container.querySelectorAll('.product-card').forEach((c, i) => {
    c.classList.add('reveal', `reveal-delay-${i + 1}`);
    setTimeout(() => c.classList.add('revealed'), 100 + i * 80);
  });
}

// ─── Testimonials ─────────────────────────────────────
function renderTestimonials() {
  const container = document.getElementById('testimonials-carousel');
  if (!container || !window.TESTIMONIALS) return;
  container.innerHTML = window.TESTIMONIALS.map(t => `
    <div class="testimonial-card" style="min-width:300px;max-width:340px">
      <div class="testimonial-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
      <p class="testimonial-text">"${t.text}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${t.initials}</div>
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-location">📍 ${t.city}</div>
        </div>
        <div class="testimonial-verified">✅ Verified</div>
      </div>
    </div>
  `).join('');
}

// ─── Recently Viewed ─────────────────────────────────
function renderRecentlyViewed() {
  const container = document.getElementById('recently-viewed-carousel');
  const section   = document.getElementById('recently-viewed-section');
  if (!container || !section) return;

  // RecentlyViewed.get() returns product objects directly
  const items = RecentlyViewed.get().slice(0, 8);

  if (items.length === 0) return; // nothing to show

  container.innerHTML = items.map(p => buildProductCard(p, { cardWidth: '240px' })).join('');
  section.style.display = ''; // unhide the section
}

// ─── Carousels ─────────────────────────────────────
function initCarousels() {
  initCarousel('trending-carousel',       'trending-prev',     'trending-next');
  initCarousel('testimonials-carousel',   'testimonials-prev', 'testimonials-next');
  initCarousel('recently-viewed-carousel','recent-prev',       'recent-next');
}

// ─── Newsletter ───────────────────────────────────
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('input[type=email]')?.value;
    if (!email) return;
    Toast.success('🎉 Welcome to the Otaku Club! Check your email for your 10% off code.', 'You\'re In!');
    form.reset();
  });
}

// ─── Live View Counters ──────────────────────────
function simulateLiveCounters() {
  document.querySelectorAll('.live-counter span').forEach(el => {
    const base = parseInt(el.textContent);
    setInterval(() => {
      const fluctuation = Math.floor(Math.random() * 5) - 2;
      const newVal = Math.max(1, base + fluctuation);
      el.textContent = newVal + ' viewing';
    }, 4000 + Math.random() * 3000);
  });
}

// ─── Countdown Timer (New Drop) ───────────────────
function initCountdownTimer() {
  // Next Saturday midnight
  const now  = new Date();
  const days = 6 - now.getDay();
  const next = new Date(now);
  next.setDate(now.getDate() + (days <= 0 ? 7 : days));
  next.setHours(0, 0, 0, 0);
  initCountdown(next.getTime(), 'cd-days', 'cd-hours', 'cd-mins', 'cd-secs');
}
