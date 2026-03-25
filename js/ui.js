// ui.js — Reusable UI components

import { gameState } from './state.js';
import { navigate } from './router.js';

// --- Button ---
export function createButton(text, onClick, className = 'btn-primary') {
  const btn = document.createElement('button');
  btn.className = `btn ${className}`;
  btn.textContent = text;
  btn.addEventListener('click', onClick);
  return btn;
}

export function createEmojiButton(emoji, text, onClick, className = 'btn-primary') {
  const btn = document.createElement('button');
  btn.className = `btn ${className}`;
  btn.innerHTML = `<span class="btn-emoji">${emoji}</span> ${text}`;
  btn.addEventListener('click', onClick);
  return btn;
}

// --- Card ---
export function createCard(icon, title, desc, onClick) {
  const card = document.createElement('div');
  card.className = 'card card-clickable';
  card.innerHTML = `
    <div class="card-icon">${icon}</div>
    <div class="card-title">${title}</div>
    ${desc ? `<div class="card-desc">${desc}</div>` : ''}
  `;
  if (onClick) card.addEventListener('click', onClick);
  return card;
}

export function createMapCard(icon, label, onClick) {
  const card = document.createElement('button');
  card.className = 'map-card';
  card.innerHTML = `
    <div class="map-card-icon">${icon}</div>
    <div class="map-card-label">${label}</div>
  `;
  card.addEventListener('click', onClick);
  return card;
}

// --- Progress Bar ---
export function createProgressBar(label, value, max, colorClass = 'progress-green') {
  const wrap = document.createElement('div');
  wrap.className = 'progress-wrap';
  const pct = Math.round((value / max) * 100);
  wrap.innerHTML = `
    <div class="progress-label">
      <span>${label}</span>
      <span>${value}/${max}</span>
    </div>
    <div class="progress ${colorClass}">
      <div class="progress-fill" style="width: ${pct}%"></div>
    </div>
  `;
  return wrap;
}

export function updateProgressBar(wrap, value, max) {
  const pct = Math.round((value / max) * 100);
  const fill = wrap.querySelector('.progress-fill');
  const labelRight = wrap.querySelectorAll('.progress-label span')[1];
  if (fill) fill.style.width = `${pct}%`;
  if (labelRight) labelRight.textContent = `${value}/${max}`;
}

// --- Modal ---
export function showModal(title, text, buttons = []) {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');

  const modal = document.createElement('div');
  modal.className = 'modal';

  modal.innerHTML = `
    <div class="modal-title">${title}</div>
    ${text ? `<div class="modal-text">${text}</div>` : ''}
  `;

  if (buttons.length > 0) {
    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    buttons.forEach(({ label, onClick, className = 'btn-primary' }) => {
      const btn = createButton(label, () => {
        closeModal();
        if (onClick) onClick();
      }, className);
      actions.appendChild(btn);
    });
    modal.appendChild(actions);
  }

  overlay.innerHTML = '';
  overlay.appendChild(modal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  }, { once: true });

  return modal;
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
}

// --- Toast ---
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// --- HUD ---
export function updateHUD() {
  const hud = document.getElementById('game-hud');
  const s = gameState.stats;
  const t = gameState.time;
  const animal = gameState.character.currentAnimal;

  const avatar = animal ? animal.emoji : gameState.character.avatar;

  hud.innerHTML = `
    <div class="hud-left">
      <span style="font-size:24px">${avatar}</span>
      <div class="hud-stat hud-money">💰 ${s.money}</div>
    </div>
    <div class="hud-right">
      <div class="hud-stat">⚡${s.energy}</div>
      <div class="hud-stat">😊${s.happiness}</div>
      <div class="hud-stat">🍔${s.hunger}</div>
      <div class="hud-time">День ${t.day}, ${String(t.hour).padStart(2, '0')}:00</div>
    </div>
  `;
}

export function showHUD() {
  document.getElementById('game-hud').classList.remove('hidden');
  updateHUD();
}

export function hideHUD() {
  document.getElementById('game-hud').classList.add('hidden');
}

// --- Nav ---
export function showNav() {
  const nav = document.getElementById('game-nav');
  nav.classList.remove('hidden');
  nav.innerHTML = '';

  const items = [
    { icon: '🗺️', label: 'Карта', scene: 'home-map' },
    { icon: '💼', label: 'Работа', scene: 'work' },
    { icon: '🏠', label: 'Дом', scene: 'house' },
    { icon: '🐹', label: 'Питомцы', scene: 'pets' },
    { icon: '👥', label: 'Друзья', scene: 'friends' }
  ];

  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.innerHTML = `<span class="nav-item-icon">${item.icon}</span>${item.label}`;
    btn.addEventListener('click', () => navigate(item.scene));
    nav.appendChild(btn);
  });
}

export function hideNav() {
  document.getElementById('game-nav').classList.add('hidden');
}

// --- Back button ---
export function createBackButton(targetScene = 'home-map') {
  const btn = document.createElement('button');
  btn.className = 'back-btn';
  btn.textContent = '← Назад';
  btn.addEventListener('click', () => navigate(targetScene));
  return btn;
}

// --- Section title ---
export function createSectionTitle(text) {
  const h = document.createElement('h2');
  h.className = 'page-title';
  h.textContent = text;
  return h;
}

export function createSubtitle(text) {
  const p = document.createElement('p');
  p.className = 'page-subtitle';
  p.textContent = text;
  return p;
}

// --- Stat bars group ---
export function createStatBars() {
  const wrap = document.createElement('div');
  wrap.className = 'flex-col';
  const s = gameState.stats;
  wrap.appendChild(createProgressBar('⚡ Энергия', s.energy, 100, 'progress-energy'));
  wrap.appendChild(createProgressBar('😊 Счастье', s.happiness, 100, 'progress-happiness'));
  wrap.appendChild(createProgressBar('🍔 Сытость', s.hunger, 100, 'progress-hunger'));
  return wrap;
}
