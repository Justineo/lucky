# Lucky

> A dead simple raffle app.

## Features

- The roster can be provided by a text file or entering a total number for game attendants. (The roster file is a newline delimited file, one row for each name. A short description can be attached to each name in the format of `name|desc`.)
- Welcome message can be edited upon double-clicking. (The edited version will be saved into your browser's local storage.)
- The results of each round are logged into local storage.
- Auto-adjusting font size to fit layout and winner count.

## Development

Use Node.js 24 and the pnpm version pinned in `package.json`. Enable Corepack with
`corepack enable` if `pnpm` is not already available.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Vite+ handles development, linting, formatting, unit tests and production builds.
The development server uses port 8080. To validate the production bundle locally:

```sh
pnpm exec playwright install chromium firefox
pnpm ready
```

GitHub Actions runs the same checks plus an audit on pull requests and updates to
`master`. The existing Vercel Git integration builds previews and serves the
static `dist/` production output. No deployment credentials are needed in CI.
Renovate proposes dependency and lockfile updates without automerging them.

## Browser compatibility

Run Lucky in a current Chrome or Firefox. Roster and raffle data stay in the
browser. Keep the same site origin to retain existing settings and draw history.
