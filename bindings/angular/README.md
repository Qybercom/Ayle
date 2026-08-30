# @qybercom/ayle-angular

Angular binding for Ayle.

Build locally:

```bash
npm install
npm run build
```

Install as a package:

```bash
npm install @qybercom/ayle @qybercom/ayle-angular
```

Import the Ayle stylesheet once:

```css
@import '@qybercom/ayle/ayle.css';
```

The binding exports the standalone `AylePlayerComponent`. It keeps playback,
HTTP, tracks, subtitles, hints and UI inside Ayle core; Angular only owns
component lifecycle, inputs and outputs.

Common outputs are strongly typed: `ready`, `play`, `playing`, `pause`,
`ended`, `error`, `buffering`, `timeUpdate`, `volumeChange`, `sourceChange`.
The generic `ayleEvent` output exposes the complete built-in event stream.

The component also exposes `Instance`, `Player`, `UI`, `HTTP`, `Element` and
`Reload()` for `@ViewChild` access.

For local development, `@qybercom/ayle` remains a `peerDependency` for the
published package, but is also present in `devDependencies` as `file:../..`.
That lets `npm install` inside `bindings/angular/` resolve the current local
Ayle core instead of trying to download the not-yet-published package from npm.

Repository build helpers:

```bash
npm run build
npm run check
npm run pack:check
```

The root package exposes the corresponding `build:angular` and
`check:angular` commands, and the main `build`, `check`, and `pack:check`
commands include Angular alongside core and React.

`build-angular.mjs` resolves the installed `ng-packagr` package from
`bindings/angular`, reads its actual CLI path from the package `bin` field, and
runs that file through the current Node executable. No internal
`node_modules/ng-packagr/...` path is hard-coded, and no `npm.cmd` process is
spawned.

The component uses its own `<ayle-player>` host element as the Ayle mount point.
It does not use an internal `@ViewChild` query. This keeps the wrapper simpler
and avoids Angular view-query initialization issues when consuming a partially
compiled library.

When testing changes in `examples/angular`, rebuilding this package alone is
not enough after the example has already been installed: npm's local `file:`
dependency is a copy under the example's `node_modules`. Use
`npm run prepare:ayle` from `examples/angular`, or
`npm run prepare:angular-example` from the repository root, to rebuild and
synchronize the package.

The Angular example also clears its `.angular/` build cache whenever the
binding is synchronized, because Angular's persistent cache can otherwise keep
an older linked version of a local `file:` library.

## Core feature parity

The binding passes the complete Ayle configuration object through to the core, so core features such as Toolbar layouts/custom menus, Timeline Ranges, Media Session, Hints, Settings integrations, localization, subtitles, variants, and driver options remain available without binding-specific wrappers.

The initialization shortcuts `volume`, `start`, and `muted` are also exposed directly by the binding and map to the core `data-ayle-volume`, `data-ayle-start`, and `data-ayle-muted` initialization behavior. Core events are forwarded by the binding, including `toolbarMenuAction` and `toolbarMenuSelect`; dynamic integration-specific event names can also be subscribed to through the binding event API.