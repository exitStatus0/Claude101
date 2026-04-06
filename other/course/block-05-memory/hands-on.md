---
layout: block-part
title: "Память и интеллект проекта — Практика"
block_number: 5
part_name: "Hands-On"
locale: ru
translation_key: block-05-hands-on
overview_url: /other/course/block-05-memory/
presentation_url: /other/course/block-05-memory/presentation/
hands_on_url: /other/course/block-05-memory/hands-on/
permalink: /other/course/block-05-memory/hands-on/
---
> **Прямая речь:** "Всё на этой практической странице построено так, чтобы вы могли повторять за мной строка за строкой. Когда вы видите блок с командой или промптом, можете копировать его прямо в терминал или сессию Claude, если я явно не скажу, что это справочный материал. По ходу дела сравнивайте свой результат с моим на экране, чтобы ловить ошибки рано, а не копить их."

> **Продолжительность**: ~20 минут
> **Результат**: Полная система памяти для ai-coderrank — пользовательские предпочтения, условные правила для K8s и тестирования, конфигурация локального окружения и автоматически выученные соглашения.
> **Пререквизиты**: Пройдены Блоки 0-4 (Claude Code установлен, ai-coderrank запущен локально, тёмная тема реализована)

---

### Шаг 1: Создание пользовательского CLAUDE.md (~3 мин)

Этот файл живёт вне проектов — это ВАШИ предпочтения, применяемые повсюду.

Создайте директорию, если её ещё нет, затем создайте файл:

```bash
mkdir -p ~/.claude
```

Теперь создайте `~/.claude/CLAUDE.md` с вашими персональными предпочтениями. Вот шаблон — **адаптируйте его под свой реальный стиль работы**:

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

> **Важно**: Это ВАШ файл. Измените его, чтобы он отражал ваши реальные предпочтения. Используете npm вместо pnpm? Предпочитаете классы? Любите подробные объяснения? Сделайте его своим. Весь смысл в том, что Claude адаптируется к вам, а не наоборот.

---

### Шаг 2: Обзор проектного CLAUDE.md (~2 мин)

Ещё в Блоке 1, когда мы впервые исследовали ai-coderrank, проектный `CLAUDE.md` уже был на месте. Давайте посмотрим на него снова свежим взглядом, теперь зная, что он делает.

```bash
cd ~/ai-coderrank
cat CLAUDE.md
```

Вы должны увидеть что-то вроде:

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

Этот файл закоммичен в git. Каждый разработчик в команде (и каждая сессия Claude) его видит. Думайте о нём как о представлении проекта: "привет, вот кто я."

> **Вопрос для обсуждения**: Чего не хватает в этом CLAUDE.md? Какие соглашения вы бы добавили для вашей команды? Запомните это — мы вернёмся к этому.

---

### Шаг 3: Создание условных правил для тестирования (~4 мин)

Теперь самое интересное. Давайте создадим правила, которые активируются только когда Claude работает с тестовыми файлами.

Создайте директорию правил:

```bash
mkdir -p ~/ai-coderrank/.claude/rules
```

Создайте `.claude/rules/testing.md`:

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

> **Что произошло?** Фронтматтер `path: "**/*.test.*"` говорит Claude: "Загружай эти инструкции только когда затронуты тестовые файлы." Когда вы редактируете Kubernetes-манифест, этот файл не мешается. Когда трогаете тест? Он тут как тут.

---

### Шаг 4: Создание условных правил для Kubernetes (~4 мин)

Та же концепция, но для K8s-манифестов. Здесь доменно-специфичные знания по-настоящему раскрываются.

Создайте `.claude/rules/k8s.md`:

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

> **Это мощно.** В следующий раз, когда вы попросите Claude "добавить новый Kubernetes deployment для кэша Redis", он автоматически включит лимиты ресурсов, контексты безопасности, правильные лейблы и health checks — потому что знает правила вашей команды.

---

### Шаг 5: Создание CLAUDE.local.md (~3 мин)

Этот файл для вещей, которые верны на ВАШЕЙ машине, но не должны быть общими. Локальные пути, детали персонального окружения, URL staging-среды.

Создайте `CLAUDE.local.md` в корне проекта:

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

Теперь проверьте, что файл в gitignore:

```bash
cd ~/ai-coderrank
cat .gitignore | grep -i claude
```

Вы должны увидеть `CLAUDE.local.md` в gitignore. Если его нет, добавьте:

```bash
echo "CLAUDE.local.md" >> .gitignore
```

> **Почему это важно**: CLAUDE.local.md — место для вещей, утечка которых на GitHub была бы инцидентом безопасности. Локальные учётные данные, внутренние URL, пути с вашим именем пользователя. По умолчанию он в gitignore проектов Claude Code, но всегда перепроверяйте.

---

### Шаг 6: Запуск `/memory` для полной картины (~2 мин)

Теперь посмотрим всё, что Claude загрузил. Запустите сессию Claude Code в проекте ai-coderrank:

```bash
cd ~/ai-coderrank
claude
```

Внутри сессии введите:

```text
/memory
```

Claude покажет сводку всей загруженной памяти:
- Ваш пользовательский `~/.claude/CLAUDE.md`
- Проектный `CLAUDE.md`
- Ваш `CLAUDE.local.md`
- Все файлы `.claude/rules/` и их фильтры путей

Вы должны увидеть оба набора правил — для тестирования и для K8s — с условиями активации.

> **Попробуйте**: Спросите Claude "What do you know about how we write tests in this project?" Он должен сослаться на ваши соглашения по тестированию из файла правил — хотя вы никогда не упоминали их в разговоре.

---

### Шаг 7: Автоматическая память — наблюдайте, как Claude учится (~2 мин)

Это момент "ого". Давайте научим Claude чему-то, поправив его.

В сессии Claude Code попробуйте:

```text
Show me how to run the linter for this project
```

Если Claude предложит `npm run lint` или `yarn lint`, поправьте его:

```text
Actually, we use pnpm in this project. The command is pnpm lint.
```

Claude распознает это как запоминаемое соглашение и может предложить его запомнить. Примите предложение.

Теперь **выйдите из сессии и начните новую**:

```text
/exit
claude
```

В новой сессии спросите:

```text
How do I run the linter?
```

Claude теперь должен ответить `pnpm lint` без подсказок — он выучил из вашей поправки.

> **За кулисами**: Автоматическая память сохраняет поправки в памяти проекта. Со временем эти маленькие поправки накапливаются. После нескольких недель реального использования Claude знает ваш проект так же хорошо, как человек, проработавший в команде несколько месяцев.

---

### Контрольная точка

На данный момент у вас должно быть:

| Файл | Расположение | Назначение |
|------|-------------|-----------|
| `~/.claude/CLAUDE.md` | Домашняя директория | Личные предпочтения для всех проектов |
| `CLAUDE.md` | Корень проекта | Стандарты команды (уже существовал) |
| `CLAUDE.local.md` | Корень проекта | Локальное окружение, в gitignore |
| `.claude/rules/testing.md` | `.claude/rules/` | Соглашения по тестированию (активируется для тестовых файлов) |
| `.claude/rules/k8s.md` | `.claude/rules/` | Соглашения K8s (активируется для файлов k8s/) |

**Пять файлов. Ноль повторений. Каждая сессия начинается с полным контекстом.**

---

### Бонусное задание

Создайте ещё один файл правил: `.claude/rules/docker.md` с фильтром путей для `Dockerfile*`. Включите соглашения для:
- Multi-stage сборок (отдельные этапы builder и runtime)
- Непривилегированного пользователя в финальном образе
- Порядка инструкций `COPY` для оптимального кэширования слоёв (зависимости сначала, код потом)
- Использования `.dockerignore` для минимизации размера образов

Затем попросите Claude проверить ваш существующий Dockerfile на соответствие этим новым правилам. Посмотрите, что он найдёт.

---

> **Далее**: В Блоке 6 мы продвинем эту концепцию ещё дальше. Если память — это то, что Claude *знает*, то навыки — это то, что Claude *умеет делать*. Вы создадите пользовательские слэш-команды, которые превращают сложные рабочие процессы в однострочники.
