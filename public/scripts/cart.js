let cart = JSON.parse(localStorage.getItem('amaterasu_cart') || '[]');
const $ = (s) => document.querySelector(s);

const cartCount = #cartCount;
const cartDrawer = #cartDrawer;
const cartOverlay = #cartOverlay;
const cartClose = #cartClose;
const cartToggle = #cartToggle;
const cartItems = #cartItems;
const cartFooter = #cartFooter;
const cartTotal = #cartTotal;
const cartToast = #cartToast;

function save() { localStorage.setItem('amaterasu_cart', JSON.stringify(cart)); }

function showToast(msg) {
  cartToast.textContent = msg;
  cartToast.classList.remove('show');
  void cartToast.offsetWidth;
  cartToast.classList.add('show');
  clearTimeout(cartToast._timer);
  cartToast._timer = setTimeout(() => cartToast.classList.remove('show'), 2000);
}

function updateCounter() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  cartCount.textContent = count;
  cartCount.classList.remove('bounce');
  void cartCount.offsetWidth;
  if (count > 0) cartCount.classList.add('bounce');
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="drawer__empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><p>Your cart is empty</p><span style="font-size:0.75rem;color:var(--text-secondary)">Tap BUY $ to add items</span></div>';
    cartFooter.hidden = true;
    return;
  }
  cartFooter.hidden = false;
  let html = '', total = 0;
  cart.forEach((item, i) => {
    total += item.price * item.qty;
    html += '<div class="drawer__item">';
    html += '<img class="drawer__item-img" src="' + item.image + '" alt="' + item.name + '" loading="lazy" />';
    html += '<div class="drawer__item-info">';
    html += '<span class="drawer__item-name">' + item.name + '</span>';
    html += '<span class="drawer__item-price">$' + item.price + '</span>';
    html += '<div class="drawer__item-qty">';
    html += '<button data-i="' + i + '" data-a="dec">-</button>';
    html += '<span>' + item.qty + '</span>';
    html += '<button data-i="' + i + '" data-a="inc">+</button>';
    html += '</div><button class="drawer__item-remove" data-i="' + i + '" data-a="rm">Remove</button>';
    html += '</div></div>';
  });
  cartItems.innerHTML = html;
  cartTotal.textContent = '$' + total;
  cartItems.querySelectorAll('[data-a]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.i);
      const a = btn.dataset.a;
      if (a === 'inc') { cart[i].qty += 1; }
      else if (a === 'dec') { cart[i].qty -= 1; if (cart[i].qty <= 0) cart.splice(i, 1); }
      else if (a === 'rm') { cart.splice(i, 1); }
      save(); updateCounter(); renderCart();
      if (cart.length === 0) showToast('Cart cleared');
    });
  });
}

function addToCart(product) {
  const ex = cart.find((i) => i.id === product.id);
  if (ex) { ex.qty += 1; showToast('+1 ' + product.name); }
  else { cart.push({ ...product, qty: 1 }); showToast(product.name + ' added!'); }
  save(); updateCounter(); openDrawer(); renderCart();
}

function openDrawer() { cartDrawer.classList.add('open'); cartOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; renderCart(); }
function closeDrawer() { cartDrawer.classList.remove('open'); cartOverlay.classList.remove('open'); document.body.style.overflow = ''; }

cartToggle.addEventListener('click', () => { cartDrawer.classList.contains('open') ? closeDrawer() : openDrawer(); });
cartClose.addEventListener('click', closeDrawer);
cartOverlay.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.card__buy');
  if (!btn) return;
  const card = btn.closest('.product-card');
  addToCart({
    id: parseInt(btn.dataset.productId),
    name: card.querySelector('.card__name').textContent,
    price: parseFloat(card.querySelector('.card__price').textContent.replace('$', '')),
    image: card.querySelector('.card__image').src,
  });
});

updateCounter();
if (cart.length > 0) renderCart();