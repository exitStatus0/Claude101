---
layout: block-part
title: "Інфраструктура — k3s на DigitalOcean"
block_number: 7
description: "Практичні кроки для Блоку 07."
time: "~30 хвилин"
part_name: "Hands-On"
overview_url: /ua/course/block-07-infrastructure/
presentation_url: /ua/course/block-07-infrastructure/presentation/
hands_on_url: /ua/course/block-07-infrastructure/hands-on/
quiz_url: /ua/course/block-07-infrastructure/quiz/
permalink: /ua/course/block-07-infrastructure/hands-on/
locale: uk
translation_key: block-07-hands-on
---
> **Пряма мова:** "Все на цій практичній сторінці побудовано так, щоб ви могли повторювати за мною рядок за рядком. Коли бачите блок з командою або промптом, можете копіювати його прямо у термінал або сесію Claude, якщо я явно не скажу, що це лише довідковий матеріал. По ходу порівнюйте свій результат з моїм на екрані, щоб відловлювати помилки одразу, а не накопичувати їх."

> **Тривалість**: ~30 хвилин
> **Результат**: Дроплет DigitalOcean з k3s, на якому ai-coderrank задеплоєний як Kubernetes-поди.
> **Передумови**: Виконані блоки 0-6, акаунт DigitalOcean, пара SSH-ключів на локальній машині

---

### Крок 1: Генерація скрипта провізіонінгу дроплета (~5 хв)

Спершу попросимо Claude згенерувати скрипт, який створить дроплет за допомогою CLI DigitalOcean (`doctl`). Якщо ви надаєте перевагу веб-консолі, перейдіть до "Альтернатива через консоль" нижче.

Запустіть Claude Code та попросіть:

```text
Generate a shell script that provisions a DigitalOcean droplet with these specs:
- Name: k3s-coderrank
- Size: s-2vcpu-4gb
- Image: Ubuntu 22.04 (ubuntu-22-04-x64)
- Region: fra1 (or nyc1 — pick whichever is closer to me)
- SSH key: use my existing key from `doctl compute ssh-key list`
- Tags: course, k3s

The script should:
1. Check that doctl is installed and authenticated
2. List available SSH keys and let me pick one
3. Create the droplet
4. Wait for it to be active
5. Print the IP address at the end

Use doctl CLI commands.
```

Claude згенерує щось подібне:

```bash
#!/bin/bash
set -euo pipefail

# Check doctl is available
if ! command -v doctl &> /dev/null; then
  echo "doctl not found. Install: brew install doctl"
  exit 1
fi

# Verify authentication
doctl account get || { echo "Run: doctl auth init"; exit 1; }

# List SSH keys
echo "Available SSH keys:"
doctl compute ssh-key list --format ID,Name,FingerPrint
echo ""
read -p "Enter SSH key ID: " SSH_KEY_ID

# Create droplet
echo "Creating droplet..."
DROPLET_ID=$(doctl compute droplet create k3s-coderrank \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --region fra1 \
  --ssh-keys "$SSH_KEY_ID" \
  --tag-names "course,k3s" \
  --wait \
  --format ID \
  --no-header)

# Get IP
DROPLET_IP=$(doctl compute droplet get "$DROPLET_ID" --format PublicIPv4 --no-header)
echo ""
echo "Droplet created!"
echo "IP: $DROPLET_IP"
echo ""
echo "SSH: ssh root@$DROPLET_IP"
```

Перегляньте скрипт, а потім запустіть:

```bash
chmod +x provision-droplet.sh
./provision-droplet.sh
```

Збережіть IP-адресу — вона знадобиться на кожному наступному кроці.

#### Альтернатива через консоль

Якщо у вас не встановлений `doctl`, скористайтеся веб-консоллю DigitalOcean:

1. Перейдіть на https://cloud.digitalocean.com/droplets/new
2. **Region**: Frankfurt (fra1) або New York (nyc1)
3. **Image**: Ubuntu 22.04 (LTS) x64
4. **Size**: Basic > Regular > $24/mo (2 vCPU, 4 GB RAM, 80 GB SSD)
5. **Автентифікація**: SSH-ключ (додайте `~/.ssh/id_ed25519.pub`, якщо ще не додано)
6. **Hostname**: `k3s-coderrank`
7. **Tags**: `course`, `k3s`
8. Натисніть **Create Droplet**
9. Зачекайте ~60 секунд, скопіюйте IP-адресу

---

### Крок 2: SSH до дроплета (~2 хв)

```bash
ssh root@<YOUR_DROPLET_IP>
```

Якщо ви підключаєтеся вперше, з'явиться підтвердження відбитка ключа. Введіть `yes`.

Переконайтеся, що це чистий Ubuntu:

```bash
cat /etc/os-release   # Має показати Ubuntu 22.04
free -h               # Має показати ~4GB RAM
df -h                 # Має показати ~80GB диска
```

> **Порада**: Якщо SSH не працює з "Permission denied", переконайтеся, що SSH-ключ, обраний при створенні дроплета, відповідає ключу на вашому ноутбуці. Перевірте: `ssh -i ~/.ssh/id_ed25519 root@<IP>`

---

### Крок 3: Встановлення k3s (~3 хв)

Перебуваючи у SSH-сесії до дроплета, виконайте:

```bash
curl -sfL https://get.k3s.io | sh -
```

Ось і все. Одна команда. Зачекайте близько 30 секунд.

Що щойно відбулося:
- Завантажено бінарник k3s (~60MB)
- Встановлено до `/usr/local/bin/k3s`
- Створено systemd-сервіс (`k3s.service`)
- Запущено k3s server (control plane + worker в одному процесі)
- Згенеровано kubeconfig у `/etc/rancher/k3s/k3s.yaml`
- Задеплоєно системні компоненти: CoreDNS, Traefik, ServiceLB, Metrics Server

Можете попросити Claude пояснити будь-який з цих компонентів:

```text
What is each system component that k3s just installed? What does CoreDNS do? What about Traefik and ServiceLB?
```

---

### Крок 4: Перевірка кластера (~3 хв)

Все ще на дроплеті, виконайте:

```bash
kubectl get nodes
```

Ви маєте побачити:

```text
NAME             STATUS   ROLES                  AGE   VERSION
k3s-coderrank    Ready    control-plane,master   1m    v1.31.x+k3s1
```

Ключове слово — **Ready**. Якщо показує `NotReady`, зачекайте 30 секунд і спробуйте знову — k3s ще запускається.

Тепер перевірте системні поди:

```bash
kubectl get pods -A
```

Ви маєте побачити щось подібне:

```text
NAMESPACE     NAME                                      READY   STATUS    RESTARTS   AGE
kube-system   coredns-xxxxxxxxxx-xxxxx                   1/1     Running   0          2m
kube-system   local-path-provisioner-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
kube-system   metrics-server-xxxxxxxxxx-xxxxx            1/1     Running   0          2m
kube-system   svclb-traefik-xxxxx-xxxxx                  2/2     Running   0          2m
kube-system   traefik-xxxxxxxxxx-xxxxx                   1/1     Running   0          2m
```

Усі поди мають бути `Running` з `1/1` (або `2/2`) у колонці READY. Якщо якийсь под у стані `CrashLoopBackOff` або `Pending`, попросіть Claude допомогти:

```text
kubectl get pods -A shows this output:
<paste output>
One of the pods is in CrashLoopBackOff. What's going on and how do I fix it?
```

Вітаємо — у вас є працюючий Kubernetes-кластер. На одному сервері за $24/місяць. Менш ніж за 5 хвилин.

---

### Крок 5: Копіювання kubeconfig на ноутбук (~5 хв)

Зараз `kubectl` працює лише коли ви підключені по SSH до дроплета. Виправимо це, скопіювавши kubeconfig на ваш ноутбук.

**Вийдіть із SSH-сесії** (наберіть `exit` або натисніть `Ctrl+D`) і виконайте з локальної машини:

```bash
mkdir -p ~/.kube
scp root@<YOUR_DROPLET_IP>:/etc/rancher/k3s/k3s.yaml ~/.kube/config-do
```

Тепер потрібно відредагувати конфігураційний файл — наразі він вказує на `127.0.0.1`, що було правильним на дроплеті, але некоректно з вашого ноутбука. Попросіть Claude:

```text
I just copied my k3s kubeconfig to ~/.kube/config-do. It has server: https://127.0.0.1:6443 but I need it to point to my droplet at <YOUR_DROPLET_IP>. Update the file and show me how to use it with kubectl.
```

Claude зробить наступне:
1. Прочитає файл
2. Замінить `127.0.0.1` на IP вашого дроплета
3. Покаже, як встановити змінну оточення `KUBECONFIG`

Результат:

```bash
# Use this kubeconfig
export KUBECONFIG=~/.kube/config-do

# Verify it works
kubectl get nodes
```

Ви маєте побачити вашу ноду дроплета, як і раніше — але тепер з вашого ноутбука.

> **Порада**: Щоб зробити це постійним, додайте export до вашого `~/.zshrc` або `~/.bashrc`. Або використовуйте змінну `KUBECONFIG` для об'єднання конфігурацій:
> ```bash
> export KUBECONFIG=~/.kube/config:~/.kube/config-do
> kubectl config get-contexts   # Показує всі доступні кластери
> kubectl config use-context default  # Перемикання між кластерами
> ```

---

### Крок 6: Деплой ai-coderrank (~7 хв)

Тепер — винагорода. Переконайтеся, що ваш `KUBECONFIG` вказує на кластер DO, потім деплойте з директорії проєкту ai-coderrank:

```bash
cd ~/ai-coderrank
export KUBECONFIG=~/.kube/config-do
```

Перед деплоєм перегляньмо, що ми збираємося застосувати. Попросіть Claude:

```text
Look at the k8s/ directory and explain what each manifest does. What resources will be created when I run kubectl apply -k k8s/?
```

Claude прочитає файл Kustomization та кожен маніфест, пояснюючи:
- **Namespace** — ізольоване середовище для застосунку
- **Deployment** — поди застосунку та їх конфігурація
- **Service** — внутрішня мережа для доступу до подів
- **ConfigMap** — конфігураційні дані
- **PVC** — запити на постійне сховище
- **CronJob** — заплановані завдання (якщо є)

Тепер деплоймо:

```bash
kubectl apply -k k8s/
```

Ви маєте побачити вивід на кшталт:

```text
namespace/ai-coderrank created
configmap/ai-coderrank-config created
persistentvolumeclaim/ai-coderrank-pvc created
deployment.apps/ai-coderrank created
service/ai-coderrank created
cronjob.batch/ai-coderrank-cron created
```

Якщо отримуєте помилки, вставте їх у Claude:

```text
I ran kubectl apply -k k8s/ and got this error:
<paste error>
How do I fix this?
```

Типові проблеми:
- **Помилки завантаження образу**: Docker-образ може ще не бути в реєстрі. Claude допоможе запушити його в Docker Hub або GitHub Container Registry.
- **Квота ресурсів**: Дроплету може не вистачати ресурсів. Claude допоможе скоригувати resource requests у деплойменті.

---

### Крок 7: Перевірка деплойменту (~5 хв)

Перевірте, що поди запущені:

```bash
kubectl get pods -n ai-coderrank
```

Очікуваний вивід:

```text
NAME                            READY   STATUS    RESTARTS   AGE
ai-coderrank-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
```

Якщо под у стані `ImagePullBackOff`, образ ще недоступний. Попросіть Claude:

```text
My pod is in ImagePullBackOff. The deployment references image ai-coderrank:latest. How do I build and push this image to a registry so my k3s cluster can pull it?
```

Якщо под у стані `Running`, зробимо port-forward для тесту:

```bash
kubectl port-forward -n ai-coderrank svc/ai-coderrank 3000:3000
```

Тепер відкрийте браузер і перейдіть на **http://localhost:3000**. Ви маєте побачити застосунок ai-coderrank — той самий, що працював локально, але тепер обслуговується подами на вашому дроплеті DigitalOcean.

Натисніть `Ctrl+C`, щоб зупинити port-forward, коли закінчите.

Перевірте повний стан деплойменту:

```bash
kubectl get all -n ai-coderrank
```

Це покаже поди, сервіси, деплойменти та replica sets — повну картину вашого застосунку в кластері.

---

### Контрольна точка

Тепер у вас є:

```text
Ваш ноутбук                         DigitalOcean (fra1)
+--------------+                     +---------------------------+
|  kubectl     | ──── KUBECONFIG ──> |  k3s-coderrank            |
|  (config-do) |                     |  Ubuntu 22.04 + k3s       |
+--------------+                     |                           |
                                     |  Namespace: ai-coderrank  |
                                     |  - Deployment (running)   |
                                     |  - Service (ClusterIP)    |
                                     |  - ConfigMap              |
                                     |  - PVC                    |
                                     +---------------------------+
```

Застосунок задеплоєний, але **не має публічного доступу**. Це буде у Блоці 12, де ми налаштуємо ArgoCD для GitOps та відкриємо застосунок через NodePort на публічному IP дроплета.

Наразі доступ до застосунку — через `kubectl port-forward`. Це нормально — це доводить, що деплоймент працює.

---

### Бонусні завдання

**Завдання 1: Попросіть Claude діагностувати кластер**
```text
Run a health check on my k3s cluster. Check node resources (CPU, memory, disk), 
pod status across all namespaces, and any warning events. Give me a summary 
of the cluster's health.
```

**Завдання 2: Масштабування деплойменту**
```text
Scale the ai-coderrank deployment to 2 replicas and show me that both pods 
are running on the same node.
```

**Завдання 3: Генерація скрипта видалення**
Попросіть Claude згенерувати скрипт, який чисто видаляє все — namespace, k3s та опціонально дроплет:
```text
Generate a cleanup script that:
1. Deletes the ai-coderrank namespace
2. Uninstalls k3s from the droplet
3. Optionally destroys the droplet using doctl
Include safety prompts before destructive actions.
```

---

> **Далі**: У Блоці 8 ми навчимо Claude Code рефлексам — хуки, які автоматично форматують код, блокують небезпечні зміни та сповіщують вас про завершення тривалих завдань. Автоматизація, що спрацьовує навіть без вашої думки про неї.

---

<div class="cta-block">
  <p>Готові перевірити свої знання?</p>
  <a href="{{ '/ua/course/block-07-infrastructure/quiz/' | relative_url }}" class="hero-cta">Пройти тест &rarr;</a>
</div>
