// Cart logic
function getProducts() {
  return window.PRODUCTS || [];
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("kalyhealth_cart") || "[]");
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("kalyhealth_cart", JSON.stringify(cart));
}

function addToCart(id, qty = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    const product = getProducts().find(p => p.id === id);
    if (product) {
      cart.push({ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        qty: qty,
        img: product.img || ""
      });
    }
  }
  saveCart(cart);
  updateCartBadge();
  showCart();
}

function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    const idx = cart.indexOf(item);
    cart.splice(idx, 1);
  }
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

function removeItem(id) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  badge.textContent = count;
  if (count > 0) {
    badge.classList.add("pulse");
    setTimeout(() => badge.classList.remove("pulse"), 600);
  }
}

function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!itemsEl) return;
  const cart = getCart();
  itemsEl.innerHTML = "";
  if (cart.length === 0) {
    const empty = document.createElement("div");
    empty.className = "cart-empty";
    empty.innerHTML = "<p>Your cart is empty.</p>";
    itemsEl.appendChild(empty);
  } else {
    cart.forEach(item => {
      const div = document.createElement("div");
      div.className = "cart-item";
      const mediaHtml = item.img 
        ? `<img src="${item.img}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">`
        : `<div class="cart-item-media placeholder"></div>`;
      div.innerHTML = `
        <div style="width:78px;height:62px;border-radius:10px;overflow:hidden;background:#f1f5f9;">
          ${mediaHtml}
        </div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${item.price} DH</div>
        </div>
        <div class="cart-item-actions">
          <div class="qty-control">
            <button class="qty-btn" data-action="dec" data-id="${item.id}">-</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
          </div>
          <button class="cart-remove" data-action="remove" data-id="${item.id}">Remove</button>
        </div>
      `;
      itemsEl.appendChild(div);
    });
  }
  if (totalEl) totalEl.textContent = cartTotal(cart) + " DH";
}

function showCart() {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;
  drawer.classList.add("active");
  document.body.classList.add("no-scroll");
  renderCart();
}

function hideCart() {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;
  drawer.classList.remove("active");
  document.body.classList.remove("no-scroll");
}

function orderViaWhatsApp() {
  const cart = getCart();
  if (cart.length === 0) return;
  const lines = cart.map(item => `- ${item.name} (x${item.qty})`);
  const total = cartTotal(cart);
  const message = `Hello, I would like to order:\n${lines.join("\n")}\nTotal: ${total} DH\nFrom: Parapharmacie Kalyhealth (Tiznit)`;
  const url = "https://wa.me/212665989087?text=" + encodeURIComponent(message);
  window.open(url, "_blank", "noopener");
}

function initCartUI() {
  const cartBtn = document.getElementById("cartBtn");
  const cartClose = document.getElementById("cartClose");
  const cartOverlay = document.getElementById("cartOverlay");
  const orderBtn = document.getElementById("orderWhatsApp");
  const itemsEl = document.getElementById("cartItems");

  if (cartBtn) cartBtn.addEventListener("click", showCart);
  if (cartClose) cartClose.addEventListener("click", hideCart);
  if (cartOverlay) cartOverlay.addEventListener("click", hideCart);
  if (orderBtn) orderBtn.addEventListener("click", orderViaWhatsApp);

  if (itemsEl) {
    itemsEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const id = parseInt(btn.getAttribute("data-id"));
      const action = btn.getAttribute("data-action");
      if (action === "inc") updateQty(id, 1);
      if (action === "dec") updateQty(id, -1);
      if (action === "remove") removeItem(id);
    });
  }

  updateCartBadge();
  renderCart();
}

window.addEventListener("DOMContentLoaded", initCartUI);
