// character-create.js — Character creation scene

import { gameState, setCharacter } from '../state.js';
import { navigate } from '../router.js';
import { createButton, hideHUD, hideNav, showHUD, showNav, showToast } from '../ui.js';
import { save } from '../storage.js';
import { startTime } from '../time.js';
import { AVATARS } from '../data.js';

let state = {
  name: '',
  gender: 'boy',
  avatar: null
};

export function render(container) {
  hideHUD();
  hideNav();

  // Reset local state
  state = { name: '', gender: 'boy', avatar: AVATARS.boy[0] };

  const screen = document.createElement('div');
  screen.className = 'create-screen fade-in';

  // Title
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = '✨ Создай своего персонажа';
  screen.appendChild(title);

  // --- Avatar preview ---
  const previewSection = document.createElement('div');
  previewSection.className = 'create-section';
  const preview = document.createElement('div');
  preview.className = 'avatar-preview bounce-in';
  preview.id = 'avatar-preview';
  preview.textContent = state.avatar;
  previewSection.appendChild(preview);
  screen.appendChild(previewSection);

  // --- Name input ---
  const nameSection = document.createElement('div');
  nameSection.className = 'create-section';

  const nameLabel = document.createElement('div');
  nameLabel.className = 'create-section-title';
  nameLabel.textContent = '📝 Как тебя зовут?';
  nameSection.appendChild(nameLabel);

  const nameInput = document.createElement('input');
  nameInput.className = 'name-input';
  nameInput.type = 'text';
  nameInput.placeholder = 'Как тебя зовут?';
  nameInput.maxLength = 20;
  nameInput.autocomplete = 'off';
  nameInput.addEventListener('input', (e) => {
    state.name = e.target.value.trim();
  });
  nameSection.appendChild(nameInput);
  screen.appendChild(nameSection);

  // --- Gender selection ---
  const genderSection = document.createElement('div');
  genderSection.className = 'create-section';

  const genderLabel = document.createElement('div');
  genderLabel.className = 'create-section-title';
  genderLabel.textContent = '👫 Кто ты?';
  genderSection.appendChild(genderLabel);

  const genderGrid = document.createElement('div');
  genderGrid.className = 'option-grid';
  genderGrid.id = 'gender-grid';

  const genders = [
    { id: 'boy', emoji: '👦', label: 'Мальчик' },
    { id: 'girl', emoji: '👧', label: 'Девочка' }
  ];

  genders.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'option-btn' + (state.gender === g.id ? ' selected' : '');
    btn.dataset.gender = g.id;
    btn.style.width = '100px';
    btn.style.height = '64px';
    btn.style.flexDirection = 'column';
    btn.style.fontSize = '14px';
    btn.innerHTML = `<span style="font-size:28px">${g.emoji}</span><span style="font-size:12px;font-weight:600">${g.label}</span>`;
    btn.addEventListener('click', () => {
      state.gender = g.id;
      // Update avatar to first of new gender
      state.avatar = AVATARS[g.id][0];
      updatePreview();
      updateGenderButtons();
      renderAvatarGrid();
    });
    genderGrid.appendChild(btn);
  });

  genderSection.appendChild(genderGrid);
  screen.appendChild(genderSection);

  // --- Avatar selection ---
  const avatarSection = document.createElement('div');
  avatarSection.className = 'create-section';

  const avatarLabel = document.createElement('div');
  avatarLabel.className = 'create-section-title';
  avatarLabel.textContent = '🎭 Выбери внешность';
  avatarSection.appendChild(avatarLabel);

  const avatarGrid = document.createElement('div');
  avatarGrid.className = 'option-grid';
  avatarGrid.id = 'avatar-grid';
  avatarSection.appendChild(avatarGrid);
  screen.appendChild(avatarSection);

  // --- "Done" button ---
  const doneSection = document.createElement('div');
  doneSection.className = 'create-section';
  doneSection.style.marginTop = '12px';

  const doneBtn = createButton('🎉 Готово!', () => {
    if (!state.name) {
      showToast('Введи своё имя! ✏️', 'warning');
      nameInput.focus();
      nameInput.style.animation = 'shake 0.4s ease';
      setTimeout(() => { nameInput.style.animation = ''; }, 400);
      return;
    }

    // Save character data to gameState
    setCharacter({
      name: state.name,
      gender: state.gender,
      avatar: state.avatar,
      skinColor: '',
      hairStyle: '',
      currentAnimal: null
    });

    gameState.flags.characterCreated = true;
    gameState.meta.createdAt = new Date().toISOString();
    save();

    // Show HUD and nav, start game time
    showHUD();
    showNav();
    startTime();

    showToast(`Добро пожаловать, ${state.name}! 🎉`, 'success');
    navigate('home-map');
  }, 'btn-primary btn-lg btn-block');
  doneSection.appendChild(doneBtn);
  screen.appendChild(doneSection);

  container.appendChild(screen);

  // Initial render of avatar grid
  renderAvatarGrid();

  // Helper functions (closured within render)

  function updatePreview() {
    const previewEl = document.getElementById('avatar-preview');
    if (previewEl) {
      previewEl.textContent = state.avatar;
      previewEl.classList.remove('bounce-in');
      void previewEl.offsetWidth; // trigger reflow
      previewEl.classList.add('bounce-in');
    }
  }

  function updateGenderButtons() {
    const grid = document.getElementById('gender-grid');
    if (!grid) return;
    grid.querySelectorAll('.option-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.gender === state.gender);
    });
  }

  function renderAvatarGrid() {
    const grid = document.getElementById('avatar-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const avatars = AVATARS[state.gender] || [];
    avatars.forEach(av => {
      const btn = document.createElement('button');
      btn.className = 'option-btn' + (state.avatar === av ? ' selected' : '');
      btn.textContent = av;
      btn.addEventListener('click', () => {
        state.avatar = av;
        updatePreview();
        // Update selected state on all avatar buttons
        grid.querySelectorAll('.option-btn').forEach(b => {
          b.classList.toggle('selected', b.textContent === av);
        });
      });
      grid.appendChild(btn);
    });
  }
}

export function cleanup() {
  // No timers or intervals to clean up
}
