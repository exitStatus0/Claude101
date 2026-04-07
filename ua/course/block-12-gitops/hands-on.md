---
layout: block-part
title: "Фінал GitOps — ArgoCD та деплой у продакшен — Практика"
block_number: 12
description: "Практичні кроки реалізації для Блоку 12."
time: "~30 хвилин"
part_name: "Hands-On"
overview_url: /ua/course/block-12-gitops/
presentation_url: /ua/course/block-12-gitops/presentation/
hands_on_url: /ua/course/block-12-gitops/hands-on/
quiz_url: /ua/course/block-12-gitops/quiz/
permalink: /ua/course/block-12-gitops/hands-on/
locale: uk
translation_key: block-12-hands-on
---
> **Пряма мова:** "Все на цій практичній сторінці побудовано так, щоб ви могли слідувати за мною рядок за рядком. Коли бачите блок із командою або промптом, можете копіювати його прямо в термінал або сесію Claude, якщо я явно не скажу, що це лише довідковий матеріал. Порівнюйте свій результат із моїм на екрані, щоб виловлювати помилки відразу, а не накопичувати їх."

> **Тривалість**: ~30 хвилин
> **Результат**: ArgoCD встановлений, підключений до вашого репо, застосунок відкритий публічно, темна тема задеплоєна через GitOps, та моніторинг налаштований з `/loop` і `/schedule`. Гранд-фінал.
> **Передумови**: Завершені Блоки 0-11 (k3s-кластер працює, застосунок задеплоєний, CI/CD налаштовано), доступ kubectl з ноутбука, репо ai-coderrank запушене на GitHub

---

### Крок 1: Встановлення ArgoCD на k3s-кластер (~5 хв)

Це останній раз, коли ви вручну виконуєте `kubectl apply` для деплоїв. Після цього ArgoCD бере все на себе.

Запустіть Claude Code у проєкті ai-coderrank:

```bash
cd ~/ai-coderrank
claude
```

Попросіть Claude допомогти з встановленням ArgoCD:

```text
Help me install ArgoCD on my k3s cluster. Create the argocd namespace and apply
the stable manifests.
```

Claude згенерує та виконає команди:

```bash
# Створення namespace ArgoCD
kubectl create namespace argocd

# Встановлення ArgoCD зі стабільних маніфестів
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Зачекайте, поки поди піднімуться. Попросіть Claude перевірити:

```text
Check if all ArgoCD pods are running in the argocd namespace. Wait until they're
all Ready.
```

Claude виконає:

```bash
kubectl get pods -n argocd -w
```

Ви маєте побачити поди на кшталт:
- `argocd-server-xxx` — API-сервер та веб-UI
- `argocd-repo-server-xxx` — клонує та читає ваші Git-репо
- `argocd-application-controller-xxx` — мозок, стежить за drift
- `argocd-redis-xxx` — шар кешування
- `argocd-applicationset-controller-xxx` — управляє ApplicationSets
- `argocd-notifications-controller-xxx` — надсилає нотифікації про sync-події
- `argocd-dex-server-xxx` — обробляє SSO-автентифікацію

Всі поди мають показувати `Running` з `1/1` Ready. На k3s-кластері це зазвичай займає 1-2 хвилини.

> **Що щойно сталося**: Ви встановили повноцінну GitOps-платформу доставки. ArgoCD тепер працює всередині вашого Kubernetes-кластера, готовий стежити за Git-репо та синхронізувати зміни. У продакшен-середовищах це та сама інсталяція ArgoCD, що управляє тисячами сервісів. Той самий інструмент, та сама конфігурація, той самий воркфлоу.

---

### Крок 2: Доступ до ArgoCD UI (~3 хв)

Отримайте початковий пароль адміна:

```text
Get the ArgoCD admin password from the cluster secret.
```

Claude виконає:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

Скопіюйте пароль. Він знадобиться через мить.

Тепер пробросьте порт ArgoCD-сервера на локальну машину:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Відкрийте браузер і перейдіть на `https://localhost:8080`. З'явиться попередження про сертифікат — це очікувано для self-signed cert. Прийміть і продовжуйте.

- **Логін**: `admin`
- **Пароль**: рядок, що ви скопіювали вище

Ви маєте побачити дашборд ArgoCD. Наразі він порожній — жодних застосунків. Це скоро зміниться.

> **Порада**: Залиште цей port-forward працювати у окремій вкладці терміналу. Вам знадобиться ArgoCD UI видимим під час роботи над наступними кроками.

---

### Крок 3: Створення конфігурації ArgoCD Application (~3 хв)

Тепер скажемо ArgoCD, за чим стежити. Попросіть Claude:

```text
Create argocd/application.yaml that points ArgoCD at my ai-coderrank GitHub repo.
It should watch the k8s/ directory on the main branch and auto-sync changes to the
default namespace. Enable auto-prune and self-heal.

My GitHub repo is at: https://github.com/YOUR_USERNAME/ai-coderrank.git
```

Claude створить `argocd/application.yaml`:

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

Розберемо, що робить кожна секція:

| Поле | Що означає |
|------|-----------|
| `source.repoURL` | Git-репо, за яким стежитиме ArgoCD |
| `source.targetRevision` | Яку гілку відстежувати (`main`) |
| `source.path` | Яка директорія містить K8s-маніфести (`k8s/`) |
| `destination.server` | K8s-кластер для деплою (локальний кластер) |
| `destination.namespace` | У який namespace деплоїти |
| `syncPolicy.automated` | Авто-синхронізація при зміні Git (без ручного апрувлу) |
| `syncPolicy.automated.prune` | Видаляти ресурси з кластера, якщо їх прибрали з Git |
| `syncPolicy.automated.selfHeal` | Відкочувати ручні зміни кластера до того, що декларує Git |

Застосуйте:

```text
Apply the ArgoCD application to the cluster.
```

```bash
kubectl apply -f argocd/application.yaml
```

> **Це поворотний момент.** ArgoCD тепер стежить за вашим репо. Будь-які зміни у директорії `k8s/` на гілці `main` будуть автоматично застосовані до кластера. Ви щойно налаштували continuous delivery.

---

### Крок 4: Спостереження за першою синхронізацією (~2 хв)

Переключіться на ArgoCD UI у браузері (`https://localhost:8080`). Ви маєте побачити застосунок `ai-coderrank`. Клікніть на нього.

ArgoCD:
1. Клонує ваш репо
2. Прочитає маніфести у `k8s/`
3. Порівняє з поточним станом кластера
4. Покаже diff
5. Застосує відмінності

Якщо ви вже деплоїли застосунок у Блоці 7, ArgoCD має показати стан **Synced** та **Healthy** — маніфести в Git відповідають тому, що працює в кластері.

Якщо є відмінності, ви побачите, як ArgoCD синхронізує їх автоматично. Спостерігайте за деревом ресурсів у UI — кожен Deployment, Service та Pod відображається як вузол у візуальному графі.

Попросіть Claude перевірити через CLI:

```text
Check the ArgoCD application sync status for ai-coderrank.
```

```bash
kubectl get application ai-coderrank -n argocd -o jsonpath='{.status.sync.status}'
# Має вивести: Synced

kubectl get application ai-coderrank -n argocd -o jsonpath='{.status.health.status}'
# Має вивести: Healthy
```

**Synced + Healthy** = Git відповідає кластеру, і всі ресурси працюють коректно. Це стан, який вам потрібен.

---

### Крок 5: Публічний доступ до застосунку (~5 хв)

Зараз застосунок працює в кластері, але недоступний з інтернету. Виправимо це.

Попросіть Claude:

```text
Help me expose the ai-coderrank app on my droplet's public IP address. My droplet's
IP is YOUR_DROPLET_IP. Set up a NodePort service so I can access
the app from a browser at http://YOUR_DROPLET_IP.
```

**Варіант A: NodePort (рекомендований для цього курсу)**

Найпростіший шлях. Жодних додаткових конфігурацій, жодного налаштування Ingress-контролера. Ваш застосунок отримує порт на публічному IP дроплету, і ви можете звернутися до нього з будь-якого браузера.

Claude допоможе оновити Service у `k8s/` на NodePort:

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
      nodePort: 30080    # Доступний за http://DROPLET_IP:30080
```

> **Доступ через публічний IP**: Ваш дроплет DigitalOcean вже має публічний IP. Балансувальник не потрібен. NodePort відкриває застосунок безпосередньо на IP дроплету на порті 30080. Просто переконайтеся, що фаєрвол пропускає його.

**Варіант B: Ingress з Traefik (сайдбар — більш просунутий)**

k3s поставляється з Traefik як вбудованим Ingress-контролером. Якщо хочете доступ через порт 80 (без номера порту в URL), можете створити Ingress-ресурс. Це опціонально і складніше:

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

З Traefik Ingress застосунок буде доступний за `http://YOUR_DROPLET_IP` на порті 80 — без номера порту. Це приємний бонус, але не обов'язковий для вправ курсу.

**Важливо**: Який би варіант ви не обрали, закомітьте зміни Service/Ingress у `k8s/` та запуште у Git. Не робіть `kubectl apply` вручну — дозвольте ArgoCD обробити це. Це GitOps:

```text
Commit the updated service manifest and push it to the main branch. Let ArgoCD
sync it.
```

```bash
git add k8s/
git commit -m "feat: expose ai-coderrank via NodePort for public access"
git push origin main
```

Переконайтеся, що фаєрвол дроплету пропускає трафік на порт 30080. Попросіть Claude:

```text
Help me check and update the DigitalOcean firewall rules for my droplet to allow
inbound traffic on port 80 and 30080.
```

Спостерігайте за ArgoCD UI — протягом кількох хвилин він виявить пуш і синхронізує нову конфігурацію Service у кластер.

---

### Крок 6: Пуш темної теми — Великий момент (~3 хв)

> **Container registry**: Цей курс стандартизований на **GitHub Container Registry (GHCR)**. Ваш CI-пайплайн (Блок 10) має пушити образи у `ghcr.io/YOUR_USERNAME/ai-coderrank`, а K8s deployment має посилатися на той самий образ. Якщо ви пропустили Блок 10, можете запушити образи вручну через `docker push ghcr.io/YOUR_USERNAME/ai-coderrank:latest`.

Ось він. Момент, до якого будувався весь курс.

Якщо зміни темної теми з Блоку 4 ще не запушені — саме час. Попросіть Claude:

```text
Make sure all the dark theme changes are committed and push everything to the main
branch.
```

```bash
git add .
git commit -m "feat: dark theme implementation from Block 4"
git push origin main
```

Тепер спостерігайте. Відкрийте ArgoCD UI поруч із терміналом.

1. ArgoCD виявляє новий коміт (протягом 3 хвилин за замовчуванням, або миттєво з webhook)
2. Клонує оновлений репо
3. Порівнює нові маніфести зі станом кластера
4. Якщо змінився тег Docker-образу — розгортає нову версію
5. Статус змінюється з **OutOfSync** на **Syncing** на **Synced**

> **Примітка**: Якщо ваші K8s-маніфести посилаються на контейнерний образ, що будується CI (з Блоку 10), повний цикл: пуш коду -> GitHub Actions будує образ -> пуш образу в registry -> оновлення тегу образу в `k8s/deployment.yaml` -> ArgoCD синхронізує новий образ. Якщо використовуєте фіксований тег, можливо, потрібно його оновити. Попросіть Claude допомогти налаштувати flow оновлення образу.

---

### Крок 7: Відкриття застосунку у браузері (~1 хв)

Відкрийте браузер. Перейдіть на:

```text
http://YOUR_DROPLET_IP:30080
```

Ви маєте побачити ai-coderrank. З темною темою. На Kubernetes. Задеплоєний через GitOps. Доступний з інтернету.

Зробіть вдих. Ви це побудували.

Якщо не вантажиться, попросіть Claude допомогти з дебагом:

```text
The app isn't loading at http://YOUR_DROPLET_IP:30080. Help me debug — check the
pods, service, NodePort, and firewall rules.
```

Claude систематично перевірить кожен рівень: чи працюють поди? Чи сервіс маршрутизує правильно? Чи NodePort відкритий? Чи фаєрвол пропускає? Цей методичний дебагінг — саме те, в чому Claude чудовий.

---

### Крок 8: Моніторинг з /loop (~3 хв)

Тепер використаємо Claude Code як інструмент операцій. Команда `/loop` виконує промпт з повторенням через інтервал — ідеально для моніторингу.

У вашій сесії Claude Code:

```text
/loop 30s check if ArgoCD sync is complete for ai-coderrank and report the sync
status and health
```

Claude перевірятиме кожні 30 секунд і звітуватиме:

```text
[12:01:30] Sync: Synced | Health: Healthy | Resources: 4/4 running
[12:02:00] Sync: Synced | Health: Healthy | Resources: 4/4 running
[12:02:30] Sync: Synced | Health: Healthy | Resources: 4/4 running
```

Тепер, в окремому терміналі, зробіть невелику зміну та запуште:

```bash
# Змініть кількість реплік або додайте лейбл — щось невелике
git add k8s/
git commit -m "test: verify ArgoCD auto-sync with minor manifest change"
git push origin main
```

Спостерігайте за виводом `/loop`. Протягом кількох хвилин ви маєте побачити:

```text
[12:05:00] Sync: OutOfSync | Health: Healthy | Resources: 4/4 running
[12:05:30] Sync: Syncing  | Health: Progressing | Resources: updating...
[12:06:00] Sync: Synced   | Health: Healthy | Resources: 4/4 running
```

Ви щойно спостерігали GitOps у реальному часі. Пуш у Git, ArgoCD синхронізує, кластер оновлюється. Жодного ручного втручання. Команда `/loop` дала вам живий дашборд у терміналі.

Натисніть `Ctrl+C` (або введіть `stop`) для зупинки циклу.

> **Порада**: `/loop` приймає будь-який інтервал — `10s`, `1m`, `5m`. Використовуйте коротші інтервали для активного моніторингу під час деплоїв, довші — для фонових перевірок.

---

### Крок 8b: Спостережуваність та дебагінг (~5 хв)

Тепер, маючи живий деплой, побудуємо базову практику спостережуваності. Ці команди врятують вас, коли щось піде не так у продакшені.

#### Логи подів

Перше, що потрібно перевірити, коли щось ламається:

```bash
# Логи деплойменту ai-coderrank
kubectl logs deployment/ai-coderrank -n default

# Стеження за логами в реальному часі (як tail -f)
kubectl logs deployment/ai-coderrank -n default -f

# Логи з краш-поду або перезапущеного поду (попередній контейнер)
kubectl logs deployment/ai-coderrank -n default --previous
```

Попросіть Claude допомогти інтерпретувати логи:

```text
Read the last 50 lines of logs from the ai-coderrank deployment and flag anything
that looks like an error, warning, or unexpected behavior.
```

#### Використання ресурсів

Встановіть metrics-server, щоб `kubectl top` працював на k3s:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

> **Примітка**: На k3s може знадобитися додати `--kubelet-insecure-tls` до аргументів деплойменту metrics-server. Попросіть Claude пропатчити, якщо `kubectl top` повертає помилки.

Коли metrics-server запуститься (дайте хвилину):

```bash
# Використання CPU та пам'яті по подах
kubectl top pods -n default

# Використання CPU та пам'яті по нодах
kubectl top nodes
```

Це покаже, чи має ваш дроплет s-2vcpu-4gb запас або працює на межі.

#### Readiness та liveness probes

Перевірте, що ваші K8s-маніфести включають health probes. Попросіть Claude:

```text
Check all deployments in k8s/ for readiness and liveness probes. If any are
missing, add them. Use HTTP GET /health for the web service (or TCP on port 3000
if no health endpoint exists).
```

Probes кажуть Kubernetes, коли ваш застосунок готовий приймати трафік (readiness) і коли він завис та потребує перезапуску (liveness). Без них K8s не має способу виявити завислий процес.

#### Health-статус ArgoCD

ArgoCD надає власну модель health поверх Kubernetes:

```bash
# Швидка перевірка статусу
kubectl get application ai-coderrank -n argocd

# Детальний health по кожному ресурсу
kubectl get application ai-coderrank -n argocd -o jsonpath='{.status.resources[*].health.status}' | tr ' ' '\n'
```

ArgoCD UI також показує health для кожного ресурсу у візуальному дереві. Зелений = healthy, жовтий = progressing, червоний = degraded.

#### Неперервний моніторинг з /loop

Об'єднайте все в моніторинговий цикл:

```text
/loop 1m check ArgoCD sync status, pod health, and resource usage for ai-coderrank.
Report any issues.
```

Це дає термінальний ops-дашборд, що оновлюється щохвилини. Використовуйте під час деплоїв, після змін конфігурації або коли щось підозрюєте.

---

### Крок 9: Налаштування запланованого health check з /schedule (~3 хв)

`/loop` чудовий для активного моніторингу, але що робити, коли ви спите? Тут на допомогу приходить `/schedule` — він створює хмарні задачі, що виконуються за cron-розкладом.

```text
/schedule create "ai-coderrank daily health check" --cron "0 9 * * *" \
  --prompt "Check the status of all pods in the default namespace. Verify the \
  ai-coderrank service is responding. Check ArgoCD sync status. If anything is \
  unhealthy, provide a summary of issues and suggested fixes."
```

Це створює запланованого агента, що запускається щодня о 9:00 ранку. Він:
1. Перевірить статус подів
2. Верифікує, що сервіс відповідає
3. Перевірить статус синхронізації ArgoCD
4. Звітує про проблеми

Перегляньте заплановані задачі:

```text
/schedule list
```

Та перевірте вивід останнього запуску:

```text
/schedule show "ai-coderrank daily health check"
```

> **Кейси використання окрім health checks**: Нічні сканування безпеки (`/schedule` промпт, що перевіряє CVE у залежностях). Щотижневі звіти по вартості. Щоденний аналіз логів. Будь-яка повторювана операційна задача, яку ви зазвичай автоматизували б cron job + скриптом, може бути запланованим агентом Claude.

---

### Крок 10: Віддалене керування — моніторинг з телефону (~2 хв)

Остання функція для фіналу. Claude Code підтримує віддалене керування для тієї самої сесії, в якій ви вже працюєте — ідеально для збереження контексту деплою на телефоні.

З поточної сесії Claude Code відкрийте сесію для віддаленого доступу:

```text
/remote-control ai-coderrank-rollout
```

Це дасть URL та QR-код. Відкрийте URL у браузері телефону або в Claude-додатку. Тепер у вас доступ до тієї самої сесії Claude Code, з тією самою історією та контекстом поточного розгортання, з телефону.

Спробуйте:
1. З телефону попросіть Claude перевірити статус подів
2. З телефону попросіть Claude перевірити статус синхронізації ArgoCD
3. З телефону запустіть `/loop 1m` для спостереження за кластером

Це дійсно корисно на практиці. Ви пушите деплой з ноутбука, закриваєте кришку та моніторите розгортання з телефону, поки йдете за кавою. Якщо щось піде не так — ви можете дослідити та навіть виконувати команди, все з мобільного браузера.

> **Коли це важливо**: П'ятничний вечірній деплой. Ви пушите зміну, запускаєте `/loop` для моніторингу, потім йдете до поїзда. З телефону ви спостерігаєте, як розгортання завершується. Ноутбук не потрібен. Це операційний спокій.

---

### Чекпоінт: Великий майлстоун

Підіб'ємо підсумки того, що ви щойно зробили:

**Інфраструктура**:
- ArgoCD працює на k3s
- `argocd/application.yaml` з'єднує ваш репо з кластером
- Авто-синхронізація з self-healing та pruning увімкнена
- NodePort відкриває застосунок публічно на порті 30080

**Воркфлоу**:
- Пуш у Git -> ArgoCD синхронізує -> застосунок оновлюється автоматично
- Жодного ручного `kubectl apply`
- Повний аудит-трейл у git-історії

**Моніторинг**:
- `/loop` для моніторингу синхронізації в реальному часі
- `/schedule` для щоденних health checks
- Віддалене керування для моніторингу з будь-якого пристрою

**Застосунок**:
- ai-coderrank із темною темою
- Живий в інтернеті на публічному IP дроплету
- Задеплоєний та керований повністю через GitOps

Ви почали цей курс із `claude` та порожнього терміналу. Тепер у вас повний, сучасний, production-grade пайплайн розробки та деплою. Код -> CI -> GitOps -> Live.

Надішліть URL другу. Серйозно. Покажіть їм. Ви це побудували.

---

### Troubleshooting

**ArgoCD показує статус "Unknown"**
Репо може бути приватним. Потрібно додати креденшали:
```bash
kubectl -n argocd create secret generic repo-ai-coderrank \
  --from-literal=url=https://github.com/YOUR_USER/ai-coderrank.git \
  --from-literal=username=YOUR_USER \
  --from-literal=password=YOUR_GITHUB_TOKEN
kubectl -n argocd label secret repo-ai-coderrank argocd.argoproj.io/secret-type=repository
```
Попросіть Claude допомогти згенерувати GitHub personal access token зі скоупом `repo`.

**ArgoCD показує "Degraded" health**
Зазвичай означає, що поди crashlooping. Перевірте:
```bash
kubectl get pods -n default
kubectl logs deployment/ai-coderrank -n default
```
Попросіть Claude діагностувати логи. Типові проблеми: відсутні змінні середовища, неправильний тег образу, невідповідність портів.

**Застосунок не відкривається за публічним IP**
Перевірте ланцюжок: Под працює? -> Service маршрутизує? -> NodePort відкритий? -> Фаєрвол відкритий?
```bash
kubectl get pods -n default
kubectl get svc -n default          # Перевірте, що NodePort 30080 у списку
curl http://localhost:30080          # Тест з самого дроплету
# Перевірте фаєрвол у консолі DO або через doctl — порт 30080 має бути дозволений
```

**ArgoCD синхронізація повільна**
За замовчуванням ArgoCD полить кожні 3 хвилини. Можна форсувати синхронізацію:
```bash
kubectl -n argocd patch application ai-coderrank \
  --type merge -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}'
```
Або налаштувати GitHub webhook для миттєвої синхронізації.

---

### Бонусні завдання

**Завдання 1: Синхронізація через webhook**
Налаштуйте GitHub webhook, щоб ArgoCD синхронізувався миттєво при пуші, а не полив кожні 3 хвилини. Попросіть Claude допомогти з URL webhook та секретом.

**Завдання 2: Ролбек через Git**
Зробіть ламаючу зміну (неправильний тег образу), запуште, спостерігайте, як ArgoCD деплоїть зламану версію. Потім `git revert` коміту, запуште знову, спостерігайте, як ArgoCD ролбечить. Весь ролбек — git-операція. Жодного `kubectl rollout undo`.

**Завдання 3: Додайте нотифікації ArgoCD**
Налаштуйте нотифікації ArgoCD, щоб надсилати Slack-повідомлення або email при завершенні чи фейлі синхронізації. Попросіть Claude допомогти з конфігурацією ConfigMap `argocd-notifications-cm`.

**Завдання 4: Мультисередовище**
Створіть структуру директорій `k8s/staging/` та `k8s/production/`. Створіть два ArgoCD Application — по одному на кожну директорію. Попросіть Claude допомогти реструктурувати маніфести.

---

> **Яка подорож.** Ви пройшли від `claude` до GitOps. Від читання коду до деплою його наживо в інтернет. Від одного інструменту до цілої екосистеми. Наступний і останній блок — просунуті патерни та що далі. Але якби ви зупинилися просто зараз, у вас уже був би повний, production-ready воркфлоу. Відмінна робота.

---

<div class="cta-block">
  <p>Готові перевірити засвоєне?</p>
  <a href="{{ '/ua/course/block-12-gitops/quiz/' | relative_url }}" class="hero-cta">Пройти квіз &rarr;</a>
</div>
