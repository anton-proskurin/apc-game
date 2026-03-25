// data.js — All game data catalogs

export const AVATARS = {
  boy: ['🧑', '👦', '🧒', '👱‍♂️', '👨‍🦱', '👨‍🦰'],
  girl: ['👧', '👩', '👱‍♀️', '👩‍🦱', '👩‍🦰', '🧑‍🦱']
};

export const PROFESSIONS = [
  {
    id: 'doctor',
    name: 'Врач',
    emoji: '🩺',
    desc: 'Лечи пациентов и спасай жизни!',
    basePay: 50,
    energyCost: 15,
    minigame: {
      instruction: 'Тапай по больным клеткам, чтобы вылечить пациента!',
      targetEmoji: '🦠',
      hitEmoji: '💊',
      duration: 15,
      targetScore: 8
    }
  },
  {
    id: 'chef',
    name: 'Повар',
    emoji: '👨‍🍳',
    desc: 'Готовь вкусные блюда для гостей!',
    basePay: 40,
    energyCost: 12,
    minigame: {
      instruction: 'Тапай по ингредиентам в нужном порядке!',
      targetEmoji: '🥕',
      hitEmoji: '✨',
      duration: 15,
      targetScore: 7
    }
  },
  {
    id: 'programmer',
    name: 'Программист',
    emoji: '💻',
    desc: 'Пиши код и исправляй баги!',
    basePay: 60,
    energyCost: 10,
    minigame: {
      instruction: 'Лови и уничтожай баги в коде!',
      targetEmoji: '🐛',
      hitEmoji: '💥',
      duration: 15,
      targetScore: 10
    }
  }
];

export const CARS = [
  {
    id: 'bicycle',
    name: 'Велосипед',
    emoji: '🚲',
    price: 100,
    desc: 'Крути педали и наслаждайся ветром!',
    speed: 1
  },
  {
    id: 'car',
    name: 'Автомобиль',
    emoji: '🚗',
    price: 500,
    desc: 'Надёжная машина для города.',
    speed: 2
  },
  {
    id: 'sportscar',
    name: 'Спорткар',
    emoji: '🏎️',
    price: 2000,
    desc: 'Самый быстрый автомобиль в городе!',
    speed: 3
  }
];

export const HOUSES = [
  {
    id: 'apartment',
    name: 'Квартира',
    emoji: '🏢',
    price: 300,
    desc: 'Уютная квартира в центре города.',
    rooms: ['🛏️ Спальня', '🍳 Кухня']
  },
  {
    id: 'house',
    name: 'Дом',
    emoji: '🏠',
    price: 1500,
    desc: 'Просторный дом с садом.',
    rooms: ['🛏️ Спальня', '🍳 Кухня', '🛋️ Гостиная', '🌿 Сад']
  },
  {
    id: 'mansion',
    name: 'Особняк',
    emoji: '🏰',
    price: 5000,
    desc: 'Роскошный особняк мечты!',
    rooms: ['🛏️ Спальня', '🍳 Кухня', '🛋️ Гостиная', '🏊 Бассейн', '🎮 Игровая', '🌿 Сад']
  }
];

export const PETS = [
  {
    id: 'guinea_pig',
    type: 'guinea_pig',
    name: 'Морская свинка',
    emoji: '🐹',
    price: 150,
    desc: 'Пушистая и милая! Пищит от радости!',
    defaultName: 'Пушок',
    sounds: ['Уи-уи-уи! 🐹', 'Пи-пи-пи! 🎵', 'Фыр-фыр! 😊']
  },
  {
    id: 'cat',
    type: 'cat',
    name: 'Кот',
    emoji: '🐱',
    price: 200,
    desc: 'Мурлыкает и любит спать на коленях.',
    defaultName: 'Мурзик',
    sounds: ['Мяу! 🐱', 'Мур-мур-мур! 😻', 'Мрр! 💤']
  },
  {
    id: 'dog',
    type: 'dog',
    name: 'Собака',
    emoji: '🐶',
    price: 250,
    desc: 'Верный друг, который всегда рад тебе!',
    defaultName: 'Бобик',
    sounds: ['Гав-гав! 🐶', 'Вуф! 🦴', 'Р-р-гав! 🎾']
  },
  {
    id: 'parrot',
    type: 'parrot',
    name: 'Попугай',
    emoji: '🦜',
    price: 180,
    desc: 'Яркий и говорящий! Повторяет слова.',
    defaultName: 'Кеша',
    sounds: ['Кеша хороший! 🦜', 'Привет-привет! 👋', 'Пиастры! 💰']
  }
];

export const RESTAURANTS = [
  {
    id: 'fastfood',
    name: 'Фастфуд',
    emoji: '🍔',
    desc: 'Быстро и вкусно!',
    menu: [
      { name: 'Бургер', emoji: '🍔', price: 15, hungerBoost: 20, happinessBoost: 5 },
      { name: 'Картошка фри', emoji: '🍟', price: 10, hungerBoost: 15, happinessBoost: 3 },
      { name: 'Кола', emoji: '🥤', price: 5, hungerBoost: 5, happinessBoost: 5 }
    ]
  },
  {
    id: 'cafe',
    name: 'Кафе',
    emoji: '🍕',
    desc: 'Уютное место для обеда.',
    menu: [
      { name: 'Пицца', emoji: '🍕', price: 30, hungerBoost: 30, happinessBoost: 10 },
      { name: 'Паста', emoji: '🍝', price: 35, hungerBoost: 35, happinessBoost: 12 },
      { name: 'Торт', emoji: '🍰', price: 25, hungerBoost: 15, happinessBoost: 20 }
    ]
  },
  {
    id: 'restaurant',
    name: 'Ресторан',
    emoji: '🍽️',
    desc: 'Изысканная кухня!',
    menu: [
      { name: 'Стейк', emoji: '🥩', price: 80, hungerBoost: 50, happinessBoost: 25 },
      { name: 'Суши', emoji: '🍣', price: 70, hungerBoost: 40, happinessBoost: 30 },
      { name: 'Десерт', emoji: '🍮', price: 50, hungerBoost: 20, happinessBoost: 35 }
    ]
  }
];

export const TRAVEL_DESTINATIONS = [
  {
    id: 'sea',
    name: 'Море',
    emoji: '🏖️',
    price: 300,
    desc: 'Солнце, песок и тёплое море!',
    bgEmoji: '🌊',
    activities: [
      { name: 'Купаться', emoji: '🏊', happinessBoost: 25, energyCost: 10 },
      { name: 'Собирать ракушки', emoji: '🐚', happinessBoost: 15, energyCost: 5 },
      { name: 'Загорать', emoji: '☀️', happinessBoost: 20, energyCost: 0 },
      { name: 'Строить замок из песка', emoji: '🏰', happinessBoost: 30, energyCost: 15 }
    ],
    duration: 3  // game days
  },
  {
    id: 'mountains',
    name: 'Горы',
    emoji: '⛰️',
    price: 400,
    desc: 'Свежий воздух и невероятные виды!',
    bgEmoji: '🏔️',
    activities: [
      { name: 'Поход', emoji: '🥾', happinessBoost: 25, energyCost: 20 },
      { name: 'Развести костёр', emoji: '🔥', happinessBoost: 20, energyCost: 5 },
      { name: 'Фотографировать', emoji: '📸', happinessBoost: 15, energyCost: 5 },
      { name: 'Наблюдать звёзды', emoji: '⭐', happinessBoost: 30, energyCost: 0 }
    ],
    duration: 3
  }
];

export const ANIMALS = [
  { id: 'cat', name: 'Кот', emoji: '🐱', desc: 'Лазай по крышам и мурлыкай!', ability: 'Видишь город с высоты!' },
  { id: 'dog', name: 'Собака', emoji: '🐶', desc: 'Бегай быстро и играй!', ability: 'Бегаешь быстрее всех!' },
  { id: 'bird', name: 'Птица', emoji: '🐦', desc: 'Лети высоко в небе!', ability: 'Летаешь над городом!' },
  { id: 'fish', name: 'Рыба', emoji: '🐟', desc: 'Плавай в глубинах океана!', ability: 'Дышишь под водой!' },
  { id: 'rabbit', name: 'Кролик', emoji: '🐰', desc: 'Прыгай по лугам!', ability: 'Прыгаешь очень высоко!' },
  { id: 'guinea_pig', name: 'Морская свинка', emoji: '🐹', desc: 'Стань маленьким и пушистым!', ability: 'Все тебя обожают!' }
];

export const NPC_NAMES = {
  boy: ['Алёша', 'Дима', 'Петя', 'Ваня', 'Коля', 'Миша', 'Саша', 'Серёжа', 'Вова', 'Федя'],
  girl: ['Маша', 'Даша', 'Катя', 'Аня', 'Оля', 'Света', 'Наташа', 'Лена', 'Таня', 'Юля']
};

export const NPC_AVATARS = {
  boy: ['👦', '🧑', '👱‍♂️', '🧒'],
  girl: ['👧', '👩', '👱‍♀️', '🧑‍🦱']
};

export const DIALOGUE_TOPICS = [
  { question: 'Привет! Хочешь дружить?', positiveReply: 'Конечно! Давай дружить!', gain: 15 },
  { question: 'Расскажи анекдот!', positiveReply: 'Ха-ха, вот это смешно!', gain: 10 },
  { question: 'Какое у тебя хобби?', positiveReply: 'Мне тоже это нравится!', gain: 12 },
  { question: 'Пойдём гулять вместе?', positiveReply: 'С удовольствием!', gain: 20 },
  { question: 'У тебя классный стиль!', positiveReply: 'Спасибо, ты тоже крутой!', gain: 8 }
];

export const PARTNER_STAGES = {
  dating: { name: 'Встречаетесь', emoji: '💕', nextThreshold: 80 },
  engaged: { name: 'Помолвлены', emoji: '💍', nextThreshold: 100 },
  married: { name: 'В браке', emoji: '💒', nextThreshold: null }
};

export const CHILD_NAMES = {
  boy: ['Артём', 'Максим', 'Лёша', 'Егор', 'Тимофей'],
  girl: ['Алиса', 'Мила', 'Соня', 'Ева', 'Полина']
};
