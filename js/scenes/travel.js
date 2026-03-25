// travel.js — Travel agency and vacation scenes

import { gameState, spendMoney, canAfford, changeStat, addVisitedDestination } from '../state.js';
import { navigate } from '../router.js';
import {
  createBackButton, createSectionTitle, createSubtitle,
  createButton, createEmojiButton, showToast, showHUD, showNav, updateHUD
} from '../ui.js';
import { advanceHours } from '../time.js';
import { TRAVEL_DESTINATIONS } from '../data.js';

let currentView = 'agency'; // 'agency' | 'vacation'
let currentDestination = null;
let usedActivities = new Set();
let timers = [];

// ─── Main render ───────────────────────────────────────────────
export function render(container, params = {}) {
  showHUD();
  showNav();

  if (params.destination) {
    currentView = 'vacation';
    currentDestination = TRAVEL_DESTINATIONS.find(d => d.id === params.destination);
    usedActivities = new Set();
  }

  const screen = document.createElement('div');
  screen.className = 'fade-in';

  if (currentView === 'vacation' && currentDestination) {
    renderVacation(screen);
  } else {
    renderAgency(screen);
  }

  container.appendChild(screen);
}

// ─── Travel Agency ─────────────────────────────────────────────
function renderAgency(screen) {
  screen.appendChild(createBackButton('home-map'));
  screen.appendChild(createSectionTitle('Путешествия ✈️'));
  screen.appendChild(createSubtitle('Выбери направление и отправляйся в отпуск!'));

  TRAVEL_DESTINATIONS.forEach(dest => {
    const card = document.createElement('div');
    card.className = 'travel-card';

    const visited = gameState.travel.visited.includes(dest.id);

    // Background emoji
    const bgEmoji = document.createElement('div');
    bgEmoji.className = 'travel-card-icon';
    bgEmoji.textContent = dest.bgEmoji;
    card.appendChild(bgEmoji);

    // Name
    const name = document.createElement('div');
    name.className = 'travel-card-name';
    name.textContent = dest.name + (visited ? ' ✅' : '');
    card.appendChild(name);

    // Description
    const desc = document.createElement('div');
    desc.className = 'travel-card-desc';
    desc.textContent = dest.desc;
    card.appendChild(desc);

    // Activities preview
    const activitiesPreview = document.createElement('div');
    activitiesPreview.style.fontSize = '13px';
    activitiesPreview.style.color = 'var(--color-text-light)';
    activitiesPreview.style.marginBottom = '8px';
    activitiesPreview.textContent = dest.activities.map(a => a.emoji).join(' ');
    card.appendChild(activitiesPreview);

    // Price and duration
    const infoRow = document.createElement('div');
    infoRow.style.display = 'flex';
    infoRow.style.justifyContent = 'center';
    infoRow.style.gap = '16px';
    infoRow.style.marginBottom = '12px';

    const priceTag = document.createElement('span');
    priceTag.className = 'text-money';
    priceTag.textContent = `💰 ${dest.price} APC`;
    infoRow.appendChild(priceTag);

    const durationTag = document.createElement('span');
    durationTag.style.fontSize = '14px';
    durationTag.style.color = 'var(--color-text-light)';
    durationTag.textContent = `📅 ${dest.duration} дня`;
    infoRow.appendChild(durationTag);

    card.appendChild(infoRow);

    // Buy button
    const buyBtn = createEmojiButton('✈️', 'Купить тур', () => {
      buyTrip(dest);
    }, canAfford(dest.price) ? 'btn-primary' : 'btn-disabled');
    buyBtn.style.width = '100%';
    card.appendChild(buyBtn);

    // Remove card click to prevent conflicts with button
    screen.appendChild(card);
  });
}

function buyTrip(dest) {
  if (!canAfford(dest.price)) {
    showToast('Не хватает APC!', 'error');
    return;
  }
  if (gameState.stats.energy < 20) {
    showToast('Нет сил для путешествия! Отдохни.', 'warning');
    return;
  }

  spendMoney(dest.price);
  updateHUD();

  // Travel animation - brief loading
  showToast(`Летим на ${dest.name}! ✈️🌍`, 'info');

  const t = setTimeout(() => {
    currentView = 'vacation';
    currentDestination = dest;
    usedActivities = new Set();
    navigate('travel', { destination: dest.id });
  }, 800);
  timers.push(t);
}

// ─── Vacation Scene ────────────────────────────────────────────
function renderVacation(screen) {
  const dest = currentDestination;

  // Vacation background
  const vacScene = document.createElement('div');
  vacScene.className = 'vacation-scene';

  // Big background emoji
  const bg = document.createElement('div');
  bg.className = 'vacation-bg bounce-in';
  bg.textContent = dest.bgEmoji;
  vacScene.appendChild(bg);

  // Title
  const title = document.createElement('div');
  title.className = 'vacation-title';
  title.textContent = `Отпуск: ${dest.name} ${dest.emoji}`;
  vacScene.appendChild(title);

  // Description
  const desc = document.createElement('div');
  desc.className = 'page-subtitle';
  desc.style.marginBottom = '20px';
  desc.textContent = `Ты на ${dest.name === 'Море' ? 'море' : 'горах'}! Выбери, чем заняться:`;
  vacScene.appendChild(desc);

  // Activities
  const activities = document.createElement('div');
  activities.className = 'vacation-activities';

  dest.activities.forEach(activity => {
    const isUsed = usedActivities.has(activity.name);

    const actBtn = createEmojiButton(
      activity.emoji,
      activity.name,
      () => {
        doActivity(activity, activities, vacScene);
      },
      isUsed ? 'btn-disabled' : 'btn-secondary'
    );
    actBtn.style.width = '100%';
    actBtn.dataset.activityName = activity.name;

    if (isUsed) {
      actBtn.disabled = true;
    }

    activities.appendChild(actBtn);
  });

  vacScene.appendChild(activities);

  // Info about boosts
  const infoText = document.createElement('div');
  infoText.style.fontSize = '13px';
  infoText.style.color = 'var(--color-text-light)';
  infoText.style.marginTop = '16px';
  infoText.textContent = 'Каждое занятие повышает счастье и тратит немного энергии';
  vacScene.appendChild(infoText);

  // Go home button
  const homeBtn = createEmojiButton('🏠', 'Вернуться домой', () => {
    goHome(dest);
  }, 'btn-primary btn-lg');
  homeBtn.style.width = '100%';
  homeBtn.style.marginTop = '24px';
  vacScene.appendChild(homeBtn);

  screen.appendChild(vacScene);
}

function doActivity(activity, activitiesContainer, vacScene) {
  if (usedActivities.has(activity.name)) return;

  if (gameState.stats.energy < activity.energyCost && activity.energyCost > 0) {
    showToast('Нет сил! Отдохни или поезжай домой.', 'warning');
    return;
  }

  // Apply effects
  changeStat('happiness', activity.happinessBoost);
  if (activity.energyCost > 0) {
    changeStat('energy', -activity.energyCost);
  }
  advanceHours(2);
  updateHUD();

  // Mark as used
  usedActivities.add(activity.name);

  // Disable the button
  const btns = activitiesContainer.querySelectorAll('button');
  btns.forEach(btn => {
    if (btn.dataset.activityName === activity.name) {
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-disabled');
      btn.disabled = true;
    }
  });

  // Fun messages per activity
  const funMessages = {
    'Купаться': ['Буль-буль! Водичка тёплая! 🏊', 'Плюх! Как здорово! 💦', 'Ныряем! 🤿'],
    'Собирать ракушки': ['Какая красивая ракушка! 🐚✨', 'Целая коллекция! 🐚🐚', 'Нашёл ракушку-звёздочку! ⭐'],
    'Загорать': ['Солнышко греет! ☀️', 'Загар ложится отлично! 😎', 'Так тепло и хорошо! 🌞'],
    'Строить замок из песка': ['Какой замок! 🏰✨', 'Самый красивый замок на пляже! 🏖️', 'Башню добавим! 🏗️'],
    'Поход': ['Вид сверху потрясающий! ⛰️', 'Дошли до вершины! 🥾🎉', 'Свежий горный воздух! 🌬️'],
    'Развести костёр': ['Огонь трещит, тепло! 🔥', 'Жарим маршмеллоу! 😋🔥', 'Уютно у костра! 🏕️'],
    'Фотографировать': ['Какой кадр! 📸✨', 'Это фото — шедевр! 🖼️', 'Красота! 📸🏔️'],
    'Наблюдать звёзды': ['Сколько звёзд! ⭐✨', 'Видно Млечный Путь! 🌌', 'Падающая звезда! Загадай желание! 🌠']
  };

  const messages = funMessages[activity.name] || [`${activity.emoji} Здорово!`];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  showToast(msg, 'success');

  // Check if all activities done
  if (usedActivities.size === currentDestination.activities.length) {
    const t = setTimeout(() => {
      showToast('Ты попробовал всё! Пора домой? 🏠', 'info');
    }, 1500);
    timers.push(t);
  }
}

function goHome(dest) {
  // Advance time for the whole trip
  advanceHours(dest.duration * 24);
  addVisitedDestination(dest.id);
  updateHUD();

  currentView = 'agency';
  currentDestination = null;
  usedActivities = new Set();

  showToast(`Вернулись из ${dest.name}! Отличный отпуск! 🎉`, 'success');
  navigate('home-map');
}

// ─── Cleanup ───────────────────────────────────────────────────
export function cleanup() {
  timers.forEach(t => clearTimeout(t));
  timers = [];
  currentView = 'agency';
  currentDestination = null;
  usedActivities = new Set();
}
