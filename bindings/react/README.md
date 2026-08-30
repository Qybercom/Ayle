# @qybercom/ayle-react

React binding for Ayle.

```bash
npm install @qybercom/ayle @qybercom/ayle-react
```

Import the core stylesheet once:

```js
import '@qybercom/ayle/ayle.css';
```

Example:

```jsx
import { AylePlayer } from '@qybercom/ayle-react';

export function Movie () {
	return (
		<AylePlayer
			preset="video"
			driver="mse"
			mediaProvider={{
				Type: 'http',
				File: 'example.mkv',
				MetadataURL: '/media/metadata?file={file}',
				TrackURL: '/media/track?file={file}&type={kind}&track={track}&start={time}'
			}}
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

The binding is intentionally thin: Ayle core still owns playback, media providers, tracks,
subtitles, hints, Settings, and UI.

## Props

| Prop | Description |
| --- | --- |
| `id` | Ayle instance ID. |
| `preset` | Ayle preset such as `video` or `audio`. |
| `file` | Convenience shortcut for `MediaProvider.File`; defaults the provider type to `http` when no provider is supplied. |
| `config` | Complete Ayle config object. |
| `playerConfig` / `mediaConfig` | Split configuration form. |
| `player` | Values merged into `config.Player`. |
| `mediaProvider` | Values merged into `config.MediaProvider`; `Type` selects a registered media provider. |
| `driver` | Driver type, normally `mse` or `html5`. |
| `driverOptions` | Values merged into `Driver.Options`. |
| `localization` | Locale string or localization object. Omit for browser auto-detection. |
| `settings` | `localStorage`, `sessionStorage`, `cookie`, or empty/null/false to disable persistence. |
| `debug` | Adds the Ayle Debug Settings item. |
| `events` | Map of Ayle event names to callbacks, including dynamic event names. |
| `onEvent` | Receives all built-in events as wrapper objects. |
| `onReady` | Called after the Ayle instance is created. |
| `onDestroy` | Called before the Ayle instance is destroyed. |
| `reloadKey` | Recreates Ayle when the value changes. |
| `className` / `style` | Applied to the host `<div>`. |

The forwarded ref exposes `Element`, `Instance`, `Player`, `UI`, `MediaProvider`, and
`Reload()`.

Core lifecycle cleanup is used on unmount, including React development Strict
Mode remounts.

## TypeScript event types

The binding exports `AyleEventMap`, `AyleEventHandlers`, `AyleInstance`,
`AylePlayerCore`, `AyleSource`, track/variant/chapter types, and the common
event payload interfaces.

Known event names are contextually typed:

```tsx
<AylePlayer
	events={{
		timeUpdate: function (event) {
			console.log(event.Position, event.Duration);
		},
		volumeChange: function (event) {
			console.log(event.Volume, event.Muted);
		},
		error: function (error) {
			if (error instanceof Error)
				console.error(error.message);
		}
	}}
	onReady={function (instance) {
		instance.Player.Play();
		console.log(instance.Player.State.Duration);
	}}
/>
```

Dynamic Ayle events such as application-defined `hintAction:*` or
`settingsAction:*` remain supported through the event-map string index and use
`any` for their application-defined payloads. Known built-in events use their
specific payload types.

Known event properties are declared explicitly in `AyleEventHandlers`, which
lets TypeScript contextually type inline `events={{ ... }}` callbacks. Dynamic
application-defined event names remain supported by the string index.

## Core feature parity

The binding passes the complete Ayle configuration object through to the core, so core features such as Toolbar layouts/custom menus, Timeline Ranges, Media Session, Hints, Settings integrations, localization, subtitles, variants, and driver options remain available without binding-specific wrappers.

The initialization shortcuts `volume`, `start`, and `muted` are also exposed directly by the binding and map to the core `data-ayle-volume`, `data-ayle-start`, and `data-ayle-muted` initialization behavior. Core events are forwarded by the binding, including `toolbarMenuAction` and `toolbarMenuSelect`; dynamic integration-specific event names can also be subscribed to through the binding event API.

### Playlist

Playlist configuration is passed at the Ayle assembly level. Each item may
override `Driver`, `MediaProvider` and `Player`:

```js
{
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
}
```

Use `Player.Next()`, `Player.Previous()`, `Player.SetPlaylistIndex(index)` and
`Player.SetPlaylistItemByID(id)` for navigation. Playlist lifecycle events are
forwarded through the binding's generic event API.

Hints can navigate playlist items with `Type: 'next'` and `Type: 'previous'`.
The generic binding event API also forwards `playlistAutoAdvanceStart`,
`playlistAutoAdvanceCancel`, and `playlistAutoAdvanceComplete`.
