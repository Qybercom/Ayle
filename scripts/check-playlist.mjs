import fs from 'node:fs';
import vm from 'node:vm';

function assert (value, message) {
	if (!value)
		throw new Error(message);
}

var core = fs.readFileSync(new URL('../ayle.js', import.meta.url), 'utf8');
var context = {
	console: console,
	setTimeout: setTimeout,
	clearTimeout: clearTimeout,
	URL: {
		createObjectURL: function () { return 'blob:test'; },
		revokeObjectURL: function () {}
	},
	navigator: {},
	document: {
		querySelectorAll: function () { return []; }
	}
};
context.globalThis = context;
context.window = context;
vm.runInNewContext(core, context);

var Ayle = context.Ayle;
var ArrayInContext = vm.runInContext('Array', context);
var AyleMediaDriver = context.AyleMediaDriver;
var AyleMediaProvider = context.AyleMediaProvider;

function TestDriver () {
	AyleMediaDriver.call(this);
	this.Loaded = [];
	this.PlayCount = 0;
}
TestDriver.prototype = Object.create(AyleMediaDriver.prototype);
TestDriver.prototype.constructor = TestDriver;
TestDriver.prototype.Load = function (source) {
	this.Loaded.push(source);
	this.Emit('ready');
	return true;
};
TestDriver.prototype.Play = function () {
	this.PlayCount++;
	this.Emit('play');
	return true;
};
TestDriver.prototype.Pause = function () {
	this.Emit('pause');
	return true;
};
TestDriver.prototype.GetVolume = function () { return 1; };
TestDriver.prototype.GetMuted = function () { return false; };
TestDriver.prototype.GetPlaybackRate = function () { return 1; };
TestDriver.prototype.SetVolume = function () {};
TestDriver.prototype.SetMuted = function () {};
TestDriver.prototype.SetDebug = function () {};
TestDriver.prototype.SetDebugMP4 = function () {};
TestDriver.prototype.SetNativeSubtitles = function () {};

function TestProvider (player, options) {
	AyleMediaProvider.call(this, player, options);
}
TestProvider.prototype = Object.create(AyleMediaProvider.prototype);
TestProvider.prototype.constructor = TestProvider;
TestProvider.prototype.Load = function (callback) {
	var source = new context.AyleSource({
		URL: this.Options.File,
		MediaMode: this.Options.MediaMode || 'audio'
	});
	this.Source = source;
	this.Player.Load(source);
	if (callback)
		callback(null, source, {});
	return source;
};

Ayle.RegisterDriver('playlist-test', TestDriver);
Ayle.RegisterMediaProvider('playlist-test', TestProvider);

var playlistItems = new ArrayInContext();
playlistItems.push(
	{ ID: 'one', MediaProvider: { Type: 'playlist-test', File: 'one.mp3' } },
	{ ID: 'two', MediaProvider: { Type: 'playlist-test', File: 'two.mp3' } }
);

var player = new Ayle({
	Driver: { Type: 'playlist-test' },
	Player: { MediaMode: 'audio' },
	Playlist: {
		AutoAdvance: true,
		Loop: false,
		StartIndex: 0,
		Items: playlistItems
	}
});

/* Non-DOM regression: UI presence is enough for the provider/core path. */
player.UI = {};
player.Load();

assert(player.PlaylistIndex === 0, 'initial playlist index must load');
assert(player.State.Source.URL === 'one.mp3', 'initial playlist item must resolve');
assert(player.HasPrevious() === false, 'first item must not have previous');
assert(player.HasNext() === true, 'first item must have next');

var change = null;
player.On('playlistItemChange', function (data) { change = data; });
assert(player.Next() === true, 'Next() must switch');
assert(player.PlaylistIndex === 1, 'Next() must advance index');
assert(player.State.Source.URL === 'two.mp3', 'Next() must load next source');
assert(change && change.Reason === 'next', 'Next() reason must be emitted');
assert(player.HasNext() === false, 'last non-loop item must not have next');
assert(player.Previous() === true, 'Previous() must switch');
assert(player.PlaylistIndex === 0, 'Previous() must move back');
assert(player.SetPlaylistItemByID('two') === true, 'ID navigation must work');
assert(player.PlaylistIndex === 1, 'ID navigation must resolve index');

player.Playlist.Loop = true;
player._updatePlaylistState();
assert(player.Next() === true, 'looping Next() must wrap');
assert(player.PlaylistIndex === 0, 'looping Next() must wrap to zero');


var mixedItems = new ArrayInContext();
mixedItems.push(
	{
		ID: 'base',
		MediaProvider: {
			Type: 'playlist-test',
			File: 'base.mp3'
		},
		Player: {
			MediaMode: 'audio',
			UI: {
				Toolbar: {
					Items: ['play']
				}
			}
		}
	},
	{
		ID: 'custom',
		Driver: {
			Type: 'playlist-test',
			Options: { Name: 'second' }
		},
		MediaProvider: {
			Type: 'playlist-test',
			File: 'custom.mp3'
		},
		Player: {
			MediaMode: 'video'
		}
	}
);

var mixed = new Ayle({
	Driver: { Type: 'playlist-test' },
	Player: { MediaMode: 'audio' },
	Playlist: { Items: mixedItems }
});
mixed.UI = {};
mixed.Load();
var firstDriver = mixed.Driver;
assert(
	mixed.Options.UI.Toolbar.Items.length === 1 &&
	mixed.Options.UI.Toolbar.Items[0] === 'play',
	'item UI override must apply'
);
assert(mixed.Next() === true, 'mixed-driver playlist must advance');
assert(mixed.Driver !== firstDriver, 'item Driver override must replace Driver');
assert(
	mixed.Options.UI.Toolbar.Items.indexOf('previous') !== -1 &&
	mixed.Options.UI.Toolbar.Items.indexOf('next') !== -1,
	'previous item UI override must not leak into next item'
);
assert(
	mixed.State.MediaMode === 'video',
	'item Player.MediaMode override must apply'
);

console.log('Ayle playlist core validation passed.');
