---
layout: block-part
title: "MCP-сервери — підключення зовнішніх інструментів"
block_number: 9
description: "Практичні кроки для Блоку 09."
time: "~25 хвилин"
part_name: "Hands-On"
overview_url: /ua/course/block-09-mcp/
presentation_url: /ua/course/block-09-mcp/presentation/
hands_on_url: /ua/course/block-09-mcp/hands-on/
quiz_url: /ua/course/block-09-mcp/quiz/
permalink: /ua/course/block-09-mcp/hands-on/
locale: uk
translation_key: block-09-hands-on
---
> **Пряма мова:** "Все на цій практичній сторінці побудовано так, щоб ви могли повторювати за мною рядок за рядком. Коли бачите блок з командою або промптом, можете копіювати його прямо у термінал або сесію Claude, якщо я явно не скажу, що це лише довідковий матеріал. По ходу порівнюйте свій результат з моїм на екрані, щоб відловлювати помилки одразу, а не накопичувати їх."

> **Тривалість**: ~25 хвилин
> **Результат**: Інтеграція GitHub MCP для управління issues та PR, filesystem MCP для крос-директорного доступу та управління дозволами MCP-інструментів.
> **Передумови**: Виконані блоки 0-8, акаунт GitHub, CLI `gh` встановлений та автентифікований, Node.js встановлений

---

### Крок 1: Додавання GitHub MCP-сервера (~5 хв)

Рекомендований спосіб налаштування MCP-серверів — команда `claude mcp add`. Вона записує конфігурацію в `.mcp.json` (на рівні проєкту з `--scope project`) або `~/.claude.json` (на рівні користувача з `--scope user`) автоматично — без ручного редагування JSON.

Спершу вам потрібен GitHub personal access token. Якщо у вас його немає:

1. Перейдіть на https://github.com/settings/tokens
2. Натисніть **Generate new token (classic)**
3. Назвіть його `claude-code-mcp`
4. Оберіть скоупи: `repo` (повний контроль приватних репозиторіїв), `read:org`
5. Згенеруйте та скопіюйте токен

Встановіть змінну оточення (додайте це у `~/.zshrc` або `~/.bashrc` для постійного збереження):

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

Тепер додайте GitHub MCP-сервер через CLI:

```bash
claude mcp add github --scope project -- npx -y @modelcontextprotocol/server-github
```

Це створить `.mcp.json` у корені проєкту з конфігурацією сервера. Переглянути його можна так:

```bash
cat .mcp.json
```

Ви побачите щось подібне:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

> **Зауваження щодо безпеки**: Синтаксис `${GITHUB_TOKEN}` посилається на змінну оточення shell у runtime — фактичний токен ніколи не зберігається у файлі. Якщо `.mcp.json` закомічений у git, це безпечно. Для додаткової обережності додайте `.mcp.json` до `.gitignore`.
>
> **Чому `claude mcp add` замість ручного редагування?** CLI-команда обробляє JSON-форматування, валідує конфігурацію сервера та підтримує `--scope project` vs `--scope user` для контролю місця збереження конфігурації. Це офіційно рекомендований підхід.

---

### Крок 2: Перезапуск Claude та перевірка MCP (~2 хв)

MCP-сервери завантажуються при старті сесії. Вийдіть з поточної сесії Claude та розпочніть нову:

```bash
cd ~/ai-coderrank
claude
```

При запуску Claude запустить GitHub MCP-сервер у фоні. Ви можете побачити коротке повідомлення про ініціалізацію.

Перевірте, що MCP-інструменти доступні:

```text
What MCP tools do you have available? List them.
```

Claude має повідомити про інструменти:
- `create_or_update_file` — Створення або оновлення файлу у репозиторії
- `create_issue` — Створення нового issue
- `create_pull_request` — Створення нового pull request
- `get_issue` — Отримання деталей issue
- `list_issues` — Перелік issues у репозиторії
- `add_issue_comment` — Коментар до issue
- `search_repositories` — Пошук репозиторіїв
- `get_file_contents` — Отримання вмісту файлу з репо
- Та інші...

Якщо Claude каже, що не має MCP-інструментів, перевірте:
1. Чи `GITHUB_TOKEN` експортований у поточному shell?
2. Чи `.mcp.json` є валідним JSON? (попросіть Claude валідувати)
3. Спробуйте `npx -y @modelcontextprotocol/server-github` вручну, щоб побачити, чи запускається

---

### Крок 3: Перегляд issues через MCP (~3 хв)

Тепер використаємо GitHub MCP-інструменти. Попросіть Claude:

```text
List all open issues on the ai-coderrank repository. 
My GitHub username is <your-github-username>.
```

Claude використає інструмент `list_issues` від GitHub MCP-сервера. Він зробить фактичний GitHub API-виклик і поверне результати.

Якщо issues ще немає (це свіжий репозиторій), Claude про це скаже. Це нормально — ми зараз створимо кілька.

Спробуйте ширший запит:

```text
Search for any repositories I own that have "coderrank" in the name.
```

Це використовує інструмент `search_repositories`. Claude може навігувати по всій вашій GitHub-присутності через MCP.

---

### Крок 4: Створення GitHub issue через MCP (~3 хв)

Ось де стає цікаво. Попросіть Claude:

```text
Create a new issue on the ai-coderrank repository:
- Title: "Add dark theme documentation"
- Body: "The dark theme was implemented in Block 4 but there's no user-facing 
  documentation. We need:
  - A section in the README explaining the theme toggle
  - Screenshot showing both light and dark modes
  - Any relevant accessibility notes (contrast ratios, etc.)
  
  Priority: low
  Relates to: dark theme implementation"
- Labels: documentation, enhancement
```

Claude використає інструмент `create_issue`. Ви отримаєте назад номер issue та URL.

Перевірте, що це спрацювало:

```text
Show me the issue you just created. Include the full body and any labels.
```

Claude прочитає його назад через `get_issue`. Потім перейдіть на GitHub у браузері, щоб підтвердити, що issue там є.

Тепер створіть ще один:

```text
Create an issue titled "Add health check endpoints" with a body describing 
the need for /health and /ready endpoints for Kubernetes liveness and 
readiness probes. Label it with "enhancement" and "infrastructure".
```

---

### Крок 5: Коментування issue або PR через MCP (~3 хв)

Давайте взаємодіяти з існуючими issues. Попросіть Claude:

```text
Add a comment to issue #1 on ai-coderrank that says:
"Investigated this — the dark theme implementation is in src/app/providers.tsx 
and uses next-themes. Documentation should cover:
1. How the ThemeProvider works
2. The useTheme() hook for components that need theme-aware styling
3. How to add new theme-sensitive components

Will pick this up in a future block."
```

Claude використає інструмент `add_issue_comment`. Коментар з'явиться на issue, ніби ви набрали його у GitHub UI.

Якщо у вас є відкриті PR, спробуйте:

```text
List all open pull requests on ai-coderrank. For each one, show the title, 
author, and number of changed files.
```

І потім:

```text
Add a review comment to PR #<number> that says "Looks good! Just one note — 
make sure the resource limits are set in the K8s deployment."
```

> **Що ви спостерігаєте**: Claude навігує по вашому GitHub-воркфлоу повністю з терміналу. Жодних вкладок браузера, жодного перемикання контексту. Управління issues, код-рев'ю та розробка — все в одному місці.

---

### Крок 6: Налаштування Filesystem MCP (~3 хв)

Filesystem MCP-сервер дозволяє Claude отримувати доступ до директорій за межами поточного проєкту. Це корисно, коли потрібно, щоб Claude посилався на конфіги, скрипти чи дані в іншому місці.

Використайте CLI для додавання:

```bash
claude mcp add filesystem --scope project -- npx -y @modelcontextprotocol/server-filesystem ~/.kube ~/scripts
```

Це додає filesystem-сервер поряд з існуючим GitHub-сервером у `.mcp.json`. Filesystem MCP-сервер приймає шляхи директорій як аргументи — Claude може отримувати доступ лише до файлів у цих директоріях, а не деінде.

Перезапустіть Claude та протестуйте:

```text
Using the filesystem MCP, read my kubeconfig at ~/.kube/config-do and tell me 
what cluster it points to, what user credentials it uses, and whether the 
certificate is Base64-encoded or a file reference.
```

Claude використовує filesystem MCP для читання файлу за межами директорії проєкту — щось, що він зазвичай не може зробити.

---

### Крок 7: Управління дозволами MCP (~3 хв)

Тепер, коли у вас є MCP-інструменти, давайте контролювати, що Claude може з ними робити.

У вашій сесії Claude виконайте:

```text
/permissions
```

Ви побачите стандартний список дозволів плюс MCP-інструменти. Вони слідують патерну іменування `mcp__<server>__<tool>`:

```text
mcp__github__create_issue
mcp__github__list_issues
mcp__github__create_pull_request
mcp__github__merge_pull_request
mcp__filesystem__read_file
mcp__filesystem__write_file
```

Ви можете дозволити або заборонити конкретні інструменти. Для безпеки заблокуємо небезпечні:

```text
Update permissions to deny these MCP tools:
- mcp__github__merge_pull_request (don't want accidental merges)
- mcp__github__delete_branch (protect branches)
- mcp__filesystem__write_file (read-only filesystem access)
```

Це потрапляє у ваш `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep", "Write", "Edit", "Bash",
      "mcp__github__list_issues",
      "mcp__github__get_issue",
      "mcp__github__create_issue",
      "mcp__github__add_issue_comment",
      "mcp__github__list_pull_requests",
      "mcp__github__create_pull_request",
      "mcp__filesystem__read_file",
      "mcp__filesystem__list_directory"
    ],
    "deny": [
      "mcp__github__merge_pull_request",
      "mcp__github__delete_branch",
      "mcp__filesystem__write_file"
    ]
  }
}
```

Тепер Claude може створювати issues та PR, але не може мержити чи видаляти. Може читати ваш kubeconfig, але не може його змінювати. Це принцип найменших привілеїв, застосований до AI-інструментів.

#### Тестування дозволів

```text
Try to merge pull request #1 on ai-coderrank.
```

Claude має повідомити, що не має дозволу використовувати цей інструмент.

---

### Крок 8: Дослідження екосистеми MCP (~3 хв)

GitHub та filesystem сервери — це лише початок. Ось швидкий огляд того, що ще є:

#### Де знайти MCP-сервери

- **Офіційний реєстр**: https://github.com/modelcontextprotocol/servers
- **Каталог MCP**: https://mcp.so
- **Список Anthropic**: Перевірте документацію Claude Code для офіційно підтримуваних серверів

#### Варті уваги сервери

| Сервер | Що робить | Встановлення |
|--------|-------------|---------|
| **Slack** | Надсилання/читання повідомлень, управління каналами | `@anthropic/mcp-slack` |
| **Linear** | Issues, проєкти, цикли | `@linear/mcp-server` |
| **PostgreSQL** | Запити до баз даних, інспекція схем | `@modelcontextprotocol/server-postgres` |
| **Docker** | Управління контейнерами, образами, volumes | `@modelcontextprotocol/server-docker` |
| **Puppeteer** | Автоматизація браузера, скріншоти | `@modelcontextprotocol/server-puppeteer` |
| **Memory** | Персистентний граф знань | `@modelcontextprotocol/server-memory` |

#### Як оцінити community MCP-сервер

Перед додаванням будь-якого MCP-сервера у конфігурацію перевірте:

1. **Вихідний код** — Він open source? Можете прочитати, що він робить?
2. **Дозволи** — Які API-скоупи йому потрібні? (Менше = краще)
3. **Підтримка** — Коли був останній коміт? Чи відповідають на issues?
4. **Зірки/форки** — Валідація спільнотою (не остаточна, але сигнал)
5. **Обробка токенів** — Чи безпечно обробляє облікові дані?

> **Правило**: Офіційні сервери від Anthropic та організації MCP безпечні. Community-сервери слід переглядати як будь-яку open-source залежність — перевірте код, мейнтейнера та дозволи.

---

### Контрольна точка

Ваше MCP-налаштування:

```text
.mcp.json
├── github (MCP server)
│   ├── list_issues         ✓ дозволено
│   ├── create_issue        ✓ дозволено
│   ├── add_issue_comment   ✓ дозволено
│   ├── create_pull_request ✓ дозволено
│   ├── merge_pull_request  ✗ заборонено
│   └── delete_branch       ✗ заборонено
└── filesystem (MCP server)
    ├── read_file           ✓ дозволено
    ├── list_directory      ✓ дозволено
    └── write_file          ✗ заборонено
```

Ви:
- Налаштували два MCP-сервери (GitHub та filesystem)
- Створили issues та коментарі безпосередньо з Claude
- Встановили гранулярні дозволи для MCP-інструментів
- Дослідили екосистему MCP

Claude більше не обмежений вашою локальною кодовою базою. Він може взаємодіяти з вашими GitHub-проєктами, читати конфіги з інших директорій і — з додатковими MCP-серверами — підключатися практично до будь-якого інструмента у вашому робочому процесі розробки.

---

### Бонусні завдання

**Завдання 1: Повний воркфлоу з issue**
Створіть issue, внесіть зміну коду для його виправлення, закомітьте виправлення та попросіть Claude відкрити PR з посиланням на issue — все в одній сесії, все через MCP-інструменти. Це мрійний воркфлоу: від issue до PR без виходу з терміналу.

```text
Create an issue titled "Add /health endpoint for K8s readiness probe". Then 
implement the fix, commit it to a new branch, push it, and create a PR that 
closes the issue. Do the whole workflow.
```

**Завдання 2: Додавання Slack MCP**
Якщо ваша команда використовує Slack, налаштуйте Slack MCP-сервер і нехай Claude надішле повідомлення після завершення деплою. Об'єднайте це з Stop-хуком з Блоку 8 для автоматичних сповіщень.

**Завдання 3: Database MCP**
Якщо ai-coderrank використовує базу даних, налаштуйте PostgreSQL MCP-сервер та попросіть Claude дослідити схему, описати таблиці та запропонувати покращення індексів.

---

> **Далі**: У Блоці 10 ми виводимо Claude за межі терміналу в CI/CD-пайплайн. GitHub Actions з Claude Code — автоматизовані рев'ю PR, імплементація з issues та AI-powered воркфлоу, що запускаються на кожному push.

---

<div class="cta-block">
  <p>Готові перевірити свої знання?</p>
  <a href="{{ '/ua/course/block-09-mcp/quiz/' | relative_url }}" class="hero-cta">Пройти тест &rarr;</a>
</div>
