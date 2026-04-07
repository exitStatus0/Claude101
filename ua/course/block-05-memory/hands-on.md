---
layout: block-part
title: "Пам'ять та інтелект проєкту — Практика"
block_number: 5
description: "Практичні кроки реалізації для Блоку 05."
time: "~20 хвилин"
part_name: "Hands-On"
overview_url: /ua/course/block-05-memory/
presentation_url: /ua/course/block-05-memory/presentation/
hands_on_url: /ua/course/block-05-memory/hands-on/
quiz_url: /ua/course/block-05-memory/quiz/
permalink: /ua/course/block-05-memory/hands-on/
locale: uk
translation_key: block-05-hands-on
---
> **Пряма мова:** "Все на цій практичній сторінці побудовано так, щоб ви могли слідувати за мною рядок за рядком. Коли бачите блок із командою або промптом, можете копіювати його прямо в термінал або сесію Claude, якщо я явно не скажу, що це лише довідковий матеріал. Порівнюйте свій результат із моїм на екрані, щоб виловлювати помилки відразу, а не накопичувати їх."

> **Тривалість**: ~20 хвилин
> **Результат**: Повна система пам'яті для ai-coderrank — користувацькі вподобання, умовні правила для K8s та тестування, конфіг локального середовища та автовивчені конвенції.
> **Передумови**: Завершені Блоки 0-4 (Claude Code встановлений, ai-coderrank працює локально, темна тема реалізована)

---

### Крок 1: Створення користувацького CLAUDE.md (~3 хв)

Цей файл живе за межами будь-якого проєкту — це ВАШІ вподобання, що застосовуються скрізь.

Створіть директорію, якщо її ще немає, потім створіть файл:

```bash
mkdir -p ~/.claude
```

Тепер створіть `~/.claude/CLAUDE.md` з вашими персональними вподобаннями. Ось шаблон — **налаштуйте його відповідно до того, як ви насправді працюєте**:

```markdown
# Personal Coding Preferences

## Style
- I prefer functional programming patterns over class-based OOP
- Use TypeScript strict mode whenever possible
- Prefer named exports over default exports
- Use `const` by default, `let` only when reassignment is needed

## Commits
- Follow Conventional Commits format: type(scope): description
- Types: feat, fix, docs, style, refactor, test, chore, ci
- Keep subject line under 72 characters
- Write commit messages in imperative mood ("add feature" not "added feature")

## Communication
- Be concise in explanations — I prefer bullet points over paragraphs
- When showing code changes, always explain WHY not just WHAT
- If something could break production, flag it loudly

## Tools
- I use pnpm as my package manager
- My terminal is zsh with oh-my-zsh
- I use vim keybindings
```

> **Важливо**: Це ВАШ файл. Змініть його, щоб відображав ваші реальні вподобання. Використовуєте npm замість pnpm? Віддаєте перевагу класам? Любите розлогі пояснення? Зробіть його своїм. Весь сенс у тому, що Claude адаптується до вас, а не навпаки.

---

### Крок 2: Перегляд проєктного CLAUDE.md (~2 хв)

У Блоці 1, коли ми вперше досліджували ai-coderrank, проєктний `CLAUDE.md` вже був на місці. Давайте подивимося на нього знову свіжим поглядом, тепер розуміючи, що він робить.

```bash
cd ~/ai-coderrank
cat CLAUDE.md
```

Ви маєте побачити щось на кшталт:

```markdown
# CLAUDE.md

This is a Next.js 14 application that compares AI coding models.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts for data visualization
- pnpm as package manager

## Commands
- `pnpm dev` — start development server
- `pnpm build` — production build
- `pnpm test` — run tests
- `pnpm lint` — run ESLint

## Project Structure
- `src/app/` — Next.js app router pages and API routes
- `src/components/` — React components
- `src/lib/` — Utility functions and data
- `k8s/` — Kubernetes manifests
- `argocd/` — ArgoCD application config
```

Цей файл закомічений у git. Кожен розробник у команді (і кожна сесія Claude) бачить його. Уявіть це як "привіт, ось хто я" — вступне знайомство проєкту.

> **Для обговорення**: Чого не вистачає в цьому CLAUDE.md? Які конвенції ви б додали для своєї команди? Тримайте це на думці — ми до цього повернемося.

---

### Крок 3: Створення умовних правил для тестування (~4 хв)

А тепер найцікавіше. Створимо правила, що активуються лише коли Claude працює з тестовими файлами.

Створіть директорію для правил:

```bash
mkdir -p ~/ai-coderrank/.claude/rules
```

Створіть `.claude/rules/testing.md`:

```markdown
---
path: "**/*.test.*"
---

# Testing Conventions

## Framework
- We use Vitest as our test runner
- React components are tested with @testing-library/react
- API routes are tested with supertest

## Structure
- Test files live next to the code they test: `Component.tsx` -> `Component.test.tsx`
- Use `describe` blocks to group related tests
- Each `it` block should test exactly ONE behavior
- Name tests as sentences: `it('renders the model comparison chart with data')`

## Patterns
- Prefer `screen.getByRole()` over `getByTestId()` for accessibility
- Use `userEvent` over `fireEvent` for realistic user interactions
- Mock external APIs at the fetch level, not at the module level
- Always clean up: if you add to the DOM, make sure it's removed

## Coverage
- New features require tests — no exceptions
- Bug fixes require a regression test that would have caught the bug
- Minimum meaningful coverage, not chasing percentages

## Example Structure
```
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModelCard } from './ModelCard';

describe('ModelCard', () => {
  it('displays the model name and provider', () => {
    render(<ModelCard model={mockModel} />);
    expect(screen.getByRole('heading')).toHaveTextContent('GPT-4');
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
  });

  it('highlights the top-ranked model with a badge', () => {
    render(<ModelCard model={mockModel} rank={1} />);
    expect(screen.getByRole('status')).toHaveTextContent('#1');
  });
});
```text
```

> **Що щойно сталося?** Фронтматер `path: "**/*.test.*"` каже Claude: "Завантажуй ці інструкції лише коли задіяні тестові файли." Коли ви редагуєте Kubernetes-маніфест, цей файл не заважає. Коли торкаєтесь тесту? Він тут як тут.

---

### Крок 4: Створення умовних правил для Kubernetes (~4 хв)

Та сама концепція, але для K8s-маніфестів. Саме тут предметно-специфічні знання по-справжньому сяють.

Створіть `.claude/rules/k8s.md`:

```markdown
---
path: "k8s/**"
---

# Kubernetes Manifest Conventions

## Labels (Required on All Resources)
Every resource MUST include these labels:
```
metadata:
  labels:
    app.kubernetes.io/name: ai-coderrank
    app.kubernetes.io/component: <component>  # e.g., frontend, api, worker
    app.kubernetes.io/part-of: ai-coderrank
    app.kubernetes.io/managed-by: argocd
```text

## Resource Limits (Required on All Containers)
Never deploy a container without resource limits. Use these as starting points:
```
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```text

## Security
- Never run containers as root — always set `runAsNonRoot: true`
- Always set `readOnlyRootFilesystem: true` where possible
- Drop all capabilities, add back only what's needed:
```
securityContext:
  runAsNonRoot: true
  readOnlyRootFilesystem: true
  capabilities:
    drop: ["ALL"]
```text

## Images
- NEVER use the `latest` tag — always pin to a specific version
- Use the project's container registry: `ghcr.io/your-org/ai-coderrank`
- Multi-arch images preferred (amd64 + arm64)

## Naming
- Use kebab-case for resource names
- Prefix with `ai-coderrank-`: e.g., `ai-coderrank-deployment`, `ai-coderrank-service`
- Namespace: `ai-coderrank` (don't use `default`)

## Health Checks
Every Deployment must have:
- `livenessProbe` — is the process alive?
- `readinessProbe` — is it ready to receive traffic?
- `startupProbe` for containers with slow initialization
```

> **Це потужно.** Наступного разу, коли ви попросите Claude "додай новий Kubernetes deployment для Redis-кешу", він автоматично включить resource limits, security contexts, правильні лейбли та health checks — бо знає правила вашої команди.

---

### Крок 5: Створення CLAUDE.local.md (~3 хв)

Цей файл для речей, що справджуються на ВАШІЙ машині, але не повинні бути спільними. Локальні шляхи, персональні деталі середовища, staging URL.

Створіть `CLAUDE.local.md` в корені проєкту:

```markdown
# Local Environment — DO NOT COMMIT

## Environment
- Local K8s cluster: minikube (profile: ai-coderrank)
- Kubeconfig path: ~/.kube/config
- Docker daemon: Docker Desktop on macOS

## Local URLs
- App: http://localhost:3000
- K8s Dashboard: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

## Credentials (for local development only)
- GitHub Container Registry: Use `gh auth token` for authentication
- ArgoCD admin password: see `argocd admin initial-password -n argocd`

## Personal Preferences for This Project
- I'm currently focused on the dark theme feature (Block 4)
- My preferred branch naming: feature/<block-number>-<short-description>
- I review diffs before committing — always show me the diff first
```

Тепер перевірте, що він у gitignore:

```bash
cd ~/ai-coderrank
cat .gitignore | grep -i claude
```

Ви маєте побачити `CLAUDE.local.md` у gitignore. Якщо його там немає, додайте:

```bash
echo "CLAUDE.local.md" >> .gitignore
```

> **Чому це важливо**: CLAUDE.local.md — це місце, куди ви кладете речі, що стали б інцидентом безпеки, потрапивши на GitHub. Локальні креденшали, внутрішні URL, шляхи з вашим username. Він gitignored за замовчуванням у проєктах Claude Code, але завжди перевіряйте.

---

### Крок 6: Запуск `/memory` для повної картини (~2 хв)

Тепер подивимося на все, що Claude завантажив. Запустіть сесію Claude Code в проєкті ai-coderrank:

```bash
cd ~/ai-coderrank
claude
```

Усередині введіть:

```text
/memory
```

Claude покаже зведення всієї завантаженої пам'яті:
- Ваш користувацький `~/.claude/CLAUDE.md`
- Проєктний `CLAUDE.md`
- Ваш `CLAUDE.local.md`
- Всі файли `.claude/rules/` та їхні фільтри шляхів

Ви маєте побачити обидва правила — для тестування та K8s — у списку з їхніми умовами активації.

> **Спробуйте**: Запитайте Claude "What do you know about how we write tests in this project?" Він має послатися на ваші конвенції тестування з файлу правил — хоча ви їх ніколи не згадували в розмові.

---

### Крок 7: Автопам'ять — спостерігаємо, як Claude вчиться (~2 хв)

Це момент "ого". Навчимо Claude чомусь, виправивши його.

У вашій сесії Claude Code спробуйте:

```text
Show me how to run the linter for this project
```

Якщо Claude запропонує `npm run lint` або `yarn lint`, виправте:

```text
Actually, we use pnpm in this project. The command is pnpm lint.
```

Claude розпізнає це як конвенцію, яку можна вивчити, і може запропонувати запам'ятати її. Прийміть пропозицію.

Тепер **вийдіть із сесії та розпочніть нову**:

```text
/exit
claude
```

У новій сесії запитайте:

```text
How do I run the linter?
```

Claude тепер має відповісти `pnpm lint` без нагадувань — він навчився з вашого виправлення.

> **За кулісами**: Автопам'ять зберігає виправлення у пам'яті проєкту. З часом ці маленькі корекції накопичуються. Після кількох тижнів реального використання Claude знає ваш проєкт так само добре, як людина, що в команді кілька місяців.

---

### Чекпоінт

На цьому етапі у вас має бути:

| Файл | Розташування | Призначення |
|------|-------------|-------------|
| `~/.claude/CLAUDE.md` | Домашня директорія | Персональні вподобання для всіх проєктів |
| `CLAUDE.md` | Корінь проєкту | Стандарти команди (вже існував) |
| `CLAUDE.local.md` | Корінь проєкту | Локальне середовище, gitignored |
| `.claude/rules/testing.md` | `.claude/rules/` | Конвенції тестів (активується для тестових файлів) |
| `.claude/rules/k8s.md` | `.claude/rules/` | K8s-конвенції (активується для файлів k8s/) |

**П'ять файлів. Нуль повторень. Кожна сесія починається з повним контекстом.**

---

### Бонусне завдання

Створіть ще один файл правил: `.claude/rules/docker.md` з фільтром шляху для `Dockerfile*`. Включіть конвенції для:
- Multi-stage builds (окремі стадії builder та runtime)
- Non-root user у фінальному образі
- Порядок інструкцій `COPY` для оптимального кешування шарів (спочатку залежності, потім код)
- Використання `.dockerignore` для зменшення розміру образів

Потім попросіть Claude перевірити ваш існуючий Dockerfile проти цих нових правил. Подивіться, що він знайде.

---

> **Далі**: У Блоці 6 ми підемо ще далі. Якщо пам'ять — це те, що Claude _знає_, то навички — це те, що Claude може _робити_. Ви створите кастомні slash-команди, що перетворюють складні воркфлоу на однорядкові виклики.

---

<div class="cta-block">
  <p>Готові перевірити засвоєне?</p>
  <a href="{{ '/ua/course/block-05-memory/quiz/' | relative_url }}" class="hero-cta">Пройти квіз &rarr;</a>
</div>
