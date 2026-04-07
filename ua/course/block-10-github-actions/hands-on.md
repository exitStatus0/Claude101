---
layout: block-part
title: "GitHub Actions та CI/CD"
block_number: 10
description: "Практичні кроки для Блоку 10."
time: "~25 хвилин"
part_name: "Hands-On"
overview_url: /ua/course/block-10-github-actions/
presentation_url: /ua/course/block-10-github-actions/presentation/
hands_on_url: /ua/course/block-10-github-actions/hands-on/
quiz_url: /ua/course/block-10-github-actions/quiz/
permalink: /ua/course/block-10-github-actions/hands-on/
locale: uk
translation_key: block-10-hands-on
---
> **Пряма мова:** "Все на цій практичній сторінці побудовано так, щоб ви могли повторювати за мною рядок за рядком. Коли бачите блок з командою або промптом, можете копіювати його прямо у термінал або сесію Claude, якщо я явно не скажу, що це лише довідковий матеріал. По ходу порівнюйте свій результат з моїм на екрані, щоб відловлювати помилки одразу, а не накопичувати їх."

> **Тривалість**: ~25 хвилин
> **Результат**: Повноцінний CI/CD-пайплайн на базі Claude — автоматизовані рев'ю PR через згадки `@claude`, генерація PR з issues та CI-специфічні гайдлайни CLAUDE.md з контролем витрат.
> **Передумови**: Виконані блоки 0-9 (кодова база задеплоєна, хуки та MCP налаштовані), репозиторій ai-coderrank запушений на GitHub, Anthropic API-ключ

---

### Крок 1: Встановлення Claude GitHub App (~3 хв)

Найшвидший шлях підключити Claude до GitHub-репозиторію — через офіційний GitHub App. У Claude Code виконайте:

```text
/install-github-app
```

Claude проведе вас через:
1. Відкриття посилання в браузері на сторінку встановлення GitHub App
2. Вибір вашого репозиторію `ai-coderrank` (або GitHub-організації)
3. Надання необхідних дозволів (вміст репозиторію, pull requests, issues)
4. Підтвердження встановлення

Після завершення Claude Code перевірить з'єднання. Ви маєте побачити підтвердження, що застосунок встановлений та активний на вашому репозиторії.

> **Якщо не можете встановити GitHub Apps** (корпоративна політика, дозволи тощо), перейдіть до Кроку 2 — ми налаштуємо підхід через API-ключ, який працює без GitHub App.

---

### Крок 2: Створення воркфлоу Claude Review (~5 хв)

Тепер створимо воркфлоу, що тригерить Claude на згадки `@claude`. Це працює незалежно від того, чи ви використали GitHub App чи плануєте API-ключ.

Спершу переконайтеся, що Anthropic API-ключ збережений як GitHub Actions secret. У браузері:

1. Перейдіть до репо `ai-coderrank` на GitHub
2. Навігація: **Settings > Secrets and variables > Actions**
3. Натисніть **New repository secret**
4. Name: `ANTHROPIC_API_KEY`
5. Value: ваш Anthropic API-ключ
6. Натисніть **Add secret**

Тепер створіть файл воркфлоу. У Claude Code:

```text
Create the file .github/workflows/claude-review.yml with a workflow that triggers Claude Code on @claude mentions in PR comments, PR review comments, and new issues. Use anthropics/claude-code-action@v1 with max_turns of 10.
```

Або створіть вручну. Ось повний воркфлоу:

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

Закомітьте та запуште цей файл:

```bash
cd ~/ai-coderrank
git add .github/workflows/claude-review.yml
git commit -m "ci: add Claude Code review workflow for @claude mentions"
git push origin main
```

> **Що це робить**: GitHub тепер відстежує будь-які коментарі з `@claude` на PR та issues. Коли бачить такий, він запускає runner, клонує ваш репозиторій і передає керування Claude. Claude читає контекст (diff PR, тіло issue, коментар), слідує правилам CLAUDE.md і публікує відповідь як коментар на GitHub.

---

### Крок 3: Створення тестового PR (~3 хв)

Дамо Claude щось для рев'ю. Створіть гілку з невеликою, навмисною зміною:

```bash
cd ~/ai-coderrank
git checkout -b test/claude-ci-review
```

Зробіть зміну з деякими проблемами для рев'ю. Наприклад, створіть утиліту з кількома навмисними недоліками:

```text
Create a new file src/utils/format-score.ts with a function that formats a user's coding score for display. Include: the main function, a helper, and maybe leave out input validation so Claude has something to flag.
```

Закомітьте та запуште:

```bash
git add src/utils/format-score.ts
git commit -m "feat: add score formatting utilities"
git push origin test/claude-ci-review
```

Створіть PR на GitHub:

```bash
gh pr create --title "Add score formatting utilities" --body "New utility functions for formatting and coloring user scores."
```

---

### Крок 4: Тригер Claude через `@claude` (~5 хв)

Перейдіть до щойно створеного PR на GitHub (URL був виведений командою `gh pr create`). У полі коментаря PR наберіть:

```text
@claude please review this PR. Check for TypeScript best practices, input validation, and potential runtime errors.
```

Спостерігайте. Протягом хвилини-двох воркфлоу GitHub Actions стригериться. Ви можете побачити його у вкладці **Actions** вашого репозиторію.

Коли Claude закінчить, він опублікує коментар на PR зі своїм рев'ю. Очікуйте, що він зазначить:

- **Типи `any`** — мають бути `number` для типобезпеки
- **Ділення на нуль** — `maxScore` може бути 0, що спричинить `Infinity`
- **Дублювання логіки** — обчислення відсотка присутнє в обох функціях
- **Відсутній тип повернення** — `getScoreColor` не має явного типу повернення
- **Конкатенація рядків** — template literals є кращою практикою в сучасному TypeScript

> **Спробуйте продовження**: Відповідайте на коментар рев'ю Claude з `@claude can you suggest a refactored version that fixes these issues?` і подивіться, як він відповість покращеним кодом.

---

### Крок 5: Створення issue для Claude (~5 хв)

Ось де стає по-справжньому цікаво. Claude не лише рев'юїть код — він може _писати_ код з описів issues.

Перейдіть на вкладку **Issues** вашого репо на GitHub та створіть нове issue:

**Title**: Add loading skeleton to dashboard

**Body**:
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

Відправте issue. Воркфлоу GitHub Actions виявить згадку `@claude` у тілі issue та стригериться.

Claude зробить:
1. Прочитає опис issue
2. Дослідить кодову базу, щоб зрозуміти layout дашборда
3. Перевірить існуючі компоненти та конфігурацію Tailwind
4. Створить нову гілку
5. Імплементує loading skeleton
6. Відкриє pull request з посиланням на issue

> **Це power move**: Продакт-менеджери можуть писати issues, позначати `@claude` та отримувати PR з імплементацією без того, щоб розробник перемикав контекст. Розробник все ще рев'юїть та схвалює PR, але перший чернетка готова.

---

### Крок 6: Додавання CI-специфічних гайдлайнів у CLAUDE.md (~2 хв)

Claude у CI слідує вашому CLAUDE.md, але ви можете захотіти правила, що застосовуються специфічно до контексту CI-рев'ю. Відкрийте CLAUDE.md та додайте секцію для CI.

У Claude Code:

```text
Add a CI/CD review section to CLAUDE.md with guidelines for when Claude reviews PRs in GitHub Actions. Include: always check for tests, flag TODO/FIXME in new code, verify TypeScript strict mode compliance, and require error handling in async functions.
```

Закомітьте та запуште:

```bash
git add CLAUDE.md
git commit -m "docs: add CI/CD review standards to CLAUDE.md"
git push origin main
```

Відтепер кожне рев'ю Claude у CI слідуватиме цим гайдлайнам. Послідовно, ретельно, кожен раз.

---

### Крок 7: Дослідження контролю витрат та `--max-turns` (~2 хв)

Контроль витрат є критичним при запуску AI у CI. Ось доступні регулятори в action:

**`max_turns`** — вже у нашому воркфлоу. Обмежує кількість tool-use ітерацій Claude.

```yaml
with:
  max_turns: 10    # Добре для рев'ю
  # max_turns: 25  # Для імплементацій з issues, що потребують більше кроків
```

Орієнтовні значення `max_turns`:
- **5-10**: Прості рев'ю PR (прочитати diff, перевірити кілька файлів, написати рев'ю)
- **10-20**: Складні рев'ю або невеликі імплементації
- **20-30**: Повні імплементації фіч з issues

---

### Контрольна точка

Тепер у вас є:

```text
.github/workflows/
  ci.yml                    # Ваш існуючий CI (тести, білд, лінт)
  claude-review.yml         # Claude рев'юїть PR на згадку @claude
```

І ви бачили, як Claude:
- Рев'юїть PR та зазначає реальні проблеми (типи, валідація, дублювання)
- Створює PR з опису GitHub issue
- Слідує гайдлайнам CLAUDE.md у контексті CI
- Дотримується контролю витрат через `max_turns`

Кожен PR до вашого ai-coderrank репо тепер отримує AI-powered рев'ю за запитом, і ви можете генерувати PR з імплементацією, просто написавши добре описане issue.

---

### Бонусні завдання

**Завдання 1: Авто-рев'ю при відкритті PR**
Модифікуйте воркфлоу для автоматичного тригерування рев'ю Claude при відкритті PR (не лише при згадці `@claude`). Підказка: додайте `pull_request: types: [opened]` до блоку `on:` та скоригуйте умову `if:`.

**Завдання 2: Окремі воркфлоу для рев'ю та імплементації**
Розділіть `claude-review.yml` на два файли — один для рев'ю (тільки читання, `max_turns: 10`) та один для імплементацій (write-доступ, `max_turns: 25`). Використайте різні умови тригерів для кожного.

**Завдання 3: Гейтинг за мітками**
Створіть воркфлоу, що тригерить Claude лише коли issue отримує мітку `claude-implement`. Це дає продакт-менеджерам можливість ставити роботу в чергу для Claude без його запуску на кожному issue.

**Завдання 4: Рев'ю рев'ю**
Після рев'ю Claude вашого тестового PR прокоментуйте `@claude your review missed that the formatScore function doesn't handle negative scores. Can you expand your review?` Подивіться, як Claude обробляє зворотний зв'язок щодо власного рев'ю.

---

> **Далі**: У Блоці 11 ми виходимо за межі однієї сесії Claude у субагенти — спеціалізовані AI-працівники, яким Claude може делегувати. Уявіть це як побудову команди AI-спеціалістів, кожен зі своїми знаннями, інструментами та обмеженнями.

---

<div class="cta-block">
  <p>Готові перевірити свої знання?</p>
  <a href="{{ '/ua/course/block-10-github-actions/quiz/' | relative_url }}" class="hero-cta">Пройти тест &rarr;</a>
</div>
