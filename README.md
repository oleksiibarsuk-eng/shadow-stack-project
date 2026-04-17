# Shadow Stack Project

[![CI](https://github.com/oleksiibarsuk-eng/shadow-stack-project/actions/workflows/ci.yml/badge.svg)](https://github.com/oleksiibarsuk-eng/shadow-stack-project/actions/workflows/ci.yml)

A minimal React + Vite starter.

## Quick Start

```bash
npm ci
npm run dev      # Vite dev server on http://localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview the production build
npm run lint     # ESLint flat-config
```

## Tech Stack

- React 19
- Vite 6
- ESLint 9 (flat config)

## Project Structure

```
.
├── .github/workflows/ci.yml   # GitHub Actions: npm ci + npm run build
├── src/
│   ├── App.jsx                # Root component
│   ├── App.css                # Component styles
│   └── main.jsx               # Entry point, mounts <App /> into #root
├── index.html                 # Vite HTML entry
├── vite.config.js             # Vite + React plugin
├── eslint.config.js           # ESLint flat config
└── package.json
```

## CI

GitHub Actions runs `npm ci` and `npm run build` on every push and PR to `main`,
and on manual `workflow_dispatch`. The workflow must be green before merging.

## Contributing

1. Branch off `main` (`feat/*`, `fix/*`, or `claude/*`).
2. Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`, `docs:`, `ci:`, `chore:`).
3. Run `npm run lint` and `npm run build` locally before pushing.
4. Open a PR into `main` — CI will run automatically.
