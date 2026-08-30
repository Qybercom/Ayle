import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const core = await fs.readFile(path.join(root, 'ayle.js'), 'utf8');
const coreTypes = await fs.readFile(
	path.join(root, 'types/index.d.ts'),
	'utf8'
);
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
const typeEvents = eventMapNames(coreTypes);
const missingTypes = coreEvents.filter(function (name) {
	return typeEvents.indexOf(name) === -1;
});

if (missingTypes.length)
	throw new Error(
		'Core AyleEventMap declarations are missing runtime events: ' + missingTypes.join(', ')
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

const legacyReactProps = [
	'preset', 'file', 'playerConfig', 'mediaConfig', 'player', 'mediaProvider',
	'playlist', 'driver', 'driverOptions', 'localization', 'volume', 'start',
	'muted', 'debug'
];
const legacyAngularInputs = legacyReactProps;

for (const name of legacyReactProps) {
	if (reactTypes.indexOf('\t' + name + '?:') !== -1)
		throw new Error('React binding still exposes legacy prop: ' + name);
}

for (const name of legacyAngularInputs) {
	if (angularComponent.indexOf('@Input() ' + name) !== -1)
		throw new Error('Angular binding still exposes legacy input: ' + name);
}

if (
	reactTypes.indexOf('config?: AyleConfig;') === -1 ||
	angularComponent.indexOf('@Input() config?: AyleConfig;') === -1
)
	throw new Error('Both framework bindings must expose canonical typed config only');

if (
	reactRuntime.indexOf('return cloneConfig(props.config);') === -1 ||
	angularComponent.indexOf('return AyleBootstrap.Clone(this.config || {});') === -1
)
	throw new Error('Framework bindings must pass canonical config directly to Bootstrap');

if (
	angularComponent.indexOf('const configuredHandler = this.events && this.events[name]') === -1 ||
	angularComponent.indexOf('configuredHandler(data, instance);') === -1 ||
	angularComponent.indexOf('known.add(name);') === -1
)
	throw new Error('Angular binding must invoke configured handlers exactly once for built-in and dynamic events');

if (
	coreTypes.indexOf('export interface AyleConfig') === -1 ||
	coreTypes.indexOf('export interface AylePlayerOptions') === -1 ||
	coreTypes.indexOf('export interface AyleHTTPMediaProviderConfig') === -1 ||
	coreTypes.indexOf('Record<string, any>') !== -1
)
	throw new Error('Shared core declarations must own strongly typed configuration without Record<string, any>');

if (
	angularTypes.indexOf("from '@qybercom/ayle'") === -1 ||
	reactTypes.indexOf("from '@qybercom/ayle'") === -1
)
	throw new Error('Angular/React declarations must consume the shared core type model');


console.log(
	'Ayle binding parity validation passed: ' +
	coreEvents.length +
	' literal core events covered, canonical binding config verified.'
);