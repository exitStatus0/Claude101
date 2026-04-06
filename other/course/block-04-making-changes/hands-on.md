---
layout: block-part
title: "Внесение изменений — Тёмная тема — Практика"
block_number: 4
part_name: "Hands-On"
locale: ru
translation_key: block-04-hands-on
overview_url: /other/course/block-04-making-changes/
presentation_url: /other/course/block-04-making-changes/presentation/
hands_on_url: /other/course/block-04-making-changes/hands-on/
permalink: /other/course/block-04-making-changes/hands-on/
---
> **Прямая речь:** "Всё на этой практической странице построено так, чтобы вы могли повторять за мной строка за строкой. Когда вы видите блок с командой или промптом, можете копировать его прямо в терминал или сессию Claude, если я явно не скажу, что это справочный материал. По ходу дела сравнивайте свой результат с моим на экране, чтобы ловить ошибки рано, а не копить их."

> **Продолжительность**: ~25 минут
> **Результат**: Полностью работающая реализация тёмной темы с чистым git-коммитом
> **Пререквизиты**: Блок 3 пройден (ADR и диаграммы созданы, план проверен), Claude Code запущен в директории проекта ai-coderrank

---

### Шаг 1: Запуск реализации (3 мин)

У нас есть план из Блока 3. Теперь выполняем. Убедитесь, что вы в **режиме Act** (не Plan — нажмите Shift+Tab, если нужно).

**Введите:**

```text
We planned a dark theme in our last session. The ADR is at docs/adr/001-dark-theme.md.
Implement the dark theme now. Start with the CSS variables and Tailwind config, then
update the ThemeProvider to support toggling, and finally adjust any component styles
that need dark variants.

Use the existing CSS variable architecture — define dark values under
[data-theme="dark"] so components pick them up automatically.
```

**На что обратить внимание:**
- Claude прочитает текущий CSS-файл, `tailwind.config.ts` и компонент ThemeProvider
- Он использует **инструмент Edit** несколько раз — по одной целевой замене на каждое изменение
- Следите за вызовами инструментов: каждый показывает `old_string` (что нашёл) и `new_string` (чем заменил)
- Первые правки, скорее всего, будут в глобальном CSS-файле — добавление переопределений переменных для тёмной темы

**Вы должны увидеть, как Claude вносит изменения вроде:**

1. Добавление блока CSS-переменных `[data-theme="dark"]` с тёмными цветами
2. Обновление `tailwind.config.ts` для ссылки на CSS-переменные (если ещё не настроено)
3. Модификация ThemeProvider для поддержки переключения темы и сохранения состояния
4. Корректировка скрипта `switch-theme.sh` при необходимости

Дайте Claude проработать всю реализацию. Не прерывайте, если только не видите что-то явно неправильное — пусть завершит цепочку правок.

---

### Шаг 2: Предварительный просмотр изменений (3 мин)

Время посмотреть, что получилось. Попросите Claude запустить dev-сервер:

```text
Run npm run dev so I can preview the changes.
```

Claude выполнит команду. Откройте браузер и перейдите на **http://localhost:3000**.

**Переключите тему**, используя механизм, предоставленный ThemeProvider (кнопка в интерфейсе или скрипт):

```text
Run scripts/switch-theme.sh to toggle to the dark theme, or tell me how to
toggle it in the browser.
```

**Посмотрите на результат в браузере.** Вы здесь — глаза; Claude не видит ваш экран. Обратите внимание на:
- Тёмный ли фон?
- Читается ли текст?
- Как выглядят графики? (Recharts может потребовать корректировки цветов)
- Правильно ли выглядит боковая панель?
- Есть ли элементы, которые всё ещё "застряли" в светлом режиме?

---

### Шаг 3: Итерация дизайна (8 мин)

Это самая интересная часть. Вы будете уточнять тему через разговор. Вот несколько промптов — выберите те, которые соответствуют тому, что вы видите в браузере:

#### Если боковая панель требует доработки:

```text
The sidebar background is too light for dark mode. Make it darker — something
like a very dark gray or near-black. The sidebar text should be light gray,
not white, so it's easy on the eyes.
```

#### Если графикам не хватает контраста:

```text
The Recharts charts are hard to read in dark mode. The line colors and bar
colors need to be brighter and more saturated against the dark background.
Adjust the chart color palette for dark mode.
```

#### Если акцентный цвет не подходит:

```text
The accent color looks washed out in dark mode. Change it to a brighter blue —
something like #3b82f6 — and make sure it has enough contrast against the
dark background.
```

#### Если карточки или панели сливаются с фоном:

```text
The card components are blending into the page background. Add a subtle
border or make the card background slightly lighter than the page background
so they stand out.
```

#### Если контраст текста не в порядке:

```text
Some of the secondary text is too dim in dark mode. Increase the contrast —
the secondary text color should be at least #9ca3af, not darker.
```

**После каждого изменения обновите браузер и оцените.** Расскажите Claude, что видите. Этот диалог — основной рабочий процесс: описываете проблему обычным языком, Claude вносит целевую правку, проверяете результат, повторяете.

**Совет:** Не нужно знать точное имя файла или переменной. Сказать "текст на боковой панели слишком тёмный" — достаточно; Claude найдёт нужную CSS-переменную и исправит.

---

### Шаг 4: Проверка диффа (2 мин)

Прежде чем запускать тесты, посмотрим на всё, что изменилось. Попросите Claude:

```text
Show me the full git diff of all changes we've made.
```

**На что обратить внимание в диффе:**
- Добавления CSS-переменных под `[data-theme="dark"]`
- Модификации конфигурации Tailwind (если есть)
- Изменения ThemeProvider для логики переключения
- Корректировки стилей на уровне компонентов
- Отсутствие непреднамеренных изменений в несвязанных файлах

**Если что-то выглядит неправильно:**

```text
I see you changed [file] but I don't think that was necessary. Can you
revert that specific change?
```

Claude может выборочно отменить изменения с помощью инструмента Edit — вернув исходную строку обратно.

---

### Шаг 5: Запуск тестов (3 мин)

Убедимся, что ничего не сломалось:

```text
Run npm test and show me the results. If any tests fail, explain why and
fix them.
```

**На что обратить внимание:**
- Claude запускает команду тестов
- Если тесты прошли: отлично, двигаемся дальше
- Если тесты упали: Claude прочитает вывод ошибки, определит причину и предложит исправления

**Типичные причины падения тестов после изменения темы:**

1. **Snapshot-тесты** — Компоненты рендерятся по-другому с новым CSS. Claude обновит снапшоты.
2. **Проверки цветов** — Если тесты проверяют конкретные значения цветов, их нужно обновить.
3. **Тесты доступности** — Проверки контраста могут отметить цвета, которые слишком близки друг к другу.

**Если тесты упали, пусть Claude их исправит:**

```text
Fix the failing tests. If they're snapshot tests, update the snapshots.
If they're asserting specific colors, update them to match the dark theme values.
```

Запустите тесты снова после исправлений:

```text
Run npm test again to confirm everything passes.
```

---

### Шаг 6: Коммит с помощью Claude (4 мин)

Всё работает. Время коммитить. Вот где интеграция Claude с git раскрывается:

```text
Commit all the dark theme changes. Write a descriptive commit message that
explains what was changed and why.
```

**На что обратить внимание:**
- Claude запускает `git add` на конкретных файлах, которые он изменил (не `git add .`)
- Он пишет сообщение коммита — следите за качеством. Оно должно упоминать:
  - Что: реализация тёмной темы
  - Как: CSS-переменные, обновления ThemeProvider
  - Почему: ссылка на ADR или упоминание проектного решения
- Коммит создаётся чисто

**Сообщение коммита должно выглядеть примерно так:**

```text
feat: implement dark theme using CSS custom properties

Add dark theme color palette under [data-theme="dark"] selector,
update ThemeProvider to support theme toggling with localStorage
persistence, and adjust chart colors for dark mode contrast.

Implements the decision documented in docs/adr/001-dark-theme.md.
```

Не `"update styles"`. Не `"dark mode"`. Настоящее, полезное сообщение коммита.

---

### Шаг 7: Проверка git-лога (2 мин)

Убедимся, что всё чисто:

```text
Show me the git log with the last 5 commits, and then show me a summary
of the files changed in the most recent commit.
```

**Вы должны увидеть:**
- Ваш коммит с тёмной темой наверху
- Чистый список изменённых файлов (CSS, конфигурация, ThemeProvider, возможно компоненты)
- Никаких неожиданных файлов в коммите

**Необязательно — проверка содержимого коммита:**

```text
Show me git show --stat for the latest commit.
```

Это даёт сводку изменённых файлов с количеством добавленных/удалённых строк — хорошая финальная проверка.

---

### Контрольная точка

Перед продолжением проверьте:

- [ ] Тёмная тема корректно отображается на http://localhost:3000
- [ ] Текст читаем и в светлом, и в тёмном режимах
- [ ] Графики имеют достаточный контраст в тёмном режиме
- [ ] Переключатель тем работает (переключение между светлой и тёмной)
- [ ] `npm test` проходит без ошибок
- [ ] Существует чистый коммит с описательным сообщением
- [ ] `git log` показывает коммит, и `git diff` чист (нет неподготовленных изменений)

**Веха достигнута: Тёмная тема работает локально!**

---

### Ключевые выводы

1. **Инструмент Edit — это точность, а не грубая сила.** Каждая правка указывает точную строку для поиска и замены. Именно поэтому Claude может изменить одну CSS-переменную в 200-строчном файле, не трогая ничего вокруг. Именно поэтому ему можно доверять работу с конфигурационными файлами и манифестами.

2. **Вы — визуальная обратная связь.** Claude не видит ваш браузер. Ваша задача — описывать то, что видите: "текст плохо читается", "боковая панель сливается", "графики выглядят отлично". Claude переводит вашу обратную связь в точные изменения кода. Чем лучше вы описываете то, что видите, тем меньше итераций вам нужно.

3. **Итерация — это рабочий процесс, а не запасной вариант.** Получить идеальный результат с первого промпта — приятно. Получить его после трёх уточнений — *нормально*. Профессиональные дизайнеры итерируют. Профессиональные инженеры итерируют. Вы итерируете с AI-партнёром — это не ограничение, это преимущество.

4. **Интеграция с git замыкает цикл.** Не нужно переключаться в терминал, чтобы закоммитить. Claude добавляет нужные файлы, пишет осмысленное сообщение и поддерживает чистую git-историю. Это важнее, чем кажется — когда вы в потоке, оставаться в разговоре позволяет сохранять этот поток.

5. **Тесты ловят то, что глаза пропускают.** Всегда запускайте набор тестов после визуальных изменений. Изменение темы может сломать snapshot-тесты, проверки доступности и цветовые ассершены. Claude быстро исправляет такие поломки, но сначала нужно попросить его запустить тесты.

---

### Что дальше

В Блоке 5 мы научим Claude *запоминать* ваши предпочтения. Например, что вы предпочитаете тёмный режим. Или что ваша команда использует conventional commits. Или что Kubernetes-манифесты всегда должны включать лимиты ресурсов. Здесь Claude перестаёт быть инструментом, который вы используете, и становится коллегой, который знает вашу кодовую базу.
