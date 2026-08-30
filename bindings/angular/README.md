# @qybercom/ayle-angular

Angular binding for Ayle.

```bash
npm install @qybercom/ayle @qybercom/ayle-angular
```

Import the Ayle stylesheet once:

```css
@import '@qybercom/ayle/ayle.css';
```

The standalone `AylePlayerComponent` has one canonical Ayle assembly input:
`config`. Driver, MediaProvider, Playlist and Player options are not duplicated
as Angular inputs.

```ts
import type { AyleConfig } from '@qybercom/ayle';

readonly Config: AyleConfig = {
	Driver: {
		Type: 'mse'
	},
	MediaProvider: {
		Type: 'http',
		File: 'example.mkv',
		MetadataURL: '/media/metadata.php?file={file}',
		TrackURL: '/media/track.php?file={file}&type={kind}&track={track}&start={time}'
	},
	Player: {
		MediaMode: 'video'
	}
};
```

```html
<ayle-player
	id="movie"
	[config]="Config"
	(ayleEvent)="OnAyleEvent($event)">
</ayle-player>
```

There are deliberately no legacy `file`, `driver`, `driverOptions`, `player`,
`mediaProvider`, `playlist`, `preset`, `localization`, `volume`, `start`,
`muted`, `debug`, `playerConfig`, or `mediaConfig` inputs. Binding compilation
therefore exposes stale configuration immediately instead of silently merging
old and new APIs.

Framework-only inputs remain separate:

| Input | Description |
| --- | --- |
| `id` | Host/bootstrap instance ID. |
| `config` | Complete typed `AyleConfig`. |
| `settings` | Bootstrap settings persistence. |
| `events` | Typed event-handler map, including dynamic application event names. |
| `reloadKey` | Explicit value that may be changed to recreate the instance. |

Common outputs remain strongly typed (`ready`, `play`, `playing`, `pause`,
`ended`, `error`, `buffering`, `timeUpdate`, `volumeChange`, `sourceChange`,
`toolbarMenuAction`, `toolbarMenuSelect`). `ayleEvent` exposes the unified
event wrapper stream.

The component also exposes `Instance`, `Player`, `UI`, `MediaProvider`,
`Element`, and `Reload()` for `@ViewChild` access.

## Shared TypeScript model

Configuration/runtime declarations now live in the core `@qybercom/ayle`
package:

```ts
import type {
	AyleConfig,
	AylePlayerOptions,
	AylePlaylistConfig,
	AyleHTTPMediaProviderConfig,
	AyleEventMap
} from '@qybercom/ayle';
```

The Angular package re-exports these types for convenience rather than
maintaining its own duplicate model. Known configuration structures use
concrete interfaces/literal unions; extensibility points use `unknown` where
the application owns the payload.

## Playlist

Playlist is part of the same assembly config:

```ts
readonly Config: AyleConfig = {
	Driver: {
		Type: 'html5'
	},
	MediaProvider: {
		Type: 'http'
	},
	Player: {
		MediaMode: 'audio'
	},
	Playlist: {
		AutoAdvance: true,
		AutoAdvanceDelay: 5000,
		Loop: false,
		StartIndex: 0,
		Items: [
			{ ID: 'one', MediaProvider: { File: 'one.mp3' } },
			{ ID: 'two', MediaProvider: { File: 'two.mp3' } }
		]
	}
};
```

The Angular wrapper owns component lifecycle and event bridging only; Ayle core
owns playback, providers, playlist state and UI.

## Build and local development

Build locally:

```bash
npm install
npm run build
```

For local development, `@qybercom/ayle` remains a `peerDependency` for the
published package and is also present in `devDependencies` as `file:../..`.
The root package exposes `build:angular` and `check:angular`, and the main
build/check/pack workflows include Angular alongside core and React.

`build-angular.mjs` resolves the installed `ng-packagr` package from
`bindings/angular`, reads its CLI path from the package `bin` field and runs it
through the current Node executable.

The component uses its own `<ayle-player>` host element as the Ayle mount point;
there is no internal `@ViewChild` mount query.

When testing changes in `examples/angular`, use `npm run prepare:ayle` from the
example or `npm run prepare:angular-example` from the repository root so the
example receives the current local package. The synchronization helper also
clears Angular's persistent build cache to avoid stale local-library output.
