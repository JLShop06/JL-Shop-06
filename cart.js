/* ============================================
   cart.js – Système panier unifié
   Les Jardins Enchantés
   ============================================ */

// ── Versioning du panier ──────────────────────
// Incrémente cette valeur à chaque modif de prix/produits Stripe
// pour purger automatiquement les anciens paniers obsolètes
// stockés dans le localStorage des clients.
const CART_VERSION = "v3-2026-05-17";

(function purgeOldCart() {
  try {
    const storedVersion = localStorage.getItem("cart_version");
    if (storedVersion !== CART_VERSION) {
      localStorage.removeItem("cart");
      localStorage.setItem("cart_version", CART_VERSION);
    }
  } catch (e) { /* localStorage indispo, on ignore */ }
})();

// ── Lecture / écriture localStorage ──────────
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ── Mise à jour du compteur dans le header ────
function updateCartCount() {
  const badge = document.getElementById("cartCount");
  if (badge) {
    const cart = getCart();
    badge.textContent = cart.length;
  }
}

// ── Ajout au panier ───────────────────────────
function addToCart(id, name, price, priceId) {
  const cart = getCart();
  cart.push({ id, name, price, priceId });
  saveCart(cart);
  updateCartCount();
  showToast(name + " ajouté au panier");
}

// ── Toast notification ────────────────────────
function showToast(message) {
  let toast = document.getElementById("lux-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "lux-toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 32px;
      right: 32px;
      background: #1a1a1a;
      border: 1px solid #caa86a;
      color: #caa86a;
      padding: 14px 24px;
      font-size: 12px;
      letter-spacing: 3px;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.style.opacity = "0"; }, 2500);
}

// ── Affichage du panier (modal) ───────────────
function showCart() {
  const modal = document.getElementById("cart-modal");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (!modal || !cartItems || !cartTotal) return;

  const cart = getCart();
  cartItems.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = "<li style='list-style:none;color:#9c9c9c;letter-spacing:2px;font-size:12px;'>Votre panier est vide</li>";
  } else {
    cart.forEach((p, i) => {
      const li = document.createElement("li");
      li.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(202,168,106,0.15);list-style:none;";
      li.innerHTML = `<span style="font-size:13px;letter-spacing:1px;">${p.name}</span>
        <span style="color:#caa86a;font-size:13px;">${Number(p.price).toFixed(2)} €</span>`;
      cartItems.appendChild(li);
      total += Number(p.price);
    });
  }

  cartTotal.textContent = total.toFixed(2);
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeCart() {
  const modal = document.getElementById("cart-modal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
}

function clearCart() {
  saveCart([]);
  updateCartCount();
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  if (cartItems) cartItems.innerHTML = "";
  if (cartTotal) cartTotal.textContent = "0.00";
}

// ── Checkout Stripe ───────────────────────────
async function checkout() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast("Votre panier est vide");
    return;
  }

  const btn = document.getElementById("checkout-btn");
  if (btn) { btn.textContent = "CHARGEMENT..."; btn.disabled = true; }

  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart })
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      showToast("Erreur paiement : " + (data.error || "Réessayez"));
      if (btn) { btn.textContent = "PAYER"; btn.disabled = false; }
    }
  } catch (err) {
    console.error(err);
    showToast("Erreur serveur – veuillez réessayer");
    if (btn) { btn.textContent = "PAYER"; btn.disabled = false; }
  }
}

// ── Initialisation au chargement de la page ───
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  // Gestion des boutons add-to-cart via data-attributes (pages produits)
  document.querySelectorAll(".add-to-cart[data-product-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(
        btn.dataset.productId,
        btn.dataset.productName,
        btn.dataset.productPrice,
        btn.dataset.productId
      );
    });
  });

  // Fermeture modale en cliquant en dehors
  const modal = document.getElementById("cart-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeCart();
    });
  }
});
