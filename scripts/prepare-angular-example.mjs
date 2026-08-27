import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run (script) {
	const result = spawnSync(
		process.execPath,
		[
			path.join(root, 'scripts', script)
		],
		{
			cwd: root,
			stdio: 'inherit'
		}
	);

	if (result.error)
		throw result.error;

	if (result.status !== 0)
		process.exit(result.status === null ? 1 : result.status);
}

run('build.mjs');
run('build-angular.mjs');
run('sync-angular-example.mjs');