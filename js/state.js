// state.js — Central game state and mutation helpers

const listeners = {};

export const gameState = {
  meta: {
    version: 1,
    createdAt: '',
    lastPlayed: ''
  },
  character: {
    name: '',
    gender: 'boy',       // 'boy' | 'girl'
    avatar: '🧑',        // emoji avatar
    skinColor: '',
    hairStyle: '',
    currentAnimal: null   // null or { id, emoji, name }
  },
  stats: {
    money: 500,
    energy: 100,
    happiness: 80,
    hunger: 80
  },
  time: {
    day: 1,
    hour: 8
  },
  profession: {
    current: null,    // profession id string
    level: 1,
    experience: 0
  },
  inventory: {
    car: null,        // { id, emoji, name } or null
    house: null,      // { id, emoji, name, rooms } or null
    pets: []          // [{ id, type, name, emoji, hunger, happiness, cleanliness }]
  },
  social: {
    friends: [],      // [{ id, name, emoji, level }]
    partner: null,    // { name, emoji, stage } or null — stage: 'dating'|'engaged'|'married'
    children: []      // [{ name, emoji, age }]
  },
  travel: {
    visited: []       // destination ids
  },
  flags: {
    introSeen: false,
    characterCreated: false,
    firstWorkDone: false
  }
};

// --- Event system ---
export function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

export function off(event, callback) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter(cb => cb !== callback);
}

export function emit(event, data) {
  if (!listeners[event]) return;
  listeners[event].forEach(cb => cb(data));
}

// --- State helpers ---
export function addMoney(amount) {
  gameState.stats.money = Math.max(0, gameState.stats.money + amount);
  emit('statsChange', { stat: 'money', value: gameState.stats.money });
}

export function spendMoney(amount) {
  if (gameState.stats.money < amount) return false;
  gameState.stats.money -= amount;
  emit('statsChange', { stat: 'money', value: gameState.stats.money });
  return true;
}

export function canAfford(amount) {
  return gameState.stats.money >= amount;
}

export function changeStat(stat, delta) {
  gameState.stats[stat] = Math.max(0, Math.min(100, gameState.stats[stat] + delta));
  emit('statsChange', { stat, value: gameState.stats[stat] });
}

export function setCharacter(data) {
  Object.assign(gameState.character, data);
  emit('characterChange', gameState.character);
}

export function setProfession(profId) {
  gameState.profession.current = profId;
  gameState.profession.level = 1;
  gameState.profession.experience = 0;
  emit('professionChange', gameState.profession);
}

export function addExperience(amount) {
  gameState.profession.experience += amount;
  if (gameState.profession.experience >= gameState.profession.level * 100) {
    gameState.profession.experience = 0;
    gameState.profession.level++;
    emit('levelUp', gameState.profession);
  }
}

export function setCar(car) {
  gameState.inventory.car = car;
  emit('inventoryChange', 'car');
}

export function setHouse(house) {
  gameState.inventory.house = house;
  emit('inventoryChange', 'house');
}

export function addPet(pet) {
  gameState.inventory.pets.push(pet);
  emit('inventoryChange', 'pets');
}

export function updatePet(petId, updates) {
  const pet = gameState.inventory.pets.find(p => p.id === petId);
  if (pet) {
    Object.assign(pet, updates);
    emit('petChange', pet);
  }
}

export function addFriend(friend) {
  if (gameState.social.friends.length >= 5) return false;
  if (gameState.social.friends.find(f => f.id === friend.id)) return false;
  gameState.social.friends.push(friend);
  emit('socialChange', 'friends');
  return true;
}

export function setPartner(partner) {
  gameState.social.partner = partner;
  emit('socialChange', 'partner');
}

export function addChild(child) {
  gameState.social.children.push(child);
  emit('socialChange', 'children');
}

export function setAnimalForm(animal) {
  gameState.character.currentAnimal = animal;
  emit('transformChange', animal);
}

export function addVisitedDestination(destId) {
  if (!gameState.travel.visited.includes(destId)) {
    gameState.travel.visited.push(destId);
  }
}

export function resetState() {
  gameState.meta = { version: 1, createdAt: '', lastPlayed: '' };
  gameState.character = { name: '', gender: 'boy', avatar: '🧑', skinColor: '', hairStyle: '', currentAnimal: null };
  gameState.stats = { money: 500, energy: 100, happiness: 80, hunger: 80 };
  gameState.time = { day: 1, hour: 8 };
  gameState.profession = { current: null, level: 1, experience: 0 };
  gameState.inventory = { car: null, house: null, pets: [] };
  gameState.social = { friends: [], partner: null, children: [] };
  gameState.travel = { visited: [] };
  gameState.flags = { introSeen: false, characterCreated: false, firstWorkDone: false };
}
