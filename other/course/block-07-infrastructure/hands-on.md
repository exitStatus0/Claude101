---
layout: block-part
title: "Инфраструктура — k3s на DigitalOcean — Практика"
block_number: 7
part_name: "Hands-On"
locale: ru
translation_key: block-07-hands-on
overview_url: /other/course/block-07-infrastructure/
presentation_url: /other/course/block-07-infrastructure/presentation/
hands_on_url: /other/course/block-07-infrastructure/hands-on/
quiz_url: /other/course/block-07-infrastructure/quiz/
permalink: /other/course/block-07-infrastructure/hands-on/
---
> **Прямая речь:** "Всё на этой странице практики построено так, чтобы вы могли повторять за мной строка за строкой. Когда видите блок с командой или промптом, можете копировать его прямо в терминал или сессию Claude, если я явно не укажу, что это справочный материал. По ходу работы сравнивайте свой результат с моим на экране, чтобы ловить ошибки сразу, а не копить их."

> **Продолжительность**: ~30 минут
> **Результат**: Дроплет DigitalOcean с k3s и задеплоенным ai-coderrank в виде подов Kubernetes.
> **Предварительные требования**: Пройдены Блоки 0-6, аккаунт DigitalOcean, пара SSH-ключей на локальной машине

---

### Шаг 1: Генерация скрипта провизионирования дроплета (~5 мин)

Для начала попросим Claude сгенерировать скрипт, который создаст наш дроплет через CLI DigitalOcean (`doctl`). Если предпочитаете веб-консоль, переходите к разделу "Альтернатива через консоль" ниже.

Запустите Claude Code и попросите:

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

Claude сгенерирует что-то вроде этого:

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

Просмотрите скрипт, затем запустите:

```bash
chmod +x provision-droplet.sh
./provision-droplet.sh
```

Сохраните IP-адрес -- он понадобится на каждом последующем шаге.

#### Альтернатива через консоль

Если `doctl` не установлен, используйте веб-консоль DigitalOcean:

1. Перейдите на https://cloud.digitalocean.com/droplets/new
2. **Регион**: Frankfurt (fra1) или New York (nyc1)
3. **Образ**: Ubuntu 22.04 (LTS) x64
4. **Размер**: Basic > Regular > $24/мес (2 vCPU, 4 ГБ RAM, 80 ГБ SSD)
5. **Аутентификация**: SSH Key (добавьте `~/.ssh/id_ed25519.pub`, если его ещё нет)
6. **Имя хоста**: `k3s-coderrank`
7. **Теги**: `course`, `k3s`
8. Нажмите **Create Droplet**
9. Подождите ~60 секунд, скопируйте IP-адрес

---

### Шаг 2: SSH на дроплет (~2 мин)

```bash
ssh root@<YOUR_DROPLET_IP>
```

Если подключаетесь впервые, появится запрос подтверждения отпечатка. Введите `yes`.

Убедитесь, что вы на чистой Ubuntu-машине:

```bash
cat /etc/os-release   # Should show Ubuntu 22.04
free -h               # Should show ~4GB RAM
df -h                 # Should show ~80GB disk
```

> **Совет**: Если SSH не подключается с ошибкой "Permission denied", убедитесь, что SSH-ключ, выбранный при создании дроплета, совпадает с ключом на ноутбуке. Проверьте: `ssh -i ~/.ssh/id_ed25519 root@<IP>`

---

### Шаг 3: Установка k3s (~3 мин)

Оставаясь в SSH-сессии на дроплете, выполните:

```bash
curl -sfL https://get.k3s.io | sh -
```

Вот и всё. Одна команда. Подождите около 30 секунд.

Что только что произошло:
- Скачан бинарник k3s (~60 МБ)
- Установлен в `/usr/local/bin/k3s`
- Создан systemd-сервис (`k3s.service`)
- Запущен сервер k3s (control plane + worker в одном процессе)
- Сгенерирован kubeconfig в `/etc/rancher/k3s/k3s.yaml`
- Задеплоены системные компоненты: CoreDNS, Traefik, ServiceLB, Metrics Server

Вы можете попросить Claude объяснить любой из этих компонентов:

```text
What is each system component that k3s just installed? What does CoreDNS do? What about Traefik and ServiceLB?
```

---

### Шаг 4: Проверка кластера (~3 мин)

Всё ещё на дроплете, выполните:

```bash
kubectl get nodes
```

Вы должны увидеть:

```text
NAME             STATUS   ROLES                  AGE   VERSION
k3s-coderrank    Ready    control-plane,master   1m    v1.31.x+k3s1
```

Ключевое слово -- **Ready**. Если показывает `NotReady`, подождите 30 секунд и попробуйте снова -- k3s ещё запускается.

Теперь проверьте системные поды:

```bash
kubectl get pods -A
```

Вы должны увидеть что-то вроде:

```text
NAMESPACE     NAME                                      READY   STATUS    RESTARTS   AGE
kube-system   coredns-xxxxxxxxxx-xxxxx                   1/1     Running   0          2m
kube-system   local-path-provisioner-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
kube-system   metrics-server-xxxxxxxxxx-xxxxx            1/1     Running   0          2m
kube-system   svclb-traefik-xxxxx-xxxxx                  2/2     Running   0          2m
kube-system   traefik-xxxxxxxxxx-xxxxx                   1/1     Running   0          2m
```

Все поды должны быть `Running` с `1/1` (или `2/2`) в колонке READY. Если какой-то под в состоянии `CrashLoopBackOff` или `Pending`, попросите Claude помочь:

```text
kubectl get pods -A shows this output:
<paste output>
One of the pods is in CrashLoopBackOff. What's going on and how do I fix it?
```

Поздравляем -- у вас работающий Kubernetes-кластер. На одном сервере за $24/месяц. Менее чем за 5 минут.

---

### Шаг 5: Копирование kubeconfig на ноутбук (~5 мин)

Сейчас `kubectl` работает только при SSH-подключении к дроплету. Давайте это исправим, скопировав kubeconfig на ваш ноутбук.

**Выйдите из SSH-сессии** (наберите `exit` или нажмите `Ctrl+D`) и выполните с локальной машины:

```bash
mkdir -p ~/.kube
scp root@<YOUR_DROPLET_IP>:/etc/rancher/k3s/k3s.yaml ~/.kube/config-do
```

Теперь нужно отредактировать файл конфига -- сейчас он указывает на `127.0.0.1`, что было правильно на дроплете, но неверно с вашего ноутбука. Попросите Claude:

```text
I just copied my k3s kubeconfig to ~/.kube/config-do. It has server: https://127.0.0.1:6443 but I need it to point to my droplet at <YOUR_DROPLET_IP>. Update the file and show me how to use it with kubectl.
```

Claude:
1. Прочитает файл
2. Заменит `127.0.0.1` на IP вашего дроплета
3. Покажет, как установить переменную окружения `KUBECONFIG`

Результат:

```bash
# Use this kubeconfig
export KUBECONFIG=~/.kube/config-do

# Verify it works
kubectl get nodes
```

Вы должны увидеть узел вашего дроплета, как и раньше -- но теперь с вашего ноутбука.

> **Совет продвинутым**: Чтобы сделать это постоянным, добавьте export в `~/.zshrc` или `~/.bashrc`. Или используйте переменную `KUBECONFIG` для объединения конфигов:
> ```bash
> export KUBECONFIG=~/.kube/config:~/.kube/config-do
> kubectl config get-contexts   # Shows all available clusters
> kubectl config use-context default  # Switch between clusters
> ```

---

### Шаг 6: Деплой ai-coderrank (~7 мин)

Теперь награда. Убедитесь, что ваш `KUBECONFIG` указывает на DO-кластер, затем задеплойте из директории проекта ai-coderrank:

```bash
cd ~/ai-coderrank
export KUBECONFIG=~/.kube/config-do
```

Перед деплоем давайте посмотрим, что мы собираемся применить. Попросите Claude:

```text
Look at the k8s/ directory and explain what each manifest does. What resources will be created when I run kubectl apply -k k8s/?
```

Claude прочитает Kustomization-файл и каждый манифест, объяснив:
- **Namespace** -- изолированная среда для приложения
- **Deployment** -- поды приложения и их конфигурация
- **Service** -- внутренняя сеть для доступа к подам
- **ConfigMap** -- конфигурационные данные
- **PVC** -- запросы на постоянное хранилище
- **CronJob** -- запланированные задачи (если есть)

Теперь деплоим:

```bash
kubectl apply -k k8s/
```

Вы должны увидеть вывод вроде:

```text
namespace/ai-coderrank created
configmap/ai-coderrank-config created
persistentvolumeclaim/ai-coderrank-pvc created
deployment.apps/ai-coderrank created
service/ai-coderrank created
cronjob.batch/ai-coderrank-cron created
```

Если возникли ошибки, вставьте их в Claude:

```text
I ran kubectl apply -k k8s/ and got this error:
<paste error>
How do I fix this?
```

Частые проблемы:
- **Ошибки загрузки образа**: Docker-образ может быть ещё не в реестре. Claude поможет запушить его в Docker Hub или GitHub Container Registry.
- **Квота ресурсов**: На дроплете может не хватать ресурсов. Claude поможет скорректировать запросы ресурсов в деплойменте.

---

### Шаг 7: Проверка деплоя (~5 мин)

Проверьте, что поды запущены:

```bash
kubectl get pods -n ai-coderrank
```

Ожидаемый вывод:

```text
NAME                            READY   STATUS    RESTARTS   AGE
ai-coderrank-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
```

Если под в состоянии `ImagePullBackOff`, образ ещё недоступен. Спросите Claude:

```text
My pod is in ImagePullBackOff. The deployment references image ai-coderrank:latest. How do I build and push this image to a registry so my k3s cluster can pull it?
```

Если под `Running`, сделаем port-forward для проверки:

```bash
kubectl port-forward -n ai-coderrank svc/ai-coderrank 3000:3000
```

Теперь откройте браузер и перейдите на **http://localhost:3000**. Вы должны увидеть приложение ai-coderrank -- то же самое приложение, которое вы запускали локально, но теперь оно обслуживается из подов на вашем дроплете DigitalOcean.

Нажмите `Ctrl+C`, чтобы остановить port-forward, когда закончите.

Проверьте полный статус деплоя:

```bash
kubectl get all -n ai-coderrank
```

Это покажет поды, сервисы, деплойменты и реплика-сеты -- полную картину вашего приложения в кластере.

---

### Контрольная точка

Теперь у вас есть:

```text
Your Laptop                          DigitalOcean (fra1)
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

Приложение задеплоено, но **ещё не открыто для публичного доступа**. Это будет в Блоке 12, где мы настроим ArgoCD для GitOps и откроем приложение через NodePort на публичном IP вашего дроплета.

Пока вы обращаетесь к приложению через `kubectl port-forward`. Этого достаточно -- это доказывает, что деплой работает.

---

### Бонусные задания

**Задание 1: Попросите Claude провести диагностику кластера**
```text
Run a health check on my k3s cluster. Check node resources (CPU, memory, disk), 
pod status across all namespaces, and any warning events. Give me a summary 
of the cluster's health.
```

**Задание 2: Масштабирование деплоя**
```text
Scale the ai-coderrank deployment to 2 replicas and show me that both pods 
are running on the same node.
```

**Задание 3: Генерация скрипта очистки**
Попросите Claude сгенерировать скрипт, который чисто удалит всё -- удалит namespace, деинсталлирует k3s и опционально уничтожит дроплет:
```text
Generate a cleanup script that:
1. Deletes the ai-coderrank namespace
2. Uninstalls k3s from the droplet
3. Optionally destroys the droplet using doctl
Include safety prompts before destructive actions.
```

---

> **Далее**: В Блоке 8 мы научим Claude Code рефлексам -- хуки, которые автоматически форматируют код, блокируют опасные правки и уведомляют вас, когда долгие задачи завершаются. Автоматизация, которая срабатывает даже без вашего участия.

---

<div class="cta-block">
  <p>Готовы проверить себя?</p>
  <a href="{{ '/other/course/block-07-infrastructure/quiz/' | relative_url }}" class="hero-cta">Пройти квиз &rarr;</a>
</div>
