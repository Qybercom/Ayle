import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const core = await fs.readFile(path.join(root, 'ayle.js'), 'utf8');
const angularTypes = await fs.readFile(
	path.join(root, 'bindings/angular/src/lib/types.ts'),
	'utf8'
);
const angularComponent = await fs.readFile(
	path.join(root, 'bindings/angular/src/lib/ayle-player.component.ts'),
	'utf8'
);
const reactRuntime = await fs.readFile(
	path.join(root, 'bindings/react/src/index.js'),
	'utf8'
);
const reactTypes = await fs.readFile(
	path.join(root, 'bindings/react/src/index.d.ts'),
	'utf8'
);

function literalCoreEvents (source) {
	const events = new Set();
	const expression = /\.Emit\(['"]([^'"]+)['"]/g;
	let match;

	while ((match = expression.exec(source))) {
		if (!match[1].endsWith(':'))
			events.add(match[1]);
	}

	return Array.from(events).sort();
}

function eventMapNames (source) {
	const match = source.match(/export interface AyleEventMap \{([\s\S]*?)\n\}/);
	if (!match)
		throw new Error('AyleEventMap not found');

	const names = [];
	const expression = /^\t([A-Za-z0-9_]+):/gm;
	let item;

	while ((item = expression.exec(match[1])))
		names.push(item[1]);

	return names.sort();
}

const coreEvents = literalCoreEvents(core);
const typeEvents = eventMapNames(angularTypes);
const missingTypes = coreEvents.filter(function (name) {
	return typeEvents.indexOf(name) === -1;
});

if (missingTypes.length)
	throw new Error(
		'Binding AyleEventMap is missing core events: ' + missingTypes.join(', ')
	);

const reactEventBlock = reactRuntime.match(/export const AYLE_EVENTS = \[([\s\S]*?)\];/);
if (!reactEventBlock)
	throw new Error('React AYLE_EVENTS not found');

const angularEventBlock = angularComponent.match(
	/const allEvents: Array<keyof AyleEventMap> = \[([\s\S]*?)\];/
);
if (!angularEventBlock)
	throw new Error('Angular allEvents not found');

const requiredRuntimeEvents = coreEvents.filter(function (name) {
	return name !== 'ready';
});

let i = 0;
while (i < requiredRuntimeEvents.length) {
	const name = requiredRuntimeEvents[i];

	if (reactEventBlock[1].indexOf("'" + name + "'") === -1)
		throw new Error('React runtime is missing core event: ' + name);

	if (angularEventBlock[1].indexOf("'" + name + "'") === -1)
		throw new Error('Angular runtime is missing core event: ' + name);

	i++;
}

const requiredShortcuts = ['volume', 'start', 'muted'];
i = 0;
while (i < requiredShortcuts.length) {
	const name = requiredShortcuts[i];

	if (reactTypes.indexOf('\t' + name + '?:') === -1)
		throw new Error('React props are missing initialization shortcut: ' + name);

	if (angularComponent.indexOf('@Input() ' + name + '?:') === -1)
		throw new Error('Angular inputs are missing initialization shortcut: ' + name);

	i++;
}

console.log(
	'Ayle binding parity validation passed: ' +
	coreEvents.length +
	' literal core events covered, initialization shortcuts covered.'
);