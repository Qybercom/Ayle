import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window = globalThis;
globalThis.location = { search: '' };

const source = fs.readFileSync(new URL('../ayle.js', import.meta.url), 'utf8');
vm.runInThisContext(source, { filename: 'ayle.js' });

function Driver () {}

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
Driver.prototype.On = function () {};

function assert (value, message) {
	if (!value)
		throw new Error(message);
}

var player = new Ayle(new Driver(), {
	MediaMode: 'video'
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

console.log('Ayle media provider registry validation passed.');
console.log('Ayle media provider config isolation validation passed.');
