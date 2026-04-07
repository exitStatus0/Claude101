---
layout: block-part
title: "Просунуті патерни та що далі — Практика"
block_number: 13
description: "Практичні кроки реалізації для Блоку 13."
time: "~15 хвилин"
part_name: "Hands-On"
overview_url: /ua/course/block-13-advanced/
presentation_url: /ua/course/block-13-advanced/presentation/
hands_on_url: /ua/course/block-13-advanced/hands-on/
quiz_url: /ua/course/block-13-advanced/quiz/
permalink: /ua/course/block-13-advanced/hands-on/
locale: uk
translation_key: block-13-hands-on
---
> **Пряма мова:** "Все на цій практичній сторінці побудовано так, щоб ви могли слідувати за мною рядок за рядком. Коли бачите блок із командою або промптом, можете копіювати його прямо в термінал або сесію Claude, якщо я явно не скажу, що це лише довідковий матеріал. Порівнюйте свій результат із моїм на екрані, щоб виловлювати помилки відразу, а не накопичувати їх."

> **Тривалість**: ~15 хвилин
> **Результат**: Практичний досвід з агентними командами, `/batch` по K8s-маніфестах, headless-режимом для скриптинга та запланованою перевіркою вразливостей — плюс повний ретроспективний огляд курсу.
> **Передумови**: Завершені Блоки 0-12 (все задеплоєно, GitOps працює), робоча інсталяція Claude Code з автентифікованими сесіями

---

### Крок 1: Увімкнення та використання агентних команд (~5 хв)

> **Експериментальна функція**: Агентні команди є експериментальними станом на квітень 2026. API, змінна середовища та поведінка можуть змінитися у майбутніх релізах. Те, що ви вивчаєте тут — концепція та патерн, конкретні флаги можуть еволюціонувати.

Агентні команди дозволяють запустити кілька інстансів Claude, що працюють паралельно над різними аспектами тієї ж задачі. Це експериментально — API може змінитися — але концепція потужна і варта вивчення.

Увімкніть функцію:

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

Запустіть Claude Code:

```bash
cd ~/ai-coderrank
claude
```

Тепер створіть команду для ревʼю ai-coderrank з трьох різних перспектив одночасно:

```text
Create an agent team to review the ai-coderrank project from 3 perspectives:

Team member 1 — Security Reviewer:
Review the codebase for security vulnerabilities. Check for XSS, injection risks,
exposed secrets, insecure dependencies, and missing authentication/authorization.
Focus on the API routes and data handling.

Team member 2 — Performance Analyst:
Review the codebase for performance issues. Check for N+1 queries, missing caching,
large bundle sizes, unoptimized images, unnecessary re-renders in React components,
and slow API endpoints.

Team member 3 — Code Quality Auditor:
Review the codebase for code quality. Check for dead code, inconsistent patterns,
missing error handling, insufficient test coverage, unclear naming, and violations
of the project conventions in CLAUDE.md.
```

Спостерігайте, як три агенти запускаються та працюють паралельно. Кожен читає кодову базу незалежно і фокусується на своєму домені. Це координація в дії — три спеціалізовані ревʼю, що відбуваються одночасно, за час одного.

Коли закінчать, ви отримаєте три окремі звіти. Прочитайте їх. Ймовірно знайдете:
- Проблеми безпеки, про які ви не думали (відкриті змінні середовища, відсутня валідація вводу)
- Вузькі місця продуктивності, яких не помітили (перерендеринг компонентів, неоптимізовані запити)
- Покращення якості коду, до яких збиралися дістатися (мертвий код, непослідовні патерни)

> **Коли використовувати агентні команди в реальній роботі**: Складні код-ревʼю перед великим релізом. Архітектурні аудити. Планування міграцій, де безпека, продуктивність та сумісність потребують окремого аналізу. Будь-яка задача, де кілька перспектив цінніші за одне глибоке занурення.

---

### Крок 2: /batch — паралельні зміни у файлах (~3 хв)

Час побачити `/batch` в дії. Типова DevOps-задача: додати resource limits до всіх Kubernetes deployments.

У вашій сесії Claude Code:

```text
/batch "add CPU and memory resource limits to all K8s deployments in k8s/. Use
sensible defaults: 100m CPU request, 250m CPU limit, 128Mi memory request,
256Mi memory limit. If limits already exist, leave them unchanged."
```

Claude:
1. Знайде всі deployment-маніфести у `k8s/`
2. Прочитає кожен, щоб зрозуміти навантаження
3. Додасть resource limits, де їх немає
4. Пропустить файли, що вже мають limits
5. Покаже зведення всіх змін

Перегляньте diff. Зверніть увагу, що Claude не просто вставляє однаковий блок скрізь — він розуміє контекст. Веб-сервер може отримати інші limits, ніж фоновий воркер.

Інші операції `/batch`, що варто спробувати:

```text
/batch "add readiness and liveness probes to all deployments in k8s/ that don't
have them. Use HTTP GET on /health for the web service and TCP checks for others."
```

```text
/batch "add the label team: platform to all K8s resources in k8s/"
```

```text
/batch "ensure all container images in k8s/ use a specific tag, not latest"
```

> **Відмінність від find-and-replace**: `/batch` розуміє структуру YAML, знає, як виглядає K8s deployment, і вносить контекстно відповідні зміни. Він не зламає відступи, не додасть limits всередину Service spec і не задублює probe, що вже існує.

---

### Крок 3: Headless-режим — Claude як скрипт (~3 хв)

Headless-режим прибирає інтерактивну розмову і перетворює Claude Code на команду, яку можна викликати зі скриптів, cron-задач та CI-пайплайнів. Ключові флаги:

- **`-p "prompt"`** -- print-режим (неінтерактивний, одноразовий, завершується після виконання)
- **`--output-format json`** -- машинночитабельний JSON-вивід
- **`--output-format text`** -- простий текстовий вивід (без ANSI-форматування)
- **`--max-turns N`** -- обмеження кількості ходів використання інструментів
- **`--max-budget-usd N`** -- обмеження бюджету сесії

Спробуйте у терміналі (не всередині Claude Code — у звичайному shell):

```bash
# Запуск тестів та отримання JSON-звіту
claude -p "run the test suite for ai-coderrank and report the results: total tests,
passed, failed, and any failure details" --output-format json
```

Вивід — машинночитабельний JSON. Ви можете парсити його `jq`, передати іншому скрипту або зберегти у файл.

Більше прикладів headless:

```bash
# Швидке питання по кодовій базі — сесія не потрібна
claude -p "what version of Next.js does ai-coderrank use?" --output-format text

# Pre-commit валідація
claude -p "check if the K8s manifests in k8s/ are valid YAML and reference
existing Docker images" --output-format json > validation-report.json

# Генерація changelog з нещодавніх комітів
claude -p "read the last 10 git commits and generate a changelog entry in
Keep a Changelog format" --output-format text >> CHANGELOG.md
```

Справжня сила проявляється у скриптах:

```bash
#!/bin/bash
# pre-deploy-check.sh — запуск перед кожним деплоєм

echo "Running pre-deployment checks..."

RESULT=$(claude -p "verify that all K8s manifests in k8s/ are valid, all
container images exist, and no secrets are hardcoded. Return a JSON object
with {valid: boolean, issues: string[]}" --output-format json)

VALID=$(echo "$RESULT" | jq -r '.valid')

if [ "$VALID" != "true" ]; then
  echo "Pre-deployment checks failed:"
  echo "$RESULT" | jq -r '.issues[]'
  exit 1
fi

echo "All checks passed. Proceeding with deployment."
```

> **Ключова ментальна модель**: Інтерактивний Claude Code — для дослідницької роботи: розслідування, планування, реалізація. Headless-режим — для автоматизованої роботи: перевірки, звіти, валідації, що працюють без людської взаємодії. Той самий інтелект, інший інтерфейс.

---

### Крок 4: Заплановані хмарні задачі — глибше (~2 хв)

У Блоці 12 ви налаштували базовий health check. Створімо щось складніше — щоденний аудит вразливостей залежностей:

Команда `/schedule` створює хмарних запланованих агентів (також відомих як тригери). Синтаксис:

```text
/schedule create "name" --cron "cron-expression" --prompt "what to do"
```

Створімо щоденний аудит вразливостей:

```text
/schedule create "dependency vulnerability scan" --cron "0 7 * * *" \
  --prompt "Run a comprehensive dependency audit for ai-coderrank:
  1. Check package.json for any packages with known CVEs
  2. Look for outdated dependencies that are more than 2 major versions behind
  3. Check if any dependencies have been deprecated or archived
  4. Review the Dockerfile base image for known vulnerabilities
  5. Produce a report with: critical findings (act now), warnings (plan to fix),
     and informational notes (nice to know).
  Format the report as markdown."
```

Перевірте існуючі розклади:

```text
/schedule list
```

Ви маєте побачити і health check з Блоку 12, і цей новий скан вразливостей. Два автоматизовані агенти, що працюють щодня, стежать за вашою інфраструктурою та залежностями, поки ви фокусуєтесь на будуванні фіч.

Запустіть вручну для перевірки:

```text
/schedule run "dependency vulnerability scan"
```

Перегляньте вивід. Це тип звіту, який більшість команд генерує лише коли щось ламається. Ви генеруєте його проактивно, кожного ранку.

---

### Крок 5: Швидкий огляд команд — відсутні 20% (~2 хв)

Це високоцінні команди, що не потребують власного блоку, але абсолютно належать у ваш повсякденний інструментарій.

Усередині поточної сесії Claude Code запустіть:

```text
/status
/context
/diff
/skills
/mcp
/hooks
/model
```

На що звернути увагу:

- `/status` показує поточну модель, версію, акаунт та стан з'єднання
- `/context` допомагає побачити, коли сесія стає важкою
- `/diff` — швидкий спосіб переглянути зміни перед комітом
- `/skills`, `/mcp` та `/hooks` кажуть, які шари розширення активні
- `/model` дозволяє переглянути або змінити поточну модель без перезапуску сесії

Тепер, у звичайному shell, спробуйте CLI-команди управління:

```bash
claude auth status --text
claude agents
claude update
```

І якщо хочете передати цю саму сесію на телефон або у браузер:

```text
/remote-control ai-coderrank-ops
```

Не потрібно тримати кожну з них у м'язовій пам'яті сьогодні. Мета — знати, що вони існують, знати, яку категорію проблем вирішують, і знати, куди потягнутися, коли вони знадобляться.

---

### Крок 6: Короткий огляд екосистеми (~1 хв)

Не потрібно пробувати все це сьогодні — просто знайте, що існує:

**Desktop-додаток** — Якщо доступний, відкрийте і підключіть до проєкту ai-coderrank. Зверніть увагу на:
- Side-by-side diff файлів, коли Claude вносить зміни
- Візуальне дерево файлів, що показує модифіковані файли
- Кілька паралельних сесій у вкладках (як кілька терміналів, але візуально)

**VS Code / JetBrains** — Якщо використовуєте ці IDE, розширення розміщує Claude Code прямо у редакторі. Можна виділити код, натиснути правою кнопкою і сказати "explain this" або "refactor this" без виходу з файлу.

**Веб-версія Claude Code** (claude.ai/code) — Відкриває повне середовище розробки у браузері. Має вбудовану віртуальну машину, що запускає код, встановлює пакети та піднімає сервери. Ідеально для швидких сесій, коли ви далеко від основної машини.

**Плагіни** — Пакування навичок, хуків та конфігурацій агентів для дистрибуції. Якщо ви створили корисні інструменти під час курсу (навичку `/review-k8s`, pre-commit hook, субагентів), можете зібрати їх у плагін, що команда встановить однією командою.

---

### Крок 7: Завершення курсу (~1 хв)

Подивимося, що ви досягли. У проєкті ai-coderrank запустіть:

```text
Summarize everything that's been built and configured in this project. List:
1. All custom skills in .claude/skills/
2. All memory files in .claude/
3. Any hooks configured in .claude/settings.json
4. The CI/CD pipeline in .github/workflows/
5. The ArgoCD configuration in argocd/
6. The K8s manifests in k8s/
7. The current deployment status (ArgoCD sync status, pod health)

Then give me a one-paragraph summary of the complete system.
```

Прочитайте зведення Claude. Це ваша система. Вся вона побудована через розмову, задеплоєна через GitOps, моніториться через автоматизацію.

---

### Що ви вивчили

Не лише інструменти — патерни:

| Патерн | Що ви вивчили | Де використовували |
|--------|--------------|-------------------|
| Дослідження перед дією | Читай та розумій перед зміною | Блоки 1-3 |
| Ітеративне уточнення | Маленькі зміни, перевірка, коригування | Блок 4 |
| Інституційна пам'ять | Кодування знань для збереження | Блок 5 |
| Повторно використовувані воркфлоу | Навички перетворюють експертизу на команди | Блок 6 |
| Інфраструктура як розмова | Claude веде через складне налаштування серверів | Блок 7 |
| Автоматизація на подіях життєвого циклу | Хуки спрацьовують на дії | Блок 8 |
| Інтеграція зовнішніх інструментів | MCP підключає до сервісів | Блок 9 |
| CI/CD як код | GitHub Actions автоматизують пайплайн | Блок 10 |
| Спеціалізоване делегування | Субагенти фокусуються на конкретних доменах | Блок 11 |
| GitOps-доставка | Git є єдиним джерелом істини | Блок 12 |
| Паралельний та автоматизований AI | Команди, batch, headless, заплановані задачі | Блок 13 |

Ці патерни переносяться. Вони працюють з будь-якою кодовою базою, будь-якою інфраструктурою, будь-якою командою. Конкретні команди еволюціонуватимуть з оновленнями Claude Code, але патерни — довговічні.

---

### Ваші наступні кроки

**Завтра**: Використайте Claude Code на реальній роботі. Виберіть задачу, на яку зазвичай витрачаєте годину. Подивіться, як піде.

**Цього тижня**: Налаштуйте `.claude/CLAUDE.md` у найчастіше використовуваному робочому проєкті. Додайте один файл правил та одну навичку.

**Цього місяця**: Інтегруйте headless-режим в один CI-пайплайн. Налаштуйте одну задачу `/schedule` для чогось, що ваша команда зараз перевіряє вручну.

**Завжди**: Будьте тією людиною в команді, що знає ці інструменти. Не тому, що AI — це магія (це не так), а тому, що вміння колаборувати з AI-агентом — це множник навичок. Ви не стали у 10 разів швидшим. Ви той самий інженер, з невтомним партнером, який пам'ятає все, ніколи не втрачає терпіння та може прочитати 10 000 рядків коду за секунди.

Використовуйте це партнерство мудро.

---

### Дякуємо

Ви зробили роботу. Тринадцять блоків. Десятки команд. Живий застосунок в інтернеті.

Наступного разу, коли хтось запитає "Що AI-інструменти реально можуть зробити для DevOps?" — вам не потрібно здогадуватися. Ви можете показати. Відкрийте термінал, наберіть `claude` та продемонструйте.

Це найкраща відповідь.

---

<div class="cta-block">
  <p>Готові перевірити засвоєне?</p>
  <a href="{{ '/ua/course/block-13-advanced/quiz/' | relative_url }}" class="hero-cta">Пройти квіз &rarr;</a>
</div>

<div class="cta-block" style="margin-top: var(--space-lg);">
  <p>Пройшли весь курс? Складіть фінальний підсумковий квіз.</p>
  <a href="{{ '/ua/course/final-quiz/' | relative_url }}" class="hero-cta">Фінальний квіз &rarr;</a>
</div>
