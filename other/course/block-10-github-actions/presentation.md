---
layout: block-part
title: "GitHub Actions и CI/CD — Claude в пайплайне — Презентация"
block_number: 10
part_name: "Presentation"
locale: ru
translation_key: block-10-presentation
overview_url: /other/course/block-10-github-actions/
presentation_url: /other/course/block-10-github-actions/presentation/
hands_on_url: /other/course/block-10-github-actions/hands-on/
permalink: /other/course/block-10-github-actions/presentation/
---
> **Продолжительность**: ~10 минут
> **Цель**: Студенты понимают, как Claude Code работает внутри GitHub Actions, что делает официальный экшен и почему ИИ-ревью, встроенное в CI -- это кардинальное изменение для командных воркфлоу.

---

### Слайд 1: Claude Code -- это не только CLI

Вот что удивляет большинство людей, когда они слышат это впервые:

Claude Code -- это не только приложение для терминала. Это ещё и GitHub Action. Тот же Claude, который читает вашу кодовую базу, пишет код и запускает тесты на вашем ноутбуке, может делать всё то же самое внутри раннера GitHub Actions, по событиям вроде комментариев к PR, лейблов на issues или push-ов.

```
Your terminal:       claude "review this file"
GitHub Actions:      @claude please review this PR
```

Тот же движок. Те же правила CLAUDE.md. Такое же понимание вашей кодовой базы. Но теперь это автоматизировано и запускается на каждом pull request без необходимости кому-то помнить о вызове.

Официальный экшен -- `anthropics/claude-code-action@v1`, поддерживаемый Anthropic. Это не хак от сообщества и не скрипт-обёртка -- это настоящий продукт.

---

### Слайд 2: Два способа настройки

Есть два пути, чтобы добавить Claude в ваши GitHub-воркфлоу:

**Путь 1: GitHub App (рекомендуется)**

```
/install-github-app
```

Запустите эту команду внутри Claude Code, и она проведёт вас через установку официального GitHub App Claude Code на ваш репозиторий. App обрабатывает аутентификацию, разрешения и конфигурацию вебхуков. Это самый быстрый путь от нуля к "Claude ревьюит мои PR".

**Путь 2: API-ключ + ручной воркфлоу**

Если предпочитаете больше контроля (или у вашей организации есть политики по установке GitHub App), вы можете:
1. Сохранить Anthropic API-ключ как секрет GitHub Actions (`ANTHROPIC_API_KEY`)
2. Создать YAML-файл воркфлоу вручную
3. Настроить события-триггеры самостоятельно

Оба пути ведут к одному результату: Claude запускается внутри вашего CI-пайплайна. GitHub App просто приведёт вас туда быстрее.

> **Какой выбрать?** Для личных репо и небольших команд GitHub App идеален. Для корпоративных сред с жёсткими политиками установки приложений -- выбирайте подход с API-ключом. Мы попробуем оба варианта в практической части.

---

### Слайд 3: Триггер `@claude`

После подключения Claude к вашему репо модель взаимодействия до элегантности проста:

**В Pull Request:**
```
@claude please review this PR, focusing on security and performance
```

**В Issue:**
```
@claude implement this feature and create a PR
```

**В ревью-комментарии к PR (на конкретной строке):**
```
@claude this function looks like it could have a race condition. Can you check?
```

Claude видит полный контекст -- diff, файлы, историю разговора -- и отвечает комментарием в PR или issue. Другие участники команды видят ответ Claude, могут отвечать на него, задавать уточняющие вопросы и итерировать.

Это как иметь в команде участника, который:
- Отвечает за минуты, а не часы
- Никогда не говорит "посмотрю позже"
- Прочитал каждый файл в репо перед ревью
- Последовательно следует вашим гайдлайнам в CLAUDE.md

---

### Слайд 4: YAML-файл воркфлоу

Вот как выглядит файл воркфлоу на практике:

```yaml
name: Claude Code Review
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, labeled]

jobs:
  claude:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'issues' && contains(github.event.issue.body, '@claude'))
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          max_turns: 10
```

Разберём это:

- **Триггеры**: Воркфлоу срабатывает на комментарии к issues, ревью-комментарии к PR и новые issues
- **Условие**: Блок `if` проверяет, что комментарий или тело issue действительно содержит `@claude` -- мы не хотим, чтобы каждый комментарий запускал выполнение
- **Разрешения**: Claude нужен доступ на запись для push-а коммитов, комментирования PR и обновления issues
- **Экшен**: `anthropics/claude-code-action@v1` выполняет основную работу
- **`max_turns`**: Это ваш рычаг контроля стоимости -- ограничивает количество итераций Claude

---

### Слайд 5: CLAUDE.md в CI -- Ваши правила по-прежнему действуют

Вот что важно: когда Claude запускается в GitHub Actions, он читает ваш файл `CLAUDE.md`. Те же правила, соглашения и гайдлайны, которые вы настроили в Блоке 5, действуют и в CI.

Это значит, что вы можете добавить CI-специфичные гайдлайны:

```markdown
# CI Review Standards

When reviewing PRs in CI:
- Always check that new functions have corresponding tests
- Flag any TODO or FIXME comments in new code
- Verify that database migrations have a rollback step
- Check that environment variables are documented in .env.example
- Ensure error messages are user-friendly, not stack traces
```

Claude в CI не действует хаотично. Он следует тому же плейбуку, который определила ваша команда. Если ваш CLAUDE.md говорит "всегда используй conventional commits", предложения Claude в PR будут использовать conventional commits. Если там написано "никогда не одобряй PR, снижающие покрытие тестами", Claude отметит падение покрытия.

Это гарантия согласованности, которая делает CI-ревью надёжным. Это не чужой человек с субъективным мнением, ревьюящий ваш код -- это _ваши_ правила, применяемые автоматически.

---

### Слайд 6: Контроль расходов -- Предсказуемый счёт

Запуск ИИ в CI означает запуск ИИ на каждом PR, каждом комментарии, каждом issue. Это может накапливаться. Вот рычаги, которые у вас есть:

**`max_turns`** -- Самый важный.

```yaml
with:
  max_turns: 10    # Claude can take at most 10 actions
```

Простое ревью PR может занять 3-5 итераций (прочитать diff, проверить связанные файлы, написать ревью). Сложная реализация из issue может занять 15-20. Устанавливайте значение, исходя из того, что вас устраивает.

**Фильтрация триггеров** -- Не каждый комментарий требует Claude.

Триггер `@claude` означает, что Claude запускается только при явном вызове. Никаких случайных срабатываний, никаких напрасных запусков.

**Ограничения по веткам** -- Запуск только для определённых веток.

```yaml
if: github.event.pull_request.base.ref == 'main'
```

Ревьюить только PR, нацеленные на main, а не каждый мёрж feature-в-feature.

**Контроль параллелизма** -- Предотвращение параллельных запусков.

```yaml
concurrency:
{% raw %}
  group: claude-${{ github.event.pull_request.number || github.event.issue.number }}
{% endraw %}
  cancel-in-progress: true
```

Если кто-то отправит три сообщения `@claude` подряд, выполнится только последнее.

> **Реальный ориентир**: Типичное ревью PR стоит несколько центов. Даже активные репо с 20-30 PR в день обычно видят ежемесячные расходы на Claude CI меньше, чем стоимость одного командного обеда.

---

### Ключевые выводы

| Концепция | Что это | Почему это важно |
|-----------|---------|-----------------|
| `claude-code-action@v1` | Официальный GitHub Action от Anthropic | Запускает Claude в CI с полным доступом к кодовой базе |
| `/install-github-app` | Настройка одной командой | Самый быстрый путь к CI-интеграции |
| Триггер `@claude` | Вызов через упоминание | Claude запускается, только когда вы его попросите |
| CLAUDE.md в CI | Ваши правила, применяемые автоматически | Согласованные ревью по стандартам команды |
| `max_turns` | Рычаг контроля расходов | Ограничивает объём работы Claude за один вызов |
| Issue-to-PR | Создание PR из issues | Напишите, что хотите, и Claude реализует |
