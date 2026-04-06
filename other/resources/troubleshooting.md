---
layout: resource
title: "Решение проблем"
purpose: "Найдите свою ошибку и исправьте — быстро."
verified: "2026-04-06"
locale: ru
translation_key: troubleshooting
permalink: /other/resources/troubleshooting/
---

## Быстрая сортировка

Выберите область проблемы:

<div class="card-grid">
  <a href="#claude-code-issues" class="quick-card">Проблемы Claude Code</a>
  <a href="#mcp-issues" class="quick-card">Проблемы MCP</a>
  <a href="#hook-issues" class="quick-card">Проблемы хуков</a>
  <a href="#infra-issues" class="quick-card">Проблемы k3s / Инфраструктуры</a>
  <a href="#public-access-issues" class="quick-card">Проблемы публичного доступа</a>
  <a href="#argocd-issues" class="quick-card">Проблемы ArgoCD</a>
  <a href="#github-actions-issues" class="quick-card">Проблемы GitHub Actions</a>
</div>

---

## Начните здесь

<div class="callout-daily" markdown="1">

Прежде чем разбираться с конкретными проблемами, попробуйте эти пять универсальных проверок:

1. **Обновите Claude** — устаревшие версии вызывают большинство странных ошибок.
   ```bash
   claude update
   ```
2. **Перезапустите сессию** — закройте терминал и запустите `claude` снова. Новая сессия сбрасывает временное состояние.
3. **Включите подробный режим** — нажмите `Ctrl+O`, чтобы увидеть, что Claude делает под капотом.
4. **Проверьте расположение конфигов** — настройки проекта находятся в `.claude/settings.json`; конфигурация MCP — в `.mcp.json` (проект) или `~/.claude.json` (пользователь).
5. **Спросите Claude, вставив ошибку** — часто самый быстрый путь:
   ```
   "I'm getting this error: <paste>"
   ```

</div>

---

## Проблемы Claude Code {#claude-code-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Сессия зависает / нет ответа</h3>
<p><strong>Проверка:</strong> Вращается ли индикатор? Нажмите <code>Ctrl+C</code> для прерывания.</p>
<p><strong>Вероятная причина:</strong> Долгий вызов инструмента завершился по таймауту, или сетевой сбой остановил соединение.</p>
<p><strong>Решение:</strong></p>

```bash
Ctrl+C        # прервать текущий ход
/clear        # сбросить состояние сессии
```

Если всё ещё зависает, полностью закройте терминал и запустите `claude` в новом окне.

<p><strong>Признак успеха:</strong> Claude отвечает на следующий промпт в течение нескольких секунд.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Отказ в доступе на каждую команду</h3>
<p><strong>Проверка:</strong> В каком режиме разрешений вы работаете?</p>
<p><strong>Вероятная причина:</strong> Режим по умолчанию требует подтверждения для каждого вызова инструмента.</p>
<p><strong>Решение:</strong> Нажмите <code>Shift+Tab</code> для переключения режимов разрешений, или запустите с более разрешающим режимом:</p>

```bash
claude --permission-mode acceptEdits
```

Также можно нажать `a` во время промпта, чтобы разрешить инструмент до конца сессии.

<p><strong>Признак успеха:</strong> Команды выполняются без повторных запросов подтверждения.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>CLAUDE.md не загружается</h3>
<p><strong>Проверка:</strong> Выполните <code>/memory</code> в сессии, чтобы увидеть какие файлы загружены.</p>
<p><strong>Вероятная причина:</strong> Файл находится в неправильной директории или содержит битую ссылку <code>@path</code>.</p>
<p><strong>Решение:</strong> Убедитесь, что файл расположен по пути <code>./CLAUDE.md</code> или <code>./.claude/CLAUDE.md</code> относительно места запуска Claude. Исправьте все ссылки <code>@path</code>, чтобы они корректно разрешались.</p>
<p><strong>Признак успеха:</strong> <code>/memory</code> отображает содержимое вашего CLAUDE.md.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Навыки не отображаются</h3>
<p><strong>Проверка:</strong> Убедитесь, что файл навыка существует по ожидаемому пути.</p>
<p><strong>Вероятная причина:</strong> Файл SKILL.md расположен неправильно или структура директорий нарушена.</p>
<p><strong>Решение:</strong> Навыки должны находиться по одному из путей:</p>

```
Project: .claude/skills/<skill-name>/SKILL.md
User:    ~/.claude/skills/<skill-name>/SKILL.md
```

После исправления начните новую сессию — навыки загружаются при запуске.

<p><strong>Признак успеха:</strong> Навык появляется, когда Claude перечисляет доступные возможности.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Авто-память не работает</h3>
<p><strong>Проверка:</strong> Подтвердите версию и настройки.</p>
<p><strong>Вероятная причина:</strong> Устаревшая версия Claude Code или функция отключена в настройках.</p>
<p><strong>Решение:</strong></p>

```bash
claude --version   # нужна v2.1.59+
claude update
```

Затем проверьте, что `~/.claude/settings.json` содержит:

```json
{ "autoMemoryEnabled": true }
```

<p><strong>Признак успеха:</strong> Claude проактивно сохраняет факты между сессиями.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Контекст становится слишком длинным</h3>
<p><strong>Проверка:</strong> Claude забывает ранние инструкции или повторяется?</p>
<p><strong>Вероятная причина:</strong> Разговор превысил эффективное контекстное окно.</p>
<p><strong>Решение:</strong> Сжимайте разговор заблаговременно — не ждите, пока Claude начнёт забывать.</p>

```bash
/compact
```

<p><strong>Признак успеха:</strong> Claude отвечает связно, помня о предыдущем контексте.</p>
</div>

---

## Проблемы MCP {#mcp-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>MCP-сервер не подключается</h3>
<p><strong>Проверка:</strong> Конфиг в правильном файле? Уровень проекта: <code>.mcp.json</code>. Уровень пользователя: <code>~/.claude.json</code>.</p>
<p><strong>Вероятная причина:</strong> Отсутствуют переменные окружения, неверный путь к команде сервера или бинарник сервера не установлен.</p>
<p><strong>Решение:</strong> Проверьте, что команда сервера существует, установите необходимые переменные окружения (например, <code>GITHUB_TOKEN</code>), затем перезапустите сессию Claude — конфигурация MCP читается только при запуске.</p>
<p><strong>Признак успеха:</strong> Claude показывает инструменты MCP в своих возможностях при старте сессии.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Инструменты MCP не появляются</h3>
<p><strong>Проверка:</strong> Нажмите <code>Ctrl+O</code> для включения подробного режима и найдите сообщения о рукопожатии MCP.</p>
<p><strong>Вероятная причина:</strong> Сервер запустился, но регистрация инструментов не удалась — обычно несовпадение схемы или падение сервера при инициализации.</p>
<p><strong>Решение:</strong> Запустите команду MCP-сервера вручную в терминале, чтобы увидеть вывод ошибок. Исправьте проблемы и перезапустите сессию Claude.</p>
<p><strong>Признак успеха:</strong> Инструменты этого MCP-сервера появляются и доступны для вызова.</p>
</div>

---

## Проблемы хуков {#hook-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Хуки не срабатывают</h3>
<p><strong>Проверка:</strong> Включите подробный режим через <code>Ctrl+O</code>, чтобы видеть выполнение хуков.</p>
<p><strong>Вероятная причина:</strong> Неправильный регистр имени события, матчер не совпадает или скрипт не имеет прав на выполнение.</p>
<p><strong>Решение:</strong></p>

```bash
# Проверить JSON настроек
claude -p "validate the JSON in .claude/settings.json"

# Убедиться, что скрипт хука исполняемый
chmod +x .claude/hooks/your-hook.sh
```

<div class="callout-important" markdown="1">
Имена событий в PascalCase: <code>PreToolUse</code>, а не <code>preToolUse</code>. Коды выхода важны: 0 = разрешить, 2 = заблокировать.
</div>

<p><strong>Признак успеха:</strong> Подробный режим показывает выполнение хука на ожидаемом событии.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Хук блокирует неожиданно</h3>
<p><strong>Проверка:</strong> Какой вызов инструмента блокируется? Подробный режим (<code>Ctrl+O</code>) показывает имя хука и код выхода.</p>
<p><strong>Вероятная причина:</strong> Матчер слишком широкий или скрипт хука возвращает код выхода 2 на пути, который вы не собирались блокировать.</p>
<p><strong>Решение:</strong> Сузьте шаблон матчера в <code>.claude/settings.json</code>, чтобы он был нацелен только на нужный инструмент. Протестируйте, запустив скрипт хука вручную с тестовыми данными.</p>
<p><strong>Признак успеха:</strong> Вызов инструмента проходит без блокировки.</p>
</div>

---

## Проблемы инфраструктуры {#infra-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Не удаётся подключиться к дроплету по SSH</h3>
<p><strong>Проверка:</strong> Запустите SSH с подробным выводом, чтобы увидеть, где происходит сбой.</p>
<p><strong>Вероятная причина:</strong> Неверный IP, SSH-ключ не добавлен при создании дроплета или файрвол блокирует порт 22.</p>
<p><strong>Решение:</strong></p>

```bash
ssh -v root@<droplet-ip>
```

Проверьте IP в консоли DigitalOcean. Если ключ отсутствует, добавьте его через панель DO и пересоздайте дроплет.

<p><strong>Признак успеха:</strong> Вы получаете root-шелл на дроплете.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>k3s не запускается</h3>
<p><strong>Проверка:</strong> Посмотрите статус сервиса и логи.</p>
<p><strong>Вероятная причина:</strong> Недостаточно RAM (нужно минимум 2 ГБ), порт 6443 уже используется или правила файрвола блокируют необходимые порты.</p>
<p><strong>Решение:</strong></p>

```bash
sudo systemctl status k3s
sudo journalctl -u k3s -f
```

<p><strong>Признак успеха:</strong> <code>systemctl status k3s</code> показывает <code>active (running)</code>.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>kubectl — отказ в соединении</h3>
<p><strong>Проверка:</strong> Вы используете правильный kubeconfig?</p>
<p><strong>Вероятная причина:</strong> k3s использует собственный путь к kubeconfig, а не стандартный <code>~/.kube/config</code>.</p>
<p><strong>Решение:</strong></p>

```bash
# На дроплете
sudo kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml get nodes
```

Для локального доступа скопируйте kubeconfig и замените `127.0.0.1` на публичный IP вашего дроплета.

<p><strong>Признак успеха:</strong> <code>kubectl get nodes</code> возвращает ваш узел в состоянии <code>Ready</code>.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Поды застряли в ImagePullBackOff</h3>
<p><strong>Проверка:</strong> Опишите под, чтобы увидеть ошибку загрузки образа.</p>
<p><strong>Вероятная причина:</strong> Образ не существует, тег неверный или Docker Hub ограничивает запросы.</p>
<p><strong>Решение:</strong></p>

```bash
kubectl describe pod <pod-name> -n ai-coderrank
```

Проверьте имя образа и тег. При проблемах с ограничением запросов переключитесь на `ghcr.io`.

<p><strong>Признак успеха:</strong> Под переходит в состояние <code>Running</code>.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Поды застряли в CrashLoopBackOff</h3>
<p><strong>Проверка:</strong> Прочитайте логи предыдущего упавшего контейнера.</p>
<p><strong>Вероятная причина:</strong> Приложение падает при запуске — отсутствует переменная окружения, ConfigMap/Secret или несоответствие портов.</p>
<p><strong>Решение:</strong></p>

```bash
kubectl logs <pod-name> -n ai-coderrank --previous
```

<p><strong>Признак успеха:</strong> Под остаётся в состоянии <code>Running</code> после исправления конфигурации.</p>
</div>

---

## Проблемы публичного доступа {#public-access-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Приложение недоступно по публичному IP (NodePort 30080)</h3>
<p><strong>Проверка:</strong> Подтвердите тип сервиса и доступность порта.</p>
<p><strong>Вероятная причина:</strong> Сервис не типа NodePort, порт не 30080 или файрвол DigitalOcean блокирует его.</p>
<p><strong>Решение:</strong></p>

```bash
# Проверить, что сервис — NodePort на 30080
kubectl get svc -n ai-coderrank

# Сначала проверить локально на дроплете
curl http://localhost:30080
```

Если локальный curl работает, а внешний нет, откройте порт 30080 в файрволе DigitalOcean: **Консоль DO > Networking > Firewalls**.

<div class="callout-important" markdown="1">
Этот курс использует NodePort 30080 для публичного доступа, а не Ingress. Убедитесь, что спецификация вашего Service содержит <code>type: NodePort</code> и <code>nodePort: 30080</code>.
</div>

<p><strong>Признак успеха:</strong> <code>curl http://&lt;droplet-ip&gt;:30080</code> возвращает ответ вашего приложения.</p>
</div>

---

## Проблемы ArgoCD {#argocd-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Интерфейс ArgoCD недоступен</h3>
<p><strong>Проверка:</strong> Работает ли port-forward?</p>
<p><strong>Вероятная причина:</strong> Port-forward не активен или под сервера ArgoCD не запущен.</p>
<p><strong>Решение:</strong></p>

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Получить пароль администратора:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

<p><strong>Признак успеха:</strong> Браузер загружает панель ArgoCD по адресу <code>https://localhost:8080</code>.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>ArgoCD не синхронизируется</h3>
<p><strong>Проверка:</strong> Посмотрите статус приложения.</p>
<p><strong>Вероятная причина:</strong> Опечатка в URL репозитория, неверное имя ветки или путь не совпадает со структурой директорий.</p>
<p><strong>Решение:</strong></p>

```bash
kubectl get app -n argocd
```

Принудительная синхронизация, если приложение существует, но зависло:

```bash
kubectl patch app ai-coderrank -n argocd \
  --type merge -p '{"operation":{"sync":{}}}'
```

<p><strong>Признак успеха:</strong> Статус приложения показывает <code>Synced</code> и <code>Healthy</code>.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>ArgoCD показывает Degraded</h3>
<p><strong>Проверка:</strong> Определите, какой ресурс нездоров.</p>
<p><strong>Вероятная причина:</strong> Под, управляемый ArgoCD, падает — обычно это CrashLoopBackOff под капотом.</p>
<p><strong>Решение:</strong></p>

```bash
kubectl get app ai-coderrank -n argocd -o yaml | grep -A 20 health
kubectl logs -n ai-coderrank -l app=ai-coderrank --tail=50
```

Исправьте проблему с подом (см. [Проблемы инфраструктуры](#infra-issues)), и ArgoCD автоматически обнаружит восстановление.

<p><strong>Признак успеха:</strong> Здоровье приложения возвращается к <code>Healthy</code>.</p>
</div>

---

## Проблемы GitHub Actions {#github-actions-issues}

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Claude Action не срабатывает</h3>
<p><strong>Проверка:</strong> Присутствует ли файл workflow и правильно ли указан триггер?</p>
<p><strong>Вероятная причина:</strong> Файл workflow не в <code>.github/workflows/</code>, событие-триггер не совпадает, условие <code>if</code> фильтрует его, или секрет <code>ANTHROPIC_API_KEY</code> отсутствует.</p>
<p><strong>Решение:</strong> Проверьте все пять пунктов:</p>

1. Файл workflow находится в `.github/workflows/`
2. Событие-триггер совпадает (`issue_comment`, `pull_request_review_comment`)
3. Условие `if` соответствует шаблону вашего комментария
4. `ANTHROPIC_API_KEY` установлен в Settings > Secrets репозитория
5. Разрешения GitHub App настроены

<p><strong>Признак успеха:</strong> Вкладка Actions показывает новый запуск после публикации подходящего комментария.</p>
</div>

<div class="symptom-block" markdown="1">
<span class="symptom-label">Симптом</span>
<h3>Action запускается, но нет вывода</h3>
<p><strong>Проверка:</strong> Откройте лог запуска во вкладке GitHub Actions.</p>
<p><strong>Вероятная причина:</strong> API-ключ недействителен/истёк, сработало ограничение запросов, <code>max_turns</code> установлен слишком низко, или CLAUDE.md содержит слишком строгие инструкции.</p>
<p><strong>Решение:</strong></p>

- Проверьте статус API-ключа и ошибки ограничения запросов в панели Anthropic
- Увеличьте `max_turns`, если workflow завершается слишком рано
- Проверьте лог workflow, чтобы убедиться, что Claude получил триггер
- Временно упростите строгие инструкции `CLAUDE.md`, если агент блокируется политикой

<p><strong>Признак успеха:</strong> Лог запуска action показывает ответ Claude и он публикует результат в PR/issue.</p>
</div>

---

## Что вставить в Claude

Когда вы застряли, дайте Claude структурированный контекст. Скопируйте этот шаблон:

```
I'm working on the Claude Code 101 course. I hit this issue:

**Block**: [какой блок]
**Step**: [какой шаг]
**Error**: [вставьте ошибку]
**What I tried**: [что вы уже пробовали]

Help me diagnose and fix this.
```

Чем точнее вы укажете блок, шаг и полный текст ошибки, тем быстрее Claude сможет помочь.

Если вы застреваете снова и снова, <a href="{{ '/other/mentoring/' | relative_url }}">менторинг</a> может быть быстрее, чем самостоятельная отладка.
