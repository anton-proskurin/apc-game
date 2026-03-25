// shop.js — Shop scene: buy cars and houses

import { gameState, spendMoney, canAfford, setCar, setHouse } from '../state.js';
import { navigate } from '../router.js';
import {
  createBackButton, createSectionTitle, createButton,
  showToast, showHUD, showNav, updateHUD
} from '../ui.js';
import { CARS, HOUSES } from '../data.js';

let currentTab = 'cars';

// ─── Main render ───────────────────────────────────────────────
export function render(container, params = {}) {
  showHUD();
  showNav();

  if (params.tab) {
    currentTab = params.tab;
  }

  const screen = document.createElement('div');
  screen.className = 'shop-screen fade-in';

  screen.appendChild(createBackButton('home-map'));
  screen.appendChild(createSectionTitle('Магазин'));

  // Tabs
  const tabs = document.createElement('div');
  tabs.className = 'shop-tabs';

  const carsTab = document.createElement('button');
  carsTab.className = `shop-tab ${currentTab === 'cars' ? 'active' : ''}`;
  carsTab.textContent = '🚗 Машины';
  carsTab.addEventListener('click', () => {
    currentTab = 'cars';
    navigate('shop', { tab: 'cars' });
  });

  const housesTab = document.createElement('button');
  housesTab.className = `shop-tab ${currentTab === 'houses' ? 'active' : ''}`;
  housesTab.textContent = '🏠 Дома';
  housesTab.addEventListener('click', () => {
    currentTab = 'houses';
    navigate('shop', { tab: 'houses' });
  });

  tabs.appendChild(carsTab);
  tabs.appendChild(housesTab);
  screen.appendChild(tabs);

  // Content area
  const content = document.createElement('div');
  content.className = 'shop-content';

  if (currentTab === 'cars') {
    renderCarsTab(content);
  } else {
    renderHousesTab(content);
  }

  screen.appendChild(content);
  container.appendChild(screen);
}

// ─── Cars Tab ──────────────────────────────────────────────────
function renderCarsTab(content) {
  const currentCar = gameState.inventory.car;

  CARS.forEach(car => {
    const isOwned = currentCar && currentCar.id === car.id;
    const item = document.createElement('div');
    item.className = `shop-item ${isOwned ? 'shop-item-owned' : ''}`;

    const icon = document.createElement('div');
    icon.className = 'shop-item-icon';
    icon.textContent = car.emoji;

    const info = document.createElement('div');
    info.className = 'shop-item-info';

    const name = document.createElement('h3');
    name.textContent = car.name;

    const desc = document.createElement('p');
    desc.textContent = car.desc;

    info.appendChild(name);
    info.appendChild(desc);

    item.appendChild(icon);
    item.appendChild(info);

    if (isOwned) {
      const badge = document.createElement('div');
      badge.className = 'owned-badge';
      badge.textContent = '✅ Куплено';
      item.appendChild(badge);
    } else {
      const priceWrap = document.createElement('div');
      priceWrap.style.textAlign = 'right';

      const priceText = document.createElement('div');
      priceText.className = 'text-money';
      priceText.style.marginBottom = '4px';
      priceText.textContent = `${car.price} APC`;

      const buyBtn = createButton('Купить', () => {
        buyCar(car);
      }, 'btn-primary');
      buyBtn.style.padding = '8px 16px';
      buyBtn.style.fontSize = 'var(--font-size-sm)';
      buyBtn.style.minHeight = '36px';

      priceWrap.appendChild(priceText);
      priceWrap.appendChild(buyBtn);
      item.appendChild(priceWrap);
    }

    content.appendChild(item);
  });
}

function buyCar(car) {
  if (!canAfford(car.price)) {
    showToast('Не хватает APC!', 'error');
    return;
  }

  spendMoney(car.price);
  setCar({ id: car.id, emoji: car.emoji, name: car.name });
  showToast(`Куплено! ${car.emoji} ${car.name}`);
  updateHUD();
  navigate('shop', { tab: 'cars' });
}

// ─── Houses Tab ────────────────────────────────────────────────
function renderHousesTab(content) {
  const currentHouse = gameState.inventory.house;

  HOUSES.forEach(house => {
    const isOwned = currentHouse && currentHouse.id === house.id;
    const item = document.createElement('div');
    item.className = `shop-item ${isOwned ? 'shop-item-owned' : ''}`;

    const icon = document.createElement('div');
    icon.className = 'shop-item-icon';
    icon.textContent = house.emoji;

    const info = document.createElement('div');
    info.className = 'shop-item-info';

    const name = document.createElement('h3');
    name.textContent = house.name;

    const desc = document.createElement('p');
    desc.textContent = house.desc;

    // Show rooms
    const rooms = document.createElement('p');
    rooms.style.fontSize = '12px';
    rooms.style.color = 'var(--color-text-light)';
    rooms.style.marginTop = '2px';
    rooms.textContent = house.rooms.join(', ');

    info.appendChild(name);
    info.appendChild(desc);
    info.appendChild(rooms);

    item.appendChild(icon);
    item.appendChild(info);

    if (isOwned) {
      const badge = document.createElement('div');
      badge.className = 'owned-badge';
      badge.textContent = '✅ Куплено';
      item.appendChild(badge);
    } else {
      const priceWrap = document.createElement('div');
      priceWrap.style.textAlign = 'right';

      // Calculate effective price with trade-in
      let effectivePrice = house.price;
      let tradeInValue = 0;

      if (currentHouse) {
        const currentHouseData = HOUSES.find(h => h.id === currentHouse.id);
        if (currentHouseData) {
          tradeInValue = Math.floor(currentHouseData.price * 0.5);
          effectivePrice = Math.max(0, house.price - tradeInValue);
        }
      }

      const priceText = document.createElement('div');
      priceText.className = 'text-money';
      priceText.style.marginBottom = '4px';

      if (tradeInValue > 0) {
        priceText.innerHTML = `
          <div style="text-decoration: line-through; opacity: 0.5; font-size: 12px;">${house.price} APC</div>
          <div>${effectivePrice} APC</div>
        `;
      } else {
        priceText.textContent = `${house.price} APC`;
      }

      if (tradeInValue > 0) {
        const tradeInText = document.createElement('div');
        tradeInText.style.fontSize = '11px';
        tradeInText.style.color = 'var(--color-success)';
        tradeInText.style.marginBottom = '4px';
        tradeInText.textContent = `Обмен: -${tradeInValue}`;
        priceWrap.appendChild(tradeInText);
      }

      const buyBtn = createButton('Купить', () => {
        buyHouse(house, effectivePrice);
      }, 'btn-primary');
      buyBtn.style.padding = '8px 16px';
      buyBtn.style.fontSize = 'var(--font-size-sm)';
      buyBtn.style.minHeight = '36px';

      priceWrap.appendChild(priceText);
      priceWrap.appendChild(buyBtn);
      item.appendChild(priceWrap);
    }

    content.appendChild(item);
  });
}

function buyHouse(house, effectivePrice) {
  if (!canAfford(effectivePrice)) {
    showToast('Не хватает APC!', 'error');
    return;
  }

  spendMoney(effectivePrice);
  setHouse({
    id: house.id,
    emoji: house.emoji,
    name: house.name,
    rooms: house.rooms
  });
  showToast(`Куплено! ${house.emoji} ${house.name}`);
  updateHUD();
  navigate('shop', { tab: 'houses' });
}

// ─── Cleanup ───────────────────────────────────────────────────
export function cleanup() {
  // Nothing to clean up
}
