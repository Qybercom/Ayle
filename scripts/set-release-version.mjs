import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const version = process.argv[2];
if (!version) throw new Error('Version argument is required');

const root = process.cwd();

async function update (file, callback) {
	const packageJSON = JSON.parse(await fs.readFile(file, 'utf8'));
	packageJSON.version = version;
	if (callback) callback(packageJSON);
	await fs.writeFile(file, JSON.stringify(packageJSON, null, '\t'), 'utf8');
}

await update(path.join(root, 'package.json'));
await update(path.join(root, 'bindings', 'react', 'package.json'), function (packageJSON) {
	packageJSON.peerDependencies['@qybercom/ayle'] = '^' + version;
});

await update(path.join(root, 'bindings', 'angular', 'package.json'), function (packageJSON) {
	packageJSON.peerDependencies['@qybercom/ayle'] = '^' + version;
});

console.log('Release version set to ' + version);