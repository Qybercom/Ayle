import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'bindings', 'react', 'dist');

for (const name of ['index.js', 'index.d.ts'])
	await fs.access(path.join(dist, name));

const code = await fs.readFile(path.join(dist, 'index.js'), 'utf8');

const checks = [
	{
		Name: '@qybercom/ayle/bootstrap import',
		Pattern: /from\s+["']@qybercom\/ayle\/bootstrap["']/
	},
	{
		Name: 'react import',
		Pattern: /from\s+["']react["']/
	},
	{
		Name: 'AylePlayer export',
		Pattern: /\bAylePlayer\b/
	},
	{
		Name: 'AYLE_EVENTS export',
		Pattern: /\bAYLE_EVENTS\b/
	}
];

for (const check of checks) {
	if (!check.Pattern.test(code))
		throw new Error('React build is missing expected token: ' + check.Name);
}

console.log('Ayle React binding validation passed.');