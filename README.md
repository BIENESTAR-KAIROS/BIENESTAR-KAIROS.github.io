# Bienestar KAIROS

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Use Node.js 26.13.0 LTS (pinned in `.node-version`) and npm. With fnm:

```bash
fnm install
fnm use
npm ci
```

Restart any running development server after switching Node versions.
App Platform's documented buildpack currently supports Node through 26.12.1.
The `engines` range accepts that security release while `.node-version` keeps
local development on 26.13.0 LTS, which contains the same security fixes.
Merge changes into the app's configured branch (`main`) to trigger autodeploy,
then verify the selected Node version and deployment status in DigitalOcean.
Nuxt remains pinned to 3.21.1 pending its separate migration; this runtime and
dependency update does not resolve all advisories affecting Nuxt 3.

## Development Server

The frontend usually runs on `http://localhost:3001`. Check whether it is already running before starting another instance:

```bash
npm run dev
```

The development script uses port 3001. To override it, use `npm run dev -- --port 3002`.

## Validation

```bash
npm run lint
npm run lintfix
```

`lintfix` applies formatting and ESLint fixes across the project.

The user usually performs visual validation. When the Codex browser reaches the
login page, wait for the user to enter credentials or request test credentials
if they prefer the agent to sign in. Ask for permission before reviewing the app
in Chrome. See [AGENTS.md](AGENTS.md#pruebas-del-frontend-y-acceso-al-navegador)
for the full workflow.

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
