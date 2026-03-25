// home-map.js — Main map / hub scene

import { gameState } from '../state.js';
import { navigate } from '../router.js';
import {
  createMapCard, createProgressBar, showHUD, showNav, updateHUD
} from '../ui.js';
import { on, off } from '../state.js';

let statsChangeHandler = null;

export function render(container) {
  showHUD();
  showNav();
  updateHUD();

  const screen = document.createElement('div');
  screen.className = 'map-screen fade-in';

  // --- Greeting ---
  const greeting = document.createElement('div');
  greeting.className = 'map-greeting';

  const name = gameState.character.name || 'Игрок';
  const animal = gameState.character.currentAnimal;
  const avatar = animal ? animal.emoji : gameState.character.avatar;

  // Time-based greeting emoji
  const hour = gameState.time.hour;
  let timeEmoji = '☀️';
  let timeGreeting = 'Добрый день';
  if (hour >= 6 && hour < 12) {
    timeEmoji = '🌅';
    timeGreeting = 'Доброе утро';
  } else if (hour >= 12 && hour < 18) {
    timeEmoji = '☀️';
    timeGreeting = 'Добрый день';
  } else if (hour >= 18 && hour < 22) {
    timeEmoji = '🌇';
    timeGreeting = 'Добрый вечер';
  } else {
    timeEmoji = '🌙';
    timeGreeting = 'Доброй ночи';
  }

  const greetingName = document.createElement('div');
  greetingName.className = 'map-greeting-name';
  greetingName.textContent = `${timeGreeting}, ${name}! ${timeEmoji}`;
  greeting.appendChild(greetingName);

  // Animal transformation notice
  if (animal) {
    const animalNotice = document.createElement('div');
    animalNotice.style.marginTop = '4px';
    animalNotice.style.fontSize = '14px';
    animalNotice.style.color = '#666';
    animalNotice.innerHTML = `${animal.emoji} Ты сейчас <strong>${animal.name}</strong>! ${animal.ability || ''}`;
    greeting.appendChild(animalNotice);
  }

  screen.appendChild(greeting);

  // --- Map locations grid ---
  const locations = document.createElement('div');
  locations.className = 'map-locations';

  // Define all locations
  const allLocations = [
    { icon: '💼', label: 'Работа', scene: 'work', always: true },
    { icon: '🛒', label: 'Магазин', scene: 'shop', always: true },
    { icon: '🏠', label: 'Мой дом', scene: 'house', always: false, show: !!gameState.inventory.house },
    { icon: '🐹', label: 'Питомцы', scene: 'pets', always: true },
    { icon: '🍽️', label: 'Ресторан', scene: 'restaurant', always: true },
    { icon: '✈️', label: 'Путешествия', scene: 'travel', always: true },
    { icon: '👥', label: 'Друзья', scene: 'friends', always: true },
    { icon: '🦋', label: 'Превращение', scene: 'transform', always: true }
  ];

  allLocations.forEach(loc => {
    // Only show if always visible or condition met
    if (!loc.always && !loc.show) return;

    const card = createMapCard(loc.icon, loc.label, () => {
      navigate(loc.scene);
    });
    locations.appendChild(card);
  });

  screen.appendChild(locations);

  // --- Stats section ---
  const statsSection = document.createElement('div');
  statsSection.className = 'flex-col';
  statsSection.style.marginTop = '20px';
  statsSection.id = 'map-stats';

  const statsTitle = document.createElement('div');
  statsTitle.style.fontSize = '16px';
  statsTitle.style.fontWeight = '700';
  statsTitle.style.marginBottom = '8px';
  statsTitle.textContent = '📊 Твои показатели';
  statsSection.appendChild(statsTitle);

  renderStatBars(statsSection);

  // Money display
  const moneyRow = document.createElement('div');
  moneyRow.style.display = 'flex';
  moneyRow.style.alignItems = 'center';
  moneyRow.style.justifyContent = 'center';
  moneyRow.style.gap = '8px';
  moneyRow.style.marginTop = '8px';
  moneyRow.style.padding = '12px';
  moneyRow.style.background = 'white';
  moneyRow.style.borderRadius = '10px';
  moneyRow.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
  moneyRow.id = 'map-money';
  moneyRow.innerHTML = `<span style="font-size:24px">💰</span><span style="font-size:20px;font-weight:700;color:#FF9800">${gameState.stats.money} монет</span>`;
  statsSection.appendChild(moneyRow);

  // Profession info
  if (gameState.profession.current) {
    const profRow = document.createElement('div');
    profRow.style.textAlign = 'center';
    profRow.style.marginTop = '8px';
    profRow.style.fontSize = '14px';
    profRow.style.color = '#666';
    profRow.textContent = `Профессия: ${gameState.profession.current} (ур. ${gameState.profession.level})`;
    statsSection.appendChild(profRow);
  }

  screen.appendChild(statsSection);

  container.appendChild(screen);

  // Listen for stat changes to update bars
  statsChangeHandler = () => {
    const statsEl = document.getElementById('map-stats');
    const moneyEl = document.getElementById('map-money');
    if (statsEl) {
      // Re-render stat bars
      const bars = statsEl.querySelectorAll('.progress-wrap');
      bars.forEach(b => b.remove());
      renderStatBars(statsEl);
    }
    if (moneyEl) {
      moneyEl.innerHTML = `<span style="font-size:24px">💰</span><span style="font-size:20px;font-weight:700;color:#FF9800">${gameState.stats.money} монет</span>`;
    }
  };
  on('statsChange', statsChangeHandler);
}

function renderStatBars(parent) {
  const s = gameState.stats;

  const bars = [
    { label: '⚡ Энергия', value: s.energy, max: 100, color: 'progress-energy' },
    { label: '😊 Счастье', value: s.happiness, max: 100, color: 'progress-happiness' },
    { label: '🍔 Сытость', value: s.hunger, max: 100, color: 'progress-hunger' }
  ];

  bars.forEach(b => {
    const bar = createProgressBar(b.label, b.value, b.max, b.color);
    parent.appendChild(bar);
  });
}

export function cleanup() {
  if (statsChangeHandler) {
    off('statsChange', statsChangeHandler);
    statsChangeHandler = null;
  }
}
