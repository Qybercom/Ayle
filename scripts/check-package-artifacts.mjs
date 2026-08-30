import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'ayle-pack-'));

const legacyAngularInputs = [
	'preset', 'file', 'playerConfig', 'mediaConfig', 'player',
	'mediaProvider', 'playlist', 'http', 'driver', 'driverOptions',
	'localization', 'volume', 'start', 'muted', 'debug'
];

function run (command, args, cwd) {
	const result = spawnSync(command, args, {
		cwd: cwd || root,
		encoding: 'utf8'
	});

	if (result.error)
		throw result.error;

	if (result.status !== 0) {
		throw new Error(
			command + ' ' + args.join(' ') + ' failed:\n' +
			(result.stdout || '') + '\n' + (result.stderr || '')
		);
	}

	return result.stdout;
}

function npmCommand () {
	return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

async function pack (directory) {
	const output = run(
		npmCommand(),
		['pack', '--json', '--ignore-scripts', '--pack-destination', temporary, directory],
		root
	);
	const data = JSON.parse(output);

	if (!data.length || !data[0].filename)
		throw new Error('npm pack did not return a tarball filename for ' + directory);

	return path.join(temporary, data[0].filename);
}

function readTarFile (tarball, filename) {
	return run('tar', ['-xOf', tarball, filename], root);
}

function validateAngularDeclaration (source, label) {
	if (!source.includes('config?: AyleConfig;'))
		throw new Error(label + ' does not expose canonical config?: AyleConfig');

	if (!source.includes('settings?:'))
		throw new Error(label + ' does not expose framework settings input');

	for (const name of legacyAngularInputs) {
		if (source.includes('\n    ' + name + '?:') || source.includes('\n\t' + name + '?:'))
			throw new Error(label + ' still exposes legacy Angular input: ' + name);
	}

	if (source.includes('Record<string, any>'))
		throw new Error(label + ' contains legacy Record<string, any> binding declarations');
}

try {
	const coreDistTypes = await fs.readFile(path.join(root, 'dist', 'index.d.ts'), 'utf8');
	const angularDistTypes = await fs.readFile(
		path.join(root, 'bindings', 'angular', 'dist', 'index.d.ts'),
		'utf8'
	);

	if (!coreDistTypes.includes('export interface AyleConfig'))
		throw new Error('Built core dist/index.d.ts is missing AyleConfig');

	validateAngularDeclaration(angularDistTypes, 'Built Angular dist/index.d.ts');

	const sourceCorePackage = JSON.parse(
		await fs.readFile(path.join(root, 'package.json'), 'utf8')
	);
	const sourceAngularPackage = JSON.parse(
		await fs.readFile(path.join(root, 'bindings', 'angular', 'package.json'), 'utf8')
	);
	const builtAngularPackage = JSON.parse(
		await fs.readFile(path.join(root, 'bindings', 'angular', 'dist', 'package.json'), 'utf8')
	);

	if (builtAngularPackage.version !== sourceAngularPackage.version)
		throw new Error('Angular dist version does not match binding source package version');

	if (sourceAngularPackage.peerDependencies['@qybercom/ayle'] !== builtAngularPackage.peerDependencies['@qybercom/ayle'])
		throw new Error('Angular dist @qybercom/ayle peer dependency is stale');

	const coreTarball = await pack('.');
	const angularTarball = await pack('./bindings/angular/dist');

	const packedCoreTypes = readTarFile(coreTarball, 'package/dist/index.d.ts');
	const packedAngularTypes = readTarFile(angularTarball, 'package/index.d.ts');
	const packedAngularPackage = JSON.parse(
		readTarFile(angularTarball, 'package/package.json')
	);

	if (!packedCoreTypes.includes('export interface AyleConfig'))
		throw new Error('Packed @qybercom/ayle tarball is missing current AyleConfig declarations');

	validateAngularDeclaration(
		packedAngularTypes,
		'Packed @qybercom/ayle-angular index.d.ts'
	);

	if (packedAngularPackage.name !== '@qybercom/ayle-angular')
		throw new Error('Packed Angular package has unexpected package name');

	if (packedAngularPackage.version !== sourceAngularPackage.version)
		throw new Error('Packed Angular package version is stale');

	const peer = packedAngularPackage.peerDependencies &&
		packedAngularPackage.peerDependencies['@qybercom/ayle'];

	if (!peer)
		throw new Error('Packed Angular package does not declare @qybercom/ayle peer dependency');

	console.log('Ayle npm artifact validation passed: current core and Angular declarations are present in real tarballs.');
}
finally {
	await fs.rm(temporary, { recursive: true, force: true });
}
