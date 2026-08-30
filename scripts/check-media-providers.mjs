import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window = globalThis;
globalThis.location = { search: '' };

const source = fs.readFileSync(new URL('../ayle.js', import.meta.url), 'utf8');
vm.runInThisContext(source, { filename: 'ayle.js' });

function Driver () {
	AyleMediaDriver.call(this);
}

Driver.prototype = Object.create(AyleMediaDriver.prototype);
Driver.prototype.constructor = Driver;

Driver.prototype.GetVolume = function () { return 1; };
Driver.prototype.GetMuted = function () { return false; };
Driver.prototype.GetPlaybackRate = function () { return 1; };
Driver.prototype.GetCodecCandidates = function () { return []; };
Driver.prototype.GetSupportedCodecs = function () { return []; };
Driver.prototype.SupportsCodec = function () { return false; };
Driver.prototype.SetDebug = function () {};
Driver.prototype.SetDebugMP4 = function () {};
Driver.prototype.SetNativeSubtitles = function () {};
Driver.prototype.SetVolume = function () {};
Driver.prototype.SetMuted = function () {};

function assert (value, message) {
	if (!value)
		throw new Error(message);
}

var player = new Ayle({
	Driver: new Driver(),
	Player: {
		MediaMode: 'video'
	}
});

assert(typeof AyleMediaProvider === 'function', 'AyleMediaProvider global is missing');
assert(typeof AyleHTTPMediaProvider === 'function', 'AyleHTTPMediaProvider global is missing');
assert(globalThis['Ayle' + 'HTTP'] === undefined, 'legacy HTTP provider global must not exist');

assert(Ayle.HasMediaProvider('http'), 'built-in http provider is not registered');
assert(Ayle.HasMediaProvider('HTTP'), 'provider names must be case-insensitive');
assert(
	Ayle.GetMediaProvider('http') === AyleHTTPMediaProvider,
	'http registry entry must resolve to AyleHTTPMediaProvider'
);
assert(
	Ayle.RemoveMediaProvider('http') === false,
	'built-in http provider must be protected from removal'
);

var base = new AyleMediaProvider(player, {});
var baseLoadFailed = false;

try {
	base.Load(function () {});
}
catch (error) {
	baseLoadFailed = /not implemented/.test(error.message);
}

assert(baseLoadFailed, 'base media provider Load() must define an abstract contract');

function CustomMediaProvider (customPlayer, options) {
	AyleMediaProvider.call(this, customPlayer, options);
	this.Loaded = false;
}

CustomMediaProvider.prototype = Object.create(AyleMediaProvider.prototype);
CustomMediaProvider.prototype.constructor = CustomMediaProvider;

CustomMediaProvider.prototype.Load = function (callback) {
	this.Loaded = true;
	this.Metadata = { Provider: 'custom' };
	callback(null, null, this.Metadata);
};

Ayle.RegisterMediaProvider('CuStOm', CustomMediaProvider);

assert(Ayle.HasMediaProvider('custom'), 'custom provider registration failed');
assert(
	Ayle.GetMediaProvider('CUSTOM') === CustomMediaProvider,
	'custom provider lookup normalization failed'
);

var custom = Ayle.CreateMediaProvider('CUSTOM', player, {
	Value: 42
});

assert(custom instanceof AyleMediaProvider, 'custom provider must use the media provider contract');
assert(custom.Options.Value === 42, 'custom provider options were not forwarded');
assert(typeof custom.Load === 'function', 'custom provider Load() is missing');

custom.Load(function (error, source, metadata) {
	assert(!error, 'custom provider unexpectedly failed');
	assert(metadata.Provider === 'custom', 'custom provider callback metadata is wrong');
});

assert(custom.Loaded, 'custom provider Load() did not run');

var http = Ayle.CreateMediaProvider('http', player, {
	File: 'example.mkv',
	CodecCandidates: []
});

assert(
	http instanceof AyleMediaProvider,
	'AyleHTTPMediaProvider must inherit from AyleMediaProvider'
);
assert(
	http instanceof AyleHTTPMediaProvider,
	'http registry must create AyleHTTPMediaProvider'
);

var overwriteFailed = false;

try {
	Ayle.RegisterMediaProvider('http', CustomMediaProvider);
}
catch (error) {
	overwriteFailed = /cannot be overwritten/.test(error.message);
}

assert(overwriteFailed, 'built-in http provider must be protected from overwrite');
assert(Ayle.RemoveMediaProvider('custom') === true, 'custom provider removal failed');
assert(!Ayle.HasMediaProvider('custom'), 'removed custom provider is still registered');

var bootstrapSource = fs.readFileSync(
	new URL('../ayle-bootstrap.js', import.meta.url),
	'utf8'
);
var bootstrapMarker = '\tglobal.AyleBootstrap = AyleBootstrap;';
var bootstrapMarkerIndex = bootstrapSource.indexOf(bootstrapMarker);

assert(bootstrapMarkerIndex !== -1, 'AyleBootstrap export marker is missing');

bootstrapSource =
	bootstrapSource.substring(
		0,
		bootstrapMarkerIndex + bootstrapMarker.length
	) +
	'\n})(globalThis);';

vm.runInThisContext(bootstrapSource, {
	filename: 'ayle-bootstrap.js'
});

var sameTypeMerge = AyleBootstrap.MergeMediaProvider(
	{
		Type: 'http',
		MetadataURL: '/metadata',
		RequestHeaders: {
			Authorization: 'base'
		}
	},
	{
		Type: 'HTTP',
		TrackURL: '/track',
		RequestHeaders: {
			'X-Test': 'instance'
		}
	}
);

assert(sameTypeMerge.Type === 'HTTP', 'same-type provider override must be preserved');
assert(sameTypeMerge.MetadataURL === '/metadata', 'same-type provider base options must be inherited');
assert(sameTypeMerge.TrackURL === '/track', 'same-type provider override options must be applied');
assert(
	sameTypeMerge.RequestHeaders.Authorization === 'base' &&
	sameTypeMerge.RequestHeaders['X-Test'] === 'instance',
	'same-type provider nested options must merge normally'
);

var switchedTypeMerge = AyleBootstrap.MergeMediaProvider(
	{
		Type: 'http',
		MetadataURL: '/metadata',
		TrackURL: '/track',
		RequestHeaders: {
			Authorization: 'must-not-leak'
		}
	},
	{
		Type: 'webrtc',
		SignalingURL: '/signaling'
	}
);

assert(switchedTypeMerge.Type === 'webrtc', 'provider Type switch must be applied');
assert(switchedTypeMerge.SignalingURL === '/signaling', 'new provider options must be preserved');
assert(
	switchedTypeMerge.MetadataURL === undefined &&
	switchedTypeMerge.TrackURL === undefined &&
	switchedTypeMerge.RequestHeaders === undefined,
	'provider Type switch must not inherit options from the previous provider type'
);


assert(Ayle.HasDriver('html5'), 'built-in html5 driver is not registered');
assert(Ayle.HasDriver('MSE'), 'built-in mse driver lookup must be case-insensitive');
assert(
	Ayle.GetDriver('html5') === AyleHTML5MediaDriver,
	'html5 registry entry is wrong'
);
assert(
	Ayle.GetDriver('mse') === AyleMSEMediaDriver,
	'mse registry entry is wrong'
);
assert(Ayle.RemoveDriver('html5') === false, 'built-in html5 driver must be protected');
assert(Ayle.RemoveDriver('mse') === false, 'built-in mse driver must be protected');

function CustomDriver () {
	Driver.call(this);
}

CustomDriver.prototype = Object.create(Driver.prototype);
CustomDriver.prototype.constructor = CustomDriver;
CustomDriver.prototype.SetOptions = function (options) {
	this.Options = options || {};
	return this;
};

Ayle.RegisterDriver('custom', CustomDriver);
assert(Ayle.HasDriver('CUSTOM'), 'custom driver registration failed');

var createdDriver = Ayle.CreateDriver('custom', { Value: 7 });
assert(createdDriver.Options.Value === 7, 'driver options were not forwarded');

var eventPlayer = new Ayle({
	Driver: createdDriver,
	Player: {
		MediaMode: 'video'
	}
});
var driverEvent = null;

eventPlayer.On('driver:testEvent', function (data) {
	driverEvent = data;
});
createdDriver.Emit('testEvent', { Value: 11 });
assert(driverEvent && driverEvent.Value === 11, 'driver namespaced event forwarding failed');

function EventProvider (providerPlayer, options) {
	AyleMediaProvider.call(this, providerPlayer, options);
}
EventProvider.prototype = Object.create(AyleMediaProvider.prototype);
EventProvider.prototype.constructor = EventProvider;
EventProvider.prototype.Load = function () { return true; };

Ayle.RegisterMediaProvider('event-provider', EventProvider);
eventPlayer.SetMediaProvider({
	Type: 'event-provider'
});

var providerEvent = null;
eventPlayer.On('provider:testEvent', function (data) {
	providerEvent = data;
});
eventPlayer.MediaProvider.Emit('testEvent', { Value: 13 });
assert(providerEvent && providerEvent.Value === 13, 'provider namespaced event forwarding failed');

assert(Ayle.RemoveMediaProvider('event-provider') === true, 'event provider removal failed');
assert(Ayle.RemoveDriver('custom') === true, 'custom driver removal failed');

var directPlayer = new Ayle({
	Driver: new Driver(),
	MediaProvider: {
		File: '/media/direct.mp3'
	},
	Player: {
		MediaMode: 'audio'
	}
});

assert(
	directPlayer.MediaProvider instanceof AyleHTTPMediaProvider,
	'omitting MediaProvider.Type must select the built-in http provider'
);
assert(
	directPlayer.MediaProvider.Options.MetadataURL === '',
	'direct HTTP mode must not require MetadataURL'
);

var directProviderReady = null;
directPlayer.On('provider:ready', function (data) {
	directProviderReady = data;
});

var loadWithoutUIFailed = false;

try {
	directPlayer.Load();
}
catch (error) {
	loadWithoutUIFailed = /UI is not attached/.test(error.message);
}

assert(
	loadWithoutUIFailed,
	'Load() before AttachUI() must fail with a clear lifecycle error'
);

/*
 * This regression uses a non-DOM test driver. AttachUI itself is covered by
 * the dedicated DOM-target regression below; a truthy UI is enough to exercise
 * provider -> AyleSource -> Driver without a browser DOM.
 */
directPlayer.UI = {};
directPlayer.Load();

assert(
	directPlayer.State.Source &&
	directPlayer.State.Source.URL === '/media/direct.mp3',
	'direct HTTP provider must resolve File into AyleSource.URL'
);
assert(
	directProviderReady &&
	directProviderReady.Source === directPlayer.State.Source,
	'direct provider ready event must flow through player.On()'
);


var originalDocument = globalThis.document;
var fakeElementA = {
	nodeType: 1,
	querySelector: function () { return null; }
};
var fakeElementB = {
	nodeType: 1,
	querySelector: function () { return null; }
};

globalThis.document = {
	querySelectorAll: function (selector) {
		if (selector === '#one')
			return [fakeElementA];

		if (selector === '.many')
			return [fakeElementA, fakeElementB];

		if (selector === '.none')
			return [];

		throw new Error('invalid selector');
	}
};

assert(
	Ayle.ResolveElement('#one', 'Test target') === fakeElementA,
	'selector resolving to one element must be accepted'
);

var zeroMatchFailed = false;
try {
	Ayle.ResolveElement('.none', 'Test target');
}
catch (error) {
	zeroMatchFailed = /was not found/.test(error.message);
}
assert(zeroMatchFailed, 'zero-match selector must fail');

var multipleMatchFailed = false;
try {
	Ayle.ResolveElement('.many', 'Test target');
}
catch (error) {
	multipleMatchFailed = /exactly one Element/.test(error.message);
}
assert(multipleMatchFailed, 'multi-match selector must fail');

var collectionFailed = false;
try {
	Ayle.ResolveElement([fakeElementA], 'Test target');
}
catch (error) {
	collectionFailed = /single DOM Element/.test(error.message);
}
assert(collectionFailed, 'element collections must not be silently accepted');

assert(
	Ayle.ResolveElement(fakeElementA, 'Test target') === fakeElementA,
	'a concrete element node must be accepted'
);

globalThis.document = originalDocument;

console.log('Ayle media provider registry validation passed.');
console.log('Ayle media provider config isolation validation passed.');
