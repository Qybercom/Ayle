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

if (lowLevel.indexOf("new AyleMSEMediaDriver()") === -1)
	throw new Error('Low-level example must construct drivers without DOM dependencies');

if (
	lowLevel.indexOf('Same player with Ayle.Init()') === -1 ||
	lowLevel.indexOf("Ayle.Init('#player-minimal-video', AyleMSEMediaDriver") === -1
)
	throw new Error('Low-level example must include a clearly labeled Ayle.Init() example');

if (lowLevel.indexOf("new AyleMSEMediaDriver(video)") !== -1)
	throw new Error('Low-level example must not inject media elements through driver constructors');

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
const css = await fs.readFile(path.join(root, 'ayle.css'), 'utf8');

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

	if (configurationSources[i].indexOf('UI') === -1)
		throw new Error('Canonical example is missing UI composition');

	i++;
}

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
	overlayBootstrap.indexOf("Overlay: ['track:compact', 'subtitles']") === -1
)
	throw new Error('Overlay documentation/bootstrap preset is incomplete');

if (
	overlayCore.indexOf("trackItems.indexOf('artwork')") === -1 ||
	overlayCore.indexOf("item === 'artist'") === -1 ||
	overlayCore.indexOf("item === 'album'") === -1 ||
	overlayCore.indexOf("meta.join(' · ')") === -1 ||
	overlayBootstrap.indexOf("Track: ['artwork', 'title', 'artist', 'album']") === -1 ||
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

const initCore = await fs.readFile(path.join(root, 'ayle.js'), 'utf8');
const initBootstrap = await fs.readFile(path.join(root, 'ayle-bootstrap.js'), 'utf8');

for (const token of [
	'Ayle.Init = function (target, Driver, options, driverOptions)',
	"document.querySelector(target)",
	'var driver = new Driver();',
	"typeof driver.SetOptions === 'function'",
	'var player = new Ayle(driver, options || {});',
	'new AyleUI(element, player);',
	'player.Driver.SetUI(this);'
]) {
	if (initCore.indexOf(token) === -1)
		throw new Error('Ayle.Init regression: missing token ' + token);
}

if (initBootstrap.indexOf('global.Ayle.Init(') === -1)
	throw new Error('Bootstrap must assemble runtime instances through Ayle.Init');

if (
	core.indexOf('AyleMediaDriver.prototype.SetUI = function (ui)') === -1 ||
	core.indexOf('AyleMediaDriver.prototype.SetOptions = function (options)') === -1
)
	throw new Error('Media driver UI/options contract is incomplete');

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