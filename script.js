// General UI, animations, products rendering, filters
function initNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const overlay = document.getElementById("navOverlay");
  if (!toggle || !links || !overlay) return;
  const open = () => {
    links.classList.add("open");
    overlay.classList.add("active");
    document.body.classList.add("no-scroll");
  };
  const close = () => {
    links.classList.remove("open");
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  };
  toggle.addEventListener("click", open);
  overlay.addEventListener("click", close);
  links.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", close));
}

function initAnimations() {
  const faders = document.querySelectorAll(".animate-fade-in-up");
  const stagers = document.querySelectorAll(".animate-stagger");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  faders.forEach(el => obs.observe(el));
  stagers.forEach(el => obs.observe(el));

  const stars = document.querySelectorAll(".stars");
  const starObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const count = parseInt(el.getAttribute("data-stars") || "5");
        el.querySelectorAll(".star").forEach((s, i) => {
          if (i < count) {
            setTimeout(() => s.classList.add("active"), i * 80);
          }
        });
        starObs.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  stars.forEach(el => starObs.observe(el));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderProducts(targetId, options = {}) {
  const container = document.getElementById(targetId);
  if (!container) return;
  let list = [...(window.PRODUCTS || [])];
  const featured = options.featured;
  if (featured) {
    list = list.slice(0, 6);
  }
  container.innerHTML = "";
  list.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card card-lift";
    const mediaHtml = product.img 
      ? `<img src="${escapeHtml(product.img)}" alt="${escapeHtml(product.name)}" style="width:100%;height:100%;object-fit:cover;">`
      : `<div class="product-media placeholder"></div>`;
    card.innerHTML = `
      <div class="product-media" style="overflow:hidden;background:#f1f5f9;">
        ${mediaHtml}
      </div>
      <div class="product-body">
        <div class="product-meta">
          <span class="product-category">${escapeHtml(product.category)}</span>
          <span class="product-price">${product.price} DH</span>
        </div>
        <h3 class="product-title">${escapeHtml(product.name)}</h3>
        <div class="product-actions">
          <button class="btn btn-add-cart tap-scale" data-add="${product.id}">Add to cart</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = parseInt(btn.getAttribute("data-add"));
    if (typeof window.addToCart === "function") {
      window.addToCart(id, 1);
      const media = btn.closest(".product-card")?.querySelector(".product-media");
      if (media) {
        media.style.animation = "microBounce 420ms ease";
        setTimeout(() => media.style.animation = "", 420);
      }
    }
  });
}

function initShopFilters() {
  const container = document.getElementById("shopProducts");
  if (!container) return;
  let all = [...(window.PRODUCTS || [])];
  const chips = document.querySelectorAll("#categoryFilters .filter-chip");
  const search = document.getElementById("searchInput");
  const sort = document.getElementById("sortSelect");
  let currentCategory = "all";
  let currentQuery = "";
  let currentSort = "default";

  function render() {
    let filtered = [...all];
    if (currentCategory !== "all") {
      filtered = filtered.filter(p => p.category === currentCategory);
    }
    if (currentQuery) {
      const q = currentQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
    }
    if (currentSort === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    }
    container.innerHTML = "";
    filtered.forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card card-lift animate-fade-in-up in-view";
      const mediaHtml = product.img 
        ? `<img src="${escapeHtml(product.img)}" alt="${escapeHtml(product.name)}" style="width:100%;height:100%;object-fit:cover;">`
        : `<div class="product-media placeholder"></div>`;
      card.innerHTML = `
        <div class="product-media" style="overflow:hidden;background:#f1f5f9;">
          ${mediaHtml}
        </div>
        <div class="product-body">
          <div class="product-meta">
            <span class="product-category">${escapeHtml(product.category)}</span>
            <span class="product-price">${product.price} DH</span>
          </div>
          <h3 class="product-title">${escapeHtml(product.name)}</h3>
          <div class="product-actions">
            <button class="btn btn-add-cart tap-scale" data-add="${product.id}">Add to cart</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentCategory = chip.getAttribute("data-category");
      render();
    });
  });
  if (search) search.addEventListener("input", (e) => { currentQuery = e.target.value; render(); });
  if (sort) sort.addEventListener("change", (e) => { currentSort = e.target.value; render(); });
  render();
}

function initContact() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const message = document.getElementById("message")?.value.trim();
    const lines = [];
    if (name) lines.push(`Name: ${name}`);
    if (phone) lines.push(`Phone: ${phone}`);
    if (email) lines.push(`Email: ${email}`);
    if (message) lines.push(`Message: ${message}`);
    const msg = "Hello Kalyhealth, I have a contact request:\n" + lines.join("\n");
    const url = "https://wa.me/212665989087?text=" + encodeURIComponent(msg);
    window.open(url, "_blank", "noopener");
    form.reset();
  });
}

function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

window.addEventListener("DOMContentLoaded", () => {
  setYear();
  initNav();
  initAnimations();
  if (window.PRODUCTS && document.getElementById("featuredProducts")) {
    renderProducts("featuredProducts", { featured: true });
  }
  if (document.getElementById("shopProducts")) {
    initShopFilters();
  }
  initContact();
});
