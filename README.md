# Cut Optimizer

[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](https://unlicense.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)](https://vite.dev/)
[![Single file](https://img.shields.io/badge/build-single--file-313KB-green.svg)](#production-сборка)

Веб-приложение для ручного и автоматического раскроя листовых материалов. Подходит для ЛДСП, МДФ, фанеры, пластика, композита, металла и других прямоугольных заготовок.

Приложение работает полностью в браузере и помогает построить карту раскроя, оценить использование материала, площадь отходов и примерное количество резов.

## Создание проекта

Проект был создан с помощью нейросетей и при содействии следующих инструментов и моделей:

- Claude Sonnet 4.6;
- Google Gemini 3 Flash;
- ChatGPT Codex;
- Agent [arena.ai](https://arena.ai).

## Возможности

### Автоматический раскрой

- ввод списка деталей: название, размеры и количество;
- поворот деталей на 90°;
- автоматическое добавление листов одного размера;
- работа с фиксированным набором листов разных размеров;
- учёт ширины пропила;
- несколько алгоритмов упаковки деталей;
- отображение деталей, отходов и неразмещённых позиций;
- расчёт КПД, площади деталей, площади отходов и количества резов.

### Ручной раскрой

- создание листов произвольного размера;
- вертикальные и горизонтальные резы;
- рез мышью с привязкой к заданному шагу;
- ввод размера реза с клавиатуры;
- назначение названий фрагментам;
- удаление и снятие назначения с деталей;
- выбор листов в проекте;
- масштабирование и панорамирование карты.

### Работа с проектом

- отмена действий через `Ctrl+Z`;
- горячие клавиши для выбора, реза и удаления;
- сохранение проекта в JSON;
- загрузка проекта из JSON;
- печать карты раскроя или сохранение через системный диалог печати в PDF;
- сводная спецификация деталей;
- адаптивный интерфейс для мобильных устройств;
- русский и английский языки.

## Алгоритмы автоматической упаковки

В автоматическом режиме доступны следующие варианты:

- **MaxRects** — размещение по свободным прямоугольным областям с перебором эвристик и порядков сортировки;
- **Guillotine** — гильотинное размещение с приоритетом крупных остатков;
- **Strip** — размещение деталей рядами;
- **Skyline** — размещение по профилю высот;
- **Авто-лучший** — перебор доступных вариантов и выбор результата с наилучшим показателем.

При размещении учитываются размеры листа, ширина пропила, количество деталей и разрешённый поворот.

## Интерфейс

Приложение состоит из трёх основных областей:

1. **Спецификация** — список назначенных деталей, КПД текущего листа и предупреждения о неразмещённых деталях.
2. **Холст** — визуальная карта листа, детали и отходы.
3. **Панель инструментов** — создание листов, настройка раскроя, список деталей, выбор алгоритма и результаты расчёта.

На небольших экранах панели переключаются кнопками «Панель» и «Специф.».

## Запуск проекта

Требуется Node.js и npm.

Установить зависимости:

```bash
npm install
```

Запустить dev-сервер:

```bash
npm run dev
```

После запуска Vite выведет локальный адрес приложения в терминале.

## Production-сборка

Собрать приложение:

```bash
npm run build
```

Результат будет создан в каталоге `dist/`. Конфигурация использует `vite-plugin-singlefile`, поэтому клиентские ресурсы встраиваются в итоговый HTML-файл.

Для локальной проверки production-сборки:

```bash
npm run preview
```

## Сценарий автоматического раскроя

1. Откройте режим **Авто**.
2. Выберите режим листов:
   - автоматическое добавление листов;
   - несколько заготовок.
3. Укажите размеры листа и ширину пропила.
4. Добавьте детали, их размеры и количество.
5. При необходимости отключите поворот отдельных деталей.
6. Выберите алгоритм или оставьте **Авто-лучший**.
7. Нажмите **Рассчитать раскрой**.
8. Изучите карту, КПД, отходы и список деталей, которые не вошли.

## Сценарий ручного раскроя

1. Откройте режим **Ручной**.
2. Создайте лист и задайте его размеры.
3. Выберите фрагмент на холсте.
4. Выполните рез двойным кликом, кнопкой или клавишей `Enter`.
5. Выберите вертикальное или горизонтальное направление реза.
6. Назначьте получившемуся фрагменту название детали.
7. При необходимости повторите операцию для остальных фрагментов.

## Управление холстом

- клик — выбрать фрагмент;
- двойной клик — выполнить рез в ручном режиме;
- `Ctrl` + колесо — изменить масштаб;
- колесо — изменить направление реза в ручном режиме;
- `Alt` + перетаскивание — переместить карту;
- `Tab` — выбрать следующий фрагмент;
- `Delete` или `Backspace` — удалить выбранный фрагмент;
- `Enter` — выполнить рез;
- `Escape` — снять выделение;
- `Ctrl+Z` — отменить действие.

## Технологии

- React 19;
- TypeScript;
- Vite;
- Tailwind CSS 4;
- Canvas API;
- `vite-plugin-singlefile`.

Backend не используется: расчёты и состояние проекта выполняются на стороне клиента.

## Структура проекта

```text
index.html              Базовый HTML-шаблон
src/main.tsx            Точка входа приложения
src/App.tsx             Основной интерфейс и логика приложения
src/i18n.ts             Переводы
src/index.css           Подключение Tailwind CSS
src/utils/autoPack.ts   Алгоритмы автоматического раскроя
src/utils/cn.ts         Утилиты для CSS-классов
public/                 Иконки и статические файлы
vite.config.ts          Конфигурация Vite
package.json            Зависимости и команды проекта
```

## Ограничения

- приложение работает с прямоугольными деталями и листами;
- расчёт количества резов является оценочным;
- результат автоматической упаковки зависит от выбранного алгоритма;
- перед производственным раскроем следует проверить карту с учётом реального оборудования, припусков, направления текстуры и технологических ограничений.

## Лицензия

Проект распространяется по лицензии **The Unlicense** и передан в общественное достояние.

Его можно бесплатно использовать, копировать, изменять, публиковать, распространять и продавать, в том числе в коммерческих проектах, без необходимости получать дополнительное разрешение или указывать автора.

Полный текст лицензии находится в файле [`LICENSE`](LICENSE).

---

# Cut Optimizer — English

Cut Optimizer is a browser-based tool for manual and automatic cutting layouts of sheet materials such as chipboard, MDF, plywood, plastic, composite and metal.

## Features

- **Automatic nesting** — enter parts (name, dimensions, quantity), with optional 90° rotation, kerf width, and several packing algorithms (MaxRects, Guillotine, Strip, Skyline, Auto-best).
- **Manual cutting** — create sheets of any size, cut vertically or horizontally, snap cuts to a configurable grid, name fragments, undo freely.
- **Project workflow** — undo/redo, hotkeys, save/load as JSON, print or export the cutting map to PDF via the system dialog, summary specification, mobile-friendly UI.
- **Browser-only** — no backend, no build of an API. Calculations and project state run entirely on the client.
- **i18n** — Russian, English, Spanish, German, French, Chinese out of the box. The selected language is persisted in the browser.
- **Single-file production build** — thanks to `vite-plugin-singlefile` the whole app ships as one self-contained `index.html` (~313 KB / ~92 KB gzip). Drop it on any static host (GitHub Pages, Vercel, Netlify, S3) or open it from disk.

## Project creation

This project was created with the help of AI using the following tools and models:

- Claude Sonnet 4.6;
- Google Gemini 3 Flash;
- ChatGPT Codex;
- Agent [arena.ai](https://arena.ai).

## Quick start

### Linux

```bash
sudo apt update
sudo apt install -y nodejs npm
git clone <repository-url>
cd cut-optimizer
npm ci
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

For a production build:

```bash
npm run check
npm run build
npm run preview
```

### Windows PowerShell

Install the current Node.js LTS from https://nodejs.org, then run:

```powershell
git clone <repository-url>
cd cut-optimizer
npm ci
npm run dev
```

Open the URL printed by Vite. For a production build:

```powershell
npm run check
npm run build
npm run preview
```

## Supported interface languages

The interface includes Russian, English, Spanish, German, French and Chinese. Use the language selector in the top bar; the selected language is saved in the browser.

## Public deployment with Vercel

1. Import the GitHub repository into Vercel.
2. Keep the framework preset as **Vite**.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist` (or leave it to automatic detection).
5. Deploy the project.

Vercel provides HTTPS, CDN delivery and preview deployments automatically.
