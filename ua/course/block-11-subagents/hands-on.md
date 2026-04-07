---
layout: block-part
title: "Субагенти — спеціалізовані виконавці — Практика"
block_number: 11
description: "Практичні кроки реалізації для Блоку 11."
time: "~25 хвилин"
part_name: "Hands-On"
overview_url: /ua/course/block-11-subagents/
presentation_url: /ua/course/block-11-subagents/presentation/
hands_on_url: /ua/course/block-11-subagents/hands-on/
quiz_url: /ua/course/block-11-subagents/quiz/
permalink: /ua/course/block-11-subagents/hands-on/
locale: uk
translation_key: block-11-hands-on
---
> **Пряма мова:** "Все на цій практичній сторінці побудовано так, щоб ви могли слідувати за мною рядок за рядком. Коли бачите блок із командою або промптом, можете копіювати його прямо в термінал або сесію Claude, якщо я явно не скажу, що це лише довідковий матеріал. Порівнюйте свій результат із моїм на екрані, щоб виловлювати помилки відразу, а не накопичувати їх."

> **Тривалість**: ~25 хвилин
> **Результат**: Два кастомні субагенти (ревʼювер безпеки та валідатор K8s), протестовані на реальному коді, з дослідженням вибору моделі та worktree-ізоляції, плюс відкриття вбудованих агентів, яких ви вже використовували.
> **Передумови**: Завершені Блоки 0-10 (GitHub Actions CI налаштовано), проєкт ai-coderrank з K8s-маніфестами та вихідним кодом, kubectl налаштований

---

### Крок 1: Спостерігаємо за агентом Explore в дії (~3 хв)

Перед створенням кастомних агентів подивимося на роботу вбудованих. Запустіть Claude Code у проєкті ai-coderrank:

```bash
cd ~/ai-coderrank
claude
```

Тепер задайте широке, дослідницьке питання:

```text
How does the API layer in this project work? Trace a request from the route handler to the database and back. Show me the data flow.
```

Спостерігайте, що відбувається. Claude делегує своєму вбудованому агенту Explore для дослідження кодової бази. Ви можете побачити, як він читає кілька файлів, шукає патерни та прослідковує імпорти — все у фокусованому дослідницькому проході. Агент Explore збирає інформацію та звітує назад, потім Claude синтезує це в зв'язну відповідь для вас.

Ключове спостереження: дослідження відбулося в _окремому_ контексті. Агент Explore отримав свіже вікно, повністю фокусоване на відповіді на ваше питання, без баласту попередньої історії розмови.

> **Порада**: Ви можете явно попросити делегування, сказавши "use the Explore agent to research how authentication works in this project." Але Claude часто делегує самостійно, коли розпізнає дослідницьку задачу.

---

### Крок 2: Створення агента ревʼю безпеки (~5 хв)

Тепер побудуємо першого кастомного агента. Він ревʼюїть код на вразливості OWASP Top 10 та типові проблеми безпеки. Критично — він read-only: ревʼювер безпеки повинен спостерігати та звітувати, а не модифікувати код.

Створіть файл агента:

```bash
mkdir -p ~/ai-coderrank/.claude/agents
```

Створіть `.claude/agents/security-reviewer.md` з наступним вмістом:

```markdown
---
name: security-reviewer
description: Reviews code for OWASP Top 10 vulnerabilities, secret leaks, and injection risks
model: sonnet
allowed-tools:
  - Read
  - Grep
  - Glob
---

Ви — старший інженер із безпеки застосунків, який виконує focused security review.

## Ваша місія

Систематично перевірте цільовий код на вразливості безпеки. Ви працюєте уважно, конкретно та практично — позначаєте реальні ризики, а не теоретичні припущення без шляху експлуатації.

## Що перевіряти

### 1. Вразливості ін'єкцій
- SQL injection: сирі запити, конкатенація рядків у запитах, несанітизований користувацький ввід
- NoSQL injection: динамічне формування запитів із користувацьким вводом
- Command injection: користувацький ввід, що потрапляє в exec, spawn або system calls
- LDAP injection: користувацький ввід у LDAP-фільтрах

### 2. Зламана автентифікація
- Захардкоджені credentials, API keys або tokens у вихідному коді
- Слабкі правила перевірки паролів
- Відсутність rate limiting на auth endpoints
- Session tokens у URL або логах

### 3. Витік чутливих даних
- Secrets у коді (.env values, API keys, connection strings)
- PII, що логуються в консоль або файли
- Чутливі дані в повідомленнях про помилки, які повертаються користувачам
- Відсутність шифрування для чутливих полів

### 4. Зламана модель доступу
- Missing authorization checks on API routes
- Direct object reference without ownership validation
- Admin endpoints accessible without role checks
- CORS misconfiguration allowing unauthorized origins

### 5. Security Misconfiguration
- Debug mode enabled in production configs
- Default credentials or settings
- Unnecessary ports or services exposed
- Missing security headers (CSP, HSTS, X-Frame-Options)

### 6. Cross-Site Scripting (XSS)
- User input rendered without sanitization
- dangerouslySetInnerHTML usage
- Unescaped template variables
- DOM manipulation with user-controlled data

### 7. Dependencies and Supply Chain
- Check package.json for known vulnerable patterns
- Look for wildcard version ranges (*)
- Check for deprecated or unmaintained packages

## Output Format

### Security Review Report

**Scope**: [files/directories reviewed]
**Risk Level**: Critical / High / Medium / Low

#### Critical Findings
| # | Vulnerability | File:Line | Description | OWASP Category | Remediation |
|---|--------------|-----------|-------------|---------------|-------------|

#### High-Risk Findings
(same table format)

#### Medium-Risk Findings
(same table format)

#### Low-Risk / Informational
(same table format)

#### Summary
- Total files scanned: N
- Critical: N | High: N | Medium: N | Low: N
- Top 3 priorities for remediation
```

> **Зверніть увагу на три речі цього агента**: (1) Він використовує `model: sonnet` — достатньо для аналізу безпеки без вартості Opus. (2) Він обмежений до `Read`, `Grep` та `Glob` — не може модифікувати файли, виконувати команди чи мати доступ до мережі. (3) Системний промпт довгий і специфічний — саме тут живе експертиза.

---

### Крок 3: Створення агента валідації K8s (~5 хв)

Цей агент валідує Kubernetes-маніфести проти best practices. На відміну від ревʼювера безпеки, він _може_ виконувати bash-команди — зокрема `kubectl` для dry-run валідації.

Створіть `.claude/agents/k8s-validator.md`:

```markdown
---
name: k8s-validator
description: Validates Kubernetes manifests against best practices using kubectl dry-run and static analysis
model: sonnet
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

You are a senior SRE validating Kubernetes manifests before they are applied to a production cluster.

## Your Mission

Perform both static analysis (reading the YAML) and dynamic validation (kubectl dry-run) on all Kubernetes manifests in the project.

## Step 1: Static Analysis

Use Glob to find all YAML files in the `k8s/` directory. Read each file and check:

### Resource Definitions
- CPU and memory requests AND limits are set on all containers
- Requests <= limits (requests should not exceed limits)
- Values are reasonable for the workload type (a web server does not need 4Gi memory)

### Security Context
- `runAsNonRoot: true` is set
- `readOnlyRootFilesystem: true` where possible
- `allowPrivilegeEscalation: false` is set
- Capabilities are dropped (`drop: ["ALL"]`), only necessary ones added back

### High Availability
- Deployment replicas > 1 for production services
- Pod Disruption Budget exists for critical services
- Anti-affinity rules prevent all replicas on the same node

### Health Checks
- Liveness probe is configured (with appropriate failure threshold)
- Readiness probe is configured (separate from liveness)
- Startup probe for containers with slow initialization

### Image Policy
- No `latest` tag -- images must be pinned to a specific version or SHA
- `imagePullPolicy` is set appropriately
- Images come from an expected registry

### Labels and Metadata
- Standard labels present: `app.kubernetes.io/name`, `app.kubernetes.io/version`, `app.kubernetes.io/component`
- Labels are consistent across related resources (Deployment, Service, HPA)
- Namespace is explicitly set

## Step 2: Dynamic Validation

Run kubectl dry-run against each manifest to catch schema and structural errors:

```
kubectl apply --dry-run=client -f <manifest-file> 2>&1
```text

If kubeconfig is available and the cluster is reachable, also run server-side dry-run:

```
kubectl apply --dry-run=server -f <manifest-file> 2>&1
```text

Report any errors or warnings from kubectl.

## Step 3: Cross-Resource Validation

- Service selectors match Deployment labels
- Ingress/Route backends reference existing Services
- ConfigMap and Secret references in Deployments actually exist
- PVC names in volume mounts match existing PVC definitions
- HPA targets reference existing Deployments

## Output Format

### Kubernetes Validation Report

**Manifests Found**: N files in k8s/
**kubectl Dry-Run**: PASS / FAIL (with errors)

#### Per-Manifest Results

##### `<filename>`
| Check | Status | Details |
|-------|--------|---------|
| Resource Limits | PASS/WARN/FAIL | ... |
| Security Context | PASS/WARN/FAIL | ... |
| Health Checks | PASS/WARN/FAIL | ... |
| Image Policy | PASS/WARN/FAIL | ... |
| Labels | PASS/WARN/FAIL | ... |
| kubectl dry-run | PASS/FAIL | ... |

#### Cross-Resource Issues
| Issue | Resources Involved | Impact |
|-------|-------------------|--------|
| ... | ... | ... |

#### Summary
- Total manifests: N
- Passed all checks: N
- Has warnings: N
- Has failures: N
- **Recommended fix order** (most impactful first):
  1. ...
  2. ...
  3. ...
```

> **Ключова відмінність від ревʼювера безпеки**: Цей агент має `Bash` у своїх `allowed-tools`. Йому потрібно запускати `kubectl`-команди для динамічної валідації. Ревʼювер безпеки навмисно не має доступу до bash — він ніколи не повинен нічого виконувати, лише читати та звітувати.

---

### Крок 4: Тестування ревʼювера безпеки (~3 хв)

Час запустити ревʼювер безпеки в роботу. У вашій сесії Claude Code:

```text
Run the security reviewer agent on the src/ directory. Focus on the API routes and any authentication-related code.
```

Спостерігайте, як Claude делегує агенту security-reviewer. Агент:
1. Знайде файли у `src/` через Glob
2. Прочитає обробники API-маршрутів
3. Пошукає типові патерни вразливостей (raw SQL, несанітизований ввід, захардкоджені секрети)
4. Сформує структурований звіт з висновками за категоріями OWASP

Прочитайте звіт уважно. Типові знахідки у стандартному Next.js-проєкті:
- Відсутня валідація вводу на API-маршрутах
- CORS не налаштовано явно
- Повідомлення про помилки розкривають деталі реалізації
- Немає rate limiting на публічних ендпоінтах

> **Інсайт**: Цей агент знайшов проблеми через _reasoning про патерни безпеки_, а не запуск лінтера. Він розуміє наміри, а не лише синтаксис. Він може сказати "цей API-маршрут приймає користувацький ввід і передає його у запит до бази без валідації" — щось, що жоден інструмент статичного аналізу не сформулює так зрозуміло.

---

### Крок 5: Тестування валідатора K8s (~3 хв)

Тепер протестуйте валідатор K8s:

```text
Run the k8s-validator agent to validate all Kubernetes manifests in k8s/
```

Цей агент робить дві речі, яких ревʼювер безпеки не може:
1. **Читає маніфести** (статичний аналіз — так само, як ревʼювер безпеки)
2. **Запускає `kubectl apply --dry-run`** (динамічна валідація — можлива лише через доступ до Bash)

Динамічна валідація ловить помилки, які неможливо побачити, лише читаючи YAML — невалідні версії API, неправильно сформовані селектори, порушення схеми, типи ресурсів, яких немає у вашій версії кластера.

Порівняйте вивід з тим, що ви отримали від `/review-k8s` у Блоці 6. Навичка дала статичне ревʼю. Агент дає статичне ревʼю _плюс_ динамічну валідацію. Та сама задача, глибший аналіз.

---

### Крок 6: Створення швидкого агента на Haiku (~3 хв)

Не кожному агенту потрібен важкий reasoning. Створимо швидкого, дешевого агента для швидкого пошуку по кодовій базі.

Створіть `.claude/agents/quick-search.md`:

```markdown
---
name: quick-search
description: Fast codebase search using Haiku for speed and low cost
model: haiku
allowed-tools:
  - Read
  - Grep
  - Glob
---

You are a fast codebase search assistant. Your job is to find things quickly and report back concisely.

When asked to find something:
1. Use Grep to search for the pattern across the codebase
2. Use Glob if you need to find files by name
3. Use Read only if you need to check specific context around a match
4. Report your findings in a brief, structured format

Keep your responses short. List the file paths and line numbers where you found matches. Include a one-line summary of each match for context. Do not explain the code -- just locate it.

## Output Format

**Query**: [what was searched for]
**Matches**: N results

| File | Line | Context |
|------|------|---------|
| path/to/file.ts | 42 | `const score = calculateScore(...)` |
| ... | ... | ... |
```

Протестуйте:

```text
Use the quick-search agent to find all places where environment variables are read in the codebase.
```

Зверніть увагу, наскільки швидше це відповідає порівняно з повним запитом Sonnet чи Opus. Haiku ідеальний для задач, де потрібна швидкість, а reasoning прямолінійний — пошук, перерахування, простий патерн-матчінг.

> **Порівняння вартості**: Виклик агента на Haiku для простого пошуку коштує частки цента. Та ж задача на Opus може коштувати в 10-20 разів більше. Для повторюваних простих задач економія накопичується швидко.

---

### Крок 7: Демо worktree-ізоляції (~5 хв)

Worktree-ізоляція — одна з найпотужніших функцій субагентів. Вона дозволяє агенту працювати на окремій git-гілці, не зачіпаючи вашу робочу директорію.

Спробуйте це у сесії Claude Code:

```text
Create a new sub-agent with worktree isolation. Have it experiment with refactoring the score formatting utilities in src/utils/format-score.ts into a class-based approach. I want to compare the result with the current functional approach without changing my working directory.
```

Claude:
1. Створить git worktree (окремий checkout вашого репо на новій гілці)
2. Делегує субагенту, що працює у тому worktree
3. Агент вносить зміни в ізольованому worktree
4. Після завершення звітує назад з ім'ям гілки та зведенням
5. Ваша робоча директорія не змінилася

Потім ви зможете порівняти два підходи:

```bash
# Подивіться, що змінив агент
git diff main...<branch-name-from-agent>

# Якщо подобається — змерджіть
git merge <branch-name-from-agent>

# Якщо ні — просто видаліть гілку
git branch -D <branch-name-from-agent>
```

Це неймовірно корисно для:
- "Спробуй обома способами і дай порівняти"
- "Рефакторни цей модуль, не ламаючи те, над чим я працюю"
- "Досліди ризиковану зміну, не зобов'язуючись до неї"

> **Як worktree-ізоляція працює під капотом**: Git worktrees — це нативна функція git (`git worktree add`). Вони створюють другий checkout того ж репо в іншій директорії, ділячи ту саму `.git`-історію. Субагент працює у тій другій директорії, тому зміни відбуваються на іншій гілці в іншій теці. Ваша робоча директорія ніколи не бачить змін, поки ви явно не змерджите.

---

### Крок 8: Перегляд агентів через `/agents` (~1 хв)

Тепер, коли ви створили кілька агентів, подивимося на повний склад. У Claude Code:

```text
/agents
```

Це виводить список всіх налаштованих агентів — як вбудованих, так і кастомних. Ви маєте побачити:

```text
Built-in Agents:
  - Explore    Read-only codebase research
  - Plan       Architecture design and planning

Custom Agents (.claude/agents/):
  - security-reviewer   Reviews code for OWASP top 10 vulnerabilities
  - k8s-validator       Validates K8s manifests with kubectl dry-run
  - quick-search        Fast Haiku-powered codebase search
```

Кожен запис показує ім'я агента, його опис та конфігурацію моделі/інструментів. Це ваш склад команди — спеціалісти, яким Claude може делегувати в будь-який момент.

---

### Чекпоінт

Ваша директорія `.claude/agents/` тепер має містити:

```text
.claude/
  agents/
    security-reviewer.md    <- OWASP ревʼю безпеки (Sonnet, read-only)
    k8s-validator.md        <- Валідація K8s-маніфестів (Sonnet, з Bash)
    quick-search.md         <- Швидкий пошук по кодовій базі (Haiku, read-only)
```

Ви також спробували:
- Вбудований агент Explore, що досліджує кодову базу
- Автоматичне делегування субагентам
- Вибір моделі, що підбирає потужність під складність задачі
- Worktree-ізоляцію для безпечних експериментів

Ваш Claude Code тепер має навички (Блок 6) для стандартизованих воркфлоу та агентів (цей блок) для спеціалізованого делегування. Разом вони покривають і "виконай цю задачу", і "делегуй цю задачу спеціалісту."

---

### Бонусні завдання

**Завдання 1: Створіть агента-тестописця**
Побудуйте агента у `.claude/agents/test-writer.md`, що генерує тести для будь-якого файлу. Дайте йому доступ до `Read`, `Grep`, `Glob`, `Edit` та `Write` (йому потрібно створювати тестові файли). Нехай дотримується конвенцій тестування з вашого CLAUDE.md та патернів з існуючих тестів.

**Завдання 2: Конвеєр агентів**
З'єднайте двох агентів: спочатку запустіть security-reviewer на `src/`, потім передайте його знахідки Claude і попросіть виправити критичні проблеми. Порівняйте з виконанням обох задач у одній сесії Claude — чи дає розділення кращий результат?

**Завдання 3: Створіть агента документації**
Побудуйте read-only агента (`model: haiku`), що генерує JSDoc-коментарі для функцій без документації. Протестуйте на файлі з недокументованими функціями. Це чудовий приклад задачі для Haiku — проста, повторювана, заснована на патернах.

**Завдання 4: Дослідіть різницю моделей**
Запустіть те саме ревʼю безпеки з `model: haiku` та `model: sonnet`. Якщо ваш план включає Opus, повторіть з `model: opus` як опціональне порівняння. Це дасть практичне відчуття того, коли кожна модель варта своєї ціни, не роблячи Opus вимогою курсу.

---

> **Далі**: У Блоці 12 ми зберемо все разом із GitOps — ArgoCD, автоматизовані деплої та повний цикл від зміни коду до продакшену. Ваш CI ревʼюїть PR з Claude, ваші агенти валідують маніфести, а ArgoCD синхронізує результат у ваш кластер.

---

<div class="cta-block">
  <p>Готові перевірити засвоєне?</p>
  <a href="{{ '/ua/course/block-11-subagents/quiz/' | relative_url }}" class="hero-cta">Пройти квіз &rarr;</a>
</div>
