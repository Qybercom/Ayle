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
	'uiChange', 'audioVisualChange',
	'artworkSlideshowChange', 'artworkSlideshowStart', 'artworkSlideshowStop',
	'localizationChange', 'fontFamilyChange', 'settingsChange',
	'settingsOrderChange', 'settingsAction', 'integrationSettingsAction',
	'toolbarMenuAction', 'toolbarMenuSelect',
	'shortcutChange', 'shortcutSettingsChange', 'keyboardArrowSeekStepChange',
	'keyboardAngleSeekStepChange', 'keyboardFrameRateFallbackChange',
	'debugChange', 'debugMP4Change', 'debugSettingsChange',
	'debugMP4SettingsChange', 'hintOpen', 'hintClose', 'hintShow', 'hintHide',
	'hintDismiss', 'hintResume', 'hintAction', 'hintMedia', 'hintsChange',
	'hintRenderersChange', 'hintSafeAreaChange', 'integrationChange', 'quizAnswer'
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

function setDataAttribute (element, name, value, booleanAttribute) {
	if (value === undefined || value === null || value === false && booleanAttribute) {
		element.removeAttribute(name);
		return;
	}

	if (booleanAttribute) {
		if (value)
			element.setAttribute(name, '');
		else
			element.removeAttribute(name);
		return;
	}

	element.setAttribute(name, String(value));
}

function applyDataAttributes (element, props) {
	setDataAttribute(element, 'data-ayle', props.id);
	setDataAttribute(element, 'data-ayle-settings', props.settings);
	setDataAttribute(element, 'data-ayle-volume', props.volume);
	setDataAttribute(element, 'data-ayle-start', props.start);
	setDataAttribute(element, 'data-ayle-muted', props.muted, true);
	setDataAttribute(element, 'data-ayle-debug', props.debug, true);
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
	var unbindRef = useRef(null);
	var propsRef = useRef(props);
	propsRef.current = props;

	useImperativeHandle(ref, function () {
		return {
			get Element () { return elementRef.current; },
			get Instance () { return instanceRef.current; },
			get Player () { return instanceRef.current ? instanceRef.current.Player : null; },
			get UI () { return instanceRef.current ? instanceRef.current.UI : null; },
			get HTTP () { return instanceRef.current ? instanceRef.current.HTTP : null; },
			Reload: function () {
				if (!bootstrapRef.current || !instanceRef.current || !elementRef.current)
					return false;

				var currentProps = propsRef.current;
				var oldInstance = instanceRef.current;

				if (unbindRef.current) {
					unbindRef.current();
					unbindRef.current = null;
				}

				if (typeof currentProps.onDestroy === 'function')
					currentProps.onDestroy(oldInstance);

				bootstrapRef.current.Destroy(oldInstance);
				applyDataAttributes(elementRef.current, currentProps);

				var instance = bootstrapRef.current.Init(
					elementRef.current,
					buildConfig(currentProps)
				);

				instanceRef.current = instance;
				unbindRef.current = bindEvents(instance, currentProps);

				if (typeof currentProps.onReady === 'function')
					currentProps.onReady(instance);

				return instance;
			}
		};
	});

	useEffect(function () {
		var element = elementRef.current;
		if (!element) return undefined;

		var bootstrap = new AyleBootstrap({ AutoInit: false });
		bootstrapRef.current = bootstrap;

		applyDataAttributes(element, props);

		var instance = bootstrap.Init(element, buildConfig(props));
		instanceRef.current = instance;
		var unbind = bindEvents(instance, props);
		unbindRef.current = unbind;

		if (typeof props.onReady === 'function')
			props.onReady(instance);

		return function () {
			if (unbindRef.current === unbind) {
				unbindRef.current();
				unbindRef.current = null;
			}

			if (typeof props.onDestroy === 'function')
				props.onDestroy(instance);

			bootstrap.Destroy(instance);

			if (instanceRef.current === instance)
				instanceRef.current = null;

			if (bootstrapRef.current === bootstrap)
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