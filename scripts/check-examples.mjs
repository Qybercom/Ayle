import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examples = path.join(root, 'examples');

const standalone = (await fs.readdir(examples)).filter(function (name) {
	return name.endsWith('.html');
}).sort();

const expectedStandalone = ['embedded.html', 'low-level.html'];

if (JSON.stringify(standalone) !== JSON.stringify(expectedStandalone))
	throw new Error(
		'Standalone examples must be exactly: ' + expectedStandalone.join(', ')
	);

const required = ['minimal-video', 'minimal-audio', 'full-video', 'full-audio'];
const files = [
	path.join(examples, 'low-level.html'),
	path.join(examples, 'embedded.html'),
	path.join(examples, 'angular/src/app/app.component.html'),
	path.join(examples, 'react/src/App.tsx')
];

let i = 0;
while (i < files.length) {
	const source = await fs.readFile(files[i], 'utf8');
	let j = 0;

	while (j < required.length) {
		if (source.indexOf(required[j]) === -1)
			throw new Error(
				path.relative(root, files[i]) + ' is missing variant ' + required[j]
			);

		j++;
	}

	i++;
}


const lowLevel = await fs.readFile(
	path.join(examples, 'low-level.html'),
	'utf8'
);

if (lowLevel.indexOf("document.createElement('video')") !== -1)
	throw new Error('Low-level example must use the media element inside a complete Ayle DOM');

if (
	lowLevel.indexOf("Driver: {\n\t\tType: 'html5'") === -1 ||
	lowLevel.indexOf("Driver: {\n\t\tType: 'mse'") === -1
)
	throw new Error('Low-level example must use Ayle assembly driver descriptors');

if (
	lowLevel.indexOf('Same player with Ayle.Init()') === -1 ||
	lowLevel.indexOf("Ayle.Init('#player-minimal-video', {") === -1
)
	throw new Error('Low-level example must include a clearly labeled Ayle.Init() example');

if (lowLevel.indexOf("new AyleMSEMediaDriver(video)") !== -1)
	throw new Error('Low-level example must not inject media elements through driver constructors');

if (lowLevel.indexOf('new AyleUI(') !== -1)
	throw new Error('Low-level examples must attach owned UI through player.AttachUI()');

if ((lowLevel.match(/player\.AttachUI\(root\);/g) || []).length !== 4)
	throw new Error('Full low-level examples must attach UI through the DOM object');

if ((lowLevel.match(/player\.AttachUI\('#player-minimal-(?:video|audio)'\);/g) || []).length !== 4)
	throw new Error('Minimal low-level examples must attach UI directly through a selector');

if (
	lowLevel.indexOf("Ayle.CreateMediaProvider('http'") !== -1 ||
	lowLevel.indexOf("new Ayle(driver") !== -1
)
	throw new Error('Low-level examples must not side-create providers or use the old constructor shape');

if (
	lowLevel.indexOf("File: 'example.mp4'") === -1 ||
	lowLevel.indexOf("File: 'example.mp3'") === -1
)
	throw new Error('Minimal low-level examples must demonstrate direct-file provider mode');

if (
	(lowLevel.match(/class="ayle-artwork-slideshow"/g) || []).length !== 4 ||
	(lowLevel.match(/class="ayle-artwork-slide ayle-artwork-slide-a"/g) || []).length !== 4 ||
	(lowLevel.match(/class="ayle-artwork-slide ayle-artwork-slide-b"/g) || []).length !== 4 ||
	(lowLevel.match(/class="ayle-audio-cover"/g) || []).length !== 4
)
	throw new Error('Low-level player DOM must include the complete artwork/slideshow structure');

if (
	(lowLevel.match(/class="ayle-overlay-track-compact"/g) || []).length !== 4 ||
	(lowLevel.match(/class="ayle-overlay-track-compact-artwork"/g) || []).length !== 4 ||
	(lowLevel.match(/class="ayle-overlay-track-compact-title"/g) || []).length !== 4 ||
	(lowLevel.match(/class="ayle-overlay-track-compact-meta"/g) || []).length !== 4 ||
	(lowLevel.match(/class="ayle-overlay-audio-subtitles"/g) || []).length !== 4
)
	throw new Error('Low-level player DOM must include the complete declarative overlay structure');

const embedded = await fs.readFile(
	path.join(examples, 'embedded.html'),
	'utf8'
);

if (embedded.indexOf('data-ayle-auto-init="false"') !== -1)
	throw new Error('Embedded canonical example must use bootstrap auto-init');

const embeddedMounts = (embedded.match(/class="example-embedded-player"/g) || []).length;

if (embeddedMounts !== 4)
	throw new Error('Embedded canonical example must have one stable mount wrapper per variant');

if (embedded.indexOf('embedded-config-source') !== -1)
	throw new Error('Embedded canonical example must not use a hidden staging container');


const core = await fs.readFile(path.join(root, 'ayle.js'), 'utf8');
const bootstrap = await fs.readFile(path.join(root, 'ayle-bootstrap.js'), 'utf8');
const css = await fs.readFile(path.join(root, 'ayle.css'), 'utf8');

if (
	(lowLevel.match(/Event: 'favoriteAction'/g) || []).length < 4 ||
	(lowLevel.match(/player\.On\('favoriteAction'/g) || []).length < 4
)
	throw new Error('Low-level full examples must externally subscribe to the custom toolbar event');

const configurationSources = [
	await fs.readFile(path.join(examples, 'low-level.html'), 'utf8'),
	await fs.readFile(path.join(examples, 'embedded.html'), 'utf8'),
	await fs.readFile(path.join(examples, 'angular/src/app/app.component.ts'), 'utf8'),
	await fs.readFile(path.join(examples, 'react/src/App.tsx'), 'utf8')
];

i = 0;
while (i < configurationSources.length) {
	if (configurationSources[i].indexOf('MinimalUI') !== -1)
		throw new Error('Canonical examples must use the declarative UI configuration');

	i++;
}

for (const source of configurationSources) {
	if (/AudioVisual\s*:\s*\{\s*Enabled\s*:/.test(source))
		throw new Error('AudioVisual.Enabled is not a supported option and must not appear in examples');

	if (/"AudioVisual"\s*:\s*\{\s*"Enabled"\s*:/.test(source))
		throw new Error('AudioVisual.Enabled is not a supported option and must not appear in examples');
}

const fullPlayerOptions = [
	'AutoSelectFirstSubtitleTrack',
	'AutoPlay',
	'AutoPlayMode',
	'Volume',
	'Muted',
	'Start',
	'NativeSubtitles',
	'SubtitleOffset',
	'AutoNativeSubtitlesInPictureInPicture',
	'SubtitleStyle',
	'LoadingDelay',
	'ForceShowQualityList',
	'ForceShowChaptersList',
	'ShowCenterPlayButton',
	'AutoFocus',
	'MediaMode',
	'Preset',
	'UI',
	'AudioVisual',
	'ArtworkSlideshow',
	'KeyboardArrowSeekStep',
	'KeyboardAngleSeekStep',
	'KeyboardFrameRateFallback',
	'Shortcuts',
	'Timeline',
	'MediaSession',
	'SettingsOrder',
	'FontFamily',
	'Debug',
	'DebugMP4',
	'Localization',
	'HintSafeArea',
	'Integration'
];

const fullStructuredOptions = {
	SubtitleStyle: [
		'Color', 'Background', 'FontFamily', 'FontSize', 'FontWeight',
		'LineHeight', 'TextShadow', 'Padding', 'BorderRadius',
		'LetterSpacing', 'Bottom', 'MaxWidth'
	],
	UI: ['Header', 'Track', 'Channel', 'Overlay', 'Toolbar'],
	AudioVisual: ['Type', 'Image', 'Subtitles', 'MinHeight'],
	ArtworkSlideshow: ['Enabled', 'HideControls', 'Interval', 'FadeDuration', 'Fit'],
	Shortcuts: [
		'PlayPause', 'SeekArrows', 'SeekAngle', 'Volume', 'Mute',
		'Subtitles', 'Fullscreen', 'PictureInPicture'
	],
	MediaSession: ['Enabled', 'Metadata'],
	HintSafeArea: ['Top', 'Right', 'Bottom', 'Left'],
	Integration: [
		'Channel', 'Hints', 'Settings', 'Toolbar',
		'TimelineRanges', 'MediaSession', 'Data'
	]
};

const fullMediaProviderOptions = [
	'Type',
	'File',
	'MetadataURL',
	'TrackURL',
	'VideoURL',
	'AudioURL',
	'SubtitleURL',
	'ArtworkURL',
	'CoverURL',
	'CodecHeader',
	'CodecListHeader',
	'CodecCandidates',
	'RequestHeaders',
	'Stream',
	'VideoType',
	'AudioType',
	'SubtitleType'
];

const fullStreamOptions = [
	'Mode',
	'ChunkSize',
	'BufferAhead',
	'BufferBehind',
	'SkipInit',
	'Init',
	'InitValue',
	'Segments',
	'TimeURL',
	'TimeParameter',
	'TimePrecision',
	'TimeStartHeader',
	'TimeEndHeader',
	'TimeDurationHeader',
	'TimeEOFHeader',
	'AlignTimestamps',
	'MaxNoProgressRequests',
	'UseBufferedEndForNextTime',
	'GapTolerance',
	'MaxGapRetries',
	'TimeEpsilon'
];

const hasOwn = function (object, name) {
	return Object.prototype.hasOwnProperty.call(object || {}, name);
};

const validateFullObject = function (player, mediaProvider, label) {
	for (const name of fullPlayerOptions) {
		if (!hasOwn(player, name))
			throw new Error(label + ' full Player is missing option ' + name);
	}

	for (const group in fullStructuredOptions) {
		for (const name of fullStructuredOptions[group]) {
			if (!hasOwn(player[group], name))
				throw new Error(label + ' full Player.' + group + ' is missing suboption ' + name);
		}
	}

	for (const name of fullMediaProviderOptions) {
		if (!hasOwn(mediaProvider, name))
			throw new Error(label + ' full MediaProvider is missing option ' + name);
	}

	for (const name of fullStreamOptions) {
		if (!hasOwn(mediaProvider.Stream, name))
			throw new Error(label + ' full MediaProvider.Stream is missing suboption ' + name);
	}

	for (const name of ['URL', 'RangeStart', 'RangeEnd']) {
		if (!hasOwn(mediaProvider.Stream.Init, name))
			throw new Error(label + ' full MediaProvider.Stream.Init is missing suboption ' + name);
	}

	if (!(mediaProvider.Stream.Segments instanceof Array) || !mediaProvider.Stream.Segments.length)
		throw new Error(label + ' full MediaProvider.Stream.Segments must demonstrate a descriptor');

	for (const name of ['Start', 'End', 'URL', 'RangeStart', 'RangeEnd']) {
		if (!hasOwn(mediaProvider.Stream.Segments[0], name))
			throw new Error(label + ' full MediaProvider.Stream.Segments[] is missing suboption ' + name);
	}

	for (const name of ['Title', 'Artist', 'Album', 'Artwork']) {
		if (!hasOwn(player.MediaSession.Metadata, name))
			throw new Error(label + ' full Player.MediaSession.Metadata is missing suboption ' + name);

		if (!hasOwn(player.Integration.MediaSession.Metadata, name))
			throw new Error(label + ' full Player.Integration.MediaSession.Metadata is missing suboption ' + name);
	}

	for (const name of ['Name', 'Avatar', 'URL', 'Action', 'Profile']) {
		if (!hasOwn(player.Integration.Channel, name))
			throw new Error(label + ' full Integration.Channel is missing suboption ' + name);
	}

	for (const name of ['Name', 'URL', 'Target']) {
		if (!hasOwn(player.Integration.Channel.Profile, name))
			throw new Error(label + ' full Integration.Channel.Profile is missing suboption ' + name);
	}

	const hint = player.Integration.Hints[0];
	for (const name of [
		'ID', 'Type', 'Start', 'End', 'Duration', 'Position', 'Offset',
		'Title', 'Text', 'Label', 'URL', 'Target', 'Image', 'Action',
		'Actions', 'Dismissible', 'Once', 'Repeatable', 'PauseOnShow',
		'ResumeOnAction', 'HideOnAction', 'ShowTitle', 'ShowDescription',
		'ResultMode', 'ResultDuration'
	]) {
		if (!hasOwn(hint, name))
			throw new Error(label + ' full Integration.Hints[] is missing suboption ' + name);
	}

	for (const name of ['X', 'Y']) {
		if (!hasOwn(hint.Offset, name))
			throw new Error(label + ' full Hint.Offset is missing suboption ' + name);
	}

	const hintAction = hint.Actions[0];
	for (const name of [
		'Type', 'Title', 'Label', 'Name', 'URL', 'Target',
		'Time', 'Source', 'Callback', 'Correct'
	]) {
		if (!hasOwn(hintAction, name))
			throw new Error(label + ' full Hint action is missing suboption ' + name);
	}

	const setting = player.Integration.Settings[0];
	for (const name of [
		'ID', 'Title', 'Label', 'Value', 'Disabled', 'Items',
		'Action', 'OnSelect', 'Event', 'CloseMenu'
	]) {
		if (!hasOwn(setting, name))
			throw new Error(label + ' full Integration.Settings[] is missing suboption ' + name);
	}

	const toolbarItem = player.Integration.Toolbar[0];
	for (const name of [
		'ID', 'Type', 'Before', 'After', 'Icon', 'Label', 'Title',
		'ClassName', 'Visible', 'Disabled', 'Event', 'Menu',
		'OnClick', 'OnCreate', 'OnDestroy'
	]) {
		if (!hasOwn(toolbarItem, name))
			throw new Error(label + ' full Integration.Toolbar[] is missing suboption ' + name);
	}

	const menuItem = toolbarItem.Menu[0];
	for (const name of [
		'ID', 'Title', 'Label', 'Value', 'Event', 'ClassName',
		'Disabled', 'CloseMenu', 'Action', 'OnClick'
	]) {
		if (!hasOwn(menuItem, name))
			throw new Error(label + ' full toolbar Menu[] is missing suboption ' + name);
	}

	for (const range of [player.Timeline.Ranges[0], player.Integration.TimelineRanges[0]]) {
		for (const name of ['ID', 'Start', 'End', 'Duration', 'Label', 'ClassName']) {
			if (!hasOwn(range, name))
				throw new Error(label + ' full timeline range is missing suboption ' + name);
		}
	}
};

const embeddedConfigs = {};
const embeddedConfigPattern = /<script\s+type="application\/json"\s+data-ayle="([^"]+)"[^>]*>([\s\S]*?)<\/script>/g;
let embeddedMatch;

while ((embeddedMatch = embeddedConfigPattern.exec(embedded)) !== null)
	embeddedConfigs[embeddedMatch[1]] = JSON.parse(embeddedMatch[2]);

validateFullObject(
	embeddedConfigs['embedded-full-video'].Player,
	embeddedConfigs['embedded-full-video'].MediaProvider,
	'embedded-full-video'
);
validateFullObject(
	embeddedConfigs['embedded-full-audio'].Player,
	embeddedConfigs['embedded-full-audio'].MediaProvider,
	'embedded-full-audio'
);

const minimalDefaultNames = [
	'AutoSelectFirstSubtitleTrack',
	'AutoPlay',
	'AutoPlayMode',
	'Volume',
	'Muted',
	'Start',
	'NativeSubtitles',
	'SubtitleOffset',
	'AutoNativeSubtitlesInPictureInPicture',
	'SubtitleStyle',
	'LoadingDelay',
	'ForceShowQualityList',
	'ForceShowChaptersList',
	'ShowCenterPlayButton',
	'Preset',
	'AutoFocus',
	'AudioVisual',
	'ArtworkSlideshow',
	'KeyboardArrowSeekStep',
	'KeyboardAngleSeekStep',
	'KeyboardFrameRateFallback',
	'Shortcuts',
	'Timeline',
	'MediaSession',
	'SettingsOrder',
	'FontFamily',
	'Debug',
	'DebugMP4',
	'Localization',
	'HintSafeArea',
	'Integration'
];

for (const id of [
	'embedded-minimal-video',
	'embedded-minimal-audio',
	'embedded-full-video',
	'embedded-full-audio'
]) {
	const config = embeddedConfigs[id];

	if (!config.MediaProvider)
		throw new Error(id + ' must configure MediaProvider');

	if (
		id.indexOf('full-') !== -1 &&
		config.MediaProvider.Type !== 'http'
	)
		throw new Error(id + ' full example must explicitly use MediaProvider.Type=http');

	if (
		id.indexOf('minimal-') !== -1 &&
		config.MediaProvider.Type !== undefined
	)
		throw new Error(id + ' minimal example must rely on the default http provider');

	if (hasOwn(config, 'HTTP'))
		throw new Error(id + ' must not expose legacy HTTP config');
}

for (const id of ['embedded-minimal-video', 'embedded-minimal-audio']) {
	const player = embeddedConfigs[id].Player;

	for (const name of minimalDefaultNames) {
		if (hasOwn(player, name))
			throw new Error(id + ' should omit default/nonessential Player option ' + name);
	}

	if (hasOwn(player, 'UI'))
		throw new Error(id + ' should inherit the complete MediaMode UI layout');
}

if (embeddedConfigs['embedded-full-video'].Player.ShowCenterPlayButton !== true)
	throw new Error('embedded-full-video should explicitly set ShowCenterPlayButton to true');

if (embeddedConfigs['embedded-full-audio'].Player.ShowCenterPlayButton !== false)
	throw new Error('embedded-full-audio should explicitly set ShowCenterPlayButton to false');

if (embeddedConfigs['embedded-full-video'].Player.ForceShowQualityList !== true)
	throw new Error('embedded-full-video should demonstrate ForceShowQualityList:true');

if (embeddedConfigs['embedded-full-video'].Player.UI.Toolbar.Layout !== 'timeline-top')
	throw new Error('embedded-full-video should keep the timeline on the top row');

if (embeddedConfigs['embedded-full-audio'].Player.AudioVisual.Type !== 'cover')
	throw new Error('embedded-full-audio should explicitly demonstrate the large cover visual');

if (embeddedConfigs['embedded-full-audio'].Player.SubtitleOffset !== -2.85)
	throw new Error('embedded-full-audio should demonstrate SubtitleOffset:-2.85');

if (
	embeddedConfigs['embedded-full-video'].Player.Integration.Toolbar[0].Event !== 'favoriteAction' ||
	embeddedConfigs['embedded-full-audio'].Player.Integration.Toolbar[0].Event !== 'favoriteAction'
)
	throw new Error('Embedded full examples must expose the custom toolbar favoriteAction event');

if (
	configurationSources[1].indexOf('data-ayle-on="favoriteAction:handleFavoriteAction"') === -1 ||
	configurationSources[1].indexOf('function handleFavoriteAction (event)') === -1
)
	throw new Error('Embedded full examples must externally subscribe to favoriteAction');

if (
	embedded.indexOf('data-ayle="embedded-minimal-video"\n\t\tdata-ayle-settings=') !== -1 ||
	embedded.indexOf('data-ayle="embedded-minimal-audio"\n\t\tdata-ayle-settings=') !== -1
)
	throw new Error('Minimal embedded examples should not enable settings persistence');

const reactSource = configurationSources[3];
const angularSource = configurationSources[2];

if (
	reactSource.indexOf("ForceShowQualityList: mediaMode === 'video'") === -1 ||
	angularSource.indexOf("ForceShowQualityList: mediaMode === 'video'") === -1
)
	throw new Error('Framework full examples must force-show Quality for video');

if (
	reactSource.indexOf("Layout: mediaMode === 'video' ? 'timeline-top' : 'inline'") === -1 ||
	angularSource.indexOf("Layout: mediaMode === 'video' ? 'timeline-top' : 'inline'") === -1
)
	throw new Error('Framework full video examples must use timeline-top layout');

if (
	reactSource.indexOf("Type: mediaMode === 'audio' ? 'cover' : 'auto'") === -1 ||
	angularSource.indexOf("Type: mediaMode === 'audio' ? 'cover' : 'auto'") === -1
)
	throw new Error('Framework full examples must force the large cover visual for audio');

if (
	reactSource.indexOf("SubtitleOffset: mediaMode === 'audio' ? -2.85 : 0") === -1 ||
	angularSource.indexOf("SubtitleOffset: mediaMode === 'audio' ? -2.85 : 0") === -1
)
	throw new Error('Framework full examples must demonstrate audio SubtitleOffset:-2.85');

if (
	reactSource.indexOf("Event: 'favoriteAction'") === -1 ||
	angularSource.indexOf("Event: 'favoriteAction'") === -1
)
	throw new Error('Framework full examples must expose a named custom toolbar event');

if (
	reactSource.indexOf("favoriteAction: function") === -1 ||
	reactSource.indexOf("events: FULL_EVENTS") === -1
)
	throw new Error('React full examples must externally subscribe to the custom toolbar event');

if (
	angularSource.indexOf("favoriteAction: function") === -1 ||
	angularSource.indexOf('[events]="FullEvents"') === -1
)
	throw new Error('Angular full examples must externally subscribe to the custom toolbar event');


for (const token of fullPlayerOptions.concat([
	'Padding', 'BorderRadius', 'LetterSpacing', 'Bottom', 'MaxWidth',
	'Overlay', 'AudioVisual', 'ArtworkSlideshow', 'Subtitles',
	'TimelineRanges', 'Data'
])) {
	if (reactSource.indexOf(token) === -1)
		throw new Error('React full example is missing ' + token);

	if (angularSource.indexOf(token) === -1)
		throw new Error('Angular full example is missing ' + token);
}

for (const token of fullMediaProviderOptions.concat(fullStreamOptions)) {
	if (reactSource.indexOf(token) === -1)
		throw new Error('React full MediaProvider example is missing ' + token);

	if (angularSource.indexOf(token) === -1)
		throw new Error('Angular full MediaProvider example is missing ' + token);

	if (lowLevel.indexOf(token + ':') === -1)
		throw new Error('Low-level full MediaProvider example is missing ' + token);
}

if ((lowLevel.match(/^\t{2}AutoPlay: false,/gm) || []).length !== 4)
	throw new Error('Low-level minimal examples must not repeat default AutoPlay:false');

if ((lowLevel.match(/^\t{2}Muted: false,/gm) || []).length !== 4)
	throw new Error('Low-level minimal examples must not repeat default Muted:false');

if ((lowLevel.match(/^\t{2}Start: 0,/gm) || []).length !== 4)
	throw new Error('Low-level minimal examples must not repeat default Start:0');

if ((lowLevel.match(/^\t{4}Layout: 'inline',/gm) || []).length !== 2)
	throw new Error('Low-level full audio examples must explicitly use inline Toolbar.Layout');

if ((lowLevel.match(/^\t{4}Layout: 'timeline-top',/gm) || []).length !== 2)
	throw new Error('Low-level full video examples must explicitly use timeline-top Toolbar.Layout');

if (
	core.indexOf('function AyleGetBrowserLocalization ()') === -1 ||
	core.indexOf('explicitOptions.Localization === undefined ?') === -1
)
	throw new Error('Core must auto-resolve browser localization when Localization is omitted');

if (
	core.indexOf('function AyleMediaProvider (player, options)') === -1 ||
	core.indexOf('function AyleHTTPMediaProvider (player, options)') === -1 ||
	core.indexOf('AyleHTTPMediaProvider.prototype = Object.create(AyleMediaProvider.prototype);') === -1 ||
	core.indexOf('AyleMediaProviderRegistry.http = AyleHTTPMediaProvider;') === -1
)
	throw new Error('Core media provider contract or built-in HTTP provider is incomplete');

if (
	core.indexOf('Ayle.RegisterDriver = function') === -1 ||
	core.indexOf('Ayle.GetDriver = function') === -1 ||
	core.indexOf('Ayle.HasDriver = function') === -1 ||
	core.indexOf('Ayle.RemoveDriver = function') === -1 ||
	core.indexOf('Ayle.CreateDriver = function') === -1 ||
	core.indexOf('AyleDriverRegistry.html5 = AyleHTML5MediaDriver;') === -1 ||
	core.indexOf('AyleDriverRegistry.mse = AyleMSEMediaDriver;') === -1
)
	throw new Error('Core driver registry API is incomplete');

if (
	core.indexOf("this.Driver.SetEventTarget(this, 'driver:');") === -1 ||
	core.indexOf("this.MediaProvider.SetEventTarget(this, 'provider:');") === -1
)
	throw new Error('Driver and MediaProvider events must share the Ayle event API');

if (
	core.indexOf('Ayle.RegisterMediaProvider = function') === -1 ||
	core.indexOf('Ayle.GetMediaProvider = function') === -1 ||
	core.indexOf('Ayle.HasMediaProvider = function') === -1 ||
	core.indexOf('Ayle.RemoveMediaProvider = function') === -1 ||
	core.indexOf('Ayle.CreateMediaProvider = function') === -1
)
	throw new Error('Core media provider registry API is incomplete');

const legacyHTTPClassName = 'Ayle' + 'HTTP';
if (new RegExp('\\b' + legacyHTTPClassName + '\\b').test(core))
	throw new Error('Legacy HTTP-specific class name must not remain in core');

if (
	core.indexOf('this.MediaProvider = null;') === -1 ||
	core.indexOf('Ayle.prototype.SetMediaProvider = function') === -1 ||
	core.indexOf("this.MediaProvider.SetEventTarget(this, 'provider:');") === -1 ||
	bootstrap.indexOf('var mediaProvider = player.MediaProvider;') === -1 ||
	bootstrap.indexOf('MediaProvider: mediaProvider') === -1
)
	throw new Error('Ayle must own MediaProvider and Bootstrap must expose that owned instance');

if (
	bootstrap.indexOf('AyleBootstrap.MergeMediaProvider = function') === -1 ||
	bootstrap.indexOf('overrideType !== baseType') === -1
)
	throw new Error('Bootstrap must keep provider-specific option sets isolated by Type');

const legacyHTTPOptionsName = 'HTTP' + 'Options';
const legacyInstanceHTTP = 'instance.' + 'H' + 'TTP';
if (
	bootstrap.indexOf(legacyHTTPOptionsName) !== -1 ||
	bootstrap.indexOf(legacyInstanceHTTP) !== -1
)
	throw new Error('Bootstrap must not expose legacy HTTP-specific instance state');

if (
	core.indexOf("Ayle.RegisterPreset = function") === -1 ||
	core.indexOf("Ayle.GetPreset = function") === -1 ||
	core.indexOf("Ayle.HasPreset = function") === -1 ||
	core.indexOf("Ayle.RemovePreset = function") === -1
)
	throw new Error('Core preset registry API is incomplete');

if (
	core.indexOf("Items: ['previous', 'play', 'next', 'timeline', 'time', 'volume', 'chapters', 'quality', 'fullscreen', 'settings']") === -1 ||
	core.indexOf("Items: ['previous', 'play', 'next', 'timeline', 'time', 'volume', 'settings']") === -1
)
	throw new Error('Built-in video/audio preset toolbar defaults are incomplete');


if (
	core.indexOf('Ayle.prototype.SetPlaylist = function') === -1 ||
	core.indexOf('Ayle.prototype.SetPlaylistIndex = function') === -1 ||
	core.indexOf('Ayle.prototype.SetPlaylistItemByID = function') === -1 ||
	core.indexOf('Ayle.prototype.Next = function') === -1 ||
	core.indexOf('Ayle.prototype.Previous = function') === -1 ||
	core.indexOf("self.Emit('playlistItemError'") === -1
)
	throw new Error('Core playlist API/lifecycle is incomplete');

if (
	core.indexOf("case 'previous': return this.PreviousButton;") === -1 ||
	core.indexOf("case 'next': return this.NextButton;") === -1 ||
	core.indexOf('AyleUI.prototype.UpdatePlaylistButtons = function') === -1 ||
	bootstrap.indexOf('ayle-previous') === -1 ||
	bootstrap.indexOf('ayle-next') === -1
)
	throw new Error('Playlist Previous/Next toolbar controls are incomplete');

if (
	core.indexOf("var visible = count > 1 || this.Player.Options.ForceShowQualityList;") === -1 ||
	core.indexOf("count > 0 || this.Player.Options.ForceShowChaptersList") === -1
)
	throw new Error('ForceShow Chapters/Quality visibility semantics are incomplete');

if (
	core.indexOf("this.UpdateChapterMenu();\n\t\tthis.UpdateQualityMenu();") === -1
)
	throw new Error('Toolbar rebuild must restore Chapters/Quality data-dependent visibility');

if (
	core.indexOf('ShowCenterPlayButton: true') === -1 ||
	core.indexOf('ShowCenterPlayButton: false') === -1
)
	throw new Error('Built-in video/audio presets must define center Play visibility');

if (
	css.indexOf('.ayle-media-audio.ayle-ui-headerless.ayle-has-track-compact .ayle-loading') === -1 ||
	css.indexOf('\n.ayle-ui-headerless.ayle-has-track-compact .ayle-loading {') !== -1
)
	throw new Error('Compact timeline loading must be audio-only; video must keep the centered spinner');

if (
	core.indexOf('AyleUI.prototype._inlineToolbarOverflows = function ()') === -1 ||
	core.indexOf('this.Controls.scrollWidth > available + 1') === -1 ||
	core.indexOf('width > 0 && width <= 760') !== -1
)
	throw new Error('Toolbar narrow mode must be selected from real overflow, not a fixed 760px breakpoint');

if (core.indexOf("headerItem === 'channel:contact'") === -1)
	throw new Error('Core UI composition is missing channel:contact');

if (core.indexOf("ui.Header.slice(0)") === -1 || core.indexOf("ui.Channel.slice(0)") === -1)
	throw new Error('Core UI composition lists are missing');

if (css.indexOf('.ayle-channel-contact .ayle-channel-avatar') === -1)
	throw new Error('channel:contact CSS is missing');

if (core.indexOf("is-anchor-left") === -1 || core.indexOf("is-anchor-right") === -1)
	throw new Error('Custom toolbar menu must select an anchor side from the button position');

if (css.indexOf('.ayle-toolbar-custom-menu.is-anchor-left') === -1)
	throw new Error('Custom toolbar menu left anchor CSS is missing');

if (css.indexOf('.ayle-toolbar-custom-menu.is-anchor-right') === -1)
	throw new Error('Custom toolbar menu right anchor CSS is missing');




const customMenuCSS = await fs.readFile(path.join(root, 'ayle.css'), 'utf8');
const customMenuCore = await fs.readFile(path.join(root, 'ayle.js'), 'utf8');

if (customMenuCSS.indexOf('.ayle-toolbar-custom-menu.is-open {\n\tdisplay: grid;\n}') === -1)
	throw new Error('Open custom toolbar menus must use grid layout');

if (customMenuCSS.indexOf('grid-template-columns: minmax(0, 1fr);') === -1)
	throw new Error('Custom toolbar menu grid must constrain its content column');

if (
	customMenuCore.indexOf('contentOverflow') !== -1 ||
	customMenuCore.indexOf('is-horizontal-scroll') !== -1
)
	throw new Error('Obsolete custom menu overflow measurement workaround is still present');

const overlayCore = await fs.readFile(path.join(root, 'ayle.js'), 'utf8');
const overlayREADME = await fs.readFile(path.join(root, 'README.md'), 'utf8');
const overlayBootstrap = await fs.readFile(path.join(root, 'ayle-bootstrap.js'), 'utf8');

if (
	overlayCore.indexOf("Overlay: ui.Overlay instanceof Array") === -1 ||
	overlayCore.indexOf("_hasOverlayItem('track:compact')") === -1 ||
	overlayCore.indexOf("_hasOverlayItem('subtitles')") === -1
)
	throw new Error('Declarative UI.Overlay support is incomplete');

if (
	overlayREADME.indexOf('`track:compact`') === -1 ||
	overlayREADME.indexOf('`subtitles`') === -1 ||
	overlayCore.indexOf("Overlay: ['track:compact', 'subtitles']") === -1
)
	throw new Error('Overlay documentation/bootstrap preset is incomplete');

if (
	overlayCore.indexOf("trackItems.indexOf('artwork')") === -1 ||
	overlayCore.indexOf("item === 'artist'") === -1 ||
	overlayCore.indexOf("item === 'album'") === -1 ||
	overlayCore.indexOf("meta.join(' · ')") === -1 ||
	overlayCore.indexOf("Track: ['artwork', 'title', 'artist', 'album']") === -1 ||
	overlayREADME.indexOf('`artwork`, `title`, `artist`, `album`, `chapter`') === -1
)
	throw new Error('Declarative track metadata/compact overlay support is incomplete');

if (
	overlayCore.indexOf('MinimalInfo') !== -1 ||
	overlayCore.indexOf('MinimalSubtitlePopup') !== -1 ||
	overlayREADME.indexOf('MinimalInfo') !== -1 ||
	overlayREADME.indexOf('MinimalSubtitlePopup') !== -1
)
	throw new Error('Legacy MinimalInfo configuration remains after Overlay migration');

const uiModeSources = [
	overlayCore,
	overlayREADME,
	overlayBootstrap,
	await fs.readFile(path.join(examples, 'low-level.html'), 'utf8'),
	await fs.readFile(path.join(examples, 'embedded.html'), 'utf8'),
	await fs.readFile(path.join(examples, 'angular/src/app/app.component.ts'), 'utf8'),
	await fs.readFile(path.join(examples, 'react/src/App.tsx'), 'utf8'),
	await fs.readFile(path.join(root, 'bindings/angular/src/lib/types.ts'), 'utf8'),
	await fs.readFile(path.join(root, 'bindings/react/src/index.d.ts'), 'utf8')
];

for (const source of uiModeSources) {
	for (const token of [
		'UIMode',
		'SetUIMode',
		'uiModeChange',
		'ApplyUIMode',
		'ayle-ui-minimal',
		'ayle-ui-normal',
		'ayle-minimal-hidden'
	]) {
		if (source.indexOf(token) !== -1)
			throw new Error('Legacy UI mode regression: found ' + token);
	}
}

if (
	overlayCore.indexOf('AyleUI.prototype.ApplyUIComposition = function ()') === -1 ||
	overlayCore.indexOf("classList.toggle('ayle-ui-headerless'") === -1 ||
	overlayCore.indexOf("classList.toggle('ayle-has-track-compact'") === -1 ||
	overlayCore.indexOf("!this._hasOverlayItem('track:compact')") === -1
)
	throw new Error('Declarative UI composition state is incomplete');

if (
	overlayCore.indexOf('var topSpace = Math.max(0, containerRect.top - padding);') === -1 ||
	overlayCore.indexOf('var bottomSpace = Math.max(0, viewportHeight - containerRect.bottom - padding);') === -1
)
	throw new Error('Popover positioning must use viewport-aware top/bottom placement');

const initCore = await fs.readFile(path.join(root, 'ayle.js'), 'utf8');
const initBootstrap = await fs.readFile(path.join(root, 'ayle-bootstrap.js'), 'utf8');

for (const token of [
	'Ayle.Init = function (target, config)',
	'return player.AttachUI(target);',
	'Ayle.prototype.AttachUI = function (target)',
	"AyleResolveElement(target, 'Ayle UI target')",
	'Ayle.prototype.DetachUI = function ()',
	'this.Driver.SetUI(null);',
	'Ayle.CreateDriver(driverType, driverOptions)',
	"AyleDriverRegistry.html5 = AyleHTML5MediaDriver;",
	"AyleDriverRegistry.mse = AyleMSEMediaDriver;"
]) {
	if (initCore.indexOf(token) === -1)
		throw new Error('Ayle.Init regression: missing token ' + token);
}

if (
	initBootstrap.indexOf('global.Ayle.RegisterPreset(name, config);') === -1 ||
	initBootstrap.indexOf('global.Ayle.GetPreset(name)') === -1 ||
	initBootstrap.indexOf('AyleBootstrap.Presets = {}') !== -1 ||
	initBootstrap.indexOf("AyleBootstrap.RegisterPreset('video'") !== -1 ||
	initBootstrap.indexOf("AyleBootstrap.RegisterPreset('audio'") !== -1
)
	throw new Error('Bootstrap must delegate to the shared Ayle preset registry');

if (initBootstrap.indexOf('global.Ayle.Init(') === -1)
	throw new Error('Bootstrap must assemble runtime instances through Ayle.Init');

if (
	initBootstrap.indexOf('AyleBootstrap.prototype.ResolveElement = function (target, root)') === -1 ||
	initBootstrap.indexOf('scope.querySelectorAll(target)') === -1 ||
	initBootstrap.indexOf('elements.length !== 1') === -1 ||
	initBootstrap.indexOf('target.nodeType !== 1') === -1
)
	throw new Error('Bootstrap singular target APIs must reject ambiguous/non-Element targets');

if (
	core.indexOf('AyleMediaDriver.prototype.SetUI = function (ui)') === -1 ||
	core.indexOf('AyleMediaDriver.prototype.SetOptions = function (options)') === -1
)
	throw new Error('Media driver UI/options contract is incomplete');

if (
	core.indexOf('function AyleResolveElement (target, label)') === -1 ||
	core.indexOf('document.querySelectorAll(selector)') === -1 ||
	core.indexOf('elements.length !== 1') === -1 ||
	core.indexOf('value.nodeType === 1') === -1
)
	throw new Error('Ayle DOM target resolver must require exactly one concrete Element');

if (
	core.indexOf('AyleHTML5MediaDriver.prototype._unbindDOMEvents = function') === -1 ||
	core.indexOf('this._listen(this.Element,') === -1 ||
	core.indexOf('this._unbindDOMEvents();') === -1
)
	throw new Error('HTML5/MSE drivers must support UI detach/reattach without stale DOM listeners');

if (
	core.indexOf('AyleUI.prototype._unbindDOMListeners = function') === -1 ||
	core.indexOf('AyleUI.prototype._unbindPlayerListeners = function') === -1 ||
	core.indexOf('this._unbindPlayerListeners();') === -1 ||
	core.indexOf('this._unbindDOMListeners();') === -1
)
	throw new Error('AyleUI detach must release DOM and Player subscriptions');

if (
	core.indexOf("var mediaElement = element.querySelector(") === -1 ||
	core.indexOf('this.Driver.SetUI(binding);') === -1 ||
	core.indexOf('ui = new AyleUI(element, this);') === -1 ||
	core.indexOf('this.Driver.SetUI(ui);') === -1
)
	throw new Error('AttachUI must bind Driver to the media element before AyleUI capability checks');

if (
	core.indexOf('this.Element &&') === -1 ||
	core.indexOf("typeof this.Element.requestPictureInPicture === 'function'") === -1
)
	throw new Error('Picture-in-Picture capability check must tolerate a detached Driver');

if (
	core.indexOf('function AyleHTML5MediaDriver (element)') !== -1 ||
	core.indexOf('function AyleMSEMediaDriver (element)') !== -1 ||
	core.indexOf('new Driver(mediaElement') !== -1
)
	throw new Error('Media driver constructors must not receive UI or option dependencies');

if (
	core.indexOf('return this.Element ? this.Element.volume : this._volume;') === -1 ||
	core.indexOf('return this.Element ? this.Element.muted : this._muted;') === -1 ||
	core.indexOf('return this.Element ? this.Element.playbackRate : this._playbackRate;') === -1
)
	throw new Error('HTML5 driver must support state access before SetUI()');

if (
	lowLevel.indexOf('AyleBootstrap video') === -1 ||
	lowLevel.indexOf('AyleBootstrap audio') === -1 ||
	lowLevel.indexOf("bootstrapVideo.InitConfig(document.querySelector('[data-ayle=\"bootstrap-video\"]'))") === -1 ||
	lowLevel.indexOf("bootstrapAudio.InitConfig(document.querySelector('[data-ayle=\"bootstrap-audio\"]'))") === -1
)
	throw new Error('Low-level example must include programmatic AyleBootstrap video and audio examples');

if (
	(lowLevel.match(/<div class="example-code-title">Bootstrap config<\/div>/g) || []).length !== 2 ||
	lowLevel.indexOf('&lt;script\n\ttype="application/json"\n\tdata-ayle="bootstrap-video"') === -1 ||
	lowLevel.indexOf('&lt;script\n\ttype="application/json"\n\tdata-ayle="bootstrap-audio"') === -1 ||
	(lowLevel.match(/&lt;\/script&gt;<\/code><\/pre>/g) || []).length < 2
)
	throw new Error('Low-level Bootstrap examples must show the complete configuration script elements');

console.log('Ayle canonical examples validation passed: 4 APIs × 4 variants.');