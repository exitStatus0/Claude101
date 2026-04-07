---
layout: resource
title: "Шпаргалка Claude Code"
purpose: "Швидко знайдіть потрібну команду, файл або клавішу."
verified: "2026-04-06"
locale: uk
translation_key: cheatsheet
permalink: /ua/resources/cheatsheet/
---

## Швидкий старт

```bash
# macOS / Linux / WSL (офіційний нативний інсталятор)
curl -fsSL https://claude.ai/install.sh | bash
```

```bash
# macOS альтернатива
brew install --cask claude-code

# Windows
winget install Anthropic.ClaudeCode
```

Автентифікуйтесь та перевірте налаштування:

```bash
claude auth login
claude auth status --text
claude                   # інтерактивна сесія
claude "explain this repo"  # старт з промптом
claude -c                # продовжити останню розмову
claude --resume          # обрати сесію для відновлення
```

Введіть `/help` всередині будь-якої сесії, щоб побачити всі доступні команди.

Цей курс орієнтований на термінал, але Claude Code також працює у VS Code, JetBrains, Desktop та Web.

## Щоденні команди

| Команда | Опис |
|---------|------|
| `claude` | Розпочати інтерактивну сесію |
| `claude -p "prompt"` | Одноразовий режим друку (неінтерактивний) |
| `claude -c` | Продовжити останню розмову |
| `/resume` | Відновити збережену розмову |
| `/clear` | Скинути розмову |
| `/compact` | Стиснути контекст для звільнення токенів |
| `/cost` | Перевірити використання токенів та витрати |
| `/status` | Переглянути версію, модель, акаунт та з'єднання |
| `/diff` | Переглянути поточні та потокові диффи |
| `/permissions` | Керувати доступом інструментів для сесії |

## CLI-команди

| Команда | Опис |
|---------|------|
| `claude auth login` | Увійти |
| `claude auth status --text` | Перевірити стан автентифікації |
| `claude update` | Оновити Claude Code |
| `claude agents` | Переглянути налаштованих суб-агентів |
| `claude mcp` | Керувати MCP-серверами з CLI |
| `claude plugin` | Керувати плагінами |
| `claude remote-control --name "my session"` | Запустити сесію Remote Control |

## Slash-команди

### Щоденні

| Команда | Опис |
|---------|------|
| `/help` | Показати всі команди |
| `/resume` | Відновити сесію |
| `/rename "name"` | Перейменувати цю сесію |
| `/clear` | Почати заново |
| `/compact` | Стиснути контекст |
| `/cost` | Перевірити використання |
| `/status` | Показати версію, модель, акаунт та з'єднання |
| `/permissions` | Керувати доступом інструментів |

### Просунуті

| Команда | Опис |
|---------|------|
| `/plan` | Увійти в plan mode (тільки читання) |
| `/init` | Згенерувати CLAUDE.md для цього проєкту |
| `/memory` | Переглянути/редагувати завантажені інструкції та авто-пам'ять |
| `/model` | Переглянути або змінити модель |
| `/effort` | Налаштувати глибину мислення |
| `/context` | Візуалізувати використання контексту |
| `/diff` | Відкрити інтерактивний переглядач диффів |
| `/doctor` | Діагностика встановлення та налаштувань |
| `/hooks` | Переглянути активну конфігурацію хуків |
| `/mcp` | Керувати MCP-з'єднаннями та авторизацією |
| `/skills` | Переглянути доступні навички |
| `/plugin` | Керувати плагінами |
| `/agents` | Переглянути налаштованих суб-агентів |
| `/add-dir` | Додати доступ до директорії |
| `/config` | Налаштувати параметри |
| `/remote-control` | Продовжити цю сесію віддалено |
| `/security-review` | Перевірити поточний дифф на проблеми безпеки |

### Автоматизація

| Команда | Опис |
|---------|------|
| `/loop 5m "prompt"` | Повторювати промпт з інтервалом |
| `/schedule` | Створити хмарні заплановані задачі |
| `/batch "instruction"` | Паралельні зміни у файлах |
| `/install-github-app` | Налаштувати інтеграцію з GitHub Actions |

<div class="callout-advanced" markdown="1">
Claude Code показує вбудовані команди та бандлені навички разом у slash-меню. Цінні бандлені навички включають <code>/simplify</code>, <code>/batch</code>, <code>/debug</code> та <code>/loop</code>.
</div>

### Експериментальні

Команди агентів -- координація кількох суб-агентів для однієї задачі. Увімкніть за допомогою `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

## Моделі та прапорці

**Основні прапорці**

| Прапорець | Опис |
|-----------|------|
| `--model opus\|sonnet\|haiku` | Обрати модель |
| `--effort low\|medium\|high\|max` | Глибина мислення |
| `-p` | Режим друку (неінтерактивний) |
| `-c` | Продовжити останню розмову |
| `-r "<session>"` | Відновити сесію за назвою або ID |
| `-w [name]` | Працювати в git worktree |
| `-n "name"` | Назвати сесію |
| `--remote-control` | Запустити інтерактивну сесію з увімкненим Remote Control |

**Просунуті прапорці**

| Прапорець | Опис |
|-----------|------|
| `--output-format text\|json\|stream-json` | Обрати формат виводу для скриптів |
| `--max-turns N` | Обмежити кількість ітерацій агента |
| `--max-budget-usd N` | Обмежити витрати в USD |
| `--permission-mode` | `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions` |
| `--add-dir ../path` | Додати додаткову директорію до контексту |
| `--mcp-config file.json` | Завантажити кастомну MCP-конфігурацію |
| `--tools "Bash,Edit,Read"` | Обмежити вбудовані інструменти для сесії |
| `--bare` | Мінімальний скриптовий режим зі зменшеним автовиявленням |

## Файли та розташування

| Файл | Область | Призначення |
|------|---------|-------------|
| `CLAUDE.md` | Проєкт (спільний) | Інструкції рівня проєкту |
| `.claude/CLAUDE.md` | Проєкт (спільний) | Альтернативне розташування для проєкту |
| `CLAUDE.local.md` | Проєкт (gitignored) | Персональні перевизначення |
| `~/.claude/CLAUDE.md` | Користувач | Інструкції для всіх проєктів |
| `.claude/rules/*.md` | Проєкт (спільний) | Правила для конкретних шляхів |
| `.claude/settings.json` | Проєкт (спільний) | Налаштування проєкту та хуки |
| `.claude/settings.local.json` | Проєкт (gitignored) | Локальні налаштування |
| `~/.claude/settings.json` | Користувач | Загальні налаштування користувача |
| `.mcp.json` | Проєкт (спільний) | Конфігурація MCP-серверів |
| `.claude/skills/*/SKILL.md` | Проєкт (спільний) | Власні навички |
| `~/.claude/skills/*/SKILL.md` | Користувач | Персональні навички |
| `.claude/agents/*.md` | Проєкт (спільний) | Власні суб-агенти |
| `~/.claude/agents/*.md` | Користувач | Персональні суб-агенти |

## Налаштування MCP

```bash
claude mcp add <name> --scope project -- <command> [args...]
claude mcp list
claude mcp remove <name>
```

<div class="callout-daily" markdown="1">
Область project зберігає конфігурацію в <code>.mcp.json</code>. Область user зберігає конфігурацію в <code>~/.claude.json</code>.
</div>

## Основи хуків

Хуки знаходяться в `.claude/settings.json` під ключем `hooks`.

**Типи хуків:** command, prompt, agent, http

**Ключові події**

| Подія | Коли спрацьовує |
|-------|-----------------|
| `PreToolUse` | Перед запуском будь-якого інструмента |
| `PostToolUse` | Після успішного виконання інструмента |
| `SessionStart` | На початку сесії |
| `Stop` | Коли Claude завершує відповідь |

**Коди виходу:** `0` = продовжити, `2` = заблокувати дію.

<div class="callout-advanced" markdown="1">
Хуки отримують JSON на stdin. Використовуйте <code>jq</code> для вилучення полів у shell-хуках.
</div>

## GitHub Actions

```yaml
# .github/workflows/claude.yml
on:
  issue_comment: { types: [created] }
  pull_request_review_comment: { types: [created] }
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Просунуте

**Headless-режим** -- передайте Claude в скрипти:

```bash
claude -p "list TODO comments" --output-format json
```

**Remote control** -- продовжіть ту саму локальну сесію з телефону або браузера:

```bash
claude --remote-control "my rollout"
```

**Команди агентів** -- експериментальна мультиагентна координація:

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude "Review security, performance, and quality"
```

**Контроль бюджету:**

| Прапорець | Опис |
|-----------|------|
| `--max-budget-usd N` | Жорстке обмеження витрат |
| `--max-turns N` | Обмеження циклів агента |

## Гарячі клавіші

| Клавіша | Дія |
|---------|-----|
| `Shift+Tab` | Переключити режими дозволів |
| `Ctrl+C` | Перервати поточний хід |
| `Ctrl+L` | Очистити екран терміналу |
| `Ctrl+O` | Увімкнути/вимкнути verbose-режим |
| `Esc` `Esc` | Редагувати попереднє повідомлення |
| `Ctrl+T` | Увімкнути/вимкнути список задач (agent teams) |
| `Shift+Down` | Переключити напарників |
| `/` | Відкрити автодоповнення slash-команд |
