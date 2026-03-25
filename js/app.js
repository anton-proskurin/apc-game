// app.js — Game entry point

import { gameState } from './state.js';
import { load, hasSave, startAutoSave } from './storage.js';
import { registerScene, navigate, initRouter } from './router.js';
import { startTime } from './time.js';

// Import all scenes
import * as intro from './scenes/intro.js';
import * as characterCreate from './scenes/character-create.js';
import * as homeMap from './scenes/home-map.js';
import * as work from './scenes/work.js';
import * as shop from './scenes/shop.js';
import * as house from './scenes/house.js';
import * as pets from './scenes/pets.js';
import * as restaurant from './scenes/restaurant.js';
import * as travel from './scenes/travel.js';
import * as friends from './scenes/friends.js';
import * as transform from './scenes/transform.js';

// Register scenes
registerScene('intro', intro);
registerScene('character-create', characterCreate);
registerScene('home-map', homeMap);
registerScene('work', work);
registerScene('shop', shop);
registerScene('house', house);
registerScene('pets', pets);
registerScene('restaurant', restaurant);
registerScene('travel', travel);
registerScene('friends', friends);
registerScene('transform', transform);

// Initialize
initRouter();

// Load save or start new game
const hasSavedGame = hasSave();
if (hasSavedGame) {
  load();
}

// Start auto-save
startAutoSave();

// Navigate to appropriate scene
if (hasSavedGame && gameState.flags.characterCreated) {
  startTime();
  navigate('home-map');
} else {
  navigate('intro');
}
