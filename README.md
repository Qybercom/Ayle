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

The minimal variants demonstrate the smallest practical configuration for each media mode. The full variants are the study/reference examples and intentionally exercise the current broad feature surface: initialization state, subtitles, keyboard shortcuts, toolbar layouts, custom toolbar menus, timeline ranges, Media Session, hints, integration settings, channel metadata, localization and audio-specific visual behavior.

## Quick start

```html
<script
    src="ayle-bootstrap.js"
    data-ayle-loader
    data-ayle-driver="mse"
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

For normal imperative use, `Ayle.Init()` is the assembly entry point. It accepts either a CSS selector or the player root DOM element, resolves the media element internally, creates the driver, player and UI, and returns the `Ayle` instance:

```js
var player = Ayle.Init('#player-minimal-audio', AyleMSEMediaDriver, {
	AutoPlay: false,
	AutoFocus: true,
	MediaMode: 'audio',
	UIMode: 'minimal',
	UI: {
		Header: [],
		Track: ['title', 'chapter'],
		Channel: ['name', 'profile'],
		Overlay: ['track:compact', 'subtitles'],
		Toolbar: {
			Layout: 'inline',
			Items: ['play', 'timeline', 'time', 'volume']
		}
	}
});
```

The same call accepts a DOM element directly:

```js
var element = document.getElementById('player-minimal-audio');
var player = Ayle.Init(element, AyleMSEMediaDriver, options);
```

An instance created this way exposes the assembled runtime objects as `player.Element`, `player.MediaElement`, `player.Driver`, and `player.UI`.

Drivers are dependency-free at construction time. The driver contract receives its dependencies explicitly through `SetUI(ui)` and `SetOptions(options)`. `Ayle.Init()` calls `SetOptions()` for the optional fourth argument and `AyleUI` calls `SetUI()` after the media element is resolved:

```js
var player = Ayle.Init(
	'#player',
	AyleMSEMediaDriver,
	playerOptions,
	driverOptions
);
```

The equivalent explicit low-level assembly is:

```js
var root = document.querySelector('#player');
var driver = new AyleMSEMediaDriver();

driver.SetOptions(driverOptions);

var player = new Ayle(driver, playerOptions);
var ui = new AyleUI(root, player);
```

`new AyleUI(...)` supplies itself to the driver through `driver.SetUI(ui)`, so neither a media element nor options belong in a driver constructor. Both `Ayle.Init()` and the explicit assembly are demonstrated by `examples/low-level.html`.

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
| `data-ayle-skip-init="true\|false"` | Set HTTP stream `SkipInit`. |

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
    "MediaConfig": {
        "File": "example.mkv"
    },
    "HTTP": {
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
player options. `MediaConfig` is the media/source side of split configuration.
Do not rename the JSON `Player` key to `Ayle`.

## Configuration reference

This section documents the configuration objects currently consumed by `ayle-bootstrap.js` and `ayle.js`. Defaults and accepted values below are based on the current implementation rather than on historical examples.

### Effective bootstrap configuration

A normal declarative config is an object with these top-level fields:

| Option | Type / default | Description |
| --- | --- | --- |
| `ID` | string / generated | Optional instance ID when `data-ayle` does not provide one. |
| `Preset` | string / none | Preset name. Built-in values are `video` and `audio`. Preset values are merged first; concrete config values override them. |
| `Player` | object / `{}` | Options passed to the `Ayle` runtime object. Fully documented below. |
| `Driver` | object / required | Driver selection. `Driver.Type` must currently be `html5` or `mse`. |
| `HTTP` | object / `{}` | Metadata and track loading configuration used by `AyleHTTP`. |
| `File` | string / empty | Media identifier passed to `AyleHTTP`. Usually supplied by `data-ayle-file` or `MediaConfig.File`. |
| `Files` | array / none | Accepted by `MediaConfig` normalization. If `File` is absent, the first string or first `{File: ...}` entry becomes `File`. The current bootstrap still loads one effective `File` at a time. |
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
| `ShowCenterPlayButton` | boolean / `true` | Show the large center Play button. |
| `AutoFocus` | boolean / `false` | Focus the player automatically when the user interacts with its controls/surface. |
| `MediaMode` | `auto`, `video`, `audio` / `auto` | Select media mode. `auto` resolves from the loaded source. |
| `UIMode` | `normal`, `minimal` / `normal` | Select the full or minimal UI layout. |
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

`UI` is the single declarative composition model for Ayle's built-in interface. Element composition is expressed with simple string lists; layout variants know how to render the configured content.

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
			'settings',
			'pip',
			'fullscreen'
		]
	}
}
```

| Option | Type / default | Description |
| --- | --- | --- |
| `Header` | string[] / `['channel:card', 'track']` | Ordered header blocks. Built-ins: `channel:card`, `channel:contact`, `track`. An empty list removes the header. |
| `Track` | string[] / `['title', 'chapter']` | Ordered/allowed track metadata elements. Built-ins: `title`, `chapter`. |
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

A minimal composition no longer needs a parallel `MinimalUI` visibility object. It is expressed directly:

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
| `track:compact` | Compact overlay presentation of the current track. It consumes the same `UI.Track` list; currently `title` and `chapter` are supported. |
| `subtitles` | Dedicated subtitle overlay for audio mode. |

For example:

```js
UI: {
	Header: [],
	Track: ['title', 'chapter'],
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
| `Target` | string / `_self` in minimal UI | Anchor target such as `_self` or `_blank`. `_blank` receives `noopener noreferrer` in the normal header. |

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

### `HTTP` (`AyleHTTP` options)

| Option | Type / default | Description |
| --- | --- | --- |
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

#### `HTTP.CodecCandidates[]`

| Option | Type / default | Description |
| --- | --- | --- |
| `Type` | string | MIME type tested by the active driver, for example `video/mp4`. |
| `Codecs` | array of strings | Codec strings tested with `MediaSource.isTypeSupported()` or `HTMLMediaElement.canPlayType()`. |

### `HTTP.Stream`

`HTTP.Stream` is copied into `AyleMediaVariant.Stream` / `AyleMediaTrack.Stream`. The MSE stream loader currently understands the following options:

| Option | Type / default | Description |
| --- | --- | --- |
| `Mode` | `range`, `segments`, `time` / `time` when built by `AyleHTTP`, otherwise loader fallback `range` | Select byte-range loading, explicit segment descriptors, or time-addressed requests. |
| `ChunkSize` | number / `2097152` | Byte size of each Range request in `range` mode. |
| `BufferAhead` | number / `30` | Target buffered time ahead of the current position, in seconds. |
| `BufferBehind` | number / `20` | Amount of old buffered media generally retained behind the playhead. |
| `SkipInit` | boolean / `false` | Skip a separate initialization segment request. Useful when each time response is self-contained fMP4. |
| `Init` | descriptor / none | Explicit initialization descriptor. Supports `URL`, `RangeStart`, and `RangeEnd`. |
| `InitValue` | any / `init` | In `time` mode, replacement for `{time}` when deriving the init request from the same URL template. |
| `Segments` | array / `[]` | Descriptors for `segments` mode. Each entry may contain `Start`, `End`, `URL`, `RangeStart`, `RangeEnd`. |
| `TimeURL` | string / track URL | Explicit URL template used for `time` requests; should contain `{time}`. |
| `AlignTimestamps` | boolean / `true` | Enable timestamp alignment logic for appended MSE media. |
| `MaxNoProgressRequests` | number / `3` | Maximum consecutive time-mode requests that fail to advance buffering before the loader stops the request storm. |
| `UseBufferedEndForNextTime` | boolean / `true` | Use the SourceBuffer's real buffered end as the authoritative next request point in time mode. |
| `GapTolerance` | number / `0.15` | Tolerance in seconds used when deciding whether the playback head is inside a buffered range. |
| `MaxGapRetries` | number / `2` | Maximum repeated gap-repair attempts at the same playback position. |
| `TimeEpsilon` | number / `0.001` | Small time tolerance used when validating and terminating time-addressed fragments. |
| `Codec` | string / generated | Selected codec for the concrete stream. Normally injected by `AyleHTTP.BuildStreamOptions()`. |
| `CodecHeader` | string / generated | Per-pipeline codec header name, normally copied from `HTTP.CodecHeader`. |
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
| `File` | string / empty | Primary media identifier. |
| `Files` | array / none | Optional media list. If `File` is missing, the first string or first object with `File` supplies the effective file. |
| `HTTP` | object / none | Media-specific HTTP overrides. |
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
| `data-ayle-url-metadata` | URL template | Default `HTTP.MetadataURL`. |
| `data-ayle-url-track` | URL template | Default `HTTP.TrackURL`. |
| `data-ayle-settings` | `localStorage`, `sessionStorage`, `cookie`, or empty | Global settings-persistence backend. Empty disables persistence; absence means no loader-level value. |
| `data-ayle-localization` | locale key | Default player localization. |
| `data-ayle-auto-focus` | boolean attribute/value | Default `Player.AutoFocus`. Bare/empty means true. |
| `data-ayle-autoplay` | boolean attribute/value | Default `Player.AutoPlay`. Bare/empty means true. |
| `data-ayle-autoplay-mode` | `audible` or `muted` | Default `Player.AutoPlayMode`. |
| `data-ayle-volume` | number `0..1` | Default `Player.Volume`. Values are clamped to the valid range. |
| `data-ayle-start` | seconds / `0` | Default `Player.Start`. Negative values are clamped to `0`. |
| `data-ayle-muted` | boolean attribute/value | Default `Player.Muted`. Bare/empty means true. |
| `data-ayle-auto-init` | boolean / `true` | Controls whether the bootstrap automatically runs `InitAll()`. |
| `data-ayle-skip-init` | boolean | Default `HTTP.Stream.SkipInit`. |

#### Public instance attributes

| Attribute | Value / default | Description |
| --- | --- | --- |
| `data-ayle` | string | Declares an instance and supplies its ID. It is also the default selector used by `InitAll()`. |
| `data-ayle-auto` | `false` or other / enabled | Per-instance automatic initialization switch. Exactly `false` causes `InitAll()` to skip the element. |
| `data-ayle-preset` | `video`, `audio`, or registered preset | Shortcut for top-level `Preset`. |
| `data-ayle-file` | string | Shortcut for `File`; in split config it maps to `MediaConfig.File`. |
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
| `data-ayle-overlay-track-compact-position` | minimal info UI | Resolved `top`/`bottom` placement. |
| `data-ayle-overlay-audio-subtitles-position` | minimal subtitle UI | Resolved subtitle popup placement. |
| `data-ayle-overlay-audio-subtitles-state` | minimal subtitle UI | Current minimal subtitle popup state. |
| `data-ayle-play-unavailable` | player element | Transient/UI state describing an unavailable Play attempt. |
| `data-ayle-popover-position` | popover | Resolved popover placement. |
| `data-ayle-source-state` | player element | High-level source state such as `ready`, `error`, `loading`, or `empty`. |
| `data-ayle-subtitle-cues` | subtitle overlay | Number of custom subtitle cues associated with the active track. |
| `data-ayle-subtitle-offset` | subtitle overlay | Current subtitle offset value. |
| `data-ayle-subtitle-state` | subtitle overlay | Subtitle render state such as `no-track`, `no-cues`, `no-active-cue`, or `visible`. |
| `data-ayle-subtitle-track` | subtitle overlay | Active subtitle track ID. |
| `data-ayle-track` | generated native `<track>` | Marks subtitle `<track>` elements created and managed by Ayle. |


## Presets

`video` uses the normal video UI, central Play button, keyboard controls,
quality/chapters/settings integration and artwork slideshow. Slideshow controls
remain visible by default and artwork uses `cover` fit by default.

`audio` uses the minimal audio UI and supports metadata/info, subtitles,
settings and audio-visual behavior.

Presets deliberately contain neither backend URLs nor a concrete media file.

## Public runtime classes

`ayle.js` exports:

```text
Ayle
AyleHTTP
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
| `uiModeChange` | The UI mode changed. | mode string |

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

Without an explicit localization, the bootstrap can resolve the browser
language.

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

## HTTP integration

`AyleHTTP` supports URL templates using:

```text
{file}
{kind}
{track}
{time}
```

`{kind}` may resolve to `video`, `audio`, `subtitle` or `artwork`.

URLs under `../../server/...` in examples are integration placeholders. This archive
does not contain a PHP backend.

### Codec negotiation

Ayle distinguishes:

```text
X-Media-Codec
X-Media-Codec-List
```

`X-Media-Codec-List` is the full list of codecs supported by the browser/player
path. `X-Media-Codec` is the preferred/fixed codec for one concrete pipeline or
SourceBuffer. A backend should not treat them as interchangeable.

`metadata.example.json` contains every metadata field currently consumed by `AyleHTTP`, including supported aliases/fallbacks, and intentionally omits backend/ffprobe fields that the player does not read.

## MSE notes

The MSE driver performs runtime codec support checks and supports segmented and
time-addressed loading. MSE support is browser/container/codec dependent; do
not assume that one codec combination works everywhere. Fragmented MP4 with a
browser-supported codec is the normal interoperability path.

## Subtitles

Ayle supports native subtitle tracks and a custom HTML subtitle overlay.
Supported inline subtitle markup such as `<i>` is preserved by the custom
subtitle path. Minimal audio mode can expose subtitles through its subtitle
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
    AyleHTTP,
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
			'settings',
			'pip',
			'fullscreen'
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
			'settings',
			'pip',
			'fullscreen'
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
			'settings',
			'pip',
			'fullscreen'
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