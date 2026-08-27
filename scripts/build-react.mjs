import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const react = path.join(root, 'bindings', 'react');
const source = path.join(react, 'src');
const dist = path.join(react, 'dist');

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });

const code = await fs.readFile(path.join(source, 'index.js'), 'utf8');
const result = await transform(code, {
	loader: 'js',
	format: 'esm',
	target: 'es2020',
	minify: false,
	legalComments: 'inline'
});

await fs.writeFile(path.join(dist, 'index.js'), result.code.trimEnd(), 'utf8');
await fs.copyFile(path.join(source, 'index.d.ts'), path.join(dist, 'index.d.ts'));

console.log('Ayle React binding build completed: bindings/react/dist/');