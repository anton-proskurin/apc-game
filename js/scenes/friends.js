// friends.js — Friends, partner, and family system

import { gameState, changeStat, spendMoney, canAfford, addFriend, setPartner, addChild } from '../state.js';
import { navigate } from '../router.js';
import {
  createBackButton, createSectionTitle, createSubtitle,
  createButton, createEmojiButton, showModal, closeModal,
  showToast, showHUD, showNav, updateHUD, createProgressBar
} from '../ui.js';
import { advanceHours } from '../time.js';
import { save } from '../storage.js';
import { NPC_NAMES, NPC_AVATARS, DIALOGUE_TOPICS, PARTNER_STAGES, CHILD_NAMES } from '../data.js';

// ─── Module state ──────────────────────────────────────────────
let containerRef = null;
let currentView = 'main'; // 'main' | 'park' | 'dialogue' | 'partner-dialogue'
let parkNPCs = [];
let currentNPC = null;
let interactionCount = 0;
let timers = [];

// ─── Helpers ───────────────────────────────────────────────────
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateNPC() {
  const gender = Math.random() < 0.5 ? 'boy' : 'girl';
  const name = randomFrom(NPC_NAMES[gender]);
  const emoji = randomFrom(NPC_AVATARS[gender]);
  const id = `npc_${name}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  return { id, name, emoji, gender };
}

function isAlreadyFriend(npc) {
  return gameState.social.friends.some(f => f.name === npc.name);
}

function canMeetPartner() {
  return gameState.social.friends.length >= 2 && !gameState.social.partner;
}

function getRelationship() {
  return gameState.social.partner?.relationship || 0;
}

// ─── Main render ───────────────────────────────────────────────
export function render(container, params = {}) {
  containerRef = container;
  showHUD();
  showNav();

  if (params.view) {
    currentView = params.view;
  }

  renderCurrentView();
}

function renderCurrentView() {
  if (!containerRef) return;
  containerRef.innerHTML = '';

  const screen = document.createElement('div');
  screen.className = 'fade-in';

  switch (currentView) {
    case 'park':
      renderPark(screen);
      break;
    case 'dialogue':
      renderDialogue(screen);
      break;
    case 'partner-dialogue':
      renderPartnerDialogue(screen);
      break;
    default:
      renderMain(screen);
  }

  containerRef.appendChild(screen);
}

// ═════════════════════════════════════════════════════════════════
// Main Social Hub
// ═════════════════════════════════════════════════════════════════
function renderMain(screen) {
  screen.appendChild(createBackButton('home-map'));
  screen.appendChild(createSectionTitle('Друзья и семья 👥'));

  // ── Friends section ──
  const friendsTitle = document.createElement('h3');
  friendsTitle.style.cssText = 'font-size:18px;font-weight:700;margin-bottom:12px';
  friendsTitle.textContent = `Мои друзья (${gameState.social.friends.length}/5)`;
  screen.appendChild(friendsTitle);

  if (gameState.social.friends.length > 0) {
    gameState.social.friends.forEach(friend => {
      const card = document.createElement('div');
      card.className = 'npc-card';
      card.style.cursor = 'default';

      const avatar = document.createElement('div');
      avatar.className = 'npc-avatar';
      avatar.textContent = friend.emoji;
      card.appendChild(avatar);

      const info = document.createElement('div');
      info.className = 'npc-info';

      const name = document.createElement('h3');
      name.textContent = friend.name;
      info.appendChild(name);

      const badge = document.createElement('div');
      badge.className = 'friend-badge';
      badge.textContent = '💚 Друг';
      info.appendChild(badge);

      card.appendChild(info);
      screen.appendChild(card);
    });
  } else {
    const empty = document.createElement('div');
    empty.className = 'text-center mb-lg';
    empty.style.cssText = 'color:#999;padding:16px 0';
    empty.textContent = 'Пока нет друзей. Познакомься с кем-нибудь в парке! 🌳';
    screen.appendChild(empty);
  }

  // ── Family section ──
  const familyTitle = document.createElement('h3');
  familyTitle.style.cssText = 'font-size:18px;font-weight:700;margin-bottom:12px;margin-top:24px';
  familyTitle.textContent = 'Моя семья 👨‍👩‍👧';
  screen.appendChild(familyTitle);

  const partner = gameState.social.partner;
  const children = gameState.social.children;

  if (partner) {
    const partnerCard = document.createElement('div');
    partnerCard.className = 'npc-card';

    const avatar = document.createElement('div');
    avatar.className = 'npc-avatar';
    avatar.textContent = partner.emoji;
    partnerCard.appendChild(avatar);

    const info = document.createElement('div');
    info.className = 'npc-info';

    const name = document.createElement('h3');
    name.textContent = partner.name;
    info.appendChild(name);

    const stageInfo = PARTNER_STAGES[partner.stage];
    const stage = document.createElement('div');
    stage.style.cssText = 'font-size:13px;color:#E91E63;font-weight:600';
    stage.textContent = `${stageInfo?.emoji || '💕'} ${stageInfo?.name || 'Вместе'}`;
    info.appendChild(stage);

    // Relationship bar for non-married
    if (partner.stage !== 'married') {
      const threshold = stageInfo?.nextThreshold || 100;
      const relBar = createProgressBar('💕 Отношения', partner.relationship || 0, threshold, 'progress-happiness');
      relBar.style.marginTop = '8px';
      info.appendChild(relBar);
    }

    partnerCard.appendChild(info);

    // Button to interact with partner
    if (partner.stage !== 'married') {
      partnerCard.style.cursor = 'pointer';
      partnerCard.addEventListener('click', () => {
        currentView = 'partner-dialogue';
        renderCurrentView();
      });
    }

    screen.appendChild(partnerCard);

    // Children
    if (children.length > 0) {
      children.forEach(child => {
        const childCard = document.createElement('div');
        childCard.className = 'npc-card';
        childCard.style.cursor = 'default';

        const childAvatar = document.createElement('div');
        childAvatar.className = 'npc-avatar';
        childAvatar.textContent = child.emoji;
        childCard.appendChild(childAvatar);

        const childInfo = document.createElement('div');
        childInfo.className = 'npc-info';

        const childName = document.createElement('h3');
        childName.textContent = child.name;
        childInfo.appendChild(childName);

        const childAge = document.createElement('p');
        childAge.textContent = `Возраст: ${child.age || 0} ${getAgeWord(child.age || 0)}`;
        childInfo.appendChild(childAge);

        childCard.appendChild(childInfo);
        screen.appendChild(childCard);
      });
    }

    // Have baby button (only if married)
    if (partner.stage === 'married' && children.length < 3) {
      const babyBtn = createEmojiButton('👶', 'Завести ребёнка (500 APC)', () => {
        haveBaby();
      }, canAfford(500) ? 'btn-accent' : 'btn-disabled');
      babyBtn.style.width = '100%';
      babyBtn.style.marginTop = '12px';
      screen.appendChild(babyBtn);
    }

    if (partner.stage === 'married' && children.length >= 3) {
      const maxKids = document.createElement('div');
      maxKids.style.cssText = 'text-align:center;color:#999;font-size:13px;margin-top:8px';
      maxKids.textContent = 'У вас полная семья! 👨‍👩‍👧‍👦💕';
      screen.appendChild(maxKids);
    }
  } else {
    const noPartner = document.createElement('div');
    noPartner.className = 'text-center mb-lg';
    noPartner.style.cssText = 'color:#999;padding:16px 0';
    if (canMeetPartner()) {
      noPartner.textContent = 'Пока нет пары. Может, встретишь кого-то особенного в парке? 💕';
    } else {
      noPartner.textContent = 'Заведи хотя бы 2 друзей, чтобы встретить пару! 💕';
    }
    screen.appendChild(noPartner);
  }

  // ── Park button ──
  const parkBtn = createEmojiButton('🌳', 'Пойти в парк', () => {
    currentView = 'park';
    parkNPCs = [];
    for (let i = 0; i < 3; i++) {
      let npc;
      do {
        npc = generateNPC();
      } while (isAlreadyFriend(npc) || parkNPCs.some(p => p.name === npc.name));
      parkNPCs.push(npc);
    }
    renderCurrentView();
  }, 'btn-primary btn-lg');
  parkBtn.style.width = '100%';
  parkBtn.style.marginTop = '24px';
  screen.appendChild(parkBtn);
}

// ═════════════════════════════════════════════════════════════════
// Park — Meet NPCs
// ═════════════════════════════════════════════════════════════════
function renderPark(screen) {
  const backBtn = document.createElement('button');
  backBtn.className = 'back-btn';
  backBtn.textContent = '← Друзья';
  backBtn.addEventListener('click', () => {
    currentView = 'main';
    renderCurrentView();
  });
  screen.appendChild(backBtn);

  screen.appendChild(createSectionTitle('Парк 🌳'));
  screen.appendChild(createSubtitle('Познакомься с новыми людьми!'));

  // NPC list
  parkNPCs.forEach(npc => {
    const isFriend = isAlreadyFriend(npc);

    const card = document.createElement('div');
    card.className = 'npc-card';

    const avatar = document.createElement('div');
    avatar.className = 'npc-avatar';
    avatar.textContent = npc.emoji;
    card.appendChild(avatar);

    const info = document.createElement('div');
    info.className = 'npc-info';

    const name = document.createElement('h3');
    name.textContent = npc.name;
    info.appendChild(name);

    if (isFriend) {
      const badge = document.createElement('div');
      badge.className = 'friend-badge';
      badge.textContent = '💚 Уже друг';
      info.appendChild(badge);
    } else {
      const hint = document.createElement('p');
      hint.textContent = 'Нажми, чтобы познакомиться';
      info.appendChild(hint);
    }

    card.appendChild(info);

    if (!isFriend) {
      card.addEventListener('click', () => {
        currentNPC = npc;
        interactionCount = 0;
        currentView = 'dialogue';
        renderCurrentView();
      });
    }

    screen.appendChild(card);
  });

  // Partner candidate (if eligible)
  if (canMeetPartner()) {
    const divider = document.createElement('div');
    divider.style.cssText = 'text-align:center;margin:20px 0;font-size:14px;color:#999';
    divider.textContent = '— Особенная встреча —';
    screen.appendChild(divider);

    const partnerGender = gameState.character.gender === 'boy' ? 'girl' : 'boy';
    const partnerNPC = {
      id: `partner_${Date.now()}`,
      name: randomFrom(NPC_NAMES[partnerGender]),
      emoji: randomFrom(NPC_AVATARS[partnerGender]),
      gender: partnerGender
    };

    const card = document.createElement('div');
    card.className = 'npc-card';
    card.style.border = '2px solid #E91E63';
    card.style.background = 'linear-gradient(135deg, #FCE4EC 0%, #FFFFFF 100%)';

    const avatar = document.createElement('div');
    avatar.className = 'npc-avatar';
    avatar.textContent = `${partnerNPC.emoji}`;
    card.appendChild(avatar);

    const info = document.createElement('div');
    info.className = 'npc-info';

    const name = document.createElement('h3');
    name.textContent = `${partnerNPC.name} 💕`;
    info.appendChild(name);

    const hint = document.createElement('p');
    hint.style.color = '#E91E63';
    hint.textContent = 'Кажется, кто-то особенный...';
    info.appendChild(hint);

    card.appendChild(info);

    card.addEventListener('click', () => {
      // Start dating
      setPartner({
        name: partnerNPC.name,
        emoji: partnerNPC.emoji,
        stage: 'dating',
        relationship: 0
      });
      changeStat('happiness', 15);
      advanceHours(2);
      updateHUD();
      save();

      showToast(`Ты встретил ${partnerNPC.name}! Начинаете встречаться! 💕`, 'success');
      currentView = 'main';
      renderCurrentView();
    });

    screen.appendChild(card);
  }

  // Refresh button
  const refreshBtn = createButton('🔄 Другие люди', () => {
    parkNPCs = [];
    for (let i = 0; i < 3; i++) {
      let npc;
      do {
        npc = generateNPC();
      } while (isAlreadyFriend(npc) || parkNPCs.some(p => p.name === npc.name));
      parkNPCs.push(npc);
    }
    renderCurrentView();
  }, 'btn-outline');
  refreshBtn.style.width = '100%';
  refreshBtn.style.marginTop = '16px';
  screen.appendChild(refreshBtn);
}

// ═════════════════════════════════════════════════════════════════
// Dialogue with NPC
// ═════════════════════════════════════════════════════════════════
function renderDialogue(screen) {
  const npc = currentNPC;
  if (!npc) {
    currentView = 'park';
    renderCurrentView();
    return;
  }

  const backBtn = document.createElement('button');
  backBtn.className = 'back-btn';
  backBtn.textContent = '← Парк';
  backBtn.addEventListener('click', () => {
    currentView = 'park';
    renderCurrentView();
  });
  screen.appendChild(backBtn);

  // NPC header
  const header = document.createElement('div');
  header.style.cssText = 'text-align:center;margin-bottom:20px';

  const avatar = document.createElement('div');
  avatar.style.fontSize = '64px';
  avatar.textContent = npc.emoji;
  header.appendChild(avatar);

  const name = document.createElement('div');
  name.style.cssText = 'font-size:24px;font-weight:700';
  name.textContent = npc.name;
  header.appendChild(name);

  screen.appendChild(header);

  // Check if ready to become friends
  if (interactionCount >= 3) {
    renderFriendshipOffer(screen, npc);
    return;
  }

  // Pick topic
  const topic = DIALOGUE_TOPICS[interactionCount % DIALOGUE_TOPICS.length];

  // Dialogue box
  const dialogue = document.createElement('div');
  dialogue.className = 'dialogue-box';

  const speaker = document.createElement('div');
  speaker.className = 'dialogue-speaker';
  speaker.textContent = npc.name + ':';
  dialogue.appendChild(speaker);

  const text = document.createElement('div');
  text.className = 'dialogue-text';

  // NPC greeting varies by interaction count
  const greetings = [
    `Привет! Я ${npc.name}! Рад познакомиться!`,
    `О, это снова ты! Как дела?`,
    `Здорово, что ты пришёл! Давай поболтаем!`
  ];
  text.textContent = greetings[Math.min(interactionCount, greetings.length - 1)];
  dialogue.appendChild(text);

  screen.appendChild(dialogue);

  // Dialogue choices
  const choices = document.createElement('div');
  choices.className = 'dialogue-choices';

  // Positive choice
  const positiveBtn = createButton(`😊 ${topic.question}`, () => {
    handleDialogueChoice(screen, npc, topic, 'positive');
  }, 'btn-primary btn-block');
  choices.appendChild(positiveBtn);

  // Neutral choice
  const neutralBtn = createButton('🙂 Расскажи о себе', () => {
    handleDialogueChoice(screen, npc, topic, 'neutral');
  }, 'btn-secondary btn-block');
  choices.appendChild(neutralBtn);

  // Leave choice
  const leaveBtn = createButton('👋 Пока, мне пора', () => {
    currentView = 'park';
    renderCurrentView();
  }, 'btn-outline btn-block');
  choices.appendChild(leaveBtn);

  screen.appendChild(choices);
}

function handleDialogueChoice(screen, npc, topic, type) {
  if (type === 'positive') {
    interactionCount++;
    changeStat('happiness', 5);
    advanceHours(1);
    updateHUD();

    showToast(`${npc.name}: ${topic.positiveReply}`, 'success');
  } else if (type === 'neutral') {
    interactionCount++;
    advanceHours(1);
    updateHUD();

    const neutralReplies = [
      `Мне нравится гулять в парке и играть!`,
      `Я люблю рисовать и смотреть мультики!`,
      `У меня дома есть кот, он очень смешной!`
    ];
    showToast(`${npc.name}: ${randomFrom(neutralReplies)}`, 'info');
  }

  // Re-render dialogue with new interaction count
  const t = setTimeout(() => renderCurrentView(), 600);
  timers.push(t);
}

function renderFriendshipOffer(screen, npc) {
  const offerBox = document.createElement('div');
  offerBox.className = 'dialogue-box';
  offerBox.style.textAlign = 'center';

  const emoji = document.createElement('div');
  emoji.style.fontSize = '48px';
  emoji.style.marginBottom = '12px';
  emoji.textContent = '🤝';
  offerBox.appendChild(emoji);

  const text = document.createElement('div');
  text.className = 'dialogue-text';
  text.textContent = `${npc.name} хочет стать твоим другом!`;
  offerBox.appendChild(text);

  const acceptBtn = createButton('💚 Давай дружить!', () => {
    const success = addFriend({
      id: npc.id,
      name: npc.name,
      emoji: npc.emoji,
      level: 1
    });

    if (success) {
      changeStat('happiness', 10);
      updateHUD();
      save();
      showToast(`${npc.name} теперь твой друг! 🎉💚`, 'success');
    } else {
      showToast('У тебя уже максимум друзей (5)!', 'warning');
    }

    currentView = 'main';
    renderCurrentView();
  }, 'btn-primary btn-lg btn-block');
  offerBox.appendChild(acceptBtn);

  const declineBtn = createButton('Может позже', () => {
    currentView = 'park';
    renderCurrentView();
  }, 'btn-outline btn-block');
  declineBtn.style.marginTop = '8px';
  offerBox.appendChild(declineBtn);

  screen.appendChild(offerBox);
}

// ═════════════════════════════════════════════════════════════════
// Partner Dialogue — Dating progression
// ═════════════════════════════════════════════════════════════════
function renderPartnerDialogue(screen) {
  const partner = gameState.social.partner;
  if (!partner) {
    currentView = 'main';
    renderCurrentView();
    return;
  }

  const backBtn = document.createElement('button');
  backBtn.className = 'back-btn';
  backBtn.textContent = '← Назад';
  backBtn.addEventListener('click', () => {
    currentView = 'main';
    renderCurrentView();
  });
  screen.appendChild(backBtn);

  // Partner header
  const header = document.createElement('div');
  header.style.cssText = 'text-align:center;margin-bottom:20px';

  const avatar = document.createElement('div');
  avatar.style.fontSize = '64px';
  avatar.textContent = partner.emoji;
  header.appendChild(avatar);

  const name = document.createElement('div');
  name.style.cssText = 'font-size:24px;font-weight:700';
  name.textContent = partner.name;
  header.appendChild(name);

  const stageInfo = PARTNER_STAGES[partner.stage];
  const stageText = document.createElement('div');
  stageText.style.cssText = 'font-size:16px;color:#E91E63;margin-top:4px';
  stageText.textContent = `${stageInfo?.emoji || '💕'} ${stageInfo?.name || 'Вместе'}`;
  header.appendChild(stageText);

  screen.appendChild(header);

  // Relationship bar
  const threshold = stageInfo?.nextThreshold || 100;
  const relBar = createProgressBar('💕 Отношения', partner.relationship || 0, threshold, 'progress-happiness');
  relBar.style.marginBottom = '20px';
  screen.appendChild(relBar);

  // Date activities
  const dialogue = document.createElement('div');
  dialogue.className = 'dialogue-box';

  const text = document.createElement('div');
  text.className = 'dialogue-text';

  const dateTexts = {
    dating: `${partner.name}: Куда пойдём сегодня? 😊`,
    engaged: `${partner.name}: Скоро наша свадьба! 💍✨`
  };
  text.textContent = dateTexts[partner.stage] || `${partner.name}: Привет! 💕`;
  dialogue.appendChild(text);

  screen.appendChild(dialogue);

  // Date options
  const options = document.createElement('div');
  options.className = 'flex-col';
  options.style.marginTop = '12px';

  const dateActions = [
    { emoji: '🌹', text: 'Подарить цветы', cost: 30, gain: 25, msg: 'Какие красивые! Спасибо! 🌹💕' },
    { emoji: '🎬', text: 'Сходить в кино', cost: 50, gain: 20, msg: 'Отличный фильм! 🎬😊' },
    { emoji: '🚶', text: 'Погулять вместе', cost: 0, gain: 15, msg: 'Как хорошо гулять вместе! 🌳💕' },
    { emoji: '🍽️', text: 'Ужин в ресторане', cost: 80, gain: 30, msg: 'Ужин был потрясающий! 🍽️💕' }
  ];

  dateActions.forEach(action => {
    const btn = createEmojiButton(action.emoji,
      action.cost > 0 ? `${action.text} (${action.cost} APC)` : action.text,
      () => {
        performDate(action, partner, stageInfo);
      },
      action.cost > 0 && !canAfford(action.cost) ? 'btn-disabled' : 'btn-secondary'
    );
    btn.style.width = '100%';
    options.appendChild(btn);
  });

  screen.appendChild(options);
}

function performDate(action, partner, stageInfo) {
  if (action.cost > 0 && !canAfford(action.cost)) {
    showToast('Не хватает APC!', 'error');
    return;
  }

  if (action.cost > 0) {
    spendMoney(action.cost);
  }

  // Increase relationship
  partner.relationship = (partner.relationship || 0) + action.gain;
  changeStat('happiness', 10);
  advanceHours(2);
  updateHUD();

  showToast(`${partner.name}: ${action.msg}`, 'success');

  // Check stage progression
  const threshold = stageInfo?.nextThreshold;
  if (threshold && partner.relationship >= threshold) {
    if (partner.stage === 'dating') {
      partner.stage = 'engaged';
      partner.relationship = 0;

      const t = setTimeout(() => {
        showModal('💍 Помолвка!', `${partner.name} согласился(ась)! Вы помолвлены!`, [
          { label: '🎉 Ура!', onClick: () => {
            currentView = 'main';
            renderCurrentView();
          }}
        ]);
      }, 800);
      timers.push(t);

      save();
      return;
    } else if (partner.stage === 'engaged') {
      partner.stage = 'married';
      partner.relationship = 100;

      const t = setTimeout(() => {
        showModal('💒 Свадьба!', `Поздравляем! Вы с ${partner.name} теперь семья! 🎉💕`, [
          { label: '💒 Ура!', onClick: () => {
            currentView = 'main';
            renderCurrentView();
          }}
        ]);
      }, 800);
      timers.push(t);

      changeStat('happiness', 30);
      updateHUD();
      save();
      return;
    }
  }

  setPartner(partner);
  save();

  const t = setTimeout(() => renderCurrentView(), 600);
  timers.push(t);
}

// ═════════════════════════════════════════════════════════════════
// Have Baby
// ═════════════════════════════════════════════════════════════════
function haveBaby() {
  if (!canAfford(500)) {
    showToast('Нужно 500 APC!', 'error');
    return;
  }
  if (gameState.social.children.length >= 3) {
    showToast('У вас уже 3 ребёнка!', 'warning');
    return;
  }

  // Show modal to choose gender and name
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');

  const modal = document.createElement('div');
  modal.className = 'modal';

  const title = document.createElement('div');
  title.className = 'modal-title';
  title.textContent = '👶 У вас ребёнок!';
  modal.appendChild(title);

  // Gender selection
  const genderLabel = document.createElement('div');
  genderLabel.style.cssText = 'text-align:center;margin-bottom:12px;font-weight:600';
  genderLabel.textContent = 'Мальчик или девочка?';
  modal.appendChild(genderLabel);

  let selectedGender = 'boy';

  const genderGrid = document.createElement('div');
  genderGrid.style.cssText = 'display:flex;justify-content:center;gap:12px;margin-bottom:16px';

  const boyBtn = document.createElement('button');
  boyBtn.className = 'option-btn selected';
  boyBtn.style.cssText = 'width:80px;height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center';
  boyBtn.innerHTML = '<span style="font-size:28px">👦</span><span style="font-size:11px">Мальчик</span>';

  const girlBtn = document.createElement('button');
  girlBtn.className = 'option-btn';
  girlBtn.style.cssText = 'width:80px;height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center';
  girlBtn.innerHTML = '<span style="font-size:28px">👧</span><span style="font-size:11px">Девочка</span>';

  boyBtn.addEventListener('click', () => {
    selectedGender = 'boy';
    boyBtn.classList.add('selected');
    girlBtn.classList.remove('selected');
    nameInput.value = randomFrom(CHILD_NAMES.boy);
  });

  girlBtn.addEventListener('click', () => {
    selectedGender = 'girl';
    girlBtn.classList.add('selected');
    boyBtn.classList.remove('selected');
    nameInput.value = randomFrom(CHILD_NAMES.girl);
  });

  genderGrid.appendChild(boyBtn);
  genderGrid.appendChild(girlBtn);
  modal.appendChild(genderGrid);

  // Name input
  const nameInput = document.createElement('input');
  nameInput.className = 'name-input';
  nameInput.type = 'text';
  nameInput.placeholder = 'Имя ребёнка';
  nameInput.maxLength = 20;
  nameInput.autocomplete = 'off';
  nameInput.value = randomFrom(CHILD_NAMES.boy);
  nameInput.style.marginBottom = '16px';
  modal.appendChild(nameInput);

  // Buttons
  const actions = document.createElement('div');
  actions.className = 'modal-actions';

  const cancelBtn = createButton('Отмена', () => { closeModal(); }, 'btn-outline');
  actions.appendChild(cancelBtn);

  const confirmBtn = createButton('🎉 Родился!', () => {
    const childName = nameInput.value.trim() || randomFrom(CHILD_NAMES[selectedGender]);
    const childEmoji = selectedGender === 'boy' ? '👦' : '👧';

    spendMoney(500);
    addChild({ name: childName, emoji: childEmoji, age: 0 });
    changeStat('happiness', 25);
    updateHUD();
    save();

    closeModal();
    showToast(`У вас родился ребёнок ${childName}! 🎉👶`, 'success');
    currentView = 'main';
    renderCurrentView();
  }, 'btn-primary');
  actions.appendChild(confirmBtn);

  modal.appendChild(actions);
  overlay.innerHTML = '';
  overlay.appendChild(modal);

  setTimeout(() => nameInput.focus(), 100);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  }, { once: true });
}

// ─── Helpers ───────────────────────────────────────────────────
function getAgeWord(age) {
  if (age === 0) return 'лет';
  const lastDigit = age % 10;
  const lastTwo = age % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return 'лет';
  if (lastDigit === 1) return 'год';
  if (lastDigit >= 2 && lastDigit <= 4) return 'года';
  return 'лет';
}

// ─── Cleanup ───────────────────────────────────────────────────
export function cleanup() {
  timers.forEach(t => clearTimeout(t));
  timers = [];
  containerRef = null;
  currentView = 'main';
  currentNPC = null;
  interactionCount = 0;
  parkNPCs = [];
}
