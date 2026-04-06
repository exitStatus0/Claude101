---
layout: default
title: "Курс — Все блоки"
locale: ru
translation_key: course-index
permalink: /other/course/
---

<section class="section">
<div class="container container--narrow">

<h1>Блоки курса</h1>
<p style="font-size: 1.15rem; color: var(--text-secondary); margin-bottom: var(--space-2xl);">
  14 блоков, от первой команды <code>claude</code> до живого деплоя в интернете.
  Каждый блок строится на предыдущем. Пропускать нельзя.
</p>

<ul class="toc-list">
  <li class="toc-item">
    <a href="{{ '/other/course/block-00-welcome/' | relative_url }}">
      <span class="toc-number">00</span>
      <div>
        <span class="toc-title">Добро пожаловать и настройка</span>
        <span class="toc-desc">Установите Claude Code, авторизуйтесь и проведите первый диалог с ИИ.</span>
      </div>
    </a>
  </li>
  <li class="toc-item">
    <a href="{{ '/other/course/block-01-understanding/' | relative_url }}">
      <span class="toc-number">01</span>
      <div>
        <span class="toc-title">Понимание кодовой базы</span>
        <span class="toc-desc">Пусть Claude проанализирует проект, сгенерирует CLAUDE.md и исследует архитектуру.</span>
      </div>
    </a>
  </li>
  <li class="toc-item">
    <a href="{{ '/other/course/block-02-running-testing/' | relative_url }}">
      <span class="toc-number">02</span>
      <div>
        <span class="toc-title">Запуск и локальное тестирование</span>
        <span class="toc-desc">npm install, dev-сервер, тесты, Docker build — и обработка ошибок через Claude.</span>
      </div>
    </a>
  </li>
  <li class="toc-item">
    <a href="{{ '/other/course/block-03-planning-adrs/' | relative_url }}">
      <span class="toc-number">03</span>
      <div>
        <span class="toc-title">Планирование с ADR и диаграммами</span>
        <span class="toc-desc">Режим планирования, Architecture Decision Records и Mermaid-диаграммы инфраструктуры.</span>
      </div>
    </a>
  </li>
  <li class="toc-item">
    <a href="{{ '/other/course/block-04-making-changes/' | relative_url }}">
      <span class="toc-number">04</span>
      <div>
        <span class="toc-title">Внесение изменений — тёмная тема</span>
        <span class="toc-desc">Реализуйте тёмную тему, просмотрите локально и закоммитьте с Claude.</span>
      </div>
    </a>
  </li>
  <li class="toc-item">
    <a href="{{ '/other/course/block-05-memory/' | relative_url }}">
      <span class="toc-number">05</span>
      <div>
        <span class="toc-title">Память и интеллект проекта</span>
        <span class="toc-desc">Научите Claude вашим предпочтениям, командным правилам и конвенциям проекта.</span>
      </div>
    </a>
  </li>
  <li class="toc-item">
    <a href="{{ '/other/course/block-06-skills/' | relative_url }}">
      <span class="toc-number">06</span>
      <div>
        <span class="toc-title">Пользовательские навыки — плейбук вашей команды</span>
        <span class="toc-desc">Создайте переиспользуемые slash-команды для ревью K8s, аудита Docker и не только.</span>
      </div>
    </a>
  </li>
  <li class="toc-item">
    <a href="{{ '/other/course/block-07-infrastructure/' | relative_url }}">
      <span class="toc-number">07</span>
      <div>
        <span class="toc-title">Инфраструктура — k3s на DigitalOcean</span>
        <span class="toc-desc">Создайте дроплет, установите k3s, разверните приложение в Kubernetes.</span>
      </div>
    </a>
  </li>
  <li class="toc-item">
    <a href="{{ '/other/course/block-08-hooks/' | relative_url }}">
      <span class="toc-number">08</span>
      <div>
        <span class="toc-title">Хуки — автоматизация воркфлоу</span>
        <span class="toc-desc">Автоформатирование, уведомления и блокировка опасных команд на событиях жизненного цикла.</span>
      </div>
    </a>
  </li>
  <li class="toc-item">
    <a href="{{ '/other/course/block-09-mcp/' | relative_url }}">
      <span class="toc-number">09</span>
      <div>
        <span class="toc-title">MCP-серверы — внешние инструменты</span>
        <span class="toc-desc">Подключите Claude к GitHub, файловым системам и внешним API через MCP.</span>
      </div>
    </a>
  </li>
  <li class="toc-item">
    <a href="{{ '/other/course/block-10-github-actions/' | relative_url }}">
      <span class="toc-number">10</span>
      <div>
        <span class="toc-title">GitHub Actions и CI/CD</span>
        <span class="toc-desc">Автоматическое ревью PR, реализация issues и Claude в вашем пайплайне.</span>
      </div>
    </a>
  </li>
  <li class="toc-item">
    <a href="{{ '/other/course/block-11-subagents/' | relative_url }}">
      <span class="toc-number">11</span>
      <div>
        <span class="toc-title">Субагенты — специализированные работники</span>
        <span class="toc-desc">Создайте ИИ-работников для ревью безопасности, валидации K8s и параллельных задач.</span>
      </div>
    </a>
  </li>
  <li class="toc-item">
    <a href="{{ '/other/course/block-12-gitops/' | relative_url }}">
      <span class="toc-number">12</span>
      <div>
        <span class="toc-title">Финал GitOps — ArgoCD и живой деплой</span>
        <span class="toc-desc">Грандиозный финал. Push в git, ArgoCD синхронизирует, ваше приложение становится доступно.</span>
      </div>
    </a>
  </li>
  <li class="toc-item">
    <a href="{{ '/other/course/block-13-advanced/' | relative_url }}">
      <span class="toc-number">13</span>
      <div>
        <span class="toc-title">Продвинутые паттерны и что дальше</span>
        <span class="toc-desc">Команды агентов, плагины, headless-режим и полная экосистема Claude Code.</span>
      </div>
    </a>
  </li>
</ul>

</div>
</section>
