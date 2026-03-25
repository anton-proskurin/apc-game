// pets.js — Pet shop and pet care scene. Guinea pig is the star!

import { gameState, spendMoney, canAfford, changeStat, addPet, updatePet, emit } from '../state.js';
import { navigate } from '../router.js';
import {
  createButton, createBackButton, createSectionTitle, createSubtitle,
  showModal, closeModal, showToast, showHUD, showNav, updateHUD,
  createProgressBar, updateProgressBar
} from '../ui.js';
import { advanceHours } from '../time.js';
import { PETS } from '../data.js';
import { save } from '../storage.js';

// ─── Module-level state ────────────────────────────────────────────
let containerRef = null;

// ─── Helpers ───────────────────────────────────────────────────────

/** Pick a random element from an array */
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Clamp a value between min and max */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/** Get the PETS data entry for a given pet type */
function getPetData(type) {
  return PETS.find(p => p.type === type) || null;
}

/** Check if the player already owns a pet of a given type */
function ownsPetType(type) {
  return gameState.inventory.pets.some(p => p.type === type);
}

// ─── Rendering helpers ─────────────────────────────────────────────

/**
 * Build a single stat bar row for a pet stat.
 * Returns { row: HTMLElement, bar: HTMLElement (progress-wrap) }
 * so we can update the bar later without re-rendering.
 */
function createPetStatBar(label, value, max, colorClass) {
  const row = document.createElement('div');
  row.className = 'pet-stat-row';

  const labelSpan = document.createElement('span');
  labelSpan.textContent = label;
  row.appendChild(labelSpan);

  const bar = createProgressBar('', value, max, colorClass);
  // Remove the label line from the progress bar (we use our own)
  const progressLabel = bar.querySelector('.progress-label');
  if (progressLabel) progressLabel.remove();

  row.appendChild(bar);
  return { row, bar };
}

/**
 * Render the stats block for one pet.
 * Returns { container, bars: { hunger, happiness, cleanliness } }
 */
function createPetStatsBlock(pet) {
  const container = document.createElement('div');
  container.className = 'pet-stats';

  const hungerBar = createPetStatBar('🍎', pet.hunger, 100, 'progress-hunger');
  const happinessBar = createPetStatBar('😊', pet.happiness, 100, 'progress-happiness');
  const cleanBar = createPetStatBar('🛁', pet.cleanliness, 100, 'progress-green');

  container.appendChild(hungerBar.row);
  container.appendChild(happinessBar.row);
  container.appendChild(cleanBar.row);

  return {
    container,
    bars: {
      hunger: hungerBar.bar,
      happiness: happinessBar.bar,
      cleanliness: cleanBar.bar
    }
  };
}

/**
 * Refresh the three stat bars for a pet card without re-rendering the whole scene.
 */
function refreshPetBars(bars, pet) {
  updateProgressBar(bars.hunger, pet.hunger, 100);
  updateProgressBar(bars.happiness, pet.happiness, 100);
  updateProgressBar(bars.cleanliness, pet.cleanliness, 100);
}

// ─── Owned pet card ────────────────────────────────────────────────

function createOwnedPetCard(pet) {
  const petData = getPetData(pet.type);
  const isGuineaPig = pet.type === 'guinea_pig';

  const card = document.createElement('div');
  card.className = 'pet-card';
  if (isGuineaPig) {
    card.style.border = '2px solid #FFD700';
    card.style.background = 'linear-gradient(135deg, #FFFDE7 0%, #FFFFFF 100%)';
  }

  // ── Left: big emoji ──
  const icon = document.createElement('div');
  icon.className = 'pet-card-icon';
  icon.textContent = pet.emoji;
  card.appendChild(icon);

  // ── Right: info + stats + actions ──
  const info = document.createElement('div');
  info.className = 'pet-card-info';

  const nameEl = document.createElement('h3');
  nameEl.textContent = pet.name;
  info.appendChild(nameEl);

  const typeEl = document.createElement('p');
  typeEl.style.fontSize = '13px';
  typeEl.style.color = '#999';
  typeEl.textContent = petData ? petData.name : pet.type;
  info.appendChild(typeEl);

  // Stats
  const { container: statsBlock, bars } = createPetStatsBlock(pet);
  info.appendChild(statsBlock);

  // Care actions
  const actions = document.createElement('div');
  actions.className = 'pet-care-actions';

  // 🍎 Feed
  const feedBtn = createButton('🍎 Покормить', () => {
    if (!canAfford(10)) {
      showToast('Не хватает APC! Нужно 10 💰', 'warning');
      return;
    }
    spendMoney(10);
    pet.hunger = clamp(pet.hunger + 30, 0, 100);
    updatePet(pet.id, { hunger: pet.hunger });

    const sound = petData ? randomFrom(petData.sounds) : '😋';
    showToast(`${pet.name} покушал! ${sound}`, 'success');

    refreshPetBars(bars, pet);
    updateHUD();
  }, 'btn-primary');
  feedBtn.style.fontSize = '12px';
  feedBtn.style.padding = '8px 10px';
  feedBtn.style.minHeight = '36px';
  actions.appendChild(feedBtn);

  // 🎾 Play
  const playBtn = createButton('🎾 Поиграть', () => {
    pet.happiness = clamp(pet.happiness + 25, 0, 100);
    updatePet(pet.id, { happiness: pet.happiness });
    changeStat('happiness', 5);

    let msg;
    if (isGuineaPig && Math.random() < 0.3) {
      msg = 'Пушок пищит от счастья! Уи-уи-уи! 🐹💕';
    } else {
      const sound = petData ? randomFrom(petData.sounds) : '🎉';
      msg = `${pet.name} играет! ${sound}`;
    }
    showToast(msg, 'success');

    refreshPetBars(bars, pet);
    updateHUD();
  }, 'btn-secondary');
  playBtn.style.fontSize = '12px';
  playBtn.style.padding = '8px 10px';
  playBtn.style.minHeight = '36px';
  actions.appendChild(playBtn);

  // 🛁 Wash
  const washBtn = createButton('🛁 Помыть', () => {
    pet.cleanliness = clamp(pet.cleanliness + 35, 0, 100);
    updatePet(pet.id, { cleanliness: pet.cleanliness });

    const funMessages = [
      `${pet.name} теперь чистюля! ✨`,
      `${pet.name} блестит как новенький! 🌟`,
      `Буль-буль! ${pet.name} любит купаться! 🫧`,
      `${pet.name} теперь пахнет цветочками! 🌸`,
      `Плюх! ${pet.emoji} Водичка тёплая!`
    ];
    showToast(randomFrom(funMessages), 'success');

    refreshPetBars(bars, pet);
    updateHUD();
  }, 'btn-outline');
  washBtn.style.fontSize = '12px';
  washBtn.style.padding = '8px 10px';
  washBtn.style.minHeight = '36px';
  actions.appendChild(washBtn);

  info.appendChild(actions);
  card.appendChild(info);

  return card;
}

// ─── Shop pet card ─────────────────────────────────────────────────

function createShopPetCard(petData) {
  const isGuineaPig = petData.type === 'guinea_pig';

  const card = document.createElement('div');
  card.className = 'pet-card';
  card.style.cursor = 'default';

  if (isGuineaPig) {
    card.style.border = '2px solid #FFD700';
    card.style.background = 'linear-gradient(135deg, #FFFDE7 0%, #FFFFFF 100%)';
  }

  // ── Left: emoji ──
  const icon = document.createElement('div');
  icon.className = 'pet-card-icon';
  icon.textContent = petData.emoji;
  card.appendChild(icon);

  // ── Right: info ──
  const info = document.createElement('div');
  info.className = 'pet-card-info';

  const nameEl = document.createElement('h3');
  nameEl.textContent = petData.name;
  if (isGuineaPig) {
    nameEl.textContent += ' ⭐';
  }
  info.appendChild(nameEl);

  const descEl = document.createElement('p');
  descEl.style.fontSize = '13px';
  descEl.style.color = '#666';
  descEl.textContent = petData.desc;
  info.appendChild(descEl);

  const priceEl = document.createElement('div');
  priceEl.className = 'text-money';
  priceEl.style.margin = '6px 0';
  priceEl.textContent = `💰 ${petData.price} APC`;
  info.appendChild(priceEl);

  // Buy button
  const buyBtn = createButton('🛒 Купить', () => {
    handleBuyPet(petData);
  }, canAfford(petData.price) ? 'btn-primary' : 'btn-disabled');
  buyBtn.style.fontSize = '13px';
  buyBtn.style.padding = '8px 16px';
  buyBtn.style.minHeight = '36px';
  info.appendChild(buyBtn);

  card.appendChild(info);
  return card;
}

// ─── Buy flow ──────────────────────────────────────────────────────

function handleBuyPet(petData) {
  if (!canAfford(petData.price)) {
    showToast('Не хватает денег! 💸', 'warning');
    return;
  }

  // Show modal with name input
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');

  const modal = document.createElement('div');
  modal.className = 'modal';

  const title = document.createElement('div');
  title.className = 'modal-title';
  title.textContent = `${petData.emoji} Как назовёшь?`;
  modal.appendChild(title);

  const subtitle = document.createElement('div');
  subtitle.className = 'modal-text';
  subtitle.textContent = `Ты покупаешь: ${petData.name}`;
  modal.appendChild(subtitle);

  // Name input
  const nameInput = document.createElement('input');
  nameInput.className = 'name-input';
  nameInput.type = 'text';
  nameInput.placeholder = 'Имя питомца';
  nameInput.maxLength = 20;
  nameInput.autocomplete = 'off';
  nameInput.value = petData.defaultName;
  nameInput.style.marginBottom = '16px';
  modal.appendChild(nameInput);

  // Buttons
  const actions = document.createElement('div');
  actions.className = 'modal-actions';

  const cancelBtn = createButton('Отмена', () => {
    closeModal();
  }, 'btn-outline');
  actions.appendChild(cancelBtn);

  const confirmBtn = createButton('Купить! 🎉', () => {
    const chosenName = nameInput.value.trim() || petData.defaultName;

    // Create pet object
    const newPet = {
      id: petData.type + '_' + Date.now(),
      type: petData.type,
      name: chosenName,
      emoji: petData.emoji,
      hunger: 100,
      happiness: 100,
      cleanliness: 100
    };

    addPet(newPet);
    spendMoney(petData.price);
    save();
    closeModal();

    showToast(`У тебя теперь есть ${chosenName}! ${petData.emoji}`, 'success');
    updateHUD();

    // Re-render the entire scene to reflect the new pet
    renderScene();
  }, 'btn-primary');
  actions.appendChild(confirmBtn);

  modal.appendChild(actions);

  overlay.innerHTML = '';
  overlay.appendChild(modal);

  // Focus input
  setTimeout(() => nameInput.focus(), 100);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  }, { once: true });
}

// ─── Main scene render ─────────────────────────────────────────────

function renderScene() {
  if (!containerRef) return;
  containerRef.innerHTML = '';

  const screen = document.createElement('div');
  screen.className = 'fade-in';

  // Back button
  screen.appendChild(createBackButton('home-map'));

  // Title
  screen.appendChild(createSectionTitle('Питомцы 🐹'));

  // ════════════════════════════════════════════════════════
  // Section 1: Owned pets
  // ════════════════════════════════════════════════════════
  const ownedPets = gameState.inventory.pets;

  if (ownedPets.length > 0) {
    const ownedTitle = document.createElement('h3');
    ownedTitle.style.fontSize = '18px';
    ownedTitle.style.fontWeight = '700';
    ownedTitle.style.marginBottom = '12px';
    ownedTitle.textContent = 'Мои питомцы 🏠';
    screen.appendChild(ownedTitle);

    ownedPets.forEach(pet => {
      const card = createOwnedPetCard(pet);
      screen.appendChild(card);
    });
  } else {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'text-center mb-lg';
    emptyMsg.style.color = '#999';
    emptyMsg.style.padding = '20px 0';
    emptyMsg.innerHTML = 'У тебя пока нет питомцев.<br>Загляни в зоомагазин! 🐾';
    screen.appendChild(emptyMsg);
  }

  // ════════════════════════════════════════════════════════
  // Section 2: Pet shop
  // ════════════════════════════════════════════════════════
  const shopTitle = document.createElement('h3');
  shopTitle.style.fontSize = '18px';
  shopTitle.style.fontWeight = '700';
  shopTitle.style.marginBottom = '12px';
  shopTitle.style.marginTop = '24px';
  shopTitle.textContent = 'Зоомагазин 🏪';
  screen.appendChild(shopTitle);

  // Filter out pets the player already owns (by type)
  const availablePets = PETS.filter(p => !ownsPetType(p.type));

  // Guinea pig always comes first if available
  availablePets.sort((a, b) => {
    if (a.type === 'guinea_pig') return -1;
    if (b.type === 'guinea_pig') return 1;
    return 0;
  });

  if (availablePets.length > 0) {
    availablePets.forEach(petData => {
      screen.appendChild(createShopPetCard(petData));
    });
  } else {
    const allOwned = document.createElement('div');
    allOwned.className = 'text-center mb-lg';
    allOwned.style.color = '#999';
    allOwned.style.padding = '20px 0';
    allOwned.textContent = 'Ты уже купил всех питомцев! 🎉🐾';
    screen.appendChild(allOwned);
  }

  containerRef.appendChild(screen);
}

// ─── Public API ────────────────────────────────────────────────────

export function render(container, params) {
  containerRef = container;
  showHUD();
  showNav();
  renderScene();
}

export function cleanup() {
  containerRef = null;
}
