---
layout: block-part
title: "MCP-серверы — Подключение внешних инструментов — Практика"
block_number: 9
part_name: "Hands-On"
locale: ru
translation_key: block-09-hands-on
overview_url: /other/course/block-09-mcp/
presentation_url: /other/course/block-09-mcp/presentation/
hands_on_url: /other/course/block-09-mcp/hands-on/
quiz_url: /other/course/block-09-mcp/quiz/
permalink: /other/course/block-09-mcp/hands-on/
---
> **Прямая речь:** "Всё на этой странице практики построено так, чтобы вы могли повторять за мной строка за строкой. Когда видите блок с командой или промптом, можете копировать его прямо в терминал или сессию Claude, если я явно не укажу, что это справочный материал. По ходу работы сравнивайте свой результат с моим на экране, чтобы ловить ошибки сразу, а не копить их."

> **Продолжительность**: ~25 минут
> **Результат**: Интеграция GitHub MCP для управления issues и PR, filesystem MCP для кросс-директорного доступа и управление разрешениями для MCP-инструментов.
> **Предварительные требования**: Пройдены Блоки 0-8, аккаунт GitHub, установлен и аутентифицирован `gh` CLI, установлен Node.js

---

### Шаг 1: Добавление GitHub MCP-сервера (~5 мин)

Предпочтительный способ настройки MCP-серверов -- команда `claude mcp add`. Она записывает конфигурацию в `.mcp.json` (уровень проекта с `--scope project`) или `~/.claude.json` (уровень пользователя с `--scope user`) автоматически -- без ручного редактирования JSON.

Сначала вам нужен персональный токен доступа GitHub. Если у вас его нет:

1. Перейдите на https://github.com/settings/tokens
2. Нажмите **Generate new token (classic)**
3. Назовите его `claude-code-mcp`
4. Выберите scopes: `repo` (полный контроль приватных репозиториев), `read:org`
5. Сгенерируйте и скопируйте токен

Установите переменную окружения (добавьте это в `~/.zshrc` или `~/.bashrc`, чтобы сделать постоянной):

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

Теперь добавьте GitHub MCP-сервер через CLI:

```bash
claude mcp add github --scope project -- npx -y @modelcontextprotocol/server-github
```

Это создаст `.mcp.json` в корне вашего проекта с конфигурацией сервера. Проверьте:

```bash
cat .mcp.json
```

Вы увидите что-то вроде:

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

> **Примечание по безопасности**: Синтаксис `${GITHUB_TOKEN}` ссылается на переменную окружения вашего shell в рантайме -- сам токен никогда не хранится в файле. Если `.mcp.json` закоммичен в git, это безопасно. Для дополнительной осторожности добавьте `.mcp.json` в `.gitignore`.
>
> **Почему `claude mcp add`, а не ручное редактирование?** CLI-команда обрабатывает форматирование JSON, валидирует конфигурацию сервера и поддерживает `--scope project` vs `--scope user` для управления местом хранения конфигурации. Это официально рекомендуемый подход.

---

### Шаг 2: Перезапуск Claude и проверка MCP (~2 мин)

MCP-серверы загружаются при старте сессии. Выйдите из текущей сессии Claude и начните новую:

```bash
cd ~/ai-coderrank
claude
```

При запуске Claude запустит GitHub MCP-сервер в фоне. Возможно, вы увидите краткое сообщение об инициализации.

Проверьте доступность MCP-инструментов:

```text
What MCP tools do you have available? List them.
```

Claude должен перечислить инструменты вроде:
- `create_or_update_file` -- Создание или обновление файла в репозитории
- `create_issue` -- Создание нового issue
- `create_pull_request` -- Создание нового pull request
- `get_issue` -- Получение деталей issue
- `list_issues` -- Перечисление issues в репозитории
- `add_issue_comment` -- Комментирование issue
- `search_repositories` -- Поиск репозиториев
- `get_file_contents` -- Получение содержимого файла из репо
- И другие...

Если Claude говорит, что у него нет MCP-инструментов, проверьте:
1. Экспортирован ли `GITHUB_TOKEN` в текущем shell?
2. Валиден ли JSON в `.mcp.json`? (попросите Claude проверить)
3. Попробуйте `npx -y @modelcontextprotocol/server-github` вручную, чтобы увидеть, запускается ли он

---

### Шаг 3: Просмотр issues через MCP (~3 мин)

Теперь используем GitHub MCP-инструменты. Попросите Claude:

```text
List all open issues on the ai-coderrank repository. 
My GitHub username is <your-github-username>.
```

Claude использует инструмент `list_issues` от GitHub MCP-сервера. Он выполняет реальный вызов GitHub API и возвращает результаты.

Если issues пока нет (свежий репо), Claude об этом скажет. Это нормально -- мы как раз собираемся создать несколько.

Попробуйте более широкий запрос:

```text
Search for any repositories I own that have "coderrank" in the name.
```

Это использует инструмент `search_repositories`. Claude может исследовать всё ваше присутствие на GitHub через MCP.

---

### Шаг 4: Создание GitHub Issue через MCP (~3 мин)

Вот тут становится интересно. Попросите Claude:

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

Claude использует инструмент `create_issue`. Вы получите номер issue и URL.

Проверьте, что всё сработало:

```text
Show me the issue you just created. Include the full body and any labels.
```

Claude прочитает его обратно через `get_issue`. Затем зайдите в свой GitHub-репозиторий в браузере, чтобы убедиться, что issue там.

Теперь создайте ещё один issue:

```text
Create an issue titled "Add health check endpoints" with a body describing 
the need for /health and /ready endpoints for Kubernetes liveness and 
readiness probes. Label it with "enhancement" and "infrastructure".
```

---

### Шаг 5: Комментирование issue или PR через MCP (~3 мин)

Давайте взаимодействовать с существующими issues. Попросите Claude:

```text
Add a comment to issue #1 on ai-coderrank that says:
"Investigated this — the dark theme implementation is in src/app/providers.tsx 
and uses next-themes. Documentation should cover:
1. How the ThemeProvider works
2. The useTheme() hook for components that need theme-aware styling
3. How to add new theme-sensitive components

Will pick this up in a future block."
```

Claude использует инструмент `add_issue_comment`. Комментарий появится на issue так, как если бы вы набрали его в GitHub UI.

Если у вас есть открытые PR, попробуйте:

```text
List all open pull requests on ai-coderrank. For each one, show the title, 
author, and number of changed files.
```

И затем:

```text
Add a review comment to PR #<number> that says "Looks good! Just one note — 
make sure the resource limits are set in the K8s deployment."
```

> **Что вы видите**: Claude перемещается по вашему GitHub-воркфлоу целиком из терминала. Никаких вкладок браузера, никакого переключения контекста. Трекинг задач, ревью кода и разработка -- всё в одном месте.

---

### Шаг 6: Настройка Filesystem MCP (~3 мин)

Filesystem MCP-сервер позволяет Claude получать доступ к директориям за пределами текущего проекта. Это полезно, когда нужно, чтобы Claude обращался к конфигурациям, скриптам или данным в другом месте.

Используйте CLI для добавления:

```bash
claude mcp add filesystem --scope project -- npx -y @modelcontextprotocol/server-filesystem ~/.kube ~/scripts
```

Это добавит filesystem-сервер рядом с существующим GitHub-сервером в `.mcp.json`. Filesystem MCP-сервер принимает пути к директориям как аргументы -- Claude может получить доступ к файлам только внутри этих директорий, не где-либо ещё.

Перезапустите Claude и протестируйте:

```text
Using the filesystem MCP, read my kubeconfig at ~/.kube/config-do and tell me 
what cluster it points to, what user credentials it uses, and whether the 
certificate is Base64-encoded or a file reference.
```

Claude использует filesystem MCP для чтения файла за пределами директории проекта -- то, что он обычно не может сделать.

---

### Шаг 7: Управление разрешениями MCP (~3 мин)

Теперь, когда у вас есть MCP-инструменты, давайте контролировать, что Claude может с ними делать.

В сессии Claude выполните:

```text
/permissions
```

Вы увидите стандартный список разрешений плюс MCP-инструменты. Они следуют шаблону именования `mcp__<server>__<tool>`:

```text
mcp__github__create_issue
mcp__github__list_issues
mcp__github__create_pull_request
mcp__github__merge_pull_request
mcp__filesystem__read_file
mcp__filesystem__write_file
```

Вы можете разрешать или запрещать конкретные инструменты. Для безопасности заблокируем опасные:

```text
Update permissions to deny these MCP tools:
- mcp__github__merge_pull_request (don't want accidental merges)
- mcp__github__delete_branch (protect branches)
- mcp__filesystem__write_file (read-only filesystem access)
```

Это запишется в ваш `.claude/settings.json`:

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

Теперь Claude может создавать issues и PR, но не может мержить или удалять. Он может читать ваш kubeconfig, но не может его изменять. Это принцип наименьших привилегий, применённый к ИИ-инструментам.

#### Проверка разрешений

```text
Try to merge pull request #1 on ai-coderrank.
```

Claude должен сообщить, что у него нет разрешения на использование этого инструмента.

---

### Шаг 8: Исследование экосистемы MCP (~3 мин)

GitHub и filesystem серверы -- это только начало. Вот краткий обзор того, что ещё есть:

#### Где найти MCP-серверы

- **Официальный реестр**: https://github.com/modelcontextprotocol/servers
- **Каталог MCP**: https://mcp.so
- **Список Anthropic**: Смотрите документацию Claude Code для официально поддерживаемых серверов

#### Примечательные серверы, достойные изучения

| Сервер | Что делает | Установка |
|--------|-----------|-----------|
| **Slack** | Отправка/чтение сообщений, управление каналами | `@anthropic/mcp-slack` |
| **Linear** | Issues, проекты, циклы | `@linear/mcp-server` |
| **PostgreSQL** | Запросы к базам данных, инспекция схем | `@modelcontextprotocol/server-postgres` |
| **Docker** | Управление контейнерами, образами, томами | `@modelcontextprotocol/server-docker` |
| **Puppeteer** | Автоматизация браузера, скриншоты | `@modelcontextprotocol/server-puppeteer` |
| **Memory** | Постоянный граф знаний | `@modelcontextprotocol/server-memory` |

#### Как оценивать MCP-сервер от сообщества

Прежде чем добавлять любой MCP-сервер в конфигурацию, проверьте:

1. **Исходный код** -- Открытый ли он? Можете ли вы прочитать, что он делает?
2. **Разрешения** -- Какие API-scopes ему нужны? (Чем меньше, тем лучше)
3. **Поддержка** -- Когда был последний коммит? Решаются ли issues?
4. **Звёзды/форки** -- Валидация сообщества (не окончательная, но сигнал)
5. **Обработка токенов** -- Безопасно ли он обрабатывает учётные данные?

> **Правило**: Официальные серверы от Anthropic и организации MCP безопасны. Серверы от сообщества следует проверять как любую зависимость с открытым кодом -- проверяйте код, мейнтейнера и запрашиваемые разрешения.

---

### Контрольная точка

Ваша настройка MCP:

```text
.mcp.json
├── github (MCP server)
│   ├── list_issues         ✓ allowed
│   ├── create_issue        ✓ allowed
│   ├── add_issue_comment   ✓ allowed
│   ├── create_pull_request ✓ allowed
│   ├── merge_pull_request  ✗ denied
│   └── delete_branch       ✗ denied
└── filesystem (MCP server)
    ├── read_file           ✓ allowed
    ├── list_directory      ✓ allowed
    └── write_file          ✗ denied
```

Вы:
- Настроили два MCP-сервера (GitHub и filesystem)
- Создавали issues и комментарии прямо из Claude
- Настроили точные разрешения для MCP-инструментов
- Исследовали экосистему MCP

Claude больше не ограничен вашей локальной кодовой базой. Он может взаимодействовать с вашими GitHub-проектами, читать конфигурации из других директорий и -- с дополнительными MCP-серверами -- подключаться практически к любому инструменту в вашем рабочем процессе разработки.

---

### Бонусные задания

**Задание 1: Полный воркфлоу issue**
Создайте issue, внесите изменение в код для его исправления, закоммитьте фикс и попросите Claude открыть PR, ссылающийся на issue -- всё в одной сессии, всё через MCP-инструменты. Это мечта: от issue до PR без выхода из терминала.

```text
Create an issue titled "Add /health endpoint for K8s readiness probe". Then 
implement the fix, commit it to a new branch, push it, and create a PR that 
closes the issue. Do the whole workflow.
```

**Задание 2: Добавление Slack MCP**
Если ваша команда использует Slack, настройте Slack MCP-сервер и попросите Claude отправлять сообщение, когда деплой завершён. Скомбинируйте это с хуком Stop из Блока 8 для автоматических уведомлений.

**Задание 3: Database MCP**
Если ai-coderrank использует базу данных, настройте PostgreSQL MCP-сервер и попросите Claude исследовать схему, описать таблицы и предложить улучшения индексов.

---

> **Далее**: В Блоке 10 мы выводим Claude за пределы вашего терминала и помещаем в CI/CD-пайплайн. GitHub Actions с Claude Code -- автоматизированные ревью PR, реализация из issues и ИИ-воркфлоу, которые запускаются при каждом push.

---

<div class="cta-block">
  <p>Готовы проверить себя?</p>
  <a href="{{ '/other/course/block-09-mcp/quiz/' | relative_url }}" class="hero-cta">Пройти квиз &rarr;</a>
</div>
