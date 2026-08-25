/**
 * MINECRAFT GALAXY PORTAL - SCRIPT
 * Содержит полную базу модов, интеграцию с Cloudflare KV и проверку статуса.
 */

const API_ENDPOINT = "https://mc-api.dimitrytam09.workers.dev/api/server";

// Полный каталог всех модов сборки из архива
const MODS_DATABASE = [
  // ⚡ Оптимизация и производительность
  { name: "Sodium", cat: "opt", tag: "Движок FPS", desc: "Главный графический движок, заменяющий рендерер игры и поднимающий FPS в 2–4 раза." },
  { name: "Lithium", cat: "opt", tag: "Физика & CPU", desc: "Глубокая оптимизация тиков мира, мобов и чанков, снижающая нагрузку на процессор." },
  { name: "FerriteCore", cat: "opt", tag: "Память RAM", desc: "Оптимизирует структуры памяти, сокращая потребление RAM игрой на 30–50%." },
  { name: "ImmediatelyFast", cat: "opt", tag: "Быстрый HUD", desc: "Ускоряет прорисовку текста, интерфейса, HUD и открытых сундуков." },
  { name: "ModernFix", cat: "opt", tag: "Фикс багов", desc: "Устраняет утечки памяти, зависания и ускоряет запуск Minecraft в 2 раза." },
  { name: "Nvidium", cat: "opt", tag: "NVIDIA Mesh", desc: "Использует Mesh Shaders для молниеносной прорисовки чанков без просадки фреймрейта." },
  { name: "MoreCulling", cat: "opt", tag: "Отсечение", desc: "Не рендерит блоки и стороны объектов, скрытые за стенами." },
  { name: "Cull Leaves", cat: "opt", tag: "Листва", desc: "Делает скрытые грани блоков листьев прозрачными для видеокарты, повышая FPS в лесах." },
  { name: "Dynamic FPS", cat: "opt", tag: "Спящий режим", desc: "Снижает FPS до минимума при сворачивании игры, экономя ресурсы ПК." },
  { name: "FastQuit", cat: "opt", tag: "Мгновенный выход", desc: "Позволяет моментально выходить в меню, сохраняя мир в фоновом потоке." },
  { name: "Debugify", cat: "opt", tag: "Фиксы", desc: "Исправляет более 70 ванильных недоработок и багов исходного кода." },

  // 🔊 Звуки и атмосфера
  { name: "AmbientSounds", cat: "audio", tag: "Звуки мира", desc: "Живое звуковое окружение: пение птиц, шум ветра, эхо пещер и плеск волн." },
  { name: "PresenceFootsteps", cat: "audio", tag: "Шаги", desc: "Ультра-реалистичные шаги, зависящие от брони, скорости бега и типа поверхности." },
  { name: "Sound Physics Remastered", cat: "audio", tag: "Физика эха", desc: "Полноценное 3D-эхо в пещерах и приглушение звуков за массивными стенами." },
  { name: "ExtremeSoundMuffler", cat: "audio", tag: "Глушитель", desc: "Позволяет выборочно отключить любой раздражающий звук (шум портала, крики коров)." },

  // ✨ Графика, Анимации и Эффекты
  { name: "Iris Shaders", cat: "visual", tag: "Шейдеры", desc: "Современный скоростной движок для работы шейдеров с полной поддержкой Sodium." },
  { name: "Distant Horizons", cat: "visual", tag: "LOD Чанки", desc: "Рендерит ландшафт на сотни чанков вперед с нулевой потерей FPS." },
  { name: "LambDynamicLights", cat: "visual", tag: "Свет в руке", desc: "Динамический свет от факелов, фонарей и лавы в руке или брошенных на пол." },
  { name: "Visuality", cat: "visual", tag: "Частицы", desc: "Искры от лавы, капли от слизней, блеск зачарований и динамические взрывы." },
  { name: "Continuity", cat: "visual", tag: "Соединение", desc: "Соединение текстур стекла, песчаника и книжных полок без рамок." },
  { name: "Animatica", cat: "visual", tag: "Анимации", desc: "Поддержка анимированных текстур в ресурс-паках." },
  { name: "Skyboxify", cat: "visual", tag: "Космос/Небо", desc: "Отображает кастомные звездные небеса и галактики из ресурс-паков." },
  { name: "BetterGrassify", cat: "visual", tag: "Трава", desc: "Сплошная бесшовная текстура травы по бокам блоков." },
  { name: "Entity Model Features (EMF)", cat: "visual", tag: "3D Мобы", desc: "Поддержка кастомных 3D-моделей мобов для ресурс-паков." },
  { name: "Entity Texture Features (ETF)", cat: "visual", tag: "Скины мобов", desc: "Светящиеся, случайные и вариативные текстуры существ." },
  { name: "Elytra Physics", cat: "visual", tag: "Физика", desc: "Плавная физика ткани для элитр и плащей при полете." },
  { name: "PlayerAnimationLib & Emotecraft", cat: "visual", tag: "Эмоции", desc: "Плавные анимации движений игрока, танцы, приветствия и кастомные жесты." },
  { name: "ChatAnimation", cat: "visual", tag: "Чат", desc: "Красивая плавная анимация всплывающих строк в игровом чате." },

  // 🛠️ QoL и Интерфейс
  { name: "WTHIT (What The Hell Is That)", cat: "qol", tag: "Инфо о блоке", desc: "Всплывающая подсказка сверху с названием блока, моба, его здоровьем и модом." },
  { name: "AppleSkin", cat: "qol", tag: "Сытость", desc: "Показывает точное количество восстанавливаемого здоровья и насыщения еды." },
  { name: "Inventory HUD+", cat: "qol", tag: "Интерфейс", desc: "Мини-окно инвентаря, прочность брони и таймеры зелий на экране." },
  { name: "BetterF3", cat: "qol", tag: "F3 Модули", desc: "Превращает стандартный экран отладки F3 в аккуратные цветные панели." },
  { name: "ShulkerBoxTooltip", cat: "qol", tag: "Превью", desc: "Показывает содержимое шалкеров и сундуков при наведении курсора." },
  { name: "ItemBorders", cat: "qol", tag: "Редкость", desc: "Цветные рамки вокруг предметов в инвентаре по степени их редкости." },
  { name: "Held Item Info", cat: "qol", tag: "Подсказка", desc: "Всплывающее название и параметры предмета при смене активного слота." },
  { name: "Durability Tooltip", cat: "qol", tag: "Прочность", desc: "Отображает точное оставшееся число использований инструментов и брони." },
  { name: "Enchantment Descriptions", cat: "qol", tag: "Зачарования", desc: "Добавляет описание действия зачарований прямо на страницах книг." },
  { name: "Advancement Plaques", cat: "qol", tag: "Ачивки", desc: "Красивые анимированные таблички достижений вместо стандартных." },
  { name: "PickUpNotifier", cat: "qol", tag: "Лут-лог", desc: "Компактный список поднятых предметов в углу экрана." },
  { name: "Neat", cat: "qol", tag: "HP Бары", desc: "Минималистичные полоски здоровья над мобами и игроками." },
  { name: "Status Effect Bars", cat: "qol", tag: "Эффекты", desc: "Удобные таймеры активных эффектов зелий рядом со значками." },
  { name: "BetterStats", cat: "qol", tag: "Статистика", desc: "Переработанное стильное меню статистики с фильтрами и графиками." },
  { name: "OptiGUI", cat: "qol", tag: "GUI Стили", desc: "Кастомные текстуры меню верстаков и сундуков под стиль биома." },
  { name: "Dark Loading Screen", cat: "qol", tag: "Темный экран", desc: "Приятный темный экран загрузки вместо яркого белого." },
  { name: "Language Reload", cat: "qol", tag: "Языки", desc: "Мгновенная смена языка без зависания игры и перезагрузки ресурсов." },
  { name: "Zoomify", cat: "qol", tag: "Зум (C)", desc: "Плавное приближение камеры на клавишу C с прокруткой колесиком мыши." },
  { name: "Controlling & Controlify", cat: "qol", tag: "Управление", desc: "Поиск по кнопкам + полноценная поддержка геймпадов с вибрацией." },
  { name: "ModMenu", cat: "qol", tag: "Меню модов", desc: "Список всех установленных модов с быстрым переходом в их настройки." },
  { name: "Reese's & Sodium Extra", cat: "qol", tag: "Sodium Меню", desc: "Удобные дополнительные меню для тонкой настройки графики Sodium." },

  // 👥 Мультиплеер и Геймплей
  { name: "Simple Voice Chat", cat: "multiplayer", tag: "Голос 3D", desc: "Позиционный 3D-голосовой чат с микрофоном: громкость затухает с расстоянием." },
  { name: "E4MC", cat: "multiplayer", tag: "Игра по сети", desc: "Генерация ссылки для подключения друзей прямо из одиночной игры." },
  { name: "Lootr", cat: "multiplayer", tag: "Лут для всех", desc: "Сундуки в данжах имеют отдельный лут для каждого игрока и не пустеют." },
  { name: "ViaFabricPlus", cat: "multiplayer", tag: "Кросс-версии", desc: "Возможность заходить на сервера любых старых и новых версий игры." },
  { name: "Sit", cat: "multiplayer", tag: "Сесть (ПКМ)", desc: "Позволяет садиться на ступеньки, полублоки и ковры нажатием ПКМ." },
  { name: "Stack to Nearby Chests", cat: "multiplayer", tag: "Сортировка", desc: "Автоматическое складывание предметов из инвентаря в соседние сундуки." },
  { name: "Easy Anvils", cat: "multiplayer", tag: "Наковальни", desc: "Наковальни не ломаются быстро и не пишут «Слишком дорого»." },
  { name: "Chat Heads", cat: "multiplayer", tag: "Иконки скинов", desc: "Отображает лица игроков рядом с их сообщениями в игровом чате." },
  { name: "No Chat Reports", cat: "multiplayer", tag: "Безопасность", desc: "Отключает систему криптографических подписей и репортов чата." },
  { name: "Show Me Your Skin", cat: "multiplayer", tag: "Скрыть броню", desc: "Возможность скрыть отображение брони/элитр на своем скине." },
  { name: "TL Skin Cape", cat: "multiplayer", tag: "Скины TL", desc: "Отображение скинов и плащей игроков, использующих TLauncher." },
  { name: "TabTPS", cat: "multiplayer", tag: "Пинг & TPS", desc: "Показывает реальный TPS сервера и пинг игроков в списке Tab." },
  { name: "Freecam & Fabrishot", cat: "multiplayer", tag: "Камера", desc: "Свободный полет камеры для осмотра построек и скриншоты в 4K/8K." },
  { name: "Xaero's Minimap & WorldMap", cat: "multiplayer", tag: "Карты", desc: "Миникарта в углу экрана и интерактивная карта всего мира на клавишу M." },

  // 🌌 Шейдеры и Текстур-паки
  { name: "Complementary Reimagined", cat: "shaders", tag: "Шейдер", desc: "Премиальные шейдеры: живая вода, лучи заката, свет редстоуна и звезды." },
  { name: "BSL / MakeUp Ultra Fast", cat: "shaders", tag: "Шейдер (Lite)", desc: "Легкий профиль шейдеров для плавной игры на любых компьютерах." },
  { name: "Fresh Animations", cat: "shaders", tag: "Ресурс-пак", desc: "Полностью перерабатывает анимации всех мобов, делая их живыми и плавными." },
  { name: "Enhanced Vanilla / Dark GUI", cat: "shaders", tag: "Ресурс-пак", desc: "Темная чистая тема для интерфейса, сундуков и меню игры." },
  { name: "3D Items & Props", cat: "shaders", tag: "Ресурс-пак", desc: "Добавляет трехмерный объем предметам, инструментам, растениям и рельсам." }
];

let currentFilter = 'all';

// 1. Инициализация при старте
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  renderMods(MODS_DATABASE);
  document.getElementById("totalModsCount").textContent = MODS_DATABASE.length;
  syncCloudflareData();
});

// 2. Логика переключения вкладок
function initTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-tab");

      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // Открытие панели администратора
  document.getElementById("toggleAdminBtn").addEventListener("click", () => {
    document.getElementById("adminDrawer").classList.toggle("active");
  });
}

// 3. Синхронизация с Cloudflare KV
async function syncCloudflareData() {
  try {
    const res = await fetch(API_ENDPOINT);
    const data = await res.json();

    const ip = data.ip || "127.0.0.1";
    const port = data.port || "25565";

    document.getElementById("ipDisplay").textContent = ip;
    document.getElementById("portDisplay").textContent = port;
    document.getElementById("adminIpInput").value = ip;
    document.getElementById("adminPortInput").value = port;

    pingServer(ip, port);
  } catch (err) {
    document.getElementById("statusMsg").textContent = "АВТОНОМНЫЙ РЕЖИМ";
  }
}

// 4. Проверка статуса сервера Minecraft
async function pingServer(ip, port) {
  const orb = document.getElementById("statusOrb");
  const msg = document.getElementById("statusMsg");
  const stat = document.getElementById("playerStat");

  msg.textContent = "СКАНИРОВАНИЕ...";
  orb.className = "status-orb";

  try {
    const res = await fetch(`https://api.mcstatus.io/v2/status/java/${ip}:${port}`);
    const data = await res.json();

    if (data.online) {
      orb.classList.add("online");
      msg.textContent = "ОНЛАЙН";
      msg.style.color = "var(--galaxy-emerald)";
      stat.textContent = `${data.players.online} / ${data.players.max} в сети`;
    } else {
      orb.classList.remove("online");
      msg.textContent = "ОФФЛАЙН";
      msg.style.color = "var(--galaxy-red)";
      stat.textContent = "0 / 0";
    }
  } catch (e) {
    msg.textContent = "ОФФЛАЙН";
    msg.style.color = "var(--galaxy-red)";
    stat.textContent = "- / -";
  }
}

// 5. Сохранение нового адреса в Cloudflare KV
async function saveServerAddress() {
  const ip = document.getElementById("adminIpInput").value.trim();
  const port = document.getElementById("adminPortInput").value.trim();
  const secret = prompt("Введи ключ администратора (по умолчанию: admin12345):");

  if (!secret) return;

  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secret}`
      },
      body: JSON.stringify({ ip, port })
    });

    if (res.ok) {
      alert("🌌 Адрес успешно синхронизирован в Cloudflare!");
      document.getElementById("adminDrawer").classList.remove("active");
      syncCloudflareData();
    } else {
      alert("❌ Ошибка: неверный ключ авторизации.");
    }
  } catch (e) {
    alert("❌ Ошибка сетевого соединения.");
  }
}

// 6. Копирование текста в буфер
function copyValue(elemId, btn) {
  const text = document.getElementById(elemId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = "<span>✔ Скопировано</span>";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove("copied");
    }, 1500);
  });
}

// 7. Отрисовка списка модов
function renderMods(list) {
  const container = document.getElementById("modsListContainer");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-muted);">Ничего не найдено 🔭</div>`;
    return;
  }

  list.forEach(item => {
    const tagClass = `tag-${item.cat}`;
    const el = document.createElement("div");
    el.className = "galaxy-mod-item";
    el.innerHTML = `
      <div class="mod-header-row">
        <span class="mod-item-title">${item.name}</span>
        <span class="mod-item-tag ${tagClass}">${item.tag}</span>
      </div>
      <p class="mod-item-description">${item.desc}</p>
    `;
    container.appendChild(el);
  });
}

// 8. Фильтрация и поиск
function setFilter(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");
  handleSearch();
}

function handleSearch() {
  const query = document.getElementById("modSearchInput").value.toLowerCase();
  
  const filtered = MODS_DATABASE.filter(m => {
    const matchesCat = currentFilter === 'all' || m.cat === currentFilter;
    const matchesQuery = m.name.toLowerCase().includes(query) || m.desc.toLowerCase().includes(query) || m.tag.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  renderMods(filtered);
}
