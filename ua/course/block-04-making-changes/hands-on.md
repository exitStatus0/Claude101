---
layout: block-part
title: "Внесення змін — темна тема — Практика"
block_number: 4
part_name: "Hands-On"
locale: uk
translation_key: block-04-hands-on
overview_url: /ua/course/block-04-making-changes/
presentation_url: /ua/course/block-04-making-changes/presentation/
hands_on_url: /ua/course/block-04-making-changes/hands-on/
quiz_url: /ua/course/block-04-making-changes/quiz/
permalink: /ua/course/block-04-making-changes/hands-on/
---
> **Пряма мова:** "Все на цій практичній сторінці побудовано так, щоб ви могли слідувати за мною рядок за рядком. Коли бачите блок із командою або промптом, можете копіювати його прямо в термінал або сесію Claude, якщо я явно не скажу, що це лише довідковий матеріал. Порівнюйте свій результат із моїм на екрані, щоб виловлювати помилки відразу, а не накопичувати їх."

> **Тривалість**: ~25 хвилин
> **Результат**: Повністю працююча реалізація темної теми з чистим git-комітом
> **Передумови**: Блок 3 завершений (ADR та діаграми створені, план переглянутий), Claude Code запущений у директорії проєкту ai-coderrank

---

### Крок 1: Запуск реалізації (3 хв)

У нас є план з Блоку 3. Тепер виконуємо. Переконайтеся, що ви в **режимі Act** (не Plan — натисніть Shift+Tab, якщо потрібно).

**Введіть:**

```text
We planned a dark theme in our last session. The ADR is at docs/adr/001-dark-theme.md.
Implement the dark theme now. Start with the CSS variables and Tailwind config, then
update the ThemeProvider to support toggling, and finally adjust any component styles
that need dark variants.

Use the existing CSS variable architecture — define dark values under
[data-theme="dark"] so components pick them up automatically.
```

**На що звернути увагу:**
- Claude прочитає поточний CSS-файл, `tailwind.config.ts` та компонент ThemeProvider
- Він використає **інструмент Edit** кілька разів — по одній точковій заміні на кожну зміну
- Стежте за викликами інструментів: кожен показує `old_string` (що знайдено) та `new_string` (на що замінено)
- Перші правки, ймовірно, будуть у глобальному CSS-файлі — додавання перевизначень змінних темної теми

**Ви маєте побачити, як Claude робить зміни на кшталт:**

1. Додавання блоку CSS-змінних `[data-theme="dark"]` з темними кольорами
2. Оновлення `tailwind.config.ts` для посилання на CSS-змінні (якщо ще не зроблено)
3. Модифікація ThemeProvider для підтримки перемикання тем та збереження
4. Налаштування скрипта `switch-theme.sh` за потреби

Дозвольте Claude пройти всю реалізацію. Не переривайте, якщо не бачите чогось явно неправильного — дайте йому закінчити ланцюжок правок.

---

### Крок 2: Попередній перегляд змін (3 хв)

Час подивитися, що вийшло. Попросіть Claude запустити dev-сервер:

```text
Run npm run dev so I can preview the changes.
```

Claude виконає команду. Відкрийте браузер і перейдіть на **http://localhost:3000**.

**Переключіть тему** через механізм, наданий ThemeProvider (кнопка в UI або скрипт):

```text
Run scripts/switch-theme.sh to toggle to the dark theme, or tell me how to
toggle it in the browser.
```

**Подивіться на результат у браузері.** Ви тут — очі; Claude не бачить ваш екран. Зверніть увагу на:
- Чи фон темний?
- Чи текст читабельний?
- Як виглядають графіки? (Recharts може потребувати коригування кольорів)
- Чи сайдбар виглядає правильно?
- Чи є елементи, що "застрягли" в світлому режимі?

---

### Крок 3: Ітерація дизайну (8 хв)

Це найцікавіша частина. Ви будете доводити тему через розмову. Ось промпти для спроби — виберіть ті, що відповідають тому, що ви бачите в браузері:

#### Якщо сайдбар потребує доопрацювання:

```text
The sidebar background is too light for dark mode. Make it darker — something
like a very dark gray or near-black. The sidebar text should be light gray,
not white, so it's easy on the eyes.
```

#### Якщо графікам потрібен контраст:

```text
The Recharts charts are hard to read in dark mode. The line colors and bar
colors need to be brighter and more saturated against the dark background.
Adjust the chart color palette for dark mode.
```

#### Якщо акцентний колір не той:

```text
The accent color looks washed out in dark mode. Change it to a brighter blue —
something like #3b82f6 — and make sure it has enough contrast against the
dark background.
```

#### Якщо картки зливаються з фоном:

```text
The card components are blending into the page background. Add a subtle
border or make the card background slightly lighter than the page background
so they stand out.
```

#### Якщо контраст тексту не той:

```text
Some of the secondary text is too dim in dark mode. Increase the contrast —
the secondary text color should be at least #9ca3af, not darker.
```

**Після кожної зміни оновлюйте браузер і оцінюйте.** Кажіть Claude, що бачите. Цей діалог — ядро воркфлоу: описуєте проблему простою мовою, Claude робить точкову правку, перевіряєте результат, повторюєте.

**Порада:** Не потрібно знати точне ім'я файлу чи змінної. Сказати "текст сайдбара занадто темний" достатньо — Claude знайде потрібну CSS-змінну та підлаштує її.

---

### Крок 4: Перегляд diff (2 хв)

Перед запуском тестів подивімося на всі зміни. Попросіть Claude:

```text
Show me the full git diff of all changes we've made.
```

**На що звернути увагу в diff:**
- Додавання CSS-змінних під `[data-theme="dark"]`
- Модифікації конфігу Tailwind (якщо є)
- Зміни ThemeProvider для логіки перемикання
- Коригування стилів на рівні компонентів
- Відсутність ненавмисних змін у непов'язаних файлах

**Якщо щось виглядає неправильно:**

```text
I see you changed [file] but I don't think that was necessary. Can you
revert that specific change?
```

Claude може вибірково скасовувати зміни за допомогою інструменту Edit — повертаючи оригінальний рядок.

---

### Крок 5: Запуск тестів (3 хв)

Переконаємося, що нічого не зламали:

```text
Run npm test and show me the results. If any tests fail, explain why and
fix them.
```

**На що звернути увагу:**
- Claude запускає тестову команду
- Якщо тести проходять: чудово, рухаємось далі
- Якщо тести падають: Claude прочитає вивід помилки, визначить причину та запропонує виправлення

**Типові падіння тестів після зміни теми:**

1. **Snapshot-тести** — Компоненти рендеряться інакше з новим CSS. Claude оновить снепшоти.
2. **Перевірки кольорів** — Якщо тести перевіряють конкретні значення кольорів, їх потрібно оновити.
3. **Тести доступності** — Перевірки коефіцієнта контрасту можуть позначити занадто схожі кольори.

**Якщо тести падають, дозвольте Claude їх виправити:**

```text
Fix the failing tests. If they're snapshot tests, update the snapshots.
If they're asserting specific colors, update them to match the dark theme values.
```

Запустіть тести знову після виправлень:

```text
Run npm test again to confirm everything passes.
```

---

### Крок 6: Коміт із Claude (4 хв)

Все працює. Час комітити. Тут git-інтеграція Claude розкривається:

```text
Commit all the dark theme changes. Write a descriptive commit message that
explains what was changed and why.
```

**На що звернути увагу:**
- Claude запускає `git add` на конкретних файлах, які змінив (не `git add .`)
- Він пише коміт-повідомлення — зверніть увагу на якість. Має згадувати:
  - Що: реалізація темної теми
  - Як: CSS-змінні, оновлення ThemeProvider
  - Чому: посилання на ADR або згадка рішення планування
- Коміт створюється чисто

**Коміт-повідомлення має виглядати приблизно так:**

```text
feat: implement dark theme using CSS custom properties

Add dark theme color palette under [data-theme="dark"] selector,
update ThemeProvider to support theme toggling with localStorage
persistence, and adjust chart colors for dark mode contrast.

Implements the decision documented in docs/adr/001-dark-theme.md.
```

Не `"update styles"`. Не `"dark mode"`. Справжнє, корисне коміт-повідомлення.

---

### Крок 7: Перегляд git log (2 хв)

Перевіримо, що все чисто:

```text
Show me the git log with the last 5 commits, and then show me a summary
of the files changed in the most recent commit.
```

**Ви маєте побачити:**
- Ваш коміт з темною темою зверху
- Чистий список змінених файлів (CSS, конфіг, ThemeProvider, можливо компоненти)
- Жодних неочікуваних файлів у коміті

**Опціонально — перевірка вмісту коміту:**

```text
Show me git show --stat for the latest commit.
```

Це дає зведення змінених файлів із кількістю доданих/видалених рядків — гарна фінальна перевірка.

---

### Чекпоінт

Перед тим як рухатися далі, перевірте:

- [ ] Темна тема коректно відображається на http://localhost:3000
- [ ] Текст читабельний в обох режимах — світлому та темному
- [ ] Графіки мають адекватний контраст у темному режимі
- [ ] Перемикання теми працює (переключення між світлою та темною)
- [ ] `npm test` проходить без падінь
- [ ] Існує чистий коміт з описовим повідомленням
- [ ] `git log` показує коміт, а `git diff` чистий (немає нестейджених змін)

**Майлстоун досягнуто: темна тема працює локально!**

---

### Ключові висновки

1. **Інструмент Edit — це точність, а не грубе втручання.** Кожна правка вказує точний рядок для пошуку та заміни. Ось чому Claude може модифікувати одну CSS-змінну у 200-рядковому файлі, не торкнувшись нічого іншого. І тому йому можна довіряти конфіг-файли та маніфести.

2. **Ви — візуальний зворотний зв'язок.** Claude не бачить ваш браузер. Ваша задача — описувати, що ви бачите: "текст важко читати", "сайдбар зливається", "графіки виглядають чудово." Claude перекладає ваш фідбек у точні зміни коду. Чим краще описуєте побачене — тим менше ітерацій потрібно.

3. **Ітерація — це воркфлоу, а не запасний варіант.** Влучити з першого промпту — приємно. Влучити після трьох уточнень — *нормально*. Професійні дизайнери ітерують. Професійні інженери ітерують. Ви ітеруєте з AI-партнером — це не обмеження, це фіча.

4. **Git-інтеграція замикає цикл.** Не потрібно перемикати контекст на термінал для коміту. Claude стейджить правильні файли, пише змістовне повідомлення та підтримує чисту git-історію. Це важливіше, ніж здається — коли ви в потоці, збереження розмови тримає вас у ньому.

5. **Тести ловлять те, що очі пропускають.** Завжди запускайте набір тестів після візуальних змін. Зміна теми може зламати snapshot-тести, перевірки доступності та перевірки на основі кольорів. Claude швидко обробляє ці виправлення, але ви маєте спочатку попросити його запустити тести.

---

### Що далі

У Блоці 5 ми навчимо Claude *запам'ятовувати* ваші вподобання. Наприклад, що ви віддаєте перевагу темному режиму. Або що ваша команда використовує conventional commits. Або що Kubernetes-маніфести завжди мають містити resource limits. Це момент, коли Claude перестає бути інструментом, який ви використовуєте, і стає колаборатором, що знає вашу кодову базу.

---

<div class="cta-block">
  <p>Готові перевірити засвоєне?</p>
  <a href="{{ '/ua/course/block-04-making-changes/quiz/' | relative_url }}" class="hero-cta">Пройти квіз &rarr;</a>
</div>
