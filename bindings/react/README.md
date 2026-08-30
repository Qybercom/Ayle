# @qybercom/ayle-react

React binding for Ayle.

```bash
npm install @qybercom/ayle @qybercom/ayle-react
```

Import the core stylesheet once:

```js
import '@qybercom/ayle/ayle.css';
```

The binding intentionally exposes one canonical Ayle assembly input: `config`.
Driver, MediaProvider, Playlist and Player configuration all live inside that
object exactly as they do in core/embedded configuration.

```tsx
import type { AyleConfig } from '@qybercom/ayle';
import { AylePlayer } from '@qybercom/ayle-react';

const config: AyleConfig = {
	Driver: {
		Type: 'mse'
	},
	MediaProvider: {
		Type: 'http',
		File: 'example.mkv',
		MetadataURL: '/media/metadata?file={file}',
		TrackURL: '/media/track?file={file}&type={kind}&track={track}&start={time}'
	},
	Player: {
		MediaMode: 'video'
	}
};

export function Movie () {
	return (
		<AylePlayer
			id="movie"
			config={config}
			events={{
				play: function () {
					console.log('play');
				},
				error: function (error) {
					console.error(error);
				}
			}}
		/>
	);
}
```

There are deliberately no legacy `file`, `driver`, `driverOptions`, `player`,
`mediaProvider`, `playlist`, `preset`, `localization`, `volume`, `start`,
`muted`, `debug`, `playerConfig`, or `mediaConfig` props. If Ayle configuration
changes, it changes in `config`.

Framework-only props remain separate:

| Prop | Description |
| --- | --- |
| `id` | Host/bootstrap instance ID. |
| `config` | Complete typed `AyleConfig`. |
| `settings` | Bootstrap settings persistence: `localStorage`, `sessionStorage`, `cookie`, or empty/null/false. |
| `events` | Typed built-in event handlers plus dynamic application event names. |
| `onEvent` | Receives the unified event wrapper stream. |
| `onReady` | Called after the Ayle instance is created. |
| `onDestroy` | Called before the instance is destroyed. |
| `reloadKey` | Recreates Ayle when the value changes. |
| `className` / `style` | Applied to the host `<div>`. |

The forwarded ref exposes `Element`, `Instance`, `Player`, `UI`,
`MediaProvider`, and `Reload()`.

## Shared TypeScript model

Ayle configuration/runtime types are owned by the core package, not duplicated
inside the React binding:

```ts
import type {
	AyleConfig,
	AylePlayerOptions,
	AylePlaylistConfig,
	AyleHTTPMediaProviderConfig,
	AyleEventMap,
	AyleInstance
} from '@qybercom/ayle';
```

The React package re-exports those types for convenience, but its declarations
reference the core definitions. Known configuration structures use concrete
interfaces and literal unions. Open extension boundaries, including dynamically
named application events, use `unknown` instead of collapsing the public model
to `any`.

## Playlist

Playlist belongs inside `config`:

```ts
const config: AyleConfig = {
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

The binding stays thin: Ayle core owns playback, media providers, playlist
transitions, tracks, subtitles, hints, Settings, UI and lifecycle state.

## Lifecycle and local development

The binding is intentionally thin: Ayle core owns playback, media providers,
tracks, subtitles, hints, Settings and UI. The wrapper uses core/bootstrap
teardown on unmount, including React development Strict Mode remounts.

Build and validate from the repository root with:

```bash
npm run build:core
npm run build:react
npm run check:react
```

`bindings/react/dist/index.d.ts` is generated from the binding declaration
source, while the canonical Ayle configuration/runtime declarations are
resolved from the peer `@qybercom/ayle` package.
