# APC - Схема состояния игры

## gameState

```javascript
{
  meta: {
    version: 1,              // Версия формата сохранения
    createdAt: '',            // ISO дата создания
    lastPlayed: ''            // ISO дата последней игры
  },

  character: {
    name: '',                 // Имя игрока (до 20 символов)
    gender: 'boy',            // 'boy' | 'girl'
    avatar: '🧑',             // Emoji-аватар
    skinColor: '',            // Зарезервировано
    hairStyle: '',            // Зарезервировано
    currentAnimal: null       // null | { id, emoji, name, ability }
  },

  stats: {
    money: 500,               // APC — игровая валюта (0..∞)
    energy: 100,              // Энергия (0..100), тратится на работу
    happiness: 80,            // Счастье (0..100), падает от голода
    hunger: 80                // Сытость (0..100), постоянно убывает
  },

  time: {
    day: 1,                   // Игровой день (1..∞)
    hour: 8                   // Час (0..23), 3 реальных сек = 1 час
  },

  profession: {
    current: null,            // ID профессии: 'doctor'|'chef'|'programmer'|null
    level: 1,                 // Уровень (1..∞)
    experience: 0             // Опыт (0..level*100, обнуляется при повышении)
  },

  inventory: {
    car: null,                // null | { id, emoji, name }
    house: null,              // null | { id, emoji, name, rooms: string[] }
    pets: []                  // [{ id, type, name, emoji, hunger, happiness, cleanliness }]
  },

  social: {
    friends: [],              // [{ id, name, emoji, level }] — макс. 5
    partner: null,            // null | { name, emoji, stage, relationship }
    children: []              // [{ name, emoji, age }] — макс. 3
  },

  travel: {
    visited: []               // ['sea', 'mountains'] — ID посещённых мест
  },

  flags: {
    introSeen: false,         // Показано приветствие от папы
    characterCreated: false,  // Персонаж создан
    firstWorkDone: false      // Первая смена отработана
  }
}
```

## Хелперы мутаций (state.js)

| Функция | Что делает |
|---------|-----------|
| `addMoney(amount)` | Добавляет деньги, emit statsChange |
| `spendMoney(amount)` | Списывает деньги, возвращает false если не хватает |
| `canAfford(amount)` | Проверяет достаточно ли денег |
| `changeStat(stat, delta)` | Изменяет стат (clamp 0..100), emit statsChange |
| `setCharacter(data)` | Обновляет данные персонажа |
| `setProfession(profId)` | Устанавливает профессию (сброс уровня/опыта) |
| `addExperience(amount)` | Добавляет опыт, автоповышение уровня |
| `setCar(car)` | Устанавливает машину |
| `setHouse(house)` | Устанавливает дом |
| `addPet(pet)` | Добавляет питомца |
| `updatePet(petId, updates)` | Обновляет статы питомца |
| `addFriend(friend)` | Добавляет друга (макс. 5), возвращает bool |
| `setPartner(partner)` | Устанавливает/обновляет партнёра |
| `addChild(child)` | Добавляет ребёнка |
| `setAnimalForm(animal)` | Превращает в животное (null — обратно) |
| `addVisitedDestination(id)` | Отмечает место как посещённое |
| `resetState()` | Полный сброс до начальных значений |

## События (event emitter)

| Событие | Когда срабатывает |
|---------|------------------|
| `statsChange` | Изменение money/energy/happiness/hunger |
| `characterChange` | Изменение данных персонажа |
| `professionChange` | Смена профессии |
| `levelUp` | Повышение уровня |
| `inventoryChange` | Покупка машины/дома/питомца |
| `petChange` | Обновление статов питомца |
| `socialChange` | Изменение друзей/партнёра/детей |
| `transformChange` | Превращение в животное |
| `timeChange` | Каждый тик времени |
| `newDay` | Наступление нового дня |
| `yearPassed` | Прошёл игровой год (30 дней) |

## Сохранение (storage.js)

- Формат: JSON в localStorage, ключ `apc_save`
- Авто-сохранение: каждые 30 секунд
- Сохранение при переходе между сценами
- Deep merge при загрузке (совместимость со старыми сохранениями)
- `hasSave()` — проверяет наличие сохранения
- `clearSave()` — удаляет сохранение

## Игровые данные (data.js)

### Профессии
| ID | Название | Оплата | Энергия | Мини-игра |
|----|----------|--------|---------|-----------|
| doctor | Врач 🩺 | 50 APC | 15 ⚡ | Тапай по 🦠 (8 целей, 15 сек) |
| chef | Повар 👨‍🍳 | 40 APC | 12 ⚡ | Тапай по 🥕 (7 целей, 15 сек) |
| programmer | Программист 💻 | 60 APC | 10 ⚡ | Тапай по 🐛 (10 целей, 15 сек) |

### Машины
| ID | Название | Цена |
|----|----------|------|
| bicycle | Велосипед 🚲 | 100 APC |
| car | Автомобиль 🚗 | 500 APC |
| sportscar | Спорткар 🏎️ | 2000 APC |

### Дома (trade-in = 50% от цены старого)
| ID | Название | Цена | Комнаты |
|----|----------|------|---------|
| apartment | Квартира 🏢 | 300 APC | Спальня, Кухня |
| house | Дом 🏠 | 1500 APC | Спальня, Кухня, Гостиная, Сад |
| mansion | Особняк 🏰 | 5000 APC | Спальня, Кухня, Гостиная, Бассейн, Игровая, Сад |

### Питомцы
| ID | Название | Цена | Особенности |
|----|----------|------|-------------|
| guinea_pig | Морская свинка 🐹 | 150 APC | Золотая рамка, особые сообщения |
| cat | Кот 🐱 | 200 APC | |
| dog | Собака 🐶 | 250 APC | |
| parrot | Попугай 🦜 | 180 APC | |

### Путешествия
| ID | Название | Цена | Активности |
|----|----------|------|------------|
| sea | Море 🏖️ | 300 APC | Купаться, Ракушки, Загорать, Замок из песка |
| mountains | Горы ⛰️ | 400 APC | Поход, Костёр, Фото, Звёзды |

### Превращения (100 APC каждое)
🐱 Кот, 🐶 Собака, 🐦 Птица, 🐟 Рыба, 🐰 Кролик, 🐹 Морская свинка (пасхалка)
