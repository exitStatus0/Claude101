---
layout: block-part
title: "GitHub Actions та CI/CD"
block_number: 10
description: "Нотатки до презентації та структура виступу для Блоку 10."
part_name: "Presentation"
overview_url: /ua/course/block-10-github-actions/
presentation_url: /ua/course/block-10-github-actions/presentation/
hands_on_url: /ua/course/block-10-github-actions/hands-on/
quiz_url: /ua/course/block-10-github-actions/quiz/
permalink: /ua/course/block-10-github-actions/presentation/
locale: uk
translation_key: block-10-presentation
---
> **Тривалість**: ~10 хвилин
> **Мета**: Студенти розуміють, як Claude Code працює всередині GitHub Actions, що робить офіційний action та чому AI-рев'ю, інтегроване в CI, є революцією для командних воркфлоу.

---

### Слайд 1: Claude Code — це не просто CLI

Ось щось, що дивує більшість людей, коли вони вперше це чують:

Claude Code — це не просто термінальний застосунок. Це ще й GitHub Action. Той самий Claude, що читає вашу кодову базу, пише код і запускає тести на вашому ноутбуці, може робити все це всередині GitHub Actions runner, тригерячись на події як-от коментарі до PR, мітки issues чи пуші.

```
Ваш термінал:        claude "review this file"
GitHub Actions:      @claude please review this PR
```

Той самий двигун. Ті ж правила CLAUDE.md. Те ж розуміння кодової бази. Але тепер це автоматизовано і працює на кожному pull request без необхідності комусь пам'ятати про виклик.

Офіційний action — `anthropics/claude-code-action@v1`, підтримується Anthropic. Це не community-хак і не обгортка — це справжня річ.

---

### Слайд 2: Два шляхи налаштування

Є два шляхи додати Claude у ваші GitHub-воркфлоу:

**Шлях 1: GitHub App (рекомендований)**

```
/install-github-app
```

Запустіть цю команду всередині Claude Code, і він проведе вас через встановлення офіційного Claude Code GitHub App на ваш репозиторій. Застосунок обробляє автентифікацію, дозволи та конфігурацію вебхуків. Це найшвидший шлях від нуля до "Claude рев'юїть мої PR."

**Шлях 2: API-ключ + ручний воркфлоу**

Якщо ви хочете більше контролю (або ваша організація має політики щодо GitHub Apps):
1. Збережіть Anthropic API-ключ як GitHub Actions secret (`ANTHROPIC_API_KEY`)
2. Створіть YAML-файл воркфлоу вручну
3. Налаштуйте тригерні події самостійно

Обидва шляхи ведуть до одного результату: Claude працює у вашому CI-пайплайні. GitHub App просто приведе вас туди швидше.

> **Що обрати?** Для персональних репо та невеликих команд GitHub App ідеальний. Для enterprise-середовищ із суворими політиками встановлення застосунків використовуйте підхід з API-ключем. Ми зробимо обидва на практиці.

---

### Слайд 3: Тригер `@claude`

Після підключення Claude до репо модель взаємодії неймовірно проста:

**У Pull Request:**
```
@claude please review this PR, focusing on security and performance
```

**В Issue:**
```
@claude implement this feature and create a PR
```

**У коментарі рев'ю PR (до конкретного рядка):**
```
@claude this function looks like it could have a race condition. Can you check?
```

Claude бачить повний контекст — diff, файли, історію розмови — і відповідає коментарем на PR або issue. Інші члени команди бачать відповідь Claude, можуть відповісти, поставити додаткові питання та ітерувати.

Це як мати члена команди, який:
- Відповідає за хвилини, а не години
- Ніколи не каже "подивлюся пізніше"
- Прочитав кожен файл у репо перед рев'ю
- Послідовно дотримується ваших CLAUDE.md-гайдлайнів

---

### Слайд 4: YAML воркфлоу

Ось як виглядає файл воркфлоу на практиці:

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

Розберемо:

- **Тригери**: Воркфлоу спрацьовує на коментарі до issues, коментарі рев'ю PR та нові issues
- **Умова**: Блок `if` перевіряє, що коментар або тіло issue дійсно містить `@claude` — ми не хочемо, щоб кожен коментар тригерив запуск
- **Дозволи**: Claude потрібен write-доступ для пушу комітів, коментування PR та оновлення issues
- **Action**: `anthropics/claude-code-action@v1` робить основну роботу
- **`max_turns`**: Це ваш регулятор вартості — обмежує кількість ітерацій Claude

---

### Слайд 5: CLAUDE.md у CI — ваші правила все ще діють

Ось важливий момент: коли Claude працює в GitHub Actions, він читає ваш файл `CLAUDE.md`. Ті ж правила, конвенції та гайдлайни, які ви встановили у Блоці 5, діють і в CI.

Це означає, що ви можете додати CI-специфічні гайдлайни:

```markdown
# CI Review Standards

When reviewing PRs in CI:
- Always check that new functions have corresponding tests
- Flag any TODO or FIXME comments in new code
- Verify that database migrations have a rollback step
- Check that environment variables are documented in .env.example
- Ensure error messages are user-friendly, not stack traces
```

Claude у CI не діє самовільно. Він слідує тому ж плейбуку, що визначила ваша команда. Якщо ваш CLAUDE.md каже "завжди використовувати conventional commits", пропозиції Claude для PR будуть використовувати conventional commits. Якщо він каже "ніколи не схвалювати PR, що зменшують тестове покриття", Claude зазначить падіння покриття.

Це гарантія послідовності, яка робить CI-рев'ю надійним. Це не випадковий незнайомець зі своїми думками рев'юїть ваш код — це _ваші_ правила, застосовані автоматично.

---

### Слайд 6: Контроль витрат — передбачуваний рахунок

Запуск AI у CI означає запуск AI на кожному PR, кожному коментарі, кожному issue. Це може накопичуватися. Ось ваші важелі:

**`max_turns`** — найважливіший.

```yaml
with:
  max_turns: 10    # Claude може зробити максимум 10 дій
```

Просте рев'ю PR може зайняти 3-5 ітерацій (прочитати diff, прочитати пов'язані файли, написати рев'ю). Складна імплементація з issue може зайняти 15-20. Встановлюйте на основі вашого комфорту.

**Фільтрація тригерів** — не кожен коментар потребує Claude.

Тригер `@claude` означає, що Claude працює лише коли його явно викликають. Жодних випадкових тригерів, жодних марних запусків.

**Обмеження гілок** — запуск лише на певних гілках.

```yaml
if: github.event.pull_request.base.ref == 'main'
```

Рев'юїти лише PR, що цілять у main, а не кожен merge feature-в-feature гілку.

**Контроль паралельності** — запобігання паралельних запусків.

```yaml
concurrency:
{% raw %}
  group: claude-${{ github.event.pull_request.number || github.event.issue.number }}
{% endraw %}
  cancel-in-progress: true
```

Якщо хтось надішле три повідомлення `@claude` поспіль, запуститься тільки останнє.

> **Реальний бенчмарк**: Типове рев'ю PR коштує кілька центів. Навіть активні репо з 20-30 PR на день зазвичай мають місячні витрати на Claude CI менші, ніж ви б витратили на один командний обід.

---

### Ключові висновки

| Концепція | Що це | Чому це важливо |
|---------|-----------|----------------|
| `claude-code-action@v1` | Офіційний GitHub Action від Anthropic | Запускає Claude у CI з повним доступом до кодової бази |
| `/install-github-app` | Налаштування однією командою | Найшвидший шлях до CI-інтеграції |
| Тригер `@claude` | Виклик через згадку | Claude працює лише коли ви просите |
| CLAUDE.md у CI | Ваші правила, застосовані автоматично | Послідовні рев'ю за командними стандартами |
| `max_turns` | Регулятор вартості | Обмежує обсяг роботи Claude за один виклик |
| Issue-to-PR | Створення PR з issues | Опишіть що потрібно, Claude імплементує |

---

<div class="cta-block">
  <p>Готові перевірити свої знання?</p>
  <a href="{{ '/ua/course/block-10-github-actions/quiz/' | relative_url }}" class="hero-cta">Пройти тест &rarr;</a>
</div>
