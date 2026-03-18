---
name: game-dev
description: >
  Скилл для разработки качественных игр — с мотивационной системой, итеративной верификацией,
  антихалтурными правилами и полным циклом от концепта до полировки.
  Используй ОБЯЗАТЕЛЬНО, когда пользователь просит создать игру, сделать игру,
  разработать game, геймдев, написать игровой проект, собрать игру, game development.
  Триггеры: «создай игру», «сделай игру», «напиши игру», «game», «геймдев»,
  «game development», «Phaser», «Canvas игра», «игровой проект», «аркада», «платформер»,
  «флеппи берд», «тетрис», «змейка», «шутер», «RPG», «puzzle game», «2D игра».
---

# Game Development Skill

Скилл для создания **качественных, полноценных игр** — не прототипов, не MVP,
а продуктов, в которые реально хочется играть.

> ### 🎯 Миссия
>
> Ты создаёшь **игру, которую человек захочет показать друзьям**.
> Не «техническое демо с прямоугольниками», не «заскриптованный hello world» —
> а продукт с душой: плавными анимациями, feedback на каждое действие,
> нарастающей сложностью и эффектом «ещё один раунд».
>
> **Твоя роль:** ты — опытный геймдев, который знает: геймплей > графика > код.
> Ты не пишешь код ради кода — ты создаёшь **опыт**. Каждый пиксель анимации,
> каждый звуковой эффект, каждая микросекунда отклика — всё работает на одну цель:
> **игрок не может оторваться**.
>
> **Контракт качества:** после каждой фазы разработки — обязательная верификация.
> Игра будет протестирована в браузере, проверена скриптом валидации,
> и оценена по 10+ критериям. Халтура будет обнаружена и потребует переделки.
> Экономически выгоднее сделать качественно с первого раза.
>
> **Признак хорошей работы:** игрок забывает, что это «проект для портфолио»,
> и начинает играть всерьёз — бьёт свой рекорд, ищет секреты, зовёт друзей посмотреть.

---

## 1. Когда использовать этот скилл

- Создание новой игры (любой жанр, любая платформа)
- Улучшение / полировка существующей игры
- Добавление систем (магазин, достижения, боссы, power-ups)
- Оптимизация производительности игры
- Создание процедурных ассетов (без внешних файлов)

> **НЕ** используй для:
> - Статических веб-сайтов без интерактивности
> - Обучающих тренажёров (для этого — practice-bundle-gen)
> - Виджетов / утилитных компонентов

---

## 2. Столпы качественной игры

Каждая игра оценивается по **5 столпам**. КАЖДЫЙ должен быть проработан:

| Столп | Что значит | Влияние на игрока |
|-------|-----------|-------------------|
| 🎮 **Game Feel** | Мгновенный отклик, screen shake, particles, juice | «Вау, как приятно играть» |
| 📈 **Progression** | Нарастающая сложность, новые элементы, цели | «Хочу дойти до конца» |
| 💎 **Visual Polish** | Анимации, эффекты, UI, единый стиль | «Выглядит как настоящая игра» |
| 🔊 **Audio Feedback** | Звуки действий, музыка, UI-feedback | «Каждое действие ощущается» |
| 🏆 **Meta Systems** | Очки, достижения, рекорды, разблокировки | «Ещё один раунд!» |

> ⚠️ **Любой столп с оценкой <6/10 = игра незакончена.** Нельзя отгружать игру
> с отличным геймплеем, но без визуальной полировки — это прототип, не продукт.

---

## 3. Фазы разработки

Игра создаётся в **6 фаз**. Каждая фаза заканчивается **gate-проверкой** (§7).
Нельзя переходить к следующей фазе без прохождения gate текущей.

### Фаза 0: Концепт и Архитектура

**Цель:** определить ЧТО строим и КАК.

1. **Определи жанр и core loop:**
   - Какое ОДНО действие игрок повторяет? (прыжок, удар, размещение)
   - За что даются очки?
   - Что создаёт challenge?

2. **Выбери технологический стек:**

   | Сценарий | Рекомендация |
   |----------|-------------|
   | 2D-аркада, простая физика | **Canvas API + vanilla JS** |
   | 2D с физикой, спрайтами, камерой | **Phaser 3** |
   | 3D или сложная графика | **Three.js** |
   | Десктопная сборка | **Tauri + Vite** (НЕ Electron!) |

3. **Спроектируй архитектуру:**

   ```
   src/
   ├── core/           # Game loop, state machine, input
   │   ├── Game.js     # Главный класс, состояния (MENU/PLAY/PAUSE/OVER)
   │   ├── Input.js    # Обработка ввода (клавиатура, тач, мышь)
   │   └── Config.js   # Все числовые константы (скорости, размеры, баланс)
   ├── entities/       # Игровые объекты
   │   ├── Player.js   # Игрок (движение, хитбокс, анимация)
   │   ├── Enemy.js    # Враги (паттерны, ИИ, спавн)
   │   └── ...
   ├── systems/        # Игровые системы
   │   ├── Physics.js  # Столкновения, гравитация
   │   ├── Spawner.js  # Генерация препятствий/врагов
   │   ├── Score.js    # Подсчёт очков, мультипликаторы
   │   └── Particles.js# Частицы и эффекты
   ├── ui/             # Интерфейс
   │   ├── HUD.js      # Счёт, жизни, power-ups
   │   ├── Menu.js     # Главное меню
   │   └── Shop.js     # Магазин (если есть)
   ├── audio/          # Звуковой менеджер
   │   └── AudioManager.js  # Web Audio API, процедурные звуки
   ├── graphics/       # Процедурная графика
   │   ├── Renderer.js # Основной рендерер
   │   └── Assets.js   # Процедурная генерация спрайтов
   └── data/           # Баланс, уровни, конфигурация
       ├── levels.js   # Параметры уровней/волн
       └── achievements.js  # Определения достижений
   ```

4. **Определи Config.js — ВСЕ числа в одном месте:**

   ```javascript
   // ✅ ПРАВИЛЬНО — все параметры централизованы
   export const CONFIG = {
     PLAYER: {
       SPEED: 300,
       JUMP_FORCE: -450,
       GRAVITY: 980,
       HITBOX: { width: 28, height: 32 }
     },
     DIFFICULTY: {
       INITIAL_SPEED: 200,
       SPEED_INCREMENT: 15,     // за каждые 10 очков
       MAX_SPEED: 500,
       GAP_SIZE: { min: 120, max: 180 },
       SPAWN_INTERVAL: { min: 1200, max: 2000 }
     },
     SCORING: {
       BASE_POINTS: 10,
       COMBO_MULTIPLIER: 1.5,
       COMBO_TIMEOUT: 2000
     }
   };
   
   // ❌ ЗАПРЕЩЕНО — магические числа в коде
   // this.velocity.y += 980 * dt;
   // if (score > 100) speed += 15;
   ```

> **GATE 0:** Есть ли концепт-документ с core loop, стеком, архитектурой?
> Все ли числовые параметры вынесены в Config? → Фаза 1.

---

### Фаза 1: Core Mechanics (ядро геймплея)

**Цель:** одно ядровое действие работает ИДЕАЛЬНО.

> ⚠️ Это САМАЯ ВАЖНАЯ фаза. Если core mechanic не вызывает «вау» — никакие
> эффекты и системы не спасут игру. Потрать 40% всего времени здесь.

1. **Input → Response за < 1 кадр:**
   - Нажал кнопку → МГНОВЕННАЯ реакция (не через 1-2 кадра)
   - Каждый ввод должен иметь visual + audio feedback

2. **Физика чувствуется «правильно»:**
   - Кривые ускорения, а не линейное движение
   - Coyote time (5-8 кадров для платформеров)
   - Input buffering (запомнить нажатие на 3-5 кадров вперёд)

3. **Хитбоксы FAIR:**
   - Хитбокс игрока ~80% визуального размера (benefit of the doubt)
   - Хитбокс врагов = 100% визуального размера
   - **ВСЕГДА** тестируй: включи debug-отрисовку хитбоксов

4. **Game loop стабилен:**
   ```javascript
   // ✅ Delta-time based — работает одинаково на 30fps и 144fps
   update(dt) {
     this.x += this.speed * dt;
   }
   
   // ❌ ЗАПРЕЩЕНО — зависимость от fps
   update() {
     this.x += this.speed;
   }
   ```

5. **State machine для состояния игры:**
   ```javascript
   // MENU → PLAY → PAUSE (toggle) → GAME_OVER → MENU
   // Каждое состояние обрабатывает СВОЙ ввод и СВОЙ рендер
   ```

> **GATE 1:** Играешь 30 секунд голый core mechanic (без UI, без врагов, без очков).
> Физически приятно? Отклик мгновенный? Хочется продолжать? → Фаза 2.

---

### Фаза 2: Content & Progression (контент и развитие)

**Цель:** от «приятно нажимать» к «хочу дойти до конца».

1. **Кривая сложности — ВСЕГДА S-образная:**
   ```
   Сложность
   │         ╭──── «Потолок» (cap, чтобы не было невозможно)
   │       ╭─╯
   │     ╭─╯       ← рост ускоряется
   │   ╭─╯
   │ ╭─╯           ← плавный старт (первые 30 сек — обучение)
   │╭╯
   └──────────────── Время
   ```

2. **Разнообразие через комбинаторику:**
   - Не 50 уникальных врагов — а 5 типов × 3 поведения × 3 скорости
   - Паттерны спавна (волны, коридоры, ловушки) — из Config, не хардкод

3. **Обязательные элементы прогрессии:**

   | Элемент | Когда появляется | Пример |
   |---------|-----------------|--------|
   | Новый тип врага/препятствия | каждые 500-1000 очков | Движущиеся трубы |
   | Power-up | каждые 30-60 сек | Щит, замедление, магнит |
   | Визуальная смена | каждые 2000 очков | Новый фон/палитра |
   | Мини-босс (если жанр позволяет) | каждые 5000 очков | Особый враг |

4. **Процедурная генерация контента:**
   - Уровни/препятствия генерируются алгоритмически
   - Seed-based для воспроизводимости (debug, replay)
   - Гарантия проходимости: алгоритм ВСЕГДА оставляет путь

> **GATE 2:** 3 минуты непрерывной игры. Появляется ли что-то новое?
> Сложность растёт плавно? Есть ли «ещё один шанс» мотивация? → Фаза 3.

---

### Фаза 3: Game Feel & Juice (ощущения и сок)

**Цель:** превратить «работающий код» в «приятный опыт».

> 🧠 **Правило 80/20:** 80% ощущения «качества» создают НЕ механики, а JUICE.
> Screen shake, particles, slow-mo, звуки — это то, что отличает «студентку»
> от «игры из Steam».

1. **Screen Shake (тряска экрана):**
   ```javascript
   // При столкновении, смерти, взрыве
   screenShake(intensity = 5, duration = 200) {
     // Случайное смещение камеры, затухающее за duration
     // intensity 3-5 для лёгких событий, 8-12 для важных
   }
   ```

2. **Particles (частицы):**
   - Смерть → взрыв частиц (15-30 частиц, рандомные вектора)
   - Очки → floating text (+10) с fade-out
   - Trail — след за игроком при движении
   - Particle pooling — переиспользуй объекты, не создавай новые!

3. **Time Effects:**
   - Hit-stop (freeze-frame 50-100ms при ударе)
   - Slow-mo при near-miss (0.3x на 300ms)
   - Speed lines при ускорении

4. **Tweens и Easing:**
   ```javascript
   // ✅ Всё что появляется/исчезает — через easing
   // easeOutBack для UI-элементов (пружинистое появление)
   // easeOutCubic для физических объектов
   // easeInQuart для падения
   
   // ❌ ЗАПРЕЩЕНО: мгновенное появление/исчезновение
   // element.visible = true; // БЕЗ анимации — моветон
   ```

5. **Camera Work:**
   - Плавное следование за игроком (lerp 0.1)
   - Zoom-in при важных событиях
   - Look-ahead — камера сдвигается в направлении движения

6. **Feedback на КАЖДОЕ действие игрока:**

   | Действие | Visual | Audio | Haptic (если есть) |
   |----------|--------|-------|---------|
   | Прыжок | Squash & stretch | «whoosh» | Лёгкая вибрация |
   | Столкновение | Flash + shake | «crunch» | Средняя вибрация |
   | Получение очка | Floating text + glow | «ding» | — |
   | Смерть | Slow-mo + particles | Грустный звук | Длинная вибрация |
   | Power-up | Glow aura + scale up | Восходящая нота | — |

> **GATE 3:** Запиши 10 секунд gameplay. Выключи звук. Смотри БЕЗ ЗВУКА.
> Каждое действие понятно? Каждое событие имеет visual feedback? → Фаза 4.

---

### Фаза 4: Meta Systems (мета-системы)

**Цель:** причины вернуться в игру после game over.

1. **Score System (обязательно):**
   ```javascript
   // Базовое очки + комбо-мультипликатор + бонусы
   const points = BASE_POINTS * comboMultiplier * difficultyBonus;
   // High score сохраняется в localStorage
   // Floating score text при получении очков
   ```

2. **Achievements (рекомендуется):**
   ```javascript
   const ACHIEVEMENTS = [
     { id: 'first_blood', title: 'Первый полёт', desc: 'Набери 10 очков', check: s => s.score >= 10 },
     { id: 'centurion', title: 'Сотня', desc: 'Набери 100 очков', check: s => s.score >= 100 },
     { id: 'survivor', title: 'Выживший', desc: 'Играй 60 секунд', check: s => s.time >= 60 },
     { id: 'near_miss', title: 'На волоске', desc: 'Пролети в 5px от препятствия', check: s => s.nearMiss },
     { id: 'combo_master', title: 'Комбо-мастер', desc: '10x combo', check: s => s.maxCombo >= 10 },
   ];
   // Визуал: toast-нотификация + звук + запись в localStorage
   ```

3. **Shop / Unlockables (для крупных проектов):**
   - Валюта = набранные очки (НЕ отдельная)
   - Скины, цветовые схемы, trail-эффекты
   - Каждый апгрейд визуально заметен
   - Прогресс-бар к следующему разблокированию

4. **Persistence (сохранение):**
   ```javascript
   // Минимум: high score + unlocked achievements
   // Лучше: coins, skins, settings (volume, controls)
   // localStorage с JSON.parse/stringify
   // При первом запуске — defaults из Config
   ```

> **GATE 4:** После game over — есть ли ПРИЧИНА нажать «Ещё раз»?
> Показан ли high score? Есть ли «почти достижение»? → Фаза 5.

---

### Фаза 5: Visual & Audio Polish (полировка)

**Цель:** игра ВЫГЛЯДИТ и ЗВУЧИТ профессионально.

1. **Процедурная графика (если нет внешних ассетов):**
   ```javascript
   // Генерация спрайтов через canvas offscreen
   function generatePlayerSprite() {
     const c = document.createElement('canvas');
     c.width = 32; c.height = 32;
     const ctx = c.getContext('2d');
     // Рисуем персонажа: тело, глаза, детали
     // Возвращаем Image/Canvas для отрисовки
     return c;
   }
   // Анимации: набор из 3-5 спрайтов (idle, move, jump, hurt, special)
   ```

2. **UI Design Principles:**
   - **Glassmorphism** для меню: полупрозрачные панели + blur
   - **Шрифт**: Google Fonts (Inter, Outfit, Orbitron для sci-fi)
   - **Палитра**: гармоничная (HSL), не «красный-синий-зелёный»
   - **Анимации UI**: easeOutBack для появления, easeInQuad для исчезновения
   - **Без browser defaults**: кастомные кнопки, скроллбары, selection = none

3. **Звук через Web Audio API:**
   ```javascript
   // Процедурная генерация звуков — БЕЗ внешних файлов
   function playJumpSound() {
     const ctx = new AudioContext();
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     osc.connect(gain).connect(ctx.destination);
     osc.frequency.setValueAtTime(300, ctx.currentTime);
     osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
     gain.gain.setValueAtTime(0.3, ctx.currentTime);
     gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
     osc.start(); osc.stop(ctx.currentTime + 0.15);
   }
   // Звуки: прыжок (↑pitch), удар (noise+↓pitch), очко (chord), смерть (↓pitch long)
   ```

4. **Background & Parallax:**
   - Минимум 2 слоя параллакса (фон + средний план)
   - Цветовые переходы фона по мере прогресса
   - Звёзды / облака / элементы — рандомно, но красиво

5. **Responsive Design:**
   - Canvas масштабируется под окно (maintain aspect ratio)
   - Touch-support для мобильных (touch events + button zones)
   - UI перестраивается под маленькие экраны

> **GATE 5:** Покажи скриншот игры незнакомцу. Спроси: «Заплатишь $1?»
> Если «нет» — полировка неготова. → Фаза 6.

---

### Фаза 6: Testing & Optimization (тестирование и оптимизация)

**Цель:** игра работает стабильно, без багов, на любом устройстве.

1. **Performance Targets:**

   | Метрика | Минимум | Цель |
   |---------|---------|------|
   | FPS (desktop) | 55 | 60 стабильных |
   | FPS (mobile) | 30 | 45+ |
   | Memory leaks | 0 | 0 |
   | Load time | < 3s | < 1s |
   | Bundle size | < 10MB | < 2MB |

2. **Object Pooling (ОБЯЗАТЕЛЬНО):**
   ```javascript
   // Для ВСЕГО что создаётся часто: пули, частицы, враги, текст
   class Pool {
     constructor(factory, initialSize = 20) {
       this.pool = Array.from({ length: initialSize }, factory);
     }
     get() { return this.pool.pop() || this.factory(); }
     release(obj) { obj.reset(); this.pool.push(obj); }
   }
   // ❌ НИКОГДА: new Particle() в каждом кадре
   ```

3. **Memory Management:**
   - Очищай таймеры (clearTimeout/clearInterval) при смене состояния
   - Удаляй event listeners при destroy
   - Обнуляй ссылки на крупные объекты
   - Профилируй: `performance.memory` (Chrome)

4. **Edge Cases:**
   - Что если игрок ничего не делает? (idle → подсказка, AI demo)
   - Что если tab теряет фокус? (пауза!)
   - Что если resize окна во время игры? (адаптация)
   - Что если localStorage заполнен? (graceful fallback)
   - Что если AudioContext не разрешён? (работай без звука)

5. **Accessibility:**
   - Высокий контраст (WCAG AA minimum)
   - Клавиатурное управление + mouse + touch
   - Пауза в любой момент
   - Настройки: звук, сложность, визуальные эффекты

> **GATE 6:** Играй 5 минут без остановки. 0 крашей? FPS стабильный?
> Tab-out/tab-in работает? Resize? → Игра готова к release.

---

## 4. ЗОЛОТЫЕ ПРАВИЛА КОДА

> ⚠️ **Нарушение любого из этих правил = баг, который обязательно вылезет.**

### 4.1 Никаких магических чисел

```javascript
// ❌ ЗАПРЕЩЕНО
if (this.y > 600) this.die();
this.speed += 0.5;
ctx.fillStyle = '#ff0000';

// ✅ ОБЯЗАТЕЛЬНО
if (this.y > CONFIG.WORLD.HEIGHT) this.die();
this.speed += CONFIG.DIFFICULTY.SPEED_INCREMENT * dt;
ctx.fillStyle = CONFIG.COLORS.DANGER;
```

### 4.2 Delta-time ВЕЗДЕ

```javascript
// ❌ ЗАПРЕЩЕНО — fps-зависимо
this.x += 5;
this.rotation += 0.1;

// ✅ ОБЯЗАТЕЛЬНО
this.x += this.speed * dt;
this.rotation += this.rotationSpeed * dt;
```

### 4.3 State Machine для состояния игры

```javascript
// ❌ ЗАПРЕЩЕНО — boolean hell
if (isPlaying && !isPaused && !isGameOver && !isInMenu && !isInShop) { ... }

// ✅ ОБЯЗАТЕЛЬНО
switch (this.state) {
  case 'MENU': this.updateMenu(dt); break;
  case 'PLAYING': this.updateGame(dt); break;
  case 'PAUSED': /* ничего */ break;
  case 'GAME_OVER': this.updateGameOver(dt); break;
}
```

### 4.4 Separation of Concerns

```javascript
// ❌ ЗАПРЕЩЕНО — God Object
class Game {
  // 2000 строк: рендер + физика + UI + звук + ввод + сохранение
}

// ✅ ОБЯЗАТЕЛЬНО — модули
class Game { /* только state + game loop */ }
class Renderer { /* только рисование */ }
class Physics { /* только столкновения */ }
class InputManager { /* только ввод */ }
class AudioManager { /* только звук */ }
```

### 4.5 Event System для коммуникации

```javascript
// Классы не вызывают друг друга напрямую — общаются через события
class EventBus {
  constructor() { this.listeners = {}; }
  on(event, callback) { (this.listeners[event] ??= []).push(callback); }
  emit(event, data) { (this.listeners[event] || []).forEach(cb => cb(data)); }
}

// Player.js
this.events.emit('player:died', { score, position });

// AudioManager.js
this.events.on('player:died', () => this.play('death'));

// Particles.js
this.events.on('player:died', ({ position }) => this.explode(position));
```

### 4.6 Graceful Degradation

```javascript
// Звук может быть заблокирован
let audioCtx;
try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
catch(e) { console.warn('Audio не поддерживается'); }

// localStorage может быть недоступен
function saveData(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); }
  catch(e) { console.warn('Не удалось сохранить:', key); }
}
```

---

## 5. АНТИХАЛТУРНЫЕ ПРАВИЛА

> ⚠️ При большом объёме кода LLM склонны к деградации качества.
> Эти правила предотвращают типичные проблемы.

### 5.1 Правило «Ни одного TODO»

```javascript
// ❌ КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО в финальном коде
// TODO: добавить анимацию
// TODO: реализовать позже
// FIXME: временное решение
// HACK: обойти баг

// ✅ ОБЯЗАТЕЛЬНО: каждый feature реализован ДО перехода к следующему
```

### 5.2 Правило «Ни одного placeholder»

```javascript
// ❌ ЗАПРЕЩЕНО
ctx.fillRect(x, y, 32, 32); // «потом добавлю спрайт»
ctx.fillStyle = 'red'; // «потом выберу цвет»
// playSound(); // «потом добавлю звук»

// ✅ ОБЯЗАТЕЛЬНО: каждый элемент нарисован, раскрашен, озвучен
drawPlayer(ctx) {
  // Детализированная процедурная отрисовка с анимацией
  ctx.save();
  // ... тело, глаза, крылья, shadow, trail
  ctx.restore();
}
```

### 5.3 Правило «Каждая система работает»

Если добавил систему (очки, достижения, магазин) — она ПОЛНОСТЬЮ работает:
- UI рендерится
- Данные сохраняются/загружаются
- Визуальный feedback при изменении
- Edge cases обработаны

### 5.4 Правило «Последний файл такого же качества»

При генерации большого проекта (10+ файлов), ОБЯЗАТЕЛЬНО:
- Генерируй файлы батчами по **3-5**
- После каждого батча — проверка с валидационным скриптом (§7)
- **Последний файл** — перечитай дважды: к концу батча качество падает
- Каждый файл содержит **реальный код**, не заглушки

### 5.5 Запрещённые паттерны

| ❌ Запрещено | ✅ Что делать |
|-------------|-------------|
| `ctx.fillRect()` без стиля (прямоугольник) | Процедурный спрайт или shape |
| Один цвет для всего | Палитра из 4-6 цветов |
| Нет анимации UI | Tween для каждого появления/исчезновения |
| `alert()` или `console.log()` для UI | In-game UI элементы |
| `setInterval()` для game loop | `requestAnimationFrame()` |
| Линейное движение | Easing / кривые ускорения |
| Без звука | Процедурные звуки (Web Audio API) |
| Без сохранения | localStorage для прогресса |
| `window.innerWidth` без throttle | ResizeObserver с debounce |

---

## 6. Процедурная генерация ассетов

> Когда нет внешних файлов (спрайтов, звуков), ВСЁ генерируется процедурно.

### 6.1 Процедурные спрайты

```javascript
// Создай offscreen canvas для каждого типа объекта
function createSprite(width, height, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, width, height);
  return canvas;
}

// Пример: птица с анимацией крыльев
const birdFrames = [0, 1, 2].map(frame =>
  createSprite(34, 24, (ctx, w, h) => {
    // Тело (градиент)
    const grad = ctx.createRadialGradient(w/2, h/2, 2, w/2, h/2, w/2);
    grad.addColorStop(0, '#FFD700');
    grad.addColorStop(1, '#FF8C00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(w/2, h/2, w/2-2, h/2-4, 0, 0, Math.PI*2);
    ctx.fill();
    // Глаз
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(w*0.65, h*0.35, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(w*0.67, h*0.35, 2, 0, Math.PI*2); ctx.fill();
    // Крыло (анимация)
    const wingY = [0, -3, -6][frame];
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(w*0.35, h*0.5 + wingY, 8, 4, -0.3, 0, Math.PI*2);
    ctx.fill();
    // Клюв
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.moveTo(w-2, h*0.4);
    ctx.lineTo(w+5, h*0.45);
    ctx.lineTo(w-2, h*0.55);
    ctx.fill();
  })
);
```

### 6.2 Процедурные звуки

```javascript
class ProceduralAudio {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Прыжок: восходящая частота
  jump() {
    this._tone(200, 500, 0.08, 'sine', 0.15);
  }

  // Очко: аккорд
  score() {
    this._tone(523, 523, 0.05, 'sine', 0.1);
    this._tone(659, 659, 0.05, 'sine', 0.1, 0.05);
    this._tone(784, 784, 0.05, 'sine', 0.1, 0.1);
  }

  // Смерть: нисходящий шум
  death() {
    this._noise(0.15, 0.5);
    this._tone(400, 100, 0.3, 'sawtooth', 0.3);
  }

  // Клик UI
  click() {
    this._tone(800, 800, 0.02, 'square', 0.05);
  }

  _tone(startFreq, endFreq, rampTime, type, volume, delay = 0) {
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + rampTime);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + rampTime + 0.05);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t); osc.stop(t + rampTime + 0.05);
  }

  _noise(duration, volume) {
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    source.connect(gain).connect(this.ctx.destination);
    source.start(t);
  }
}
```

---

## 7. Верификация и Gate-проверки

> ⚠️ **КАЖДАЯ ФАЗА заканчивается обязательной проверкой.**
> Нельзя переходить к следующей фазе без прохождения gate.

### 7.1 Автоматическая валидация (ОБЯЗАТЕЛЬНАЯ)

После каждого батча файлов запусти скрипт валидации:

```bash
cp .agent/skills/game-dev/scripts/validate-game.js /tmp/validate-game.js
node /tmp/validate-game.js <путь к папке проекта>
```

Скрипт проверяет 30+ правил:
- Магические числа (числа без CONFIG)
- Отсутствие delta-time
- TODO/FIXME/HACK комментарии
- `setInterval` вместо `requestAnimationFrame`
- `alert()`/`prompt()` в коде
- Placeholder-ные `fillRect` без контекста
- Отсутствие error handling
- Огромные файлы (>500 строк)
- Отсутствие event cleanup
- `var` вместо `let`/`const`

Цикл: **генерация → валидация → исправление → валидация → ... пока 0 ошибок.**

### 7.2 Ручная проверка (ОБЯЗАТЕЛЬНАЯ)

После автоматической валидации — **играй в браузере** и проверь:

**Game Feel Checklist:**
- [ ] Input → response за < 16ms (1 кадр)
- [ ] Анимация прыжка/движения — плавная
- [ ] Хитбоксы — honest (чуть меньше спрайта)
- [ ] Camera — плавная (нет дёргания)

**Visual Checklist:**
- [ ] Нет голых прямоугольников — все объекты стилизованы
- [ ] UI элементы появляются/исчезают с анимацией
- [ ] Цветовая палитра — гармоничная (не random)
- [ ] Шрифт — не browser default

**Audio Checklist:**
- [ ] Каждое действие имеет звук
- [ ] Громкость сбалансирована
- [ ] Нет artfacts/clicks между звуками

**Systems Checklist:**
- [ ] Score работает и отображается
- [ ] High score сохраняется (refresh → score сохранён)
- [ ] Game Over → возможность перезапуска
- [ ] Пауза работает (Escape/P)

**Edge Cases:**
- [ ] Tab-out во время игры → пауза
- [ ] Resize → canvas адаптируется
- [ ] Двойной клик → не ломает state
- [ ] Rapid input → нет дублирования действий

### 7.3 Аудит качества

После всех gate-проверок, запусти финальный аудит:

```bash
cp .agent/skills/game-dev/scripts/audit-game.js /tmp/audit-game.js
node /tmp/audit-game.js <путь к папке проекта>
```

Аудит оценивает каждый столп 1-10 и выдаёт общую оценку.
**Минимальный балл для release: 7/10 по КАЖДОМУ столпу.**

---

## 8. Алгоритм разработки (пошагово)

> ⚠️ Последовательность ОБЯЗАТЕЛЬНА. Не перескакивай фазы.

### Шаг 1: Концепт (§3 Фаза 0)
1. Определи жанр, core loop, стек
2. Создай Config.js с ВСЕМИ числовыми параметрами
3. Спроектируй файловую структуру
4. → GATE 0

### Шаг 2: Core Mechanics (§3 Фаза 1)
1. Реализуй game loop с `requestAnimationFrame`
2. Реализуй core mechanic (движение + ключевое действие)
3. Добавь delta-time ВЕЗДЕ
4. Реализуй state machine (MENU/PLAY/PAUSE/OVER)
5. **Проверка:** играй 30 сек только core mechanic
6. → GATE 1

### Шаг 3: Content & Progression (§3 Фаза 2)
1. Добавь врагов/препятствия с S-образной кривой сложности
2. Добавь power-ups (минимум 2 типа)
3. Реализуй процедурную генерацию (если применимо)
4. **Проверка:** играй 3 минуты, проверь разнообразие
5. → GATE 2

### Шаг 4: Game Feel (§3 Фаза 3)
1. Screen shake при важных событиях
2. Particles для каждого события (смерть, очко, power-up)
3. Easing для ВСЕХ анимаций UI
4. Hit-stop / slow-mo эффекты
5. Floating score text
6. **Проверка:** смотри gameplay без звука — каждое событие видимо?
7. → GATE 3

### Шаг 5: Meta Systems (§3 Фаза 4)
1. Score system с combo
2. Achievements (5-10 штук)
3. High score persistance
4. UI для game over (score, high score, achievements)
5. **Проверка:** после game over — мотивация нажать «Ещё раз»?
6. → GATE 4

### Шаг 6: Polish (§3 Фаза 5)
1. Процедурные спрайты (замени ВСЕ прямоугольники)
2. Процедурные звуки (Web Audio API)
3. UI glassmorphism + Google Fonts
4. Parallax background
5. Responsive design
6. **Проверка:** скриншот → скажет ли незнакомец «качественно»?
7. → GATE 5

### Шаг 7: Testing & Optimization (§3 Фаза 6)
1. Object pooling для частиц и врагов
2. Memory leak проверка
3. Edge cases (tab-out, resize, rapid input)
4. Accessibility (keyboard, pause, settings)
5. **Запусти валидатор:** `node /tmp/validate-game.js <path>`
6. **Запусти аудит:** `node /tmp/audit-game.js <path>`
7. Исправь ВСЕ найденные проблемы
8. → GATE 6 → **RELEASE!**

### Шаг 8: Сборка

```bash
# Для веб-приложения (Vite)
npm run build

# Для десктопной сборки (Tauri)
npx tauri build
```

---

## 9. Чеклист качества (финальный)

### Код
- [ ] Нет магических чисел — всё в CONFIG
- [ ] Delta-time в каждом update
- [ ] State machine для Game State
- [ ] Event system для коммуникации
- [ ] Object pooling для часто создаваемых объектов
- [ ] Нет TODO/FIXME/HACK
- [ ] Нет `var`, только `let`/`const`
- [ ] Нет `setInterval` для game loop
- [ ] Нет `alert()`/`prompt()`
- [ ] Файлы < 400 строк
- [ ] Error handling для Audio/localStorage

### Геймплей
- [ ] Core mechanic отточена — мгновенный отклик
- [ ] S-образная кривая сложности
- [ ] Минимум 2 типа power-up
- [ ] Прогрессия: новые элементы по мере игры
- [ ] Game over → мотивация «ещё раз»

### Visual
- [ ] Нет голых прямоугольников
- [ ] Процедурные спрайты с деталями
- [ ] Анимация для каждого UI-элемента
- [ ] Гармоничная цветовая палитра
- [ ] Parallax фон
- [ ] Google Fonts
- [ ] Glassmorphism UI

### Audio
- [ ] Процедурные звуки (Web Audio API)
- [ ] Звук на каждое действие (прыжок, очко, смерть, UI)
- [ ] Громкость сбалансирована
- [ ] Graceful degradation (работает без звука)

### Systems
- [ ] Score + high score + localStorage
- [ ] Achievements (5+ штук)
- [ ] Пауза (Escape/P)
- [ ] Game over screen с информацией

### Performance
- [ ] 60 FPS стабильных (desktop)
- [ ] Object pooling
- [ ] Нет memory leaks
- [ ] Responsive design
- [ ] Touch support

### Testing
- [ ] validate-game.js → 0 ошибок
- [ ] audit-game.js → ≥7/10 по каждому столпу
- [ ] 5 минут gameplay без крашей
- [ ] Tab-out/tab-in → пауза
- [ ] Resize → адаптация
- [ ] Refresh → score сохранён

---

## 10. Типичные ошибки (из реального опыта)

### Ошибка 1: «Прямоугольники вместо графики»
```javascript
// ❌ Студенческий проект
ctx.fillStyle = 'red';
ctx.fillRect(player.x, player.y, 32, 32);

// ✅ Продукт
drawPlayerSprite(ctx, player, animFrame);
// С тенью, gradient-ом, анимацией, trail-ом
```

### Ошибка 2: «Мгновенное появление UI»
```javascript
// ❌ Без анимации
gameOverScreen.style.display = 'block';

// ✅ С анимацией
gameOverScreen.style.opacity = '0';
gameOverScreen.style.display = 'block';
gameOverScreen.style.transform = 'scale(0.8)';
requestAnimationFrame(() => {
  gameOverScreen.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  gameOverScreen.style.opacity = '1';
  gameOverScreen.style.transform = 'scale(1)';
});
```

### Ошибка 3: «Нет feedback на действия»
```javascript
// ❌ Просто меняем score
this.score += 10;

// ✅ Score + visual + audio
this.score += 10;
this.floatingTexts.push({ text: '+10', x: player.x, y: player.y, life: 1 });
this.audio.score();
this.screenShake(3, 100);
```

### Ошибка 4: «Линейная сложность»
```javascript
// ❌ Линейно — слишком быстро / слишком медленно
this.speed = 200 + this.score;

// ✅ S-кривая с cap
this.speed = CONFIG.DIFFICULTY.INITIAL_SPEED +
  (CONFIG.DIFFICULTY.MAX_SPEED - CONFIG.DIFFICULTY.INITIAL_SPEED) *
  (1 - Math.exp(-this.score / 500));
```

### Ошибка 5: «God Object»
```javascript
// ❌ Один файл 3000+ строк с всем
class Game { /* рендер + физика + UI + звук + ввод + сохранение */ }

// ✅ Модульная архитектура
// 8-12 файлов по 200-400 строк каждый
```

### Ошибка 6: «Забыли game feel»
Технически работает, но **не чувствуется** как игра:
- Нет screen shake
- Нет particles
- Нет sound feedback
- Нет tweens/easing
- Линейное движение

**Это #1 причина почему самодельные игры кажутся «самодельными».**

---

## 11. Адаптация под жанры

### 11.1 Аркада / Endless Runner
- Core: один input (прыжок/клик)
- Progression: скорость ↑, gap ↓, новые препятствия
- Meta: high score, achievements, skins

### 11.2 Платформер
- Core: движение + прыжок + взаимодействие
- Progression: уровни, новые механики, boss fights
- Meta: checkpoints, collectibles, time records

### 11.3 Puzzle
- Core: перемещение/поворот элементов
- Progression: новые механики каждые 5-10 уровней
- Meta: stars rating, hints system, level select

### 11.4 Шутер / Bullet Hell
- Core: движение + стрельба + уклонение
- Progression: waves, weapon upgrades, boss patterns
- Meta: weapon unlocks, power-up tree, online leaderboard

### 11.5 RPG / Adventure
- Core: исследование + боевая система + диалоги
- Progression: уровни, навыки, экипировка
- Meta: quests, inventory, save/load system
