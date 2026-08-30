# Ayle

Ayle is a dependency-free JavaScript media player with a generated UI, HTML5
and Media Source Extensions (MSE) drivers, metadata-driven loading, multiple
audio/subtitle tracks, chapters, quality variants, artwork, hints,
localization, keyboard/touch controls, Picture-in-Picture and fullscreen.

## Runtime files

```text
ayle.js
ayle-bootstrap.js
ayle.css
```

For normal embedding, include only `ayle-bootstrap.js`. It resolves its own
directory, loads `ayle.css` and `ayle.js`, injects the embedded SVG icon sprite,
creates the bootstrap instance and initializes declarative instances.

There are no site-specific backend URLs or implicit driver defaults inside the
library.

## Canonical examples

The repository intentionally keeps four example entry points, each presented as a UI-kit style page with four live variants and the corresponding source code next to the preview:

| Example | Variants |
| --- | --- |
| `examples/low-level.html` | minimal-video, minimal-audio, full-video, full-audio |
| `examples/embedded.html` | minimal-video, minimal-audio, full-video, full-audio |
| `examples/angular/` | minimal-video, minimal-audio, full-video, full-audio |
| `examples/react/` | minimal-video, minimal-audio, full-video, full-audio |

The minimal variants demonstrate the smallest practical configuration for each media mode and intentionally omit values that already match Ayle defaults. The full variants are exhaustive reference examples: they explicitly enumerate the complete current Player and built-in HTTP MediaProvider option surface, including nested/default-valued options, while also exercising integrations.

## Quick start

```html
<script
    src="ayle-bootstrap.js"
    data-ayle-loader
    data-ayle-driver="mse"
    data-ayle-media-provider="http"
    data-ayle-url-metadata="/media/metadata?file={file}"
    data-ayle-url-track="/media/track?file={file}&type={kind}&track={track}&start={time}">
</script>

<script
    type="application/json"
    data-ayle="movie"
    data-ayle-preset="video"
    data-ayle-file="example.mkv">
</script>
```

`data-ayle` is the instance ID. A page may contain multiple instances.

### Imperative initialization

`Ayle` is the owner/orchestrator of the runtime assembly. `Driver` and
`MediaProvider` are sibling dependencies owned by the player, while `Player`
contains player behaviour/UI options.

The canonical low-level form is:

```js
var root = document.querySelector('#player');

var player = new Ayle({
	Driver: {
		Type: 'html5'
	},
	MediaProvider: {
		File: '/media/song.mp3'
	},
	Player: {
		MediaMode: 'audio'
	}
});

var ui = new AyleUI(root, player);

player.On('ready', function () {
	console.log('ready');
});

player.On('error', function (error) {
	console.error(error);
});

player.Load();
```

`http` is the default registered media provider, so minimal configurations do
not need `MediaProvider.Type`. `html5` is the default driver when `Driver` is
omitted, although canonical examples keep the driver descriptor visible when
the driver choice matters.

`Ayle.Init()` uses the same assembly object and only adds DOM/UI assembly:

```js
var player = Ayle.Init('#player', {
	Driver: {
		Type: 'html5'
	},
	MediaProvider: {
		File: '/media/song.mp3'
	},
	Player: {
		MediaMode: 'audio'
	}
});

player.Load();
```

A ready driver or provider instance can also be supplied in the assembly when
an integration needs to construct it itself. The normal application API should
prefer descriptors so Ayle owns creation and lifecycle.

The assembled objects are available as:

```text
player.Driver
player.MediaProvider
player.UI
player.Element
player.MediaElement
```

`player.SetDriver(...)` and `player.SetMediaProvider(...)` replace owned
dependencies. `player.Destroy()` destroys the owned provider and driver.

`MediaMode` selects the default UI composition. `video` defaults to an empty
header, compact track overlay and the core playback toolbar; `audio` defaults
to an empty header, artwork/title/artist/album track content, compact track +
subtitles overlays and the same core playback toolbar. Explicit UI fields still
override only those fields.

## Loader attributes

The table below is a quick overview. See **Configuration reference → `data-ayle*` attribute reference** for the complete attribute documentation.


| Attribute | Meaning |
| --- | --- |
| `data-ayle-loader` | Marks the loader script. |
| `data-ayle-driver="mse\|html5"` | Default driver. |
| `data-ayle-driver-options='{}'` | JSON driver options. |
| `data-ayle-url-metadata="..."` | Default metadata URL template. |
| `data-ayle-url-track="..."` | Default track URL template. |
| `data-ayle-settings="localStorage\|sessionStorage\|cookie\|<empty>"` | Global settings persistence. An empty value disables persistence. |
| `data-ayle-localization="..."` | Default localization. |
| `data-ayle-auto-init="false"` | Disable automatic initialization. |
| `data-ayle-auto-focus` | Enable automatic focus on interaction. |
| `data-ayle-autoplay` | Enable autoplay. |
| `data-ayle-autoplay-mode="..."` | Set autoplay mode. |
| `data-ayle-volume="0..1"` | Set the global default initial volume. |
| `data-ayle-start="seconds"` | Set the global default initial playback position. |
| `data-ayle-muted="true|false"` | Set the global default muted state. |
| `data-ayle-skip-init="true\|false"` | Set the built-in HTTP `MediaProvider.Stream.SkipInit`. |

The driver must be configured explicitly; there is no hidden MSE fallback.

## Instance attributes

The table below is a quick overview. See **Configuration reference → `data-ayle*` attribute reference** for the complete attribute documentation.


| Attribute | Meaning |
| --- | --- |
| `data-ayle="id"` | Declares an instance and supplies its ID. |
| `data-ayle-preset="video\|audio"` | Applies a built-in preset. |
| `data-ayle-file="..."` | Media file/source identifier. |
| `data-ayle-localization="..."` | Per-instance localization. |
| `data-ayle-driver="mse\|html5"` | Per-instance driver override. |
| `data-ayle-driver-options='{}'` | Per-instance driver options. |
| `data-ayle-volume="0..1"` | Override the initial volume for this instance. |
| `data-ayle-start="seconds"` | Override the initial playback position for this instance. |
| `data-ayle-muted="true|false"` | Override the initial muted state for this instance. |
| `data-ayle-settings="localStorage\|sessionStorage\|cookie\|<empty>"` | Per-instance persistence override. An empty value explicitly disables persistence, including an inherited loader setting. |
| `data-ayle-debug` | Adds/enables Debug settings for this instance. |
| `data-ayle-on="play:onPlay;pause:onPause"` | Binds Ayle events to global handlers. |

Instance values override loader defaults.

## JSON configuration

```html
<script type="application/json" data-ayle="movie">
{
    "Preset": "video",
    "Player": {
        "AutoPlay": false,
        "AutoFocus": true
    },
    "Driver": {
        "Type": "mse",
        "Options": {}
    },
    "MediaProvider": {
        "Type": "http",
        "File": "example.mkv",
        "MetadataURL": "/media/metadata?file={file}",
        "TrackURL": "/media/track?file={file}&type={kind}&track={track}&start={time}",
        "Stream": {
            "SkipInit": true
        }
    }
}
</script>
```

`Ayle` is the runtime class. `Player` is still the configuration section for
player options. `MediaProvider` selects and configures the media acquisition implementation. `MediaConfig` remains the media/source side of the optional split-configuration form.
Do not rename the JSON `Player` key to `Ayle`.

## Configuration reference

This section documents the configuration objects currently consumed by `ayle-bootstrap.js` and `ayle.js`. Defaults and accepted values below are based on the current implementation rather than on historical examples.

### Effective bootstrap configuration

A normal declarative config is an object with these top-level fields:

| Option | Type / default | Description |
| --- | --- | --- |
| `ID` | string / generated | Optional instance ID when `data-ayle` does not provide one. |
| `Preset` | string / none | Bootstrap shortcut for `Player.Preset`. Built-in names are `video` and `audio`; registered custom presets use the shared Ayle core registry. |
| `Player` | object / `{}` | Options passed to the `Ayle` runtime object. Fully documented below. |
| `Driver` | object / required | Driver selection. `Driver.Type` must currently be `html5` or `mse`. |
| `MediaProvider` | object / none | Media acquisition configuration. `MediaProvider.Type` selects a registered provider; `http` is built in. All remaining properties are provider-specific. |
| `PlayerConfig` | object / none | Split-config envelope. Merged with normalized `MediaConfig` before normal initialization. |
| `MediaConfig` | object / none | Media-oriented split configuration. See the dedicated table below. |

### `Driver`

| Option | Type / default | Description |
| --- | --- | --- |
| `Type` | `html5` or `mse` / required | Selects the built-in driver. There is no implicit default driver. |
| `Options` | object / `{}` | Passed as the second constructor argument by bootstrap. In the current built-in `AyleHTML5MediaDriver` and `AyleMSEMediaDriver` implementations this object is not read yet, so it is presently reserved for future/custom driver options. |

### `Player`

| Option | Type / default | Description |
| --- | --- | --- |
| `AutoSelectFirstSubtitleTrack` | boolean / `false` | Select the first available subtitle track when no subtitle track is otherwise selected. |
| `AutoPlay` | boolean / `false` | Request autoplay after a source becomes ready. |
| `AutoPlayMode` | `audible` or `muted` / `audible` | Autoplay strategy. Invalid values fall back to `audible`. |
| `Volume` | number `0..1` / current driver value | Initial playback volume. |
| `Muted` | boolean / current driver value | Initial muted state. |
| `Start` | number / `0` | Initial playback position in seconds. Applied when the source becomes ready. |
| `NativeSubtitles` | boolean / `false` | Use native browser subtitle rendering instead of the custom HTML overlay. |
| `SubtitleOffset` | number / `0` | Time offset in seconds applied to subtitle cue matching. |
| `AutoNativeSubtitlesInPictureInPicture` | boolean / `false` | Automatically switch to native subtitles while Picture-in-Picture is active. |
| `SubtitleStyle` | object / `{}` | Custom subtitle-overlay style. See `Player.SubtitleStyle`. |
| `LoadingDelay` | number / `180` | Delay in milliseconds before the loading indicator becomes visible. |
| `ForceShowQualityList` | boolean / `false` | Keep the quality/variant selector available even when only one variant exists. |
| `ForceShowChaptersList` | boolean / `false` | Keep the Chapters control visible even when the current source has no chapters. |
| `ShowCenterPlayButton` | boolean / mode-dependent (`true` for video, `false` for audio) | Show the large center Play button. When omitted, the default follows the resolved media mode, including sources resolved through `MediaMode: 'auto'`. |
| `AutoFocus` | boolean / `false` | Focus the player automatically when the user interacts with its controls/surface. |
| `MediaMode` | `auto`, `video`, `audio` / `auto` | Select media mode. `auto` resolves from the loaded source. |
| `Preset` | string / empty | Optional registered custom preset layered over the built-in preset selected by `MediaMode`. |
| `UI` | object | Declarative UI composition: header, track, channel, overlay, and toolbar. |
| `AudioVisual` | object | Controls the visual area used by audio mode. |
| `ArtworkSlideshow` | object | Controls the pre-playback artwork slideshow. |
| `KeyboardArrowSeekStep` | number / `10` | Seek step in seconds for left/right arrow shortcuts. |
| `KeyboardAngleSeekStep` | number or `frame` / `frame` | Seek step for `<` / `>` (`,` / `.`). `frame` derives one-frame duration from the media frame rate. |
| `KeyboardFrameRateFallback` | number / `30` | Fallback FPS used when frame-based seek cannot obtain a source frame rate. |
| `Shortcuts` | object | Enable/disable individual keyboard shortcuts. |
| `SettingsOrder` | array | Order of items in the Settings menu. Empty-string entries are visual separators. |
| `FontFamily` | string / `Arial, sans-serif` | UI font-family value. |
| `Debug` | boolean / `false` | Enable main player/MSE debug logging and state. |
| `DebugMP4` | boolean / `false` | Enable MP4 structure/timeline debugging. |
| `Localization` | object or locale string through bootstrap | Localization map. Bootstrap also accepts a locale string and resolves it to a bundled localization. |
| `HintSafeArea` | number or object / `16` each side | Additional safe-area padding used when positioning hints around the visible header/controls. |
| `Integration` | object | Channel, hints, custom Settings entries, and arbitrary application data. |

### `Player.UI`

`UI` is the single declarative composition model for Ayle's built-in interface. Element composition is expressed with simple string lists; layout variants know how to render the configured content. There is no separate UI mode switch: compact/headerless behavior is derived from the actual composition (`Header`, `Overlay`, and `Toolbar`) and explicit options such as `ShowCenterPlayButton`.

```js
UI: {
	Header: [
		'channel:card',
		'track'
	],
	Track: [
		'title',
		'chapter'
	],
	Channel: [
		'name',
		'profile'
	],
	Toolbar: {
		Layout: 'inline',
		Items: [
			'play',
			'timeline',
			'time',
			'volume',
			'chapters',
			'quality',
			'fullscreen',
			'settings'
		]
	}
}
```

| Option | Type / default | Description |
| --- | --- | --- |
| `Header` | string[] / `['channel:card', 'track']` | Ordered header blocks. Built-ins: `channel:card`, `channel:contact`, `track`. An empty list removes the header. |
| `Track` | string[] / `['title', 'chapter']` | Ordered/allowed track metadata elements. Built-ins: `artwork`, `title`, `artist`, `album`, `chapter`. |
| `Channel` | string[] / `['name', 'profile']` | Elements rendered by the selected channel layout. The channel avatar is owned by the channel layout itself; built-ins for the configurable information block are `name` and `profile`. |
| `Overlay` | string[] / `[]` | Ordered overlay layouts. Built-ins: `track:compact` and `subtitles`. |
| `Toolbar` | object | Declarative toolbar layout and items. |

`channel:card` and `channel:contact` are presentation variants of the same channel data. Both consume the same `UI.Channel` list. `channel:contact` renders the channel avatar plus the configured right-side channel block, while `channel:card` keeps the standard card presentation. This keeps channel content configuration independent from its visual layout.

For example, the same channel content can be reused with another header layout without changing `Channel`:

```js
UI: {
	Header: ['channel:contact', 'track'],
	Track: ['title', 'chapter'],
	Channel: ['name', 'profile'],
	Overlay: [],
	Toolbar: {
		Items: ['play', 'timeline', 'time', 'volume']
	}
}
```

A compact/headerless composition is expressed directly, without a parallel mode or visibility object:

```js
UI: {
	Header: [],
	Track: ['title', 'chapter'],
	Channel: ['name', 'profile'],
	Overlay: ['track:compact'],
	Toolbar: {
		Items: ['play', 'timeline', 'time', 'volume']
	}
}
```

The composition can be updated at runtime with `player.SetUI({...})`; Ayle emits `uiChange` after the new UI configuration is applied.

### `Player.UI.Overlay`

`Overlay` is a declarative list of overlay layout tokens. It follows the same composition model as `Header`, `Track`, `Channel`, and `Toolbar`: presence enables a layout and an empty list disables overlays.

Built-ins:

| Token | Description |
| --- | --- |
| `track:compact` | Compact overlay presentation of the current track. It consumes the same `UI.Track` list and supports `artwork`, `title`, `artist`, `album`, and `chapter`. `artist`, `album`, and `chapter` are combined into the secondary metadata line in configured order. |
| `subtitles` | Dedicated subtitle overlay for audio mode. |

For example:

```js
UI: {
	Header: [],
	Track: ['artwork', 'title', 'artist', 'album'],
	Channel: ['name', 'profile'],
	Overlay: [
		'track:compact',
		'subtitles'
	],
	Toolbar: {
		Items: ['play', 'timeline', 'time', 'volume']
	}
}
```

`track:compact` is a presentation of `UI.Track`, not a separate metadata configuration. Changing the track list therefore affects both the regular `track` header layout and the compact overlay.

### `Player.AudioVisual`

`AudioVisual` has no `Enabled` switch. Older examples that used
`AudioVisual: {Enabled: true}` were ineffective because that property was never
read by Ayle. The visual area is controlled by `Type`, while `auto` derives the
result from the current source and declarative overlays.

| Option | Type / default | Description |
| --- | --- | --- |
| `Type` | `auto`, `none`, `cover` / `auto` | Controls the visual area used in audio mode. |
| `Image` | string / empty | Explicit image URL, primarily used with `Type: 'cover'`. |
| `Subtitles` | boolean / `true` | Allow subtitles over/in the audio visual area. |
| `MinHeight` | number / `240` | Minimum visual-area height in pixels. |

### `Player.ArtworkSlideshow`

| Option | Type / default | Description |
| --- | --- | --- |
| `Enabled` | boolean / `true` | Enable artwork slideshow before normal playback starts. |
| `HideControls` | boolean / `false` | Hide ordinary controls during the slideshow. The center Play button is still kept available by the UI behavior. |
| `Interval` | number / `3000` | Time per artwork slide in milliseconds; clamped to at least 250 ms. |
| `FadeDuration` | number / `500` | Artwork transition duration in milliseconds. |
| `Fit` | `cover` or `contain` / `cover` | CSS image-fit behavior for slideshow artwork. |

### `Player.Shortcuts`

| Option | Type / default | Description |
| --- | --- | --- |
| `PlayPause` | boolean / `true` | Enable the Play/Pause keyboard shortcut. |
| `SeekArrows` | boolean / `true` | Enable left/right arrow seeking. |
| `SeekAngle` | boolean / `true` | Enable `<` / `>` (`,` / `.`) seeking. |
| `Volume` | boolean / `true` | Enable keyboard volume adjustment. |
| `Mute` | boolean / `true` | Enable keyboard mute toggle. |
| `Subtitles` | boolean / `true` | Enable subtitle shortcut handling. |
| `Fullscreen` | boolean / `true` | Enable fullscreen shortcut handling. |
| `PictureInPicture` | boolean / `true` | Enable Picture-in-Picture shortcut handling. |

### `Player.SettingsOrder` values

The following built-in IDs are currently recognized by the generated Settings UI:

| Value | Description |
| --- | --- |
| `autoplay` | Autoplay toggle. |
| `audio` | Audio-track submenu. |
| `subtitles` | Subtitle submenu. |
| `nativeSubtitles` | Native-subtitles toggle. |
| `nativeSubtitlesInPiP` | Native subtitles in PiP toggle. |
| `shortcuts` | Shortcut settings submenu. |
| `debug` | Debug submenu. |
| `integration` | Custom `Integration.Settings` section. |
| `''` | Visual separator. Duplicate/leading/trailing separators are normalized. |

### `Player.HintSafeArea`

A number may be supplied to apply the same padding to all sides, or an object may be used:

| Option | Type / default | Description |
| --- | --- | --- |
| `Top` | number / `16` | Extra top safe-area padding in pixels. |
| `Right` | number / `16` | Extra right safe-area padding in pixels. |
| `Bottom` | number / `16` | Extra bottom safe-area padding in pixels. |
| `Left` | number / `16` | Extra left safe-area padding in pixels. |

### `Player.SubtitleStyle`

| Option | Type / default | Description |
| --- | --- | --- |
| `Color` | CSS value / `#fff` | Subtitle text color. |
| `Background` | CSS value / `rgba(0, 0, 0, .72)` | Subtitle background. |
| `FontFamily` | CSS font-family / `Arial, sans-serif` | Subtitle font family. |
| `FontSize` | CSS length / `1.15em` | Subtitle font size. |
| `FontWeight` | CSS value / `400` | Subtitle font weight. |
| `LineHeight` | CSS value / `1.25` | Subtitle line height. |
| `TextShadow` | CSS value / `none` | Subtitle text shadow. |
| `Padding` | CSS value / `8px` | Padding around a subtitle cue. |
| `BorderRadius` | CSS value / `8px` | Subtitle cue border radius. |
| `LetterSpacing` | CSS value / `normal` | Subtitle letter spacing. |
| `Bottom` | CSS length / `64px` | Bottom offset of the subtitle overlay. |
| `MaxWidth` | CSS length/percentage / `90%` | Maximum subtitle width. |

### `Player.Integration`

| Option | Type / default | Description |
| --- | --- | --- |
| `Channel` | object or `null` / `null` | Channel/owner information displayed by the normal UI. |
| `Hints` | array / `[]` | Timed interactive hints. |
| `Settings` | array / `[]` | Application-defined Settings items. |
| `Data` | any / `null` | Opaque application data stored with the integration configuration; Ayle does not interpret it. |

#### `Integration.Channel`

| Option | Type / default | Description |
| --- | --- | --- |
| `Name` | string / empty | Channel display name. |
| `Avatar` | string / empty | Channel avatar image URL. |
| `URL` | string / empty | URL associated with the whole channel block. |
| `Action` | function / none | Optional click handler called as `Action(channel, player)`; takes precedence over ordinary channel navigation. |
| `Profile` | object / none | Secondary profile/link information. |

#### `Integration.Channel.Profile`

| Option | Type / default | Description |
| --- | --- | --- |
| `Name` | string / empty | Profile/handle text. |
| `URL` | string / empty | Profile link URL. |
| `Target` | string / `_blank` | Anchor target such as `_self` or `_blank`. `_blank` receives `noopener noreferrer`. |

#### `Integration.Settings[]` item

| Option | Type / default | Description |
| --- | --- | --- |
| `ID` | string / generated | Stable item identifier. |
| `Title` | string / empty | Primary label/title. |
| `Label` | string / empty | Fallback label when `Title` is absent. |
| `Value` | any or function / empty | Value displayed on the right. A function is called as `Value(item, player, ui)`. |
| `Disabled` | boolean / `false` | Disable the item. |
| `Items` | array / none | Nested child Settings items. When present, the item opens a submenu. |
| `Action` | function / none | Primary callback: `Action(item, player, ui, event)`. |
| `OnSelect` | function / none | Alternative callback used when `Action` is absent. |
| `Event` | string / none | When no callback is supplied, emit `settingsAction:<Event>`. |
| `CloseMenu` | boolean / `true` | Set to `false` to keep Settings open after a leaf item is activated. |

### Hint object (`Integration.Hints[]`)

| Option | Type / default | Description |
| --- | --- | --- |
| `ID` | string / generated from position | Hint identifier used for one-shot/dismissal tracking. |
| `Type` | string / `info` | Renderer type. Built-ins include `info`, `correction`, `warning`, `source`, `definition`, `card`, `media`, `product`, `action`, `cta`, `navigation`, `poll`, `quiz`, and `tutorial`; unknown/custom types can use registered renderers/actions. |
| `Start` | number / `0` | Start time in seconds. |
| `End` | number / derived | Explicit end time in seconds. If absent, `Duration` is used. |
| `Duration` | number / implementation-derived | Duration in seconds when `End` is not supplied. |
| `Position` | string / `top-right` | One of `top-left`, `top-center`, `top-right`, `center-left`, `center`, `center-right`, `bottom-left`, `bottom-center`, `bottom-right`. |
| `Offset` | object / `{}` | Additional `{X, Y}` pixel offset. |
| `Title` | string / empty | Hint title. |
| `Text` | string / empty | Hint body/description. |
| `Label` | string / empty | Compact label used by built-in hint types such as `link`. |
| `URL` | string / empty | External URL used by the built-in `link` hint. |
| `Target` | string / `_blank` | Browser target used by the built-in `link` hint. |
| `Image` | string / empty | Optional image URL for card/media/product-style hints. |
| `Action` | object / none | Single action shorthand. |
| `Actions` | array / `[]` | Multiple hint actions. |
| `Dismissible` | boolean / type-dependent | Whether the UI adds a close/dismiss control. |
| `Once` | boolean / `false` | Show only once for the current UI instance after dismissal/consumption. |
| `Repeatable` | boolean / `false` | For quiz behavior, allow the quiz to become eligible again instead of remaining consumed. |
| `PauseOnShow` | boolean / `false` | Pause playback when the hint becomes visible. |
| `ResumeOnAction` | boolean / `false` | Resume playback after an action when the hint paused it. |
| `HideOnAction` | boolean / `true` | Dismiss/hide after an action. Set to `false` to keep it open. |
| `ShowTitle` | boolean / `true` | For renderers that support it (notably navigation), hide the title when `false`. |
| `ShowDescription` | boolean / `true` | For renderers that support it, hide the description when `false`. |
| `ResultMode` | `off`, `instant`, `result` / `off` | Quiz result highlighting mode: no highlighting, immediate highlighting on selection, or highlighting after the answer button. |
| `ResultDuration` | number / renderer default | How long result highlighting remains visible in `result` mode, in milliseconds. |

#### Hint `Offset`

| Option | Type / default | Description |
| --- | --- | --- |
| `X` | number / `0` | Horizontal pixel offset. |
| `Y` | number / `0` | Vertical pixel offset. |

#### Hint action

| Option | Type / default | Description |
| --- | --- | --- |
| `Type` | string / empty | Action type. Built-in behavior exists for `url`, `seek`, `media`, and `callback`; other types emit `hintAction:<type>` unless a handler was registered. |
| `Title` | string / empty | Primary button label. |
| `Label` | string / empty | Fallback button label. |
| `Name` | string / empty | Fallback label and, for callback actions without a function, the suffix for `hintAction:<Name>`. |
| `URL` | string / empty | Destination for `url` actions. |
| `Target` | string / `_blank` | Window target for `url` actions. `_self` navigates the current page. |
| `Time` | number / `0` | Seek target in seconds for `seek` actions. |
| `Source` | `AyleSource`-compatible object / none | Source loaded directly by a `media` action. |
| `Callback` | function / none | Callback for a `callback` action: `Callback(action, hint, player, event)`. |
| `Correct` | boolean / unspecified | Marks a quiz option as correct/incorrect for result highlighting. |

### `MediaProvider` (`AyleHTTPMediaProvider` options)

| Option | Type / default | Description |
| --- | --- | --- |
| `Type` | string / `http` when omitted on an explicit provider descriptor | Registered provider name. Reserved by Ayle and not passed into the provider constructor options. |
| `File` | string / empty | Media identifier substituted into `{file}` placeholders. |
| `MetadataURL` | string / empty | Metadata endpoint template. `{file}` is replaced with the encoded file value. |
| `TrackURL` | string / empty | Generic track endpoint template used when a per-kind URL is absent. Supports `{file}`, `{kind}`, `{track}` and usually `{time}` through stream mode. |
| `VideoURL` | string / empty | Video-specific track URL template overriding `TrackURL`. |
| `AudioURL` | string / empty | Audio-specific track URL template overriding `TrackURL`. |
| `SubtitleURL` | string / empty | Subtitle-specific URL template overriding `TrackURL`. |
| `ArtworkURL` | string / empty | Artwork-specific URL template overriding `TrackURL`. |
| `CoverURL` | string / empty | Alias accepted for `ArtworkURL`. |
| `CodecHeader` | string / `X-Media-Codec` | Header carrying the selected/fixed codec for one concrete pipeline/SourceBuffer. |
| `CodecListHeader` | string / `X-Media-Codec-List` | Header carrying the full list of codecs supported by the browser/player path. |
| `CodecCandidates` | array or `null` / driver candidates | Optional codec candidate groups; otherwise the active driver supplies them. |
| `RequestHeaders` | object / `{}` | Additional HTTP request headers. |
| `Stream` | object / `{}` | MSE stream-loader configuration copied into each generated variant/audio track. |
| `VideoType` | string / `video/mp4` | MIME type used when generating video variants from metadata. |
| `AudioType` | string / `audio/mp4` | MIME type used when generating audio tracks from metadata. |
| `SubtitleType` | string / `text/vtt` | MIME type used for generated subtitle tracks. |

#### `MediaProvider.CodecCandidates[]`

| Option | Type / default | Description |
| --- | --- | --- |
| `Type` | string | MIME type tested by the active driver, for example `video/mp4`. |
| `Codecs` | array of strings | Codec strings tested with `MediaSource.isTypeSupported()` or `HTMLMediaElement.canPlayType()`. |

### `MediaProvider.Stream`

`MediaProvider.Stream` is copied into `AyleMediaVariant.Stream` / `AyleMediaTrack.Stream`. The MSE stream loader currently understands the following options:

| Option | Type / default | Description |
| --- | --- | --- |
| `Mode` | `range`, `segments`, `time` / `time` when built by `AyleHTTPMediaProvider`, otherwise loader fallback `range` | Select byte-range loading, explicit segment descriptors, or time-addressed requests. |
| `ChunkSize` | number / `2097152` | Byte size of each Range request in `range` mode. |
| `BufferAhead` | number / `30` | Target buffered time ahead of the current position, in seconds. |
| `BufferBehind` | number / `20` | Amount of old buffered media generally retained behind the playhead. |
| `SkipInit` | boolean / `false` | Skip a separate initialization segment request. Useful when each time response is self-contained fMP4. |
| `Init` | descriptor / none | Explicit initialization descriptor. Supports `URL`, `RangeStart`, and `RangeEnd`. |
| `InitValue` | any / `init` | In `time` mode, replacement for `{time}` when deriving the init request from the same URL template. |
| `Segments` | array / `[]` | Descriptors for `segments` mode. Each entry may contain `Start`, `End`, `URL`, `RangeStart`, `RangeEnd`. |
| `TimeURL` | string / track URL | Explicit URL template used for `time` requests; should contain `{time}`. |
| `TimeParameter` | string / `time` | Query parameter appended when `TimeURL` does not contain a `{time}` placeholder. |
| `TimePrecision` | number / `3` | Decimal precision used when formatting time-addressed request positions. |
| `TimeStartHeader` | string / `X-Media-Start` | Response header containing the actual fragment start time. |
| `TimeEndHeader` | string / `X-Media-End` | Response header containing the actual fragment end time. |
| `TimeDurationHeader` | string / `X-Media-Duration` | Response header containing the total media duration when supplied by the endpoint. |
| `TimeEOFHeader` | string / `X-Media-EOF` | Response header indicating the final time-addressed fragment. |
| `AlignTimestamps` | boolean / `true` | Enable timestamp alignment logic for appended MSE media. |
| `MaxNoProgressRequests` | number / `3` | Maximum consecutive time-mode requests that fail to advance buffering before the loader stops the request storm. |
| `UseBufferedEndForNextTime` | boolean / `true` | Use the SourceBuffer's real buffered end as the authoritative next request point in time mode. |
| `GapTolerance` | number / `0.15` | Tolerance in seconds used when deciding whether the playback head is inside a buffered range. |
| `MaxGapRetries` | number / `2` | Maximum repeated gap-repair attempts at the same playback position. |
| `TimeEpsilon` | number / `0.001` | Small time tolerance used when validating and terminating time-addressed fragments. |
| `Codec` | string / generated | Selected codec for the concrete stream. Normally injected by `AyleHTTPMediaProvider.BuildStreamOptions()`. |
| `CodecHeader` | string / generated | Per-pipeline codec header name, normally copied from `MediaProvider.CodecHeader`. |
| `CodecListHeader` | string / generated | Supported-codec-list header name. |
| `CodecList` | array / generated | Supported codec list propagated into stream requests. |

### Stream descriptor

| Option | Type / default | Description |
| --- | --- | --- |
| `URL` | string / track URL | Request URL for this init/segment descriptor. |
| `RangeStart` | number / absent | Inclusive byte range start. Presence enables a Range request. |
| `RangeEnd` | number / absent | Inclusive byte range end. |
| `Start` | number / `0` | Segment start time used to select a descriptor in `segments` mode. |
| `End` | number / `0` | Segment end time used to select a descriptor in `segments` mode. |

### `MediaConfig`

`MediaConfig` is normalized by `AyleBootstrap.NormalizeMediaConfig()` before being merged with `PlayerConfig`:

| Option | Type / default | Description |
| --- | --- | --- |
| `File` | string / empty | Convenience shortcut normalized into `MediaProvider.File`; if no provider exists yet, `Type: 'http'` is assumed. |
| `Files` | array / none | Optional media list normalized into `MediaProvider.Files`; if `MediaProvider.File` is absent, the first string or first object with `File` supplies it. |
| `MediaProvider` | object / none | Provider descriptor. `Type` selects a registered provider and the remaining fields are provider-specific. |
| `Driver` | object / none | Media-specific driver override. |
| `Player` | object / none | Media-specific player option overrides. |
| `Mode` | string / none | Shortcut mapped to `Player.MediaMode`. |
| `Cover` | string / none | Shortcut that maps to `Player.AudioVisual = {Type: 'cover', Image: Cover}`. |
| `AudioVisual` | object / none | Shortcut mapped to `Player.AudioVisual`. |
| `Channel` | object / none | Shortcut merged into `Player.Integration.Channel`. |
| `Hints` | array / none | Shortcut merged into `Player.Integration.Hints`. |
| `Settings` | array / none | Shortcut merged into `Player.Integration.Settings`. |
| `Data` | any / none | Shortcut merged into `Player.Integration.Data`. |
| `Integration` | object / none | Merged with the shortcut integration values above. |

### Media/source object reference

These objects are not bootstrap options themselves, but they are accepted/produced by direct API and integration paths.

#### `AyleSource`

| Option | Type / default | Description |
| --- | --- | --- |
| `ID` | string / empty | Source identifier. |
| `URL` | string / empty | Direct media URL for a single-source HTML5-style source. |
| `Type` | string / empty | MIME type. |
| `Codecs` | string / empty | Codec string. |
| `Title` | string / empty | Display title. |
| `Artist` | string / empty | Artist metadata. |
| `Album` | string / empty | Album metadata. |
| `Duration` | number / `0` | Duration in seconds. |
| `Live` | boolean / `false` | Marks the source as live. |
| `MediaMode` | string / `auto` | Source-level media-mode hint. |
| `Cover` | string / empty | Selected/default cover URL. |
| `Covers` | array / `[]` | Available `AyleMediaCover` items. |
| `Stream` | object or `null` | Direct source stream options. |
| `Variants` | array / `[]` | Video `AyleMediaVariant` items. |
| `AudioTracks` | array / `[]` | Audio `AyleMediaTrack` items. |
| `SubtitleTracks` | array / `[]` | Subtitle `AyleMediaTrack` items. |
| `Chapters` | array / `[]` | `AyleMediaChapter` items. |

#### `AyleMediaVariant`

| Option | Type / default | Description |
| --- | --- | --- |
| `ID` | string / empty | Variant identifier. |
| `URL` | string / empty | Variant media URL/template. |
| `Type` | string / empty | MIME type. |
| `Codecs` | string / empty | Codec string used for SourceBuffer/capability checks. |
| `Width` | number / `0` | Video width. |
| `Height` | number / `0` | Video height. |
| `FrameRate` | number / `0` | Video frame rate. |
| `Bitrate` | number / `0` | Variant bitrate. |
| `Label` | string / empty | Human-readable label. |
| `Default` | boolean / `false` | Marks the default variant. |
| `Stream` | object or `null` | MSE stream configuration. |

#### `AyleMediaTrack`

| Option | Type / default | Description |
| --- | --- | --- |
| `ID` | string / empty | Track identifier. |
| `URL` | string / empty | Track URL/template. |
| `Type` | string / empty | MIME type. |
| `Codecs` | string / empty | Codec string. |
| `Language` | string / empty | Language code. |
| `Label` | string / empty | Human-readable label. |
| `Default` | boolean / `false` | Marks the default track. |
| `Forced` | boolean / `false` | Marks a forced subtitle track. |
| `Native` | object or `null` | Associated native browser track object when available. |
| `Cues` | array / `[]` | Custom subtitle cue data. |
| `Stream` | object or `null` | MSE stream configuration for audio/media tracks. |

#### `AyleMediaCover`

| Option | Type / default | Description |
| --- | --- | --- |
| `ID` | string / empty | Cover identifier. |
| `URL` | string / empty | Image URL. |
| `Type` | string / empty | Image MIME type. |
| `Codec` | string / empty | Source codec/format label. |
| `Width` | number / `0` | Image width. |
| `Height` | number / `0` | Image height. |
| `Label` | string / empty | Cover label/title. |
| `Default` | boolean / `false` | Marks the preferred cover. |
| `AttachedPicture` | boolean / `true` | Whether the cover originated as an attached picture. |
| `Source` | any / `null` | Original metadata item. |

#### `AyleMediaChapter`

| Option | Type / default | Description |
| --- | --- | --- |
| `ID` | string / empty | Chapter identifier. |
| `Start` | number / `0` | Chapter start in seconds. |
| `End` | number / `0` | Chapter end in seconds. |
| `Title` | string / empty | Chapter title. |
| `Native` | object or `null` | Associated native chapter object/track data when present. |

### `data-ayle*` attribute reference

Public attributes are intended for embedding/configuration. Runtime/internal attributes are documented separately so integrations can inspect them without confusing them with supported input options.

#### Public loader attributes

| Attribute | Value / default | Description |
| --- | --- | --- |
| `data-ayle-loader` | boolean marker | Marks the script element used as the Ayle loader. `document.currentScript` is preferred; this marker is the fallback lookup. |
| `data-ayle-driver` | `mse` or `html5` | Default driver for all declarative instances created by this loader. |
| `data-ayle-driver-options` | JSON object | Default `Driver.Options`. Parsed as JSON. |
| `data-ayle-media-provider` | registered provider name | Default `MediaProvider.Type` for declarative instances. |
| `data-ayle-url-metadata` | URL template | Default built-in HTTP `MediaProvider.MetadataURL`. |
| `data-ayle-url-track` | URL template | Default built-in HTTP `MediaProvider.TrackURL`. |
| `data-ayle-settings` | `localStorage`, `sessionStorage`, `cookie`, or empty | Global settings-persistence backend. Empty disables persistence; absence means no loader-level value. |
| `data-ayle-localization` | locale key | Default player localization. |
| `data-ayle-auto-focus` | boolean attribute/value | Default `Player.AutoFocus`. Bare/empty means true. |
| `data-ayle-autoplay` | boolean attribute/value | Default `Player.AutoPlay`. Bare/empty means true. |
| `data-ayle-autoplay-mode` | `audible` or `muted` | Default `Player.AutoPlayMode`. |
| `data-ayle-volume` | number `0..1` | Default `Player.Volume`. Values are clamped to the valid range. |
| `data-ayle-start` | seconds / `0` | Default `Player.Start`. Negative values are clamped to `0`. |
| `data-ayle-muted` | boolean attribute/value | Default `Player.Muted`. Bare/empty means true. |
| `data-ayle-auto-init` | boolean / `true` | Controls whether the bootstrap automatically runs `InitAll()`. |
| `data-ayle-skip-init` | boolean | Default built-in HTTP `MediaProvider.Stream.SkipInit`. |

#### Public instance attributes

| Attribute | Value / default | Description |
| --- | --- | --- |
| `data-ayle` | string | Declares an instance and supplies its ID. It is also the default selector used by `InitAll()`. |
| `data-ayle-auto` | `false` or other / enabled | Per-instance automatic initialization switch. Exactly `false` causes `InitAll()` to skip the element. |
| `data-ayle-preset` | `video`, `audio`, or registered preset | Shortcut for top-level `Preset`. |
| `data-ayle-file` | string | Shortcut for `MediaProvider.File`; in split config it maps through `MediaConfig.File`. |
| `data-ayle-localization` | locale key | Overrides `Player.Localization` for this instance. |
| `data-ayle-driver` | `mse` or `html5` | Overrides `Driver.Type`. |
| `data-ayle-driver-options` | JSON object | Merged over inherited `Driver.Options`. |
| `data-ayle-volume` | number `0..1` | Overrides `Player.Volume` for this instance. |
| `data-ayle-start` | seconds / `0` | Overrides `Player.Start` for this instance. |
| `data-ayle-muted` | boolean attribute/value | Overrides `Player.Muted` for this instance. Bare/empty means true. |
| `data-ayle-settings` | storage name or empty | Per-instance persistence override. Absence inherits the loader setting; empty explicitly disables it. |
| `data-ayle-debug` | boolean marker | Adds the Debug section to the generated Settings order for this declarative instance. |
| `data-ayle-on` | bindings string | Event bindings in `event:globalHandler;event2:namespace.handler` form. Each handler receives `{Type, Data, Player, Instance, Element}`. |

#### Runtime/internal `data-ayle*` attributes

| Attribute | Used on | Description |
| --- | --- | --- |
| `data-ayle-error` | declarative target | Set by `InitAll()` when initialization throws; contains the error message. |
| `data-ayle-loaded` | injected resource script | Marks a dynamically loaded runtime resource as loaded. |
| `data-ayle-resource` | injected `<script>` / `<link>` | Identifies dynamically injected Ayle resources such as core JS/CSS. |
| `data-ayle-i18n` | generated UI element | Localization key for text content. |
| `data-ayle-i18n-label` | generated UI element | Localization key for `aria-label`/related accessible labels. |
| `data-ayle-i18n-title` | generated UI element | Localization key for `title`. |
| `data-ayle-settings-item` | generated Settings item | Stable Settings-order key such as `autoplay`, `audio`, or `debug`. |
| `data-ayle-control` | generated control | Internal control identifier used by responsive/control-layout logic. |
| `data-ayle-hint-type` | hint element | Normalized hint renderer/type. |
| `data-ayle-overlay-track-compact-position` | compact track overlay | Resolved `top`/`bottom` placement. |
| `data-ayle-overlay-audio-subtitles-position` | audio subtitle overlay | Resolved subtitle popup placement. |
| `data-ayle-overlay-audio-subtitles-state` | audio subtitle overlay | Current subtitle popup state. |
| `data-ayle-play-unavailable` | player element | Transient/UI state describing an unavailable Play attempt. |
| `data-ayle-popover-position` | popover | Resolved popover placement. |
| `data-ayle-source-state` | player element | High-level source state such as `ready`, `error`, `loading`, or `empty`. |
| `data-ayle-subtitle-cues` | subtitle overlay | Number of custom subtitle cues associated with the active track. |
| `data-ayle-subtitle-offset` | subtitle overlay | Current subtitle offset value. |
| `data-ayle-subtitle-state` | subtitle overlay | Subtitle render state such as `no-track`, `no-cues`, `no-active-cue`, or `visible`. |
| `data-ayle-subtitle-track` | subtitle overlay | Active subtitle track ID. |
| `data-ayle-track` | generated native `<track>` | Marks subtitle `<track>` elements created and managed by Ayle. |


## Presets

Ayle has one preset registry shared by the direct runtime, Bootstrap, Angular,
React and declarative embeds. `video` and `audio` are built-in mode presets.
When `Player.Preset` is omitted, `MediaMode` selects the matching built-in
preset automatically. `MediaMode: 'auto'` follows the resolved source mode.

Both built-in presets use an empty header. `video` uses
`['title', 'chapter']` track content and `['track:compact']` overlay. Its
center Play button is enabled and video loading uses the normal centered
circular spinner. `audio` uses `['artwork', 'title', 'artist', 'album']` track
content and `['track:compact', 'subtitles']` overlay; compact audio may use the
timeline loading treatment instead. The built-in `video` toolbar is:

```js
['play', 'timeline', 'time', 'volume', 'chapters', 'quality', 'fullscreen', 'settings']
```

`chapters` and `quality` are present in the layout but hide themselves when
there is no corresponding data. `fullscreen` is always present. `settings` is
the final/rightmost default item. `pip` is intentionally not part of the
default video preset and can be added explicitly.

The built-in `audio` toolbar remains:

```js
['play', 'timeline', 'time', 'volume', 'settings']
```

`settings` is therefore available by default, but it is still only a layout
item. A concrete player can remove it by explicitly supplying another
`UI.Toolbar.Items` array.

The inline toolbar switches to its narrow/multi-row geometry only when the
rendered controls actually overflow the available Player width; it is not
selected from a fixed Player-width breakpoint.

Preset contract:

```js
Ayle.RegisterPreset('podcast', {
	Player: {
		ShowCenterPlayButton: false,
		AutoFocus: true
	},
	UI: {
		Header: [],
		Track: ['artwork', 'title', 'artist', 'album'],
		Overlay: ['track:compact'],
		Toolbar: {
			Items: ['play', 'timeline', 'time', 'volume', 'settings']
		}
	}
});
```

`Player` contains partial player behaviour options. `UI` contains the partial
UI composition. A preset cannot change `MediaMode`; `MediaMode`, `Preset` and
nested `Player.UI` are ignored during preset registration so that media
semantics stay explicit. MediaProvider/Driver configuration is not part of the
preset contract.

Use a registered preset directly:

```js
var player = new Ayle({
	Driver: {
		Type: 'html5'
	},
	Player: {
		MediaMode: 'audio',
		Preset: 'podcast'
	}
});
```

Resolution order is:

```text
core defaults
    -> MediaMode built-in preset
    -> custom preset
    -> explicit player options
```

Explicit values always win, including empty arrays. For example,
`UI: {Header: []}` always means an empty header; it never means "restore the
preset value".

Registry API:

```js
Ayle.RegisterPreset(name, preset);
Ayle.GetPreset(name);
Ayle.HasPreset(name);
Ayle.RemovePreset(name);
```

The built-in `video` and `audio` names are protected from overwrite/removal.
`GetPreset()` returns a copy. `AyleBootstrap` exposes delegates with the same
four method names, so declarative, Angular and React integrations use the same
registry rather than maintaining a second preset system.

For declarative configuration, the top-level `Preset` shortcut and
`data-ayle-preset` are normalized to `Player.Preset`.


## Public runtime classes

`ayle.js` exports:

```text
Ayle
AyleMediaProvider
AyleHTTPMediaProvider
AyleUI
AyleEventEmitter
AyleMediaVariant
AyleMediaTrack
AyleMediaCover
AyleMediaChapter
AyleSource
AyleMediaDriver
AyleHTML5MediaDriver
AyleMSEMediaDriver
```

`ayle-bootstrap.js` additionally exports `AyleBootstrap`.

The current bootstrap exposes `AyleEmbed` and `AyleInstances` as the global
bootstrap instance and instance collection used by declarative examples.

## Events API

`Ayle`, `AyleMediaDriver` and `AyleMediaProvider` use the same emitter contract
(`On`, `Off`, `Once`, `Emit`). Driver/provider events are also forwarded to the
owning player with namespaces, so application code can subscribe through one
object:

```js
player.On('ready', onReady);
player.On('error', onError);

player.On('driver:error', onDriverError);
player.On('provider:error', onProviderError);
player.On('provider:metadata', onProviderMetadata);

player.Off('provider:error', onProviderError);
```

Normal semantic player events remain unprefixed. `driver:*` and `provider:*`
are the lower-level diagnostic/component event streams.


The tables below list **all statically visible event names emitted by the current `ayle.js` through `Emit()`**. Dynamic `hintAction:*` and `settingsAction:*` event families are documented explicitly in the tables.

Subscribe through the API:

```js
ayle.On('play', function () {
	console.log('play');
});
```

For a declarative instance:

```html
data-ayle-on="play:onPlay;pause:onPause;error:onError"
```

A handler bound through `data-ayle-on` receives a wrapper object containing `Type`, `Data`, `Player`, `Instance`, and `Element`.

### Playback

| Event | Description | Payload |
| --- | --- | --- |
| `autoplayBlocked` | The browser blocked an autoplay attempt. | `Error` / blocking reason |
| `buffering` | The buffering state changed. | `boolean` |
| `durationChange` | The known media duration changed. | seconds |
| `emptyPlay` | Play was requested without a playable source. | no payload |
| `ended` | Playback naturally reached the end. | no payload |
| `pause` | Media entered the paused state. | no payload |
| `pictureInPictureChange` | Picture-in-Picture state changed. | `boolean` |
| `play` | A Play event/request was processed. | no payload |
| `playUnavailable` | Playback cannot start, for example because no source is available. | `{Reason, State}` |
| `playing` | Media actually started or resumed playback. | no payload |
| `rateChange` | Playback rate changed. | number |
| `seeked` | A seek operation completed. | no payload |
| `seeking` | The seeking state changed. | `boolean` |
| `timeUpdate` | The current playback position and/or duration changed. | `{Position, Duration}` object or driver data |
| `volumeChange` | Volume and/or mute state changed. | volume/muted object or driver data |

### Loading

| Event | Description | Payload |
| --- | --- | --- |
| `loadStart` | Loading of a new source/media started. | no payload |
| `metadata` | Media metadata was received or applied. | metadata object |
| `progress` | Buffered/loading progress changed. | progress/ranges object |
| `ready` | The driver/source became ready. | no payload |
| `sourceChange` | The active `AyleSource` changed. | `AyleSource` |

### State

| Event | Description | Payload |
| --- | --- | --- |
| `stateChange` | The aggregate `Ayle.State` changed. | `Ayle.State` |

### Tracks

| Event | Description | Payload |
| --- | --- | --- |
| `audioTrackChange` | The selected audio track changed. | `AyleMediaTrack` or `null` |
| `audioTracksChange` | The available audio track list changed. | array of `AyleMediaTrack` |
| `variantChange` | A new video variant was requested/selected. | `AyleMediaVariant` |
| `variantSwitchError` | Switching to a variant failed. | variant/error context object |
| `variantSwitched` | Switching to a new variant completed successfully. | `AyleMediaVariant` |
| `variantsChange` | The available video variant list changed. | array of `AyleMediaVariant` |

### Subtitles

| Event | Description | Payload |
| --- | --- | --- |
| `autoNativeSubtitlesInPictureInPictureChange` | Automatic native subtitles in PiP changed. | `boolean` |
| `nativeSubtitlesChange` | Native subtitle mode was enabled or disabled. | `boolean` |
| `subtitleData` | Subtitle data/cues were received. | subtitle data object |
| `subtitleDataChange` | Prepared subtitle data/cues changed. | subtitle data object |
| `subtitleOffsetChange` | The subtitle time offset changed. | seconds |
| `subtitleStyleChange` | Custom subtitle overlay styles changed. | `SubtitleStyle` options |
| `subtitleTrackChange` | The selected subtitle track changed. | `AyleMediaTrack` or `null` |
| `subtitleTracksChange` | The available subtitle track list changed. | array of `AyleMediaTrack` |

### Chapters

| Event | Description | Payload |
| --- | --- | --- |
| `chapterChange` | The current chapter changed. | `AyleMediaChapter` or `null` |
| `chaptersChange` | The chapter list changed. | array of chapters |

### Settings

| Event | Description | Payload |
| --- | --- | --- |
| `autoplayChange` | Autoplay was enabled or disabled. | `boolean` |
| `autoplayModeChange` | The autoplay mode changed. | mode string |
| `autoplaySettingsChange` | Autoplay was changed through the Settings UI. | settings data object |
| `settingsChange` | A persistent or integration setting changed. | object containing the setting name/value |
| `settingsOrderChange` | The Settings item order changed. | array of IDs/separators |

### Shortcuts

| Event | Description | Payload |
| --- | --- | --- |
| `keyboardAngleSeekStepChange` | The seek step for `<` / `>` (`,` / `.`) changed. | seek step value |
| `keyboardArrowSeekStepChange` | The arrow-key seek step changed. | seconds |
| `keyboardFrameRateFallbackChange` | The fallback frame rate for frame-based seeking changed. | fps value |
| `shortcutChange` | The state/configuration of a shortcut changed. | shortcut/value object |
| `shortcutSettingsChange` | A shortcut was changed through the Settings UI. | settings data object |

### UI / mode

| Event | Description | Payload |
| --- | --- | --- |
| `audioVisualChange` | The audio player visual-area configuration changed. | `AudioVisual` options |
| `fontFamilyChange` | The configured UI font family changed. | font-family string |
| `mediaModeChange` | The media mode changed, for example video/audio. | mode string |
| `uiChange` | Declarative UI configuration changed. | `UI` options |

### Localization

| Event | Description | Payload |
| --- | --- | --- |
| `localizationChange` | The active localization changed. | localization object |

### Artwork

| Event | Description | Payload |
| --- | --- | --- |
| `artworkSlideshowChange` | Artwork slideshow settings changed. | `ArtworkSlideshow` options |
| `artworkSlideshowStart` | The pre-playback artwork slideshow started. | current slideshow data |
| `artworkSlideshowStop` | The artwork slideshow stopped. | slideshow state/data |

### Hints

| Event | Description | Payload |
| --- | --- | --- |
| `hintAction` | An action for the current hint was executed. | `{Hint, Action, Event, Result}` |
| `hintAction:` | Dynamic event prefix: `hintAction:<name>` or `hintAction:<type>` for custom/callback hint actions. | `{Hint, Action, Event}` |
| `hintClose` | The current hint was closed. | hint object |
| `hintDismiss` | The user explicitly dismissed a hint. | hint object |
| `hintHide` | A hint was hidden. | hint object |
| `hintMedia` | A hint requested a media action without a direct `Source`. | `{Hint, Action}` |
| `hintOpen` | A hint was opened. | hint object |
| `hintRenderersChange` | The hint renderer registry changed. | renderer registry data |
| `hintResume` | A hint flow requested/resumed continuation. | hint object |
| `hintSafeAreaChange` | The hint positioning safe area changed. | `HintSafeArea` options |
| `hintShow` | A hint became visible. | hint object |
| `hintsChange` | The active hint collection changed. | array of active hints |
| `quizAnswer` | The user confirmed an answer in a quiz hint. | `{Hint, Action, Option, Event, UI}` |

### Integration

| Event | Description | Payload |
| --- | --- | --- |
| `integrationChange` | External UI integration configuration changed. | `Integration` options |
| `integrationSettingsAction` | An integration item action was executed in Settings. | `{Item, Event, Result, UI}` |
| `settingsAction` | A custom settings item without its own callback requested the default action. | `{Item, Event, UI}` |
| `settingsAction:` | Dynamic event prefix: `settingsAction:<event>` from a custom integration item. | `{Item, Event, UI}` |

### Debug

| Event | Description | Payload |
| --- | --- | --- |
| `debugChange` | The main debug flag changed. | `boolean` |
| `debugMP4Change` | The MP4 debug flag changed. | `boolean` |
| `debugMP4SettingsChange` | MP4 debug was changed through the Settings UI. | settings data object |
| `debugSettingsChange` | Main debug was changed through the Settings UI. | settings data object |

### Errors

| Event | Description | Payload |
| --- | --- | --- |
| `error` | A driver, loading, MSE, subtitle, or other runtime error occurred. | `Error` or error object |

### Bootstrap document events

These are not `Ayle.Emit()` events: `ayle-bootstrap.js` dispatches them as DOM `CustomEvent` instances.

| Event | Description | Payload |
| --- | --- | --- |
| `playerBootstrapReady` | Bootstrap was created, the core was loaded, and initialization is available. | `event.detail.Bootstrap`, `event.detail.Instances` |
| `playerReady` | A declarative instance was created successfully. | `event.detail` with the ID and instance data |
| `playerError` | Declarative initialization/loading failed and the bootstrap layer reported the error. | `event.detail.Error` plus instance context |

> `hintAction:` and `settingsAction:` above are prefixes, not literal fixed event names. Runtime emits `hintAction:<name/type>` and `settingsAction:<event>`.


## Settings persistence

`data-ayle-settings` supports three persistent storage backends and an explicit
no-storage mode:

```text
localStorage
sessionStorage
cookie
<empty>
```

An empty value means **do not persist player settings**. Programmatic `null`,
`false`, and an empty string have the same no-storage meaning.

The distinction between an absent attribute and an empty attribute is
intentional:

- no `data-ayle-settings` attribute: inherit the loader-level setting;
- `data-ayle-settings=""`: explicitly disable persistence for this instance;
- `data-ayle-settings="localStorage"`: use `localStorage`;
- `data-ayle-settings="sessionStorage"`: use `sessionStorage`;
- `data-ayle-settings="cookie"`: use cookies.

At loader level, an empty `data-ayle-settings` value means that no global
persistence backend is configured.

Per-instance configuration overrides the loader-level value, including the
explicit no-storage value.

## Localization

Bundled localizations:

```text
English
Russian
Moldovan
German
Spanish
French
Chinese
Japanese
Greek
Italian
Turkish
Arabic
Hindi
```

Recognized aliases include `en`, `en-US`, `ru`, `ru-RU`, `ru-MD`, `ro`, `ro-MD`, `md`, `md-MD`, `de`, `es`, `fr`, `zh`, `zh-CN`, `ja`, `el`, `it`, `tr`, `ar`, `hi` and `hi-IN`.

Without an explicit localization, Ayle resolves the browser language automatically.

## CSS

Generated UI classes use `.ayle` / `.ayle-*`. Custom properties use
`--ayle-*`.

All custom-property defaults are declared at the beginning of `ayle.css`;
usage sites do not carry inline fallback values. Font-family usages have a
generic family fallback. Fullscreen height uses `100dvh`.

## Icons

The normal bootstrap path does not need separate UI icon files: the SVG symbol
sprite and loading spinner are embedded by `ayle-bootstrap.js`.

`ayle-icons.svg` and `icons/*.svg` remain because the manual low-level
examples contain hand-written UI markup and reference those assets directly.

## Drivers

Drivers and media providers have symmetrical registries. The built-in drivers
are registered automatically by the library:

```text
html5
mse
```

Registry API:

```js
Ayle.RegisterDriver(name, Driver);
Ayle.GetDriver(name);
Ayle.HasDriver(name);
Ayle.CreateDriver(name, options);
Ayle.RemoveDriver(name);
```

Built-in driver names are protected from overwrite/removal. Custom drivers
should derive from `AyleMediaDriver`; this gives them the common event API and
allows their events to be surfaced through the owning player.

The architectural boundary is:

```text
developer media input
        ↓
MediaProvider
        ↓
     AyleSource
        ↓
      Driver
        ↓
 browser/media pipeline
```

The provider owns acquisition/resolution. The driver owns playback of the
resolved `AyleSource`.

## Media providers

Media acquisition is transport-independent. `AyleMediaProvider` is the base
contract, while `AyleHTTPMediaProvider` is the built-in HTTP implementation.

A canonical declarative configuration uses `MediaProvider`:

```js
MediaProvider: {
	Type: 'http',
	File: 'example.mkv',
	MetadataURL: '/media/metadata?file={file}',
	TrackURL: '/media/track?file={file}&type={kind}&track={track}&start={time}',
	Stream: {
		SkipInit: true
	}
}
```

`Type` is reserved by Ayle and selects a registered provider. If omitted it
defaults to the built-in `http` provider. The remaining properties are passed
to that provider. The `Ayle` instance owns the created provider as
`player.MediaProvider`; Bootstrap/framework instances expose that same object
rather than creating a second provider.

The provider contract intentionally stays small:

```js
function CustomMediaProvider (player, options) {
	AyleMediaProvider.call(this, player, options);
}

CustomMediaProvider.prototype = Object.create(AyleMediaProvider.prototype);
CustomMediaProvider.prototype.constructor = CustomMediaProvider;

CustomMediaProvider.prototype.Load = function (callback) {
	// Resolve a source using any transport, then:
	// this.Source = source;
	// this.Metadata = metadata;
	// this.Player.Load(source);
	// callback(null, source, metadata);
};

CustomMediaProvider.prototype.Destroy = function () {
	AyleMediaProvider.prototype.Destroy.call(this);
	return this;
};
```

Providers are registered in the shared core registry:

```js
Ayle.RegisterMediaProvider('custom', CustomMediaProvider);
Ayle.GetMediaProvider('custom');
Ayle.HasMediaProvider('custom');
Ayle.CreateMediaProvider('custom', player, options);
Ayle.RemoveMediaProvider('custom');
```

Provider names are case-insensitive and normalized to lowercase. The built-in
`http` provider is protected from overwrite/removal. `AyleBootstrap` exposes
delegates for the same provider registry so declarative and framework bindings
use the core registry rather than a second implementation.

The registry creation API is primarily for integrations and advanced custom
assembly. Normal application code declares the provider on `Ayle` and loads it
through the player:

```js
var player = new Ayle({
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
});

player.Load();
```

For an ordinary browser-playable resource no specialized metadata server is
required:

```js
var player = new Ayle({
	Driver: {
		Type: 'html5'
	},
	MediaProvider: {
		File: '/media/movie.mp4'
	}
});
```

With no `MetadataURL`, `AyleHTTPMediaProvider` runs in **direct mode** and
resolves `File` directly to `AyleSource.URL`. With `MetadataURL`, it runs in
**metadata mode** and uses the existing metadata/track protocol, codec
negotiation and stream configuration. The provider resolves the source; the
driver decides how that resolved source is played.

`AyleHTTPMediaProvider` supports URL templates using:

```text
{file}
{kind}
{track}
{time}
```

`{kind}` may resolve to `video`, `audio`, `subtitle` or `artwork`.

URLs under `../../server/...` in examples are integration placeholders. This
archive does not contain a PHP backend.

### Codec negotiation

The built-in HTTP provider distinguishes:

```text
X-Media-Codec
X-Media-Codec-List
```

`X-Media-Codec-List` is the full list of codecs supported by the browser/player
path. `X-Media-Codec` is the preferred/fixed codec for one concrete pipeline or
SourceBuffer. A backend should not treat them as interchangeable.

`metadata.example.json` contains every metadata field currently consumed by
`AyleHTTPMediaProvider`, including supported aliases/fallbacks, and
intentionally omits backend/ffprobe fields that the player does not read.

## MSE notes

The MSE driver performs runtime codec support checks and supports segmented and
time-addressed loading. MSE support is browser/container/codec dependent; do
not assume that one codec combination works everywhere. Fragmented MP4 with a
browser-supported codec is the normal interoperability path.

## Subtitles

Ayle supports native subtitle tracks and a custom HTML subtitle overlay.
Supported inline subtitle markup such as `<i>` is preserved by the custom
subtitle path. The compact audio composition can expose subtitles through its subtitle
popup.

## Artwork

Video artwork can be shown before playback as a slideshow. Relevant options
live under `Player.ArtworkSlideshow`, including:

```text
Enabled
HideControls
Interval
FadeDuration
Fit
```

## Input and responsive behavior

The current UI includes automatic focus on interaction, keyboard seeking and
volume controls, left/right double-click quick seek, center double-click
fullscreen behavior, touch-first UI reveal, narrow-player responsive controls,
fullscreen and Picture-in-Picture where supported.

## Package layout and example paths

The HTML examples live in `examples/`, while the Ayle runtime files remain at
the package root. The example backend is intentionally outside the Ayle package
root and is reached with ordinary relative URLs:

```text
<parent>/
├── server/
│   ├── metadata.php
│   └── track.php
└── <ayle-root>/
    ├── ayle.js
    ├── ayle-bootstrap.js
    ├── ayle.css
    ├── ayle-icons.svg
    ├── icons/
    └── examples/
        ├── low-level.html
        ├── embedded.html
        ├── angular/
        └── react/
```

No rewrite rules, aliases, or front controllers are required. A declarative
example uses:

```html
<script
    src="../ayle-bootstrap.js"
    data-ayle-loader
    data-ayle-driver="mse"
    data-ayle-url-metadata="../../server/metadata.php?file={file}"
    data-ayle-url-track="../../server/track.php?file={file}&type={kind}&track={track}&start={time}">
</script>
```

`ayle-bootstrap.js` resolves `ayle.js` and `ayle.css` relative to its own
`src`, so loading the bootstrap as `../ayle-bootstrap.js` still resolves the
runtime files from `<ayle-root>/`.

Values such as `data-ayle-file="example.mkv"` are media identifiers sent to the
configured backend, not browser-relative paths, and therefore are not prefixed
with `../`.

Integration examples reference `../../img/channel-avatar.png`. The external `img/` directory is not distributed in this package; provide the
example asset at `../../img/channel-avatar.png` when running those examples.

### Center Play visibility and narrow menus

The center Play/Pause control keeps the button itself visually neutral. Contrast is applied directly to the rendered SVG `<use>` element with `filter: drop-shadow(...)`, so the Play/Pause glyph remains readable over bright video frames without drawing a visible circle around the button.
These values are themeable through `--ayle-center-icon-shadow`.

When the Player enters its narrow-controls layout, open popovers are clamped to
the **actual Player width**, not the browser viewport. If menu content is wider
than the available Player area, the popover remains inside the Player and
becomes horizontally/vertically scrollable.

## Examples

### Declarative/bootstrap examples

| File | Purpose |
| --- | --- |
| `examples/embed-example.html` | Basic JSON-configured declarative instance. |
| `examples/embed-data-attributes.html` | Attribute shortcuts and intentional no-source state. |
| `examples/embed-presets-combined.html` | Presets, persistence, Debug and event binding. |
| `examples/embed-presets-combined-integrations.html` | Combined presets plus full Integration examples: Channel, Hints, custom actions/renderers, custom Settings and Integration.Data. |
| `examples/embed-preset-video.html` | Minimal video preset. |
| `examples/embed-preset-audio.html` | Minimal audio preset. |
| `examples/embed-preset-auto.html` | Automatic preset resolution. |
| `examples/embed-external-config.html` | Initialization from external configuration. |
| `examples/embed-split-config.html` | Split player/media configuration. |
| `examples/embed-split-config-declarative.html` | Declarative split configuration. |
| `examples/embed-split-config-full.html` | Full split-config integration. |
| `examples/embed-full-example.html` | Full declarative integration. |
| `examples/embed-audio-minimal.html` | Minimal audio UI. |
| `examples/embed-audio-minimal-settings.html` | Minimal audio with Settings. |
| `examples/embed-audio-minimal-channel.html` | Minimal audio with channel metadata. |
| `examples/embed-audio-minimal-channel-settings-subtitles.html` | Minimal audio with channel, Settings and subtitles. |
| `examples/embed-audio-subtitles.html` | Audio subtitle behavior. |
| `examples/embed-audio-visual.html` | Audio visual area and hints. |

### Manual / low-level examples

| File | Purpose |
| --- | --- |
| `examples/index.html` | Direct Ayle construction with hand-written DOM. |
| `examples/mse-multiple-audio.html` | Direct MSE with multiple audio tracks. |
| `examples/mse-range-streaming.html` | Direct HTTP Range MSE streaming. |
| `examples/mse-time-streaming.html` | Direct metadata-driven time-addressed MSE streaming. |

The manual examples intentionally bypass `AyleBootstrap`. They keep explicit
`ayle.css`, `ayle.js`, SVG references and hand-written player markup to exercise
the lower-level API.

## Running examples

The package contains the frontend examples and sample metadata, not the example
media backend. Examples configured with `../../server/metadata.php` from files inside `examples/` and
`../../server/track.php` from files inside `examples/` need a compatible backend at those paths before playback can
work.

For browser testing, serve the directory over HTTP rather than relying on a
`file://` URL, especially for XHR/fetch, media requests and MSE behavior.

## Release sanity checks

The current package was checked for:

1. valid syntax in `ayle.js` and `ayle-bootstrap.js`;
2. valid inline JavaScript in every HTML example;
3. valid JSON in every `application/json` example block;
4. consistent `data-ayle` / `data-ayle-*` declarative attributes;
5. no old `.player-*` CSS selectors or `--player-*` custom properties;
6. no old runtime filenames in examples;
7. all local `src`/`href` assets referenced by examples existing in the archive;
8. example JSON using the actual `Player` config key.

## Browser compatibility

The HTML5 driver follows the browser's normal `HTMLMediaElement` capabilities.
The MSE driver additionally requires Media Source Extensions and a supported
container/codec combination. Runtime codec detection is authoritative.


## npm package and core build

The repository root is the source of the framework-independent
`@qybercom/ayle` npm package. Source files remain directly at the repository
root; generated files are written to `dist/` and are not committed.

```text
<root>/
├── examples/
├── icons/
├── bindings/
│   ├── angular/
│   └── react/
├── scripts/
├── ayle.js
├── ayle-bootstrap.js
├── ayle.css
├── ayle-icons.svg
├── package.json
└── dist/                  # generated
```

Install build dependencies and build the core package:

```bash
npm install
npm run build
npm run check
```

The core build produces:

```text
dist/
├── ayle.js
├── ayle.min.js
├── ayle.esm.js
├── ayle-bootstrap.js
├── ayle-bootstrap.min.js
├── ayle.css
├── ayle.min.css
├── ayle-icons.svg
├── README.md
└── LICENSE                # copied when present
```

`ayle.js`, `ayle-bootstrap.js`, and `ayle.css` remain the canonical readable
browser sources. Their `.min.*` counterparts are production minified builds.
`ayle.esm.js` exposes the core public API as ES module exports without changing
the standalone source format:

```js
import {
    Ayle,
    AyleMediaProvider,
    AyleHTTPMediaProvider,
    AyleUI,
    AyleMSEMediaDriver
} from '@qybercom/ayle';
```

CSS can be consumed through the package export:

```js
import '@qybercom/ayle/ayle.css';
```

The standalone/browser integration remains available through the normal
`ayle.js` and `ayle-bootstrap.js` builds.

### Package validation

Before publishing, run:

```bash
npm run build
npm run check
npm pack --dry-run
```

`npm run check` verifies the expected distribution files and the ESM exports.
`npm pack --dry-run` shows exactly what npm would include without publishing
the package.

### CI and npm publishing

`.github/workflows/build.yml` validates pushes and pull requests.

`.github/workflows/publish.yml` publishes a production release when a `v*` Git
tag is pushed. The workflow derives the npm version from the tag, so tag
`v1.2.3` publishes package version `1.2.3`.

The publish workflow is prepared for npm Trusted Publishing through GitHub
Actions OIDC and therefore requests `id-token: write`. npm can configure a
Trusted Publisher only for a package that already exists, so the very first
package release must create `@qybercom/ayle` on npm. After that, configure its
Trusted Publisher for this repository and the `publish.yml` workflow. Add the
final GitHub repository URL as `repository.url` in `package.json` before
enabling Trusted Publishing; npm requires it to match the publishing
repository exactly. No repository URL is guessed in this template.

The `bindings/angular/` and `bindings/react/` directories are intentionally
reserved at this stage. They will become separate npm packages consuming the
core ESM API.


### Minified bootstrap

`dist/ayle-bootstrap.min.js` is built with its resource names rewritten to
`ayle.min.js` and `ayle.min.css`, so the production bootstrap does not
accidentally load the readable development assets. The readable
`dist/ayle-bootstrap.js` continues to load `ayle.js` and `ayle.css`.

## React binding

The first framework binding lives in `bindings/react/` and is published as
`@qybercom/ayle-react`.

Build only the core:

```bash
npm run build:core
```

Build only React:

```bash
npm run build:react
```

Build and validate both:

```bash
npm run build
npm run check
```

The core build now also generates `dist/ayle-bootstrap.esm.js`, exported as
`@qybercom/ayle/bootstrap`. React uses this ESM bootstrap API instead of
depending on the global `AyleEmbed`.

Framework bindings require deterministic teardown, so the core now exposes
`Destroy()` on the built-in drivers and `AyleUI`, plus
`AyleBootstrap.Destroy()` for complete instance cleanup.

The tag release workflow publishes `@qybercom/ayle` first and
`@qybercom/ayle-react` second using the same version. See
`bindings/react/README.md` for the React component API.

### Runnable React example

`examples/react/` is a self-contained Vite + React + TypeScript application
using the local `@qybercom/ayle` and `@qybercom/ayle-react` packages through
`file:` dependencies.

Run it with:

```bash
cd examples/react
npm install
npm run dev
```

The Vite dev server proxies `/server/*` to the `AYLE_SERVER_TARGET` configured
in `examples/react/.env` (default example: `http://localhost:8000`). See
`examples/react/README.md` for the expected directory layout and launch
commands.

The React example builds the local core and binding automatically before Vite
starts. Its Vite config resolves the local Ayle package names directly to the
repository build outputs, so `npm run dev` does not depend on a previously
published npm package.

The React declarations include a typed `AyleEventMap` and structural types for
Ayle instances, state, sources, tracks, variants, chapters, hints, and common
event payloads. Built-in event callbacks therefore receive contextual
TypeScript types instead of `any`/`unknown`; dynamic integration event names
remain available.

`examples/react/.env` is intentionally not distributed. Use
`examples/react/.env.example` as the template for local configuration.

The React example intentionally does not map `@qybercom/ayle-react` directly
to `bindings/react/src/index.d.ts`. TypeScript resolves the installed local
package so the declaration's React imports resolve from the example's
`node_modules` tree and retain their contextual JSX types.

The React example rebuilds Ayle before `dev`, `build`, and `typecheck`.
This is required because `bindings/react/dist/index.d.ts` is generated and an
older local build may otherwise make TypeScript/WebStorm show stale `any`
types.

## Angular binding

`bindings/angular/` contains the `@qybercom/ayle-angular` Angular library,
built with `ng-packagr`. A runnable standalone Angular + TypeScript application
is available in `examples/angular/`.

The Angular binding is included in the root build/check/pack commands and in
GitHub Actions. Tag releases publish core first, then the React binding, then
the Angular package produced by `ng-packagr`.

Angular local builds resolve `@qybercom/ayle` from `file:../..` through the
binding's dev dependencies, while the published Angular package still declares
Ayle as a peer dependency.

The Angular example uses Angular's zoneless bootstrap mode and therefore does
not depend on Zone.js. Its application build uses the `@angular/build` package
and follows the maintained Angular 20.3 release line.

The ESM bootstrap entry imports `./ayle.esm.js` itself. Framework bindings no
longer rely on side-effect import ordering to initialize Ayle constructors on
`globalThis` before `AyleBootstrap` runs.

The ESM bootstrap imports the core constructors as named imports and explicitly
binds them to `globalThis` before bootstrap initialization. The ESM core and
bootstrap files are also listed in `sideEffects`, preventing framework bundlers
from dropping that initialization path.

## npm releases

Ayle publishes three public npm packages with the same version:

```text
@qybercom/ayle
@qybercom/ayle-react
@qybercom/ayle-angular
```

The release workflow is `.github/workflows/publish.yml`. It is triggered by
`v*` Git tags and publishes packages in dependency order: core, React, Angular.

Before a local first release:

```bash
node scripts/set-release-version.mjs 0.1.0
npm run release:prepare
node scripts/release-preflight.mjs 0.1.0
```

After the first manual publication, configure npm Trusted Publishing for all
three packages with GitHub repository `Qybercom/Ayle` and workflow
`publish.yml`. Subsequent releases can then be created by pushing a release
tag, for example:

```bash
git tag v0.1.1
git push origin v0.1.1
```

### Initial playback state

The initial playback state can be configured with Player options:

```js
{
	Volume: 0.5,
	Start: 30,
	Muted: true
}
```

The same values can be set per Player instance with `data-ayle-volume`, `data-ayle-start` and `data-ayle-muted`. `Volume` uses the `0..1` range and `Start` is expressed in seconds. These three attributes are also supported on the Ayle loader script and act as global defaults; instance attributes override them.

```html
<script src="/ayle-bootstrap.js" data-ayle-loader data-ayle-volume="0.5" data-ayle-muted="true"></script>
<div data-ayle data-ayle-file="movie.mp4" data-ayle-start="30"></div>
```

### Hint corner position and external links

Hints support `Position: 'top-right-corner'` for placement at the literal top-right corner of the Player, outside the calculated hint safe area. The existing `top-right` position remains safe-area aware.

A lightweight external-link hint is available with `Type: 'link'`:

```js
{
	Type: 'link',
	Position: 'top-right-corner',
	Label: 'Open website',
	URL: 'https://example.com',
	Target: '_blank'
}
```

Current playback time uses the same leading-field width as the duration, so the zero state has the same number of characters: `0:01` → `0:00`, `12:34` → `00:00`, `1:23:45` → `0:00:00`, `12:34:56` → `00:00:00`.

## Extensible toolbar

The main toolbar is declarative. Its default order is:

```js
UI: {
	Toolbar: {
		Items: [
			'play',
			'timeline',
			'time',
			'volume',
			'chapters',
			'quality',
			'fullscreen',
			'settings'
		]
	}
}
```

`timeline` remains the flexible control and consumes the available toolbar space regardless of its position. Integrations can inject custom buttons without replacing the default layout. `Before` and `After` remain attached to the referenced built-in control in both the normal flex layout and the narrow multi-row layout:

```js
Integration: {
	Toolbar: [
		{
			ID: 'favorite',
			Type: 'button',
			Before: 'settings',
			Icon: '/icons/favorite.svg',
			Title: 'Favorite',
			Event: 'favoriteAction',
			OnClick: function (context) {
				// context.Player, context.UI, context.Element, context.Item
			}
		}
	]
}
```

A button may use `Before` or `After`, plus `Icon`, `Label`, `Title`, `ClassName`, `Visible`, `Disabled`, `Event`, `OnClick`, `OnCreate`, and `OnDestroy`.

When `Event` is set, external application code can subscribe without putting
business logic inside the toolbar descriptor:

```js
player.On('favoriteAction', function (context) {
	console.log('Favorite clicked:', context.Item.ID);
});
```

Custom toolbar buttons may also open their own menu:

```js
{
	ID: 'favorite',
	Type: 'button',
	Before: 'settings',
	Label: '★',
	Title: 'Favorite',
	Menu: [
		{
			Label: 'Add to favorites',
			Event: 'add'
		},
		{
			Label: 'Save for later',
			Action: function (context) {
				// context.Player, context.UI, context.ToolbarItem, context.Item
			}
		},
		'',
		{
			Label: 'Manage favorites',
			Value: '↗',
			Event: 'manage'
		}
	]
}
```

An empty string is a menu separator. Menu items support `Label`, `Title`, `Value`, `ClassName`, `Disabled`, `CloseMenu`, `Action`, `OnClick`, and `Event`. Custom toolbar menus use the same `ayle-popover-container` anchoring and visual treatment as the built-in Settings, Chapters, and Quality popovers, so they open directly above their toolbar button.


### Toolbar layouts

`UI.Toolbar.Layout` controls the geometry of the full toolbar without changing which controls exist:

```js
UI: {
	Toolbar: {
		Layout: 'inline',
		Items: [
			'play',
			'timeline',
			'time',
			'volume',
			'chapters',
			'quality',
			'fullscreen',
			'settings'
		]
	}
}
```

Supported layouts are `inline`, `timeline-top`, and `auto`.

`inline` preserves the original Ayle layout. `timeline-top` uses a deterministic two-row grid: the timeline occupies the complete first row, while every other declarative toolbar item stays in sequence on the second row. `auto` uses `inline` above 1100px, `timeline-top` from 761px through 1100px, and the existing narrow layout at 760px and below. The default remains `inline`, so existing players keep their current appearance.

An empty string in `UI.Toolbar.Items` is a flexible spacer, following the same separator convention used by Settings:

```js
UI: {
	Toolbar: {
		Layout: 'timeline-top',
		Items: [
			'play',
			'timeline',
			'time',
			'',
			'volume',
			'chapters',
			'quality',
			'fullscreen',
			'settings'
		]
	}
}
```

In `timeline-top` and `auto`, Ayle inserts this spacer automatically before the first right-side built-in control when `Items` contains no explicit empty string. Integration buttons injected with `Before` or `After` keep their declarative position in the same sequence.

## Timeline ranges

Arbitrary timeline ranges are independent from metadata chapters and are rendered on a separate timeline layer. They may be configured directly or supplied by an integration:

```js
Timeline: {
	Ranges: [
		{
			ID: 'intro',
			Start: 0,
			Duration: 15,
			Label: 'Intro',
			ClassName: 'intro-range'
		}
	]
}

Integration: {
	TimelineRanges: [
		{
			ID: 'sponsor',
			Start: 120,
			End: 150,
			Label: 'Sponsor',
			ClassName: 'sponsor-range'
		}
	]
}
```

Ranges support either `Start + End` or `Start + Duration`. `ClassName` is the intended styling hook. Ranges are visual-only and never intercept timeline input: clicking or dragging anywhere on the timeline keeps the normal seek behavior. `Label` is retained as lightweight metadata/title text, but the experimental range tooltip/marker interaction has been removed for now.

## Media Session

Media Session support is enabled by default when the browser provides the Media Session API. Ayle synchronizes title/artist/album/artwork, playback state, position, playback rate, and system actions for play, pause, stop, backward seek, forward seek, and seek-to. This allows compatible mobile browsers to expose Ayle playback in system media controls such as Android notification and lock-screen controls.

Source metadata is used automatically. It can be overridden globally or by an integration:

```js
MediaSession: {
	Enabled: true,
	Metadata: {
		Title: 'Custom title',
		Artist: 'Custom artist',
		Album: 'Custom album',
		Artwork: [
			{ src: '/artwork/cover.png', sizes: '512x512', type: 'image/png' }
		]
	}
}
```

Set `MediaSession: false` or `MediaSession.Enabled: false` to disable the integration.

Loading indicator rotation is handled by CSS on `.ayle-loading-icon` rather than SVG SMIL, which keeps the spinner more resilient during seek/MSE work and other main-thread-heavy transitions.