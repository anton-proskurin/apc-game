// router.js — Hash-based SPA scene router

import { save } from './storage.js';

const scenes = {};
let currentScene = null;
let currentSceneId = null;

export function registerScene(id, sceneModule) {
  scenes[id] = sceneModule;
}

export function navigate(sceneId, params = {}) {
  const scene = scenes[sceneId];
  if (!scene) {
    console.error(`Scene not found: ${sceneId}`);
    return;
  }

  // Cleanup current scene
  if (currentScene && currentScene.cleanup) {
    currentScene.cleanup();
  }

  // Save on scene change
  save();

  // Clear container
  const container = document.getElementById('game-container');
  container.innerHTML = '';
  container.scrollTop = 0;

  // Update hash without triggering hashchange
  history.replaceState(null, '', `#${sceneId}`);

  // Render new scene
  currentScene = scene;
  currentSceneId = sceneId;
  scene.render(container, params);
}

export function getCurrentScene() {
  return currentSceneId;
}

export function initRouter() {
  // Handle browser back/forward
  window.addEventListener('hashchange', () => {
    const hash = location.hash.slice(1);
    if (hash && hash !== currentSceneId && scenes[hash]) {
      navigate(hash);
    }
  });
}
