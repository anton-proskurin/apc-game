// restaurant.js — Restaurant scene: choose restaurant, order food

import { gameState, spendMoney, canAfford, changeStat } from '../state.js';
import { navigate } from '../router.js';
import {
  createBackButton, createSectionTitle, createButton,
  showToast, showHUD, showNav, updateHUD
} from '../ui.js';
import { advanceHours } from '../time.js';
import { RESTAURANTS } from '../data.js';

let timers = [];

// ─── Main render ───────────────────────────────────────────────
export function render(container, params = {}) {
  showHUD();
  showNav();

  const screen = document.createElement('div');
  screen.className = 'restaurant-screen fade-in';

  screen.appendChild(createBackButton('home-map'));
  screen.appendChild(createSectionTitle('Рестораны'));

  if (params.restaurantId) {
    renderMenu(screen, params.restaurantId);
  } else {
    renderRestaurantList(screen);
  }

  container.appendChild(screen);
}

// ─── Restaurant List ───────────────────────────────────────────
function renderRestaurantList(screen) {
  RESTAURANTS.forEach(rest => {
    const card = document.createElement('div');
    card.className = 'restaurant-card';

    const header = document.createElement('div');
    header.className = 'flex-row';
    header.style.marginBottom = '8px';

    const icon = document.createElement('div');
    icon.style.fontSize = '40px';
    icon.textContent = rest.emoji;

    const info = document.createElement('div');
    info.style.flex = '1';

    const name = document.createElement('h3');
    name.style.fontSize = 'var(--font-size-lg)';
    name.style.fontWeight = '700';
    name.textContent = rest.name;

    const desc = document.createElement('p');
    desc.style.fontSize = 'var(--font-size-sm)';
    desc.style.color = 'var(--color-text-light)';
    desc.textContent = rest.desc;

    info.appendChild(name);
    info.appendChild(desc);
    header.appendChild(icon);
    header.appendChild(info);
    card.appendChild(header);

    // Price range hint
    const prices = rest.menu.map(m => m.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const priceHint = document.createElement('div');
    priceHint.style.fontSize = 'var(--font-size-sm)';
    priceHint.style.color = 'var(--color-secondary)';
    priceHint.style.fontWeight = '600';
    priceHint.textContent = `${minPrice}–${maxPrice} APC`;
    card.appendChild(priceHint);

    card.addEventListener('click', () => {
      navigate('restaurant', { restaurantId: rest.id });
    });

    screen.appendChild(card);
  });
}

// ─── Menu ──────────────────────────────────────────────────────
function renderMenu(screen, restaurantId) {
  const rest = RESTAURANTS.find(r => r.id === restaurantId);
  if (!rest) {
    renderRestaurantList(screen);
    return;
  }

  // Restaurant header
  const header = document.createElement('div');
  header.className = 'text-center mb-lg';

  const icon = document.createElement('div');
  icon.style.fontSize = '64px';
  icon.textContent = rest.emoji;
  header.appendChild(icon);

  const name = document.createElement('div');
  name.className = 'page-title';
  name.style.marginBottom = '4px';
  name.textContent = rest.name;
  header.appendChild(name);

  const desc = document.createElement('div');
  desc.className = 'page-subtitle';
  desc.style.marginBottom = '0';
  desc.textContent = rest.desc;
  header.appendChild(desc);

  screen.appendChild(header);

  // Back to restaurant list
  const backBtn = createButton('← Другие рестораны', () => {
    navigate('restaurant');
  }, 'btn-outline');
  backBtn.style.marginBottom = '16px';
  backBtn.style.display = 'flex';
  backBtn.style.width = '100%';
  screen.appendChild(backBtn);

  // Menu items
  const menuList = document.createElement('div');
  menuList.className = 'card';

  rest.menu.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';

    const left = document.createElement('div');
    left.className = 'menu-item-left';

    const itemEmoji = document.createElement('span');
    itemEmoji.style.fontSize = '28px';
    itemEmoji.textContent = item.emoji;

    const itemInfo = document.createElement('div');

    const itemName = document.createElement('div');
    itemName.className = 'menu-item-name';
    itemName.textContent = item.name;

    const itemStats = document.createElement('div');
    itemStats.style.fontSize = '12px';
    itemStats.style.color = 'var(--color-text-light)';
    itemStats.textContent = `🍔+${item.hungerBoost}  😊+${item.happinessBoost}`;

    itemInfo.appendChild(itemName);
    itemInfo.appendChild(itemStats);
    left.appendChild(itemEmoji);
    left.appendChild(itemInfo);

    const right = document.createElement('div');
    right.style.textAlign = 'right';

    const price = document.createElement('div');
    price.className = 'text-money';
    price.style.marginBottom = '4px';
    price.style.fontSize = 'var(--font-size-sm)';
    price.textContent = `${item.price} APC`;

    const buyBtn = createButton('Заказать', () => {
      orderFood(item, itemEmoji, screen, restaurantId);
    }, 'btn-primary');
    buyBtn.style.padding = '6px 12px';
    buyBtn.style.fontSize = '13px';
    buyBtn.style.minHeight = '32px';

    right.appendChild(price);
    right.appendChild(buyBtn);

    menuItem.appendChild(left);
    menuItem.appendChild(right);
    menuList.appendChild(menuItem);
  });

  screen.appendChild(menuList);
}

// ─── Order Food ────────────────────────────────────────────────
function orderFood(item, emojiEl, screen, restaurantId) {
  if (!canAfford(item.price)) {
    showToast('Не хватает APC!', 'error');
    return;
  }

  spendMoney(item.price);
  changeStat('hunger', item.hungerBoost);
  changeStat('happiness', item.happinessBoost);
  advanceHours(1);

  // Eating animation
  emojiEl.classList.add('eating-anim');

  const animTimer = setTimeout(() => {
    emojiEl.classList.remove('eating-anim');
  }, 1500);
  timers.push(animTimer);

  showToast(`Вкусно! ${item.emoji}`);
  updateHUD();

  // Re-render menu after a brief pause (to show animation)
  const refreshTimer = setTimeout(() => {
    navigate('restaurant', { restaurantId });
  }, 1600);
  timers.push(refreshTimer);
}

// ─── Cleanup ───────────────────────────────────────────────────
export function cleanup() {
  timers.forEach(t => clearTimeout(t));
  timers = [];
}
