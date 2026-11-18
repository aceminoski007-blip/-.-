/* =========================================================
   ООУ „Д-р Владимир Полежиноски“ – Кичево
   Училишен портал · app.js
   ========================================================= */
(function () {
  "use strict";

  /* =========================================================
     ОСНОВИ И ПОМОШНИ ФУНКЦИИ
     ========================================================= */
  const PREFIX = "schoolhub:";
  const IS_IOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const DEFAULT_PROFILE = {
    id: "u-me",
    name: "Ученик",
    className: "VI-1",
    role: "",
    bio: "Добредојде во мојот училишен простор. Овде ги следам задачите, белешките и моите резултати.",
    avatar: ""
  };

  const ROLE_LABELS = {
    student: "Ученик / Ученичка",
    teacher: "Наставник / Наставничка",
    parent: "Родител"
  };

  const MACEDONIAN_WEEKDAYS = [
    "Недела",
    "Понеделник",
    "Вторник",
    "Среда",
    "Четврток",
    "Петок",
    "Сабота"
  ];
  const MACEDONIAN_WEEKDAYS_SHORT = ["Нед", "Пон", "Вто", "Сре", "Чет", "Пет", "Саб"];
  const MACEDONIAN_MONTHS = [
    "јануари",
    "февруари",
    "март",
    "април",
    "мај",
    "јуни",
    "јули",
    "август",
    "септември",
    "октомври",
    "ноември",
    "декември"
  ];
  const MACEDONIAN_MONTHS_SHORT = [
    "јан",
    "фев",
    "мар",
    "апр",
    "мај",
    "јун",
    "јул",
    "авг",
    "сеп",
    "окт",
    "ное",
    "дек"
  ];

  const NEWS_CATEGORIES = {
    announcement: { label: "Соопштение", icon: "megaphone" },
    event: { label: "Настан", icon: "calendar" },
    success: { label: "Успех", icon: "trophy" },
    project: { label: "Проект", icon: "sparkles" }
  };

  const ASSIGNMENT_TYPES = {
    test: { label: "Тест", icon: "clipboard" },
    homework: { label: "Домашна", icon: "book" },
    project: { label: "Проект", icon: "flask" },
    quiz: { label: "Квиз", icon: "target" }
  };

  const NOTIFICATION_TYPES = {
    info: { label: "Информација", icon: "bell" },
    warning: { label: "Важно", icon: "warning" },
    event: { label: "Настан", icon: "calendar" },
    success: { label: "Успех", icon: "trophy" }
  };

  const NOTE_COLORS = ["yellow", "mint", "pink", "blue"];

  const TAB_TITLES = {
    news: "Вести · ООУ „Д-р Владимир Полежиноски“",
    groups: "Групи · Училишен портал",
    school: "Тестови и распоред · Училишен портал",
    ai: "Владимир · AI асистент",
    settings: "Поставки · Училишен портал",
    me: "Јас и алатки · Училишен портал",
    admin: "Админ панел · Училишен портал"
  };

  const VALID_TABS = ["news", "groups", "school", "ai", "settings", "me", "admin"];

  const SCHOOL = {
    name: "ООУ „Д-р Владимир Полежиноски“",
    address: "ул. Арсо Војвода, Кичево",
    phone: "070 656 494",
    email: "ou-drvladimirpolezhinoski-kichevo@schools.mk"
  };

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (character) => {
      if (character === "&") return "&amp;";
      if (character === "<") return "&lt;";
      if (character === ">") return "&gt;";
      if (character === '"') return "&quot;";
      return "&#39;";
    });
  }

  function iconMarkup(name, className) {
    return (
      '<svg class="icon' +
      (className ? " " + className : "") +
      '" aria-hidden="true"><use href="#i-' +
      name +
      '"></use></svg>'
    );
  }

  function storageGet(key, fallback) {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (error) {
      // Складирањето може да биде блокирано (приватен режим, полн простор).
    }
  }

  function storageRemove(key) {
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch (error) {}
  }

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function vibrate(pattern) {
    if (!("vibrate" in navigator)) return;
    try {
      if (navigator.userActivation && navigator.userActivation.isActive === false) return;
      navigator.vibrate(pattern);
    } catch (error) {}
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return pad(date.getHours()) + ":" + pad(date.getMinutes());
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.getDate() + " " + MACEDONIAN_MONTHS[date.getMonth()];
  }

  function formatLongDate(date) {
    return date.getDate() + " " + MACEDONIAN_MONTHS[date.getMonth()] + " " + date.getFullYear();
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  function formatRelative(timestamp) {
    const today = startOfDay(new Date());
    const target = startOfDay(new Date(timestamp));
    const days = Math.round((today - target) / 86400000);
    if (days <= 0) return "денес";
    if (days === 1) return "вчера";
    if (days < 7) return "пред " + days + " дена";
    return formatDate(timestamp);
  }

  function formatMessageTime(timestamp) {
    const today = startOfDay(new Date());
    const target = startOfDay(new Date(timestamp));
    const days = Math.round((today - target) / 86400000);
    if (days <= 0) return "денес, " + formatTime(timestamp);
    if (days === 1) return "вчера, " + formatTime(timestamp);
    return new Date(timestamp).getDate() + "." + (new Date(timestamp).getMonth() + 1) + ".";
  }

  function formatNoteDate(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    if (startOfDay(now) === startOfDay(date)) return "Денес, " + formatTime(timestamp);
    return date.getDate() + " " + MACEDONIAN_MONTHS_SHORT[date.getMonth()] + ", " + formatTime(timestamp);
  }

  function formatNumber(value, maxFraction, minFraction) {
    return Number(value).toLocaleString("mk-MK", {
      maximumFractionDigits: maxFraction == null ? 2 : maxFraction,
      minimumFractionDigits: minFraction == null ? 0 : minFraction
    });
  }

  function isoFromDate(date) {
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate())
    );
  }

  function isoInDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return isoFromDate(date);
  }

  function dateFromISO(iso) {
    if (!iso) return null;
    const parts = String(iso).split("-");
    if (parts.length !== 3) return null;
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function tsDaysAgo(days, hour, minute) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hour == null ? 9 : hour, minute == null ? 0 : minute, 0, 0);
    return date.getTime();
  }

  function initialsFromName(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "У";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function dueMeta(iso, completed) {
    const due = dateFromISO(iso);
    if (!due) return { text: "Без рок", className: "" };
    const days = Math.round((startOfDay(due) - startOfDay(new Date())) / 86400000);
    let text = "Рок: " + due.getDate() + " " + MACEDONIAN_MONTHS_SHORT[due.getMonth()];
    let className = "";
    if (days < 0) {
      className = completed ? "" : "is-overdue";
      if (!completed) text = "Задоцнето · " + due.getDate() + " " + MACEDONIAN_MONTHS_SHORT[due.getMonth()];
    } else if (days === 0) {
      text = "Рок: денес";
      className = completed ? "" : "is-soon";
    } else if (days === 1) {
      text = "Рок: утре";
      className = completed ? "" : "is-soon";
    } else if (days <= 3) {
      className = completed ? "" : "is-soon";
    }
    return { text: text, className: className };
  }

  /* =========================================================
     ПОЧЕТНИ ПОДАТОЦИ
     ========================================================= */
  function seedNews() {
    return [
      {
        id: "news-parents",
        title: "Родителска средба за прво полугодие",
        body:
          "Ги покануваме родителите и старателите на редовна родителска средба во училишната сала. " +
          "Состанокот ќе се одржи во 17:00 часот, а по заедничкиот дел ќе следат кратки средби со одделенските раководители.\n\n" +
          "Ве молиме да пристигнете 10 минути порано заради евиденција.",
        category: "announcement",
        date: tsDaysAgo(0, 8, 30),
        pinned: true,
        author: "Училишна управа"
      },
      {
        id: "news-sport-day",
        title: "Спортски ден на училиштето",
        body:
          "Во петок организираме спортски ден со натпревари во мал фудбал, одбојка и штафетни игри. " +
          "Учениците да понесат спортска опрема и шише вода. Настанот се одржува во училишниот двор, со почеток во 10:00 часот.",
        category: "event",
        date: tsDaysAgo(1, 12, 10),
        pinned: false,
        author: "Наставници по физичко образование"
      },
      {
        id: "news-award",
        title: "Награди на општинскиот натпревар по математика",
        body:
          "Нашите ученици постигнаа одлични резултати на општинскиот натпревар по математика. " +
          "Освоени се две први и три втори места. Им честитаме на учениците и на менторите за посветеноста!",
        category: "success",
        date: tsDaysAgo(2, 14, 5),
        pinned: false,
        author: "Стручен актив по математика"
      },
      {
        id: "news-digital",
        title: "Нова дигитална училница во училиштето",
        body:
          "Со поддршка на донатори, училиштето доби современа дигитална училница со интерактивен екран и нови компјутери. " +
          "Училницата е достапна за сите одделенија според неделниот распоред.",
        category: "project",
        date: tsDaysAgo(4, 11, 20),
        pinned: false,
        author: "Училишна управа"
      },
      {
        id: "news-schedule",
        title: "Потсетник за зимскиот распоред",
        body:
          "Од следната недела започнува зимскиот распоред на часови. Проверете го новиот неделен распоред во делот „Тестови и распоред“ и во известувањата.",
        category: "announcement",
        date: tsDaysAgo(6, 9, 0),
        pinned: false,
        author: "Педагошка служба"
      },
      {
        id: "news-literature",
        title: "Награден конкурс за млади писатели",
        body:
          "Училиштето распишува награден конкурс за расказ на тема „Моето училиште“. " +
          "Трудовите се предаваат на наставниците по македонски јазик до крајот на месецот. Најдобрите три раскази ќе бидат наградени.",
        category: "project",
        date: tsDaysAgo(8, 10, 15),
        pinned: false,
        author: "Актив по македонски јазик"
      }
    ];
  }

  function seedGroups() {
    const demoMembers = [
      { id: "u-ana", name: "Ана Стојаноска", role: "student" },
      { id: "u-marko", name: "Марко Ристески", role: "student" },
      { id: "u-ivana", name: "Ивана Трајкоска", role: "student" },
      { id: "u-luka", name: "Лука Николоски", role: "student" },
      { id: "u-sara", name: "Сара Дукоска", role: "student" },
      { id: "u-prof-mk", name: "Наставничка по македонски", role: "teacher" },
      { id: "u-prof-math", name: "Наставник по математика", role: "teacher" },
      { id: "u-prof-en", name: "Наставничка по англиски", role: "teacher" },
      { id: "u-prof-sci", name: "Наставничка по природни науки", role: "teacher" },
      { id: "u-prof-hist", name: "Наставник по историја", role: "teacher" },
      { id: "u-class", name: "Одделенски раководител", role: "teacher" }
    ];
    return [
      {
        id: "group-mk",
        name: "Македонски јазик · VI-1",
        subject: "Јазик и литература",
        icon: "book",
        admins: ["u-prof-mk"],
        members: [
          demoMembers[6],
          demoMembers[0],
          demoMembers[1],
          demoMembers[2]
        ],
        messages: [
          {
            id: "gm-mk-1",
            author: "Наставничка по македонски",
            text: "За утре прочитајте го расказот и подгответе три прашања за дискусија.",
            date: tsDaysAgo(1, 14, 20)
          },
          {
            id: "gm-mk-2",
            author: "Ана Стојаноска",
            text: "Дали прашањата треба да бидат поврзани со ликовите или со пораката на расказот?",
            date: tsDaysAgo(1, 15, 2)
          },
          {
            id: "gm-mk-3",
            author: "Наставничка по македонски",
            text: "Може и едното и другото — важно е да поттикнат разговор.",
            date: tsDaysAgo(1, 15, 18)
          }
        ]
      },
      {
        id: "group-math",
        name: "Математика · VI-1",
        subject: "Природно-математичко подрачје",
        icon: "calculator",
        admins: ["u-prof-math"],
        members: [
          demoMembers[7],
          demoMembers[1],
          demoMembers[3]
        ],
        messages: [
          {
            id: "gm-math-1",
            author: "Наставник по математика",
            text: "Потсетник: контролениот тест е во среда. Вежбајте ги задачите од страниците 48–52.",
            date: tsDaysAgo(0, 9, 5)
          },
          {
            id: "gm-math-2",
            author: "Марко Ристески",
            text: "Ќе има ли задачи со дропки на тестот?",
            date: tsDaysAgo(0, 9, 26)
          }
        ]
      },
      {
        id: "group-en",
        name: "Англиски јазик · VI-1",
        subject: "Странски јазик",
        icon: "globe",
        admins: ["u-prof-en"],
        members: [
          demoMembers[8],
          demoMembers[2],
          demoMembers[4]
        ],
        messages: [
          {
            id: "gm-en-1",
            author: "Наставничка по англиски",
            text: "Оваа недела повторуваме Present Simple. Домашната задача е на работниот лист.",
            date: tsDaysAgo(2, 13, 40)
          }
        ]
      },
      {
        id: "group-science",
        name: "Природни науки · VI-1",
        subject: "Истражувачко учење",
        icon: "flask",
        admins: ["u-prof-sci"],
        members: [
          demoMembers[9],
          demoMembers[2],
          demoMembers[3]
        ],
        messages: [
          {
            id: "gm-sci-1",
            author: "Наставничка по природни науки",
            text: "Донесете материјали за експериментот со вода — ќе работиме во групи.",
            date: tsDaysAgo(3, 11, 12)
          },
          {
            id: "gm-sci-2",
            author: "Ивана Трајкоска",
            text: "Дали треба да донесеме и садови?",
            date: tsDaysAgo(3, 11, 30)
          }
        ]
      },
      {
        id: "group-history",
        name: "Историја · VI-1",
        subject: "Општествени науки",
        icon: "clock",
        admins: ["u-prof-hist"],
        members: [
          demoMembers[10],
          demoMembers[0],
          demoMembers[4]
        ],
        messages: [
          {
            id: "gm-hist-1",
            author: "Наставник по историја",
            text: "Подгответе кратка презентација за значаен настан од минатото на нашиот град.",
            date: tsDaysAgo(5, 10, 0)
          }
        ]
      },
      {
        id: "group-class",
        name: "Одделенска заедница · VI-1",
        subject: "Класен час",
        icon: "groups",
        admins: ["u-class"],
        members: [
          demoMembers[10],
          demoMembers[0],
          demoMembers[1],
          demoMembers[2],
          demoMembers[3],
          demoMembers[4]
        ],
        messages: [
          {
            id: "gm-class-1",
            author: "Одделенски раководител",
            text: "Предлог за излет: собираме идеи до петок. Пишете што би сакале да посетиме.",
            date: tsDaysAgo(0, 8, 45)
          },
          {
            id: "gm-class-2",
            author: "Лука Николоски",
            text: "Предлагам посета на музејот во Кичево.",
            date: tsDaysAgo(0, 9, 12)
          },
          {
            id: "gm-class-3",
            author: "Сара Дукоска",
            text: "Ијдеме до манастирот, ако времето дозволува.",
            date: tsDaysAgo(0, 9, 20)
          }
        ]
      }
    ];
  }

  const SCHEDULE = [
    {
      name: "Понеделник",
      lessons: [
        { subject: "Македонски јазик", start: "08:00", end: "08:45", room: "101" },
        { subject: "Математика", start: "08:50", end: "09:35", room: "101" },
        { subject: "Англиски јазик", start: "09:45", end: "10:30", room: "204" },
        { subject: "Природни науки", start: "10:40", end: "11:25", room: "108" },
        { subject: "Историја", start: "11:30", end: "12:15", room: "101" },
        { subject: "Физичко образование", start: "12:20", end: "13:05", room: "Сала" }
      ]
    },
    {
      name: "Вторник",
      lessons: [
        { subject: "Математика", start: "08:00", end: "08:45", room: "101" },
        { subject: "Македонски јазик", start: "08:50", end: "09:35", room: "101" },
        { subject: "Географија", start: "09:45", end: "10:30", room: "105" },
        { subject: "Англиски јазик", start: "10:40", end: "11:25", room: "204" },
        { subject: "Природни науки", start: "11:30", end: "12:15", room: "108" },
        { subject: "Изборен предмет", start: "12:20", end: "13:05", room: "109" }
      ]
    },
    {
      name: "Среда",
      lessons: [
        { subject: "Македонски јазик", start: "08:00", end: "08:45", room: "101" },
        { subject: "Математика", start: "08:50", end: "09:35", room: "101" },
        { subject: "Природни науки", start: "09:45", end: "10:30", room: "108" },
        { subject: "Англиски јазик", start: "10:40", end: "11:25", room: "204" },
        { subject: "Историја", start: "11:30", end: "12:15", room: "101" },
        { subject: "Физичко образование", start: "12:20", end: "13:05", room: "Сала" }
      ]
    },
    {
      name: "Четврток",
      lessons: [
        { subject: "Географија", start: "08:00", end: "08:45", room: "105" },
        { subject: "Македонски јазик", start: "08:50", end: "09:35", room: "101" },
        { subject: "Математика", start: "09:45", end: "10:30", room: "101" },
        { subject: "Природни науки", start: "10:40", end: "11:25", room: "108" },
        { subject: "Изборен предмет", start: "11:30", end: "12:15", room: "109" },
        { subject: "Англиски јазик", start: "12:20", end: "13:05", room: "204" }
      ]
    },
    {
      name: "Петок",
      lessons: [
        { subject: "Математика", start: "08:00", end: "08:45", room: "101" },
        { subject: "Македонски јазик", start: "08:50", end: "09:35", room: "101" },
        { subject: "Англиски јазик", start: "09:45", end: "10:30", room: "204" },
        { subject: "Историја", start: "10:40", end: "11:25", room: "101" },
        { subject: "Природни науки", start: "11:30", end: "12:15", room: "108" },
        { subject: "Одделенска заедница", start: "12:20", end: "13:05", room: "101" }
      ]
    }
  ];

  const ASSIGNMENT_SUBJECTS = [
    "Македонски јазик",
    "Математика",
    "Англиски јазик",
    "Природни науки",
    "Историја",
    "Географија",
    "Физичко образование",
    "Изборен предмет"
  ];

  function seedAssignments() {
    return [
      {
        id: "task-math-test",
        title: "Контролен тест по математика",
        subject: "Математика",
        type: "test",
        due: isoInDays(2),
        completed: false,
        createdAt: tsDaysAgo(3, 9, 0)
      },
      {
        id: "task-mk-home",
        title: "Домашна по македонски јазик",
        subject: "Македонски јазик",
        type: "homework",
        due: isoInDays(1),
        completed: false,
        createdAt: tsDaysAgo(1, 13, 40)
      },
      {
        id: "task-science-project",
        title: "Проект за природни науки — водата",
        subject: "Природни науки",
        type: "project",
        due: isoInDays(5),
        completed: false,
        createdAt: tsDaysAgo(4, 10, 20)
      },
      {
        id: "task-en-quiz",
        title: "Квиз по англиски јазик",
        subject: "Англиски јазик",
        type: "quiz",
        due: isoInDays(-1),
        completed: true,
        createdAt: tsDaysAgo(6, 11, 0)
      },
      {
        id: "task-reading",
        title: "Читање на лектира",
        subject: "Македонски јазик",
        type: "homework",
        due: isoInDays(-2),
        completed: true,
        createdAt: tsDaysAgo(7, 9, 30)
      }
    ];
  }

  function seedNotifications() {
    return [
      {
        id: "notif-parents",
        title: "Нова објава: Родителска средба",
        body: "Родителската средба е закажана во училишната сала. Проверете ги деталите во вестите.",
        type: "info",
        date: tsDaysAgo(0, 8, 31),
        read: false
      },
      {
        id: "notif-math",
        title: "Тест по математика во среда",
        body: "Не заборавајте да ги повторите задачите од страниците 48–52 пред контролениот тест.",
        type: "warning",
        date: tsDaysAgo(0, 9, 10),
        read: false
      },
      {
        id: "notif-sport",
        title: "Спортски ден во петок",
        body: "Понесете спортска опрема и вода. Натпреварите започнуваат во 10:00 часот.",
        type: "event",
        date: tsDaysAgo(1, 12, 11),
        read: true
      },
      {
        id: "notif-award",
        title: "Одлични резултати на натпреварот",
        body: "Училиштето освои пет награди на општинскиот натпревар по математика. Честитки!",
        type: "success",
        date: tsDaysAgo(2, 14, 6),
        read: true
      },
      {
        id: "notif-schedule",
        title: "Зимски распоред од следната недела",
        body: "Новиот неделен распоред е достапен во делот „Тестови и распоред“.",
        type: "info",
        date: tsDaysAgo(6, 9, 1),
        read: true
      }
    ];
  }

  const savedProfile = storageGet("profile", null);
  const savedNews = storageGet("news", null);
  const savedGroups = storageGet("groups", null);
  const savedAssignments = storageGet("assignments", null);
  const savedNotifications = storageGet("notifications", null);
  const savedNotes = storageGet("notes", null);
  const savedGrades = storageGet("grades", null);
  const savedScores = storageGet("quizScores", null);

  const state = {
    activeTab: "news",
    newsFilter: "all",
    assignmentFilter: "all",
    gradeMode: "average",
    scheduleDay: (new Date().getDay() + 6) % 7,
    news: Array.isArray(savedNews) ? savedNews : seedNews(),
    groups: Array.isArray(savedGroups) ? savedGroups : seedGroups(),
    assignments: Array.isArray(savedAssignments) ? savedAssignments : seedAssignments(),
    notifications: Array.isArray(savedNotifications) ? savedNotifications : seedNotifications(),
    notes: Array.isArray(savedNotes)
      ? savedNotes
      : [
          {
            id: "note-welcome",
            text: "Домашна по природни науки: истражување за кружењето на водата во природата.",
            color: "yellow",
            createdAt: tsDaysAgo(0, 8, 55)
          }
        ],
    grades: Array.isArray(savedGrades) ? savedGrades : [],
    scores: Array.isArray(savedScores) ? savedScores : [],
    profile: Object.assign({}, DEFAULT_PROFILE, savedProfile || {}),
    sound: storageGet("sound", true) !== false,
    adminPin: String(storageGet("adminPin", "1982")),
    noteColor: "yellow",
    editNoteColor: "yellow"
  };

  if (state.scheduleDay > 4) state.scheduleDay = 0;

  let deferredInstallPrompt = window.__schoolDeferredInstall || null;
  let appWasInstalled = false;
  let adminUnlocked = false;
  let confirmCallback = null;
  let toastTimer = null;
  let audioContext = null;
  let activeGroupId = null;

  /* =========================================================
     ТОСТ И ЗВУК
     ========================================================= */
  function showToast(message, options) {
    const settings = options || {};
    const region = $("#toastRegion");
    if (!region) return;

    const toast = document.createElement("div");
    toast.className = "toast" + (settings.tone ? " is-" + settings.tone : "");
    toast.setAttribute("role", "status");

    const iconWrap = document.createElement("span");
    iconWrap.className = "toast-icon";
    iconWrap.innerHTML = iconMarkup(settings.icon || "check");

    const text = document.createElement("span");
    text.textContent = message;

    toast.append(iconWrap, text);
    region.replaceChildren(toast);

    if (settings.vibrate !== false) {
      try {
        vibrate(settings.vibrate || 8);
      } catch (error) {}
    }

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.add("is-out");
      window.setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 240);
    }, settings.duration || 2800);
  }

  function ensureAudioContext() {
    if (audioContext) {
      if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
      return audioContext;
    }
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    try {
      audioContext = new AudioCtor();
    } catch (error) {
      audioContext = null;
    }
    return audioContext;
  }

  function playChime(kind) {
    if (!state.sound) return;
    const context = ensureAudioContext();
    if (!context) return;
    try {
      const now = context.currentTime;
      const notes = kind === "quiz" ? [660, 880, 1174.7] : [523.25, 659.25, 783.99];
      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        const start = now + index * 0.16;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.16, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.46);
      });
    } catch (error) {}
  }

  /* =========================================================
     ТЕМА
     ========================================================= */
  function applyTheme(theme, persist) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = nextTheme === "dark" ? "#07150e" : "#f3f8f4";

    const toggle = $("#themeToggle");
    if (toggle) {
      const isDark = nextTheme === "dark";
      toggle.checked = isDark;
      toggle.setAttribute(
        "aria-label",
        isDark ? "Вклучи светла тема" : "Вклучи темна тема"
      );
    }

    if (persist) storageSet("theme", nextTheme);
  }

  function initTheme() {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    applyTheme(current, false);

    const toggle = $("#themeToggle");
    if (toggle) {
      toggle.addEventListener("change", () => {
        const next = toggle.checked ? "dark" : "light";
        applyTheme(next, true);
        vibrate(10);
      });
    }
  }

  /* =========================================================
     ПОЧЕТЕН ЕКРАН
     ========================================================= */
  function hideSplash() {
    const splash = $("#splashScreen");
    if (!splash) return;
    splash.classList.add("is-hidden");
    window.setTimeout(() => {
      if (splash.parentNode) splash.remove();
    }, 620);
  }

  function initSplash() {
    if (document.readyState === "complete") {
      window.setTimeout(hideSplash, 900);
    } else {
      window.addEventListener("load", () => window.setTimeout(hideSplash, 650));
    }
    window.setTimeout(hideSplash, 2600);
  }

  /* =========================================================
     НАВИГАЦИЈА
     ========================================================= */
  function activateTab(tab, shouldScroll) {
    const target = VALID_TABS.indexOf(tab) >= 0 ? tab : "news";
    state.activeTab = target;

    if (target !== "groups") closeGroupScreen();

    $$(".view").forEach((view) => {
      const isActive = view.dataset.view === target;
      view.hidden = !isActive;
      view.classList.toggle("is-active", isActive);
    });

    $$(".nav-item").forEach((item) => {
      const isActive = item.dataset.tab === target;
      item.classList.toggle("is-active", isActive);
      if (isActive) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });

    document.title = TAB_TITLES[target] || TAB_TITLES.news;

    if (shouldScroll) {
      try {
        window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? "auto" : "smooth" });
      } catch (error) {
        window.scrollTo(0, 0);
      }
    }
  }

  function initNavigation() {
    $$(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        vibrate(7);
        if (state.activeTab === item.dataset.tab) {
          try {
            window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? "auto" : "smooth" });
          } catch (error) {
            window.scrollTo(0, 0);
          }
        }
      });
    });

    window.addEventListener("hashchange", () => {
      activateTab(window.location.hash.replace("#", ""), true);
    });

    const initial = window.location.hash.replace("#", "");
    activateTab(VALID_TABS.indexOf(initial) >= 0 ? initial : "news", false);
  }

  /* =========================================================
     ДИЈАЛОЗИ
     ========================================================= */
  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
  }

  function initDialogs() {
    $$(".modal").forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) closeDialog(dialog);
      });
    });

    document.addEventListener("click", (event) => {
      const closeButton = event.target.closest("[data-close-dialog]");
      if (!closeButton) return;
      closeDialog(closeButton.closest("dialog"));
    });
  }

  function askConfirm(title, text, onConfirm) {
    const titleEl = $("#confirmTitle");
    const textEl = $("#confirmText");
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
    confirmCallback = onConfirm;
    openDialog($("#confirmDialog"));
  }

  function initConfirm() {
    const action = $("#confirmActionBtn");
    if (!action) return;
    action.addEventListener("click", () => {
      const callback = confirmCallback;
      confirmCallback = null;
      closeDialog($("#confirmDialog"));
      if (typeof callback === "function") callback();
    });
  }

  function initGlobalFeedback() {
    document.addEventListener(
      "pointerdown",
      (event) => {
        const target = event.target.closest("button, a, [role='button']");
        if (!target || target.disabled || target.getAttribute("aria-disabled") === "true") return;
        vibrate(6);
        ensureAudioContext();
      },
      { passive: true }
    );
  }

  /* =========================================================
     ИНСТАЛАЦИЈА
     ========================================================= */
  function isStandaloneMode() {
    return (
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      navigator.standalone === true
    );
  }

  function bannerWasDismissed() {
    const dismissedAt = Number(storageGet("installDismissedAt", 0)) || 0;
    return dismissedAt > 0 && Date.now() - dismissedAt < 7 * 86400000;
  }

  function refreshInstallUI() {
    const installed = appWasInstalled || isStandaloneMode();
    const banner = $("#installBanner");
    const topButton = $("#installTopBtn");
    const profileButton = $("#profileInstallBtn");
    const profileTitle = $("#profileInstallTitle");
    const profileText = $("#profileInstallText");

    if (installed) {
      if (banner) banner.hidden = true;
      if (topButton) topButton.hidden = true;
      if (profileButton) {
        profileButton.disabled = true;
        profileButton.setAttribute("aria-disabled", "true");
      }
      if (profileTitle) profileTitle.textContent = "Апликацијата е инсталирана";
      if (profileText) profileText.textContent = "Се отвора како самостојна апликација";
      return;
    }

    if (topButton) topButton.hidden = false;
    if (profileButton) {
      profileButton.disabled = false;
      profileButton.removeAttribute("aria-disabled");
    }

    if (deferredInstallPrompt) {
      if (profileTitle) profileTitle.textContent = "Инсталирај на телефон";
      if (profileText) profileText.textContent = "Брз пристап и целосна офлајн работа";
    } else if (IS_IOS) {
      if (profileTitle) profileTitle.textContent = "Додај на почетен екран";
      if (profileText) profileText.textContent = "Види ги чекорите за iPhone и iPad";
    } else {
      if (profileTitle) profileTitle.textContent = "Како да инсталирам?";
      if (profileText) profileText.textContent = "Отвори кратко упатство за инсталација";
    }

    if (banner) {
      banner.hidden = bannerWasDismissed() || (!deferredInstallPrompt && !IS_IOS);
    }
  }

  function installGuideMarkup() {
    if (IS_IOS) {
      const inApp = isIosInAppBrowser();
      return (
        '<ol class="install-steps">' +
        (inApp
          ? "<li>Отвори го менито <strong>⋯</strong> горе и избери <strong>„Отвори во Safari“</strong> — само Safari може да инсталира.</li>"
          : "<li>Отвори ја оваа страница во <strong>Safari</strong> на твојот iPhone или iPad.</li>") +
        "<li>Допри ја иконата <strong>Сподели</strong> (квадратче со стрелка) во долниот дел од екранот.</li>" +
        "<li>Скролувај и избери <strong>„Додај на почетен екран“</strong>.</li>" +
        "<li>Допри <strong>„Додај“</strong> — училишниот портал ќе се појави како апликација.</li>" +
        "</ol>"
      );
    }
    return (
      '<ol class="install-steps">' +
      "<li>Отвори го менито на прелистувачот — <strong>⋮</strong> на Android или менито со три точки на десктоп.</li>" +
      "<li>Избери <strong>„Инсталирај апликација“</strong> или <strong>„Додај на почетен екран“</strong>.</li>" +
      "<li>Потврди со <strong>„Инсталирај“</strong>. Порталот ќе се отвора без адресна лента.</li>" +
      "</ol>"
    );
  }

  function showInstallGuide() {
    const steps = $("#installSteps");
    const tip = $("#installTip");
    if (steps) steps.innerHTML = installGuideMarkup();
    if (tip) {
      if (IS_IOS) {
        tip.textContent = isIosInAppBrowser()
          ? "Совет: отвори ја страницата во Safari, па додај ја на почетен екран."
          : "Совет: на iOS инсталацијата е достапна само преку Safari.";
      } else {
        tip.textContent =
          "Порталот работи офлајн и ги зачувува твоите податоци локално на уредот.";
      }
    }
    openDialog($("#installDialog"));
  }

  async function triggerInstall() {
    if (isStandaloneMode() || appWasInstalled) return;

    if (deferredInstallPrompt) {
      const promptEvent = deferredInstallPrompt;
      deferredInstallPrompt = null;
      window.__schoolDeferredInstall = null;
      try {
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === "accepted") {
          const banner = $("#installBanner");
          if (banner) banner.hidden = true;
          showToast("Апликацијата се инсталира…", { icon: "download" });
        } else {
          refreshInstallUI();
        }
      } catch (error) {
        refreshInstallUI();
        showInstallGuide();
      }
    } else {
      showInstallGuide();
    }
  }

  function initInstall() {
    refreshInstallUI();

    window.addEventListener("school-installable", () => {
      deferredInstallPrompt = window.__schoolDeferredInstall || null;
      refreshInstallUI();
    });

    window.addEventListener("appinstalled", () => {
      appWasInstalled = true;
      deferredInstallPrompt = null;
      window.__schoolDeferredInstall = null;
      refreshInstallUI();
      showToast("Порталот е инсталиран. Отвори го од почетниот екран.", {
        icon: "sparkles",
        duration: 3800
      });
    });

    const topButton = $("#installTopBtn");
    const bannerButton = $("#installBannerBtn");
    const profileButton = $("#profileInstallBtn");
    const dismissButton = $("#installDismissBtn");

    if (topButton) topButton.addEventListener("click", triggerInstall);
    if (bannerButton) bannerButton.addEventListener("click", triggerInstall);
    if (profileButton) profileButton.addEventListener("click", triggerInstall);

    if (dismissButton) {
      dismissButton.addEventListener("click", () => {
        storageSet("installDismissedAt", Date.now());
        const banner = $("#installBanner");
        if (banner) banner.hidden = true;
      });
    }
  }

  /* =========================================================
     МРЕЖА И SERVICE WORKER
     ========================================================= */
  function updateOnlineState(isInitial) {
    const online = navigator.onLine;
    const bar = $("#offlineBar");
    if (bar) bar.hidden = online;
    if (!online && !isInitial) {
      showToast("Нема интернет. Продолжи — порталот работи офлајн.", {
        icon: "wifi-off",
        tone: "warning",
        duration: 3200
      });
    }
  }

  function initNetwork() {
    updateOnlineState(true);
    window.addEventListener("online", () => updateOnlineState(false));
    window.addEventListener("offline", () => updateOnlineState(false));
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    const localHosts = ["localhost", "127.0.0.1", "::1"];
    const isLocal = localHosts.includes(window.location.hostname);
    if (window.location.protocol !== "https:" && !(window.location.protocol === "http:" && isLocal)) {
      return;
    }
    try {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    } catch (error) {}
  }

  /* =========================================================
     ВЕСТИ
     ========================================================= */
  function persistNews() {
    storageSet("news", state.news);
  }

  function newsMarkup(item) {
    const category = NEWS_CATEGORIES[item.category] || NEWS_CATEGORIES.announcement;
    return (
      '<article class="card news-card' +
      (item.pinned ? " is-pinned" : "") +
      '" data-news-id="' +
      escapeHTML(item.id) +
      '">' +
      '<div class="news-card-head">' +
      '<span class="news-category" data-category="' +
      escapeHTML(item.category || "announcement") +
      '">' +
      iconMarkup(category.icon) +
      escapeHTML(category.label) +
      "</span>" +
      (item.pinned
        ? '<span class="news-pin">' + iconMarkup("pin") + "Истакнато</span>"
        : "") +
      "</div>" +
      "<h3>" +
      escapeHTML(item.title) +
      "</h3>" +
      '<p class="news-body">' +
      escapeHTML(item.body).replace(/\n/g, "<br>") +
      "</p>" +
      '<div class="news-footer">' +
      '<div class="news-meta">' +
      iconMarkup("clock") +
      "<span>" +
      escapeHTML(formatDate(item.date)) +
      " · " +
      escapeHTML(item.author || "Училиште") +
      "</span>" +
      "</div>" +
      '<button class="news-more" type="button" data-news-toggle aria-expanded="false">' +
      "<span>Прочитај повеќе</span>" +
      iconMarkup("chevron-down") +
      "</button>" +
      "</div>" +
      "</article>"
    );
  }

  function renderNews() {
    const list = $("#newsList");
    const empty = $("#newsEmpty");
    const label = $("#newsFilterLabel");
    if (!list) return;

    const sorted = state.news
      .slice()
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.date - a.date);
    const visible =
      state.newsFilter === "all"
        ? sorted
        : sorted.filter((item) => item.category === state.newsFilter);

    list.innerHTML = visible.map(newsMarkup).join("");
    if (empty) empty.hidden = visible.length > 0;

    if (label) {
      const names = {
        all: "Сите",
        announcement: "Соопштенија",
        event: "Настани",
        success: "Успеси",
        project: "Проекти"
      };
      label.innerHTML = iconMarkup("filter") + " " + escapeHTML(names[state.newsFilter] || "Сите");
    }

    $$("#newsFilters [data-news-filter]").forEach((button) => {
      const active = button.dataset.newsFilter === state.newsFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const count = $("#newsCount");
    if (count) count.textContent = String(state.news.length);
    updateUnreadIndicators();
  }

  function initNews() {
    const filters = $("#newsFilters");
    const list = $("#newsList");
    const reset = $("#newsResetFilterBtn");

    if (filters) {
      filters.addEventListener("click", (event) => {
        const button = event.target.closest("[data-news-filter]");
        if (!button) return;
        state.newsFilter = button.dataset.newsFilter;
        vibrate(7);
        renderNews();
      });
    }

    if (list) {
      list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-news-toggle]");
        if (!button) return;
        const card = button.closest(".news-card");
        if (!card) return;
        const expanded = card.classList.toggle("is-expanded");
        button.setAttribute("aria-expanded", String(expanded));
        const text = button.querySelector("span");
        if (text) text.textContent = expanded ? "Прикажи помалку" : "Прочитај повеќе";
        vibrate(5);
      });
    }

    if (reset) {
      reset.addEventListener("click", () => {
        state.newsFilter = "all";
        renderNews();
      });
    }
  }

  /* =========================================================
     ГРУПИ
     ========================================================= */
  function persistGroups() {
    storageSet("groups", state.groups);
  }

  function groupMessageMarkup(message) {
    return (
      '<div class="group-message">' +
      '<span class="group-message-avatar" aria-hidden="true">' +
      escapeHTML(initialsFromName(message.author)) +
      "</span>" +
      '<div class="group-message-main">' +
      '<div class="group-message-head"><strong>' +
      escapeHTML(message.author) +
      "</strong><time>" +
      escapeHTML(formatMessageTime(message.date)) +
      "</time></div>" +
      "<p>" +
      escapeHTML(message.text) +
      "</p>" +
      "</div>" +
      "</div>"
    );
  }

  function groupMarkup(group) {
    const messages = Array.isArray(group.messages) ? group.messages : [];
    const last = messages[messages.length - 1];
    const snippet = last ? last.author + ": " + last.text : "Сè уште нема пораки. Започни го разговорот.";
    const memberCount = Array.isArray(group.members) ? group.members.length : Number(group.members || 0);
    return (
      '<article class="card group-card" data-group-id="' +
      escapeHTML(group.id) +
      '">' +
      '<button class="group-head" type="button" data-group-open aria-label="Отвори група ' +
      escapeHTML(group.name) +
      '">' +
      '<span class="group-icon">' +
      iconMarkup(group.icon || "groups") +
      "</span>" +
      '<span class="group-copy">' +
      '<span class="group-name">' +
      escapeHTML(group.name) +
      "</span>" +
      '<span class="group-meta">' +
      "<span>" +
      iconMarkup("groups") +
      escapeHTML(String(memberCount)) +
      " членови</span>" +
      "<span>" +
      iconMarkup("mail") +
      escapeHTML(String(messages.length)) +
      " пораки</span>" +
      "</span>" +
      '<span class="group-snippet">' +
      escapeHTML(snippet) +
      "</span>" +
      "</span>" +
      '<span class="group-chevron">' +
      iconMarkup("chevron-down") +
      "</span>" +
      "</button>" +
      "</article>"
    );
  }

  function activeGroup() {
    return state.groups.find((group) => group.id === activeGroupId) || null;
  }

  function renderGroupScreen() {
    const screen = $("#groupScreen");
    if (!screen) return;
    const group = activeGroup();
    if (!group) {
      screen.hidden = true;
      screen.classList.remove("is-open");
      document.documentElement.classList.remove("has-group-screen");
      return;
    }

    const messages = Array.isArray(group.messages) ? group.messages : [];
    const members = Array.isArray(group.members) ? group.members : [];
    const admins = Array.isArray(group.admins) ? group.admins : [];
    const teacher = isTeacher();
    const isAdmin = teacher && admins.includes(state.profile.id || state.profile.name);

    const title = $("#groupScreenTitle");
    const meta = $("#groupScreenMeta");
    const box = $("#groupScreenMessages");
    const addBtn = $("#groupAddMembersBtn");

    if (title) title.textContent = group.name;
    if (meta) {
      meta.textContent =
        String(members.length) +
        " членови · " +
        String(messages.length) +
        (messages.length === 1 ? " порака" : " пораки") +
        (isAdmin ? "  (Вие сте администратор)" : "");
    }
    if (box) {
      box.innerHTML = messages.length
        ? messages.map(groupMessageMarkup).join("")
        : '<p class="group-screen-empty">Сè уште нема пораки. Напиши ја првата.</p>';
    }
    if (addBtn) {
      addBtn.hidden = !(teacher && isAdmin);
    }

    screen.hidden = false;
    screen.classList.add("is-open");
    document.documentElement.classList.add("has-group-screen");
    if (box) box.scrollTop = box.scrollHeight;
  }

  function openGroupScreen(id) {
    if (!state.groups.some((group) => group.id === id)) return;
    activeGroupId = id;
    vibrate(6);
    renderGroupScreen();
    const back = $("#groupBackBtn");
    if (back) window.setTimeout(() => back.focus({ preventScroll: true }), 80);
  }

  function closeGroupScreen() {
    if (!activeGroupId) return;
    const id = activeGroupId;
    activeGroupId = null;
    renderGroupScreen();
    if (state.activeTab !== "groups") return;
    const button = $$("[data-group-open]").find((element) => {
      const card = element.closest("[data-group-id]");
      return card && card.dataset.groupId === id;
    });
    if (button) button.focus({ preventScroll: true });
  }

  function renderGroups() {
    const list = $("#groupList");
    const empty = $("#groupsEmpty");
    const count = $("#groupsCount");
    if (!list) return;

    list.innerHTML = state.groups.map(groupMarkup).join("");
    if (empty) empty.hidden = state.groups.length > 0;
    if (count) count.textContent = String(state.groups.length);
    if (activeGroupId) renderGroupScreen();
  }

  function initGroups() {
    const list = $("#groupList");
    const screen = $("#groupScreen");
    const form = $("#groupScreenForm");
    const input = $("#groupScreenInput");
    const back = $("#groupBackBtn");
    const renameButton = $("#groupRenameBtn");
    const renameDialog = $("#renameGroupDialog");
    const renameForm = $("#renameGroupForm");
    const renameInput = $("#renameGroupInput");
    const addGroupBtn = $("#addGroupBtn");
    const addGroupDialog = $("#addGroupDialog");
    const addGroupForm = $("#addGroupForm");
    const addGroupName = $("#addGroupNameInput");
    const addGroupSubject = $("#addGroupSubjectInput");
    const addGroupIcon = $("#addGroupIconInput");
    const addMembersBtn = $("#groupAddMembersBtn");
    const addMembersDialog = $("#addMembersDialog");
    const addMembersForm = $("#addMembersForm");
    const addMembersList = $("#addMembersList");
    const addMembersConfirm = $("#addMembersConfirmBtn");
    let selectedMemberIds = new Set();

    const demoUsers = [
      { id: "u-ana", name: "Ана Стојаноска", role: "Ученик" },
      { id: "u-marko", name: "Марко Ристески", role: "Ученик" },
      { id: "u-ivana", name: "Ивана Трајкоска", role: "Ученик" },
      { id: "u-luka", name: "Лука Николоски", role: "Ученик" },
      { id: "u-sara", name: "Сара Дукоска", role: "Ученик" },
      { id: "u-prof-mk", name: "Наставничка по македонски", role: "Наставник" },
      { id: "u-prof-math", name: "Наставник по математика", role: "Наставник" },
      { id: "u-prof-en", name: "Наставничка по англиски", role: "Наставник" },
      { id: "u-prof-sci", name: "Наставничка по природни науки", role: "Наставник" },
      { id: "u-prof-hist", name: "Наставник по историја", role: "Наставник" },
      { id: "u-class", name: "Одделенски раководител", role: "Наставник" }
    ];

    if (list) {
      list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-group-open]");
        if (!button) return;
        const card = button.closest("[data-group-id]");
        if (!card) return;
        openGroupScreen(card.dataset.groupId);
      });
    }

    if (back) back.addEventListener("click", closeGroupScreen);

    if (screen) {
      screen.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeGroupScreen();
        }
      });
    }

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const group = activeGroup();
        if (!group || !input) return;

        const text = input.value.trim();
        if (!text) {
          input.focus();
          return;
        }

        if (!Array.isArray(group.messages)) group.messages = [];
        group.messages.push({
          id: uid(),
          author: (state.profile.name || "Ученик").trim() || "Ученик",
          text: text,
          date: Date.now()
        });
        persistGroups();
        input.value = "";
        renderGroupScreen();
        renderGroups();
        showToast("Пораката е испратена.", { icon: "send" });
      });
    }

    if (renameButton) {
      renameButton.addEventListener("click", () => {
        const group = activeGroup();
        if (!group || !renameInput) return;
        renameInput.value = group.name;
        openDialog(renameDialog);
        window.setTimeout(() => {
          renameInput.focus();
          renameInput.select();
        }, 60);
      });
    }

    if (renameForm) {
      renameForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const group = activeGroup();
        if (!group || !renameInput) return;

        const name = renameInput.value.trim();
        if (!name) {
          renameInput.focus();
          return;
        }

        group.name = name;
        persistGroups();
        closeDialog(renameDialog);
        renderGroupScreen();
        renderGroups();
        vibrate(8);
        showToast("Името на групата е зачувано.", { icon: "check" });
      });
    }

    /* --- Додај нова група --- */
    if (addGroupBtn) {
      addGroupBtn.addEventListener("click", () => {
        if (addGroupName) addGroupName.value = "";
        if (addGroupSubject) addGroupSubject.value = "";
        if (addGroupIcon) addGroupIcon.value = "groups";
        openDialog(addGroupDialog);
        window.setTimeout(() => {
          if (addGroupName) addGroupName.focus();
        }, 60);
      });
    }

    if (addGroupForm) {
      addGroupForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = addGroupName ? addGroupName.value.trim() : "";
        if (!name) {
          if (addGroupName) addGroupName.focus();
          return;
        }
        const subject = addGroupSubject ? addGroupSubject.value.trim() : "";
        const icon = addGroupIcon ? addGroupIcon.value : "groups";
        const meId = state.profile.id || "u-me";
        const meName = (state.profile.name || "Ученик").trim() || "Ученик";
        const meRole = state.profile.role || "student";
        const newGroup = {
          id: "group-" + uid(),
          name: name,
          subject: subject,
          icon: icon,
          admins: [meId],
          members: [{ id: meId, name: meName, role: meRole }],
          messages: []
        };
        state.groups.push(newGroup);
        persistGroups();
        closeDialog(addGroupDialog);
        renderGroups();
        vibrate(8);
        showToast("Групата \"" + escapeHTML(name) + "\" е креирана.", { icon: "plus" });
      });
    }

    /* --- Додај членови (само за наставници-администратори) --- */
    if (addMembersBtn) {
      addMembersBtn.addEventListener("click", () => {
        const group = activeGroup();
        if (!group || !addMembersList || !addMembersConfirm) return;
        const members = Array.isArray(group.members) ? group.members : [];
        const presentIds = new Set(members.map((m) => m.id));
        selectedMemberIds = new Set();
        addMembersList.innerHTML = demoUsers
          .filter((u) => !presentIds.has(u.id))
          .map(
            (u) =>
              '<div class="member-item">' +
              '<input type="checkbox" id="member-' +
              escapeHTML(u.id) +
              '" data-member-id="' +
              escapeHTML(u.id) +
              '">' +
              '<div class="member-copy">' +
              '<strong>' +
              escapeHTML(u.name) +
              "</strong>" +
              '<span>' +
              escapeHTML(u.role) +
              "</span>" +
              '<svg class="icon"><use href="#i-check"></use></svg>' +
              "</div>" +
              "</div>"
          )
          .join("");
        addMembersConfirm.disabled = true;
        addMembersConfirm.textContent = "Додај избрани";
        const title = $("#addMembersTitle");
        if (title) title.textContent = "Додај пријатели во \"" + escapeHTML(group.name) + "\"";
        openDialog(addMembersDialog);
      });
    }

    if (addMembersList) {
      addMembersList.addEventListener("change", (event) => {
        const checkbox = event.target.closest("input[data-member-id]");
        if (!checkbox) return;
        if (checkbox.checked) selectedMemberIds.add(checkbox.dataset.memberId);
        else selectedMemberIds.delete(checkbox.dataset.memberId);
        if (addMembersConfirm) {
          addMembersConfirm.disabled = selectedMemberIds.size === 0;
          addMembersConfirm.textContent =
            "Додај избрани (" + selectedMemberIds.size + ")";
        }
      });
    }

    if (addMembersForm) {
      addMembersForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const group = activeGroup();
        if (!group) return;
        if (!Array.isArray(group.members)) group.members = [];
        const presentIds = new Set(group.members.map((m) => m.id));
        let added = 0;
        for (const id of selectedMemberIds) {
          if (presentIds.has(id)) continue;
          const user = demoUsers.find((u) => u.id === id);
          if (user) {
            group.members.push({ id: user.id, name: user.name, role: user.role });
            presentIds.add(id);
            added++;
          }
        }
        if (added === 0) {
          closeDialog(addMembersDialog);
          return;
        }
        persistGroups();
        closeDialog(addMembersDialog);
        renderGroupScreen();
        renderGroups();
        vibrate(8);
        showToast(
          added === 1
            ? "Членот е додаден во групата."
            : "Додадени се " + added + " членови во групата.",
          { icon: "user" }
        );
      });
    }
  }

  /* =========================================================
     РАСПОРЕД
     ========================================================= */
  function weekDates() {
    const now = new Date();
    const offset = (now.getDay() + 6) % 7;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    return [0, 1, 2, 3, 4].map((index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  }

  function minutesFromTime(value) {
    const parts = String(value || "").split(":");
    if (parts.length !== 2) return 0;
    return Number(parts[0]) * 60 + Number(parts[1]);
  }

  function renderSchedule() {
    const list = $("#scheduleList");
    const days = $("#scheduleDays");
    const label = $("#scheduleLabel");
    const todayPill = $("#scheduleToday");
    if (!list || !days) return;

    const dates = weekDates();
    const now = new Date();
    const todayIndex = (now.getDay() + 6) % 7;

    days.innerHTML = SCHEDULE.map((day, index) => {
      const date = dates[index];
      const active = state.scheduleDay === index;
      return (
        '<button class="day-tab' +
        (active ? " is-active" : "") +
        '" type="button" role="tab" aria-selected="' +
        String(active) +
        '" data-day-index="' +
        index +
        '">' +
        "<span>" +
        escapeHTML(MACEDONIAN_WEEKDAYS_SHORT[index + 1]) +
        "</span>" +
        "<small>" +
        date.getDate() +
        "</small>" +
        "</button>"
      );
    }).join("");

    const day = SCHEDULE[state.scheduleDay] || SCHEDULE[0];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const isToday = state.scheduleDay === todayIndex;

    list.innerHTML = day.lessons
      .map((lesson, index) => {
        const isNow =
          isToday &&
          nowMinutes >= minutesFromTime(lesson.start) &&
          nowMinutes <= minutesFromTime(lesson.end);
        return (
          '<div class="schedule-row' +
          (isNow ? " is-now" : "") +
          '" role="listitem">' +
          '<span class="schedule-index">' +
          (index + 1) +
          "</span>" +
          '<span class="schedule-main"><strong>' +
          escapeHTML(lesson.subject) +
          "</strong><span>" +
          escapeHTML(lesson.start + " – " + lesson.end) +
          "</span></span>" +
          '<span class="schedule-room">' +
          escapeHTML(lesson.room) +
          "</span>" +
          "</div>"
        );
      })
      .join("");

    if (label) {
      label.textContent =
        day.name + " · " + day.lessons.length + (day.lessons.length === 1 ? " час" : " часа");
    }
    if (todayPill) {
      todayPill.textContent = "Денес · " + now.getDate() + "." + (now.getMonth() + 1);
    }
    if (days && isToday) {
      const activeTab = $('[data-day-index="' + todayIndex + '"]', days);
      if (activeTab) activeTab.classList.add("is-today");
    }
  }

  function initSchedule() {
    const days = $("#scheduleDays");
    if (days) {
      days.addEventListener("click", (event) => {
        const button = event.target.closest("[data-day-index]");
        if (!button) return;
        state.scheduleDay = clamp(Number(button.dataset.dayIndex) || 0, 0, 4);
        vibrate(6);
        renderSchedule();
      });
    }

    window.setInterval(() => {
      if (state.activeTab === "school") renderSchedule();
    }, 60000);
  }

  /* =========================================================
     ТЕСТОВИ И ДОМАШНИ
     ========================================================= */
  function persistAssignments() {
    storageSet("assignments", state.assignments);
  }

  function sortedAssignments() {
    return state.assignments.slice().sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const aDue = dateFromISO(a.due);
      const bDue = dateFromISO(b.due);
      const aTime = aDue ? aDue.getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = bDue ? bDue.getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
  }

  function assignmentMarkup(item) {
    const type = ASSIGNMENT_TYPES[item.type] || ASSIGNMENT_TYPES.homework;
    const due = dueMeta(item.due, item.completed);
    return (
      '<article class="task-item' +
      (item.completed ? " is-completed" : "") +
      '" data-assignment-id="' +
      escapeHTML(item.id) +
      '" role="listitem">' +
      '<button class="task-check" type="button" data-assignment-action="toggle" aria-pressed="' +
      String(item.completed) +
      '" aria-label="' +
      (item.completed ? "Означи како незавршена" : "Означи како завршена") +
      '">' +
      iconMarkup("check") +
      "</button>" +
      '<div class="task-body">' +
      '<p class="task-title">' +
      escapeHTML(item.title) +
      "</p>" +
      '<div class="task-meta">' +
      '<span class="type-tag type-' +
      escapeHTML(item.type || "homework") +
      '">' +
      escapeHTML(type.label) +
      "</span>" +
      '<span class="subject-tag">' +
      escapeHTML(item.subject || "Предмет") +
      "</span>" +
      (item.completed
        ? '<span class="due-tag">Завршено</span>'
        : '<span class="due-tag ' +
          escapeHTML(due.className) +
          '">' +
          escapeHTML(due.text) +
          "</span>") +
      "</div>" +
      "</div>" +
      '<div class="task-actions">' +
      '<button class="task-action" type="button" data-assignment-action="edit" aria-label="Уреди задача">' +
      iconMarkup("edit") +
      "</button>" +
      '<button class="task-action" type="button" data-assignment-action="delete" aria-label="Избриши задача">' +
      iconMarkup("trash") +
      "</button>" +
      "</div>" +
      "</article>"
    );
  }

  function updateAssignmentProgress() {
    const total = state.assignments.length;
    const done = state.assignments.filter((item) => item.completed).length;
    const progress = $("#assignmentProgress");
    if (progress) progress.textContent = done + "/" + total;
    const profileDone = $("#profileTasksDone");
    if (profileDone) profileDone.textContent = String(done);
  }

  function renderAssignments() {
    const list = $("#assignmentList");
    const empty = $("#assignmentEmpty");
    if (!list) return;

    const all = sortedAssignments();
    const visible =
      state.assignmentFilter === "active"
        ? all.filter((item) => !item.completed)
        : state.assignmentFilter === "done"
          ? all.filter((item) => item.completed)
          : all;

    list.innerHTML = visible.map(assignmentMarkup).join("");
    if (empty) {
      empty.hidden = visible.length > 0;
      const title = $("strong", empty);
      const text = $("p", empty);
      if (title && text) {
        if (!state.assignments.length) {
          title.textContent = "Нема задачи";
          text.textContent = "Додај тест, домашна или проект и следи го рокот.";
        } else if (state.assignmentFilter === "active") {
          title.textContent = "Нема активни задачи";
          text.textContent = "Одлично! Сите твои задачи се завршени.";
        } else if (state.assignmentFilter === "done") {
          title.textContent = "Нема завршени задачи";
          text.textContent = "Означи задача со кругчето кога ќе ја завршиш.";
        }
      }
    }

    $$("#assignmentFilters [data-assignment-filter]").forEach((button) => {
      const active = button.dataset.assignmentFilter === state.assignmentFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    updateAssignmentProgress();
    updateProfileStats();
  }

  function openAssignmentEditor(item) {
    const idField = $("#editAssignmentId");
    const titleField = $("#editAssignmentTitle");
    const subjectField = $("#editAssignmentSubject");
    const typeField = $("#editAssignmentType");
    const dueField = $("#editAssignmentDue");
    if (!item || !titleField) return;

    if (idField) idField.value = item.id;
    titleField.value = item.title;
    if (subjectField) {
      const exists = $$("option", subjectField).some((option) => option.value === item.subject);
      if (!exists && item.subject) {
        const option = document.createElement("option");
        option.value = item.subject;
        option.textContent = item.subject;
        subjectField.appendChild(option);
      }
      subjectField.value = item.subject || subjectField.options[0].value;
    }
    if (typeField) typeField.value = item.type || "homework";
    if (dueField) dueField.value = item.due || isoInDays(3);
    openDialog($("#assignmentDialog"));
    window.setTimeout(() => titleField.focus(), 90);
  }

  function initAssignments() {
    const form = $("#assignmentForm");
    const list = $("#assignmentList");
    const filters = $("#assignmentFilters");
    const editForm = $("#assignmentEditForm");
    const dueInput = $("#assignmentDue");

    if (dueInput && !dueInput.value) dueInput.value = isoInDays(3);

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const titleInput = $("#assignmentTitle");
        const subjectInput = $("#assignmentSubject");
        const typeInput = $("#assignmentType");
        const title = titleInput ? titleInput.value.trim() : "";
        if (!title) {
          if (titleInput) titleInput.focus();
          return;
        }
        const due = dueInput && dueInput.value ? dueInput.value : isoInDays(3);

        state.assignments.unshift({
          id: uid(),
          title: title,
          subject: subjectInput ? subjectInput.value : "Македонски јазик",
          type: typeInput ? typeInput.value : "test",
          due: due,
          completed: false,
          createdAt: Date.now()
        });
        persistAssignments();
        if (titleInput) titleInput.value = "";
        if (dueInput) dueInput.value = isoInDays(3);
        renderAssignments();
        showToast("Задачата е додадена.", { icon: "clipboard" });
      });
    }

    if (filters) {
      filters.addEventListener("click", (event) => {
        const button = event.target.closest("[data-assignment-filter]");
        if (!button) return;
        state.assignmentFilter = button.dataset.assignmentFilter;
        vibrate(7);
        renderAssignments();
      });
    }

    if (list) {
      list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-assignment-action]");
        if (!button) return;
        const card = button.closest("[data-assignment-id]");
        if (!card) return;
        const item = state.assignments.find((entry) => entry.id === card.dataset.assignmentId);
        if (!item) return;
        const action = button.dataset.assignmentAction;

        if (action === "toggle") {
          item.completed = !item.completed;
          persistAssignments();
          renderAssignments();
          if (item.completed) {
            showToast("Браво! Задачата е завршена.", { icon: "sparkles" });
            if (state.sound) playChime("quiz");
          } else {
            showToast("Задачата е вратена во активни.", { icon: "refresh" });
          }
        } else if (action === "edit") {
          openAssignmentEditor(item);
        } else if (action === "delete") {
          state.assignments = state.assignments.filter((entry) => entry.id !== item.id);
          persistAssignments();
          renderAssignments();
          showToast("Задачата е избришана.", { icon: "trash" });
        }
      });
    }

    if (editForm) {
      editForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const id = $("#editAssignmentId") ? $("#editAssignmentId").value : "";
        const item = state.assignments.find((entry) => entry.id === id);
        if (!item) return;
        const titleField = $("#editAssignmentTitle");
        const title = titleField ? titleField.value.trim() : "";
        if (!title) {
          if (titleField) titleField.focus();
          return;
        }
        item.title = title;
        item.subject = $("#editAssignmentSubject") ? $("#editAssignmentSubject").value : item.subject;
        item.type = $("#editAssignmentType") ? $("#editAssignmentType").value : item.type;
        item.due = $("#editAssignmentDue") && $("#editAssignmentDue").value
          ? $("#editAssignmentDue").value
          : item.due;
        persistAssignments();
        renderAssignments();
        closeDialog($("#assignmentDialog"));
        showToast("Задачата е ажурирана.", { icon: "check" });
      });
    }

    renderAssignments();
  }

  /* =========================================================
     ИЗВЕСТУВАЊА
     ========================================================= */
  function persistNotifications() {
    storageSet("notifications", state.notifications);
  }

  function updateUnreadIndicators() {
    const unread = state.notifications.filter((item) => !item.read).length;
    const hero = $("#heroUnread");
    if (hero) hero.textContent = String(unread);
    const pill = $("#notifUnreadCount");
    if (pill) pill.textContent = String(unread);
    const badge = $("#navUnread");
    if (badge) {
      badge.textContent = unread > 9 ? "9+" : String(unread);
      badge.hidden = unread === 0;
    }
  }

  function notificationMarkup(item) {
    const type = NOTIFICATION_TYPES[item.type] || NOTIFICATION_TYPES.info;
    return (
      '<article class="notif-item' +
      (item.read ? "" : " is-unread") +
      '" data-notif-id="' +
      escapeHTML(item.id) +
      '" role="listitem">' +
      '<span class="notif-icon" data-type="' +
      escapeHTML(item.type || "info") +
      '">' +
      iconMarkup(type.icon) +
      "</span>" +
      '<div class="notif-copy">' +
      "<strong>" +
      escapeHTML(item.title) +
      "</strong>" +
      "<p>" +
      escapeHTML(item.body) +
      "</p>" +
      '<div class="notif-meta"><span>' +
      escapeHTML(formatRelative(item.date)) +
      ", " +
      escapeHTML(formatTime(item.date)) +
      "</span><span>·</span><span>" +
      escapeHTML(type.label) +
      "</span>" +
      (item.read ? "" : '<span class="unread-dot" aria-hidden="true"></span>') +
      "</div>" +
      "</div>" +
      '<button class="notif-mark" type="button" data-notif-read aria-label="Означи како прочитано">' +
      iconMarkup("check") +
      "</button>" +
      "</article>"
    );
  }

  function renderNotifications() {
    const list = $("#notifList");
    const empty = $("#notifEmpty");
    const count = $("#notifCount");
    if (!list) return;

    const sorted = state.notifications
      .slice()
      .sort((a, b) => b.date - a.date);

    list.innerHTML = sorted.map(notificationMarkup).join("");
    if (empty) empty.hidden = sorted.length > 0;
    if (count) count.textContent = String(sorted.length);
    updateUnreadIndicators();
  }

  function pushNotification(title, body, type) {
    state.notifications.unshift({
      id: uid(),
      title: title,
      body: body,
      type: type || "info",
      date: Date.now(),
      read: false
    });
    persistNotifications();
    renderNotifications();
  }

  function initNotifications() {
    const toggle = $("#soundToggle");
    const markAll = $("#markAllReadBtn");
    const clearRead = $("#clearReadBtn");
    const list = $("#notifList");

    if (toggle) {
      toggle.checked = state.sound;
      toggle.addEventListener("change", () => {
        state.sound = toggle.checked;
        storageSet("sound", state.sound);
        if (state.sound) {
          playChime("quiz");
          showToast("Звучните известувања се вклучени.", { icon: "sound-on" });
        } else {
          showToast("Звучните известувања се исклучени.", { icon: "sound-off" });
        }
      });
    }

    if (markAll) {
      markAll.addEventListener("click", () => {
        if (!state.notifications.length) {
          showToast("Нема известувања за означување.", { icon: "bell" });
          return;
        }
        state.notifications.forEach((item) => {
          item.read = true;
        });
        persistNotifications();
        renderNotifications();
        showToast("Сите известувања се прочитани.", { icon: "check" });
      });
    }

    if (clearRead) {
      clearRead.addEventListener("click", () => {
        const readCount = state.notifications.filter((item) => item.read).length;
        if (!readCount) {
          showToast("Нема прочитани известувања.", { icon: "bell" });
          return;
        }
        askConfirm(
          "Исчисти прочитани?",
          "Ќе се отстранат " + readCount + " прочитани известувања од овој уред.",
          () => {
            state.notifications = state.notifications.filter((item) => !item.read);
            persistNotifications();
            renderNotifications();
            showToast("Прочитаните известувања се исчистени.", { icon: "trash" });
          }
        );
      });
    }

    if (list) {
      list.addEventListener("click", (event) => {
        const card = event.target.closest("[data-notif-id]");
        if (!card) return;
        const item = state.notifications.find((entry) => entry.id === card.dataset.notifId);
        if (!item) return;
        const markButton = event.target.closest("[data-notif-read]");
        if (item.read && !markButton) return;
        item.read = true;
        persistNotifications();
        renderNotifications();
        if (markButton) vibrate(5);
      });
    }
  }

  /* =========================================================
     ИНФО
     ========================================================= */
  async function copyToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {}
    }
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      area.style.pointerEvents = "none";
      document.body.appendChild(area);
      area.select();
      area.setSelectionRange(0, area.value.length);
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch (error) {
      return false;
    }
  }

  async function sharePortal() {
    const url = window.location.href.split("#")[0];
    const data = {
      title: "Училишен портал · ООУ „Д-р Владимир Полежиноски“",
      text: "Официјалниот дигитален портал на ООУ „Д-р Владимир Полежиноски“ – Кичево: вести, распоред, тестови и алатки.",
      url: url
    };

    if (navigator.share) {
      try {
        await navigator.share(data);
        showToast("Ти благодариме што го сподели порталот.", { icon: "share" });
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }

    const copied = await copyToClipboard(url);
    showToast(
      copied ? "Линкот до порталот е копиран." : "Не успеавме да го копираме линкот.",
      { icon: copied ? "copy" : "warning", tone: copied ? "" : "error" }
    );
  }

  function initInfo() {
    const copyButton = $("#copyAddressBtn");
    const shareButton = $("#infoShareBtn");

    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        const text = SCHOOL.name + ", " + SCHOOL.address;
        const copied = await copyToClipboard(text);
        showToast(
          copied ? "Адресата е копирана." : "Не успеавме да ја копираме адресата.",
          { icon: copied ? "copy" : "warning", tone: copied ? "" : "error" }
        );
      });
    }

    if (shareButton) shareButton.addEventListener("click", sharePortal);
  }

  /* =========================================================
     ПРОФИЛ
     ========================================================= */
  function persistProfile() {
    storageSet("profile", state.profile);
  }

  function renderAvatar(element, avatar, name) {
    if (!element) return;
    element.replaceChildren();
    if (avatar) {
      const image = document.createElement("img");
      image.alt = "";
      image.src = avatar;
      element.appendChild(image);
    } else {
      element.textContent = initialsFromName(name);
    }
  }

  function bestQuizScore() {
    return state.scores.reduce((best, entry) => Math.max(best, Number(entry.score) || 0), 0);
  }

  function updateProfileStats() {
    const done = state.assignments.filter((item) => item.completed).length;
    const tasks = $("#profileTasksDone");
    if (tasks) tasks.textContent = String(done);
    const notes = $("#profileNotesCount");
    if (notes) notes.textContent = String(state.notes.length);
    const best = $("#profileQuizBest");
    if (best) best.textContent = String(bestQuizScore());
  }

  function profileRole() {
    return ROLE_LABELS[state.profile.role] ? state.profile.role : "student";
  }

  function isTeacher() {
    return state.profile.role === "teacher";
  }

  function renderProfile() {
    const name = (state.profile.name || "").trim() || DEFAULT_PROFILE.name;
    const className = (state.profile.className || "").trim();
    const role = profileRole();
    const nameEl = $("#profileName");
    const classEl = $("#profileClass");
    const roleEl = $("#profileRole");
    const bioEl = $("#profileBio");
    const avatarEl = $("#profileAvatar");

    if (nameEl) nameEl.textContent = name;
    if (classEl) {
      classEl.textContent = className || "Ученик";
      classEl.hidden = !className;
    }
    if (roleEl) {
      roleEl.textContent =
        role === "teacher"
          ? "Наставник"
          : role === "parent"
            ? "Родител"
            : "Ученик";
      roleEl.dataset.role = role;
    }
    if (bioEl) {
      bioEl.textContent =
        (state.profile.bio || "").trim() || "Додај кратка биографија во уредувањето на профилот.";
    }
    renderAvatar(avatarEl, state.profile.avatar, name);

    const settingsAvatar = $("#settingsAvatar");
    const settingsName = $("#settingsName");
    const settingsRole = $("#settingsRole");
    if (settingsAvatar) renderAvatar(settingsAvatar, state.profile.avatar, name);
    if (settingsName) settingsName.textContent = name;
    if (settingsRole) settingsRole.textContent = ROLE_LABELS[role];

    updateProfileStats();
  }

  function initWelcome() {
    const gate = $("#welcomeGate");
    if (!gate) return;

    const form = $("#welcomeForm");
    const nameInput = $("#welcomeName");
    const classInput = $("#welcomeClass");
    const classField = $("#welcomeClassField");
    const error = $("#welcomeError");
    const done = storageGet("welcomeDone", false) === true;
    let chosenRole = ROLE_LABELS[state.profile.role] ? state.profile.role : "";

    if (done && ROLE_LABELS[state.profile.role]) {
      gate.hidden = true;
      return;
    }

    const syncRoleButtons = () => {
      $$("[data-welcome-role]", gate).forEach((button) => {
        const selected = button.dataset.welcomeRole === chosenRole;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      if (classField) classField.hidden = chosenRole === "teacher" || chosenRole === "parent";
    };

    $$("[data-welcome-role]", gate).forEach((button) => {
      button.addEventListener("click", () => {
        chosenRole = button.dataset.welcomeRole;
        if (error) error.hidden = true;
        syncRoleButtons();
        vibrate(6);
      });
    });

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!ROLE_LABELS[chosenRole]) {
          if (error) error.hidden = false;
          return;
        }

        const name = nameInput ? nameInput.value.trim() : "";
        if (!name) {
          if (nameInput) nameInput.focus();
          return;
        }

        state.profile.name = name;
        state.profile.role = chosenRole;
        state.profile.className = classInput ? classInput.value.trim() : "";
        if (!state.profile.bio || state.profile.bio === DEFAULT_PROFILE.bio) {
          state.profile.bio =
            chosenRole === "teacher"
              ? "Наставник во ООУ „Д-р Владимир Полежиноски“ – Кичево."
              : chosenRole === "parent"
                ? "Родител на ученик во ООУ „Д-р Владимир Полежиноски“ – Кичево."
                : "Ученик во ООУ „Д-р Владимир Полежиноски“ – Кичево.";
        }
        persistProfile();
        storageSet("welcomeDone", true);
        gate.hidden = true;
        document.documentElement.classList.remove("has-welcome");
        renderProfile();
        vibrate(10);
        showToast(
          chosenRole === "teacher"
            ? "Добредојде, наставнику! Поставките се подготвени."
            : chosenRole === "parent"
              ? "Добредојде! Просторот за родител е подготвен."
              : "Добредојде! Твојот ученички простор е подготвен.",
          { icon: "check" }
        );
      });
    }

    gate.hidden = false;
    document.documentElement.classList.add("has-welcome");
    syncRoleButtons();
    const card = $(".welcome-card", gate);
    if (card) {
      card.setAttribute("tabindex", "-1");
      window.setTimeout(() => card.focus({ preventScroll: true }), 120);
    }
    window.setTimeout(() => {
      if (nameInput) nameInput.value = state.profile.name === DEFAULT_PROFILE.name ? "" : state.profile.name;
      if (classInput) {
        classInput.value =
          state.profile.className === DEFAULT_PROFILE.className ? "" : state.profile.className;
      }
    }, 50);
  }

  function resizeAvatar(file, callback) {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      showToast("Избери слика во формат JPG, PNG или WebP.", { icon: "warning", tone: "warning" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Сликата е преголема. Максимум 5 MB.", { icon: "warning", tone: "warning" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        try {
          const size = 160;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext("2d");
          const source = Math.min(image.width, image.height);
          const sx = (image.width - source) / 2;
          const sy = (image.height - source) / 2;
          context.drawImage(image, sx, sy, source, source, 0, 0, size, size);
          callback(canvas.toDataURL("image/jpeg", 0.86));
        } catch (error) {
          showToast("Сликата не може да се обработи.", { icon: "warning", tone: "error" });
        }
      };
      image.onerror = () => {
        showToast("Сликата не може да се вчита.", { icon: "warning", tone: "error" });
      };
      image.src = String(reader.result || "");
    };
    reader.onerror = () => {
      showToast("Не успеавме да ја прочитаме сликата.", { icon: "warning", tone: "error" });
    };
    reader.readAsDataURL(file);
  }

  function initProfile() {
    const form = $("#profileForm");
    const nameInput = $("#profileNameInput");
    const classInput = $("#profileClassInput");
    const bioInput = $("#profileBioInput");
    const avatarInput = $("#avatarInput");
    const preview = $("#avatarPreview");
    const removeAvatar = $("#removeAvatarBtn");
    let draftAvatar = state.profile.avatar;
    const rolePicker = $("#profileRolePicker");
    let draftRole = profileRole();

    const setDraftRole = (role) => {
      draftRole = ROLE_LABELS[role] ? role : "student";
      if (!rolePicker) return;
      $$("[data-role]", rolePicker).forEach((button) => {
        const selected = button.dataset.role === draftRole;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    };

    if (rolePicker) {
      rolePicker.addEventListener("click", (event) => {
        const button = event.target.closest("[data-role]");
        if (!button) return;
        setDraftRole(button.dataset.role);
        vibrate(5);
      });
    }

    const openEditor = () => {
      draftAvatar = state.profile.avatar;
      setDraftRole(state.profile.role);
      if (nameInput) nameInput.value = state.profile.name || "";
      if (classInput) classInput.value = state.profile.className || "";
      if (bioInput) bioInput.value = state.profile.bio || "";
      if (avatarInput) avatarInput.value = "";
      renderAvatar(preview, draftAvatar, state.profile.name);
      openDialog($("#profileDialog"));
    };

    [$("#editProfileBtn"), $("#profileEditTop"), $("#settingsEditProfile")].forEach((button) => {
      if (button) button.addEventListener("click", openEditor);
    });

    if (avatarInput) {
      avatarInput.addEventListener("change", () => {
        const file = avatarInput.files && avatarInput.files[0];
        if (!file) return;
        resizeAvatar(file, (dataUrl) => {
          draftAvatar = dataUrl;
          renderAvatar(preview, draftAvatar, nameInput ? nameInput.value : state.profile.name);
        });
      });
    }

    if (removeAvatar) {
      removeAvatar.addEventListener("click", () => {
        draftAvatar = "";
        renderAvatar(preview, "", nameInput ? nameInput.value : state.profile.name);
        if (avatarInput) avatarInput.value = "";
      });
    }

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = nameInput ? nameInput.value.trim() : "";
        if (!name) {
          if (nameInput) nameInput.focus();
          return;
        }
        state.profile.name = name;
        state.profile.className = classInput ? classInput.value.trim() : "";
        state.profile.role = draftRole;
        state.profile.bio = bioInput ? bioInput.value.trim() : "";
        state.profile.avatar = draftAvatar;
        persistProfile();
        renderProfile();
        closeDialog($("#profileDialog"));
        showToast("Профилот е зачуван.", { icon: "check" });
      });
    }
  }

  /* =========================================================
     БЕЛЕШКИ
     ========================================================= */
  function persistNotes() {
    storageSet("notes", state.notes);
  }

  function setColorChoice(container, attribute, color) {
    if (!container) return;
    $$("[" + attribute + "]", container).forEach((button) => {
      const selected = button.getAttribute(attribute) === color;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function noteMarkup(note) {
    return (
      '<article class="note-card note-' +
      escapeHTML(note.color || "yellow") +
      '" data-note-id="' +
      escapeHTML(note.id) +
      '" role="listitem">' +
      '<p class="note-text">' +
      escapeHTML(note.text) +
      "</p>" +
      '<div class="note-footer">' +
      '<span class="note-date">' +
      escapeHTML(formatNoteDate(note.createdAt)) +
      "</span>" +
      '<div class="note-actions">' +
      '<button class="note-action" type="button" data-note-action="edit" aria-label="Уреди белешка">' +
      iconMarkup("edit") +
      "</button>" +
      '<button class="note-action" type="button" data-note-action="delete" aria-label="Избриши белешка">' +
      iconMarkup("trash") +
      "</button>" +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function renderNotes() {
    const list = $("#noteList");
    const empty = $("#notesEmpty");
    const count = $("#notesCount");
    if (!list) return;
    list.innerHTML = state.notes.map(noteMarkup).join("");
    if (empty) empty.hidden = state.notes.length > 0;
    if (count) count.textContent = String(state.notes.length);
    updateProfileStats();
  }

  function initNotes() {
    const form = $("#noteForm");
    const input = $("#noteInput");
    const colors = $("#noteColors");
    const list = $("#noteList");
    const editForm = $("#noteEditForm");
    const editColors = $("#editNoteColors");

    if (colors) {
      colors.addEventListener("click", (event) => {
        const button = event.target.closest("[data-note-color]");
        if (!button) return;
        const color = button.dataset.noteColor;
        if (NOTE_COLORS.indexOf(color) < 0) return;
        state.noteColor = color;
        setColorChoice(colors, "data-note-color", color);
        vibrate(5);
      });
    }

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = input ? input.value.trim() : "";
        if (!text) {
          if (input) input.focus();
          return;
        }
        state.notes.unshift({
          id: uid(),
          text: text,
          color: state.noteColor || "yellow",
          createdAt: Date.now()
        });
        persistNotes();
        if (input) input.value = "";
        renderNotes();
        showToast("Белешката е зачувана.", { icon: "note" });
      });
    }

    if (list) {
      list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-note-action]");
        if (!button) return;
        const card = button.closest("[data-note-id]");
        if (!card) return;
        const note = state.notes.find((entry) => entry.id === card.dataset.noteId);
        if (!note) return;

        if (button.dataset.noteAction === "delete") {
          state.notes = state.notes.filter((entry) => entry.id !== note.id);
          persistNotes();
          renderNotes();
          showToast("Белешката е избришана.", { icon: "trash" });
        } else if (button.dataset.noteAction === "edit") {
          const idField = $("#editNoteId");
          const textField = $("#editNoteText");
          if (idField) idField.value = note.id;
          if (textField) textField.value = note.text;
          state.editNoteColor = note.color || "yellow";
          setColorChoice(editColors, "data-edit-note-color", state.editNoteColor);
          openDialog($("#noteEditDialog"));
          window.setTimeout(() => textField && textField.focus(), 90);
        }
      });
    }

    if (editColors) {
      editColors.addEventListener("click", (event) => {
        const button = event.target.closest("[data-edit-note-color]");
        if (!button) return;
        const color = button.dataset.editNoteColor;
        if (NOTE_COLORS.indexOf(color) < 0) return;
        state.editNoteColor = color;
        setColorChoice(editColors, "data-edit-note-color", color);
      });
    }

    if (editForm) {
      editForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const id = $("#editNoteId") ? $("#editNoteId").value : "";
        const textField = $("#editNoteText");
        const note = state.notes.find((entry) => entry.id === id);
        if (!note) return;
        const text = textField ? textField.value.trim() : "";
        if (!text) {
          if (textField) textField.focus();
          return;
        }
        note.text = text;
        note.color = state.editNoteColor || note.color;
        persistNotes();
        renderNotes();
        closeDialog($("#noteEditDialog"));
        showToast("Белешката е ажурирана.", { icon: "check" });
      });
    }
  }

  /* =========================================================
     ТАЈМЕР ЗА УЧЕЊЕ
     ========================================================= */
  function initPomodoro() {
    const card = $("#pomodoroCard");
    const focusInput = $("#focusMinutes");
    const breakInput = $("#breakMinutes");
    const ring = $("#pomodoroRing");
    const timeEl = $("#pomodoroTime");
    const modeEl = $("#pomodoroMode");
    const sessionsEl = $("#pomodoroSessions");
    const startButton = $("#pomodoroStart");
    const resetButton = $("#pomodoroReset");
    if (!card || !focusInput || !breakInput || !timeEl || !startButton) return;

    const saved = storageGet("pomodoro", null) || {};
    let focusMinutes = clamp(Math.round(Number(saved.focus) || 25), 1, 90);
    let breakMinutes = clamp(Math.round(Number(saved.break) || 5), 1, 30);
    let completed = Math.max(0, Math.round(Number(saved.completed) || 0));

    focusInput.value = String(focusMinutes);
    breakInput.value = String(breakMinutes);

    const radius = ring ? Number(ring.getAttribute("r")) || 104 : 104;
    const circumference = 2 * Math.PI * radius;
    if (ring) ring.style.strokeDasharray = circumference.toFixed(2);

    let mode = "focus";
    let running = false;
    let remaining = focusMinutes * 60;
    let deadline = 0;
    let ticker = null;

    function saveSettings() {
      storageSet("pomodoro", {
        focus: focusMinutes,
        break: breakMinutes,
        completed: completed
      });
    }

    function durationForCurrentMode() {
      return (mode === "focus" ? focusMinutes : breakMinutes) * 60;
    }

    function stopTicker() {
      if (ticker !== null) {
        window.clearInterval(ticker);
        ticker = null;
      }
    }

    function updateUI() {
      const safeRemaining = Math.max(0, remaining);
      const minutes = Math.floor(safeRemaining / 60);
      const seconds = Math.ceil(safeRemaining % 60);
      const displaySeconds = seconds === 60 ? 0 : seconds;
      const displayMinutes = seconds === 60 ? minutes + 1 : minutes;

      timeEl.textContent = pad(displayMinutes) + ":" + pad(displaySeconds);
      if (modeEl) modeEl.textContent = mode === "focus" ? "Фокус" : "Пауза";
      if (sessionsEl) {
        sessionsEl.textContent =
          completed +
          (completed === 1 ? " завршена сесија" : " завршени сесии");
      }

      if (ring) {
        const total = durationForCurrentMode() || 1;
        const fraction = clamp(safeRemaining / total, 0, 1);
        ring.style.strokeDashoffset = (circumference * (1 - fraction)).toFixed(2);
      }

      card.classList.toggle("is-break", mode === "break");

      const use = startButton.querySelector("use");
      if (use) use.setAttribute("href", running ? "#i-pause" : "#i-play");
      const label = startButton.querySelector("span");
      if (label) {
        label.textContent = running
          ? "Пауза"
          : safeRemaining < durationForCurrentMode() - 0.5
            ? "Продолжи"
            : "Започни";
      }
    }

    function tick() {
      remaining = Math.max(0, (deadline - Date.now()) / 1000);
      if (remaining <= 0) {
        completePhase();
        return;
      }
      updateUI();
    }

    function startTicker() {
      stopTicker();
      deadline = Date.now() + remaining * 1000;
      running = true;
      ticker = window.setInterval(tick, 250);
      updateUI();
    }

    function pauseTimer() {
      if (!running) return;
      remaining = Math.max(0, (deadline - Date.now()) / 1000);
      running = false;
      stopTicker();
      updateUI();
    }

    function completePhase() {
      stopTicker();
      running = false;
      remaining = 0;
      updateUI();

      const finishedMode = mode;
      if (finishedMode === "focus") {
        completed += 1;
        saveSettings();
      }

      playChime("quiz");
      card.classList.add("is-alert");
      window.setTimeout(() => card.classList.remove("is-alert"), 1900);
      vibrate([25, 60, 25]);

      mode = finishedMode === "focus" ? "break" : "focus";
      remaining = durationForCurrentMode();
      updateUI();

      showToast(
        finishedMode === "focus"
          ? "Фокусот заврши. Направи кратка пауза."
          : "Паузата заврши. Време е за фокус.",
        { icon: finishedMode === "focus" ? "timer" : "zap", duration: 4200 }
      );
    }

    startButton.addEventListener("click", () => {
      if (running) {
        pauseTimer();
        return;
      }
      if (remaining <= 0) remaining = durationForCurrentMode();
      startTicker();
    });

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        running = false;
        stopTicker();
        remaining = durationForCurrentMode();
        updateUI();
        showToast("Тајмерот е ресетиран.", { icon: "reset" });
      });
    }

    focusInput.addEventListener("change", () => {
      focusMinutes = clamp(Math.round(Number(focusInput.value) || 25), 1, 90);
      focusInput.value = String(focusMinutes);
      if (!running && mode === "focus") remaining = durationForCurrentMode();
      saveSettings();
      updateUI();
    });

    breakInput.addEventListener("change", () => {
      breakMinutes = clamp(Math.round(Number(breakInput.value) || 5), 1, 30);
      breakInput.value = String(breakMinutes);
      if (!running && mode === "break") remaining = durationForCurrentMode();
      saveSettings();
      updateUI();
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && running) tick();
    });

    updateUI();
  }

  /* =========================================================
     КАЛКУЛАТОР ЗА ОЦЕНКИ
     ========================================================= */
  function persistGrades() {
    storageSet("grades", state.grades);
  }

  function gradeDescription(average) {
    if (average >= 4.5) return "Одличен успех — одлична работа!";
    if (average >= 3.5) return "Многу добар успех — продолжи така.";
    if (average >= 2.5) return "Добар успех — има простор за напредок.";
    if (average >= 1.5) return "Доволен успех — вреди да вежбаш повеќе.";
    return "Недоволен успех — разговарај со наставникот за поддршка.";
  }

  function renderGrades() {
    const chips = $("#gradeChips");
    const averageEl = $("#gradeAverage");
    const countEl = $("#gradeCount");
    const messageEl = $("#gradeMessage");

    if (chips) {
      chips.innerHTML = state.grades
        .map(
          (grade, index) =>
            '<span class="grade-chip">' +
            escapeHTML(formatNumber(grade, 1)) +
            '<button type="button" data-grade-remove="' +
            index +
            '" aria-label="Отстрани оценка ' +
            escapeHTML(formatNumber(grade, 1)) +
            '">' +
            iconMarkup("close") +
            "</button></span>"
        )
        .join("");
    }

    if (!state.grades.length) {
      if (averageEl) averageEl.textContent = "—";
      if (countEl) countEl.textContent = "0";
      if (messageEl) messageEl.textContent = "Внеси оценки за да го пресметаш просекот.";
      return;
    }

    const average =
      state.grades.reduce((sum, grade) => sum + grade, 0) / state.grades.length;
    if (averageEl) averageEl.textContent = formatNumber(average, 2, 2);
    if (countEl) countEl.textContent = String(state.grades.length);
    if (messageEl) messageEl.textContent = gradeDescription(average);
  }

  function renderPoints() {
    const earnedInput = $("#pointsEarned");
    const maxInput = $("#pointsMax");
    const resultEl = $("#pointsResult");
    const gradeEl = $("#pointsGrade");
    const messageEl = $("#pointsMessage");
    if (!earnedInput || !maxInput) return;

    const earned = Number(String(earnedInput.value).replace(",", "."));
    const max = Number(String(maxInput.value).replace(",", "."));

    if (!earnedInput.value || !maxInput.value || Number.isNaN(earned) || Number.isNaN(max) || max <= 0) {
      if (resultEl) resultEl.textContent = "—";
      if (gradeEl) gradeEl.textContent = "—";
      if (messageEl) messageEl.textContent = "Внеси поени за да ја видиш оценката.";
      return;
    }

    if (earned < 0 || earned > max) {
      if (resultEl) resultEl.textContent = "—";
      if (gradeEl) gradeEl.textContent = "—";
      if (messageEl) messageEl.textContent = "Поените треба да бидат помеѓу 0 и максимумот.";
      return;
    }

    const percent = (earned / max) * 100;
    let grade = 1;
    if (percent >= 90) grade = 5;
    else if (percent >= 75) grade = 4;
    else if (percent >= 60) grade = 3;
    else if (percent >= 45) grade = 2;

    if (resultEl) resultEl.textContent = formatNumber(percent, 2) + "%";
    if (gradeEl) gradeEl.textContent = String(grade);
    if (messageEl) {
      messageEl.textContent =
        grade === 5
          ? "Одличен резултат! Најмалку 90% од максимумот."
          : grade === 4
            ? "Многу добар резултат."
            : grade === 3
              ? "Добар резултат, но може и подобро."
              : grade === 2
                ? "Доволен резултат — вежбај дополнително."
                : "Недоволен резултат — побарај помош за учење.";
    }
  }

  function initGrades() {
    const tabs = $("#gradeTabs");
    const averagePanel = $("#gradeAveragePanel");
    const pointsPanel = $("#gradePointsPanel");
    const addButton = $("#addGradeBtn");
    const gradeInput = $("#gradeInput");
    const chips = $("#gradeChips");
    const clearButton = $("#clearGradesBtn");
    const earnedInput = $("#pointsEarned");
    const maxInput = $("#pointsMax");

    const setMode = (mode) => {
      state.gradeMode = mode === "points" ? "points" : "average";
      $$("[data-grade-mode]", tabs).forEach((button) => {
        const active = button.dataset.gradeMode === state.gradeMode;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
      });
      if (averagePanel) averagePanel.hidden = state.gradeMode !== "average";
      if (pointsPanel) pointsPanel.hidden = state.gradeMode !== "points";
    };

    if (tabs) {
      tabs.addEventListener("click", (event) => {
        const button = event.target.closest("[data-grade-mode]");
        if (!button) return;
        setMode(button.dataset.gradeMode);
        vibrate(6);
      });
    }

    if (addButton && gradeInput) {
      addButton.addEventListener("click", () => {
        const raw = Number(String(gradeInput.value).replace(",", "."));
        if (!gradeInput.value || Number.isNaN(raw)) {
          gradeInput.focus();
          showToast("Внеси оценка од 1 до 5.", { icon: "calculator", tone: "warning" });
          return;
        }
        const grade = clamp(Math.round(raw * 2) / 2, 1, 5);
        state.grades.push(grade);
        persistGrades();
        gradeInput.value = "";
        renderGrades();
        showToast("Оценката е додадена.", { icon: "check" });
      });

      gradeInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          addButton.click();
        }
      });
    }

    if (chips) {
      chips.addEventListener("click", (event) => {
        const button = event.target.closest("[data-grade-remove]");
        if (!button) return;
        const index = Number(button.dataset.gradeRemove);
        if (Number.isNaN(index)) return;
        state.grades.splice(index, 1);
        persistGrades();
        renderGrades();
      });
    }

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        if (!state.grades.length) {
          showToast("Нема оценки за чистење.", { icon: "calculator" });
          return;
        }
        state.grades = [];
        persistGrades();
        renderGrades();
        showToast("Оценките се исчистени.", { icon: "trash" });
      });
    }

    [earnedInput, maxInput].forEach((input) => {
      if (input) input.addEventListener("input", renderPoints);
    });

    renderGrades();
    setMode("average");
    renderPoints();
  }

  /* =========================================================
     УЧИЛИШЕН КВИЗ
     ========================================================= */
  const QUIZ_QUESTIONS = [
    {
      q: "Кој е главниот град на Македонија?",
      answers: ["Скопје", "Битола", "Охрид", "Куманово"],
      correct: 0
    },
    {
      q: "Колку е 7 × 8?",
      answers: ["54", "56", "48", "64"],
      correct: 1
    },
    {
      q: "Која е најдолгата река во Македонија?",
      answers: ["Вардар", "Црн Дрим", "Брегалница", "Струма"],
      correct: 0
    },
    {
      q: "Кој е хемискиот симбол на водата?",
      answers: ["CO₂", "H₂O", "O₂", "NaCl"],
      correct: 1
    },
    {
      q: "Кој е автор на „Македонска крвава свадба“?",
      answers: ["Кочо Рацин", "Блаже Конески", "Војдан Чернодрински", "Григор Прличев"],
      correct: 2
    },
    {
      q: "Колку континенти има на Земјата?",
      answers: ["5", "6", "7", "8"],
      correct: 2
    },
    {
      q: "Која планета е најблиску до Сонцето?",
      answers: ["Венера", "Земја", "Марс", "Меркур"],
      correct: 3
    },
    {
      q: "Кој е највисокиот врв во Македонија?",
      answers: ["Љуботен", "Кораб", "Бистра", "Јакупица"],
      correct: 1
    },
    {
      q: "Во која година е основано нашето училиште?",
      answers: ["1972", "1982", "1992", "2002"],
      correct: 1
    },
    {
      q: "Колку страни има шестаголник?",
      answers: ["5", "6", "7", "8"],
      correct: 1
    },
    {
      q: "Кој е основен извор на енергија за Земјата?",
      answers: ["Месечината", "Сонцето", "Ветерот", "Водата"],
      correct: 1
    },
    {
      q: "Колку минути има во еден час?",
      answers: ["30", "45", "60", "90"],
      correct: 2
    },
    {
      q: "Што е прикажано на знамето на Македонија?",
      answers: ["Лав", "Орел", "Сонце", "Дрво"],
      correct: 2
    }
  ];

  function persistScores() {
    storageSet("quizScores", state.scores);
  }

  function renderLeaderboard() {
    const list = $("#leaderboardList");
    const empty = $("#leaderboardEmpty");
    if (!list) return;

    const entries = state.scores
      .slice()
      .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0) || b.date - a.date)
      .slice(0, 5);

    if (!entries.length) {
      list.innerHTML = "";
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    list.innerHTML = entries
      .map(
        (entry, index) =>
          '<li class="leaderboard-item">' +
          '<span class="leaderboard-rank">' +
          (index + 1) +
          "</span>" +
          '<span class="leaderboard-info"><strong>' +
          escapeHTML(entry.name || "Ученик") +
          "</strong><span>" +
          escapeHTML(
            formatDate(entry.date) +
              " · " +
              (Number(entry.correct) || 0) +
              "/" +
              (Number(entry.total) || 8) +
              " точни"
          ) +
          "</span></span>" +
          '<span class="leaderboard-value">' +
          escapeHTML(String(entry.score)) +
          " поени</span>" +
          "</li>"
      )
      .join("");
  }

  function initQuiz() {
    const intro = $("#quizIntro");
    const play = $("#quizPlay");
    const result = $("#quizResult");
    const startButton = $("#quizStartBtn");
    const restartButton = $("#quizRestartBtn");
    const nextButton = $("#quizNextBtn");
    const questionEl = $("#quizQuestion");
    const answersEl = $("#quizAnswers");
    const progressEl = $("#quizProgressLabel");
    const scoreEl = $("#quizScore");
    const timerFill = $("#quizTimerFill");
    const timerText = $("#quizTimerText");
    const feedbackEl = $("#quizFeedback");
    const resultTitle = $("#quizResultTitle");
    const resultScore = $("#quizResultScore");
    const resultText = $("#quizResultText");
    if (!intro || !play || !result || !startButton || !questionEl || !answersEl) return;

    const QUIZ_LENGTH = 8;
    const QUESTION_SECONDS = 15;
    const quiz = {
      active: false,
      index: 0,
      score: 0,
      correctCount: 0,
      questions: [],
      answered: false,
      deadline: 0,
      timer: null
    };

    function clearTimer() {
      if (quiz.timer !== null) {
        window.clearInterval(quiz.timer);
        quiz.timer = null;
      }
    }

    function updateTimerVisual(remainingMs) {
      const ratio = clamp(remainingMs / (QUESTION_SECONDS * 1000), 0, 1);
      if (timerFill) {
        timerFill.style.width = (ratio * 100).toFixed(1) + "%";
        timerFill.classList.toggle("is-low", remainingMs <= 5000);
      }
      if (timerText) timerText.textContent = Math.max(0, Math.ceil(remainingMs / 1000)) + " с";
    }

    function startTimer() {
      clearTimer();
      quiz.deadline = Date.now() + QUESTION_SECONDS * 1000;
      updateTimerVisual(QUESTION_SECONDS * 1000);
      quiz.timer = window.setInterval(() => {
        const remainingMs = Math.max(0, quiz.deadline - Date.now());
        updateTimerVisual(remainingMs);
        if (remainingMs <= 0) {
          clearTimer();
          revealAnswer(null, true);
        }
      }, 100);
    }

    function renderQuestion() {
      const question = quiz.questions[quiz.index];
      if (!question) return;
      quiz.answered = false;

      if (progressEl) {
        progressEl.textContent =
          "Прашање " + (quiz.index + 1) + " / " + quiz.questions.length;
      }
      if (scoreEl) scoreEl.textContent = String(quiz.score);
      questionEl.textContent = question.q;
      answersEl.replaceChildren();
      if (feedbackEl) {
        feedbackEl.textContent = "";
        feedbackEl.className = "quiz-feedback";
      }
      if (nextButton) {
        nextButton.hidden = true;
        nextButton.textContent =
          quiz.index === quiz.questions.length - 1 ? "Види резултат" : "Следно прашање";
      }

      const letters = ["А", "Б", "В", "Г"];
      question.answers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-btn";
        button.dataset.answerIndex = String(index);

        const letter = document.createElement("span");
        letter.className = "answer-letter";
        letter.textContent = letters[index] || String(index + 1);

        const label = document.createElement("span");
        label.textContent = answer;

        button.append(letter, label);
        button.addEventListener("click", () => revealAnswer(index, false));
        answersEl.appendChild(button);
      });

      startTimer();
    }

    function revealAnswer(selectedIndex, timedOut) {
      if (!quiz.active || quiz.answered) return;
      quiz.answered = true;
      clearTimer();

      const question = quiz.questions[quiz.index];
      const buttons = $$(".answer-btn", answersEl);
      const remainingMs = Math.max(0, quiz.deadline - Date.now());
      const isCorrect = selectedIndex === question.correct;

      buttons.forEach((button, index) => {
        button.disabled = true;
        if (index === question.correct) button.classList.add("is-correct");
      });

      if (isCorrect) {
        const bonus = Math.ceil(remainingMs / 1000) * 5;
        const gained = 100 + bonus;
        quiz.score += gained;
        quiz.correctCount += 1;
        if (scoreEl) scoreEl.textContent = String(quiz.score);
        if (feedbackEl) {
          feedbackEl.className = "quiz-feedback is-correct";
          feedbackEl.textContent =
            "Точно! +" + gained + " поени (вклучен бонус за брзина).";
        }
        vibrate(14);
      } else {
        if (selectedIndex !== null && buttons[selectedIndex]) {
          buttons[selectedIndex].classList.add("is-wrong");
        }
        if (feedbackEl) {
          feedbackEl.className = "quiz-feedback is-wrong";
          feedbackEl.textContent =
            (timedOut ? "Времето истече! " : "Не точно. ") +
            "Точниот одговор е „" +
            question.answers[question.correct] +
            "“.";
        }
        vibrate([18, 35, 18]);
      }

      if (nextButton) {
        nextButton.hidden = false;
        nextButton.textContent =
          quiz.index === quiz.questions.length - 1 ? "Види резултат" : "Следно прашање";
      }
    }

    function startQuiz() {
      clearTimer();
      quiz.active = true;
      quiz.index = 0;
      quiz.score = 0;
      quiz.correctCount = 0;
      quiz.answered = false;
      quiz.questions = shuffle(QUIZ_QUESTIONS).slice(0, QUIZ_LENGTH);

      if (intro) intro.hidden = true;
      if (result) result.hidden = true;
      if (play) play.hidden = false;
      renderQuestion();
    }

    function finishQuiz() {
      quiz.active = false;
      clearTimer();
      if (play) play.hidden = true;
      if (result) result.hidden = false;

      const total = quiz.questions.length;
      const ratio = total > 0 ? quiz.correctCount / total : 0;
      let title = "Пробај повторно";
      if (ratio === 1) title = "Совршено!";
      else if (ratio >= 0.75) title = "Одлично!";
      else if (ratio >= 0.5) title = "Добро!";

      if (resultTitle) resultTitle.textContent = title;
      if (resultScore) resultScore.textContent = quiz.score + " поени";
      if (resultText) {
        resultText.textContent =
          "Точно одговорени: " +
          quiz.correctCount +
          " / " +
          total +
          " · " +
          quiz.score +
          " поени";
      }

      const previousBest = bestQuizScore();
      state.scores.push({
        name: (state.profile.name || "Ученик").trim() || "Ученик",
        score: quiz.score,
        correct: quiz.correctCount,
        total: total,
        date: Date.now()
      });
      state.scores.sort((a, b) => b.score - a.score);
      state.scores = state.scores.slice(0, 10);
      persistScores();
      updateProfileStats();
      renderLeaderboard();
      playChime("quiz");

      if (quiz.score > previousBest) {
        showToast("Нов рекорд на квизот: " + quiz.score + " поени!", {
          icon: "trophy",
          duration: 3800
        });
      }
    }

    startButton.addEventListener("click", startQuiz);
    if (restartButton) restartButton.addEventListener("click", startQuiz);
    if (nextButton) {
      nextButton.addEventListener("click", () => {
        if (quiz.index >= quiz.questions.length - 1) {
          finishQuiz();
          return;
        }
        quiz.index += 1;
        renderQuestion();
      });
    }

    renderLeaderboard();
  }

  /* =========================================================
     СПОДЕЛУВАЊЕ
     ========================================================= */
  function shareProfile() {
    const name = (state.profile.name || "Ученик").trim() || "Ученик";
    const className = (state.profile.className || "").trim();
    const text =
      "Јас сум " +
      name +
      (className ? " од " + className : "") +
      " во " +
      SCHOOL.name +
      " – Кичево. Отвори го училишниот портал!";
    const url = window.location.href.split("#")[0];

    if (navigator.share) {
      navigator
        .share({ title: "Училишен портал", text: text, url: url })
        .then(() => showToast("Профилот е споделен.", { icon: "share" }))
        .catch((error) => {
          if (error && error.name === "AbortError") return;
          copyToClipboard(text + " " + url).then((copied) => {
            showToast(copied ? "Текстот е копиран." : "Споделувањето не е достапно.", {
              icon: copied ? "copy" : "warning"
            });
          });
        });
      return;
    }

    copyToClipboard(text + " " + url).then((copied) => {
      showToast(copied ? "Текстот е копиран." : "Споделувањето не е достапно.", {
        icon: copied ? "copy" : "warning"
      });
    });
  }

  function initShare() {
    const appButton = $("#shareAppBtn");
    const profileButton = $("#shareProfileBtn");
    if (appButton) appButton.addEventListener("click", sharePortal);
    if (profileButton) profileButton.addEventListener("click", shareProfile);
  }

  /* =========================================================
     АДМИН ПАНЕЛ
     ========================================================= */
  function updateAdminHint() {
    const hint = $("#adminHint");
    if (!hint) return;
    if (state.adminPin === "1982") {
      hint.innerHTML =
        'Демо ПИН код: <strong>1982</strong> · Пристапот важи само на овој уред.';
    } else {
      hint.innerHTML =
        'ПИН кодот е променет на овој уред. · Пристапот важи само до затворање на порталот.';
    }
  }

  function resetNewsForm() {
    const id = $("#newsId");
    const title = $("#newsTitleInput");
    const category = $("#newsCategoryInput");
    const body = $("#newsBodyInput");
    const pinned = $("#newsPinnedInput");
    const cancel = $("#newsCancelBtn");
    const label = $("#newsSubmitLabel");

    if (id) id.value = "";
    if (title) title.value = "";
    if (category) category.value = "announcement";
    if (body) body.value = "";
    if (pinned) pinned.checked = false;
    if (cancel) cancel.hidden = true;
    if (label) label.textContent = "Објави";
  }

  function setAdminUnlocked(unlocked) {
    adminUnlocked = Boolean(unlocked);
    const gate = $("#adminGate");
    const panel = $("#adminPanel");
    if (gate) gate.hidden = adminUnlocked;
    if (panel) panel.hidden = !adminUnlocked;

    if (adminUnlocked) {
      renderAdminNews();
      updateAdminHint();
    } else {
      resetNewsForm();
      const pin = $("#adminPin");
      if (pin) pin.value = "";
    }
  }

  function renderAdminNews() {
    const list = $("#adminNewsList");
    const empty = $("#adminNewsEmpty");
    const count = $("#adminNewsCount");
    if (!list) return;

    const sorted = state.news
      .slice()
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.date - a.date);

    list.innerHTML = sorted
      .map((item) => {
        const category = NEWS_CATEGORIES[item.category] || NEWS_CATEGORIES.announcement;
        return (
          '<div class="admin-news-item" data-admin-news-id="' +
          escapeHTML(item.id) +
          '">' +
          '<div class="admin-news-copy">' +
          "<strong>" +
          escapeHTML(item.title) +
          "</strong>" +
          "<span>" +
          escapeHTML(category.label) +
          " · " +
          escapeHTML(formatDate(item.date)) +
          (item.pinned ? " · Истакнато" : "") +
          "</span>" +
          "</div>" +
          '<div class="admin-news-actions">' +
          '<button type="button" data-admin-news-edit aria-label="Уреди објава">' +
          iconMarkup("edit") +
          "</button>" +
          '<button type="button" data-admin-news-delete aria-label="Избриши објава">' +
          iconMarkup("trash") +
          "</button>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    if (empty) empty.hidden = sorted.length > 0;
    if (count) count.textContent = String(sorted.length);
  }

  function exportLocalData() {
    const keys = [
      "news",
      "groups",
      "assignments",
      "notifications",
      "notes",
      "grades",
      "quizScores",
      "profile",
      "sound",
      "pomodoro",
      "theme",
      "installDismissedAt"
    ];
    const data = {};
    keys.forEach((key) => {
      const value = storageGet(key, null);
      if (value !== null) data[key] = value;
    });

    const payload = {
      app: "uchenilishen-portal",
      version: 2,
      exportedAt: new Date().toISOString(),
      data: data
    };

    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "uchenilishen-portal-" + isoFromDate(new Date()) + ".json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1600);
      showToast("Копијата е извезена.", { icon: "download" });
    } catch (error) {
      showToast("Не успеавме да ја извеземе копијата.", { icon: "warning", tone: "error" });
    }
  }

  function applyImportedData(data) {
    const allowed = [
      "news",
      "groups",
      "assignments",
      "notifications",
      "notes",
      "grades",
      "quizScores",
      "profile",
      "sound",
      "pomodoro",
      "theme",
      "installDismissedAt"
    ];
    let applied = 0;
    allowed.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        storageSet(key, data[key]);
        applied += 1;
      }
    });
    if (!applied) throw new Error("Нема податоци");
    loadStateFromStorage();
    if (adminUnlocked) renderAdminNews();
    updateAdminHint();
    showToast("Копијата е успешно увезена.", { icon: "upload" });
  }

  function loadStateFromStorage() {
    const news = storageGet("news", null);
    const groups = storageGet("groups", null);
    const assignments = storageGet("assignments", null);
    const notifications = storageGet("notifications", null);
    const notes = storageGet("notes", null);
    const grades = storageGet("grades", null);
    const scores = storageGet("quizScores", null);
    const profile = storageGet("profile", null);
    const theme = storageGet("theme", null);

    if (Array.isArray(news)) state.news = news;
    if (Array.isArray(groups)) state.groups = groups;
    if (Array.isArray(assignments)) state.assignments = assignments;
    if (Array.isArray(notifications)) state.notifications = notifications;
    if (Array.isArray(notes)) state.notes = notes;
    if (Array.isArray(grades)) state.grades = grades;
    if (Array.isArray(scores)) state.scores = scores;
    if (profile && typeof profile === "object") {
      state.profile = Object.assign({}, DEFAULT_PROFILE, profile);
    }
    state.sound = storageGet("sound", true) !== false;
    state.adminPin = String(storageGet("adminPin", state.adminPin));
    appliedColorChoices();
    if (theme === "dark" || theme === "light") applyTheme(theme, false);
    renderAll();
  }

  function appliedColorChoices() {
    setColorChoice($("#noteColors"), "data-note-color", state.noteColor);
    setColorChoice($("#editNoteColors"), "data-edit-note-color", state.editNoteColor);
    const sound = $("#soundToggle");
    if (sound) sound.checked = state.sound;
  }

  function resetLocalData() {
    try {
      Object.keys(window.localStorage)
        .filter((key) => key.indexOf(PREFIX) === 0)
        .forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {}

    state.news = seedNews();
    state.groups = seedGroups();
    state.assignments = seedAssignments();
    state.notifications = seedNotifications();
    state.notes = [];
    state.grades = [];
    state.scores = [];
    state.profile = Object.assign({}, DEFAULT_PROFILE);
    state.sound = true;
    state.adminPin = "1982";
    state.newsFilter = "all";
    state.assignmentFilter = "all";
    state.gradeMode = "average";
    state.noteColor = "yellow";
    state.editNoteColor = "yellow";

    setAdminUnlocked(false);
    applyTheme("dark", true);
    appliedColorChoices();
    renderAll();
    updateOnlineState(true);
    updateAdminHint();
    showToast("Локалните податоци се ресетирани.", { icon: "refresh", duration: 3200 });
  }

  function initAdmin() {
    const loginForm = $("#adminLoginForm");
    const pinInput = $("#adminPin");
    const loginError = $("#adminLoginError");
    const newsForm = $("#newsForm");
    const newsList = $("#adminNewsList");
    const cancelButton = $("#newsCancelBtn");
    const exportButton = $("#dataExportBtn");
    const importInput = $("#dataImportInput");
    const resetButton = $("#dataResetBtn");
    const pinForm = $("#adminPinForm");
    const lockButton = $("#adminLockBtn");

    updateAdminHint();

    if (loginForm) {
      loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const value = pinInput ? pinInput.value.trim() : "";
        if (value === String(state.adminPin)) {
          if (loginError) loginError.hidden = true;
          setAdminUnlocked(true);
          showToast("Админ панелот е отклучен.", { icon: "unlock" });
        } else {
          if (loginError) loginError.hidden = false;
          if (pinInput) {
            pinInput.value = "";
            pinInput.focus();
          }
          vibrate([20, 40, 20]);
        }
      });
    }

    if (newsForm) {
      newsForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const idField = $("#newsId");
        const titleField = $("#newsTitleInput");
        const categoryField = $("#newsCategoryInput");
        const bodyField = $("#newsBodyInput");
        const pinnedField = $("#newsPinnedInput");
        if (!titleField || !bodyField) return;

        const title = titleField.value.trim();
        const body = bodyField.value.trim();
        if (!title) {
          titleField.focus();
          return;
        }
        if (!body) {
          bodyField.focus();
          return;
        }

        const category =
          categoryField && NEWS_CATEGORIES[categoryField.value]
            ? categoryField.value
            : "announcement";
        const pinned = Boolean(pinnedField && pinnedField.checked);
        const editingId = idField ? idField.value : "";

        if (editingId) {
          const item = state.news.find((entry) => entry.id === editingId);
          if (!item) return;
          item.title = title;
          item.category = category;
          item.body = body;
          item.pinned = pinned;
          persistNews();
          renderNews();
          renderAdminNews();
          resetNewsForm();
          showToast("Објавата е ажурирана.", { icon: "check" });
        } else {
          state.news.unshift({
            id: uid(),
            title: title,
            body: body,
            category: category,
            date: Date.now(),
            pinned: pinned,
            author: "Училишна управа"
          });
          persistNews();
          renderNews();
          renderAdminNews();
          resetNewsForm();
          pushNotification(
            "Нова објава: " + title,
            body.length > 130 ? body.slice(0, 130) + "…" : body,
            "info"
          );
          showToast("Објавата е публикувана.", { icon: "megaphone" });
        }
      });
    }

    if (cancelButton) cancelButton.addEventListener("click", resetNewsForm);

    if (newsList) {
      newsList.addEventListener("click", (event) => {
        const card = event.target.closest("[data-admin-news-id]");
        if (!card) return;
        const item = state.news.find((entry) => entry.id === card.dataset.adminNewsId);
        if (!item) return;

        if (event.target.closest("[data-admin-news-edit]")) {
          const idField = $("#newsId");
          const titleField = $("#newsTitleInput");
          const categoryField = $("#newsCategoryInput");
          const bodyField = $("#newsBodyInput");
          const pinnedField = $("#newsPinnedInput");
          const cancel = $("#newsCancelBtn");
          const label = $("#newsSubmitLabel");

          if (idField) idField.value = item.id;
          if (titleField) titleField.value = item.title;
          if (categoryField) categoryField.value = item.category || "announcement";
          if (bodyField) bodyField.value = item.body;
          if (pinnedField) pinnedField.checked = Boolean(item.pinned);
          if (cancel) cancel.hidden = false;
          if (label) label.textContent = "Зачувај промени";
          const title = $("#newsEditorTitle");
          if (title) title.scrollIntoView({ behavior: REDUCED_MOTION ? "auto" : "smooth", block: "start" });
          if (titleField) window.setTimeout(() => titleField.focus(), 250);
        } else if (event.target.closest("[data-admin-news-delete]")) {
          askConfirm(
            "Избриши објава?",
            "Објавата „" + item.title + "“ ќе биде отстранета од вестите.",
            () => {
              state.news = state.news.filter((entry) => entry.id !== item.id);
              persistNews();
              renderNews();
              renderAdminNews();
              resetNewsForm();
              showToast("Објавата е избришана.", { icon: "trash" });
            }
          );
        }
      });
    }

    if (exportButton) exportButton.addEventListener("click", exportLocalData);

    if (importInput) {
      importInput.addEventListener("change", () => {
        const file = importInput.files && importInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(String(reader.result || ""));
            const data =
              parsed && typeof parsed === "object" && parsed.data && typeof parsed.data === "object"
                ? parsed.data
                : parsed;
            if (!data || typeof data !== "object" || Array.isArray(data)) {
              throw new Error("Невалиден формат");
            }
            applyImportedData(data);
          } catch (error) {
            showToast("Датотеката не е валидна копија.", { icon: "warning", tone: "error" });
          } finally {
            importInput.value = "";
          }
        };
        reader.onerror = () => {
          showToast("Не успеавме да ја прочитаме датотеката.", { icon: "warning", tone: "error" });
          importInput.value = "";
        };
        reader.readAsText(file);
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        askConfirm(
          "Ресетирај локални податоци?",
          "Ќе се избришат вестите, известувањата, задачите, белешките, оценките и профилот на овој уред. Оваа акција не може да се врати.",
          resetLocalData
        );
      });
    }

    if (pinForm) {
      pinForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = $("#adminNewPin");
        if (!input) return;
        const value = input.value.trim();
        if (!/^\d{4,8}$/.test(value)) {
          showToast("ПИН кодот мора да има 4 до 8 цифри.", {
            icon: "lock",
            tone: "warning"
          });
          input.focus();
          return;
        }
        state.adminPin = value;
        storageSet("adminPin", value);
        input.value = "";
        updateAdminHint();
        showToast("Новиот ПИН код е зачуван.", { icon: "lock" });
      });
    }

    if (lockButton) {
      lockButton.addEventListener("click", () => {
        setAdminUnlocked(false);
        showToast("Админ панелот е заклучен.", { icon: "lock" });
      });
    }
  }

  /* =========================================================
     ВЛАДИМИР · AI АСИСТЕНТ
     ========================================================= */
  const AI_CHAT_LIMIT = 60;
  const AI_WEEKDAYS = [
    ["понеделник", "пон"],
    ["вторник", "вто"],
    ["среда", "сре"],
    ["четврток", "чет"],
    ["петок", "пет"],
    ["сабота", "саб"],
    ["недела", "нед"]
  ];
  let aiMessages = [];
  let aiBusy = false;

  function aiWelcomeMessage() {
    const firstName = (state.profile.name || "").trim().split(/\s+/)[0] || "ученику";
    return {
      id: "ai-welcome",
      role: "bot",
      text:
        "Здраво, " +
        firstName +
        "! Јас сум Владимир — твојот училишен асистент.\n\n" +
        "Прашај ме за распоред, претстојни тестови и домашни, оценки, вести, известувања или информации за училиштето. Работам целосно офлајн.",
      date: Date.now()
    };
  }

  function persistAiChat() {
    storageSet("aiChat", aiMessages.slice(-AI_CHAT_LIMIT));
  }

  function aiMessageNode(message) {
    const row = document.createElement("div");
    row.className = "ai-msg is-" + message.role;

    const avatar = document.createElement("span");
    avatar.className = "ai-avatar";
    avatar.setAttribute("aria-hidden", "true");
    if (message.role === "bot") {
      const image = document.createElement("img");
      image.src = "icons/school-logo.svg";
      image.alt = "";
      avatar.appendChild(image);
    } else {
      avatar.textContent = initialsFromName(state.profile.name);
    }

    const bubble = document.createElement("div");
    bubble.className = "ai-bubble";
    const text = document.createElement("p");
    text.textContent = message.text;
    const time = document.createElement("time");
    time.textContent = formatTime(message.date);
    bubble.append(text, time);

    row.append(avatar, bubble);
    return row;
  }

  function aiScrollToEnd(log) {
    window.requestAnimationFrame(() => {
      log.scrollTop = log.scrollHeight;
    });
  }

  function aiAppend(message) {
    const log = $("#aiLog");
    if (!log || !message) return;
    log.appendChild(aiMessageNode(message));
    aiScrollToEnd(log);
  }

  function aiRender() {
    const log = $("#aiLog");
    if (!log) return;
    const fragment = document.createDocumentFragment();
    aiMessages.forEach((message) => fragment.appendChild(aiMessageNode(message)));
    log.replaceChildren(fragment);
    aiScrollToEnd(log);
  }

  function aiPush(role, text) {
    const message = { id: uid(), role: role, text: text, date: Date.now() };
    aiMessages.push(message);
    if (aiMessages.length > AI_CHAT_LIMIT) {
      aiMessages = aiMessages.slice(-AI_CHAT_LIMIT);
    }
    persistAiChat();
    return message;
  }

  function aiNormalize(text) {
    return String(text || "")
      .toLocaleLowerCase("mk-MK")
      .replace(/\s+/g, " ")
      .trim();
  }

  function aiHas(text, words) {
    return words.some((word) => text.indexOf(word) >= 0);
  }

  function aiScheduleLines(dayIndex) {
    return SCHEDULE[dayIndex].lessons
      .map(
        (lesson) =>
          "• " + lesson.start + "–" + lesson.end + " · " + lesson.subject + " · " + lesson.room
      )
      .join("\n");
  }

  function aiScheduleReply(text) {
    const now = new Date();
    const todayIndex = (now.getDay() + 6) % 7;
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cleaned = text.replace(
      /оваа недела|оваа седмица|следна недела|следна седмица|оваа недела/g,
      "оваа седмица"
    );

    let dayIndex = todayIndex;
    let label = "денес";

    if (text.indexOf("утре") >= 0) {
      target.setDate(target.getDate() + 1);
      dayIndex = (target.getDay() + 6) % 7;
      label = "утре";
    } else {
      let explicit = -1;
      AI_WEEKDAYS.forEach((entry, index) => {
        if (explicit >= 0) return;
        const matched = entry.some((word) => {
          if (word === "нед") {
            return cleaned.indexOf("во недела") >= 0;
          }
          return new RegExp("(^|\\s)" + word + "($|\\s)").test(cleaned);
        });
        if (matched) explicit = index;
      });
      if (explicit >= 0) {
        dayIndex = explicit;
        label = SCHEDULE[explicit] ? SCHEDULE[explicit].name.toLocaleLowerCase("mk-MK") : "тој ден";
      }
    }

    if (dayIndex > 4) {
      return (
        "Во " +
        (dayIndex === 5 ? "сабота" : "недела") +
        " нема настава.\n\nЕве го распоредот за понеделник:\n" +
        aiScheduleLines(0)
      );
    }

    const day = SCHEDULE[dayIndex];
    const datePart =
      label === "денес" || label === "утре"
        ? " (" + target.getDate() + "." + (target.getMonth() + 1) + ")"
        : "";
    return "Распоред за " + label + datePart + ":\n" + aiScheduleLines(dayIndex);
  }

  function aiTasksReply(text) {
    const done = state.assignments.filter((item) => item.completed).length;

    if (aiHas(text, ["завршен", "готов"])) {
      if (!done) {
        return "Сè уште немаш завршени задачи. Кога ќе означиш задача со кругчето, таа ќе се појави овде.";
      }
      const recent = state.assignments
        .filter((item) => item.completed)
        .slice(-3)
        .map((item) => "• " + item.title + " · " + item.subject);
      return "Завршени задачи: " + done + ".\n" + recent.join("\n");
    }

    let active = sortedAssignments().filter((item) => !item.completed);
    if (text.indexOf("тест") >= 0) {
      const tests = active.filter((item) => item.type === "test" || item.type === "quiz");
      if (tests.length) active = tests;
    } else if (text.indexOf("домашн") >= 0) {
      const homework = active.filter((item) => item.type === "homework" || item.type === "project");
      if (homework.length) active = homework;
    }

    if (!active.length) {
      return "Немаш активни задачи — одлична работа! Завршени досега: " + done + ".";
    }

    const lines = active.slice(0, 4).map((item) => {
      const due = dueMeta(item.due, false);
      return "• " + item.title + " · " + item.subject + " · " + due.text;
    });

    return (
      "Најблиски обврски:\n" +
      lines.join("\n") +
      (active.length > 4 ? "\n…и уште " + (active.length - 4) + "." : "")
    );
  }

  function aiNewsReply() {
    const sorted = state.news
      .slice()
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.date - a.date)
      .slice(0, 3);
    if (!sorted.length) return "Во моментов нема објавени вести. Провери подоцна во табот „Вести“.";
    const lines = sorted.map((item) => {
      const category = NEWS_CATEGORIES[item.category] || NEWS_CATEGORIES.announcement;
      return "• " + item.title + " · " + category.label + ", " + formatRelative(item.date);
    });
    return "Најнови вести:\n" + lines.join("\n") + "\n\nЦелосните објави се во табот „Вести“.";
  }

  function aiNotificationsReply() {
    const unread = state.notifications.filter((item) => !item.read);
    if (!unread.length) {
      return "Немаш непрочитани известувања. Сите " + state.notifications.length + " се прочитани.";
    }
    const lines = unread
      .slice()
      .sort((a, b) => b.date - a.date)
      .slice(0, 3)
      .map((item) => "• " + item.title + " · " + formatRelative(item.date));
    return (
      "Имаш " +
      unread.length +
      (unread.length === 1 ? " непрочитано известување" : " непрочитани известувања") +
      ":\n" +
      lines.join("\n")
    );
  }

  function aiGradesReply() {
    if (!state.grades.length) {
      return "Сè уште немаш внесено оценки. Отвори „Јас и алатки“ → „Калкулатор за оценки“, внеси ги и веднаш ќе ти го пресметам просекот.";
    }
    const average = state.grades.reduce((sum, grade) => sum + grade, 0) / state.grades.length;
    const fives = state.grades.filter((grade) => grade === 5).length;
    return (
      "Просекот ти е " +
      formatNumber(average, 2, 2) +
      " од " +
      state.grades.length +
      " оценки" +
      (fives ? " (петки: " + fives + ")" : "") +
      ".\n" +
      gradeDescription(average) +
      "\n\nМожеш да додадеш или отстраниш оценки во „Јас и алатки“."
    );
  }

  function aiQuizReply() {
    const best = bestQuizScore();
    if (!best) {
      return "Квизот со училишни прашања е во „Јас и алатки“. Има 8 прашања и бонус поени за брзина. Почни кога сакаш — рекордот се зачувува локално.";
    }
    return (
      "Најдобриот резултат на квизот ти е " +
      best +
      " поени (" +
      state.scores.length +
      " обиди).\n\nОтвори „Јас и алатки“ → „Училишен квиз“ за нов обид."
    );
  }

  function aiPomodoroReply() {
    const saved = storageGet("pomodoro", null) || {};
    const focus = clamp(Math.round(Number(saved.focus) || 25), 1, 90);
    const rest = clamp(Math.round(Number(saved.break) || 5), 1, 30);
    const completed = Math.max(0, Math.round(Number(saved.completed) || 0));
    return (
      "Тајмерот за учење е во „Јас и алатки“.\n\n" +
      "• Фокус: " +
      focus +
      " минути\n• Пауза: " +
      rest +
      " минути\n• Завршени сесии: " +
      completed +
      "\n\nСовет: учи 25 минути без телефон, па направи 5 минути пауза."
    );
  }

  function aiInfoReply() {
    return (
      SCHOOL.name +
      "\n" +
      "• Адреса: " +
      SCHOOL.address +
      "\n• Телефон: " +
      SCHOOL.phone +
      "\n• Е-пошта: " +
      SCHOOL.email +
      "\n\nДиректорските информации и административните белешки се во „Поставки“ → „Училиште и инфо“."
    );
  }

  function aiAddNoteReply(text) {
    const match = text.match(
      /^(?:запиши(?:\s+ми)?(?:\s+белешка)?|додај\s+белешка)[:\s]+(.+)$/
    );
    if (!match || !match[1].trim()) {
      return "Кажи што да запишам. На пример: „Запиши белешка: утре да го прочитам расказот“.";
    }
    const noteText = match[1].trim();
    state.notes.unshift({
      id: uid(),
      text: noteText,
      color: state.noteColor || "yellow",
      createdAt: Date.now()
    });
    persistNotes();
    renderNotes();
    showToast("Белешката е зачувана.", { icon: "note" });
    return "Запишав белешка:\n„" + noteText + "“\n\nЈа имаш во „Јас и алатки“ → „Мои белешки“.";
  }

  function aiAddTaskReply(text) {
    const match = text.match(
      /^(?:додај|додади|нова|запиши)\s+(?:задача|тест|домашна|проект|квиз)[:\s]+(.+)$/
    );
    if (!match || !match[1].trim()) {
      return "Кажи ми што да додадам. На пример: „Додај задача: проект по историја, рок утре“.";
    }
    const title = match[1].trim();
    let dueInDays = 3;
    if (title.indexOf("утре") >= 0) dueInDays = 1;
    else if (title.indexOf("денес") >= 0) dueInDays = 0;
    else if (aiHas(title, ["следна недела", "следната недела"])) dueInDays = 7;
    else if (aiHas(title, ["оваа недела", "оваа седмица"])) dueInDays = 5;

    let type = "homework";
    if (title.indexOf("тест") >= 0) type = "test";
    else if (title.indexOf("проект") >= 0) type = "project";
    else if (title.indexOf("квиз") >= 0) type = "quiz";

    const subject =
      ASSIGNMENT_SUBJECTS.find((name) =>
        aiNormalize(title).indexOf(aiNormalize(name)) >= 0
      ) || "Општо";

    state.assignments.unshift({
      id: uid(),
      title: title,
      subject: subject,
      type: type,
      due: isoInDays(dueInDays),
      completed: false,
      createdAt: Date.now()
    });
    persistAssignments();
    renderAssignments();
    showToast("Задачата е додадена.", { icon: "clipboard" });
    return (
      "Ја додадов задачата:\n„" +
      title +
      "“\n\nПредмет: " +
      subject +
      " · Рок: " +
      dueMeta(isoInDays(dueInDays), false).text.replace(/^Рок: /, "") +
      ". Ја имаш во „Тестови и распоред“."
    );
  }

  function aiNotesReply() {
    if (!state.notes.length) {
      return "Немаш зачувани белешки. Кажи „Запиши белешка: …“ и веднаш ќе ја зачувам.";
    }
    const lines = state.notes
      .slice(0, 3)
      .map((note) => "• " + note.text);
    return (
      "Имаш " +
      state.notes.length +
      (state.notes.length === 1 ? " зачувана белешка" : " зачувани белешки") +
      ":\n" +
      lines.join("\n") +
      (state.notes.length > 3 ? "\n…и уште " + (state.notes.length - 3) + "." : "")
    );
  }

  function aiHelpReply() {
    return (
      "Можам да ти помогнам со:\n" +
      "• распоред за денес, утре или кој било ден\n" +
      "• претстојни тестови, домашни и рокови\n" +
      "• просек на оценки и резултати од квизот\n" +
      "• најнови вести и непрочитани известувања\n" +
      "• додавање задача или белешка\n" +
      "• информации за училиштето и совети за учење\n\n" +
      "Можеш и да напишеш: „Додај задача: …“ или „Запиши белешка: …“."
    );
  }

  function aiFallbackReply() {
    return (
      "Не сум сосема сигурен што прашуваш. Пробај:\n" +
      "• „Денешен распоред“\n" +
      "• „Кои задачи ми претстојат?“\n" +
      "• „Колку ми е просекот?“\n" +
      "• „Најнови вести“\n" +
      "• „Информации за училиштето“\n\n" +
      "Или напиши „Помош“ за сите можности."
    );
  }

  function generateVladimirReply(rawText) {
    const text = aiNormalize(rawText);
    if (!text) return "Напиши ми прашање и веднаш ќе одговорам.";

    if (text.indexOf("додај задача") === 0 || text.indexOf("додади задача") === 0 || text.indexOf("нова задача") === 0 || text.indexOf("запиши задача") === 0) {
      return aiAddTaskReply(text);
    }
    if (text.indexOf("запиши") === 0 || text.indexOf("додај белешка") === 0) {
      return aiAddNoteReply(text);
    }
    if (aiHas(text, ["колку е часот", "точно време", "кој датум е", "кој ден е"])) {
      return "Сега е " + formatTime(Date.now()) + ", " + formatLongDate(new Date()) + ".";
    }
    if (aiHas(text, ["темна тема", "светла тема", "смени тема", "промени тема"])) {
      let next = "dark";
      if (text.indexOf("светла") >= 0) next = "light";
      else if (text.indexOf("темна") >= 0) next = "dark";
      else next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next, true);
      return next === "dark" ? "Вклучив темна тема." : "Вклучив светла тема.";
    }
    if (aiHas(text, ["кој си", "како се викаш", "твоето име", "што си ти", "дали си ai", "дали си бот", "робот"])) {
      return (
        "Јас сум Владимир — вграден училишен асистент на " +
        SCHOOL.name +
        ".\n\nРаботам локално на твојот уред, без интернет, и не ги испраќам твоите податоци никаде."
      );
    }
    if (aiHas(text, ["благодарам", "фала", "ти благодарам"])) {
      return "Нема на што! Среќно со учењето.";
    }
    if (aiHas(text, ["здраво", "добар ден", "добро утро", "добро вечер", "поздрав", "хај"])) {
      return (
        "Здраво! Како можам да ти помогнам?\n\n" +
        "Можеш да ме прашаш за распоред, задачи, оценки, вести или за училиштето."
      );
    }
    if (aiHas(text, ["помош", "што можеш", "можности", "како работиш", "упатство"])) {
      return aiHelpReply();
    }
    if (aiHas(text, ["распоред", "часови", "настава", "прв час", "кој час"])) {
      return aiScheduleReply(text);
    }
    if (aiHas(text, ["задача", "задачи", "тест", "домашна", "рок", "обврск", "што имам"])) {
      return aiTasksReply(text);
    }
    if (aiHas(text, ["известув", "нотификац", "непрочитан", "аларм", "потсетник"])) {
      return aiNotificationsReply();
    }
    if (aiHas(text, ["вест", "вести", "соопштен", "настан", "ново"])) {
      return aiNewsReply();
    }
    if (aiHas(text, ["оцен", "просек", "успех"])) {
      return aiGradesReply();
    }
    if (aiHas(text, ["квиз", "рекорд", "игра", "поени"])) {
      return aiQuizReply();
    }
    if (aiHas(text, ["тајмер", "помодоро", "фокус", "концентрац", "совет за учење"])) {
      return aiPomodoroReply();
    }
    if (aiHas(text, ["училиште", "адреса", "телефон", "контакт", "директор", "инфо", "е-пошта", "емаил"])) {
      return aiInfoReply();
    }
    if (aiHas(text, ["админ", "пин", "објав"])) {
      return "Админ панелот е последниот таб во долната лента. Пристапот е заштитен со локален ПИН и важи само на овој уред.";
    }
    if (aiHas(text, ["белешк", "нотес"])) {
      return aiNotesReply();
    }
    return aiFallbackReply();
  }

  function initAi() {
    const log = $("#aiLog");
    const form = $("#aiForm");
    const input = $("#aiInput");
    const chips = $("#aiSuggestions");
    const typing = $("#aiTyping");
    const clearButton = $("#aiClearBtn");
    if (!log || !form || !input) return;

    const stored = storageGet("aiChat", null);
    aiMessages =
      Array.isArray(stored) && stored.length
        ? stored
            .filter((message) => message && (message.role === "bot" || message.role === "user") && typeof message.text === "string")
            .slice(-AI_CHAT_LIMIT)
        : [];
    if (!aiMessages.length) aiMessages = [aiWelcomeMessage()];

    aiRender();

    const send = (raw) => {
      const text = String(raw || "").trim();
      if (!text || aiBusy) return;

      aiBusy = true;
      aiAppend(aiPush("user", text));
      input.value = "";
      if (typing) typing.hidden = false;

      window.setTimeout(() => {
        const reply = generateVladimirReply(text);
        if (typing) typing.hidden = true;
        aiAppend(aiPush("bot", reply));
        aiBusy = false;
        vibrate(5);
      }, 520);
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      send(input.value);
    });

    if (chips) {
      chips.addEventListener("click", (event) => {
        const button = event.target.closest("[data-ai-prompt]");
        if (!button) return;
        vibrate(6);
        send(button.dataset.aiPrompt);
      });
    }

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        askConfirm(
          "Исчисти разговор?",
          "Историјата на разговорот со Владимир ќе биде избришана од овој уред.",
          () => {
            aiMessages = [aiWelcomeMessage()];
            persistAiChat();
            aiRender();
            showToast("Разговорот е исчистен.", { icon: "trash" });
          }
        );
      });
    }

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && state.activeTab === "ai") {
        window.requestAnimationFrame(() => {
          log.scrollTop = log.scrollHeight;
        });
      }
    });
  }

  /* =========================================================
     ВЛЕЧЕЊЕ ЗА ОСВЕЖУВАЊЕ
     ========================================================= */
  function initPullToRefresh() {
    const indicator = $("#pullIndicator");
    const text = $("#pullText");
    if (!indicator) return;

    let startY = null;
    let distance = 0;
    let refreshing = false;

    function hidePull() {
      indicator.classList.remove("is-visible", "is-refreshing");
      indicator.style.transform = "";
      if (text) text.textContent = "Повлечи за освежување";
      distance = 0;
    }

    function refreshPortal() {
      refreshing = true;
      indicator.classList.add("is-visible", "is-refreshing");
      indicator.style.transform = "translate(-50%, 44px)";
      if (text) text.textContent = "Освежувам…";
      vibrate(12);
      window.setTimeout(() => {
        renderAll();
        updateHeroDate();
        refreshing = false;
        hidePull();
        showToast("Порталот е освежен.", { icon: "refresh" });
      }, 850);
    }

    document.addEventListener(
      "touchstart",
      (event) => {
        if (refreshing || event.touches.length !== 1) return;
        if (window.scrollY > 0) return;
        if (document.documentElement.classList.contains("is-keyboard-open")) return;
        if (document.querySelector("dialog[open]")) return;
        startY = event.touches[0].clientY;
        distance = 0;
      },
      { passive: true }
    );

    document.addEventListener(
      "touchmove",
      (event) => {
        if (startY === null || refreshing) return;
        const delta = event.touches[0].clientY - startY;
        if (delta <= 0) {
          hidePull();
          return;
        }
        if (window.scrollY > 0) {
          startY = null;
          hidePull();
          return;
        }
        distance = Math.min(delta * 0.5, 82);
        indicator.classList.add("is-visible");
        indicator.style.transform = "translate(-50%, " + Math.min(distance, 52) + "px)";
        if (text) {
          text.textContent =
            distance >= 54 ? "Отпуши за освежување" : "Повлечи за освежување";
        }
      },
      { passive: true }
    );

    document.addEventListener("touchend", () => {
      if (startY === null) return;
      const shouldRefresh = distance >= 54;
      startY = null;
      if (shouldRefresh) refreshPortal();
      else hidePull();
    });

    document.addEventListener("touchcancel", () => {
      startY = null;
      hidePull();
    });
  }

  /* =========================================================
     МОБИЛНА ПЛАТФОРМА · iOS И ANDROID
     ========================================================= */
  function detectPlatform() {
    if (IS_IOS) return "ios";
    if (/Android/i.test(navigator.userAgent || "")) return "android";
    return "other";
  }

  function isIosInAppBrowser() {
    return /(FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\/|Twitter|LinkedIn|Snapchat|Pinterest)/i.test(
      navigator.userAgent || ""
    );
  }

  function initPlatform() {
    const root = document.documentElement;
    root.dataset.platform = detectPlatform();
    root.classList.toggle("is-standalone", isStandaloneMode());

    if (window.matchMedia) {
      const query = window.matchMedia("(display-mode: standalone)");
      const syncMode = () => {
        root.classList.toggle("is-standalone", isStandaloneMode());
        refreshInstallUI();
      };
      if (typeof query.addEventListener === "function") query.addEventListener("change", syncMode);
      else if (typeof query.addListener === "function") query.addListener(syncMode);
    }

    if (navigator.storage && typeof navigator.storage.persist === "function") {
      try {
        navigator.storage
          .persisted()
          .then((persisted) => (persisted ? true : navigator.storage.persist()))
          .catch(() => {});
      } catch (error) {}
    }
  }

  function initViewport() {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    let baseline = window.innerHeight;

    function fieldFocused() {
      const active = document.activeElement;
      return !!active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);
    }

    function keyboardIsOpen() {
      if (!fieldFocused()) return false;
      if (viewport && viewport.scale && viewport.scale > 1.02) return false;
      const visual = viewport ? viewport.height : window.innerHeight;
      return visual < baseline - 140 || window.innerHeight < baseline - 140;
    }

    function syncKeyboard() {
      const open = keyboardIsOpen();
      root.classList.toggle("is-keyboard-open", open);
      if (!open && window.innerHeight > 0) baseline = window.innerHeight;
    }

    if (viewport) {
      viewport.addEventListener("resize", syncKeyboard);
      viewport.addEventListener("scroll", syncKeyboard);
    }

    window.addEventListener("resize", syncKeyboard);
    window.addEventListener("focusout", () => window.setTimeout(syncKeyboard, 160));
    window.addEventListener("orientationchange", () => {
      window.setTimeout(() => {
        root.classList.remove("is-keyboard-open");
        baseline = window.innerHeight;
      }, 320);
    });

    document.addEventListener("focusin", (event) => {
      const field = event.target;
      if (!field || !/^(INPUT|TEXTAREA|SELECT)$/.test(field.tagName)) return;
      window.setTimeout(() => {
        syncKeyboard();
        if (!root.classList.contains("is-keyboard-open")) return;
        const visible = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
        const box = field.getBoundingClientRect();
        if (box.bottom > visible - 12) {
          field.scrollIntoView({
            block: "center",
            behavior: REDUCED_MOTION ? "auto" : "smooth"
          });
        }
      }, 340);
    });
  }

  function initLifecycle() {
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        document.documentElement.classList.remove("is-keyboard-open");
      }
      updateOnlineState(true);
      updateHeroDate();
      refreshInstallUI();
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) updateOnlineState(true);
    });
  }

  /* =========================================================
     ЗАЕДНИЧКО ЦРТАЊЕ
     ========================================================= */
  function updateHeroDate() {
    const heroDate = $("#heroDate");
    if (heroDate) heroDate.textContent = formatLongDate(new Date());
  }

  function renderAll() {
    renderNews();
    renderGroups();
    renderSchedule();
    renderAssignments();
    renderNotifications();
    renderProfile();
    renderNotes();
    renderGrades();
    renderLeaderboard();
    if (adminUnlocked) renderAdminNews();
    appliedColorChoices();
    updateHeroDate();
  }

  /* =========================================================
     СТАРТ
     ========================================================= */
  function init() {
    initTheme();
    initPlatform();
    initViewport();
    initSplash();
    initNavigation();
    initDialogs();
    initConfirm();
    initGlobalFeedback();
    initInstall();
    initNetwork();
    initNews();
    initGroups();
    initSchedule();
    initAssignments();
    initNotifications();
    initInfo();
    initProfile();
    initWelcome();
    initNotes();
    initPomodoro();
    initGrades();
    initQuiz();
    initShare();
    initAi();
    initAdmin();
    initPullToRefresh();
    initLifecycle();

    renderAll();
    registerServiceWorker();

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) updateHeroDate();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
