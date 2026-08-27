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
			file="example.mkv"
			driver="mse"
			http={{
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

The binding is intentionally thin: Ayle core still owns playback, HTTP, tracks,
subtitles, hints, Settings, and UI.

## Props

| Prop | Description |
| --- | --- |
| `id` | Ayle instance ID. |
| `preset` | Ayle preset such as `video` or `audio`. |
| `file` | Media identifier passed to `AyleHTTP`. |
| `config` | Complete Ayle config object. |
| `playerConfig` / `mediaConfig` | Split configuration form. |
| `player` | Values merged into `config.Player`. |
| `http` | Values merged into `config.HTTP`. |
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

The forwarded ref exposes `Element`, `Instance`, `Player`, `UI`, `HTTP`, and
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