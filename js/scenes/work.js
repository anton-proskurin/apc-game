// work.js — Work scene: profession selection + tap minigame

import { gameState, setProfession, addMoney, changeStat, addExperience } from '../state.js';
import { navigate } from '../router.js';
import {
  createBackButton, createSectionTitle, createSubtitle,
  createButton, createEmojiButton, createProgressBar,
  showToast, showHUD, showNav, updateHUD
} from '../ui.js';
import { advanceHours } from '../time.js';
import { PROFESSIONS } from '../data.js';

let timers = [];
let intervals = [];
let isMinigameActive = false;

// ─── Main render ───────────────────────────────────────────────
export function render(container, params = {}) {
  showHUD();
  showNav();

  const screen = document.createElement('div');
  screen.className = 'work-screen fade-in';

  // If we're coming back to choose a new profession
  const forceSelect = params.forceSelect === true;

  if (!gameState.profession.current || forceSelect) {
    renderProfessionSelect(screen);
  } else {
    renderWorkDashboard(screen);
  }

  container.appendChild(screen);
}

// ─── Profession Selection ──────────────────────────────────────
function renderProfessionSelect(screen) {
  screen.appendChild(createBackButton('home-map'));
  screen.appendChild(createSectionTitle('Выбери профессию'));
  screen.appendChild(createSubtitle('Каждая профессия приносит разный доход'));

  const list = document.createElement('div');
  list.className = 'profession-list';

  PROFESSIONS.forEach(prof => {
    const card = document.createElement('div');
    card.className = 'profession-card';

    const icon = document.createElement('div');
    icon.className = 'card-icon';
    icon.textContent = prof.emoji;

    const info = document.createElement('div');
    info.className = 'profession-info';

    const name = document.createElement('h3');
    name.textContent = prof.name;

    const desc = document.createElement('p');
    desc.textContent = prof.desc;

    info.appendChild(name);
    info.appendChild(desc);

    const pay = document.createElement('div');
    pay.className = 'profession-pay';
    pay.textContent = `${prof.basePay} APC/смена`;

    card.appendChild(icon);
    card.appendChild(info);
    card.appendChild(pay);

    card.addEventListener('click', () => {
      setProfession(prof.id);
      showToast(`Ты теперь ${prof.name}!`);
      navigate('work');
    });

    list.appendChild(card);
  });

  screen.appendChild(list);
}

// ─── Work Dashboard ────────────────────────────────────────────
function renderWorkDashboard(screen) {
  const prof = PROFESSIONS.find(p => p.id === gameState.profession.current);
  if (!prof) {
    renderProfessionSelect(screen);
    return;
  }

  screen.appendChild(createBackButton('home-map'));

  // Profession header
  const header = document.createElement('div');
  header.className = 'text-center mb-lg';

  const profIcon = document.createElement('div');
  profIcon.style.fontSize = '64px';
  profIcon.textContent = prof.emoji;
  header.appendChild(profIcon);

  const profName = document.createElement('div');
  profName.className = 'page-title';
  profName.style.marginBottom = '4px';
  profName.textContent = prof.name;
  header.appendChild(profName);

  const levelText = document.createElement('div');
  levelText.className = 'page-subtitle';
  levelText.style.marginBottom = '8px';
  levelText.textContent = `Уровень ${gameState.profession.level}`;
  header.appendChild(levelText);

  screen.appendChild(header);

  // Experience bar
  const expNeeded = gameState.profession.level * 100;
  const expBar = createProgressBar(
    'Опыт',
    gameState.profession.experience,
    expNeeded,
    'progress-green'
  );
  expBar.style.marginBottom = '24px';
  screen.appendChild(expBar);

  // Info card
  const infoCard = document.createElement('div');
  infoCard.className = 'card mb-lg';
  infoCard.innerHTML = `
    <div style="text-align:center; font-size: var(--font-size-sm); color: var(--color-text-light);">
      <div style="margin-bottom:4px;">Оплата: <strong style="color:var(--color-secondary)">${prof.basePay} APC</strong> за смену</div>
      <div>Затраты энергии: <strong>${prof.energyCost} ⚡</strong></div>
    </div>
  `;
  screen.appendChild(infoCard);

  // Work button
  const workBtn = createEmojiButton(prof.emoji, 'Пойти на работу', () => {
    if (gameState.stats.energy < prof.energyCost) {
      showToast('Нет сил, отдохни!', 'warning');
      return;
    }
    startMinigame(screen, prof);
  }, 'btn-primary btn-lg btn-block');
  workBtn.style.marginBottom = '12px';
  screen.appendChild(workBtn);

  // Change profession button
  const changeBtn = createButton('Сменить профессию', () => {
    navigate('work', { forceSelect: true });
  }, 'btn-outline btn-block');
  screen.appendChild(changeBtn);
}

// ─── Minigame ──────────────────────────────────────────────────
function startMinigame(screen, prof) {
  isMinigameActive = true;
  screen.innerHTML = '';

  const mg = prof.minigame;
  let score = 0;
  let timeLeft = mg.duration;
  let spawnTimer = null;

  // Container
  const area = document.createElement('div');
  area.className = 'minigame-area fade-in';

  // Instruction
  const instruction = document.createElement('div');
  instruction.className = 'page-subtitle';
  instruction.style.marginBottom = '12px';
  instruction.textContent = mg.instruction;
  area.appendChild(instruction);

  // Header with score and timer
  const header = document.createElement('div');
  header.className = 'minigame-header';

  const scoreEl = document.createElement('div');
  scoreEl.className = 'minigame-score';
  scoreEl.textContent = `Счёт: ${score}`;

  const timerEl = document.createElement('div');
  timerEl.className = 'minigame-timer';
  timerEl.textContent = `⏱ ${timeLeft}с`;

  header.appendChild(scoreEl);
  header.appendChild(timerEl);
  area.appendChild(header);

  // Game field
  const field = document.createElement('div');
  field.className = 'minigame-field';
  area.appendChild(field);

  screen.appendChild(area);

  // --- Spawn targets ---
  function spawnTarget() {
    if (!isMinigameActive) return;

    // Remove old targets
    const oldTargets = field.querySelectorAll('.minigame-target');
    oldTargets.forEach(t => t.remove());

    // Spawn 1-3 targets
    const count = Math.min(1 + Math.floor(gameState.profession.level / 2), 3);
    for (let i = 0; i < count; i++) {
      createTarget();
    }
  }

  function createTarget() {
    const target = document.createElement('div');
    target.className = 'minigame-target';
    target.textContent = mg.targetEmoji;

    // Random position (keeping targets within bounds)
    const maxX = field.clientWidth - 60;
    const maxY = field.clientHeight - 60;
    const x = Math.max(0, Math.floor(Math.random() * maxX));
    const y = Math.max(0, Math.floor(Math.random() * maxY));

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    target.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isMinigameActive) return;

      score++;
      scoreEl.textContent = `Счёт: ${score}`;

      // Hit effect
      target.textContent = mg.hitEmoji;
      target.style.transform = 'scale(1.3)';
      target.style.transition = 'all 0.2s ease';

      const removeTimer = setTimeout(() => {
        if (target.parentNode) target.remove();
      }, 200);
      timers.push(removeTimer);
    });

    field.appendChild(target);

    // Auto-remove after 2 seconds
    const autoRemove = setTimeout(() => {
      if (target.parentNode) {
        target.style.opacity = '0';
        target.style.transform = 'scale(0)';
        target.style.transition = 'all 0.3s ease';
        const finalRemove = setTimeout(() => {
          if (target.parentNode) target.remove();
        }, 300);
        timers.push(finalRemove);
      }
    }, 2000);
    timers.push(autoRemove);
  }

  // --- Timer countdown ---
  const countdownInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `⏱ ${timeLeft}с`;

    if (timeLeft <= 3) {
      timerEl.style.color = 'var(--color-danger)';
    }

    if (timeLeft <= 0) {
      endMinigame(screen, prof, score);
    }
  }, 1000);
  intervals.push(countdownInterval);

  // --- Spawn interval ---
  spawnTarget(); // First spawn immediately
  spawnTimer = setInterval(() => {
    spawnTarget();
  }, 2000);
  intervals.push(spawnTimer);
}

// ─── Minigame End ──────────────────────────────────────────────
function endMinigame(screen, prof, score) {
  isMinigameActive = false;
  cleanupTimers();

  const mg = prof.minigame;

  // Calculate earnings
  const ratio = score / mg.targetScore;
  const levelBonus = 1 + (gameState.profession.level - 1) * 0.15;
  let earnings = Math.round(prof.basePay * ratio * levelBonus);

  // Clamp earnings
  const minEarnings = Math.round(prof.basePay * 0.5);
  const maxEarnings = Math.round(prof.basePay * 2);
  earnings = Math.max(minEarnings, Math.min(maxEarnings, earnings));

  // Apply effects
  addMoney(earnings);
  changeStat('energy', -prof.energyCost);
  addExperience(score * 10);
  advanceHours(3);
  gameState.flags.firstWorkDone = true;

  // Determine result emoji and text based on performance
  let resultEmoji = '';
  let resultText = '';

  if (ratio >= 1.5) {
    resultEmoji = '🌟';
    resultText = 'Великолепно!';
  } else if (ratio >= 1.0) {
    resultEmoji = '👏';
    resultText = 'Отличная работа!';
  } else if (ratio >= 0.5) {
    resultEmoji = '👍';
    resultText = 'Неплохо!';
  } else {
    resultEmoji = '💪';
    resultText = 'Можно лучше!';
  }

  // Render result screen
  screen.innerHTML = '';

  const result = document.createElement('div');
  result.className = 'minigame-result fade-in';

  const iconEl = document.createElement('div');
  iconEl.className = 'minigame-result-icon bounce-in';
  iconEl.textContent = resultEmoji;
  result.appendChild(iconEl);

  const textEl = document.createElement('div');
  textEl.className = 'minigame-result-text';
  textEl.textContent = resultText;
  result.appendChild(textEl);

  const moneyEl = document.createElement('div');
  moneyEl.className = 'minigame-result-money';
  moneyEl.textContent = `Заработано: ${earnings} APC!`;
  result.appendChild(moneyEl);

  // Stats summary
  const summary = document.createElement('div');
  summary.style.marginTop = '16px';
  summary.style.marginBottom = '24px';
  summary.style.fontSize = 'var(--font-size-sm)';
  summary.style.color = 'var(--color-text-light)';
  summary.innerHTML = `
    <div>Поймано целей: ${score} из ${mg.targetScore}</div>
    <div>Энергия: -${prof.energyCost} ⚡</div>
    <div>Опыт: +${score * 10}</div>
  `;
  result.appendChild(summary);

  // Check for level up
  if (gameState.profession.experience === 0 && gameState.profession.level > 1) {
    const lvlUp = document.createElement('div');
    lvlUp.style.marginBottom = '16px';
    lvlUp.style.fontSize = 'var(--font-size-lg)';
    lvlUp.style.fontWeight = '700';
    lvlUp.style.color = 'var(--color-primary)';
    lvlUp.textContent = `Уровень повышен до ${gameState.profession.level}!`;
    result.appendChild(lvlUp);
  }

  const doneBtn = createButton('Отлично!', () => {
    navigate('work');
  }, 'btn-primary btn-lg btn-block');
  result.appendChild(doneBtn);

  screen.appendChild(result);
  updateHUD();
}

// ─── Cleanup ───────────────────────────────────────────────────
function cleanupTimers() {
  timers.forEach(t => clearTimeout(t));
  timers = [];
  intervals.forEach(i => clearInterval(i));
  intervals = [];
}

export function cleanup() {
  isMinigameActive = false;
  cleanupTimers();
}
