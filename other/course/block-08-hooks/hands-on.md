---
layout: block-part
title: "Хуки — Автоматизация рабочего процесса — Практика"
block_number: 8
part_name: "Hands-On"
locale: ru
translation_key: block-08-hands-on
overview_url: /other/course/block-08-hooks/
presentation_url: /other/course/block-08-hooks/presentation/
hands_on_url: /other/course/block-08-hooks/hands-on/
permalink: /other/course/block-08-hooks/hands-on/
---
> **Прямая речь:** "Всё на этой странице практики построено так, чтобы вы могли повторять за мной строка за строкой. Когда видите блок с командой или промптом, можете копировать его прямо в терминал или сессию Claude, если я явно не укажу, что это справочный материал. По ходу работы сравнивайте свой результат с моим на экране, чтобы ловить ошибки сразу, а не копить их."

> **Продолжительность**: ~25 минут
> **Результат**: Пять хуков -- автоформатирование при редактировании, защита файлов, статус сессии, десктопное уведомление и запрос подтверждения.
> **Предварительные требования**: Пройдены Блоки 0-7, проект ai-coderrank открыт в Claude Code

---

### Шаг 1: Автоформатирование Prettier после каждого редактирования (~5 мин)

Это самый полезный хук с немедленным эффектом. Каждый раз, когда Claude пишет или редактирует файл, Prettier запускается автоматически. Больше никаких "ой, забыл отформатировать".

Сначала убедитесь, что Prettier установлен в проекте ai-coderrank:

```bash
cd ~/ai-coderrank
npx prettier --version
```

Если не установлен, попросите Claude:

```text
Add prettier as a dev dependency and create a basic .prettierrc config for a Next.js TypeScript project.
```

Теперь создадим хук. Откройте `.claude/settings.json` в проекте ai-coderrank. Если там уже есть содержимое (из Блока 5 с разрешениями), вы будете добавлять к нему. Попросите Claude:

```text
Add a PostToolUse hook to .claude/settings.json that runs Prettier on any file 
after Claude writes or edits it. The hook should:
- Only fire on Write and Edit tool uses
- Read the file path from stdin JSON using jq
- Run prettier --write on the affected file
```

Результат должен выглядеть так:

```json
{
  "permissions": {
    "allow": ["Read", "Glob", "Grep", "Write", "Edit", "Bash"]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); [ -n \"$FILE\" ] && npx prettier --write \"$FILE\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

Обратите внимание на несколько моментов:
- **`"matcher": "Write|Edit"`** -- хук срабатывает только при использовании Claude инструмента Write или Edit. Не на Read, не на Bash, не на Grep.
- **`cat | jq -r '.tool_input.file_path'`** -- хуки получают контекст в виде JSON на stdin. Мы извлекаем путь к файлу с помощью `jq`. Так все хуки Claude Code получают доступ к контексту инструмента.
- **`2>/dev/null || true`** -- подавляет ошибки Prettier для файлов, которые он не может отформатировать (например, `.md` или `.yaml`, если Prettier для них не настроен). `|| true` гарантирует, что хук всегда завершается с кодом 0, чтобы случайно не заблокировать Claude.

#### Проверка

Запустите новую сессию Claude Code (чтобы подхватить новые настройки) и попросите:

```text
Add a comment to the top of src/app/page.tsx that says "// Auto-formatted by Prettier hook"
```

Наблюдайте за происходящим. Claude редактирует файл, и затем Prettier немедленно его форматирует. Если включён подробный режим (`Ctrl+O`), вы увидите срабатывание хука в выводе.

---

### Шаг 2: Блокировка редактирования защищённых файлов (~5 мин)

Некоторые файлы не должны редактироваться Claude (или кем-либо без тщательного обдумывания). `package-lock.json`, `.env`, lock-файлы -- они генерируются автоматически или содержат секреты.

Попросите Claude:

```text
Add a PreToolUse hook to .claude/settings.json that blocks Claude from editing 
or writing to these files:
- .env (and any .env.* variants)
- package-lock.json
- yarn.lock
- pnpm-lock.yaml

The hook should exit with code 2 to block the operation and print a message 
explaining why.
```

Claude добавит секцию PreToolUse в ваши настройки:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); case \"$FILE\" in *.env|*.env.*|*package-lock.json|*yarn.lock|*pnpm-lock.yaml) echo \"BLOCKED: $FILE is a protected file. Edit it manually.\"; exit 2;; esac; exit 0"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); [ -n \"$FILE\" ] && npx prettier --write \"$FILE\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

Ключевой момент -- **`exit 2`**. Он говорит Claude Code: "Эта операция запрещена. Не продолжай." Claude увидит блокировку, прочитает сообщение и скажет вам, что не смог отредактировать файл.

#### Проверка

В сессии Claude:

```text
Add a new variable MY_TEST=hello to the .env file
```

Claude попытается отредактировать `.env`, хук сработает, и вы увидите блокировку. Claude должен ответить что-то вроде "Мне не удалось отредактировать .env -- это защищённый файл."

> **Примечание**: Это не запрещает Claude _читать_ `.env` (матчер -- `Write|Edit`, а не `Read`). Если хотите заблокировать и чтение, добавьте отдельную запись PreToolUse с `"matcher": "Read"` и теми же проверками файлов.

---

### Шаг 3: Хук статуса при начале сессии (~3 мин)

Было бы здорово, если бы каждая сессия Claude начиналась с быстрой проверки статуса проекта? Текущая ветка, незакоммиченные изменения, последний коммит -- как панель мониторинга, которая появляется автоматически.

Попросите Claude:

```text
Add a SessionStart hook to .claude/settings.json that runs a shell script 
printing:
- Current git branch
- Number of uncommitted changes
- Last commit message and date
- Whether the K8s cluster is reachable (kubectl cluster-info, with a timeout)

Keep it concise — 5-6 lines of output max.
```

Хук:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '--- Project Status ---' && echo \"Branch: $(git branch --show-current)\" && echo \"Changes: $(git status --porcelain | wc -l | tr -d ' ') files modified\" && echo \"Last commit: $(git log -1 --format='%s (%cr)')\" && echo \"K8s: $(kubectl cluster-info --request-timeout=2s 2>/dev/null | head -1 || echo 'not reachable')\" && echo '---------------------'"
          }
        ]
      }
    ]
  }
}
```

Обратите внимание: у SessionStart нет `matcher`. Он и не нужен -- здесь нет инструмента, хук просто срабатывает при начале сессии.

#### Проверка

Выйдите из Claude Code и начните новую сессию:

```bash
claude
```

Вы должны увидеть вывод статуса перед тем, как промпт станет готов. Что-то вроде:

```text
--- Project Status ---
Branch: main
Changes: 2 files modified
Last commit: Add dark theme toggle (3 hours ago)
K8s: Kubernetes control plane is running at https://<IP>:6443
---------------------
```

---

### Шаг 4: Хук десктопных уведомлений (~5 мин)

Когда Claude работает над длительной задачей (реализует фичу, запускает тесты, деплоит), вы можете переключиться на другое окно. Было бы здорово получить уведомление, когда он закончит.

Попросите Claude:

```text
Add a Stop event hook to .claude/settings.json that sends a macOS desktop 
notification when Claude finishes a response. Use osascript to display a 
notification with the title "Claude Code" and the message "Task completed".

Also provide a Linux alternative using notify-send.
```

**Версия для macOS:**

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Task completed\" with title \"Claude Code\" sound name \"Glass\"'"
          }
        ]
      }
    ]
  }
}
```

**Версия для Linux (альтернатива):**

```json
{
  "type": "command",
  "command": "notify-send 'Claude Code' 'Task completed' --icon=terminal 2>/dev/null || true"
}
```

#### Проверка

Начните новую сессию и попросите Claude сделать что-то, что займёт несколько секунд:

```text
Read every file in the k8s/ directory and give me a one-sentence summary of each.
```

Когда он закончит, вы должны получить уведомление macOS. Переключитесь на другое приложение, пока Claude работает, чтобы убедиться, что уведомление всплывает.

> **Идея для улучшения**: Возможно, вы не хотите уведомление на каждый маленький ответ. Можно сделать хук умнее -- например, уведомлять только если ответ занял более 10 секунд. Это требует более сложного скрипта, но Claude может его сгенерировать:
>
> ```
> Modify the Stop notification hook to only fire if the Claude response 
> took longer than 10 seconds. Use a SessionStart hook to save the start 
> timestamp and a Stop hook to check the elapsed time.
> ```

---

### Шаг 5: Включение подробного режима и наблюдение за хуками (~2 мин)

Теперь у вас настроены четыре хука. Давайте увидим их в действии в подробном режиме.

В сессии Claude Code нажмите **`Ctrl+O`** для включения подробного вывода. Появится `[verbose mode enabled]`.

Теперь сделайте что-то, что вызовет срабатывание хуков:

```text
Add a TODO comment to the top of src/app/layout.tsx
```

В подробном режиме вы увидите вывод вроде:

```text
[hook] PreToolUse:Edit checking matcher "Write|Edit" → matched
[hook] Running: FILE=$(cat | jq -r ...) ...
[hook] Exit code: 0 (proceed)
[tool] Edit src/app/layout.tsx
[hook] PostToolUse:Edit checking matcher "Write|Edit" → matched
[hook] Running: npx prettier --write "src/app/layout.tsx"
[hook] Exit code: 0
```

Здесь видно:
1. Хук PreToolUse сработал и проверил, защищён ли файл (нет, поэтому exit 0)
2. Claude отредактировал файл
3. Хук PostToolUse сработал и запустил Prettier

Нажмите `Ctrl+O` ещё раз, чтобы отключить подробный режим, когда закончите отладку.

---

### Шаг 6: Создание хука подтверждения (~5 мин)

Для нашего последнего хука построим нечто, что спрашивает "вы уверены?" перед выполнением Claude потенциально разрушительных shell-команд. А именно команд с `rm`, `git reset`, `git push --force` или `kubectl delete`.

Попросите Claude:

```text
Add a PreToolUse hook for the Bash tool that checks if the command contains 
any of these patterns: "rm -rf", "git reset --hard", "git push --force", 
"kubectl delete namespace", "DROP TABLE", "docker system prune".

If any pattern is found, the hook should:
1. Print the command that's about to run
2. Print "This looks like a destructive command."
3. Ask the user for confirmation (read from /dev/tty)
4. Exit 2 (block) if the user says no, exit 0 if they say yes

Add it as a separate PreToolUse entry with matcher "Bash".
```

Скрипт хука:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "CMD=$(cat | jq -r '.tool_input.command // empty'); DANGEROUS_PATTERNS='rm -rf|git reset --hard|git push --force|git push -f|kubectl delete namespace|DROP TABLE|docker system prune'; if echo \"$CMD\" | grep -qE \"$DANGEROUS_PATTERNS\"; then echo \"\" && echo \"WARNING: Destructive command detected:\" && echo \"  $CMD\" && echo \"\" && read -p 'Allow this command? (y/N): ' CONFIRM < /dev/tty; if [ \"$CONFIRM\" = 'y' ] || [ \"$CONFIRM\" = 'Y' ]; then exit 0; else echo 'Blocked by user.'; exit 2; fi; else exit 0; fi"
    }
  ]
}
```

#### Проверка

Попросите Claude сделать что-то разрушительное:

```text
Delete the k8s namespace for ai-coderrank using kubectl
```

Claude попытается выполнить `kubectl delete namespace ai-coderrank`. Хук перехватит это, покажет команду и запросит подтверждение. Введите `n` для блокировки или `y` для разрешения.

---

### Полная конфигурация

После всех хуков ваш `.claude/settings.json` должен выглядеть примерно так:

```json
{
  "permissions": {
    "allow": ["Read", "Glob", "Grep", "Write", "Edit", "Bash"]
  },
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '--- Project Status ---' && echo \"Branch: $(git branch --show-current)\" && echo \"Changes: $(git status --porcelain | wc -l | tr -d ' ') files modified\" && echo \"Last commit: $(git log -1 --format='%s (%cr)')\" && echo \"K8s: $(kubectl cluster-info --request-timeout=2s 2>/dev/null | head -1 || echo 'not reachable')\" && echo '---------------------'"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); case \"$FILE\" in *.env|*.env.*|*package-lock.json|*yarn.lock|*pnpm-lock.yaml) echo \"BLOCKED: $FILE is a protected file. Edit it manually.\"; exit 2;; esac; exit 0"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "CMD=$(cat | jq -r '.tool_input.command // empty'); DANGEROUS_PATTERNS='rm -rf|git reset --hard|git push --force|git push -f|kubectl delete namespace|DROP TABLE|docker system prune'; if echo \"$CMD\" | grep -qE \"$DANGEROUS_PATTERNS\"; then echo \"\" && echo \"WARNING: Destructive command detected:\" && echo \"  $CMD\" && echo \"\" && read -p 'Allow this command? (y/N): ' CONFIRM < /dev/tty; if [ \"$CONFIRM\" = 'y' ] || [ \"$CONFIRM\" = 'Y' ]; then exit 0; else echo 'Blocked by user.'; exit 2; fi; else exit 0; fi"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); [ -n \"$FILE\" ] && npx prettier --write \"$FILE\" 2>/dev/null || true"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Task completed\" with title \"Claude Code\" sound name \"Glass\"'"
          }
        ]
      }
    ]
  }
}
```

Это пять хуков в одном конфигурационном файле, покрывающие:
- Автоформатирование (PostToolUse)
- Защита файлов (PreToolUse на Write|Edit)
- Подтверждение разрушительных команд (PreToolUse на Bash)
- Панель статуса сессии (SessionStart)
- Десктопные уведомления (Stop)

---

### Контрольная точка

Ваши хуки теперь активны. Вот что и когда срабатывает:

| Когда | Что срабатывает | Что делает |
|-------|----------------|------------|
| Начало сессии | Хук SessionStart | Выводит ветку, изменения, последний коммит, статус кластера |
| Перед редактированием файла | PreToolUse (Write\|Edit) | Проверяет, защищён ли файл; блокирует при необходимости |
| Перед выполнением команды | PreToolUse (Bash) | Проверяет разрушительные паттерны; запрашивает подтверждение |
| После редактирования файла | PostToolUse (Write\|Edit) | Запускает Prettier на изменённом файле |
| После завершения ответа Claude | Хук Stop | Отправляет уведомление macOS |

Эти хуки _всегда активны_. Не нужно помнить о форматировании. Не нужно беспокоиться, что `.env` будет затёрт. Не нужно постоянно проверять, закончил ли Claude. Всё автоматизировано.

---

### Бонусные задания

**Задание 1: Хук логирования**
Создайте хук PostToolUse, который добавляет запись в `.claude/hook-log.txt` каждый раз, когда Claude использует инструмент. Включите временную метку, имя инструмента и путь к файлу (если применимо). Это создаёт журнал аудита всего, что Claude делал в сессии.

**Задание 2: Хук автолинтинга**
Добавьте хук PostToolUse, который запускает ESLint (с `--fix`) после редактирования файлов, в дополнение к Prettier. Настройте цепочку: сначала Prettier, затем ESLint.

**Задание 3: Хук защиты веток**
Создайте хук PreToolUse для Bash, который блокирует команды `git push`, когда вы на ветке `main`. Заставьте Claude (и себя) использовать feature-ветки.

---

> **Далее**: В Блоке 9 мы вырываемся за пределы локального терминала. MCP-серверы подключают Claude к GitHub, базам данных, Slack и десяткам других инструментов -- превращая его из помощника по коду в полноценный движок рабочего процесса разработки.
