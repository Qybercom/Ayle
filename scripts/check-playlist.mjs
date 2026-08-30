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
	this.Volume = 1;
	this.Muted = false;
	this.PlaybackRate = 1;
	this.AttachedVolume = null;
	this.AttachedMuted = null;
	this.AttachedPlaybackRate = null;
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
TestDriver.prototype.GetVolume = function () { return this.Volume; };
TestDriver.prototype.GetMuted = function () { return this.Muted; };
TestDriver.prototype.GetPlaybackRate = function () { return this.PlaybackRate; };
TestDriver.prototype.SetVolume = function (volume) { this.Volume = volume; };
TestDriver.prototype.SetMuted = function (muted) { this.Muted = !!muted; };
TestDriver.prototype.SetPlaybackRate = function (rate) { this.PlaybackRate = rate; };
TestDriver.prototype.SetUI = function (ui) {
	AyleMediaDriver.prototype.SetUI.call(this, ui);

	if (ui) {
		this.AttachedVolume = this.Volume;
		this.AttachedMuted = this.Muted;
		this.AttachedPlaybackRate = this.PlaybackRate;
	}

	return this;
};
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

function PendingProvider (player, options) {
	AyleMediaProvider.call(this, player, options);
	this.LoadingAtEntry = false;
	this.ReadyAtEntry = true;
}
PendingProvider.prototype = Object.create(AyleMediaProvider.prototype);
PendingProvider.prototype.constructor = PendingProvider;
PendingProvider.prototype.Load = function () {
	this.LoadingAtEntry = this.Player.State.Loading;
	this.ReadyAtEntry = this.Player.State.Ready;
	return this;
};

Ayle.RegisterDriver('playlist-test', TestDriver);
Ayle.RegisterMediaProvider('playlist-test', TestProvider);
Ayle.RegisterMediaProvider('playlist-pending', PendingProvider);

var initialPending = new Ayle({
	Driver: { Type: 'playlist-test' },
	MediaProvider: { Type: 'playlist-pending', File: 'initial.mp3' },
	Player: { MediaMode: 'audio' }
});
initialPending.UI = {};
initialPending.Load();
assert(
	initialPending.MediaProvider.LoadingAtEntry === true &&
	initialPending.MediaProvider.ReadyAtEntry === false,
	'initial Load() must enter loading before MediaProvider resolution begins'
);

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


var pendingItems = new ArrayInContext();
pendingItems.push(
	{ ID: 'ready', MediaProvider: { Type: 'playlist-test', File: 'ready.mp3' } },
	{ ID: 'pending', MediaProvider: { Type: 'playlist-pending', File: 'pending.mp3' } }
);

var pendingPlayer = new Ayle({
	Driver: { Type: 'playlist-test' },
	Player: { MediaMode: 'audio' },
	Playlist: { Items: pendingItems }
});
pendingPlayer.UI = {};
pendingPlayer.Load();
assert(pendingPlayer.State.Ready === true, 'first synchronous item must be ready');
assert(pendingPlayer.Next() === true, 'pending playlist item must start navigation');
assert(
	pendingPlayer.MediaProvider.LoadingAtEntry === true &&
	pendingPlayer.MediaProvider.ReadyAtEntry === false,
	'Next() must enter loading before the next MediaProvider starts resolving the item'
);
assert(
	pendingPlayer.State.Loading === true && pendingPlayer.State.Ready === false,
	'pending provider work must keep player initialization visibly loading'
);


var authoritativeItems = new ArrayInContext();
authoritativeItems.push(
	{
		ID: 'authoritative',
		MediaProvider: {
			File: 'playlist.mp3'
		}
	}
);

var authoritative = new Ayle({
	Driver: { Type: 'playlist-test' },
	MediaProvider: {
		Type: 'playlist-test',
		File: 'base-default.mp3',
		SharedOption: 'inherited'
	},
	Player: { MediaMode: 'audio' },
	Playlist: {
		Loop: false,
		Items: authoritativeItems
	}
});
authoritative.UI = {};
authoritative.Load();

assert(
	authoritative.State.Source.URL === 'playlist.mp3',
	'Playlist.Items must be authoritative over top-level MediaProvider.File'
);
assert(
	authoritative.MediaProvider.Options.SharedOption === 'inherited',
	'top-level MediaProvider must remain inherited provider defaults'
);
assert(
	authoritative.PlaylistIndex === 0 &&
	authoritative.PlaylistItem.ID === 'authoritative',
	'playlist mode must start directly on StartIndex item'
);
assert(
	authoritative.HasPrevious() === false &&
	authoritative.HasNext() === false,
	'one-item non-loop playlist must not be navigable'
);

authoritative.Playlist.Loop = true;
authoritative._updatePlaylistState();

assert(
	authoritative.HasPrevious() === true &&
	authoritative.HasNext() === true,
	'one-item Loop:true playlist must expose both navigation directions'
);
assert(
	authoritative.Next() === true &&
	authoritative.PlaylistIndex === 0 &&
	authoritative.State.Source.URL === 'playlist.mp3',
	'one-item Loop:true Next() must wrap to and reload the same item'
);
assert(
	authoritative.Previous() === true &&
	authoritative.PlaylistIndex === 0,
	'one-item Loop:true Previous() must wrap to the same item'
);


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
	Player: {
		MediaMode: 'audio',
		ForceShowPreviousButton: true,
		ForceShowNextButton: true
	},
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
assert(
	mixed.Options.ForceShowPreviousButton === true &&
	mixed.Options.ForceShowNextButton === true,
	'base forced playlist controls must survive item Player overrides'
);

var baseHints = new ArrayInContext();
baseHints.push(
	{ ID: 'shared-hint', Start: 5, Duration: 5, Title: 'Global shared' },
	{ ID: 'global-hint', Start: 10, Duration: 5, Title: 'Global only' }
);
var baseRanges = new ArrayInContext();
baseRanges.push(
	{ ID: 'shared-range', Start: 10, End: 20, Label: 'Global shared range' },
	{ ID: 'global-range', Start: 30, End: 40, Label: 'Global only range' }
);
var itemHints = new ArrayInContext();
itemHints.push(
	{ ID: 'shared-hint', Start: 15, Duration: 5, Title: 'Item override' },
	{ ID: 'item-hint', Start: 25, Duration: 5, Title: 'Item only' }
);
var itemRanges = new ArrayInContext();
itemRanges.push(
	{ ID: 'shared-range', Start: 50, End: 60, Label: 'Item override range' },
	{ ID: 'item-range', Start: 70, End: 80, Label: 'Item only range' }
);
var overlayItems = new ArrayInContext();
overlayItems.push(
	{ ID: 'overlay-one', MediaProvider: { Type: 'playlist-test', File: 'overlay-one.mp3' } },
	{
		ID: 'overlay-two',
		MediaProvider: { Type: 'playlist-test', File: 'overlay-two.mp3' },
		Player: {
			Integration: {
				Hints: itemHints,
				TimelineRanges: itemRanges
			}
		}
	}
);
var overlayPlayer = new Ayle({
	Driver: { Type: 'playlist-test' },
	Player: {
		MediaMode: 'audio',
		Integration: {
			Hints: baseHints,
			TimelineRanges: baseRanges
		}
	},
	Playlist: { Items: overlayItems }
});
overlayPlayer.UI = {};
overlayPlayer.Load();

assert(
	overlayPlayer.Options.Integration.Hints.length === 2 &&
	overlayPlayer.Options.Integration.TimelineRanges.length === 2,
	'first playlist item must inherit global Integration overlays unchanged'
);
assert(
	!Object.prototype.hasOwnProperty.call(overlayPlayer.State.Source, 'Hints') &&
	!Object.prototype.hasOwnProperty.call(overlayPlayer.State.Source, 'TimelineRanges'),
	'platform overlays must not be stored in AyleSource metadata'
);

assert(overlayPlayer.Next() === true, 'overlay playlist must advance');
var effectiveHints = overlayPlayer.Options.Integration.Hints;
var effectiveRanges = overlayPlayer.Options.Integration.TimelineRanges;
var sharedHintCount = 0;
var sharedRangeCount = 0;
var itemHintFound = false;
var itemRangeFound = false;
var iOverlay = 0;

while (iOverlay < effectiveHints.length) {
	if (effectiveHints[iOverlay].ID === 'shared-hint') {
		sharedHintCount++;
		assert(effectiveHints[iOverlay].Start === 15, 'item Hint must override global Hint with same ID');
	}

	if (effectiveHints[iOverlay].ID === 'item-hint')
		itemHintFound = true;

	iOverlay++;
}

iOverlay = 0;
while (iOverlay < effectiveRanges.length) {
	if (effectiveRanges[iOverlay].ID === 'shared-range') {
		sharedRangeCount++;
		assert(effectiveRanges[iOverlay].Start === 50, 'item TimelineRange must override global range with same ID');
	}

	if (effectiveRanges[iOverlay].ID === 'item-range')
		itemRangeFound = true;

	iOverlay++;
}

assert(sharedHintCount === 1 && itemHintFound, 'effective Hints must merge global + item overlays by ID');
assert(sharedRangeCount === 1 && itemRangeFound, 'effective TimelineRanges must merge global + item overlays by ID');
assert(effectiveHints.length === 3, 'item Hint addition must preserve unrelated global Hints');
assert(effectiveRanges.length === 3, 'item range addition must preserve unrelated global TimelineRanges');

assert(overlayPlayer.Previous() === true, 'overlay playlist must return to first item');
assert(
	overlayPlayer.Options.Integration.Hints.length === 2 &&
	overlayPlayer.Options.Integration.Hints[0].Start === 5 &&
	overlayPlayer.Options.Integration.TimelineRanges.length === 2 &&
	overlayPlayer.Options.Integration.TimelineRanges[0].Start === 10,
	'leaving an item must restore the inherited global Integration overlays without leakage'
);


var hintItems = new ArrayInContext();
hintItems.push(
	{ ID: 'hint-one', MediaProvider: { Type: 'playlist-test', File: 'hint-one.mp3' } },
	{ ID: 'hint-two', MediaProvider: { Type: 'playlist-test', File: 'hint-two.mp3' } }
);
var hintPlayer = new Ayle({
	Driver: { Type: 'playlist-test' },
	Player: { MediaMode: 'audio' },
	Playlist: { Items: hintItems }
});
hintPlayer.UI = {};
hintPlayer.Load();

assert(
	hintPlayer.ExecuteHintAction({}, { Type: 'next' }, null) === true,
	'Hint Type:next must use playlist Next()'
);
assert(
	hintPlayer.PlaylistIndex === 1,
	'Hint next action must advance playlist'
);
assert(
	hintPlayer.ExecuteHintAction({}, { Type: 'previous' }, null) === true,
	'Hint Type:previous must use playlist Previous()'
);
assert(
	hintPlayer.PlaylistIndex === 0,
	'Hint previous action must move playlist back'
);

var delayedItems = new ArrayInContext();
delayedItems.push(
	{ ID: 'delay-one', MediaProvider: { Type: 'playlist-test', File: 'delay-one.mp3' } },
	{ ID: 'delay-two', MediaProvider: { Type: 'playlist-test', File: 'delay-two.mp3' } }
);
var delayed = new Ayle({
	Driver: { Type: 'playlist-test' },
	Player: { MediaMode: 'audio' },
	Playlist: {
		AutoAdvance: true,
		AutoAdvanceDelay: 40,
		Items: delayedItems
	}
});
delayed.UI = {};
delayed.Load();

var autoStart = null;
var autoComplete = null;
delayed.On('playlistAutoAdvanceStart', function (data) { autoStart = data; });
delayed.On('playlistAutoAdvanceComplete', function (data) { autoComplete = data; });

delayed.Driver.Emit('ended');

assert(
	autoStart && autoStart.Delay === 40,
	'ended must start delayed auto-advance with configured delay'
);
assert(
	delayed.PlaylistIndex === 0,
	'delayed auto-advance must not switch immediately'
);

await new Promise(function (resolve) {
	setTimeout(resolve, 15);
});

assert(
	delayed.PlaylistIndex === 0,
	'playlist must remain on current item while delay is pending'
);

await new Promise(function (resolve) {
	setTimeout(resolve, 50);
});

assert(
	delayed.PlaylistIndex === 1,
	'playlist must advance after AutoAdvanceDelay'
);
assert(
	autoComplete && autoComplete.NextIndex === 1,
	'auto-advance completion event must describe target item'
);

var cancelItems = new ArrayInContext();
cancelItems.push(
	{ ID: 'cancel-one', MediaProvider: { Type: 'playlist-test', File: 'cancel-one.mp3' } },
	{ ID: 'cancel-two', MediaProvider: { Type: 'playlist-test', File: 'cancel-two.mp3' } }
);
var cancelPlayer = new Ayle({
	Driver: { Type: 'playlist-test' },
	Player: { MediaMode: 'audio' },
	Playlist: {
		AutoAdvance: true,
		AutoAdvanceDelay: 80,
		Items: cancelItems
	}
});
cancelPlayer.UI = {};
cancelPlayer.Load();

var cancelEvent = null;
cancelPlayer.On('playlistAutoAdvanceCancel', function (data) {
	cancelEvent = data;
});
cancelPlayer.Driver.Emit('ended');
cancelPlayer.Next();

assert(
	cancelEvent && cancelEvent.Reason === 'next',
	'manual Next() must cancel a pending auto-advance countdown'
);

await new Promise(function (resolve) {
	setTimeout(resolve, 100);
});

assert(
	cancelPlayer.PlaylistIndex === 1,
	'cancelled timer must not cause a second transition'
);


var runtimeItems = new ArrayInContext();
runtimeItems.push(
	{
		ID: 'runtime-one',
		MediaProvider: {
			Type: 'playlist-test',
			File: 'runtime-one.mp3'
		}
	},
	{
		ID: 'runtime-two',
		Driver: {
			Type: 'playlist-test',
			Options: {
				Name: 'replacement'
			}
		},
		MediaProvider: {
			Type: 'playlist-test',
			File: 'runtime-two.mp3'
		}
	}
);

var runtime = new Ayle({
	Driver: { Type: 'playlist-test' },
	Player: {
		MediaMode: 'audio',
		Volume: 1,
		Muted: false
	},
	Playlist: {
		Items: runtimeItems
	}
});
runtime.UI = { MediaElement: {} };
runtime.Load();

runtime.State.Volume = 0.37;
runtime.State.Muted = true;
runtime.State.PlaybackRate = 1.25;
runtime.Driver.SetVolume(0.37);
runtime.Driver.SetMuted(true);
runtime.Driver.SetPlaybackRate(1.25);

var runtimeFirstDriver = runtime.Driver;

assert(runtime.Next() === true, 'runtime-state playlist must advance');
assert(runtime.Driver !== runtimeFirstDriver, 'runtime-state test must replace Driver');
assert(runtime.Driver.Volume === 0.37, 'replacement Driver must preserve volume');
assert(runtime.Driver.Muted === true, 'replacement Driver must preserve muted state');
assert(runtime.Driver.PlaybackRate === 1.25, 'replacement Driver must preserve playback rate');
assert(
	runtime.Driver.AttachedVolume === 0.37,
	'replacement Driver must receive volume before UI attachment'
);
assert(
	runtime.Driver.AttachedMuted === true,
	'replacement Driver must receive muted state before UI attachment'
);
assert(
	runtime.Driver.AttachedPlaybackRate === 1.25,
	'replacement Driver must receive playback rate before UI attachment'
);

var reuseItems = new ArrayInContext();
reuseItems.push(
	{
		ID: 'reuse-one',
		MediaProvider: {
			Type: 'playlist-test',
			File: 'reuse-one.mp3'
		}
	},
	{
		ID: 'reuse-two',
		MediaProvider: {
			Type: 'playlist-test',
			File: 'reuse-two.mp3'
		}
	}
);

var reuse = new Ayle({
	Driver: { Type: 'playlist-test' },
	Player: {
		MediaMode: 'audio',
		Volume: 1,
		Muted: false
	},
	Playlist: {
		Items: reuseItems
	}
});
reuse.UI = {};
reuse.Load();
reuse.State.Volume = 0.41;
reuse.State.Muted = true;
reuse.Driver.SetVolume(0.41);
reuse.Driver.SetMuted(true);

var reusedDriver = reuse.Driver;

assert(reuse.Next() === true, 'same-driver playlist must advance');
assert(reuse.Driver === reusedDriver, 'same Driver config must remain reusable');
assert(
	reuse.Driver.Volume === 0.41,
	'loading the next source on a reused Driver must preserve runtime volume'
);
assert(
	reuse.Driver.Muted === true,
	'loading the next source on a reused Driver must preserve runtime mute'
);

assert(
	core.indexOf('Ayle.prototype._beginMediaLoad = function') !== -1 &&
	core.indexOf('this.State.Ready = false;') !== -1 &&
	core.indexOf('this.State.Loading = true;') !== -1,
	'playlist/media initialization must enter Loading before provider resolution'
);

console.log('Ayle playlist core validation passed.');
