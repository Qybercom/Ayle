import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const angular = path.join(root, 'bindings', 'angular');
const source = path.join(angular, 'src');
const dist = path.join(angular, 'dist');

await fs.access(path.join(dist, 'package.json'));

const packageJSON = JSON.parse(
	await fs.readFile(path.join(dist, 'package.json'), 'utf8')
);

if (packageJSON.name !== '@qybercom/ayle-angular')
	throw new Error('Angular dist package has an unexpected package name');

const sourceTypes = await fs.readFile(
	path.join(source, 'lib', 'types.ts'),
	'utf8'
);

if (
	!sourceTypes.includes("from '@qybercom/ayle'") ||
	!sourceTypes.includes('AyleAnyAngularEvent')
)
	throw new Error('Angular types must consume the shared @qybercom/ayle type model');

const component = await fs.readFile(
	path.join(source, 'lib', 'ayle-player.component.ts'),
	'utf8'
);

if (!component.includes('@Input() config?: AyleConfig;'))
	throw new Error('Angular component must expose the canonical AyleConfig input');

for (const legacy of [
	'preset', 'file', 'playerConfig', 'mediaConfig', 'player',
	'mediaProvider', 'playlist', 'driver', 'driverOptions',
	'localization', 'volume', 'start', 'muted', 'debug'
]) {
	if (component.includes('@Input() ' + legacy))
		throw new Error('Angular component still exposes legacy input: ' + legacy);
}

const publicAPI = await fs.readFile(
	path.join(source, 'public-api.ts'),
	'utf8'
);

for (const token of [
	"./lib/ayle-player.component",
	"./lib/types"
]) {
	if (!publicAPI.includes(token))
		throw new Error('Angular public API is missing expected export: ' + token);
}

const fesmDirectory = path.join(dist, 'fesm2022');
const fesmFiles = await fs.readdir(fesmDirectory);

if (!fesmFiles.some(function (name) {
	return name.endsWith('.mjs');
}))
	throw new Error('Angular dist/fesm2022 does not contain an .mjs bundle');

const files = await fs.readdir(dist, {
	recursive: true
});

if (!files.some(function (name) {
	return name.endsWith('.d.ts');
}))
	throw new Error('Angular dist does not contain TypeScript declarations');

console.log('Ayle Angular binding validation passed.');

const licenseReference = await fs.readFile(path.join(root, 'LICENSE'));
const publishedPackage = JSON.parse(
	await fs.readFile(path.join(root, 'bindings/angular/dist', 'package.json'), 'utf8')
);
const publishedLicense = await fs.readFile(path.join(root, 'bindings/angular/dist/LICENSE'));

if (publishedPackage.license !== 'LGPL-3.0-only')
	throw new Error('Ayle Angular binding package license must be LGPL-3.0-only');

if (!publishedLicense.equals(licenseReference))
	throw new Error('Ayle Angular binding LICENSE mismatch');

console.log('Ayle Angular binding license validation passed.');