import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const angular = path.join(root, 'bindings', 'angular');
const dist = path.join(angular, 'dist');
const require = createRequire(path.join(angular, 'package.json'));

const packageJSONPath = require.resolve('ng-packagr/package.json');
const packageJSON = JSON.parse(
	fs.readFileSync(packageJSONPath, 'utf8')
);

var bin = packageJSON.bin;

if (typeof bin === 'object' && bin !== null)
	bin = bin['ng-packagr'];

if (!bin)
	throw new Error('Cannot resolve ng-packagr CLI from package.json');

const ngPackagr = path.resolve(
	path.dirname(packageJSONPath),
	bin
);

// Never let ng-packagr reuse an artifact from a previous binding API.
// The published package must be produced only from the current source tree.
fs.rmSync(dist, { recursive: true, force: true });

const result = spawnSync(
	process.execPath,
	[
		ngPackagr,
		'-p',
		'ng-package.json'
	],
	{
		cwd: angular,
		stdio: 'inherit'
	}
);

if (result.error)
	throw result.error;

if (result.status !== 0)
	process.exit(result.status === null ? 1 : result.status);

fs.copyFileSync(
	path.join(root, 'LICENSE'),
	path.join(root, 'bindings/angular/dist/LICENSE')
);

console.log('Ayle Angular binding build completed: bindings/angular/dist/');