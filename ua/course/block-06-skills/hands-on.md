---
layout: block-part
title: "Кастомні навички — плейбук вашої команди — Практика"
block_number: 6
description: "Практичні кроки реалізації для Блоку 06."
time: "~25 хвилин"
part_name: "Hands-On"
overview_url: /ua/course/block-06-skills/
presentation_url: /ua/course/block-06-skills/presentation/
hands_on_url: /ua/course/block-06-skills/hands-on/
quiz_url: /ua/course/block-06-skills/quiz/
permalink: /ua/course/block-06-skills/hands-on/
locale: uk
translation_key: block-06-hands-on
---
> **Пряма мова:** "Все на цій практичній сторінці побудовано так, щоб ви могли слідувати за мною рядок за рядком. Коли бачите блок із командою або промптом, можете копіювати його прямо в термінал або сесію Claude, якщо я явно не скажу, що це лише довідковий матеріал. Порівнюйте свій результат із моїм на екрані, щоб виловлювати помилки відразу, а не накопичувати їх."

> **Тривалість**: ~25 хвилин
> **Результат**: Три кастомні навички (ревʼювер K8s, аудитор Dockerfile, пояснювач файлів) плюс тест-драйв вбудованої `/simplify` на вашому коді темної теми.
> **Передумови**: Завершені Блоки 0-5 (система пам'яті налаштована)

---

### Крок 1: Створення навички ревʼю K8s (~5 хв)

Це наша перша кастомна навичка — read-only ревʼювер, що перевіряє Kubernetes-маніфести проти best practices. Він може дивитися на код, але не може нічого модифікувати.

Створіть директорію навички та файл:

```bash
mkdir -p ~/ai-coderrank/.claude/skills/review-k8s
```

Створіть `.claude/skills/review-k8s/SKILL.md` з наступним вмістом:

```markdown
---
name: review-k8s
description: Reviews Kubernetes manifests for best practices, security, and operational readiness
allowed-tools:
  - Read
  - Glob
  - Grep
---

You are a senior SRE reviewing Kubernetes manifests before they go to production. Be thorough but practical — flag real issues, not theoretical nitpicks.

## Instructions

1. Use Glob to find all YAML files in the `k8s/` directory
2. Read each manifest file
3. Check every resource against the following criteria

## Checklist

### Resource Management
- [ ] CPU and memory requests are set
- [ ] CPU and memory limits are set
- [ ] Requests are lower than or equal to limits
- [ ] Resource values are reasonable (not 10 CPU cores for a web server)

### Security
- [ ] `runAsNonRoot: true` is set in the security context
- [ ] `readOnlyRootFilesystem: true` where applicable
- [ ] Capabilities are dropped (`drop: ["ALL"]`)
- [ ] No privileged containers
- [ ] No host networking or host PID

### Health & Reliability
- [ ] Liveness probe is configured
- [ ] Readiness probe is configured
- [ ] Startup probe for slow-starting containers
- [ ] Pod disruption budget exists for critical services
- [ ] Replica count is greater than 1 for production services

### Image Hygiene
- [ ] No `latest` tag — images are pinned to a specific version
- [ ] Image pull policy is appropriate (IfNotPresent for tagged, Always for mutable)
- [ ] Images come from an expected registry

### Labels & Metadata
- [ ] Standard Kubernetes labels are present (app.kubernetes.io/name, etc.)
- [ ] Labels are consistent across related resources (Deployment, Service, etc.)
- [ ] Namespace is explicitly set (not relying on `default`)

### Networking
- [ ] Services use appropriate type (ClusterIP for internal, LoadBalancer/Ingress for external)
- [ ] Port names follow convention (http, https, grpc, metrics)
- [ ] Network policies exist if the cluster uses them

## Output Format

For each file reviewed, produce:

### `<filename>`
**Overall**: PASS / WARN / FAIL

| Issue | Severity | Details | Suggested Fix |
|-------|----------|---------|---------------|
| ... | Critical/Warning/Info | What's wrong | How to fix it |

End with a **Summary** section: total files reviewed, critical issues, warnings, and a recommended priority order for fixes.
```

> **Зверніть увагу на секцію `allowed-tools`.** Ця навичка може лише Read, Glob та Grep. Вона не може редагувати файли, виконувати команди чи вносити будь-які зміни. Це ревʼювер, а не фіксер — він каже, що не так, і залишає рішення вам.

---

### Крок 2: Створення навички аудиту Docker (~5 хв)

Той самий патерн — read-only навичка, що перевіряє Dockerfile на типові проблеми.

```bash
mkdir -p ~/ai-coderrank/.claude/skills/check-docker
```

Створіть `.claude/skills/check-docker/SKILL.md`:

```markdown
---
name: check-docker
description: Audits Dockerfiles for security, performance, and build optimization
allowed-tools:
  - Read
  - Glob
  - Grep
---

You are a Docker build optimization expert reviewing a Dockerfile before it ships.

## Instructions

1. Read the `Dockerfile` in the project root
2. Check for a `.dockerignore` file — read it if it exists
3. Evaluate the Dockerfile against every criterion below
4. Check that `.dockerignore` excludes common unnecessary files

## Dockerfile Checklist

### Build Stages
- [ ] Uses multi-stage builds (separate build and runtime stages)
- [ ] Build dependencies don't leak into the final image
- [ ] Final stage uses a minimal base image (alpine, distroless, or slim)
- [ ] Base image is pinned to a specific version (not just `node:20`, but `node:20.11-alpine`)

### Layer Optimization
- [ ] Package manager install + cleanup happen in the same RUN instruction
- [ ] `COPY package*.json` (or equivalent) happens BEFORE `COPY . .` for layer caching
- [ ] Dependencies are installed before application code is copied
- [ ] Unnecessary files are not copied into the image

### Security
- [ ] Final image runs as non-root user (`USER node` or custom user)
- [ ] No secrets, API keys, or credentials in the Dockerfile or build args
- [ ] `apt-get update && apt-get install` are combined and cleaned up
- [ ] No `sudo` or `chmod 777` in the Dockerfile

### Runtime
- [ ] `EXPOSE` matches the actual port the application listens on
- [ ] `HEALTHCHECK` instruction is present (or documented why it's omitted)
- [ ] Entrypoint uses exec form (`["node", "server.js"]`) not shell form
- [ ] Signal handling is correct (PID 1 problem addressed)

### .dockerignore
- [ ] `.dockerignore` exists
- [ ] Excludes: `node_modules/`, `.git/`, `*.md`, `.env*`, `.vscode/`, `coverage/`
- [ ] Excludes K8s and ArgoCD config (not needed in the image)

## Output Format

### Dockerfile Audit Report

**Image**: `<base image detected>`
**Stages**: `<number of stages>`
**Final image size estimate**: `<estimate based on base image + dependencies>`

| Category | Status | Finding | Recommendation |
|----------|--------|---------|----------------|
| Build Stages | PASS/WARN/FAIL | ... | ... |
| Layer Caching | PASS/WARN/FAIL | ... | ... |
| Security | PASS/WARN/FAIL | ... | ... |
| Runtime | PASS/WARN/FAIL | ... | ... |
| .dockerignore | PASS/WARN/FAIL | ... | ... |

**Top 3 Changes That Would Help Most:**
1. ...
2. ...
3. ...
```

---

### Крок 3: Тестування `/review-k8s` на проєкті (~3 хв)

Час побачити вашу першу кастомну навичку в дії. Запустіть Claude Code у проєкті ai-coderrank:

```bash
cd ~/ai-coderrank
claude
```

Тепер запустіть навичку:

```text
/review-k8s
```

Claude:
1. Знайде всі YAML-файли у `k8s/`
2. Прочитає кожен
3. Оцінить їх проти вашого чеклісту
4. Сформує структурований звіт з висновками та рейтингами серйозності

Зверніть увагу на знахідки. Типові проблеми у маніфестах ai-coderrank:
- Відсутні resource limits
- Немає security context
- Відсутні health check probes
- Теги образів `latest`

> **Ключовий інсайт**: Ви щойно провели комплексне ревʼю K8s однією командою. Джуніор-інженер, що ніколи не писав Kubernetes-маніфест, може запустити це та отримати фідбек сеньйорного рівня. Ось у чому сила навичок.

---

### Крок 4: Тестування `/check-docker` на Dockerfile (~3 хв)

Все ще у вашій сесії Claude Code:

```text
/check-docker
```

Спостерігайте, як Claude систематично перевіряє Dockerfile. Він має сформувати звіт, що охоплює:
- Чи використовуються multi-stage builds
- Ефективність кешування шарів
- Стан безпеки (non-root user, відсутність секретів)
- Стан `.dockerignore`

Порівняйте вивід з тим, що ви б перевіряли вручну. Чи знайшов він щось, що ви могли б пропустити?

---

### Крок 5: Створення параметризованої навички з `$ARGUMENTS` (~5 хв)

Тепер побудуємо гнучку навичку, що приймає вхідні дані — пояснювач, що працює з будь-яким файлом, на який ви його направите.

```bash
mkdir -p ~/ai-coderrank/.claude/skills/explain
```

Створіть `.claude/skills/explain/SKILL.md`:

```markdown
---
name: explain
description: Explains any file in plain, jargon-free English
allowed-tools:
  - Read
  - Glob
  - Grep
---

Read the file at `$ARGUMENTS`.

If the path doesn't exist, use Glob to search for likely matches and ask the user to confirm.

## Your Task

Explain this file as if you're talking to a smart developer who just joined the team and has never seen this codebase before.

## Structure Your Explanation As:

### What This File Does
One sentence. No jargon. What problem does it solve?

### How It Works — Step by Step
Walk through the file's logic from top to bottom. For each significant section:
- What it does
- Why it does it that way (if non-obvious)
- What would break if you removed it

### Key Patterns to Know
- Design patterns used (and why)
- Non-obvious conventions
- Anything a new developer might find surprising

### Connections
- What files import or depend on this file?
- What does this file import or depend on?
- If you changed this file, what else might need updating?

### Watch Out For
- Common mistakes when editing this file
- Edge cases it handles (or doesn't)
- Performance considerations

Keep the language conversational. Use analogies where they help. If something is genuinely complex, say so — but explain it anyway.
```

Тепер протестуйте в сесії Claude Code:

```text
/explain src/app/page.tsx
/explain k8s/deployment.yaml
/explain Dockerfile
```

Кожен виклик замінює `$ARGUMENTS` на вказаний вами шлях. Та сама навичка, різні цілі. Зверніть увагу, як пояснення адаптуються до типу файлу — React-компонент пояснюється інакше, ніж K8s-маніфест.

---

### Крок 6: Запуск `/simplify` на змінах темної теми (~3 хв)

Пам'ятаєте темну тему, що ви реалізували у Блоці 4? Подивимося, чи зможе `/simplify` її підчистити.

У вашій сесії Claude Code:

```text
/simplify
```

`/simplify` — вбудована навичка, що:
1. Дивиться на ваші нещодавні зміни коду
2. Визначає можливості повторного використання (чи ви перереалізовуєте щось, що вже є в кодовій базі?)
3. Знаходить покращення якості коду
4. Знаходить оптимізації продуктивності
5. Автоматично застосовує виправлення

Подивіться, що знайдеться в реалізації темної теми. Типові знахідки `/simplify`:
- Дубльовані значення кольорів, що мали б бути CSS-змінними або розширеннями Tailwind-теми
- Логіка умовних класів, що могла б чистіше використовувати `clsx` або `cn()`
- Компоненти, що могли б ділити спільний базовий стиль
- Логіка перемикання теми, що могла б бути спрощена кастомним хуком

Переглядайте кожну запропоновану зміну. Приймайте ті, з якими згодні.

> **Коли використовувати `/simplify`**: Після завершення будь-якої реалізації фічі. Пишете код, щоб він працював, потім `/simplify`, щоб зробити його чистим. Це як мати код-ревʼювера, якого цікавить лише якість — без его, без війн стилів, просто "ось як цей код може бути кращим."

---

### Крок 7: Розуміння обмежень `allowed-tools` (~1 хв)

Зробимо різницю кристально зрозумілою.

**Обмежена навичка** (наш review-k8s):
```yaml
allowed-tools:
  - Read
  - Glob
  - Grep
```
- Може читати файли, шукати патерни, переглядати файли
- НЕ МОЖЕ редагувати файли, писати файли чи виконувати bash-команди
- Ідеально для: ревʼю, аудитів, пояснень, звітів

**Необмежена навичка** (без `allowed-tools` у фронтматері):
```yaml
---
name: fix-k8s-issues
description: Fixes common K8s manifest issues automatically
---
```
- Може використовувати ВСІ інструменти — читати, писати, редагувати, виконувати команди
- Може вносити зміни безпосередньо у файли
- Ідеально для: автоматичних виправлень, генерації коду, рефакторингу

**Рішення просте**: Якщо навичка повинна лише _спостерігати та звітувати_, обмежуйте її. Якщо потрібно _вносити зміни_, залишайте необмеженою. Якщо сумніваєтесь — починайте з обмежень, завжди можна послабити пізніше.

Спробуйте запустити `/review-k8s`, а потім попросіть Claude "fix issue #1 from the report" у тій самій сесії. Навичка вже завершиться, і Claude (тепер у звичайному режимі, а не в режимі навички) зможе виправити проблему з повним доступом до інструментів.

---

### Чекпоінт

Ваша директорія `.claude/skills/` тепер має виглядати так:

```text
.claude/
  skills/
    review-k8s/
      SKILL.md          ← Ревʼювер K8s best practices (обмежений)
    check-docker/
      SKILL.md          ← Аудитор Dockerfile (обмежений)
    explain/
      SKILL.md          ← Пояснювач файлів з $ARGUMENTS (обмежений)
```

Ви також використали вбудовану навичку `/simplify` на реальному коді. Ці чотири команди тепер живуть у вашому проєкті — будь-який член команди, що зробить pull репо, отримає їх безкоштовно.

---

### Бонусні завдання

**Завдання 1: Створіть навичку `/generate-test`**
Побудуйте необмежену навичку, що приймає шлях до файлу через `$ARGUMENTS`, читає файл та генерує тестовий файл, дотримуючись конвенцій тестування з вашого Блоку 5 `.claude/rules/testing.md`. Вона має створити тестовий файл у правильному місці та використати правильний фреймворк.

**Завдання 2: Створіть персональну навичку**
Створіть навичку у `~/.claude/skills/` (не в проєкті), що робить щось особисто корисне для вас. Ідеї:
- `/tldr` — підсумовує будь-який файл у 3 пунктах
- `/review-pr` — ревʼю diff поточної гілки проти main
- `/standup` — генерує апдейт для стендапу з ваших нещодавніх комітів

**Завдання 3: Ланцюжок навичок**
Запустіть `/review-k8s`, потім використайте знахідки, щоб вручну попросити Claude виправити критичні проблеми. Порівняйте до та після, запустивши `/review-k8s` знову. Другий звіт має показати покращення.

---

> **Далі**: У Блоці 7 ми виведемо Claude Code за межі кодової бази — у реальну інфраструктуру: Docker-білди, Kubernetes-кластери та SSH на живі сервери. Claude не лише пише код — він керує системами.

---

<div class="cta-block">
  <p>Готові перевірити засвоєне?</p>
  <a href="{{ '/ua/course/block-06-skills/quiz/' | relative_url }}" class="hero-cta">Пройти квіз &rarr;</a>
</div>
