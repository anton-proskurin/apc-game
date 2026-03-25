// intro.js — Papa's greeting scene for Mark

import { gameState } from '../state.js';
import { navigate } from '../router.js';
import { createButton, hideHUD, hideNav } from '../ui.js';
import { hasSave, load, clearSave } from '../storage.js';
import { save } from '../storage.js';

let timers = [];

export function render(container) {
  hideHUD();
  hideNav();

  const screen = document.createElement('div');
  screen.className = 'intro-screen fade-in';

  // Big greeting emoji
  const emoji = document.createElement('div');
  emoji.className = 'intro-emoji bounce-in';
  emoji.textContent = '🎮';
  screen.appendChild(emoji);

  // Title
  const title = document.createElement('div');
  title.className = 'intro-title fade-in';
  title.textContent = 'APC';
  screen.appendChild(title);

  // Main message for Mark
  const message = document.createElement('div');
  message.className = 'intro-message fade-in';
  message.innerHTML = 'Привет, Марк! Это игра <strong>APC</strong> — специально для тебя от папы! 💚';
  screen.appendChild(message);

  // Description of the game
  const submessage = document.createElement('div');
  submessage.className = 'intro-submessage fade-in';
  submessage.innerHTML = [
    'Здесь ты сможешь:',
    '💼 Выбрать профессию и зарабатывать деньги',
    '🐹 Завести питомцев и ухаживать за ними',
    '🏠 Купить дом и машину',
    '✈️ Путешествовать по миру',
    '👥 Находить друзей и создавать семью',
    '🦋 Превращаться в разных животных!'
  ].join('<br>');
  screen.appendChild(submessage);

  // Signature from Papa
  const papa = document.createElement('div');
  papa.className = 'intro-papa fade-in';
  papa.textContent = 'С любовью, Папа 🤗';
  screen.appendChild(papa);

  // Button container (hidden initially, shown after 2 seconds)
  const btnContainer = document.createElement('div');
  btnContainer.className = 'flex-col hidden';
  btnContainer.style.width = '100%';
  btnContainer.style.maxWidth = '280px';

  // "Start game" button
  const startBtn = createButton('🎮 Начать игру!', () => {
    clearSave();
    gameState.flags.introSeen = true;
    gameState.meta.createdAt = new Date().toISOString();
    save();
    navigate('character-create');
  }, 'btn-primary btn-lg btn-block');
  btnContainer.appendChild(startBtn);

  // "Continue" button (only if save exists)
  if (hasSave()) {
    const gap = document.createElement('div');
    gap.style.height = '12px';
    btnContainer.appendChild(gap);

    const continueBtn = createButton('▶️ Продолжить', () => {
      load();
      gameState.flags.introSeen = true;
      navigate('home-map');
    }, 'btn-secondary btn-lg btn-block');
    btnContainer.appendChild(continueBtn);
  }

  screen.appendChild(btnContainer);
  container.appendChild(screen);

  // Show buttons after 2 seconds with animation
  const showTimer = setTimeout(() => {
    btnContainer.classList.remove('hidden');
    btnContainer.classList.add('fade-in-up');
  }, 2000);
  timers.push(showTimer);
}

export function cleanup() {
  timers.forEach(t => clearTimeout(t));
  timers = [];
}
