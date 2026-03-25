// house.js — House / home scene

import { gameState } from '../state.js';
import { navigate } from '../router.js';
import {
  createBackButton, createSectionTitle, createButton,
  createProgressBar, showHUD, showNav, updateHUD
} from '../ui.js';

export function render(container) {
  showHUD();
  showNav();
  updateHUD();

  const screen = document.createElement('div');
  screen.className = 'house-screen fade-in';

  // Back button
  screen.appendChild(createBackButton('home-map'));

  // Title
  screen.appendChild(createSectionTitle('🏠 Мой дом'));

  const house = gameState.inventory.house;

  if (!house) {
    // --- No house state ---
    renderNoHouse(screen);
  } else {
    // --- House exists ---
    renderHouse(screen, house);
  }

  container.appendChild(screen);
}

function renderNoHouse(screen) {
  // Empty state - no house purchased
  const emptyWrap = document.createElement('div');
  emptyWrap.style.textAlign = 'center';
  emptyWrap.style.padding = '40px 20px';

  const emptyEmoji = document.createElement('div');
  emptyEmoji.style.fontSize = '80px';
  emptyEmoji.style.marginBottom = '16px';
  emptyEmoji.textContent = '🏗️';
  emptyWrap.appendChild(emptyEmoji);

  const emptyText = document.createElement('div');
  emptyText.style.fontSize = '18px';
  emptyText.style.fontWeight = '600';
  emptyText.style.marginBottom = '8px';
  emptyText.textContent = 'У тебя пока нет дома';
  emptyWrap.appendChild(emptyText);

  const emptyDesc = document.createElement('div');
  emptyDesc.style.fontSize = '14px';
  emptyDesc.style.color = '#666';
  emptyDesc.style.marginBottom = '24px';
  emptyDesc.textContent = 'Купи его в магазине и обустрой по своему вкусу!';
  emptyWrap.appendChild(emptyDesc);

  const shopBtn = createButton('🛒 Перейти в магазин', () => {
    navigate('shop');
  }, 'btn-primary btn-lg');
  emptyWrap.appendChild(shopBtn);

  screen.appendChild(emptyWrap);
}

function renderHouse(screen, house) {
  // --- House icon and name ---
  const houseIcon = document.createElement('div');
  houseIcon.className = 'house-icon bounce-in';
  houseIcon.textContent = house.emoji || '🏠';
  screen.appendChild(houseIcon);

  const houseName = document.createElement('div');
  houseName.className = 'house-name';
  houseName.textContent = house.name || 'Мой дом';
  screen.appendChild(houseName);

  // --- Rooms grid ---
  if (house.rooms && house.rooms.length > 0) {
    const roomsTitle = document.createElement('div');
    roomsTitle.className = 'house-section-title';
    roomsTitle.textContent = '🚪 Комнаты';
    screen.appendChild(roomsTitle);

    const roomsGrid = document.createElement('div');
    roomsGrid.className = 'house-rooms';

    house.rooms.forEach(room => {
      const roomEl = document.createElement('div');
      roomEl.className = 'house-room';

      // Parse room string like "🛏️ Спальня" into emoji + name
      const parts = parseRoomString(room);

      const roomIcon = document.createElement('div');
      roomIcon.className = 'house-room-icon';
      roomIcon.textContent = parts.emoji;
      roomEl.appendChild(roomIcon);

      const roomName = document.createElement('div');
      roomName.className = 'house-room-name';
      roomName.textContent = parts.name;
      roomEl.appendChild(roomName);

      roomsGrid.appendChild(roomEl);
    });

    screen.appendChild(roomsGrid);
  }

  // --- Pets section ---
  const pets = gameState.inventory.pets;
  if (pets.length > 0) {
    const petsSection = document.createElement('div');
    petsSection.className = 'house-pets';

    const petsTitle = document.createElement('div');
    petsTitle.className = 'house-section-title';
    petsTitle.textContent = '🐾 Мои питомцы';
    petsSection.appendChild(petsTitle);

    pets.forEach(pet => {
      const petRow = document.createElement('div');
      petRow.style.display = 'flex';
      petRow.style.alignItems = 'center';
      petRow.style.gap = '12px';
      petRow.style.padding = '10px';
      petRow.style.background = 'white';
      petRow.style.borderRadius = '10px';
      petRow.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
      petRow.style.marginBottom = '8px';
      petRow.style.cursor = 'pointer';

      petRow.addEventListener('click', () => {
        navigate('pets');
      });

      const petEmoji = document.createElement('span');
      petEmoji.style.fontSize = '36px';
      petEmoji.textContent = pet.emoji;
      petRow.appendChild(petEmoji);

      const petInfo = document.createElement('div');
      petInfo.style.flex = '1';

      const petName = document.createElement('div');
      petName.style.fontWeight = '700';
      petName.textContent = pet.name;
      petInfo.appendChild(petName);

      const petType = document.createElement('div');
      petType.style.fontSize = '12px';
      petType.style.color = '#666';
      petType.textContent = getPetMoodText(pet);
      petInfo.appendChild(petType);

      petRow.appendChild(petInfo);
      petsSection.appendChild(petRow);
    });

    screen.appendChild(petsSection);
  }

  // --- Family section ---
  const partner = gameState.social.partner;
  const children = gameState.social.children;

  if (partner || children.length > 0) {
    const familySection = document.createElement('div');
    familySection.className = 'house-family';

    const familyTitle = document.createElement('div');
    familyTitle.className = 'house-section-title';
    familyTitle.textContent = '👨‍👩‍👧‍👦 Моя семья';
    familySection.appendChild(familyTitle);

    // Partner
    if (partner) {
      const partnerRow = document.createElement('div');
      partnerRow.style.display = 'flex';
      partnerRow.style.alignItems = 'center';
      partnerRow.style.gap = '12px';
      partnerRow.style.padding = '10px';
      partnerRow.style.background = 'white';
      partnerRow.style.borderRadius = '10px';
      partnerRow.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
      partnerRow.style.marginBottom = '8px';

      const partnerEmoji = document.createElement('span');
      partnerEmoji.style.fontSize = '36px';
      partnerEmoji.textContent = partner.emoji || '💕';
      partnerRow.appendChild(partnerEmoji);

      const partnerInfo = document.createElement('div');

      const partnerName = document.createElement('div');
      partnerName.style.fontWeight = '700';
      partnerName.textContent = partner.name;
      partnerInfo.appendChild(partnerName);

      const partnerStage = document.createElement('div');
      partnerStage.style.fontSize = '12px';
      partnerStage.style.color = '#E91E63';
      const stageLabels = {
        dating: '💕 Встречаетесь',
        engaged: '💍 Помолвлены',
        married: '💒 В браке'
      };
      partnerStage.textContent = stageLabels[partner.stage] || '💕 Вместе';
      partnerInfo.appendChild(partnerStage);

      partnerRow.appendChild(partnerInfo);
      familySection.appendChild(partnerRow);
    }

    // Children
    children.forEach(child => {
      const childRow = document.createElement('div');
      childRow.style.display = 'flex';
      childRow.style.alignItems = 'center';
      childRow.style.gap = '12px';
      childRow.style.padding = '10px';
      childRow.style.background = 'white';
      childRow.style.borderRadius = '10px';
      childRow.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
      childRow.style.marginBottom = '8px';

      const childEmoji = document.createElement('span');
      childEmoji.style.fontSize = '36px';
      childEmoji.textContent = child.emoji || '👶';
      childRow.appendChild(childEmoji);

      const childInfo = document.createElement('div');

      const childName = document.createElement('div');
      childName.style.fontWeight = '700';
      childName.textContent = child.name;
      childInfo.appendChild(childName);

      const childAge = document.createElement('div');
      childAge.style.fontSize = '12px';
      childAge.style.color = '#666';
      childAge.textContent = `${child.age || 0} ${getAgeWord(child.age || 0)}`;
      childInfo.appendChild(childAge);

      childRow.appendChild(childInfo);
      familySection.appendChild(childRow);
    });

    screen.appendChild(familySection);
  }

  // --- Stat bars ---
  const statsSection = document.createElement('div');
  statsSection.className = 'flex-col';
  statsSection.style.marginTop = '16px';

  const s = gameState.stats;
  statsSection.appendChild(createProgressBar('⚡ Энергия', s.energy, 100, 'progress-energy'));
  statsSection.appendChild(createProgressBar('😊 Счастье', s.happiness, 100, 'progress-happiness'));
  statsSection.appendChild(createProgressBar('🍔 Сытость', s.hunger, 100, 'progress-hunger'));

  screen.appendChild(statsSection);
}

// --- Helper functions ---

function parseRoomString(roomStr) {
  // Room strings are like "🛏️ Спальня"
  // Split on first space after emoji
  const match = roomStr.match(/^(\S+)\s+(.+)$/);
  if (match) {
    return { emoji: match[1], name: match[2] };
  }
  return { emoji: '🏠', name: roomStr };
}

function getPetMoodText(pet) {
  const avg = Math.round(((pet.hunger || 0) + (pet.happiness || 0) + (pet.cleanliness || 0)) / 3);
  if (avg >= 80) return '😊 Счастлив!';
  if (avg >= 50) return '🙂 Нормально';
  if (avg >= 25) return '😐 Грустит...';
  return '😢 Нуждается в заботе!';
}

function getAgeWord(age) {
  if (age === 0) return 'лет';
  const lastDigit = age % 10;
  const lastTwoDigits = age % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'лет';
  if (lastDigit === 1) return 'год';
  if (lastDigit >= 2 && lastDigit <= 4) return 'года';
  return 'лет';
}

export function cleanup() {
  // No timers or intervals to clean up
}
