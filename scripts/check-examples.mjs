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

if (lowLevel.indexOf("root.querySelector('.ayle-video')") === -1)
	throw new Error('Low-level example is missing its DOM media binding');

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
	overlayCore.indexOf('MinimalInfo') !== -1 ||
	overlayCore.indexOf('MinimalSubtitlePopup') !== -1 ||
	overlayREADME.indexOf('MinimalInfo') !== -1 ||
	overlayREADME.indexOf('MinimalSubtitlePopup') !== -1
)
	throw new Error('Legacy MinimalInfo configuration remains after Overlay migration');

console.log('Ayle canonical examples validation passed: 4 APIs × 4 variants.');