---
layout: block-part
title: "Хуки — автоматизація робочого процесу"
block_number: 8
description: "Практичні кроки для Блоку 08."
time: "~25 хвилин"
part_name: "Hands-On"
overview_url: /ua/course/block-08-hooks/
presentation_url: /ua/course/block-08-hooks/presentation/
hands_on_url: /ua/course/block-08-hooks/hands-on/
quiz_url: /ua/course/block-08-hooks/quiz/
permalink: /ua/course/block-08-hooks/hands-on/
locale: uk
translation_key: block-08-hands-on
---
> **Пряма мова:** "Все на цій практичній сторінці побудовано так, щоб ви могли повторювати за мною рядок за рядком. Коли бачите блок з командою або промптом, можете копіювати його прямо у термінал або сесію Claude, якщо я явно не скажу, що це лише довідковий матеріал. По ходу порівнюйте свій результат з моїм на екрані, щоб відловлювати помилки одразу, а не накопичувати їх."

> **Тривалість**: ~25 хвилин
> **Результат**: П'ять хуків — автоформатування при редагуванні, захист файлів, статус сесії, десктопне сповіщення та запит підтвердження.
> **Передумови**: Виконані блоки 0-7, проєкт ai-coderrank відкритий у Claude Code

---

### Крок 1: Автоформатування Prettier після кожного редагування (~5 хв)

Це найкорисніший хук з першої хвилини. Кожного разу, коли Claude записує або редагує файл, Prettier запускається автоматично. Більше жодного "ой, я забув відформатувати".

Спершу переконайтеся, що Prettier встановлений у проєкті ai-coderrank:

```bash
cd ~/ai-coderrank
npx prettier --version
```

Якщо він не встановлений, попросіть Claude:

```text
Add prettier as a dev dependency and create a basic .prettierrc config for a Next.js TypeScript project.
```

Тепер створимо хук. Відкрийте `.claude/settings.json` у проєкті ai-coderrank. Якщо там вже є вміст (з Блоку 5 — дозволи), ви додаватимете до нього. Попросіть Claude:

```text
Add a PostToolUse hook to .claude/settings.json that runs Prettier on any file 
after Claude writes or edits it. The hook should:
- Only fire on Write and Edit tool uses
- Read the file path from stdin JSON using jq
- Run prettier --write on the affected file
```

Результат має виглядати так:

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

Кілька моментів, на які варто звернути увагу:
- **`"matcher": "Write|Edit"`** — хук спрацьовує тільки коли Claude використовує інструмент Write або Edit. Не на Read, не на Bash, не на Grep.
- **`cat | jq -r '.tool_input.file_path'`** — хуки отримують контекст як JSON через stdin. Ми витягуємо шлях до файлу за допомогою `jq`. Ось так усі хуки Claude Code отримують контекст інструмента.
- **`2>/dev/null || true`** — придушує помилки Prettier для файлів, які він не вміє форматувати (наприклад, `.md` або `.yaml`, якщо Prettier не налаштований для них). `|| true` гарантує, що хук завжди повертає exit 0, тому він ніколи випадково не заблокує Claude.

#### Тестування

Розпочніть нову сесію Claude Code (щоб підхопити нові налаштування) та попросіть:

```text
Add a comment to the top of src/app/page.tsx that says "// Auto-formatted by Prettier hook"
```

Спостерігайте, що відбувається. Claude редагує файл, і Prettier одразу його форматує. Якщо у вас увімкнений verbose mode (`Ctrl+O`), ви побачите спрацювання хука у виводі.

---

### Крок 2: Блокування редагування захищених файлів (~5 хв)

Деякі файли не мають редагуватися Claude (або ким-небудь, без ретельного обмірковування). `package-lock.json`, `.env`, lock-файли — вони генеровані або містять секрети.

Попросіть Claude:

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

Claude додасть секцію PreToolUse у ваші налаштування:

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

Ключовий момент — **`exit 2`**. Це говорить Claude Code: "Ця операція заборонена. Не продовжувати." Claude побачить блокування, прочитає повідомлення та скаже вам, що не зміг відредагувати файл.

#### Тестування

У вашій сесії Claude:

```text
Add a new variable MY_TEST=hello to the .env file
```

Claude спробує відредагувати `.env`, хук спрацює, і ви побачите блокування. Claude має відповісти чимось на кшталт "Я не зміг відредагувати .env — це захищений файл."

> **Зауваження**: Це не заважає Claude _читати_ `.env` (matcher — `Write|Edit`, а не `Read`). Якщо ви хочете заблокувати і читання, додайте окремий запис PreToolUse з `"matcher": "Read"` та тими самими перевірками файлів.

---

### Крок 3: Хук статусу при старті сесії (~3 хв)

Чи не було б чудово, якби кожна сесія Claude починалася зі швидкої перевірки статусу проєкту? Поточна гілка, незакомічені зміни, останній коміт — як дашборд, що з'являється автоматично.

Попросіть Claude:

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

Зверніть увагу: `matcher` для SessionStart не потрібен. Немає задіяного інструмента — хук просто спрацьовує, коли сесія починається.

#### Тестування

Вийдіть з Claude Code та розпочніть нову сесію:

```bash
claude
```

Ви маєте побачити вивід статусу до того, як промпт буде готовий. Щось на кшталт:

```text
--- Project Status ---
Branch: main
Changes: 2 files modified
Last commit: Add dark theme toggle (3 hours ago)
K8s: Kubernetes control plane is running at https://<IP>:6443
---------------------
```

---

### Крок 4: Хук десктопних сповіщень (~5 хв)

Коли Claude працює над тривалим завданням (імплементація фічі, запуск тестів, деплой), ви можете переключитися на інше вікно. Було б чудово отримати сповіщення, коли він закінчить.

Попросіть Claude:

```text
Add a Stop event hook to .claude/settings.json that sends a macOS desktop 
notification when Claude finishes a response. Use osascript to display a 
notification with the title "Claude Code" and the message "Task completed".

Also provide a Linux alternative using notify-send.
```

**Версія для macOS:**

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

**Версія для Linux (альтернатива):**

```json
{
  "type": "command",
  "command": "notify-send 'Claude Code' 'Task completed' --icon=terminal 2>/dev/null || true"
}
```

#### Тестування

Розпочніть нову сесію та попросіть Claude зробити щось, що займе кілька секунд:

```text
Read every file in the k8s/ directory and give me a one-sentence summary of each.
```

Коли він закінчить, ви маєте отримати macOS-сповіщення. Переключіться на інший застосунок під час його роботи, щоб перевірити, що сповіщення з'являється.

> **Ідея для вдосконалення**: Можливо, ви не хочете сповіщення на кожну маленьку відповідь. Можна зробити хук розумнішим — наприклад, сповіщувати лише якщо відповідь зайняла більше 10 секунд. Це потребує складнішого скрипта, але Claude може його згенерувати:
>
> ```
> Modify the Stop notification hook to only fire if the Claude response 
> took longer than 10 seconds. Use a SessionStart hook to save the start 
> timestamp and a Stop hook to check the elapsed time.
> ```

---

### Крок 5: Увімкнення Verbose Mode та спостереження за хуками (~2 хв)

Тепер у вас налаштовано чотири хуки. Давайте побачимо їх у дії з verbose mode.

У вашій сесії Claude Code натисніть **`Ctrl+O`** для перемикання розширеного виводу. Ви побачите `[verbose mode enabled]`.

Тепер зробіть щось, що тригерить хуки:

```text
Add a TODO comment to the top of src/app/layout.tsx
```

У verbose mode ви побачите вивід на кшталт:

```text
[hook] PreToolUse:Edit checking matcher "Write|Edit" → matched
[hook] Running: FILE=$(cat | jq -r ...) ...
[hook] Exit code: 0 (proceed)
[tool] Edit src/app/layout.tsx
[hook] PostToolUse:Edit checking matcher "Write|Edit" → matched
[hook] Running: npx prettier --write "src/app/layout.tsx"
[hook] Exit code: 0
```

Це показує вам точно:
1. PreToolUse-хук спрацював і перевірив, чи файл захищений (ні, тому exit 0)
2. Claude відредагував файл
3. PostToolUse-хук спрацював і запустив Prettier

Натисніть `Ctrl+O` знову, щоб вимкнути verbose mode після дебагу.

---

### Крок 6: Створення хука підтвердження (~5 хв)

Для нашого останнього хука побудуємо щось, що запитує "ви впевнені?" перед тим, як Claude виконає потенційно деструктивну shell-команду. Зокрема, команди з `rm`, `git reset`, `git push --force` або `kubectl delete`.

Попросіть Claude:

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

#### Тестування

Попросіть Claude зробити щось деструктивне:

```text
Delete the k8s namespace for ai-coderrank using kubectl
```

Claude спробує виконати `kubectl delete namespace ai-coderrank`. Хук перехопить це, покаже команду та запитає підтвердження. Наберіть `n` для блокування або `y` для дозволу.

---

### Повна конфігурація

Після всіх хуків ваш `.claude/settings.json` має виглядати приблизно так:

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

Це п'ять хуків в одному конфігураційному файлі, що покривають:
- Автоформатування (PostToolUse)
- Захист файлів (PreToolUse на Write|Edit)
- Підтвердження деструктивних команд (PreToolUse на Bash)
- Дашборд статусу сесії (SessionStart)
- Десктопні сповіщення (Stop)

---

### Контрольна точка

Ваші хуки тепер активні. Ось що спрацьовує і коли:

| Коли | Що спрацьовує | Що робить |
|------|-----------|-------------|
| Сесія починається | SessionStart-хук | Виводить гілку, зміни, останній коміт, статус кластера |
| Перед редагуванням файлу Claude | PreToolUse (Write\|Edit) | Перевіряє, чи файл захищений; блокує, якщо так |
| Перед виконанням команди Claude | PreToolUse (Bash) | Перевіряє деструктивні патерни; запитує підтвердження |
| Після редагування файлу Claude | PostToolUse (Write\|Edit) | Запускає Prettier на зміненому файлі |
| Після завершення відповіді Claude | Stop-хук | Надсилає macOS-сповіщення |

Ці хуки _завжди увімкнені_. Вам не потрібно пам'ятати про форматування. Не потрібно хвилюватися, що `.env` буде затертий. Не потрібно постійно перевіряти, чи Claude закінчив. Все автоматизовано.

---

### Бонусні завдання

**Завдання 1: Хук логування**
Створіть PostToolUse-хук, який додає запис у `.claude/hook-log.txt` кожного разу, коли Claude використовує інструмент. Включіть мітку часу, назву інструмента та шлях до файлу (якщо застосовно). Це створює аудит-трейл усього, що Claude робив у сесії.

**Завдання 2: Хук авто-лінтингу**
Додайте PostToolUse-хук, який запускає ESLint (з `--fix`) після редагувань, на додаток до Prettier. Об'єднайте їх: спочатку Prettier, потім ESLint.

**Завдання 3: Хук захисту гілок**
Створіть PreToolUse-хук для Bash, що блокує команди `git push`, коли ви на гілці `main`. Примусьте Claude (і себе) використовувати feature-гілки.

---

> **Далі**: У Блоці 9 ми виходимо за межі локального терміналу. MCP-сервери підключають Claude до GitHub, баз даних, Slack та десятків інших інструментів — перетворюючи його з кодингового асистента на повноцінний двигун робочого процесу розробки.

---

<div class="cta-block">
  <p>Готові перевірити свої знання?</p>
  <a href="{{ '/ua/course/block-08-hooks/quiz/' | relative_url }}" class="hero-cta">Пройти тест &rarr;</a>
</div>
