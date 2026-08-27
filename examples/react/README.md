# Ayle React example

This is a small runnable Vite + React + TypeScript application that consumes
the local repository packages:

```text
@qybercom/ayle       -> file:../..
@qybercom/ayle-react -> file:../../bindings/react
```

## Backend

The example expects the existing PHP example backend to be available as
`/server/...`.

With the repository layout used by the Ayle examples:

```text
<parent>/
├── server/
│   ├── metadata.php
│   └── track.php
└── <ayle-root>/
    └── examples/
        └── react/
```

start PHP with `<parent>` as the document root, for example:

```bash
cd <parent>
php -S localhost:8000
```

Vite proxies `/server/*` to the backend configured in `.env`:

```env
AYLE_SERVER_TARGET=http://localhost:8000
```

Copy `.env.example` when creating a local configuration. `AYLE_SERVER_TARGET`
is read only by `vite.config.ts`, so it intentionally does not use the
client-side `VITE_` prefix.

## Run

From `examples/react/`:

```bash
npm install
npm run dev
```

Production example build:

```bash
npm run build
```

The app demonstrates a video preset, audio preset, MSE HTTP configuration,
browser localization auto-detection, Ayle event callbacks, settings persistence,
and direct Player access through the forwarded React ref.

## Local package resolution

The example uses the repository versions of Ayle directly. Before Vite starts,
`predev` runs:

```bash
npm --prefix ../.. run build
```

which creates the current core and React `dist/` outputs. `vite.config.ts` then
aliases `@qybercom/ayle`, `@qybercom/ayle/bootstrap`,
`@qybercom/ayle/ayle.css`, and `@qybercom/ayle-react` directly to those local
build outputs.

This avoids stale or incomplete `file:` package copies in
`examples/react/node_modules`, which is especially useful on Windows.

The Vite configuration uses Node built-in modules such as `node:path` and
`node:url`; `@types/node` is included in the example dev dependencies so those
imports are typed correctly by TypeScript.