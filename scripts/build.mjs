import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { transform } from 'esbuild';

const root = process.cwd();
const dist = path.join(root, 'dist');

const files = {
	js: path.join(root, 'ayle.js'),
	bootstrap: path.join(root, 'ayle-bootstrap.js'),
	css: path.join(root, 'ayle.css'),
	icons: path.join(root, 'ayle-icons.svg'),
	iconsDirectory: path.join(root, 'icons')
};

async function exists (file) {
	try {
		await fs.access(file);
		return true;
	}
	catch (e) {
		return false;
	}
}

async function clean () {
	await fs.rm(dist, {
		recursive: true,
		force: true
	});
}

async function copy (source, destination) {
	await fs.copyFile(source, destination);
}

async function minify (source, loader) {
	const result = await transform(source, {
		loader: loader,
		minify: true,
		target: loader === 'js' ? 'es2015' : undefined,
		legalComments: 'inline'
	});

	return result.code;
}

function createESM (source) {
	/*
	 * Keep ayle.js itself as the canonical standalone/browser source.
	 * The npm ESM build executes the same runtime against globalThis and then
	 * exposes the public Ayle classes as real ES module exports.
	 */
	const end = /\}\)\(window\);\s*$/;

	if (!end.test(source))
		throw new Error('Cannot create ESM build: ayle.js IIFE footer was not found.');

	source = source.replace(end, '})(globalThis);');

	return source + `

const Ayle = globalThis.Ayle;
const AyleEventEmitter = globalThis.AyleEventEmitter;
const AyleMediaVariant = globalThis.AyleMediaVariant;
const AyleMediaTrack = globalThis.AyleMediaTrack;
const AyleMediaCover = globalThis.AyleMediaCover;
const AyleMediaChapter = globalThis.AyleMediaChapter;
const AyleSource = globalThis.AyleSource;
const AyleMediaDriver = globalThis.AyleMediaDriver;
const AyleHTML5MediaDriver = globalThis.AyleHTML5MediaDriver;
const AyleMSEMediaDriver = globalThis.AyleMSEMediaDriver;
const AyleHTTP = globalThis.AyleHTTP;
const AyleUI = globalThis.AyleUI;

export {
	Ayle,
	AyleEventEmitter,
	AyleMediaVariant,
	AyleMediaTrack,
	AyleMediaCover,
	AyleMediaChapter,
	AyleSource,
	AyleMediaDriver,
	AyleHTML5MediaDriver,
	AyleMSEMediaDriver,
	AyleHTTP,
	AyleUI
};
`;
}


function createBootstrapESM (source) {
	const marker = '\tglobal.AyleBootstrap = AyleBootstrap;';
	const index = source.indexOf(marker);

	if (index === -1)
		throw new Error('Cannot create bootstrap ESM build: AyleBootstrap export marker was not found.');

	const runtime = source.substring(0, index + marker.length) + '\n})(globalThis);';

	return runtime + `

const AyleBootstrap = globalThis.AyleBootstrap;

export {
	AyleBootstrap
};
`;
}

async function build () {
	await clean();
	await fs.mkdir(dist, {
		recursive: true
	});

	const js = await fs.readFile(files.js, 'utf8');
	const bootstrap = await fs.readFile(files.bootstrap, 'utf8');
	const css = await fs.readFile(files.css, 'utf8');

	await copy(files.js, path.join(dist, 'ayle.js'));
	await copy(files.bootstrap, path.join(dist, 'ayle-bootstrap.js'));
	await copy(files.css, path.join(dist, 'ayle.css'));
	await copy(files.icons, path.join(dist, 'ayle-icons.svg'));

	await fs.cp(
		files.iconsDirectory,
		path.join(dist, 'icons'),
		{
			recursive: true
		}
	);

	await fs.writeFile(
		path.join(dist, 'ayle.min.js'),
		await minify(js, 'js'),
		'utf8'
	);

	await fs.writeFile(
		path.join(dist, 'ayle-bootstrap.min.js'),
		await minify(bootstrap.replace("base + 'ayle.css'", "base + 'ayle.min.css'").replace("base + 'ayle.js'", "base + 'ayle.min.js'"), 'js'),
		'utf8'
	);

	await fs.writeFile(
		path.join(dist, 'ayle.min.css'),
		await minify(css, 'css'),
		'utf8'
	);

	await fs.writeFile(
		path.join(dist, 'ayle.esm.js'),
		createESM(js),
		'utf8'
	);

	await fs.writeFile(
		path.join(dist, 'ayle-bootstrap.esm.js'),
		createBootstrapESM(bootstrap),
		'utf8'
	);

	if (await exists(path.join(root, 'README.md')))
		await copy(path.join(root, 'README.md'), path.join(dist, 'README.md'));

	if (await exists(path.join(root, 'LICENSE')))
		await copy(path.join(root, 'LICENSE'), path.join(dist, 'LICENSE'));

	console.log('Ayle core build completed: dist/');
}

if (process.argv.includes('--clean')) {
	await clean();
	console.log('Removed dist/');
}
else
	await build();