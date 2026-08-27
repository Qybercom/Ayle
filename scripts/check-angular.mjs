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

const knownEventMatches = sourceTypes.match(
	/export type AyleKnownEventName = keyof AyleEventMap;/g
) || [];

if (knownEventMatches.length !== 1)
	throw new Error(
		'Angular source must declare AyleKnownEventName exactly once; found ' +
		knownEventMatches.length
	);

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