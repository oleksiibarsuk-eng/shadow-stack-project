# Instructions: как всё работает и что ещё подключить

Полное руководство по текущему состоянию `shadow-stack-project`: из чего собран, как работает, как пользоваться памятью, и что имеет смысл добавить дальше.

---

## 1. Архитектура проекта

```
shadow-stack-project/
├── .github/workflows/ci.yml    # CI: npm ci + npm run build на push/PR в main
├── .claude/settings.json       # включает MCP-серверы из .mcp.json
├── .mcp.json                   # MCP-серверы (Obsidian, Memory, Doppler)
├── src/
│   ├── App.jsx                 # корневой компонент
│   ├── App.css                 # стили компонента
│   └── main.jsx                # entry, монтирует <App /> в #root
├── index.html                  # Vite HTML entry
├── vite.config.js              # @vitejs/plugin-react, всё остальное — дефолт
├── eslint.config.js            # flat-config ESLint 9
├── CLAUDE.md                   # память проекта для Claude Code
├── README.md                   # документация для людей
└── package.json                # React 19, Vite 6, ESLint 9
```

Поток выполнения: `index.html` → `/src/main.jsx` → `ReactDOM.createRoot(#root).render(<App />)` → `App.jsx` с импортом `App.css`.

---

## 2. Быстрый старт

```bash
npm ci                    # поставить зависимости строго из lock-файла
npm run dev               # Vite dev server → http://localhost:5173
npm run build             # production bundle в dist/
npm run preview           # preview собранного bundle локально
npm run lint              # ESLint (flat config)
```

CI прогоняет `npm ci` и `npm run build` на GitHub Actions при push/PR в `main`.

---

## 3. Трёхслойная память

Все три слоя работают **параллельно**, дополняя друг друга:

### Слой 1: `CLAUDE.md` (локальная память проекта)

- Файл `CLAUDE.md` в корне, закоммичен в git
- Claude Code читает его **автоматически** в начале каждой сессии внутри репо
- Живёт рядом с кодом, версионируется, видна в PR-ревью
- **Лучше всего для**: команды запуска, соглашения, стек, высокоуровневая архитектура

### Слой 2: Obsidian MCP (knowledge base)

- Конфиг: `.mcp.json` → сервер `obsidian`
- Данные: `~/ObsidianVault/` (структура: `Projects/`, `Daily/`, `References/`)
- Claude читает/пишет markdown напрямую в vault через MCP-инструменты
- Vault можно открыть в **Obsidian Desktop** для графа знаний, backlinks, поиска
- **Лучше всего для**: многопроектные заметки, идеи, ссылки между темами, дневник сессий

### Слой 3: MCP Memory (knowledge graph, бесплатно)

- Конфиг: `.mcp.json` → сервер `memory`
- Пакет: `@modelcontextprotocol/server-memory` (официальный, от Anthropic)
- Хранит факты локально в виде knowledge graph (сущности + связи)
- Бесплатный, без ключей, без платных подписок
- **Лучше всего для**: запоминание фактов между сессиями, preferences, контекст

### Слой 4: Doppler MCP (secrets management)

- Конфиг: `.mcp.json` → сервер `doppler`
- Централизованное хранение и синхронизация секретов (API-ключи, токены, env-переменные)
- Требует `DOPPLER_TOKEN` или предварительный `npx @dopplerhq/mcp-server login`
- **Лучше всего для**: управление секретами между средами (dev/staging/prod), командная работа

**Рекомендованная стратегия:**

| Что запоминать                                | Куда                                 |
| --------------------------------------------- | ------------------------------------ |
| Команды проекта, стек, конвенции              | `CLAUDE.md`                          |
| Статус задач, идеи, ссылки между темами       | Obsidian (`ObsidianVault/Projects/`) |
| Факты, предпочтения, кросс-проектный контекст | MCP Memory (knowledge graph)         |
| Секреты, API-ключи, env-переменные            | Doppler                              |

---

## 4. Активация MCP (первый запуск)

### Obsidian MCP — готов из коробки

1. Перезапустите Claude Code в директории проекта
2. Claude спросит подтверждение на запуск project-scoped MCP-серверов → **Approve**
3. Проверка: попросите Claude создать заметку в vault — `obsidian-mcp` tools должны появиться в ответе

Путь vault: `~/ObsidianVault` (можно переопределить `OBSIDIAN_VAULT_PATH` env var).

### MCP Memory — готов из коробки

Работает сразу, без ключей. Хранит факты в локальном knowledge graph.

Проверка:

```
> запомни, что я предпочитаю Conventional Commits
```

Claude использует `memory:create_entities`. В следующей сессии спросите — вспомнит.

### Doppler MCP — нужен токен

Два способа авторизации:

**Способ А — интерактивный логин (разово):**

```bash
npx @dopplerhq/mcp-server login
```

**Способ Б — сервис-токен:**

```bash
export DOPPLER_TOKEN="dp.st.dev.xxxx..."
```

Сгенерируйте на https://dashboard.doppler.com → Project → Access.

После авторизации перезапустите Claude Code. Без токена сервер не стартует, остальные MCP работают.

---

## 5. Verification — как убедиться, что всё работает

### Проект собирается

```bash
npm ci && npm run build
```

Должно завершиться без ошибок, появиться `dist/index.html`.

### CI зелёный

На GitHub: Actions → последний workflow run на ветке `claude/continue-per-docs-YFrsW` → зелёная галка.

### CLAUDE.md подхватывается

Запустите `claude` в корне репо, задайте вопрос про команды — Claude должен ответить, не заглядывая в `package.json`.

### Obsidian MCP активен

```
> создай в obsidian заметку "test" в папке References
```

Claude должен использовать `obsidian:create_note` (или аналогичный) MCP tool. В `~/ObsidianVault/References/test.md` появится файл.

### MCP Memory активен

```
> запомни, что я предпочитаю TypeScript над JavaScript
```

Ответ должен содержать tool call `memory:create_entities`. В следующей сессии: `> что ты помнишь обо мне?`

### Doppler MCP активен

```
> покажи секреты проекта в Doppler
```

Claude использует `doppler:list_secrets`. Если видите список — Doppler подключён.

### Git status чистый

```bash
git log --oneline -5
git status
```

Последние 4 коммита в `claude/continue-per-docs-YFrsW`: CI, refactor, docs (CLAUDE.md+README), MCP+instructions.

---

## 6. Результат review проекта (что найдено)

### Баги / несогласованности

1. **`@eslint/js` не объявлен в `devDependencies`** — работает транзитивно через `eslint`, но по-хорошему должен быть явным (стабильность при bump-е eslint).
2. **CI не запускает lint** — документация говорит "lint должен быть зелёным", но `.github/workflows/ci.yml` прогоняет только `build`. Несоответствие.

### Полировка (низкий приоритет)

- `index.html` без favicon и og-тегов
- `vite.config.js` без `build.sourcemap` — отладка прод-сборки усложнена
- Нет `.editorconfig`

### Что обычно есть в React+Vite стартере, но отсутствует

- Тесты (Vitest / Jest) — сейчас 0 тестов
- Prettier — форматирование только через ESLint rules
- TypeScript
- `LICENSE`
- GitHub issue / PR templates

---

## 7. Что ещё стоит подключить

### Приоритет 1 (исправить реальные проблемы)

- [ ] Добавить `@eslint/js` в `devDependencies` явно
- [ ] Добавить шаг `npm run lint` в `.github/workflows/ci.yml`

### Приоритет 2 (качество разработки)

- [ ] **Vitest** — `npm i -D vitest @testing-library/react`, добавить `npm test` в CI
- [ ] **Prettier** — `npm i -D prettier`, `.prettierrc`, интеграция с ESLint
- [ ] **Husky + lint-staged** — пре-коммит хуки на lint/format
- [ ] **LICENSE** (MIT/Apache-2.0)

### Приоритет 3 (дополнительные MCP)

| MCP                                                | Зачем                                           |
| -------------------------------------------------- | ----------------------------------------------- |
| `@modelcontextprotocol/server-filesystem`          | Расширенный доступ к FS за пределами репо       |
| `@modelcontextprotocol/server-sequential-thinking` | Структурированное рассуждение в сложных задачах |
| `@modelcontextprotocol/server-fetch`               | HTTP-запросы из Claude                          |
| GitHub MCP                                         | Уже подключён через сессию HQ                   |
| Playwright MCP                                     | E2E тестирование через Claude                   |

Добавляются тем же способом — новая секция в `.mcp.json`.

### Приоритет 4 (скилы Claude Code)

Уже применены: `init` (CLAUDE.md), `simplify` (ревью). Имеет смысл применить позже:

- `review` — перед merge в main
- `security-review` — перед публикацией
- `session-start-hook` — если проект будет собираться на Claude Code web

---

## 8. TL;DR

- **Код**: React 19 + Vite 6, `npm run dev/build/lint`
- **Память**: три слоя — `CLAUDE.md` (проект), Obsidian (KB), Supermemory (cross-session)
- **CI**: GitHub Actions, build-only (добавить lint следующим)
- **Следующий шаг для пользователя**: экспортировать `SUPERMEMORY_API_KEY` и перезапустить Claude Code; approve project MCP servers при первом запросе
