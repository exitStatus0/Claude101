---
layout: block-part
title: "GitHub Actions и CI/CD — Claude в пайплайне — Практика"
block_number: 10
part_name: "Hands-On"
locale: ru
translation_key: block-10-hands-on
overview_url: /other/course/block-10-github-actions/
presentation_url: /other/course/block-10-github-actions/presentation/
hands_on_url: /other/course/block-10-github-actions/hands-on/
quiz_url: /other/course/block-10-github-actions/quiz/
permalink: /other/course/block-10-github-actions/hands-on/
---
> **Прямая речь:** "Всё на этой странице практики построено так, чтобы вы могли повторять за мной строка за строкой. Когда видите блок с командой или промптом, можете копировать его прямо в терминал или сессию Claude, если я явно не укажу, что это справочный материал. По ходу работы сравнивайте свой результат с моим на экране, чтобы ловить ошибки сразу, а не копить их."

> **Продолжительность**: ~25 минут
> **Результат**: Полностью рабочий CI/CD-пайплайн с Claude -- автоматизированные ревью PR по триггеру `@claude`, генерация PR из issues и CI-специфичные гайдлайны CLAUDE.md с контролем расходов.
> **Предварительные требования**: Пройдены Блоки 0-9 (кодовая база задеплоена, хуки и MCP настроены), репозиторий ai-coderrank запушен на GitHub, Anthropic API-ключ

---

### Шаг 1: Установка Claude GitHub App (~3 мин)

Самый быстрый способ подключить Claude к вашему GitHub-репозиторию -- через официальный GitHub App. Внутри Claude Code выполните:

```text
/install-github-app
```

Claude проведёт вас через:
1. Открытие ссылки в браузере на страницу установки GitHub App
2. Выбор вашего репозитория `ai-coderrank` (или вашей организации GitHub)
3. Предоставление необходимых разрешений (содержимое репозитория, pull requests, issues)
4. Подтверждение установки

По завершении Claude Code проверит подключение. Вы должны увидеть подтверждение, что App установлен и активен на вашем репозитории.

> **Если вы не можете установить GitHub Apps** (корпоративная политика, разрешения и т.д.), переходите к Шагу 2 -- мы настроим подход с API-ключом, который работает без GitHub App.

---

### Шаг 2: Создание воркфлоу Claude Review (~5 мин)

Теперь создадим воркфлоу, который запускает Claude по упоминаниям `@claude`. Это работает независимо от того, использовали вы GitHub App или планируете использовать API-ключ.

Сначала убедитесь, что ваш Anthropic API-ключ сохранён как секрет GitHub Actions. В браузере:

1. Перейдите в репозиторий `ai-coderrank` на GitHub
2. Откройте **Settings > Secrets and variables > Actions**
3. Нажмите **New repository secret**
4. Имя: `ANTHROPIC_API_KEY`
5. Значение: ваш Anthropic API-ключ
6. Нажмите **Add secret**

Теперь создайте файл воркфлоу. В Claude Code:

```text
Create the file .github/workflows/claude-review.yml with a workflow that triggers Claude Code on @claude mentions in PR comments, PR review comments, and new issues. Use anthropics/claude-code-action@v1 with max_turns of 10.
```

Или создайте вручную. Вот полный воркфлоу:

```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, labeled]

jobs:
  claude-review:
    # Only run when @claude is mentioned
    if: |
      (github.event_name == 'issue_comment' &&
        contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' &&
        contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'issues' &&
        contains(github.event.issue.body, '@claude'))
    runs-on: ubuntu-latest

    permissions:
      contents: write
      pull-requests: write
      issues: write

    # Prevent parallel runs on the same PR/issue
    concurrency:
{% raw %}
      group: claude-${{ github.event.issue.number || github.event.pull_request.number }}
{% endraw %}
      cancel-in-progress: true

    steps:
      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          max_turns: 10
```

Закоммитьте и запушьте этот файл:

```bash
cd ~/ai-coderrank
git add .github/workflows/claude-review.yml
git commit -m "ci: add Claude Code review workflow for @claude mentions"
git push origin main
```

> **Что это делает**: GitHub теперь отслеживает любой комментарий, содержащий `@claude`, в PR и issues. Когда он его видит, запускает раннер, клонирует репо и передаёт управление Claude. Claude читает контекст (diff PR, тело issue, комментарий), следует правилам CLAUDE.md и публикует ответ как комментарий на GitHub.

---

### Шаг 3: Создание тестового PR (~3 мин)

Давайте дадим Claude что-то для ревью. Создайте ветку с небольшим намеренным изменением:

```bash
cd ~/ai-coderrank
git checkout -b test/claude-ci-review
```

Теперь внесите изменение, которое можно проревьюить -- что-то, к чему у Claude будут замечания. Например, добавьте утилитарную функцию с несколькими намеренными проблемами:

```text
Create a new file src/utils/format-score.ts with a function that formats a user's coding score for display. Include: the main function, a helper, and maybe leave out input validation so Claude has something to flag.
```

Или создайте вручную:

```typescript
// src/utils/format-score.ts

export function formatScore(score: any, maxScore: number): string {
  const percentage = (score / maxScore) * 100;

  if (percentage >= 90) return "A+ (" + percentage + "%)";
  if (percentage >= 80) return "A (" + percentage + "%)";
  if (percentage >= 70) return "B (" + percentage + "%)";
  if (percentage >= 60) return "C (" + percentage + "%)";
  return "F (" + percentage + "%)";
}

export function getScoreColor(score: any, maxScore: number) {
  const pct = (score / maxScore) * 100;
  if (pct >= 90) return "green";
  if (pct >= 70) return "yellow";
  return "red";
}
```

Обратите внимание на намеренные проблемы: типы `any`, отсутствие валидации входных данных (что если `maxScore` равен 0?), дублирование расчёта процентов, конкатенация строк вместо шаблонных литералов, отсутствие возвращаемого типа у второй функции.

Закоммитьте и запушьте:

```bash
git add src/utils/format-score.ts
git commit -m "feat: add score formatting utilities"
git push origin test/claude-ci-review
```

Теперь создайте PR на GitHub:

```bash
gh pr create --title "Add score formatting utilities" --body "New utility functions for formatting and coloring user scores."
```

---

### Шаг 4: Вызов Claude через `@claude` (~5 мин)

Перейдите к только что созданному PR на GitHub (URL был выведен командой `gh pr create`). В поле комментария PR введите:

```text
@claude please review this PR. Check for TypeScript best practices, input validation, and potential runtime errors.
```

Теперь наблюдайте. В течение минуты-двух воркфлоу GitHub Actions будет запущен. Вы можете увидеть его выполнение на вкладке **Actions** вашего репозитория.

Когда Claude закончит, он опубликует комментарий к PR с ревью. Ожидайте, что он отметит:

- **Типы `any`** -- должны быть `number` для типобезопасности
- **Деление на ноль** -- `maxScore` может быть 0, что вызовет `Infinity`
- **Дублирование логики** -- расчёт процентов встречается в обеих функциях
- **Отсутствие возвращаемого типа** -- `getScoreColor` не имеет явного типа возврата
- **Конкатенация строк** -- шаблонные литералы предпочтительнее в современном TypeScript

Прочитайте ревью Claude. Оно должно быть структурированным, практичным и специфичным для кода, который вы написали.

> **Попробуйте продолжить**: Ответьте на ревью-комментарий Claude: `@claude can you suggest a refactored version that fixes these issues?` и понаблюдайте, как он ответит улучшенным кодом.

---

### Шаг 5: Создание Issue для Claude (~5 мин)

Вот тут становится по-настоящему захватывающе. Claude не просто ревьюит код -- он может _писать_ код из описаний issues.

Перейдите на вкладку **Issues** вашего репо на GitHub и создайте новый issue:

**Заголовок**: Add loading skeleton to dashboard

**Тело**:
```text
@claude

The dashboard page (`src/app/dashboard/page.tsx`) currently shows a blank screen while data loads. Add a loading skeleton that:

1. Shows placeholder shapes matching the layout of the actual content
2. Uses Tailwind CSS `animate-pulse` for the shimmer effect
3. Follows Next.js 14 conventions (create a `loading.tsx` file)
4. Matches the existing design system (check the Tailwind config and existing components)

The skeleton should cover:
- The main score card (large number with label)
- The recent activity list (3-4 placeholder rows)
- The stats sidebar (2-3 stat blocks)
```

Отправьте issue. Воркфлоу GitHub Actions обнаружит упоминание `@claude` в теле issue и запустится.

Claude:
1. Прочитает описание issue
2. Исследует кодовую базу, чтобы понять макет дашборда
3. Проверит существующие компоненты и конфигурацию Tailwind
4. Создаст новую ветку
5. Реализует скелетон загрузки
6. Откроет pull request, ссылающийся на issue

Это займёт несколько минут. Следите за прогрессом на вкладке Actions. Когда Claude закончит, у вас будет новый PR, связанный с issue, с полной реализацией.

> **Это ключевой момент**: Продакт-менеджеры могут писать issues, тегнуть `@claude` и получить PR с реализацией без того, чтобы разработчик отвлекался. Разработчик по-прежнему ревьюит и одобряет PR, но первый черновик готов.

---

### Шаг 6: Добавление CI-специфичных гайдлайнов в CLAUDE.md (~2 мин)

Claude в CI следует вашему CLAUDE.md, но вам могут понадобиться правила, которые применяются именно в контексте CI-ревью. Откройте CLAUDE.md и добавьте секцию для CI.

В Claude Code:

```text
Add a CI/CD review section to CLAUDE.md with guidelines for when Claude reviews PRs in GitHub Actions. Include: always check for tests, flag TODO/FIXME in new code, verify TypeScript strict mode compliance, and require error handling in async functions.
```

Или добавьте вручную в `CLAUDE.md`:

```markdown
## CI/CD Review Standards

When reviewing pull requests in GitHub Actions:

### Always Check
- New functions must have corresponding test files
- No `any` types in TypeScript -- use proper type definitions
- Async functions must have error handling (try/catch or .catch())
- New environment variables must be documented in `.env.example`
- TODO and FIXME comments in new code should be flagged as issues to track

### Review Format
- Start with a one-line summary: what this PR does
- List issues grouped by severity: Critical > Warning > Suggestion
- For each issue, include the file path, line number, and a concrete fix
- End with an overall assessment: Approve / Request Changes / Needs Discussion

### Do Not
- Do not approve PRs that reduce test coverage
- Do not approve PRs that add dependencies without justification in the PR description
- Do not auto-fix code -- suggest changes and let the author decide
```

Закоммитьте и запушьте:

```bash
git add CLAUDE.md
git commit -m "docs: add CI/CD review standards to CLAUDE.md"
git push origin main
```

Отныне каждое ревью Claude в CI будет следовать этим гайдлайнам. Согласованно, тщательно, каждый раз.

---

### Шаг 7: Изучение контроля расходов и `--max-turns` (~2 мин)

Контроль расходов критически важен при запуске ИИ в CI. Вот доступные рычаги в экшене:

**`max_turns`** -- Уже есть в нашем воркфлоу. Ограничивает количество итераций использования инструментов.

```yaml
with:
  max_turns: 10    # Good for reviews
  # max_turns: 25  # For issue implementations that need more steps
```

Ориентиры для `max_turns`:
- **5-10**: Простые ревью PR (прочитать diff, проверить файлы, написать ревью)
- **10-20**: Сложные ревью или небольшие реализации
- **20-30**: Полные реализации фич из issues

Вы также можете создать отдельные воркфлоу с разными лимитами:

```yaml
# .github/workflows/claude-review.yml -- for PR reviews
name: Claude PR Review
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  review:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          max_turns: 10
```

```yaml
# .github/workflows/claude-implement.yml -- for issue implementations
name: Claude Implementation
on:
  issues:
    types: [opened, labeled]

jobs:
  implement:
    if: contains(github.event.issue.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          max_turns: 25
```

Обратите внимание на разницу: воркфлоу ревью имеет `contents: read` (Claude только читает, не пушит), а воркфлоу реализации имеет `contents: write` (Claude может создавать ветки и пушить код).

**Другие соображения по расходам**:

- **Группы параллелизма** предотвращают накопление множественных запусков Claude на одном PR
- **Фильтры по веткам** могут ограничить ревью Claude только PR, нацеленными на `main`
- **Триггеры по лейблам** могут требовать конкретный лейбл (например, `claude-review`) вместо `@claude` в комментариях, давая больше контроля над запуском Claude

---

### Контрольная точка

Теперь у вас есть:

```text
.github/workflows/
  ci.yml                    # Your existing CI (tests, build, lint)
  claude-review.yml         # Claude reviews PRs on @claude mention
```

И вы увидели, как Claude:
- Ревьюит PR и находит реальные проблемы (типы, валидация, дублирование)
- Создаёт PR из описания GitHub issue
- Следует гайдлайнам CLAUDE.md в контексте CI
- Учитывает лимиты расходов через `max_turns`

Каждый PR в вашем репозитории ai-coderrank теперь получает ИИ-ревью по запросу, и вы можете генерировать PR с реализацией, просто написав подробное issue.

---

### Бонусные задания

**Задание 1: Авто-ревью при открытии PR**
Модифицируйте воркфлоу, чтобы автоматически запускать ревью Claude при открытии PR (не только при упоминании `@claude`). Подсказка: добавьте `pull_request: types: [opened]` в блок `on:` и скорректируйте условие `if:`.

**Задание 2: Раздельные воркфлоу ревью и реализации**
Разделите `claude-review.yml` на два файла -- один для ревью (только чтение, `max_turns: 10`) и один для реализаций (доступ на запись, `max_turns: 25`). Используйте разные условия триггеров для каждого.

**Задание 3: Гейтинг по лейблам**
Создайте воркфлоу, который запускает Claude только когда на issue навешивается лейбл `claude-implement`. Это даёт продакт-менеджерам возможность ставить задачи в очередь для Claude без запуска на каждом issue.

**Задание 4: Ревью ревью**
После того как Claude проревьюит ваш тестовый PR, прокомментируйте `@claude your review missed that the formatScore function doesn't handle negative scores. Can you expand your review?` Посмотрите, как Claude обрабатывает фидбек на собственное ревью.

---

> **Далее**: В Блоке 11 мы выходим за рамки одной сессии Claude и переходим к суб-агентам -- специализированным ИИ-работникам, которым Claude может делегировать задачи. Представьте, что вы строите команду ИИ-специалистов, каждый со своей экспертизой, инструментами и ограничениями.

---

<div class="cta-block">
  <p>Готовы проверить себя?</p>
  <a href="{{ '/other/course/block-10-github-actions/quiz/' | relative_url }}" class="hero-cta">Пройти квиз &rarr;</a>
</div>
