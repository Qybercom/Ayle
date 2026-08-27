import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');

const required = [
	'ayle.js',
	'ayle.min.js',
	'ayle.esm.js',
	'ayle-bootstrap.esm.js',
	'ayle-bootstrap.js',
	'ayle-bootstrap.min.js',
	'ayle.css',
	'ayle.min.css',
	'ayle-icons.svg'
];

for (const name of required)
	await fs.access(path.join(dist, name));

const requiredIcons = [
	'chapters.svg',
	'fullscreen-enter.svg',
	'fullscreen-exit.svg',
	'loading.svg',
	'pause.svg',
	'pip.svg',
	'play.svg',
	'settings.svg',
	'volume.svg'
];

for (const name of requiredIcons)
	await fs.access(path.join(dist, 'icons', name));

const esm = await import(
	new URL('../dist/ayle.esm.js', import.meta.url).href
);

const exports = [
	'Ayle',
	'AyleEventEmitter',
	'AyleMediaVariant',
	'AyleMediaTrack',
	'AyleMediaCover',
	'AyleMediaChapter',
	'AyleSource',
	'AyleMediaDriver',
	'AyleHTML5MediaDriver',
	'AyleMSEMediaDriver',
	'AyleHTTP',
	'AyleUI'
];

for (const name of exports) {
	if (!esm[name])
		throw new Error('Missing ESM export: ' + name);
}

console.log('Ayle package validation passed.');
console.log('ESM exports: ' + exports.join(', '));

const bootstrapESM = await import(
	new URL('../dist/ayle-bootstrap.esm.js', import.meta.url).href
);

if (!bootstrapESM.AyleBootstrap)
	throw new Error('Missing ESM export: AyleBootstrap');

console.log('Bootstrap ESM export: AyleBootstrap');