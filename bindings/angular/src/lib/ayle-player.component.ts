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
	AyleHTTP,
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
	@Input() http?: Record<string, any>;
	@Input() driver?: 'mse' | 'html5' | string;
	@Input() driverOptions?: Record<string, any>;
	@Input() localization?: string | Record<string, string> | null;
	@Input() settings?: 'localStorage' | 'sessionStorage' | 'cookie' | '' | null | false;
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

	get HTTP (): AyleHTTP | null {
		return this.InstanceValue ? this.InstanceValue.HTTP : null;
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

		if (this.file !== undefined)
			config.File = this.file;

		if (this.player !== undefined)
			config.Player = AyleBootstrap.Merge(config.Player || {}, this.player);

		if (this.http !== undefined)
			config.HTTP = AyleBootstrap.Merge(config.HTTP || {}, this.http);

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

	private Create (): AyleInstance | false {
		const element = this.Host.nativeElement;

		this.Bootstrap = new AyleBootstrap({ AutoInit: false });

		if (this.id !== undefined)
			element.setAttribute('data-ayle', String(this.id));

		if (this.settings !== undefined) {
			element.setAttribute(
				'data-ayle-settings',
				this.settings === null || this.settings === false ? '' : String(this.settings)
			);
		}

		if (this.debug)
			element.setAttribute('data-ayle-debug', '');

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

		const known = new Set(subscriptions.map(function (item) {
			return item.Name;
		}));

		const allEvents: Array<keyof AyleEventMap> = [
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
			'hintRenderersChange', 'hintSafeAreaChange', 'integrationChange', 'quizAnswer'
		];

		var i = 0;

		while (i < allEvents.length) {
			const name = allEvents[i];

			if (!known.has(name))
				bind(name);

			i++;
		}

		return function (): void {
			var i = subscriptions.length;

			while (i--)
				instance.Player.Off(subscriptions[i].Name, subscriptions[i].Handler);
		};
	}
}