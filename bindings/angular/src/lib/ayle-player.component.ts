import '@qybercom/ayle';
import { AyleBootstrap } from '@qybercom/ayle/bootstrap';
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges
} from '@angular/core';
import type {
	AyleAnyAngularEvent,
	AyleEventMap,
	AyleMediaProvider,
	AyleInstance,
	AylePlayerCore,
	AyleUI
} from './types';

@Component({
	selector: 'ayle-player',
	standalone: true,
	template: '',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AylePlayerComponent implements AfterViewInit, OnChanges, OnDestroy {
	constructor (
		private readonly Host: ElementRef<HTMLElement>
	) {}

	@Input() id?: string;
	@Input() preset?: string;
	@Input() file?: string;
	@Input() config?: Record<string, any>;
	@Input() playerConfig?: Record<string, any>;
	@Input() mediaConfig?: Record<string, any>;
	@Input() player?: Record<string, any>;
	@Input() mediaProvider?: Record<string, any>;
	@Input() playlist?: Record<string, any>;
	@Input() driver?: 'mse' | 'html5' | string;
	@Input() driverOptions?: Record<string, any>;
	@Input() localization?: string | Record<string, string> | null;
	@Input() settings?: 'localStorage' | 'sessionStorage' | 'cookie' | '' | null | false;
	@Input() volume?: number;
	@Input() start?: number;
	@Input() muted?: boolean;
	@Input() events?: Record<string, (data: any, instance: AyleInstance) => void>;
	@Input() debug = false;
	@Input() reloadKey?: string | number;

	@Output() ready = new EventEmitter<AyleInstance>();
	@Output() play = new EventEmitter<void>();
	@Output() playing = new EventEmitter<void>();
	@Output() pause = new EventEmitter<void>();
	@Output() ended = new EventEmitter<void>();
	@Output() error = new EventEmitter<Error | MediaError | null>();
	@Output() buffering = new EventEmitter<boolean>();
	@Output() timeUpdate = new EventEmitter<AyleEventMap['timeUpdate']>();
	@Output() volumeChange = new EventEmitter<AyleEventMap['volumeChange']>();
	@Output() sourceChange = new EventEmitter<AyleEventMap['sourceChange']>();
	@Output() toolbarMenuAction = new EventEmitter<AyleEventMap['toolbarMenuAction']>();
	@Output() toolbarMenuSelect = new EventEmitter<AyleEventMap['toolbarMenuSelect']>();
	@Output() ayleEvent = new EventEmitter<AyleAnyAngularEvent>();

	private Bootstrap: AyleBootstrap | null = null;
	private InstanceValue: AyleInstance | null = null;
	private UnbindEvents: (() => void) | null = null;
	private Initialized = false;

	get Element (): HTMLElement {
		return this.Host.nativeElement;
	}

	get Instance (): AyleInstance | null {
		return this.InstanceValue;
	}

	get Player (): AylePlayerCore | null {
		return this.InstanceValue ? this.InstanceValue.Player : null;
	}

	get UI (): AyleUI | null {
		return this.InstanceValue ? this.InstanceValue.UI : null;
	}

	get MediaProvider (): AyleMediaProvider | null {
		return this.InstanceValue ? this.InstanceValue.MediaProvider : null;
	}

	ngAfterViewInit (): void {
		this.Create();
		this.Initialized = true;
	}

	ngOnChanges (changes: SimpleChanges): void {
		if (!this.Initialized)
			return;

		if (Object.keys(changes).length)
			this.Reload();
	}

	ngOnDestroy (): void {
		this.Destroy();
	}

	Reload (): AyleInstance | false {
		this.Destroy();
		return this.Create();
	}

	private BuildConfig (): Record<string, any> {
		var config: Record<string, any>;

		if (this.playerConfig !== undefined || this.mediaConfig !== undefined) {
			config = {
				PlayerConfig: AyleBootstrap.Clone(this.playerConfig || {}),
				MediaConfig: AyleBootstrap.Clone(this.mediaConfig || {})
			};
		}
		else
			config = AyleBootstrap.Clone(this.config || {});

		if (this.preset !== undefined)
			config.Preset = this.preset;

		if (this.player !== undefined)
			config.Player = AyleBootstrap.Merge(config.Player || {}, this.player);

		if (this.playlist !== undefined)
			config.Playlist = AyleBootstrap.Clone(this.playlist);

		if (this.mediaProvider !== undefined)
			config.MediaProvider = AyleBootstrap.Merge(
				config.MediaProvider || {},
				this.mediaProvider
			);

		if (this.file !== undefined) {
			if (!config.MediaProvider)
				config.MediaProvider = {};

			if (config.MediaProvider.Type === undefined)
				config.MediaProvider.Type = 'http';

			config.MediaProvider.File = this.file;
		}

		if (this.driver !== undefined) {
			if (!config.Driver)
				config.Driver = {};

			config.Driver.Type = this.driver;
		}

		if (this.driverOptions !== undefined) {
			if (!config.Driver)
				config.Driver = {};

			config.Driver.Options = AyleBootstrap.Merge(
				config.Driver.Options || {},
				this.driverOptions
			);
		}

		if (this.localization !== undefined) {
			if (!config.Player)
				config.Player = {};

			config.Player.Localization = this.localization;
		}

		return config;
	}

	private SetDataAttribute (
		name: string,
		value: string | number | boolean | null | undefined,
		booleanAttribute = false
	): void {
		const element = this.Host.nativeElement;

		if (value === undefined || value === null || booleanAttribute && value === false) {
			element.removeAttribute(name);
			return;
		}

		if (booleanAttribute) {
			element.setAttribute(name, '');
			return;
		}

		element.setAttribute(name, String(value));
	}

	private ApplyDataAttributes (): void {
		this.SetDataAttribute('data-ayle', this.id);
		this.SetDataAttribute('data-ayle-settings', this.settings);
		this.SetDataAttribute('data-ayle-volume', this.volume);
		this.SetDataAttribute('data-ayle-start', this.start);
		this.SetDataAttribute('data-ayle-muted', this.muted, true);
		this.SetDataAttribute('data-ayle-debug', this.debug, true);
	}

	private Create (): AyleInstance | false {
		const element = this.Host.nativeElement;

		this.Bootstrap = new AyleBootstrap({ AutoInit: false });

		this.ApplyDataAttributes();

		const instance = this.Bootstrap.Init(element, this.BuildConfig());

		this.InstanceValue = instance;
		this.UnbindEvents = this.BindEvents(instance);
		this.ready.emit(instance);

		return instance;
	}

	private Destroy (): void {
		if (this.UnbindEvents) {
			this.UnbindEvents();
			this.UnbindEvents = null;
		}

		if (this.Bootstrap && this.InstanceValue)
			this.Bootstrap.Destroy(this.InstanceValue);

		this.InstanceValue = null;
		this.Bootstrap = null;
	}

	private BindEvents (instance: AyleInstance): () => void {
		const subscriptions: Array<{
			Name: string;
			Handler: (data: any) => void;
		}> = [];

		const bind = <K extends keyof AyleEventMap>(
			name: K,
			output?: EventEmitter<AyleEventMap[K]>
		): void => {
			const handler = (data: AyleEventMap[K]): void => {
				if (output)
					output.emit(data);

				this.ayleEvent.emit({
					Type: name,
					Data: data,
					Player: instance.Player,
					Instance: instance,
					Element: instance.Element
				});
			};

			instance.Player.On(name, handler);
			subscriptions.push({
				Name: name,
				Handler: handler
			});
		};

		bind('play', this.play);
		bind('playing', this.playing);
		bind('pause', this.pause);
		bind('ended', this.ended);
		bind('error', this.error);
		bind('buffering', this.buffering);
		bind('timeUpdate', this.timeUpdate);
		bind('volumeChange', this.volumeChange);
		bind('sourceChange', this.sourceChange);
		bind('toolbarMenuAction', this.toolbarMenuAction);
		bind('toolbarMenuSelect', this.toolbarMenuSelect);

		const known = new Set(subscriptions.map(function (item) {
			return item.Name;
		}));

		const allEvents: Array<keyof AyleEventMap> = [
			'ready', 'play', 'playing', 'pause', 'ended', 'error', 'buffering',
			'progress', 'timeUpdate', 'seeking', 'seeked', 'sourceChange',
			'playlistChange', 'playlistItemChanging', 'playlistItemChange',
			'playlistIndexChange', 'playlistItemError', 'playlistAutoAdvanceStart',
			'playlistAutoAdvanceCancel', 'playlistAutoAdvanceComplete',
			'variantChange', 'variantSwitched', 'variantSwitchError', 'variantsChange',
			'audioTrackChange', 'audioTracksChange', 'subtitleTrackChange',
			'subtitleTracksChange', 'subtitleData', 'subtitleDataChange',
			'subtitleOffsetChange', 'subtitleStyleChange', 'chapterChange',
			'chaptersChange', 'playUnavailable', 'emptyPlay', 'autoplayBlocked',
			'autoplayChange', 'autoplayModeChange', 'autoplaySettingsChange',
			'nativeSubtitlesChange', 'autoNativeSubtitlesInPictureInPictureChange',
			'pictureInPictureChange', 'loadStart', 'metadata', 'durationChange',
			'rateChange', 'volumeChange', 'stateChange', 'mediaModeChange',
			'uiAttach', 'uiDetach', 'uiChange', 'audioVisualChange',
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

		var i = 0;

		while (i < allEvents.length) {
			const name = allEvents[i];

			if (!known.has(name))
				bind(name);

			i++;
		}

		if (this.events) {
			const eventNames = Object.keys(this.events);
			i = 0;

			while (i < eventNames.length) {
				const name = eventNames[i];
				const customHandler = this.events[name];

				if (customHandler && !known.has(name)) {
					const handler = (data: any): void => {
						customHandler(data, instance);

						this.ayleEvent.emit({
							Type: name,
							Data: data,
							Player: instance.Player,
							Instance: instance,
							Element: instance.Element
						});
					};

					instance.Player.On(name, handler);
					subscriptions.push({
						Name: name,
						Handler: handler
					});
				}

				i++;
			}
		}

		return function (): void {
			var i = subscriptions.length;

			while (i--)
				instance.Player.Off(subscriptions[i].Name, subscriptions[i].Handler);
		};
	}
}