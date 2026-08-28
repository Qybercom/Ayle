import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const version = process.argv[2];

if (!version)
	throw new Error('Version argument is required');

const root = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'..'
);

function isVersion (value) {
	return /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value);
}

async function readPackage (relativePath) {
	return JSON.parse(
		await fs.readFile(
			path.join(root, relativePath),
			'utf8'
		)
	);
}

const core = await readPackage('package.json');
const react = await readPackage('bindings/react/package.json');
const angular = await readPackage('bindings/angular/package.json');

for (const packageJSON of [core, react, angular]) {
	if (!isVersion(packageJSON.version))
		throw new Error(packageJSON.name + ' has invalid version ' + packageJSON.version);

	if (packageJSON.version !== version)
		throw new Error(packageJSON.name + ' must have version ' + version);

	if (!packageJSON.publishConfig || packageJSON.publishConfig.access !== 'public')
		throw new Error(packageJSON.name + ' must have publishConfig.access="public"');

	if (packageJSON.license !== 'LGPL-3.0-only')
		throw new Error(packageJSON.name + ' must have license="LGPL-3.0-only"');
}

for (const binding of [react, angular]) {
	const expected = '^' + version;
	const actual = binding.peerDependencies &&
		binding.peerDependencies['@qybercom/ayle'];

	if (actual !== expected) {
		throw new Error(
			binding.name +
			' must depend on @qybercom/ayle@' +
			expected +
			', got ' +
			String(actual)
		);
	}
}

console.log(
	'Release preflight passed for ' +
	version +
	': ' +
	[core.name, react.name, angular.name].join(', ')
);