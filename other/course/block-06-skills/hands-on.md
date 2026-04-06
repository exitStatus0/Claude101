---
layout: block-part
title: "Кастомные навыки — Практика"
block_number: 6
part_name: "Hands-On"
locale: ru
translation_key: block-06-hands-on
overview_url: /other/course/block-06-skills/
presentation_url: /other/course/block-06-skills/presentation/
hands_on_url: /other/course/block-06-skills/hands-on/
quiz_url: /other/course/block-06-skills/quiz/
permalink: /other/course/block-06-skills/hands-on/
---
> **Прямая речь:** "Всё на этой странице практики построено так, чтобы вы могли повторять за мной строка за строкой. Когда видите блок с командой или промптом — можете скопировать его прямо в терминал или сессию Claude, если я явно не скажу, что это просто справочный материал. По ходу дела сверяйте свой результат с моим на экране, чтобы ловить ошибки сразу, а не копить их."

> **Длительность**: ~25 минут
> **Результат**: Три кастомных навыка (ревьюер K8s, аудитор Dockerfile, объяснитель файлов) плюс тест-драйв встроенного `/simplify` на вашем коде с тёмной темой.
> **Пререквизиты**: Пройдены Блоки 0-5 (система памяти настроена)

---

### Шаг 1: Создаём навык K8s Review (~5 мин)

Это наш первый кастомный навык — read-only ревьюер, который проверяет манифесты Kubernetes на соответствие лучшим практикам. Он может читать ваш код, но не может ничего изменять.

Создайте директорию и файл навыка:

```bash
mkdir -p ~/ai-coderrank/.claude/skills/review-k8s
```

Создайте `.claude/skills/review-k8s/SKILL.md` со следующим содержимым:

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

> **Обратите внимание на секцию `allowed-tools`.** Этот навык может только Read, Glob и Grep. Он не может редактировать файлы, выполнять команды или вносить какие-либо изменения. Это ревьюер, а не фиксер — он говорит вам, что не так, и позволяет вам самим решить, что делать.

---

### Шаг 2: Создаём навык Docker Audit (~5 мин)

Тот же паттерн — read-only навык, который проверяет Dockerfile на типичные проблемы.

```bash
mkdir -p ~/ai-coderrank/.claude/skills/check-docker
```

Создайте `.claude/skills/check-docker/SKILL.md`:

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

### Шаг 3: Тестируем `/review-k8s` на проекте (~3 мин)

Пора увидеть ваш первый кастомный навык в действии. Запустите Claude Code в проекте ai-coderrank:

```bash
cd ~/ai-coderrank
claude
```

Теперь запустите навык:

```text
/review-k8s
```

Claude:
1. Обнаружит все YAML-файлы в `k8s/`
2. Прочитает каждый из них
3. Оценит их по вашему чеклисту
4. Выдаст структурированный отчёт с результатами и оценками серьёзности

Обратите внимание на то, что он найдёт. Типичные проблемы в манифестах ai-coderrank:
- Отсутствующие ресурсные лимиты
- Нет security context
- Отсутствующие health check probes
- Теги образов `latest`

> **Ключевой инсайт**: Вы только что запустили комплексный ревью K8s одной командой. Джуниор-инженер, который никогда не писал манифест Kubernetes, может запустить это и получить фидбек уровня сеньора. В этом сила навыков.

---

### Шаг 4: Тестируем `/check-docker` на Dockerfile (~3 мин)

Продолжайте в той же сессии Claude Code:

```text
/check-docker
```

Понаблюдайте, как Claude систематически проверяет Dockerfile. Он должен выдать отчёт, покрывающий:
- Используются ли multi-stage builds
- Эффективность кэширования слоёв
- Безопасность (non-root пользователь, отсутствие секретов)
- Состояние `.dockerignore`

Сравните вывод с тем, что вы бы проверили вручную. Нашёл ли он что-то, что вы могли бы пропустить?

---

### Шаг 5: Создаём параметризованный навык с `$ARGUMENTS` (~5 мин)

Теперь давайте создадим гибкий навык, принимающий входные данные — объяснитель, который работает с любым файлом, на который вы его направите.

```bash
mkdir -p ~/ai-coderrank/.claude/skills/explain
```

Создайте `.claude/skills/explain/SKILL.md`:

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

Теперь протестируйте в сессии Claude Code:

```text
/explain src/app/page.tsx
/explain k8s/deployment.yaml
/explain Dockerfile
```

Каждый вызов подставляет путь, который вы указали, вместо `$ARGUMENTS`. Один навык, разные цели. Обратите внимание, как объяснения адаптируются под тип файла — React-компонент объясняется иначе, чем K8s-манифест.

---

### Шаг 6: Запускаем `/simplify` на изменениях тёмной темы (~3 мин)

Помните тёмную тему, которую вы реализовали в Блоке 4? Давайте посмотрим, сможет ли `/simplify` её подчистить.

В вашей сессии Claude Code:

```text
/simplify
```

`/simplify` — это встроенный навык, который:
1. Смотрит на ваши последние изменения кода
2. Находит возможности для переиспользования (не реализуете ли вы заново то, что уже есть в кодовой базе?)
3. Замечает улучшения качества кода
4. Находит оптимизации производительности
5. Автоматически применяет исправления

Посмотрите, что он найдёт в вашей реализации тёмной темы. Типичные вещи, которые `/simplify` ловит:
- Дублирующиеся значения цветов, которые стоит вынести в CSS-переменные или расширения темы Tailwind
- Условная логика классов, которую можно чище написать через `clsx` или `cn()`
- Компоненты, которые могут использовать общий базовый стиль
- Логика переключения темы, которую можно упростить с помощью кастомного хука

Просмотрите каждое предложенное изменение. Примите те, с которыми согласны.

> **Когда использовать `/simplify`**: После завершения любой фичи. Пишите код, чтобы он работал, затем `/simplify`, чтобы он стал чистым. Это как код-ревьюер, которого волнует только качество — без эго, без споров о стиле, просто "вот как этот код можно сделать лучше".

---

### Шаг 7: Разбираемся с ограничениями `allowed-tools` (~1 мин)

Давайте чётко обозначим разницу.

**Ограниченный навык** (наш review-k8s):
```yaml
allowed-tools:
  - Read
  - Glob
  - Grep
```
- Может читать файлы, искать по паттернам, выводить список файлов
- НЕ МОЖЕТ редактировать файлы, записывать файлы или выполнять bash-команды
- Идеально для: ревью, аудитов, объяснений, отчётов

**Неограниченный навык** (без `allowed-tools` в frontmatter):
```yaml
---
name: fix-k8s-issues
description: Fixes common K8s manifest issues automatically
---
```
- Может использовать ВСЕ инструменты — читать, записывать, редактировать, выполнять команды
- Может вносить изменения прямо в ваши файлы
- Идеально для: автоматических исправлений, генерации кода, рефакторинга

**Решение простое**: Если навык должен только _наблюдать и отчитываться_ — ограничивайте его. Если ему нужно _вносить изменения_ — оставляйте без ограничений. Если сомневаетесь — начните с ограниченного варианта. Расширить всегда можно позже.

Попробуйте запустить `/review-k8s`, а затем попросите Claude "исправить проблему №1 из отчёта" в той же сессии. Навык завершится, и Claude (теперь в обычном режиме, а не в режиме навыка) сможет внести исправление с полным доступом ко всем инструментам.

---

### Чекпоинт

Ваша директория `.claude/skills/` сейчас должна выглядеть так:

```text
.claude/
  skills/
    review-k8s/
      SKILL.md          <- K8s ревьюер лучших практик (ограниченный)
    check-docker/
      SKILL.md          <- Аудитор Dockerfile (ограниченный)
    explain/
      SKILL.md          <- Объяснитель файлов с $ARGUMENTS (ограниченный)
```

Вы также использовали встроенный навык `/simplify` на реальном коде. Эти четыре команды теперь живут в вашем проекте — любой коллега, который стянет репозиторий, получит их бесплатно.

---

### Бонусные задания

**Задание 1: Создайте навык `/generate-test`**
Создайте неограниченный навык, который принимает путь к файлу через `$ARGUMENTS`, читает файл и генерирует тестовый файл, следуя конвенциям тестирования из вашего `.claude/rules/testing.md` (Блок 5). Он должен создать тестовый файл в правильном месте и использовать правильный фреймворк.

**Задание 2: Создайте персональный навык**
Создайте навык в `~/.claude/skills/` (не в проекте), который делает что-то полезное лично для вас. Идеи:
- `/tldr` — пересказывает любой файл в 3 пунктах
- `/review-pr` — ревьюит diff текущей ветки относительно main
- `/standup` — генерирует апдейт для стендапа из ваших последних коммитов

**Задание 3: Цепочка навыков**
Запустите `/review-k8s`, затем используйте результаты, чтобы вручную попросить Claude исправить критические проблемы. Сравните "до" и "после", запустив `/review-k8s` ещё раз. Второй отчёт должен показать улучшения.

---

> **Далее**: В Блоке 7 мы выводим Claude Code за пределы кодовой базы — в реальную инфраструктуру: сборки Docker, кластеры Kubernetes и SSH на живые серверы. Claude не просто пишет код — он управляет системами.

---

<div class="cta-block">
  <p>Готовы проверить себя?</p>
  <a href="{{ '/other/course/block-06-skills/quiz/' | relative_url }}" class="hero-cta">Пройти квиз &rarr;</a>
</div>
