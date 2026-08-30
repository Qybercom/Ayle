export interface AyleTimeRange {
	Start: number;
	End: number;
}

export interface AyleMediaVariant {
	ID: string;
	URL: string;
	Type: string;
	Width: number;
	Height: number;
	Bitrate: number;
	FrameRate: number;
	Codecs: string;
	Label: string;
	Default: boolean;
	Stream: Record<string, any> | null;
}

export interface AyleSubtitleCue {
	Start?: number;
	End?: number;
	StartTime?: number;
	EndTime?: number;
	Text?: string;
	[key: string]: any;
}

export interface AyleMediaTrack {
	ID: string;
	URL: string;
	Type: string;
	Codecs: string;
	Language: string;
	Label: string;
	Default: boolean;
	Forced: boolean;
	Native: any;
	Cues: AyleSubtitleCue[];
	Stream: Record<string, any> | null;
}

export interface AyleMediaCover {
	ID: string;
	URL: string;
	Type: string;
	Codec: string;
	Width: number;
	Height: number;
	Label: string;
	Default: boolean;
	AttachedPicture: boolean;
	Source: any;
}

export interface AyleMediaChapter {
	ID: string;
	Start: number;
	End: number;
	Title: string;
	Native: any;
}

export interface AyleHintAction {
	Title?: string;
	Label?: string;
	Type?: string;
	URL?: string;
	Target?: string;
	Time?: number;
	ID?: string;
	Name?: string;
	Correct?: boolean;
	[key: string]: any;
}

export interface AyleHint {
	ID?: string;
	Type?: string;
	Position?: string;
	Start?: number;
	End?: number;
	Duration?: number;
	Title?: string;
	Text?: string;
	Label?: string;
	URL?: string;
	Target?: string;
	Image?: string;
	Dismissible?: boolean;
	PauseOnShow?: boolean;
	ResumeOnAction?: boolean;
	HideOnAction?: boolean;
	Repeatable?: boolean;
	Once?: boolean;
	Actions?: AyleHintAction[];
	[key: string]: any;
}

export interface AyleToolbarMenuItem {
	ID?: string;
	Title?: string;
	Label?: string;
	Value?: any;
	Event?: string;
	ClassName?: string;
	Disabled?: boolean;
	CloseMenu?: boolean;
	Action?: (context: any) => any;
	OnClick?: (context: any) => any;
	[key: string]: any;
}

export interface AyleToolbarButton {
	ID?: string;
	Type: 'button';
	Before?: string;
	After?: string;
	Icon?: string;
	Title?: string;
	Label?: string;
	ClassName?: string;
	Visible?: boolean;
	Disabled?: boolean;
	Event?: string;
	Menu?: AyleToolbarMenuItem[] | { Items: AyleToolbarMenuItem[] };
	OnClick?: (context: any) => any;
	OnCreate?: (context: any) => any;
	OnDestroy?: (context: any) => any;
	[key: string]: any;
}

export interface AyleToolbarConfig {
	Layout?: 'inline' | 'timeline-top' | 'auto';
	Items?: Array<string | AyleToolbarButton>;
	[key: string]: any;
}

export interface AyleUIConfig {
	Header?: string[];
	Track?: string[];
	Channel?: string[];
	Overlay?: string[];
	Toolbar?: AyleToolbarConfig;
	[key: string]: any;
}

export interface AyleTimelineRange {
	ID?: string;
	Start: number;
	End?: number;
	Duration?: number;
	Label?: string;
	ClassName?: string;
	[key: string]: any;
}

export interface AyleIntegrationSetting {
	ID?: string;
	Title?: string;
	Label?: string;
	Value?: any;
	Event?: string;
	Disabled?: boolean;
	CloseMenu?: boolean;
	Items?: AyleIntegrationSetting[];
	Action?: (...args: any[]) => any;
	[key: string]: any;
}

export interface AyleIntegration {
	Channel?: Record<string, any>;
	Hints?: AyleHint[];
	Settings?: AyleIntegrationSetting[];
	Toolbar?: AyleToolbarButton[];
	TimelineRanges?: AyleTimelineRange[];
	MediaSession?: Record<string, any>;
	Data?: Record<string, any>;
	[key: string]: any;
}

export interface AyleSource {
	ID: string;
	URL: string;
	Type: string;
	Codecs: string;
	Title: string;
	Artist: string;
	Album: string;
	Duration: number;
	Variants: AyleMediaVariant[];
	AudioTracks: AyleMediaTrack[];
	SubtitleTracks: AyleMediaTrack[];
	Covers: AyleMediaCover[];
	Chapters: AyleMediaChapter[];
	Hints: AyleHint[];
	[key: string]: any;
}

export interface AyleState {
	Source: AyleSource | null;
	Ready: boolean;
	Loading: boolean;
	Playing: boolean;
	Buffering: boolean;
	Seeking: boolean;
	Ended: boolean;
	Error: Error | MediaError | null;
	Position: number;
	Duration: number;
	Buffered: AyleTimeRange[];
	Seekable: AyleTimeRange[];
	Variants: AyleMediaVariant[];
	Variant: AyleMediaVariant | null;
	AudioTracks: AyleMediaTrack[];
	AudioTrack: AyleMediaTrack | null;
	SubtitleTracks: AyleMediaTrack[];
	SubtitleTrack: AyleMediaTrack | null;
	Chapters: AyleMediaChapter[];
	Chapter: AyleMediaChapter | null;
	ActiveHints: AyleHint[];
	Volume: number;
	Muted: boolean;
	PlaybackRate: number;
	PictureInPicture: boolean;
	MediaMode: string;
	[key: string]: any;
}

export interface AylePlayerCore {
	State: AyleState;
	Options: Record<string, any>;
	Element: HTMLElement | null;
	MediaElement: HTMLMediaElement | null;
	Driver: AyleDriver;
	MediaProvider: AyleMediaProvider | null;
	MediaProviderOptions: Record<string, any> | null;
	UI: AyleUI | null;
	Load(): any;
	Load(callback: (error?: Error | null, source?: AyleSource | null, metadata?: Record<string, any> | null) => void): any;
	Load(source: AyleSource): boolean;
	LoadMedia(callback?: (error?: Error | null, source?: AyleSource | null, metadata?: Record<string, any> | null) => void): any;
	SetDriver(driver: AyleDriver): this;
	SetMediaProvider(provider: AyleMediaProvider | Record<string, any> | null): this;
	Destroy(): this;
	Play(): boolean | Promise<any>;
	Pause(): any;
	Seek(position: number): boolean;
	SetVolume(volume: number): any;
	SetMuted(muted: boolean): any;
	SetPlaybackRate(rate: number): any;
	SetVariant(variant: AyleMediaVariant): boolean;
	SetVariantByID(id: string): boolean;
	SetAudioTrack(track: AyleMediaTrack): boolean;
	SetSubtitleTrack(track: AyleMediaTrack | null): boolean;
	SetSubtitleTrackByID(id: string | null): boolean;
	On<K extends keyof AyleEventMap>(
		name: K,
		callback: (data: AyleEventMap[K]) => void
	): this;
	On(name: string, callback: (data: any) => void): this;
	Off<K extends keyof AyleEventMap>(
		name: K,
		callback: (data: AyleEventMap[K]) => void
	): this;
	Off(name: string, callback: (data: any) => void): this;
	Once<K extends keyof AyleEventMap>(
		name: K,
		callback: (data: AyleEventMap[K]) => void
	): this;
	Emit<K extends keyof AyleEventMap>(name: K, data?: AyleEventMap[K]): this;
	Emit(name: string, data?: any): this;
	[key: string]: any;
}

export interface AyleUI {
	Element: HTMLElement;
	Player: AylePlayerCore;
	Destroy(): this;
	[key: string]: any;
}

export interface AyleMediaProvider {
	Player: AylePlayerCore;
	Options: Record<string, any>;
	Source?: AyleSource | null;
	Metadata?: Record<string, any> | null;
	Load(callback?: (error?: Error | null, source?: AyleSource | null, metadata?: Record<string, any> | null) => void): any;
	Destroy?(): any;
	[key: string]: any;
}

export interface AyleHTTPMediaProvider extends AyleMediaProvider {
	SupportedCodecs?: string[];
	[key: string]: any;
}

export interface AyleDriver {
	Element?: HTMLMediaElement;
	UI?: AyleUI | null;
	Options?: Record<string, any>;
	SetUI?(ui: AyleUI): any;
	SetOptions?(options: Record<string, any>): any;
	Destroy?(): any;
	[key: string]: any;
}

export interface AyleInstance {
	ID: string;
	Element: HTMLElement;
	Video: HTMLMediaElement;
	Driver: AyleDriver;
	Player: AylePlayerCore;
	UI: AyleUI;
	MediaProvider: AyleMediaProvider | null;
	MediaProviderOptions: Record<string, any> | null;
	Config: Record<string, any>;
	Source?: AyleSource | null;
	Metadata?: Record<string, any> | null;
	Error?: Error | null;
	[key: string]: any;
}

export interface AyleMetadataEvent {
	Duration: number;
	Width: number;
	Height: number;
	[key: string]: any;
}

export interface AyleTimeUpdateEvent {
	Position: number;
	Duration: number;
}

export interface AyleProgressEvent {
	Buffered: AyleTimeRange[];
	Seekable: AyleTimeRange[];
	Duration?: number;
	VideoBuffered?: AyleTimeRange[];
	AudioBuffered?: AyleTimeRange[];
	MediaBuffered?: AyleTimeRange[];
}

export interface AyleVolumeChangeEvent {
	Volume: number;
	Muted: boolean;
}

export interface AyleSubtitleDataEvent {
	ID: string;
	Cues: AyleSubtitleCue[];
	Track: AyleMediaTrack | null;
}

export interface AyleVariantSwitchErrorEvent {
	Variant: AyleMediaVariant;
	Error: Error | MediaError | null;
}

export interface AylePlayUnavailableEvent {
	Reason: string;
	State: AyleState;
}

export interface AyleArtworkSlideshowChangeEvent {
	Index: number;
	Cover: AyleMediaCover;
}

export interface AyleArtworkSlideshowStartEvent {
	Covers: AyleMediaCover[];
}

export interface AyleArtworkSlideshowStopEvent {
	Reason: string;
}

export interface AyleHintActionEvent {
	Hint: AyleHint;
	Action: AyleHintAction;
	Event: Event | null;
	Result: any;
}

export interface AyleHintMediaEvent {
	Hint: AyleHint;
	Action: AyleHintAction;
}

export interface AyleHintRendererChangeEvent {
	Type: string;
	Renderer: (...args: any[]) => any;
}

export interface AyleHintResumeEvent {
	Hint: AyleHint;
	Action: AyleHintAction;
	Event: Event | null;
}

export interface AyleQuizAnswerEvent {
	Hint: AyleHint;
	Action: AyleHintAction;
	Option: AyleHintAction;
	Event: Event | null;
	UI: AyleUI;
}

export interface AyleSettingsActionEvent {
	Item: AyleIntegrationSetting;
	Event: Event | null;
	UI: AyleUI;
}

export interface AyleIntegrationSettingsActionEvent extends AyleSettingsActionEvent {
	Result: any;
}

export interface AyleToolbarMenuActionEvent {
	Player: AylePlayerCore;
	UI: AyleUI;
	ToolbarItem: AyleToolbarButton;
	Item: AyleToolbarMenuItem;
	Event: Event | null;
}

export interface AyleToolbarMenuSelectEvent extends AyleToolbarMenuActionEvent {
	Result: any;
}

export interface AyleSettingsChangeEvent {
	Name: string;
	Value: any;
	Item?: AyleIntegrationSetting;
	Event?: Event | null;
	UI?: AyleUI;
	Result?: any;
}

export interface AyleShortcutChangeEvent {
	Name: string;
	Value: boolean;
}

export interface AyleHintSafeArea {
	Top?: number;
	Right?: number;
	Bottom?: number;
	Left?: number;
	[key: string]: any;
}

export interface AyleEventMap {
	ready: void;
	play: void;
	playing: void;
	pause: void;
	ended: void;
	error: Error | MediaError | null;
	buffering: boolean;
	progress: AyleProgressEvent;
	timeUpdate: AyleTimeUpdateEvent;
	seeking: boolean;
	seeked: void;
	sourceChange: AyleSource;
	variantChange: AyleMediaVariant;
	variantSwitched: AyleMediaVariant;
	variantSwitchError: AyleVariantSwitchErrorEvent;
	variantsChange: AyleMediaVariant[];
	audioTrackChange: AyleMediaTrack;
	audioTracksChange: AyleMediaTrack[];
	subtitleTrackChange: AyleMediaTrack | null;
	subtitleTracksChange: AyleMediaTrack[];
	subtitleData: AyleSubtitleDataEvent;
	subtitleDataChange: AyleSubtitleDataEvent;
	subtitleOffsetChange: number;
	subtitleStyleChange: Record<string, any>;
	chapterChange: AyleMediaChapter | null;
	chaptersChange: AyleMediaChapter[];
	playUnavailable: AylePlayUnavailableEvent;
	emptyPlay: void;
	autoplayBlocked: Error | DOMException;
	autoplayChange: boolean;
	autoplayModeChange: string;
	autoplaySettingsChange: AyleSettingsChangeEvent;
	nativeSubtitlesChange: boolean;
	autoNativeSubtitlesInPictureInPictureChange: boolean;
	pictureInPictureChange: boolean;
	loadStart: void;
	metadata: AyleMetadataEvent;
	durationChange: number;
	rateChange: number;
	volumeChange: AyleVolumeChangeEvent;
	stateChange: AyleState;
	mediaModeChange: string;
	uiChange: Record<string, any>;
	audioVisualChange: Record<string, any>;
	artworkSlideshowChange: AyleArtworkSlideshowChangeEvent;
	artworkSlideshowStart: AyleArtworkSlideshowStartEvent;
	artworkSlideshowStop: AyleArtworkSlideshowStopEvent;
	localizationChange: Record<string, string> | null;
	fontFamilyChange: string;
	settingsChange: AyleSettingsChangeEvent;
	settingsOrderChange: string[];
	settingsAction: AyleSettingsActionEvent;
	integrationSettingsAction: AyleIntegrationSettingsActionEvent;
	toolbarMenuAction: AyleToolbarMenuActionEvent;
	toolbarMenuSelect: AyleToolbarMenuSelectEvent;
	shortcutChange: AyleShortcutChangeEvent;
	shortcutSettingsChange: AyleSettingsChangeEvent;
	keyboardArrowSeekStepChange: number;
	keyboardAngleSeekStepChange: number;
	keyboardFrameRateFallbackChange: number;
	debugChange: boolean;
	debugMP4Change: boolean;
	debugSettingsChange: AyleSettingsChangeEvent;
	debugMP4SettingsChange: AyleSettingsChangeEvent;
	hintOpen: AyleHint;
	hintClose: AyleHint;
	hintShow: AyleHint;
	hintHide: AyleHint;
	hintDismiss: AyleHint;
	hintResume: AyleHintResumeEvent;
	hintAction: AyleHintActionEvent;
	hintMedia: AyleHintMediaEvent;
	hintsChange: AyleHint[];
	hintRenderersChange: AyleHintRendererChangeEvent;
	hintSafeAreaChange: AyleHintSafeArea;
	integrationChange: AyleIntegration;
	quizAnswer: AyleQuizAnswerEvent;
}

export type AyleKnownEventName = keyof AyleEventMap;

export interface AyleAngularEvent<K extends AyleKnownEventName = AyleKnownEventName> {
	Type: K;
	Data: AyleEventMap[K];
	Player: AylePlayerCore;
	Instance: AyleInstance;
	Element: HTMLElement;
}

export interface AyleDynamicAngularEvent {
	Type: string;
	Data: any;
	Player: AylePlayerCore;
	Instance: AyleInstance;
	Element: HTMLElement;
}

export type AyleAnyAngularEvent = AyleAngularEvent | AyleDynamicAngularEvent;