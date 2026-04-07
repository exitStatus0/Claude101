---
layout: block-part
title: "Планування з ADR та діаграмами — Практика"
block_number: 3
part_name: "Hands-On"
locale: uk
translation_key: block-03-hands-on
overview_url: /ua/course/block-03-planning-adrs/
presentation_url: /ua/course/block-03-planning-adrs/presentation/
hands_on_url: /ua/course/block-03-planning-adrs/hands-on/
quiz_url: /ua/course/block-03-planning-adrs/quiz/
permalink: /ua/course/block-03-planning-adrs/hands-on/
---
> **Пряма мова:** "Все на цій практичній сторінці побудовано так, щоб ви могли слідувати за мною рядок за рядком. Коли бачите блок із командою або промптом, можете копіювати його прямо в термінал або сесію Claude, якщо я явно не скажу, що це лише довідковий матеріал. Порівнюйте свій результат із моїм на екрані, щоб виловлювати помилки відразу, а не накопичувати їх."

> **Тривалість**: ~25 хвилин
> **Результат**: ADR, три Mermaid-діаграми та солідний план реалізації темної теми
> **Передумови**: Блок 2 завершений, Claude Code запущений усередині директорії проєкту ai-coderrank

---

### Крок 1: Увійдіть у режим Plan (2 хв)

Ми збираємося спланувати зміну темної теми до написання будь-якого коду. Спочатку переключимо Claude у режим планування.

**У сесії Claude Code натисніть Shift+Tab.**

Ви побачите зміну індикатора режиму. Claude тепер у **режимі Plan** — він аналізуватиме та міркуватиме, але не буде редагувати файли чи запускати команди.

> **Альтернатива:** Ви також можете ввести `/plan`, щоб увійти в режим планування.

Тепер дайте Claude загальну картину:

```text
We need to add a dark theme to ai-coderrank. The app currently uses a light theme
with CSS variables and a ThemeProvider component. There's also a scripts/switch-theme.sh
script for theme switching.

Before we implement anything, I want to plan this change. Analyze the current theme
system — look at the Tailwind config, CSS variables, ThemeProvider, and the switch-theme
script. Tell me every file we'll need to touch and what changes each one needs.
```

**На що звернути увагу:**
- Claude прочитає файли `tailwind.config.ts`, глобальний CSS, компонент ThemeProvider та `scripts/switch-theme.sh`
- Він створить структурований план із переліком файлів, змін та порядком операцій
- Має ідентифікувати визначення CSS-змінних, конфігурацію темного режиму Tailwind та стилі на рівні компонентів

**Приділіть час читанню плану.** Чи має він сенс? Чи щось пропущено? Це ваш шанс скоригувати курс до будь-яких змін у коді.

---

### Крок 2: Створення директорії ADR та документа (8 хв)

Тепер попросимо Claude створити Architecture Decision Record. Залишайтеся в режимі Plan для початкового обговорення, потім переключіться в режим Act для створення файлу.

**Все ще в режимі Plan, введіть:**

```text
I want to create an ADR (Architecture Decision Record) for this dark theme decision.
The ADR should follow this structure:
- Title, Status, Date
- Context: why are we adding dark themes?
- Decision: what approach are we taking?
- Consequences: what are the trade-offs?
- Alternatives Considered: what else did we evaluate?

The context should mention: developer preference, reduced eye strain, industry standard
for dev tools, and that our target audience (developers comparing AI models) likely
prefers dark themes. The decision should reference the existing ThemeProvider and CSS
variable architecture.
```

Claude створить чернетку ADR у режимі Plan. Перегляньте — запропонуйте правки, якщо потрібно.

**Коли ви задоволені планом, натисніть Shift+Tab, щоб повернутися в режим Act.**

Тепер скажіть Claude створити файл:

```text
Create the ADR at docs/adr/001-dark-theme.md with the content we just planned.
```

**На що звернути увагу:**
- Claude використовує інструмент **Write** для створення нового файлу (бо його ще не існує)
- Він автоматично створює структуру директорій `docs/adr/`
- ADR має бути чистим, добре форматованим markdown

**Перевірте, що файл створений:**

```text
Show me the contents of docs/adr/001-dark-theme.md
```

Ваш ADR має виглядати приблизно так (версія Claude може відрізнятися):

```markdown
# ADR-001: Add Dark Theme to ai-coderrank

**Status:** Accepted
**Date:** 2026-04-05

## Context

ai-coderrank is a developer-facing dashboard for comparing AI coding models.
Our target audience — developers, DevOps engineers, and engineering managers —
overwhelmingly prefers dark themes in their tooling...

## Decision

We will implement a dark theme using the existing CSS variable architecture
and ThemeProvider component...

## Consequences

### Positive
- Better developer experience, especially for extended use
- Aligns with industry standards for developer tools
...

### Negative
- Increases CSS surface area (two complete color palettes to maintain)
- Chart colors in Recharts need separate dark-optimized palettes
...

## Alternatives Considered

1. **System-preference-only** — Follow OS dark/light setting automatically...
2. **CSS-only toggle without ThemeProvider** — Simpler but less flexible...
3. **Keep light theme only** — Rejected because...
```

---

### Крок 3: Генерація діаграми топології інфраструктури (5 хв)

Тепер створимо Mermaid-діаграми для документування нашої інфраструктури. Вони корисні самі по собі, а також дають Claude (і майбутнім колегам) візуальну карту системи.

**Введіть:**

```text
Create a Mermaid diagram at docs/diagrams/infrastructure.md that shows our
infrastructure topology:

- DigitalOcean Droplet (the host machine, public IP)
  - k3s cluster running on the droplet
    - ai-coderrank app (pod with the Next.js container, exposed via NodePort 30080)
    - ArgoCD (pod for GitOps deployment)
    - System components (CoreDNS, Traefik, metrics-server)
- External: GitHub (source repo), GHCR (container registry)

Use a top-down graph. Include a brief explanation above the diagram of what
it shows. Wrap the Mermaid code in a ```mermaid fenced code block so GitHub
renders it automatically.
```

**На що звернути увагу:**
- Claude створює директорію `docs/diagrams/`
- Синтаксис Mermaid має використовувати `graph TD` (top-down) або `graph TB` (top-bottom)
- Ноди мають мати описові мітки
- GitHub автоматично відрендерить діаграму, коли ви переглянете файл

**Якщо діаграма не зовсім правильна — ітеруйте:**

```text
Can you add the DigitalOcean floating IP as the entry point, and group the k3s
components inside a subgraph?
```

Це одна з сильних сторін Claude — ітерація діаграм набагато швидша, ніж перетягування блоків у GUI-інструменті.

---

### Крок 4: Генерація діаграми потоку трафіку (4 хв)

**Введіть:**

```text
Create a Mermaid diagram at docs/diagrams/traffic-flow.md that shows how a user
request reaches the ai-coderrank app:

1. User's browser hits http://DROPLET_IP:30080
2. DigitalOcean droplet receives traffic on NodePort 30080
3. k3s kube-proxy routes to the Kubernetes Service
4. Service forwards to ai-coderrank Pod on port 3000
5. Next.js serves the response back through the same chain

Use a left-to-right flow diagram. Include port numbers at each hop.
Add a brief description above the diagram.
```

**На що звернути увагу:**
- Діаграма має використовувати `graph LR` для потоку зліва направо
- Має чітко показувати шлях запиту з номерами портів на кожному переході
- NodePort 30080 — зовнішня точка входу, порт контейнера 3000 — внутрішній

**Ітеруйте за потреби:**

```text
Add a note showing that this is the simplest exposure method — no DNS, no TLS,
no Ingress needed. Just the droplet's public IP and the NodePort.
```

---

### Крок 5: Генерація діаграми пайплайну деплою (4 хв)

**Введіть:**

```text
Create a Mermaid diagram at docs/diagrams/deployment-pipeline.md that shows
the deployment pipeline:

1. Developer pushes to GitHub (main branch)
2. GitHub Actions triggers CI workflow
3. CI runs: lint, test, build
4. Docker image is built and pushed to container registry
5. ArgoCD detects the change (watches the repo or registry)
6. ArgoCD syncs the new image to the k3s cluster
7. k3s performs a rolling update of the ai-coderrank pod

Use a top-down flow. Color-code or use different shapes for: developer actions,
CI/CD automation, and Kubernetes operations. Add a description above the diagram.
```

**На що звернути увагу:**
- Різні форми нод для різних аспектів (прямокутники для кроків, ромби для рішень, закруглені для початку/кінця)
- Чіткий поділ між фазою CI та фазою CD
- Роль ArgoCD як мосту між "код запушений" та "застосунок задеплоєний"

**Ітеруйте за потреби:**

```text
Can you add a decision diamond after the CI step that shows "Tests pass?" with
a Yes path to Docker build and a No path to "Notify developer, stop pipeline"?
```

---

### Крок 6: Перегляд усього (2 хв)

Підіб'ємо підсумки того, що ми створили. Попросіть Claude дати зведення:

```text
List all the files we created in this session with a one-line description of each.
Then give me a quick summary of the dark theme implementation plan — which files
will we change in Block 4 and in what order?
```

**Ви маєте побачити чотири файли:**

| Файл | Опис |
|------|------|
| `docs/adr/001-dark-theme.md` | Architecture Decision Record для темної теми |
| `docs/diagrams/infrastructure.md` | Mermaid-діаграма інфраструктури DO/k3s |
| `docs/diagrams/traffic-flow.md` | Mermaid-діаграма маршрутизації запитів |
| `docs/diagrams/deployment-pipeline.md` | Mermaid-діаграма CI/CD-пайплайну |

**Опціонально — перегляд діаграм:**

Якщо хочете побачити діаграми відрендереними:
- Запушіть файли на GitHub і перегляньте у браузері (GitHub рендерить Mermaid нативно)
- Використайте розширення VS Code "Markdown Preview Mermaid Support"
- Вставте код Mermaid у [mermaid.live](https://mermaid.live) для живого перегляду

---

### Чекпоінт

Перед переходом до Блоку 4 перевірте:

- [ ] `docs/adr/001-dark-theme.md` існує і має повний ADR з Context, Decision, Consequences та Alternatives
- [ ] `docs/diagrams/infrastructure.md` має Mermaid-діаграму, що показує DO-дроплет, k3s та всі поди
- [ ] `docs/diagrams/traffic-flow.md` має Mermaid-діаграму, що показує шлях запиту від користувача до пода
- [ ] `docs/diagrams/deployment-pipeline.md` має Mermaid-діаграму, що показує повний CI/CD-пайплайн
- [ ] У вас є чітка ментальна модель, які файли зміняться для темної теми (з виводу режиму Plan)
- [ ] Ви розумієте різницю між режимами Plan та Act

---

### Ключові висновки

1. **Режим Plan — це ваш передпольотний чеклист.** Використовуйте для будь-якої зміни, що торкається більш ніж 2-3 файлів. Кілька хвилин планування вбережуть від хибних поворотів.

2. **ADR напрочуд легко створювати з Claude.** Те, що зазвичай займає 30 хвилин написання, займає 2 хвилини промптів і перегляду. Складна частина — зафіксувати *міркування* — саме те, в чому Claude добрий.

3. **Mermaid-діаграми — це жива документація.** Вони живуть у репозиторії, підтримують diff, і GitHub їх рендерить. Більше жодних зламаних посилань на Lucidchart.

4. **Ітерація — це секрет.** Перший промпт не дасть ідеального результату. Другий чи третій — дасть. Це нормально й очікувано — саме так має відчуватися робота з AI.

---

### Що далі

У Блоці 4 ми візьмемо цей план і *виконаємо* його. Claude редагуватиме конфіг Tailwind, CSS-змінні та стилі компонентів для реалізації темної теми. Ви побачите інструмент Edit у дії — хірургічні, точні модифікації файлів — і навчитеся ітерувати візуальні зміни з Claude, поки результат не буде виглядати саме так, як потрібно.

План готовий. Час будувати.

---

<div class="cta-block">
  <p>Готові перевірити засвоєне?</p>
  <a href="{{ '/ua/course/block-03-planning-adrs/quiz/' | relative_url }}" class="hero-cta">Пройти квіз &rarr;</a>
</div>
