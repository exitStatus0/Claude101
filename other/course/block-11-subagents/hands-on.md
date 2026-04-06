---
layout: block-part
title: "Суб-агенты — Специализированные работники — Практика"
block_number: 11
part_name: "Hands-On"
locale: ru
translation_key: block-11-hands-on
overview_url: /other/course/block-11-subagents/
presentation_url: /other/course/block-11-subagents/presentation/
hands_on_url: /other/course/block-11-subagents/hands-on/
permalink: /other/course/block-11-subagents/hands-on/
---
> **Прямая речь:** "Всё на этой странице практики построено так, чтобы вы могли повторять за мной строка за строкой. Когда видите блок с командой или промптом, можете копировать его прямо в терминал или сессию Claude, если я явно не укажу, что это справочный материал. По ходу работы сравнивайте свой результат с моим на экране, чтобы ловить ошибки сразу, а не копить их."

> **Продолжительность**: ~25 минут
> **Результат**: Два кастомных суб-агента (ревьюер безопасности и валидатор K8s), протестированные на реальном коде, с изученным выбором моделей и изоляцией worktree, плюс знакомство со встроенными агентами, которыми вы пользовались всё это время.
> **Предварительные требования**: Пройдены Блоки 0-10 (CI через GitHub Actions настроен), проект ai-coderrank с K8s-манифестами и исходным кодом, настроенный kubectl

---

### Шаг 1: Наблюдаем за агентом Explore в действии (~3 мин)

Прежде чем создавать кастомных агентов, посмотрим на встроенных в работе. Запустите Claude Code в проекте ai-coderrank:

```bash
cd ~/ai-coderrank
claude
```

Теперь задайте широкий исследовательский вопрос:

```text
How does the API layer in this project work? Trace a request from the route handler to the database and back. Show me the data flow.
```

Наблюдайте за происходящим. Claude делегирует задачу встроенному агенту Explore для исследования кодовой базы. Вы можете увидеть, как он читает несколько файлов, ищет паттерны и отслеживает импорты -- всё в сфокусированном проходе исследования. Агент Explore собирает информацию и докладывает, затем Claude синтезирует её в связный ответ для вас.

Ключевое наблюдение: исследование произошло в _отдельном_ контексте. Агент Explore получил свежее окно, полностью сфокусированное на ответе на ваш вопрос, без груза предыдущей истории разговора.

> **Совет**: Вы можете явно запросить делегирование, сказав "use the Explore agent to research how authentication works in this project". Но Claude часто делегирует самостоятельно, когда распознаёт исследовательскую задачу.

---

### Шаг 2: Создание агента-ревьюера безопасности (~5 мин)

Теперь создадим первого кастомного агента. Он ревьюит код на уязвимости из OWASP Top 10 и общие проблемы безопасности. Критически важно -- он работает только на чтение: ревьюер безопасности должен наблюдать и докладывать, а не изменять код.

Создайте файл агента:

```bash
mkdir -p ~/ai-coderrank/.claude/agents
```

Создайте `.claude/agents/security-reviewer.md` со следующим содержимым:

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

You are a senior application security engineer performing a focused security review.

## Your Mission

Systematically audit the target code for security vulnerabilities. You are thorough, specific, and practical -- you flag real risks, not theoretical possibilities with no exploitation path.

## What to Check

### 1. Injection Vulnerabilities
- SQL injection: raw queries, string concatenation in queries, unsanitized user input
- NoSQL injection: dynamic query construction with user input
- Command injection: user input passed to exec, spawn, or system calls
- LDAP injection: user input in LDAP filters

### 2. Broken Authentication
- Hardcoded credentials, API keys, or tokens in source code
- Weak password validation rules
- Missing rate limiting on auth endpoints
- Session tokens in URLs or logs

### 3. Sensitive Data Exposure
- Secrets in code (.env values, API keys, connection strings)
- PII logged to console or files
- Sensitive data in error messages returned to users
- Missing encryption for sensitive fields

### 4. Broken Access Control
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

> **Обратите внимание на три вещи в этом агенте**: (1) Он использует `model: sonnet` -- достаточно хорош для анализа безопасности без стоимости Opus. (2) Он ограничен инструментами `Read`, `Grep` и `Glob` -- не может изменять файлы, запускать команды или обращаться к сети. (3) Системный промпт длинный и конкретный -- именно здесь живёт экспертиза.

---

### Шаг 3: Создание агента-валидатора K8s (~5 мин)

Этот агент проверяет Kubernetes-манифесты на соответствие лучшим практикам. В отличие от ревьюера безопасности, он _может_ запускать bash-команды -- конкретно `kubectl` для валидации через dry-run.

Создайте `.claude/agents/k8s-validator.md`:

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

> **Ключевое отличие от ревьюера безопасности**: Этот агент имеет `Bash` в `allowed-tools`. Ему нужно запускать команды `kubectl` для динамической валидации. Ревьюер безопасности намеренно не имеет доступа к bash -- он не должен ничего исполнять, только читать и докладывать.

---

### Шаг 4: Тестирование ревьюера безопасности (~3 мин)

Пора запустить ревьюера безопасности в деле. В сессии Claude Code:

```text
Run the security reviewer agent on the src/ directory. Focus on the API routes and any authentication-related code.
```

Наблюдайте, как Claude делегирует агенту security-reviewer. Агент:
1. Найдёт файлы в `src/` через Glob
2. Прочитает обработчики API-маршрутов
3. Поищет распространённые паттерны уязвимостей (сырой SQL, несанитизированный ввод, хардкоженные секреты)
4. Составит структурированный отчёт с находками, классифицированными по категориям OWASP

Внимательно прочитайте отчёт. Типичные находки в стандартном Next.js-проекте:
- Отсутствие валидации входных данных на API-маршрутах
- CORS не настроен явно
- Сообщения об ошибках раскрывают детали реализации
- Отсутствие rate limiting на публичных эндпоинтах

> **Инсайт**: Этот агент нашёл проблемы, _рассуждая о паттернах безопасности_, а не запуская линтер. Он понимает намерение, а не только синтаксис. Он может сказать вам "этот API-маршрут принимает пользовательский ввод и передаёт его в запрос к базе данных без валидации" -- ни один инструмент статического анализа не сформулирует это так ясно.

---

### Шаг 5: Тестирование валидатора K8s (~3 мин)

Теперь тестируем валидатор K8s:

```text
Run the k8s-validator agent to validate all Kubernetes manifests in k8s/
```

Этот агент делает две вещи, которые ревьюер безопасности не может:
1. **Читает манифесты** (статический анализ -- то же, что и ревьюер безопасности)
2. **Запускает `kubectl apply --dry-run`** (динамическая валидация -- возможна только потому, что у него есть доступ к Bash)

Динамическая валидация ловит ошибки, которые чтение YAML само по себе не может обнаружить -- невалидные API-версии, неправильные селекторы, нарушения схемы, несуществующие типы ресурсов в вашей версии кластера.

Сравните вывод с тем, что вы получили от `/review-k8s` в Блоке 6. Навык дал вам статическое ревью. Агент даёт статическое ревью _плюс_ динамическую валидацию. Та же задача, более глубокий анализ.

---

### Шаг 6: Создание быстрого агента на Haiku (~3 мин)

Не каждому агенту нужны тяжёлые рассуждения. Создадим быстрого, дешёвого агента для оперативного поиска по кодовой базе.

Создайте `.claude/agents/quick-search.md`:

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

Протестируйте:

```text
Use the quick-search agent to find all places where environment variables are read in the codebase.
```

Обратите внимание, насколько быстрее это отвечает по сравнению с полным Sonnet или Opus-запросом. Haiku идеален для задач, где нужна скорость, а рассуждения просты -- поиск, перечисление, простое сопоставление паттернов.

> **Сравнение стоимости**: Вызов Haiku-агента для простого поиска стоит доли цента. Та же задача на Opus может стоить в 10-20 раз больше. Для повторяющихся, простых задач экономия быстро накапливается.

---

### Шаг 7: Демонстрация изоляции Worktree (~5 мин)

Изоляция worktree -- одна из самых мощных функций суб-агентов. Она позволяет агенту работать на отдельной git-ветке, не затрагивая вашу рабочую директорию.

Попробуйте в сессии Claude Code:

```text
Create a new sub-agent with worktree isolation. Have it experiment with refactoring the score formatting utilities in src/utils/format-score.ts into a class-based approach. I want to compare the result with the current functional approach without changing my working directory.
```

Claude:
1. Создаст git worktree (отдельный чекаут вашего репо на новой ветке)
2. Делегирует суб-агенту, работающему в этом worktree
3. Агент внесёт изменения в изолированном worktree
4. По завершении доложит имя ветки и сводку
5. Ваша рабочая директория останется нетронутой

Затем вы можете сравнить два подхода:

```bash
# See what the agent changed
git diff main...<branch-name-from-agent>

# If you like it, merge it
git merge <branch-name-from-agent>

# If you don't, just delete the branch
git branch -D <branch-name-from-agent>
```

Это невероятно полезно для:
- "Попробуй оба варианта и дай мне сравнить"
- "Отрефактори этот модуль, не ломая то, над чем я работаю"
- "Исследуй рискованное изменение, не привязываясь к нему"

> **Как работает изоляция worktree под капотом**: Git worktrees -- это встроенная функция git (`git worktree add`). Они создают второй чекаут того же репо в другой директории, разделяя ту же историю `.git`. Суб-агент работает в этой второй директории, так что изменения происходят на другой ветке в другой папке. Ваша рабочая директория никогда не увидит изменений, пока вы явно не смержите.

---

### Шаг 8: Просмотр агентов через `/agents` (~1 мин)

Теперь, когда вы создали несколько агентов, посмотрим на полный состав. В Claude Code:

```text
/agents
```

Это выведет список всех настроенных агентов -- как встроенных, так и кастомных. Вы должны увидеть:

```text
Built-in Agents:
  - Explore    Read-only codebase research
  - Plan       Architecture design and planning

Custom Agents (.claude/agents/):
  - security-reviewer   Reviews code for OWASP top 10 vulnerabilities
  - k8s-validator       Validates K8s manifests with kubectl dry-run
  - quick-search        Fast Haiku-powered codebase search
```

Каждая запись показывает имя агента, его описание и конфигурацию модели/инструментов. Это ваш список команды -- специалисты, которым Claude может делегировать в любое время.

---

### Контрольная точка

Ваша директория `.claude/agents/` теперь должна содержать:

```text
.claude/
  agents/
    security-reviewer.md    <- OWASP security review (Sonnet, read-only)
    k8s-validator.md        <- K8s manifest validation (Sonnet, with Bash)
    quick-search.md         <- Fast codebase search (Haiku, read-only)
```

Вы также испытали:
- Встроенный агент Explore, исследующий кодовую базу
- Делегирование суб-агентам, происходящее автоматически
- Выбор модели, подбирающий вычислительную мощность к сложности задачи
- Изоляцию worktree для безопасных экспериментов

Ваша настройка Claude Code теперь имеет навыки (Блок 6) для стандартизированных воркфлоу и агентов (этот блок) для специализированной делегации. Вместе они покрывают и "выполни эту задачу", и "делегируй эту задачу специалисту".

---

### Бонусные задания

**Задание 1: Создание агента для написания тестов**
Создайте агента в `.claude/agents/test-writer.md`, который генерирует тесты для любого заданного файла. Дайте ему доступ к `Read`, `Grep`, `Glob`, `Edit` и `Write` (ему нужно создавать тестовые файлы). Пусть он следует соглашениям тестирования из вашего CLAUDE.md и паттернам из существующих тестов.

**Задание 2: Конвейер агентов**
Запустите цепочку из двух агентов: сначала security-reviewer на `src/`, затем передайте его находки Claude и попросите исправить критические проблемы. Сравните это с выполнением обеих задач в одной сессии Claude -- приводит ли разделение к лучшему результату?

**Задание 3: Создание агента документации**
Создайте агента только для чтения (`model: haiku`), который генерирует JSDoc-комментарии для функций без документации. Протестируйте на файле с недокументированными функциями. Это отличный пример задачи, подходящей для Haiku -- простая, повторяющаяся и основанная на паттернах.

**Задание 4: Исследование различий моделей**
Запустите один и тот же аудит безопасности с `model: haiku` и `model: sonnet`. Если ваш тариф включает Opus, повторите с `model: opus` для опционального сравнения. Это даёт практическое понимание, когда каждая модель стоит своей цены, без необходимости делать Opus обязательным для курса.

---

> **Далее**: В Блоке 12 мы собираем всё вместе с GitOps -- ArgoCD, автоматизированные деплои и полный цикл от изменения кода до продакшна. Ваш CI ревьюит PR с Claude, агенты валидируют манифесты, а ArgoCD синхронизирует результат с кластером.
