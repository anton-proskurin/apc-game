// time.js — Game time system

import { gameState, changeStat, emit } from './state.js';
import { updateHUD, showToast } from './ui.js';

let tickTimer = null;
const TICK_INTERVAL = 3000; // 3 seconds real = 1 game hour
const HOURS_PER_DAY = 24;

export function startTime() {
  stopTime();
  tickTimer = setInterval(tick, TICK_INTERVAL);
}

export function stopTime() {
  if (tickTimer) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

function tick() {
  advanceTime(1);
  decayStats();
  decayPets();
  updateHUD();
}

export function advanceTime(hours) {
  gameState.time.hour += hours;
  while (gameState.time.hour >= HOURS_PER_DAY) {
    gameState.time.hour -= HOURS_PER_DAY;
    gameState.time.day++;
    emit('newDay', gameState.time.day);

    // Age children every 30 days (1 game year)
    if (gameState.time.day % 30 === 0) {
      gameState.social.children.forEach(child => {
        child.age++;
      });
      emit('yearPassed', Math.floor(gameState.time.day / 30));
    }
  }
  emit('timeChange', gameState.time);
}

export function advanceHours(hours) {
  advanceTime(hours);
  updateHUD();
}

function decayStats() {
  // Hunger decays slowly
  if (gameState.stats.hunger > 0) {
    changeStat('hunger', -1);
  }
  // If hungry, happiness drops
  if (gameState.stats.hunger < 20) {
    changeStat('happiness', -1);
  }
  // Energy recovers during night hours
  if (gameState.time.hour >= 22 || gameState.time.hour < 6) {
    changeStat('energy', 2);
  }
}

function decayPets() {
  let needsCare = false;
  gameState.inventory.pets.forEach(pet => {
    pet.hunger = Math.max(0, pet.hunger - 2);
    pet.happiness = Math.max(0, pet.happiness - 1);
    pet.cleanliness = Math.max(0, pet.cleanliness - 1);
    if (pet.hunger < 20 || pet.happiness < 20) {
      needsCare = true;
    }
  });
  if (needsCare && Math.random() < 0.3) {
    const sadPet = gameState.inventory.pets.find(p => p.hunger < 20 || p.happiness < 20);
    if (sadPet) {
      showToast(`${sadPet.emoji} ${sadPet.name} нуждается в заботе!`, 'warning');
    }
  }
}

export function getTimeOfDay() {
  const h = gameState.time.hour;
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 22) return 'evening';
  return 'night';
}

export function formatTime() {
  return `День ${gameState.time.day}, ${String(gameState.time.hour).padStart(2, '0')}:00`;
}
