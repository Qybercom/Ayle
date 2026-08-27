import '@qybercom/ayle';
import { AyleBootstrap } from '@qybercom/ayle/bootstrap';
import {
	createElement,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef
} from 'react';

export const AYLE_EVENTS = [
	'ready', 'play', 'playing', 'pause', 'ended', 'error', 'buffering',
	'progress', 'timeUpdate', 'seeking', 'seeked', 'sourceChange',
	'variantChange', 'variantSwitched', 'variantSwitchError', 'variantsChange',
	'audioTrackChange', 'audioTracksChange', 'subtitleTrackChange',
	'subtitleTracksChange', 'subtitleData', 'subtitleDataChange',
	'subtitleOffsetChange', 'subtitleStyleChange', 'chapterChange',
	'chaptersChange', 'playUnavailable', 'emptyPlay', 'autoplayBlocked',
	'autoplayChange', 'autoplayModeChange', 'autoplaySettingsChange',
	'nativeSubtitlesChange', 'autoNativeSubtitlesInPictureInPictureChange',
	'pictureInPictureChange', 'loadStart', 'metadata', 'durationChange',
	'rateChange', 'volumeChange', 'stateChange', 'mediaModeChange',
	'minimalUIChange', 'uiModeChange', 'audioVisualChange',
	'artworkSlideshowChange', 'artworkSlideshowStart', 'artworkSlideshowStop',
	'localizationChange', 'fontFamilyChange', 'settingsChange',
	'settingsOrderChange', 'settingsAction', 'integrationSettingsAction',
	'shortcutChange', 'shortcutSettingsChange', 'keyboardArrowSeekStepChange',
	'keyboardAngleSeekStepChange', 'keyboardFrameRateFallbackChange',
	'debugChange', 'debugMP4Change', 'debugSettingsChange',
	'debugMP4SettingsChange', 'hintOpen', 'hintClose', 'hintShow', 'hintHide',
	'hintDismiss', 'hintResume', 'hintAction', 'hintMedia', 'hintsChange',
	'hintRenderersChange', 'hintSafeAreaChange', 'quizAnswer'
];

function cloneConfig (value) {
	return AyleBootstrap.Clone(value || {});
}

function buildConfig (props) {
	var config;

	if (props.playerConfig !== undefined || props.mediaConfig !== undefined) {
		config = {
			PlayerConfig: cloneConfig(props.playerConfig),
			MediaConfig: cloneConfig(props.mediaConfig)
		};
	}
	else
		config = cloneConfig(props.config);

	if (props.preset !== undefined) config.Preset = props.preset;
	if (props.file !== undefined) config.File = props.file;

	if (props.player !== undefined)
		config.Player = AyleBootstrap.Merge(config.Player || {}, props.player);

	if (props.http !== undefined)
		config.HTTP = AyleBootstrap.Merge(config.HTTP || {}, props.http);

	if (props.driver !== undefined) {
		if (!config.Driver) config.Driver = {};
		config.Driver.Type = props.driver;
	}

	if (props.driverOptions !== undefined) {
		if (!config.Driver) config.Driver = {};
		config.Driver.Options = AyleBootstrap.Merge(
			config.Driver.Options || {},
			props.driverOptions
		);
	}

	if (props.localization !== undefined) {
		if (!config.Player) config.Player = {};
		config.Player.Localization = props.localization;
	}

	return config;
}

function bindEvents (instance, props) {
	var player = instance.Player;
	var subscriptions = [];
	var handlers = props.events || {};
	var names = AYLE_EVENTS.slice(0);
	var name;

	for (name in handlers) {
		if (Object.prototype.hasOwnProperty.call(handlers, name) && names.indexOf(name) === -1)
			names.push(name);
	}

	var i = 0;

	while (i < names.length) {
		name = names[i];

		(function (eventName) {
			var handler = function (data) {
				if (typeof props.onEvent === 'function') {
					props.onEvent({
						Type: eventName,
						Data: data,
						Player: instance.Player,
						Instance: instance,
						Element: instance.Element
					});
				}

				if (typeof handlers[eventName] === 'function')
					handlers[eventName](data, instance);
			};

			player.On(eventName, handler);
			subscriptions.push({ Name: eventName, Handler: handler });
		})(name);

		i++;
	}

	return function () {
		var i = subscriptions.length;

		while (i--)
			player.Off(subscriptions[i].Name, subscriptions[i].Handler);
	};
}

export const AylePlayer = forwardRef(function AylePlayer (props, ref) {
	var elementRef = useRef(null);
	var instanceRef = useRef(null);
	var bootstrapRef = useRef(null);

	useImperativeHandle(ref, function () {
		return {
			get Element () { return elementRef.current; },
			get Instance () { return instanceRef.current; },
			get Player () { return instanceRef.current ? instanceRef.current.Player : null; },
			get UI () { return instanceRef.current ? instanceRef.current.UI : null; },
			get HTTP () { return instanceRef.current ? instanceRef.current.HTTP : null; },
			Reload: function () {
				if (!bootstrapRef.current || !instanceRef.current)
					return false;

				bootstrapRef.current.Destroy(instanceRef.current);
				instanceRef.current = bootstrapRef.current.Init(
					elementRef.current,
					buildConfig(props)
				);

				return instanceRef.current;
			}
		};
	});

	useEffect(function () {
		var element = elementRef.current;
		if (!element) return undefined;

		var bootstrap = new AyleBootstrap({ AutoInit: false });
		bootstrapRef.current = bootstrap;

		if (props.settings !== undefined) {
			element.setAttribute(
				'data-ayle-settings',
				props.settings === null || props.settings === false ? '' : String(props.settings)
			);
		}

		if (props.debug)
			element.setAttribute('data-ayle-debug', '');

		var instance = bootstrap.Init(element, buildConfig(props));
		instanceRef.current = instance;
		var unbind = bindEvents(instance, props);

		if (typeof props.onReady === 'function')
			props.onReady(instance);

		return function () {
			unbind();

			if (typeof props.onDestroy === 'function')
				props.onDestroy(instance);

			bootstrap.Destroy(instance);
			instanceRef.current = null;
			bootstrapRef.current = null;
		};
	}, [props.reloadKey]);

	var domProps = {
		ref: elementRef,
		className: props.className,
		style: props.style,
		'data-ayle-react': ''
	};

	if (props.id !== undefined)
		domProps['data-ayle'] = String(props.id);

	return createElement('div', domProps);
});

AylePlayer.displayName = 'AylePlayer';