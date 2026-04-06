---
layout: block-part
title: "Продвинутые паттерны — Практика"
block_number: 13
part_name: "Hands-On"
locale: ru
translation_key: block-13-hands-on
overview_url: /other/course/block-13-advanced/
presentation_url: /other/course/block-13-advanced/presentation/
hands_on_url: /other/course/block-13-advanced/hands-on/
permalink: /other/course/block-13-advanced/hands-on/
---
> **Прямая речь:** "Всё на этой странице практики построено так, чтобы вы могли повторять за мной строка за строкой. Когда видите блок с командой или промптом — можете скопировать его прямо в терминал или сессию Claude, если я явно не скажу, что это просто справочный материал. По ходу дела сверяйте свой результат с моим на экране, чтобы ловить ошибки сразу, а не копить их."

> **Длительность**: ~15 минут
> **Результат**: Практический опыт работы с командами агентов, `/batch` по K8s-манифестам, headless-режим для скриптинга и запланированная проверка на уязвимости — плюс полная ретроспектива курса.
> **Пререквизиты**: Пройдены Блоки 0-12 (всё задеплоено, GitOps работает), работающая установка Claude Code с аутентифицированными сессиями

---

### Шаг 1: Включаем и используем команды агентов (~5 мин)

> **Экспериментальная функция**: Команды агентов являются экспериментальными по состоянию на апрель 2026. API, переменная окружения и поведение могут измениться в будущих релизах. Здесь вы изучаете концепцию и паттерн — конкретные флаги могут эволюционировать.

Команды агентов позволяют запустить несколько экземпляров Claude, которые работают параллельно над разными аспектами одной задачи. Это экспериментальная функция — API может измениться — но концепция мощная и стоит того, чтобы её опробовать.

Включите функцию:

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

Запустите Claude Code:

```bash
cd ~/ai-coderrank
claude
```

Теперь создайте команду для ревью ai-coderrank с трёх разных сторон одновременно:

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

Наблюдайте, как три агента запускаются и работают параллельно. Каждый читает кодовую базу независимо и фокусируется на своей области. Вот так выглядит координация — три специализированных ревью, происходящие одновременно, за время, которое один потратил бы на одно.

Когда они закончат, вы получите три отдельных отчёта. Прочитайте их. Вероятно, вы обнаружите:
- Проблемы безопасности, о которых не задумывались (открытые переменные окружения, отсутствующая валидация ввода)
- Узкие места производительности, которые не заметили (перерендеры компонентов, неоптимизированные запросы)
- Улучшения качества кода, которые давно собирались сделать (мёртвый код, непоследовательные паттерны)

> **Когда использовать команды агентов в реальной работе**: Сложные код-ревью перед крупным релизом. Архитектурные аудиты. Планирование миграций, где безопасность, производительность и совместимость требуют отдельного анализа. Любая задача, где несколько точек зрения ценнее одного глубокого погружения.

---

### Шаг 2: /batch — Параллельные изменения по файлам (~3 мин)

Время увидеть `/batch` в действии. Типичная DevOps-задача: добавить ресурсные лимиты во все Kubernetes-деплойменты.

В вашей сессии Claude Code:

```text
/batch "add CPU and memory resource limits to all K8s deployments in k8s/. Use
sensible defaults: 100m CPU request, 250m CPU limit, 128Mi memory request,
256Mi memory limit. If limits already exist, leave them unchanged."
```

Claude:
1. Найдёт все манифесты деплойментов в `k8s/`
2. Прочитает каждый, чтобы понять рабочую нагрузку
3. Добавит ресурсные лимиты там, где их нет
4. Пропустит файлы, где лимиты уже есть
5. Покажет сводку всех изменений

Просмотрите diff. Обратите внимание, что Claude не просто вставляет один и тот же блок везде — он понимает контекст. Веб-сервер может получить другие лимиты, чем фоновый воркер.

Другие операции `/batch`, которые стоит попробовать:

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

> **Отличие от поиска-замены**: `/batch` понимает структуру YAML, знает, как выглядит K8s-деплоймент, и вносит контекстно уместные изменения. Он не сломает отступы, не добавит лимиты внутрь спецификации Service и не задублирует пробу, которая уже существует.

---

### Шаг 3: Headless-режим — Claude как скрипт (~3 мин)

Headless-режим убирает интерактивный разговор и превращает Claude Code в команду, которую можно вызывать из скриптов, cron-задач и CI-пайплайнов. Ключевые флаги:

- **`-p "prompt"`** — print-режим (неинтерактивный, одноразовый, завершается по окончании)
- **`--output-format json`** — машиночитаемый JSON-вывод
- **`--output-format text`** — простой текстовый вывод (без ANSI-форматирования)
- **`--max-turns N`** — ограничение числа ходов использования инструментов
- **`--max-budget-usd N`** — ограничение стоимости сессии

Попробуйте в терминале (не внутри Claude Code — в обычном шелле):

```bash
# Run all tests and get a JSON report
claude -p "run the test suite for ai-coderrank and report the results: total tests,
passed, failed, and any failure details" --output-format json
```

Вывод — машиночитаемый JSON. Его можно парсить через `jq`, передать в другой скрипт или сохранить в файл.

Ещё примеры headless-режима:

```bash
# Quick codebase question — no session needed
claude -p "what version of Next.js does ai-coderrank use?" --output-format text

# Pre-commit validation
claude -p "check if the K8s manifests in k8s/ are valid YAML and reference
existing Docker images" --output-format json > validation-report.json

# Generate a changelog from recent commits
claude -p "read the last 10 git commits and generate a changelog entry in
Keep a Changelog format" --output-format text >> CHANGELOG.md
```

Настоящая мощь проявляется в скриптах:

```bash
#!/bin/bash
# pre-deploy-check.sh — run before every deployment

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

> **Ключевая ментальная модель**: Интерактивный Claude Code — для исследовательской работы: расследования, планирования, реализации. Headless-режим — для автоматизированной работы: проверки, отчёты, валидации, которые запускаются без участия человека. Тот же интеллект, другой интерфейс.

---

### Шаг 4: Запланированная облачная задача — погружаемся глубже (~2 мин)

В Блоке 12 вы настроили базовую проверку здоровья. Давайте создадим что-то более серьёзное — ежедневный аудит уязвимостей зависимостей:

Команда `/schedule` создаёт облачных запланированных агентов (также называемых триггерами). Синтаксис:

```text
/schedule create "name" --cron "cron-expression" --prompt "what to do"
```

Создадим ежедневный аудит уязвимостей:

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

Проверьте существующие расписания:

```text
/schedule list
```

Вы должны увидеть и проверку здоровья из Блока 12, и этот новый скан уязвимостей. Два автоматизированных агента, работающих ежедневно, присматривающих за вашей инфраструктурой и зависимостями, пока вы фокусируетесь на разработке фич.

Запустите ручной прогон для проверки:

```text
/schedule run "dependency vulnerability scan"
```

Просмотрите вывод. Это тот тип отчёта, который большинство команд генерирует, только когда что-то ломается. Вы генерируете его проактивно, каждое утро.

---

### Шаг 5: Быстрый обзор команд — Недостающие 20% (~2 мин)

Это высокоценные команды, которым не нужен собственный полный блок, но которые обязательно должны быть в вашем повседневном арсенале.

В текущей сессии Claude Code выполните:

```text
/status
/context
/diff
/skills
/mcp
/hooks
/model
```

На что обратить внимание:

- `/status` показывает текущую модель, версию, аккаунт и состояние подключения
- `/context` помогает увидеть, когда сессия становится тяжёлой
- `/diff` — быстрый способ посмотреть, что изменилось, перед коммитом
- `/skills`, `/mcp` и `/hooks` показывают, какие расширения активны
- `/model` позволяет посмотреть или сменить текущую модель без перезапуска сессии

Теперь в обычном шелле попробуйте команды управления CLI:

```bash
claude auth status --text
claude agents
claude update
```

А если хотите передать именно эту сессию на телефон или в браузер:

```text
/remote-control ai-coderrank-ops
```

Не обязательно запоминать всё это сегодня. Суть — знать, что они существуют, какую категорию проблем решают и куда обращаться, когда понадобятся.

---

### Шаг 6: Краткий обзор экосистемы (~1 мин)

Не обязательно всё это пробовать сегодня — просто знайте, что это есть:

**Десктопное приложение** — если доступно, откройте его и подключите к проекту ai-coderrank. Обратите внимание:
- Диффы файлов бок о бок, когда Claude вносит изменения
- Визуальное дерево файлов с отметками изменённых
- Несколько параллельных сессий во вкладках (как несколько открытых терминалов, но визуально)

**VS Code / JetBrains** — если используете любую из этих IDE, расширение помещает Claude Code прямо в редактор. Можно выделить код, нажать правую кнопку и сказать "объясни это" или "отрефактори это", не выходя из файла.

**Веб-версия Claude Code** (claude.ai/code) — полноценная среда разработки в браузере. Включает виртуальную машину, которая может запускать код, устанавливать пакеты и стартовать серверы. Идеально для быстрых сессий, когда вы вдали от основной машины.

**Плагины** — упаковывайте навыки, хуки и конфигурации агентов для распространения. Если за время курса вы создали полезные инструменты (навык `/review-k8s`, pre-commit хук, суб-агенты), их можно собрать в плагин, который ваша команда установит одной командой.

---

### Шаг 7: Завершение курса (~1 мин)

Давайте посмотрим, чего вы достигли. В проекте ai-coderrank выполните:

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

Прочитайте сводку от Claude. Это ваша система. Вся целиком. Построенная через разговор, задеплоенная через GitOps, мониторящаяся через автоматизацию.

---

### Чему вы научились

Не просто инструменты — паттерны:

| Паттерн | Что вы узнали | Где использовали |
|---------|--------------|-----------------|
| Исследование перед действием | Читай и понимай, прежде чем менять | Блоки 1-3 |
| Итеративная доработка | Маленькие изменения, проверка, корректировка | Блок 4 |
| Институциональная память | Кодифицируй знания, чтобы они сохранялись | Блок 5 |
| Переиспользуемые воркфлоу | Навыки превращают экспертизу в команды | Блок 6 |
| Инфраструктура как разговор | Claude проводит через сложную настройку серверов | Блок 7 |
| Автоматизация на событиях жизненного цикла | Хуки срабатывают при действиях | Блок 8 |
| Интеграция внешних инструментов | MCP подключается к сервисам | Блок 9 |
| CI/CD как код | GitHub Actions автоматизирует пайплайн | Блок 10 |
| Специализированное делегирование | Суб-агенты фокусируются на конкретных областях | Блок 11 |
| GitOps-доставка | Git — единственный источник истины | Блок 12 |
| Параллельный и автоматизированный AI | Команды, batch, headless, расписания | Блок 13 |

Эти паттерны переносимы. Они работают с любой кодовой базой, любой инфраструктурой, любой командой. Конкретные команды будут эволюционировать с обновлениями Claude Code, но паттерны долговечны.

---

### Ваши следующие шаги

**Завтра**: Используйте Claude Code на реальной работе. Выберите задачу, на которую обычно тратите час. Посмотрите, как пойдёт.

**На этой неделе**: Настройте `.claude/CLAUDE.md` в самом используемом проекте на работе. Добавьте один файл правил и один навык.

**В этом месяце**: Интегрируйте headless-режим в один CI-пайплайн. Настройте одну задачу `/schedule` для чего-то, что ваша команда сейчас проверяет вручную.

**Всегда**: Будьте тем человеком в команде, который знает эти инструменты. Не потому что AI — это магия (это не так), а потому что умение работать с AI-агентом — это мультипликатор навыков. Вы не быстрее в 10 раз. Вы тот же инженер, с неутомимым напарником, который помнит всё, никогда не теряет терпения и может прочитать 10 000 строк кода за секунды.

Используйте это партнёрство с умом.

---

### Спасибо

Вы сделали работу. Тринадцать блоков. Десятки команд. Живое приложение в интернете.

В следующий раз, когда кто-то спросит "Что AI-инструменты реально могут сделать для DevOps?" — вам не нужно строить догадки. Вы можете показать. Откройте терминал, наберите `claude` и продемонстрируйте.

Это лучший ответ, какой только может быть.
