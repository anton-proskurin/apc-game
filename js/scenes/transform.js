// transform.js — Animal transformation scene

import { gameState, spendMoney, canAfford, setAnimalForm } from '../state.js';
import { navigate } from '../router.js';
import {
  createBackButton, createSectionTitle, createSubtitle,
  createButton, createEmojiButton, showToast, showHUD, showNav, updateHUD
} from '../ui.js';
import { ANIMALS } from '../data.js';

let timers = [];

// ─── Main render ───────────────────────────────────────────────
export function render(container) {
  showHUD();
  showNav();

  const screen = document.createElement('div');
  screen.className = 'transform-screen fade-in';

  screen.appendChild(createBackButton('home-map'));

  if (gameState.character.currentAnimal) {
    renderTransformed(screen);
  } else {
    renderAnimalSelect(screen);
  }

  container.appendChild(screen);
}

// ─── Animal Selection ──────────────────────────────────────────
function renderAnimalSelect(screen) {
  screen.appendChild(createSectionTitle('Превращение 🦋'));
  screen.appendChild(createSubtitle('Стань любым животным! Стоимость: 100 APC'));

  // Sparkle decoration
  const sparkles = document.createElement('div');
  sparkles.style.textAlign = 'center';
  sparkles.style.fontSize = '32px';
  sparkles.style.marginBottom = '16px';
  sparkles.textContent = '✨🪄✨';
  screen.appendChild(sparkles);

  // Animal grid
  const grid = document.createElement('div');
  grid.className = 'animal-grid';

  ANIMALS.forEach(animal => {
    const card = document.createElement('div');
    card.className = 'animal-card';

    // Special highlight for guinea pig (easter egg)
    if (animal.id === 'guinea_pig') {
      card.style.border = '2px solid #FFD700';
      card.style.background = 'linear-gradient(135deg, #FFFDE7 0%, #FFFFFF 100%)';
    }

    const icon = document.createElement('div');
    icon.className = 'animal-card-icon';
    icon.textContent = animal.emoji;
    card.appendChild(icon);

    const name = document.createElement('div');
    name.className = 'animal-card-name';
    name.textContent = animal.name;
    card.appendChild(name);

    // Brief description
    const desc = document.createElement('div');
    desc.style.fontSize = '11px';
    desc.style.color = 'var(--color-text-light)';
    desc.style.marginTop = '4px';
    desc.textContent = animal.desc;
    card.appendChild(desc);

    card.addEventListener('click', () => {
      transformInto(animal, card);
    });

    grid.appendChild(card);
  });

  screen.appendChild(grid);

  // Info text
  const info = document.createElement('div');
  info.style.textAlign = 'center';
  info.style.fontSize = '13px';
  info.style.color = 'var(--color-text-light)';
  info.style.marginTop = '20px';
  info.textContent = 'Превращение длится, пока не захочешь вернуться обратно';
  screen.appendChild(info);
}

function transformInto(animal, cardEl) {
  if (!canAfford(100)) {
    showToast('Не хватает APC! Нужно 100 💰', 'error');
    return;
  }

  spendMoney(100);
  setAnimalForm({ id: animal.id, emoji: animal.emoji, name: animal.name, ability: animal.ability });
  updateHUD();

  // Sparkle animation on the card
  cardEl.style.animation = 'bounceIn 0.6s ease';

  // Special message for guinea pig
  let msg;
  if (animal.id === 'guinea_pig') {
    msg = 'Уи-уи-уи! Ты теперь морская свинка! 🐹💕';
  } else {
    msg = `Ты превратился в: ${animal.name}! ${animal.emoji}`;
  }

  showToast(msg, 'success');

  const t = setTimeout(() => {
    navigate('transform');
  }, 800);
  timers.push(t);
}

// ─── Transformed State ─────────────────────────────────────────
function renderTransformed(screen) {
  const animal = gameState.character.currentAnimal;

  screen.appendChild(createSectionTitle('Превращение 🦋'));

  // Big animal icon
  const icon = document.createElement('div');
  icon.className = 'transform-active-icon bounce-in';
  icon.textContent = animal.emoji;
  screen.appendChild(icon);

  // Name
  const text = document.createElement('div');
  text.className = 'transform-active-text';
  text.textContent = `Ты сейчас: ${animal.name}!`;
  screen.appendChild(text);

  // Ability
  const ability = document.createElement('div');
  ability.style.fontSize = '16px';
  ability.style.color = 'var(--color-primary)';
  ability.style.textAlign = 'center';
  ability.style.marginBottom = '24px';
  ability.style.fontWeight = '600';
  ability.textContent = `🌟 ${animal.ability || 'Особая способность!'}`;
  screen.appendChild(ability);

  // Fun fact based on animal
  const funFacts = {
    cat: 'Мяу! Ты можешь видеть в темноте и лазать по деревьям! 🌙',
    dog: 'Гав! Ты чуешь запахи за километр и бегаешь быстрее всех! 🏃',
    bird: 'Чирик! Весь город как на ладони! Лети куда хочешь! 🌤️',
    fish: 'Буль-буль! Под водой целый мир — кораллы, рыбки, сокровища! 🐠',
    rabbit: 'Прыг-скок! Ты прыгаешь выше домов! 🌈',
    guinea_pig: 'Уи-уи! Все хотят тебя погладить! Ты самый милый! 💕'
  };

  const fact = document.createElement('div');
  fact.className = 'card';
  fact.style.textAlign = 'center';
  fact.style.marginBottom = '24px';
  fact.innerHTML = `<div style="font-size: 14px; line-height: 1.6;">${funFacts[animal.id] || 'Исследуй мир в новом обличии!'}</div>`;
  screen.appendChild(fact);

  // Revert button
  const revertBtn = createEmojiButton('🧑', 'Вернуться в человека', () => {
    setAnimalForm(null);
    updateHUD();
    showToast('Ты снова человек! 🧑✨', 'success');
    navigate('home-map');
  }, 'btn-accent btn-lg');
  revertBtn.style.width = '100%';
  revertBtn.style.marginBottom = '12px';
  screen.appendChild(revertBtn);

  // Back to map
  const mapBtn = createButton('🗺️ На карту', () => {
    navigate('home-map');
  }, 'btn-outline');
  mapBtn.style.width = '100%';
  screen.appendChild(mapBtn);
}

// ─── Cleanup ───────────────────────────────────────────────────
export function cleanup() {
  timers.forEach(t => clearTimeout(t));
  timers = [];
}
