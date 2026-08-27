import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const example = path.join(root, 'examples', 'angular');
const scope = path.join(example, 'node_modules', '@qybercom');

const coreSource = root;
const coreTarget = path.join(scope, 'ayle');

const angularSource = path.join(root, 'bindings', 'angular', 'dist');
const angularTarget = path.join(scope, 'ayle-angular');

const angularCache = path.join(example, '.angular');

await fs.access(path.join(coreSource, 'dist', 'ayle.esm.js'));
await fs.access(path.join(coreSource, 'dist', 'ayle-bootstrap.esm.js'));
await fs.access(path.join(coreSource, 'package.json'));
await fs.access(path.join(angularSource, 'package.json'));

await fs.rm(coreTarget, {
	recursive: true,
	force: true
});

await fs.rm(angularTarget, {
	recursive: true,
	force: true
});

await fs.rm(angularCache, {
	recursive: true,
	force: true
});

await fs.mkdir(scope, {
	recursive: true
});

await fs.mkdir(coreTarget, {
	recursive: true
});

await fs.cp(
	path.join(coreSource, 'dist'),
	path.join(coreTarget, 'dist'),
	{
		recursive: true
	}
);

for (const name of [
	'package.json',
	'README.md',
	'LICENSE'
]) {
	try {
		await fs.copyFile(
			path.join(coreSource, name),
			path.join(coreTarget, name)
		);
	}
	catch {}
}

await fs.cp(
	angularSource,
	angularTarget,
	{
		recursive: true
	}
);

console.log('Ayle core and Angular binding synced; Angular example cache cleared.');