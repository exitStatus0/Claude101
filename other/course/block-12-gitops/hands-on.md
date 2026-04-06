---
layout: block-part
title: "Финал GitOps — ArgoCD и деплой — Практика"
block_number: 12
part_name: "Hands-On"
locale: ru
translation_key: block-12-hands-on
overview_url: /other/course/block-12-gitops/
presentation_url: /other/course/block-12-gitops/presentation/
hands_on_url: /other/course/block-12-gitops/hands-on/
permalink: /other/course/block-12-gitops/hands-on/
---
> **Прямая речь:** "Всё на этой странице практики построено так, чтобы вы могли повторять за мной строка за строкой. Когда видите блок с командой или промптом — можете скопировать его прямо в терминал или сессию Claude, если я явно не скажу, что это просто справочный материал. По ходу дела сверяйте свой результат с моим на экране, чтобы ловить ошибки сразу, а не копить их."

> **Длительность**: ~30 минут
> **Результат**: ArgoCD установлен, подключён к вашему репозиторию, приложение открыто публично, тёмная тема задеплоена через GitOps, мониторинг настроен через `/loop` и `/schedule`. Грандиозный финал.
> **Пререквизиты**: Пройдены Блоки 0-11 (k3s-кластер работает, приложение задеплоено, CI/CD настроен), kubectl-доступ с вашего ноутбука, репозиторий ai-coderrank запушен на GitHub

---

### Шаг 1: Устанавливаем ArgoCD на k3s-кластер (~5 мин)

Это последний раз, когда вы вручную выполните `kubectl apply` для деплоев. После этого ArgoCD берёт управление на себя.

Запустите Claude Code в проекте ai-coderrank:

```bash
cd ~/ai-coderrank
claude
```

Попросите Claude помочь установить ArgoCD:

```text
Help me install ArgoCD on my k3s cluster. Create the argocd namespace and apply
the stable manifests.
```

Claude сгенерирует и выполнит команды:

```bash
# Create the ArgoCD namespace
kubectl create namespace argocd

# Install ArgoCD using the stable manifests
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Дождитесь, пока поды поднимутся. Попросите Claude проверить:

```text
Check if all ArgoCD pods are running in the argocd namespace. Wait until they're
all Ready.
```

Claude выполнит:

```bash
kubectl get pods -n argocd -w
```

Вы должны увидеть поды:
- `argocd-server-xxx` — API-сервер и веб-UI
- `argocd-repo-server-xxx` — клонирует и читает ваши Git-репозитории
- `argocd-application-controller-xxx` — мозг системы, отслеживает дрейф
- `argocd-redis-xxx` — слой кэширования
- `argocd-applicationset-controller-xxx` — управляет ApplicationSets
- `argocd-notifications-controller-xxx` — отправляет уведомления о событиях синхронизации
- `argocd-dex-server-xxx` — обрабатывает SSO-аутентификацию

Все поды должны показывать `Running` с `1/1` Ready. Обычно на k3s-кластере это занимает 1-2 минуты.

> **Что только что произошло**: Вы установили полноценную GitOps-платформу доставки. ArgoCD теперь работает внутри вашего Kubernetes-кластера, готовый следить за Git-репозиторием и синхронизировать изменения. В продакшн-окружениях это та же самая инсталляция ArgoCD, которая управляет тысячами сервисов. Тот же инструмент, та же конфигурация, тот же воркфлоу.

---

### Шаг 2: Доступ к UI ArgoCD (~3 мин)

Получите начальный пароль администратора:

```text
Get the ArgoCD admin password from the cluster secret.
```

Claude выполнит:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

Скопируйте пароль. Он понадобится через мгновение.

Теперь пробросьте порт ArgoCD-сервера на локальную машину:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Откройте браузер и перейдите по адресу `https://localhost:8080`. Вы увидите предупреждение о сертификате — это ожидаемо для самоподписанного сертификата. Примите его и продолжайте.

- **Имя пользователя**: `admin`
- **Пароль**: строка, которую вы скопировали выше

Вы должны увидеть дашборд ArgoCD. Пока он пустой — нет приложений. Это скоро изменится.

> **Совет**: Оставьте port-forward работающим в отдельной вкладке терминала. Вам понадобится UI ArgoCD на виду во время следующих шагов.

---

### Шаг 3: Создаём конфигурацию ArgoCD Application (~3 мин)

Теперь скажем ArgoCD, за чем следить. Попросите Claude:

```text
Create argocd/application.yaml that points ArgoCD at my ai-coderrank GitHub repo.
It should watch the k8s/ directory on the main branch and auto-sync changes to the
default namespace. Enable auto-prune and self-heal.

My GitHub repo is at: https://github.com/YOUR_USERNAME/ai-coderrank.git
```

Claude создаст `argocd/application.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ai-coderrank
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/YOUR_USERNAME/ai-coderrank.git
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

Разберём, что делает каждая секция:

| Поле | Что означает |
|------|-------------|
| `source.repoURL` | Git-репозиторий, за которым будет следить ArgoCD |
| `source.targetRevision` | Какую ветку отслеживать (`main`) |
| `source.path` | Какая директория содержит K8s-манифесты (`k8s/`) |
| `destination.server` | K8s-кластер для деплоя (локальный кластер) |
| `destination.namespace` | В какой namespace деплоить |
| `syncPolicy.automated` | Автосинхронизация при изменениях в Git (без ручного одобрения) |
| `syncPolicy.automated.prune` | Удалять ресурсы из кластера, если они удалены из Git |
| `syncPolicy.automated.selfHeal` | Откатывать ручные изменения в кластере к тому, что объявлено в Git |

Применяем:

```text
Apply the ArgoCD application to the cluster.
```

```bash
kubectl apply -f argocd/application.yaml
```

> **Это ключевой момент.** ArgoCD теперь следит за вашим репозиторием. Любые изменения в директории `k8s/` в ветке `main` будут автоматически применены к вашему кластеру. Вы только что настроили непрерывную доставку.

---

### Шаг 4: Наблюдаем первую синхронизацию (~2 мин)

Переключитесь на UI ArgoCD в браузере (`https://localhost:8080`). Вы должны увидеть, как появилось приложение `ai-coderrank`. Нажмите на него.

ArgoCD:
1. Склонирует ваш репозиторий
2. Прочитает манифесты в `k8s/`
3. Сравнит их с тем, что сейчас в кластере
4. Покажет diff
5. Применит все расхождения

Если вы уже деплоили приложение в Блоке 7, ArgoCD должен показать приложение как **Synced** и **Healthy** — манифесты в Git совпадают с тем, что работает в кластере.

Если есть расхождения, ArgoCD синхронизирует их автоматически. Следите за деревом ресурсов в UI — вы увидите каждый Deployment, Service и Pod как узлы визуального графа.

Попросите Claude проверить из CLI тоже:

```text
Check the ArgoCD application sync status for ai-coderrank.
```

```bash
kubectl get application ai-coderrank -n argocd -o jsonpath='{.status.sync.status}'
# Should output: Synced

kubectl get application ai-coderrank -n argocd -o jsonpath='{.status.health.status}'
# Should output: Healthy
```

**Synced + Healthy** = Git совпадает с кластером, и все ресурсы работают корректно. Это то состояние, к которому нужно стремиться.

---

### Шаг 5: Открываем приложение публично (~5 мин)

Сейчас приложение работает в кластере, но недоступно из интернета. Давайте это исправим.

Попросите Claude:

```text
Help me expose the ai-coderrank app on my droplet's public IP address. My droplet's
IP is YOUR_DROPLET_IP. Set up a NodePort service so I can access
the app from a browser at http://YOUR_DROPLET_IP.
```

**Вариант A: NodePort (рекомендуется для этого курса)**

Это самый простой путь. Никакой дополнительной конфигурации, никакой возни с Ingress-контроллером. Ваше приложение получает порт на публичном IP дроплета, и вы можете обращаться к нему напрямую из любого браузера.

Claude поможет обновить Service в `k8s/` на тип NodePort:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ai-coderrank
  namespace: default
spec:
  type: NodePort
  selector:
    app: ai-coderrank
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30080    # Accessible at http://DROPLET_IP:30080
```

> **Доступ по публичному IP**: Ваш дроплет DigitalOcean уже имеет публичный IP-адрес. Балансировщик нагрузки не нужен. NodePort открывает приложение напрямую на IP дроплета через порт 30080. Просто убедитесь, что фаервол его пропускает.

**Вариант B: Ingress с Traefik (дополнительно — более продвинутый)**

k3s поставляется с Traefik в качестве встроенного Ingress-контроллера. Если вы хотите доступ по порту 80 (без номера порта в URL), можно создать ресурс Ingress. Это опционально и сложнее:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ai-coderrank
  namespace: default
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ai-coderrank
                port:
                  number: 3000
```

С Traefik Ingress приложение будет доступно по `http://YOUR_DROPLET_IP` на порту 80 — без указания номера порта. Это приятный бонус, но не обязательно для упражнений курса.

**Важно**: Какой бы вариант вы ни выбрали, закоммитьте изменения Service/Ingress в `k8s/` и запушьте в Git. Не делайте `kubectl apply` вручную — пусть ArgoCD этим займётся. Это и есть GitOps:

```text
Commit the updated service manifest and push it to the main branch. Let ArgoCD
sync it.
```

```bash
git add k8s/
git commit -m "feat: expose ai-coderrank via NodePort for public access"
git push origin main
```

Убедитесь, что фаервол дроплета пропускает трафик на порт 30080. Попросите Claude:

```text
Help me check and update the DigitalOcean firewall rules for my droplet to allow
inbound traffic on port 80 and 30080.
```

Следите за UI ArgoCD — в течение нескольких минут он обнаружит push и синхронизирует новую конфигурацию Service в кластер.

---

### Шаг 6: Пушим тёмную тему — Момент истины (~3 мин)

> **Реестр контейнеров**: В этом курсе стандартом является **GitHub Container Registry (GHCR)**. Ваш CI-пайплайн (Блок 10) должен пушить образы в `ghcr.io/YOUR_USERNAME/ai-coderrank`, а K8s deployment должен ссылаться на тот же образ. Если вы пропустили Блок 10, образы можно запушить вручную через `docker push ghcr.io/YOUR_USERNAME/ai-coderrank:latest`.

Вот он. Момент, к которому вёл весь курс.

Если ваши изменения тёмной темы из Блока 4 ещё не запушены — сейчас самое время. Попросите Claude:

```text
Make sure all the dark theme changes are committed and push everything to the main
branch.
```

```bash
git add .
git commit -m "feat: dark theme implementation from Block 4"
git push origin main
```

А теперь наблюдайте. Откройте UI ArgoCD рядом с терминалом.

1. ArgoCD обнаруживает новый коммит (в течение 3 минут по умолчанию или мгновенно через webhook)
2. Клонирует обновлённый репозиторий
3. Сравнивает новые манифесты с состоянием кластера
4. Если ссылка на Docker-образ изменилась — раскатывает новую версию
5. Статус переходит из **OutOfSync** в **Syncing** и далее в **Synced**

> **Примечание**: Если ваши K8s-манифесты ссылаются на контейнерный образ, который собирается CI (из Блока 10), полный цикл выглядит так: push кода -> GitHub Actions собирает образ -> push образа в реестр -> обновление тега образа в `k8s/deployment.yaml` -> ArgoCD синхронизирует новый образ. Если вы используете фиксированный тег — возможно, придётся его обновить. Попросите Claude помочь настроить процесс обновления образа.

---

### Шаг 7: Открываем приложение в браузере (~1 мин)

Откройте браузер. Перейдите по адресу:

```text
http://YOUR_DROPLET_IP:30080
```

Вы должны увидеть ai-coderrank. С тёмной темой. Работающий на Kubernetes. Задеплоенный через GitOps. Доступный из интернета.

Сделайте вдох. Это вы построили.

Если не загружается, попросите Claude помочь с диагностикой:

```text
The app isn't loading at http://YOUR_DROPLET_IP:30080. Help me debug — check the
pods, service, NodePort, and firewall rules.
```

Claude систематически проверит каждый уровень: работают ли поды? Правильно ли маршрутизирует Service? Открыт ли NodePort? Пропускает ли фаервол? Такая методичная отладка — именно то, в чём Claude блистает.

---

### Шаг 8: Мониторинг через /loop (~3 мин)

Теперь давайте используем Claude Code как инструмент эксплуатации. Команда `/loop` запускает промпт с повтором через заданный интервал — идеально для мониторинга.

В вашей сессии Claude Code:

```text
/loop 30s check if ArgoCD sync is complete for ai-coderrank and report the sync
status and health
```

Claude будет проверять каждые 30 секунд и докладывать:

```text
[12:01:30] Sync: Synced | Health: Healthy | Resources: 4/4 running
[12:02:00] Sync: Synced | Health: Healthy | Resources: 4/4 running
[12:02:30] Sync: Synced | Health: Healthy | Resources: 4/4 running
```

Теперь в отдельном терминале внесите небольшое изменение и запушьте:

```bash
# Change the replica count or add a label — something small
git add k8s/
git commit -m "test: verify ArgoCD auto-sync with minor manifest change"
git push origin main
```

Следите за выводом `/loop`. В течение нескольких минут вы должны увидеть:

```text
[12:05:00] Sync: OutOfSync | Health: Healthy | Resources: 4/4 running
[12:05:30] Sync: Syncing  | Health: Progressing | Resources: updating...
[12:06:00] Sync: Synced   | Health: Healthy | Resources: 4/4 running
```

Вы только что наблюдали GitOps в реальном времени. Push в Git, ArgoCD синхронизирует, кластер обновляется. Без ручного вмешательства. Команда `/loop` дала вам живой дашборд прямо в терминале.

Нажмите `Ctrl+C` (или введите `stop`), чтобы остановить цикл.

> **Совет**: `/loop` принимает любой интервал — `10s`, `1m`, `5m`. Используйте короткие интервалы для активного мониторинга во время деплоев, более длинные — для фоновых проверок.

---

### Шаг 8b: Наблюдаемость и отладка (~5 мин)

Теперь, когда у вас есть работающий деплой, давайте выстроим базовую практику наблюдаемости. Эти команды спасут вас, когда что-то пойдёт не так в продакшне.

#### Логи подов

Первое, что нужно проверить, когда что-то ломается:

```bash
# Logs for the ai-coderrank deployment
kubectl logs deployment/ai-coderrank -n default

# Follow logs in real time (like tail -f)
kubectl logs deployment/ai-coderrank -n default -f

# Logs from a crashed or restarting pod (previous container)
kubectl logs deployment/ai-coderrank -n default --previous
```

Попросите Claude помочь интерпретировать логи:

```text
Read the last 50 lines of logs from the ai-coderrank deployment and flag anything
that looks like an error, warning, or unexpected behavior.
```

#### Потребление ресурсов

Установите metrics-server, чтобы `kubectl top` работал на k3s:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

> **Примечание**: На k3s может потребоваться добавить `--kubelet-insecure-tls` в аргументы деплоймента metrics-server. Попросите Claude пропатчить, если `kubectl top` выдаёт ошибки.

Когда metrics-server заработает (дайте ему минуту):

```bash
# CPU and memory usage per pod
kubectl top pods -n default

# CPU and memory usage per node
kubectl top nodes
```

Это покажет, есть ли у вашего дроплета s-2vcpu-4gb запас по ресурсам или он работает на пределе.

#### Readiness и liveness probes

Проверьте, что ваши K8s-манифесты включают health probes. Попросите Claude:

```text
Check all deployments in k8s/ for readiness and liveness probes. If any are
missing, add them. Use HTTP GET /health for the web service (or TCP on port 3000
if no health endpoint exists).
```

Probes сообщают Kubernetes, когда ваше приложение готово принимать трафик (readiness) и когда оно зависло и нуждается в перезапуске (liveness). Без них K8s не может обнаружить зависший процесс.

#### Статус здоровья ArgoCD

ArgoCD предоставляет собственную модель здоровья поверх Kubernetes:

```bash
# Quick status check
kubectl get application ai-coderrank -n argocd

# Detailed health for each resource
kubectl get application ai-coderrank -n argocd -o jsonpath='{.status.resources[*].health.status}' | tr ' ' '\n'
```

UI ArgoCD также показывает здоровье каждого ресурса в визуальном дереве. Зелёный = здоров, жёлтый = в процессе, красный = деградирован.

#### Непрерывный мониторинг через /loop

Объедините всё это в цикл мониторинга:

```text
/loop 1m check ArgoCD sync status, pod health, and resource usage for ai-coderrank.
Report any issues.
```

Это даёт вам ops-дашборд в терминале, обновляющийся каждую минуту. Используйте его во время деплоев, после изменений конфигурации или когда что-то кажется подозрительным.

---

### Шаг 9: Настраиваем запланированную проверку здоровья через /schedule (~3 мин)

`/loop` отлично подходит для активного мониторинга, но что насчёт того, когда вы спите? Для этого есть `/schedule` — он создаёт облачные задачи, выполняемые по cron-расписанию.

```text
/schedule create "ai-coderrank daily health check" --cron "0 9 * * *" \
  --prompt "Check the status of all pods in the default namespace. Verify the \
  ai-coderrank service is responding. Check ArgoCD sync status. If anything is \
  unhealthy, provide a summary of issues and suggested fixes."
```

Это создаёт запланированного агента, который запускается каждый день в 9:00 утра. Он:
1. Проверит статус подов
2. Убедится, что сервис отвечает
3. Проверит статус синхронизации ArgoCD
4. Сообщит о любых проблемах

Вы можете вывести список запланированных задач:

```text
/schedule list
```

И проверить результат последнего запуска:

```text
/schedule show "ai-coderrank daily health check"
```

> **Сценарии использования помимо проверок здоровья**: Ночное сканирование безопасности (запланируйте промпт `/schedule`, который проверяет зависимости на CVE). Еженедельные отчёты о стоимости. Ежедневный анализ логов. Любая повторяющаяся операционная задача, которую вы обычно автоматизировали бы через cron-джоб + скрипт, может быть запланированным Claude-агентом.

---

### Шаг 10: Удалённое управление — мониторинг с телефона (~2 мин)

Последняя функция для финала. Claude Code поддерживает удалённое управление для текущей сессии — идеально, чтобы сохранить контекст деплоя на телефоне.

Из текущей сессии Claude Code откройте удалённый доступ к этой сессии:

```text
/remote-control ai-coderrank-rollout
```

Вы получите URL и QR-код. Откройте этот URL в браузере телефона или в приложении Claude. Теперь у вас есть доступ к той же сессии Claude Code, с той же историей и текущим контекстом раскатки, прямо с телефона.

Попробуйте:
1. С телефона попросите Claude проверить статус подов
2. С телефона попросите Claude проверить статус синхронизации ArgoCD
3. С телефона запустите `/loop 1m` для наблюдения за кластером

Это по-настоящему полезно на практике. Вы пушите деплой с ноутбука, закрываете крышку и мониторите раскатку с телефона, пока берёте кофе. Если что-то пойдёт не так — можете расследовать и даже выполнять команды, всё из мобильного браузера.

> **Когда это пригодится**: Пятничный деплой после обеда. Вы пушите изменение, запускаете `/loop` для мониторинга, затем идёте к поезду. С телефона наблюдаете, как раскатка завершается. Ноутбук не нужен. Это и есть операционное спокойствие.

---

### Чекпоинт: Грандиозная веха

Давайте подведём итог тому, что вы только что сделали:

**Инфраструктура**:
- ArgoCD работает на k3s
- `argocd/application.yaml` связывает ваш репозиторий с кластером
- Автосинхронизация с самовосстановлением и автоочисткой включены
- NodePort открывает приложение публично на порту 30080

**Рабочий процесс**:
- Push в Git -> ArgoCD синхронизирует -> приложение обновляется автоматически
- Ручной `kubectl apply` не нужен
- Полный журнал аудита в истории Git

**Мониторинг**:
- `/loop` для мониторинга синхронизации в реальном времени
- `/schedule` для ежедневных проверок здоровья
- Удалённое управление для мониторинга с любого устройства

**Приложение**:
- ai-coderrank с тёмной темой
- Работает в интернете на публичном IP вашего дроплета
- Задеплоено и управляется полностью через GitOps

Вы начали этот курс с `claude` и пустого терминала. Теперь у вас полноценный, современный, продакшн-качества пайплайн разработки и деплоя. Код -> CI -> GitOps -> Живое приложение.

Отправьте URL другу. Серьёзно. Покажите. Это вы построили.

---

### Устранение неполадок

**ArgoCD показывает статус синхронизации "Unknown"**
Репозиторий может быть приватным. Нужно добавить учётные данные:
```bash
kubectl -n argocd create secret generic repo-ai-coderrank \
  --from-literal=url=https://github.com/YOUR_USER/ai-coderrank.git \
  --from-literal=username=YOUR_USER \
  --from-literal=password=YOUR_GITHUB_TOKEN
kubectl -n argocd label secret repo-ai-coderrank argocd.argoproj.io/secret-type=repository
```
Попросите Claude помочь сгенерировать GitHub Personal Access Token со scope `repo`.

**ArgoCD показывает статус здоровья "Degraded"**
Обычно это означает, что поды в crashloop. Проверьте:
```bash
kubectl get pods -n default
kubectl logs deployment/ai-coderrank -n default
```
Попросите Claude проанализировать логи. Частые проблемы: отсутствующие переменные окружения, неправильный тег образа, несовпадение портов.

**Не получается открыть приложение по публичному IP**
Проверяйте цепочку: Под работает? -> Service маршрутизирует? -> NodePort открыт? -> Фаервол пропускает?
```bash
kubectl get pods -n default
kubectl get svc -n default          # Verify NodePort 30080 is listed
curl http://localhost:30080          # Test from the droplet itself
# Check firewall on DO console or via doctl — port 30080 must be allowed
```

**Синхронизация ArgoCD медленная**
По умолчанию ArgoCD опрашивает репозиторий каждые 3 минуты. Можно принудительно запустить синхронизацию:
```bash
kubectl -n argocd patch application ai-coderrank \
  --type merge -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}'
```
Или настройте GitHub webhook для мгновенной синхронизации.

---

### Бонусные задания

**Задание 1: Синхронизация по webhook**
Настройте GitHub webhook, чтобы ArgoCD синхронизировался мгновенно при push вместо опроса каждые 3 минуты. Попросите Claude помочь настроить URL вебхука и секрет.

**Задание 2: Откат через Git**
Внесите ломающее изменение (неправильный тег образа), запушьте, понаблюдайте, как ArgoCD деплоит сломанную версию. Затем сделайте `git revert` коммита, запушьте снова и наблюдайте, как ArgoCD откатывает. Весь откат — это Git-операция. Никакого `kubectl rollout undo` не нужно.

**Задание 3: Уведомления ArgoCD**
Настройте уведомления ArgoCD для отправки сообщения в Slack или email при завершении или провале синхронизации. Попросите Claude помочь настроить ConfigMap `argocd-notifications-cm`.

**Задание 4: Несколько окружений**
Создайте структуру директорий `k8s/staging/` и `k8s/production/`. Создайте два ArgoCD Application — каждый следит за своей директорией. Попросите Claude помочь реструктурировать манифесты.

---

> **Вот это путешествие.** Вы прошли путь от `claude` до GitOps. От чтения кода до его деплоя в интернет. От одного инструмента до целой экосистемы. Следующий и заключительный блок покрывает продвинутые паттерны и дальнейшие шаги — но если бы вы остановились прямо здесь, у вас уже был бы полноценный, готовый к продакшну рабочий процесс. Отлично сделано.
