---
layout: block-part
title: "Планирование с ADR и диаграммами — Практика"
block_number: 3
part_name: "Hands-On"
locale: ru
translation_key: block-03-hands-on
overview_url: /other/course/block-03-planning-adrs/
presentation_url: /other/course/block-03-planning-adrs/presentation/
hands_on_url: /other/course/block-03-planning-adrs/hands-on/
permalink: /other/course/block-03-planning-adrs/hands-on/
---
> **Прямая речь:** "Всё на этой практической странице построено так, чтобы вы могли повторять за мной строка за строкой. Когда вы видите блок с командой или промптом, можете копировать его прямо в терминал или сессию Claude, если я явно не скажу, что это справочный материал. По ходу дела сравнивайте свой результат с моим на экране, чтобы ловить ошибки рано, а не копить их."

> **Продолжительность**: ~25 минут
> **Результат**: ADR, три диаграммы Mermaid и твёрдый план реализации тёмной темы
> **Пререквизиты**: Блок 2 пройден, Claude Code запущен внутри директории проекта ai-coderrank

---

### Шаг 1: Вход в режим Plan (2 мин)

Мы будем планировать изменение тёмной темы до написания кода. Сначала переключим Claude в режим планирования.

**В сессии Claude Code нажмите Shift+Tab.**

Вы увидите, как изменится индикатор режима. Claude теперь в **режиме Plan** — он будет анализировать и рассуждать, но не будет редактировать файлы и выполнять команды.

> **Альтернатива:** Можно также ввести `/plan` для входа в режим планирования.

Теперь дайте Claude общую картину:

```text
We need to add a dark theme to ai-coderrank. The app currently uses a light theme
with CSS variables and a ThemeProvider component. There's also a scripts/switch-theme.sh
script for theme switching.

Before we implement anything, I want to plan this change. Analyze the current theme
system — look at the Tailwind config, CSS variables, ThemeProvider, and the switch-theme
script. Tell me every file we'll need to touch and what changes each one needs.
```

**На что обратить внимание:**
- Claude прочитает файлы вроде `tailwind.config.ts`, глобальный CSS-файл, компонент ThemeProvider и `scripts/switch-theme.sh`
- Он выдаст структурированный план с перечнем файлов, изменений и порядка операций
- Он должен определить определения CSS-переменных, конфигурацию тёмного режима Tailwind и стили на уровне компонентов

**Уделите время чтению плана.** Имеет ли он смысл? Что-то упущено? Это ваш шанс скорректировать курс, пока никаких изменений в коде не произошло.

---

### Шаг 2: Создание директории ADR и документа (8 мин)

Теперь попросим Claude создать Architecture Decision Record. Оставайтесь в режиме Plan для начального обсуждения, затем переключитесь в режим Act для создания файла.

**Всё ещё в режиме Plan, введите:**

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

Claude составит черновик содержания ADR в режиме Plan. Проверьте — предложите правки, если нужно.

**Когда вы довольны планом, нажмите Shift+Tab, чтобы переключиться обратно в режим Act.**

Теперь скажите Claude создать файл:

```text
Create the ADR at docs/adr/001-dark-theme.md with the content we just planned.
```

**На что обратить внимание:**
- Claude использует инструмент **Write** для создания нового файла (поскольку его ещё не существует)
- Он автоматически создаёт структуру директорий `docs/adr/`
- ADR должен быть чистым, хорошо отформатированным markdown

**Проверьте, что файл создан:**

```text
Show me the contents of docs/adr/001-dark-theme.md
```

Ваш ADR должен выглядеть примерно так (версия Claude может отличаться):

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

### Шаг 3: Генерация диаграммы топологии инфраструктуры (5 мин)

Теперь создадим диаграммы Mermaid, документирующие нашу инфраструктуру. Они полезны сами по себе, и они дают Claude (и будущим членам команды) визуальную карту системы.

**Введите:**

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

**На что обратить внимание:**
- Claude создаёт директорию `docs/diagrams/`
- Синтаксис Mermaid должен использовать `graph TD` (сверху вниз) или `graph TB` (сверху вниз)
- Узлы должны иметь описательные подписи
- GitHub автоматически отрендерит диаграмму при просмотре файла

**Если диаграмма не совсем правильная, итерируйте:**

```text
Can you add the DigitalOcean floating IP as the entry point, and group the k3s
components inside a subgraph?
```

Это одна из сильных сторон Claude — итерировать диаграммы гораздо быстрее, чем таскать блоки в графическом редакторе.

---

### Шаг 4: Генерация диаграммы потока трафика (4 мин)

**Введите:**

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

**На что обратить внимание:**
- Диаграмма должна использовать `graph LR` для направления слева направо
- Она должна чётко показывать путь запроса с номерами портов на каждом переходе
- NodePort 30080 — внешняя точка входа, порт контейнера 3000 — внутренний

**Итерируйте при необходимости:**

```text
Add a note showing that this is the simplest exposure method — no DNS, no TLS,
no Ingress needed. Just the droplet's public IP and the NodePort.
```

---

### Шаг 5: Генерация диаграммы пайплайна деплоя (4 мин)

**Введите:**

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

**На что обратить внимание:**
- Разные формы узлов для разных задач (прямоугольники для шагов, ромбы для решений, скруглённые для начала/конца)
- Чёткое разделение фазы CI и фазы CD
- Роль ArgoCD как моста между "код запушен" и "приложение задеплоено"

**Итерируйте при необходимости:**

```text
Can you add a decision diamond after the CI step that shows "Tests pass?" with
a Yes path to Docker build and a No path to "Notify developer, stop pipeline"?
```

---

### Шаг 6: Обзор всего сделанного (2 мин)

Давайте подведём итог того, что мы создали. Попросите Claude дать сводку:

```text
List all the files we created in this session with a one-line description of each.
Then give me a quick summary of the dark theme implementation plan — which files
will we change in Block 4 and in what order?
```

**Вы должны увидеть четыре файла:**

| Файл | Описание |
|------|----------|
| `docs/adr/001-dark-theme.md` | Architecture Decision Record для тёмной темы |
| `docs/diagrams/infrastructure.md` | Mermaid-диаграмма инфраструктуры DO/k3s |
| `docs/diagrams/traffic-flow.md` | Mermaid-диаграмма маршрутизации запросов |
| `docs/diagrams/deployment-pipeline.md` | Mermaid-диаграмма CI/CD-пайплайна |

**Необязательно — предварительный просмотр диаграмм:**

Если хотите увидеть отрендеренные диаграммы, можно:
- Запушить файлы на GitHub и посмотреть в браузере (GitHub рендерит Mermaid нативно)
- Использовать расширение VS Code вроде "Markdown Preview Mermaid Support"
- Вставить код Mermaid на [mermaid.live](https://mermaid.live) для живого предпросмотра

---

### Контрольная точка

Перед переходом к Блоку 4 проверьте:

- [ ] `docs/adr/001-dark-theme.md` существует и содержит полный ADR с разделами Context, Decision, Consequences и Alternatives
- [ ] `docs/diagrams/infrastructure.md` содержит диаграмму Mermaid с дроплетом DO, k3s и всеми подами
- [ ] `docs/diagrams/traffic-flow.md` содержит диаграмму Mermaid с путём запроса от пользователя до пода
- [ ] `docs/diagrams/deployment-pipeline.md` содержит диаграмму Mermaid с полным CI/CD-пайплайном
- [ ] У вас есть чёткая ментальная модель того, какие файлы изменятся для тёмной темы (из вывода режима Plan)
- [ ] Вы понимаете разницу между режимами Plan и Act

---

### Ключевые выводы

1. **Режим Plan — ваш предполётный чеклист.** Используйте его для любого изменения, затрагивающего более 2-3 файлов. Несколько минут планирования спасут от ложных поворотов.

2. **ADR удивительно легко создавать с Claude.** То, что обычно занимает 30 минут написания, занимает 2 минуты промптинга и проверки. Самое сложное — зафиксировать *обоснование* — это именно то, в чём Claude хорош.

3. **Диаграммы Mermaid — это живая документация.** Они живут в репозитории, видны в диффах, и GitHub их рендерит. Больше никаких сломанных ссылок на Lucidchart.

4. **Итерация — это секрет.** Первый промпт не даст идеальный результат. Второе или третье уточнение — даст. Это нормально и ожидаемо — именно так и должна ощущаться работа с AI.

---

### Что дальше

В Блоке 4 мы возьмём этот план и *реализуем* его. Claude будет редактировать конфигурацию Tailwind, CSS-переменные и стили компонентов для внедрения тёмной темы. Вы увидите инструмент Edit в действии — хирургически точные модификации файлов — и научитесь итерировать визуальные изменения с Claude, пока результат не будет выглядеть именно так, как нужно.

План готов. Время строить.
