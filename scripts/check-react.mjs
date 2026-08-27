import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const react = path.join(root, 'bindings', 'react');
const dist = path.join(react, 'dist');

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

const packageJSON = JSON.parse(
	await fs.readFile(path.join(react, 'package.json'), 'utf8')
);

if (packageJSON.types !== './dist/index.d.ts')
	throw new Error('React package must expose ./dist/index.d.ts through "types"');

if (
	!packageJSON.exports ||
	!packageJSON.exports['.'] ||
	packageJSON.exports['.'].types !== './dist/index.d.ts'
)
	throw new Error('React package root export must expose ./dist/index.d.ts through the "types" condition');

const sourceDeclarations = await fs.readFile(
	path.join(react, 'src', 'index.d.ts'),
	'utf8'
);
const declarations = await fs.readFile(path.join(dist, 'index.d.ts'), 'utf8');

if (declarations !== sourceDeclarations)
	throw new Error('React dist/index.d.ts is stale; run npm run build:react');

for (const token of [
	"error?: (data: AyleEventMap['error'], instance: AyleInstance) => void;",
	'onReady?: (instance: AyleInstance) => void;',
	'export interface AyleInstance {',
	'export interface AyleEventMap {'
]) {
	if (!declarations.includes(token))
		throw new Error('React declarations are missing expected token: ' + token);
}

const exampleInstalledDeclarations = path.join(
	root,
	'examples',
	'react',
	'node_modules',
	'@qybercom',
	'ayle-react',
	'dist',
	'index.d.ts'
);

try {
	const installedDeclarations = await fs.readFile(exampleInstalledDeclarations, 'utf8');

	if (installedDeclarations !== declarations)
		console.warn(
			'Note: examples/react/node_modules contains a stale file: copy of @qybercom/ayle-react; ' +
			'the repository example intentionally resolves current source declarations instead.'
		);
} catch {
	// The example dependencies do not need to be installed for the binding build check.
}

console.log('Ayle React binding validation passed.');