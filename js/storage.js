// storage.js — localStorage save/load/reset

import { gameState, resetState } from './state.js';

const STORAGE_KEY = 'apc_game_save';
let autoSaveTimer = null;

export function save() {
  try {
    gameState.meta.lastPlayed = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

export function load() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    const saved = JSON.parse(data);
    if (!saved || saved.meta?.version !== 1) return false;
    // Deep merge saved data into gameState
    deepMerge(gameState, saved);
    return true;
  } catch (e) {
    console.warn('Load failed:', e);
    return false;
  }
}

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (!(key in target)) continue;
    if (Array.isArray(source[key])) {
      target[key] = source[key];
    } else if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

export function clearSave() {
  localStorage.removeItem(STORAGE_KEY);
  resetState();
}

export function hasSave() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function startAutoSave(intervalMs = 30000) {
  stopAutoSave();
  autoSaveTimer = setInterval(save, intervalMs);
}

export function stopAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}
