---
layout: resource
title: "Вирішення проблем"
purpose: "Знайдіть свою помилку та виправте — швидко."
verified: "2026-04-06"
locale: uk
translation_key: troubleshooting
permalink: /ua/resources/troubleshooting/
---

## Швидка діагностика

Оберіть область проблеми:

<div class="card-grid">
  <a href="#claude-code-issues" class="quick-card">Проблеми з Claude Code</a>
  <a href="#mcp-issues" class="quick-card">Проблеми з MCP</a>
  <a href="#hook-issues" class="quick-card">Проблеми з хуками</a>
  <a href="#infra-issues" class="quick-card">k3s / Інфраструктура</a>
  <a href="#public-access-issues" class="quick-card">Публічний доступ</a>
  <a href="#argocd-issues" class="quick-card">Проблеми з ArgoCD</a>
  <a href="#github-actions-issues" class="quick-card">Проблеми з GitHub Actions</a>
</div>

---

## Почніть тут

<div class="callout-daily" markdown="1">

Перш ніж заглиблюватись у конкретні проблеми, спробуйте ці п'ять універсальних перевірок:

1. **Оновіть Claude** — застарілі версії спричиняють більшість дивних помилок.
   ```bash
   claude update
   ```
2. **Перезапустіть сесію** — закрийте термінал і знову запустіть `claude`. Нова сесія очищує тимчасовий стан.
3. **Перевірте verbose-режим** — натисніть `Ctrl+O`, щоб побачити, що Claude робить під капотом.
4. **Перевірте розташування конфігурацій** — налаштування проєкту знаходяться в `.claude/settings.json`; MCP-конфігурація — в `.mcp.json` (проєкт) або `~/.claude.json` (користувач).
5. **Запитайте Claude, вставивши помилку** — часто найшвидший шлях:
   ```
   "I'm getting this error: <paste>"
   ```

</div>

---

## Проблеми з Claude Code {#claude-code-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Сесія зависає / немає відповіді</h3>
<p><strong>Перевірте:</strong> Чи крутиться спінер? Натисніть <code>Ctrl+C</code> для переривання.</p>
<p><strong>Ймовірна причина:</strong> Тривалий виклик інструмента перевищив таймаут, або збій мережі призупинив з'єднання.</p>
<p><strong>Рішення:</strong></p>

```bash
Ctrl+C        # перервати поточний хід
/clear        # скинути стан сесії
```

Якщо все ще зависає, закрийте термінал повністю і запустіть `claude` у новому вікні.

<p><strong>Ознака успіху:</strong> Claude відповідає на ваш наступний промпт протягом кількох секунд.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Відмова в доступі на кожну команду</h3>
<p><strong>Перевірте:</strong> В якому режимі дозволів ви працюєте?</p>
<p><strong>Ймовірна причина:</strong> Режим за замовчуванням вимагає підтвердження для кожного виклику інструмента.</p>
<p><strong>Рішення:</strong> Натисніть <code>Shift+Tab</code> для переключення режимів дозволів, або запустіть з більш дозвільним режимом:</p>

```bash
claude --permission-mode acceptEdits
```

Також можна натиснути `a` під час промпта, щоб дозволити інструмент на решту сесії.

<p><strong>Ознака успіху:</strong> Команди виконуються без повторних запитів підтвердження.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>CLAUDE.md не завантажується</h3>
<p><strong>Перевірте:</strong> Запустіть <code>/memory</code> всередині сесії, щоб побачити, які файли завантажені.</p>
<p><strong>Ймовірна причина:</strong> Файл у неправильній директорії або має зламане посилання <code>@path</code>.</p>
<p><strong>Рішення:</strong> Переконайтесь, що файл знаходиться за шляхом <code>./CLAUDE.md</code> або <code>./.claude/CLAUDE.md</code> відносно місця запуску Claude. Виправте будь-які посилання <code>@path</code>, щоб вони коректно розв'язувались.</p>
<p><strong>Ознака успіху:</strong> <code>/memory</code> показує вміст вашого CLAUDE.md.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Навички не відображаються</h3>
<p><strong>Перевірте:</strong> Переконайтесь, що файл навички існує за очікуваним шляхом.</p>
<p><strong>Ймовірна причина:</strong> Файл SKILL.md розміщений неправильно або структура директорій хибна.</p>
<p><strong>Рішення:</strong> Навички повинні знаходитись за одним із цих шляхів:</p>

```
Project: .claude/skills/<skill-name>/SKILL.md
User:    ~/.claude/skills/<skill-name>/SKILL.md
```

Після виправлення запустіть нову сесію — навички завантажуються при старті.

<p><strong>Ознака успіху:</strong> Навичка з'являється, коли Claude перелічує доступні можливості.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Авто-пам'ять не працює</h3>
<p><strong>Перевірте:</strong> Підтвердіть вашу версію та налаштування.</p>
<p><strong>Ймовірна причина:</strong> Застаріла версія Claude Code або функція вимкнена в налаштуваннях.</p>
<p><strong>Рішення:</strong></p>

```bash
claude --version   # потрібна v2.1.59+
claude update
```

Потім переконайтесь, що `~/.claude/settings.json` містить:

```json
{ "autoMemoryEnabled": true }
```

<p><strong>Ознака успіху:</strong> Claude проактивно зберігає факти між сесіями.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Контекст стає занадто довгим</h3>
<p><strong>Перевірте:</strong> Чи забуває Claude попередні інструкції або повторюється?</p>
<p><strong>Ймовірна причина:</strong> Розмова перевищила ефективне вікно контексту.</p>
<p><strong>Рішення:</strong> Стискайте розмову проактивно — не чекайте, поки Claude почне забувати.</p>

```bash
/compact
```

<p><strong>Ознака успіху:</strong> Claude відповідає зв'язно, пам'ятаючи попередній контекст.</p>
</div>

---

## Проблеми з MCP {#mcp-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>MCP-сервер не підключається</h3>
<p><strong>Перевірте:</strong> Чи конфігурація у правильному файлі? Рівень проєкту: <code>.mcp.json</code>. Рівень користувача: <code>~/.claude.json</code>.</p>
<p><strong>Ймовірна причина:</strong> Відсутні змінні середовища, неправильний шлях до команди сервера, або серверний бінарник не встановлений.</p>
<p><strong>Рішення:</strong> Перевірте, що команда сервера існує, встановіть необхідні змінні середовища (напр. <code>GITHUB_TOKEN</code>), потім перезапустіть сесію Claude — MCP-конфігурація зчитується тільки при старті.</p>
<p><strong>Ознака успіху:</strong> Claude показує MCP-інструменти у своїх можливостях при старті сесії.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>MCP-інструменти не з'являються</h3>
<p><strong>Перевірте:</strong> Натисніть <code>Ctrl+O</code> для увімкнення verbose-режиму та шукайте повідомлення MCP handshake.</p>
<p><strong>Ймовірна причина:</strong> Сервер запустився, але реєстрація інструментів не вдалась — зазвичай невідповідність схеми або збій сервера під час ініціалізації.</p>
<p><strong>Рішення:</strong> Запустіть команду MCP-сервера вручну в терміналі, щоб побачити вивід помилок. Виправте проблеми, потім перезапустіть сесію Claude.</p>
<p><strong>Ознака успіху:</strong> Інструменти з цього MCP-сервера з'являються і доступні для виклику.</p>
</div>

---

## Проблеми з хуками {#hook-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Хуки не спрацьовують</h3>
<p><strong>Перевірте:</strong> Увімкніть verbose-режим через <code>Ctrl+O</code>, щоб побачити виконання хуків.</p>
<p><strong>Ймовірна причина:</strong> Неправильний регістр назви події, matcher не збігається, або скрипт не виконуваний.</p>
<p><strong>Рішення:</strong></p>

```bash
# Валідувати JSON налаштувань
claude -p "validate the JSON in .claude/settings.json"

# Переконатись, що скрипт хука виконуваний
chmod +x .claude/hooks/your-hook.sh
```

<div class="callout-important" markdown="1">
Назви подій у PascalCase: <code>PreToolUse</code>, не <code>preToolUse</code>. Коди виходу важливі: 0 = дозволити, 2 = заблокувати.
</div>

<p><strong>Ознака успіху:</strong> Verbose-режим показує виконання хука на очікуваній події.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Хук блокує неочікувано</h3>
<p><strong>Перевірте:</strong> Який виклик інструмента блокується? Verbose-режим (<code>Ctrl+O</code>) показує назву хука та код виходу.</p>
<p><strong>Ймовірна причина:</strong> Matcher занадто широкий або скрипт хука повертає код виходу 2 для шляху, який ви не мали наміру блокувати.</p>
<p><strong>Рішення:</strong> Звузьте патерн matcher в <code>.claude/settings.json</code>, щоб він цілив тільки на потрібний інструмент. Протестуйте, запустивши скрипт хука вручну з тестовим вводом.</p>
<p><strong>Ознака успіху:</strong> Виклик інструмента проходить без блокування.</p>
</div>

---

## Проблеми з інфраструктурою {#infra-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Не вдається підключитись до дроплета через SSH</h3>
<p><strong>Перевірте:</strong> Запустіть SSH з verbose-виводом, щоб побачити, де відбувається збій.</p>
<p><strong>Ймовірна причина:</strong> Неправильна IP-адреса, SSH-ключ не додано при створенні дроплета, або файрвол блокує порт 22.</p>
<p><strong>Рішення:</strong></p>

```bash
ssh -v root@<droplet-ip>
```

Перевірте IP у консолі DigitalOcean. Якщо ключ відсутній, додайте його через панель DO та перестворіть дроплет.

<p><strong>Ознака успіху:</strong> Ви отримуєте root shell на дроплеті.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>k3s не запускається</h3>
<p><strong>Перевірте:</strong> Подивіться статус сервісу та логи.</p>
<p><strong>Ймовірна причина:</strong> Недостатньо RAM (потрібно мінімум 2 ГБ), порт 6443 вже зайнятий, або правила файрвола блокують потрібні порти.</p>
<p><strong>Рішення:</strong></p>

```bash
sudo systemctl status k3s
sudo journalctl -u k3s -f
```

<p><strong>Ознака успіху:</strong> <code>systemctl status k3s</code> показує <code>active (running)</code>.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>kubectl — відмовлено у з'єднанні</h3>
<p><strong>Перевірте:</strong> Чи використовуєте ви правильний kubeconfig?</p>
<p><strong>Ймовірна причина:</strong> k3s використовує власний шлях kubeconfig, а не стандартний <code>~/.kube/config</code>.</p>
<p><strong>Рішення:</strong></p>

```bash
# На дроплеті
sudo kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml get nodes
```

Для локального доступу скопіюйте kubeconfig та замініть `127.0.0.1` на публічну IP-адресу вашого дроплета.

<p><strong>Ознака успіху:</strong> <code>kubectl get nodes</code> повертає ваш вузол у стані <code>Ready</code>.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Поди застрягли в ImagePullBackOff</h3>
<p><strong>Перевірте:</strong> Опишіть под, щоб побачити помилку завантаження.</p>
<p><strong>Ймовірна причина:</strong> Образ не існує, тег неправильний, або Docker Hub обмежує швидкість запитів.</p>
<p><strong>Рішення:</strong></p>

```bash
kubectl describe pod <pod-name> -n ai-coderrank
```

Перевірте назву образу та тег. У разі обмеження швидкості перейдіть на `ghcr.io`.

<p><strong>Ознака успіху:</strong> Под переходить у стан <code>Running</code>.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Поди застрягли в CrashLoopBackOff</h3>
<p><strong>Перевірте:</strong> Прочитайте логи з попереднього зламаного контейнера.</p>
<p><strong>Ймовірна причина:</strong> Застосунок падає при старті — відсутня змінна середовища, відсутній ConfigMap/Secret, або невідповідність порту.</p>
<p><strong>Рішення:</strong></p>

```bash
kubectl logs <pod-name> -n ai-coderrank --previous
```

<p><strong>Ознака успіху:</strong> Под залишається у стані <code>Running</code> після виправлення конфігурації.</p>
</div>

---

## Проблеми з публічним доступом {#public-access-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Застосунок недоступний за публічною IP (NodePort 30080)</h3>
<p><strong>Перевірте:</strong> Підтвердіть тип сервісу та доступність порту.</p>
<p><strong>Ймовірна причина:</strong> Сервіс не є NodePort, порт не 30080, або файрвол DigitalOcean його блокує.</p>
<p><strong>Рішення:</strong></p>

```bash
# Перевірте, що сервіс є NodePort на 30080
kubectl get svc -n ai-coderrank

# Спочатку протестуйте локально на дроплеті
curl http://localhost:30080
```

Якщо локальний curl працює, а зовнішній ні, відкрийте порт 30080 у файрволі DigitalOcean: **DO Console > Networking > Firewalls**.

<div class="callout-important" markdown="1">
Цей курс використовує NodePort 30080 для публічного доступу, а не Ingress. Переконайтесь, що ваш Service spec має <code>type: NodePort</code> та <code>nodePort: 30080</code>.
</div>

<p><strong>Ознака успіху:</strong> <code>curl http://&lt;droplet-ip&gt;:30080</code> повертає відповідь вашого застосунку.</p>
</div>

---

## Проблеми з ArgoCD {#argocd-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>UI ArgoCD недоступний</h3>
<p><strong>Перевірте:</strong> Чи працює port-forward?</p>
<p><strong>Ймовірна причина:</strong> Немає активного port-forward, або под ArgoCD-сервера не запущений.</p>
<p><strong>Рішення:</strong></p>

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Отримайте пароль адміністратора:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

<p><strong>Ознака успіху:</strong> Браузер завантажує панель ArgoCD за адресою <code>https://localhost:8080</code>.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>ArgoCD не синхронізується</h3>
<p><strong>Перевірте:</strong> Подивіться статус застосунку.</p>
<p><strong>Ймовірна причина:</strong> Помилка в URL репозиторію, неправильна назва гілки, або шлях не відповідає структурі директорій.</p>
<p><strong>Рішення:</strong></p>

```bash
kubectl get app -n argocd
```

Примусова синхронізація, якщо застосунок існує, але застряг:

```bash
kubectl patch app ai-coderrank -n argocd \
  --type merge -p '{"operation":{"sync":{}}}'
```

<p><strong>Ознака успіху:</strong> Статус застосунку показує <code>Synced</code> та <code>Healthy</code>.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>ArgoCD показує Degraded health</h3>
<p><strong>Перевірте:</strong> Визначте, який ресурс нездоровий.</p>
<p><strong>Ймовірна причина:</strong> Под, керований ArgoCD, не працює — зазвичай це CrashLoopBackOff під капотом.</p>
<p><strong>Рішення:</strong></p>

```bash
kubectl get app ai-coderrank -n argocd -o yaml | grep -A 20 health
kubectl logs -n ai-coderrank -l app=ai-coderrank --tail=50
```

Виправте основну проблему пода (див. [Проблеми з інфраструктурою](#infra-issues)) і ArgoCD автоматично виявить відновлення.

<p><strong>Ознака успіху:</strong> Здоров'я застосунку повертається до <code>Healthy</code>.</p>
</div>

---

## Проблеми з GitHub Actions {#github-actions-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Claude Action не запускається</h3>
<p><strong>Перевірте:</strong> Чи файл workflow присутній і тригер правильний?</p>
<p><strong>Ймовірна причина:</strong> Файл workflow не в <code>.github/workflows/</code>, подія тригера не збігається, умова <code>if</code> фільтрує його, або секрет <code>ANTHROPIC_API_KEY</code> відсутній.</p>
<p><strong>Рішення:</strong> Перевірте всі п'ять пунктів:</p>

1. Файл workflow знаходиться в `.github/workflows/`
2. Подія тригера збігається (`issue_comment`, `pull_request_review_comment`)
3. Умова `if` відповідає вашому патерну коментаря
4. `ANTHROPIC_API_KEY` встановлено в Settings > Secrets репозиторію
5. Дозволи GitHub App налаштовані

<p><strong>Ознака успіху:</strong> Вкладка Actions показує новий запуск після публікації відповідного коментаря.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Action запускається, але немає виводу</h3>
<p><strong>Перевірте:</strong> Відкрийте лог запуску у вкладці GitHub Actions.</p>
<p><strong>Ймовірна причина:</strong> API ключ недійсний/прострочений, обмеження швидкості, <code>max_turns</code> встановлено занадто низько, або CLAUDE.md має занадто обмежувальні інструкції.</p>
<p><strong>Рішення:</strong></p>

- Перевірте статус API ключа та помилки обмеження швидкості на панелі Anthropic
- Збільште `max_turns`, якщо workflow завершується занадто рано
- Перегляньте лог workflow для підтвердження, що Claude дійсно отримав payload тригера
- Тимчасово спростіть обмежувальні інструкції `CLAUDE.md`, якщо агент блокується політикою

<p><strong>Ознака успіху:</strong> Лог запуску action показує відповідь Claude, і вона публікується в PR/issue.</p>
</div>

---

## Що вставити в Claude

Коли ви застрягли, дайте Claude структурований контекст. Скопіюйте цей шаблон:

```
I'm working on the Claude Code 101 course. I hit this issue:

**Block**: [який блок]
**Step**: [який крок]
**Error**: [вставте помилку]
**What I tried**: [що ви вже спробували]

Help me diagnose and fix this.
```

Чим точніше ви вкажете блок, крок та точний текст помилки, тим швидше Claude зможе допомогти.

Якщо ви постійно застрягаєте, <a href="{{ '/ua/mentoring/' | relative_url }}">менторинг</a> може бути швидшим за самостійне налагодження.
