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
	AyleConfig,
	AyleDynamicEventHandler,
	AyleDynamicPlayerEventCallback,
	AyleEventHandlers,
	AyleEventMap,
	AyleInstance,
	AyleMediaProvider,
	AylePlayer,
	AyleUI
} from '@qybercom/ayle';
import type {
	AyleAnyAngularEvent
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
	@Input() config?: AyleConfig;
	@Input() settings?: 'localStorage' | 'sessionStorage' | 'cookie' | '' | null | false;
	@Input() events?: AyleEventHandlers;
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

	get Player (): AylePlayer | null {
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

	private BuildConfig (): AyleConfig {
		return AyleBootstrap.Clone(this.config || {});
	}

	private SetDataAttribute (
		name: string,
		value: string | number | boolean | null | undefined
	): void {
		const element = this.Host.nativeElement;

		if (value === undefined || value === null || value === false) {
			element.removeAttribute(name);
			return;
		}

		element.setAttribute(name, String(value));
	}

	private ApplyDataAttributes (): void {
		this.SetDataAttribute('data-ayle', this.id);
		this.SetDataAttribute('data-ayle-settings', this.settings);
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
			Handler: AyleDynamicPlayerEventCallback;
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

				const configuredHandler = this.events && this.events[name] as
				AyleDynamicEventHandler | undefined;

				if (configuredHandler)
					configuredHandler(data, instance);
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

			if (!known.has(name)) {
				bind(name);
				known.add(name);
			}

			i++;
		}

		if (this.events) {
			const eventNames = Object.keys(this.events);
			i = 0;

			while (i < eventNames.length) {
				const name = eventNames[i];
				const customHandler = this.events[name];

				if (customHandler && !known.has(name)) {
					const handler = (data: unknown): void => {
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