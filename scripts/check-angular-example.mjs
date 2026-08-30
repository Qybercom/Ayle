import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const example = path.join(root, 'examples', 'angular');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const result = spawnSync(
	npm,
	['run', 'typecheck'],
	{
		cwd: example,
		stdio: 'inherit'
	}
);

if (result.error)
	throw result.error;

if (result.status !== 0)
	process.exit(result.status === null ? 1 : result.status);

console.log('Ayle Angular consumer example compilation passed.');
