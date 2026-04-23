# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm ci              # install exact dependencies from package-lock.json
npm run dev         # Vite dev server on http://localhost:5173
npm run build       # production build to dist/
npm run preview     # serve the production build locally
npm run lint        # ESLint flat-config (eslint.config.js)
```

No test runner is configured. Add one and document the single-test command here when tests arrive.

## Architecture

Minimal React 19 + Vite 6 single-page app. Entry flow:

1. `index.html` loads `/src/main.jsx` as an ES module.
2. `src/main.jsx` mounts `<App />` into `#root` inside `React.StrictMode`.
3. `src/App.jsx` is the sole component. Styles live in `src/App.css` and are imported by the component (not globally).

Build tooling is a stock `@vitejs/plugin-react` setup — no custom aliases, no SSR, no routing. `vite.config.js` only registers the React plugin; Vite defaults (port 5173, root = project root, `dist/` output) apply everywhere else.

ESLint uses the flat-config format (`eslint.config.js`) with `@eslint/js` recommended rules plus `no-unused-vars` as a warning. Ignores `dist` and `node_modules`.

## CI

`.github/workflows/ci.yml` runs `npm ci` then `npm run build` on:

- push to `main`
- pull_request into `main`
- manual `workflow_dispatch`

Node 20, npm cache enabled. The workflow must stay green before merging to `main`.

## Conventions

- **Commits**: Conventional Commits — `feat:`, `fix:`, `refactor:`, `docs:`, `ci:`, `chore:`.
- **Branches**: feature work on `claude/*` or `feat/*`; merge to `main` via PR.
