# Ayle Angular example

Small runnable Angular + TypeScript application demonstrating
`@qybercom/ayle-angular`.

First build the local Angular binding:

```bash
cd bindings/angular
npm install
npm run build
```

Then install and run the example:

```bash
cd ../../examples/angular
npm install
npm start
```

The example consumes:

```text
@qybercom/ayle         -> file:../..
@qybercom/ayle-angular -> file:../../bindings/angular/dist
```

Angular proxies `/server/*` through a local `proxy.conf.json`. The repository
contains `proxy.conf.example.json`; copy it to `proxy.conf.json` before the
first `npm start`, then change its `target` if the PHP backend uses another URL.

PowerShell:

```powershell
Copy-Item proxy.conf.example.json proxy.conf.json
```

`proxy.conf.json` is ignored by Git, so local backend settings are not
overwritten by repository updates.

The app demonstrates video and audio presets, MSE HTTP configuration, browser
localization auto-detection, typed Angular outputs, the generic `ayleEvent`
output and direct component/player access through application-level `@ViewChild`.

## Angular runtime mode

The example is explicitly zoneless:

```ts
provideZonelessChangeDetection()
```

so it does not require `zone.js`. This also avoids pulling Zone.js into the
example solely to satisfy Angular's default bootstrap mode.

## Dependency audit

The example tracks the maintained Angular 20.3 line and uses `@angular/build`
instead of the older `@angular-devkit/build-angular` application builder.

After updating the example, refresh its dependency tree:

```bash
rm -rf node_modules package-lock.json
npm install
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

Then inspect:

```bash
npm run audit
npm run audit:runtime
```

`audit:runtime` excludes development-only build tooling. This distinction is
useful for this repository example because Angular CLI/build packages are not
shipped to end users with Ayle.

## Local binding refresh

`@qybercom/ayle-angular` is a local `file:` dependency. npm installs that
package into this example's `node_modules` as a copy. Rebuilding
`bindings/angular/dist` does not automatically replace the already installed
copy.

For that reason `npm start`, `npm run build`, and `npm run typecheck` now run
`prepare:ayle` first. It rebuilds Ayle core and the Angular binding, then copies
the fresh Angular package into this example's `node_modules`.

You can also run the refresh explicitly:

```bash
npm run prepare:ayle
```

There is no need to reinstall the example after every binding source change.

### Angular build cache

This example disables Angular CLI's persistent build cache. The local
`@qybercom/ayle-angular` package is rebuilt and copied into `node_modules`
before every start/build/typecheck, and the `.angular/` cache directory is
removed at the same time.

This is intentional for a repository integration example: otherwise Angular
can keep an already-linked older copy of the local library even after
`bindings/angular/dist` and `node_modules/@qybercom/ayle-angular` have both
been replaced.

### Core/bootstrap module order

`@qybercom/ayle/bootstrap` now imports the core ESM entry internally, so the
bootstrap module no longer depends on the consuming framework importing
`@qybercom/ayle` first or on bundler evaluation order.

The Angular example sync step also refreshes both local npm package copies:
`@qybercom/ayle` and `@qybercom/ayle-angular`.

### Bundler-safe bootstrap

The bootstrap ESM entry now imports the Ayle constructors as named imports and
rebinds them explicitly onto `globalThis` before the legacy bootstrap runtime
executes. This is deliberate: framework bundlers can tree-shake a side-effect
only import, especially when package `sideEffects` metadata does not cover the
ESM entry.

The core package now also marks both `ayle.esm.js` and
`ayle-bootstrap.esm.js` as side-effectful.

### Development-mode status updates

The example's `LastEvent` label is updated in a microtask. Ayle can emit
lifecycle events while Angular is still verifying the initial view; changing a
template-bound field synchronously from such an event causes Angular's
development-only `NG0100: ExpressionChangedAfterItHasBeenCheckedError`.

This deferral applies only to the demonstration status label, not to Ayle's
event delivery.