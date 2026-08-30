export type AyleUnknownObject = {
	[key: string]: unknown;
};

export type AyleMediaMode = 'auto' | 'video' | 'audio';
export type AyleAutoplayMode = 'audible' | 'muted';
export type AyleToolbarLayout = 'inline' | 'timeline-top' | 'auto';
export type AyleAudioVisualType = 'auto' | 'none' | 'cover';
export type AyleArtworkFit = 'cover' | 'contain';
export type AyleStreamMode = 'range' | 'segments' | 'time';
export type AyleSettingsStorage =
	'localStorage' |
	'sessionStorage' |
	'cookie' |
	'' |
	null |
	false;

export interface AyleTimeRange {
	Start: number;
	End: number;
}

export interface AyleStreamDescriptor {
	URL?: string;
	RangeStart?: number;
	RangeEnd?: number;
	Start?: number;
	End?: number;
}

export interface AyleCodecCandidateGroup {
	Type: string;
	Codecs: string[];
}

export interface AyleStreamOptions {
	Mode?: AyleStreamMode;
	ChunkSize?: number;
	BufferAhead?: number;
	BufferBehind?: number;
	SkipInit?: boolean;
	Init?: AyleStreamDescriptor;
	InitValue?: unknown;
	Segments?: AyleStreamDescriptor[];
	TimeURL?: string;
	TimeParameter?: string;
	TimePrecision?: number;
	TimeStartHeader?: string;
	TimeEndHeader?: string;
	TimeDurationHeader?: string;
	TimeEOFHeader?: string;
	AlignTimestamps?: boolean;
	MaxNoProgressRequests?: number;
	UseBufferedEndForNextTime?: boolean;
	GapTolerance?: number;
	MaxGapRetries?: number;
	TimeEpsilon?: number;
	Codec?: string;
	CodecHeader?: string;
	CodecListHeader?: string;
	CodecList?: string[];
}

export interface AyleDriverConfig<TOptions = AyleUnknownObject> {
	Type?: 'html5' | 'mse' | (string & {});
	Options?: TOptions;
}

export interface AyleHTTPMediaProviderConfig {
	Type?: 'http';
	File?: string;
	MetadataURL?: string;
	TrackURL?: string;
	VideoURL?: string;
	AudioURL?: string;
	SubtitleURL?: string;
	ArtworkURL?: string;
	CoverURL?: string;
	CodecHeader?: string;
	CodecListHeader?: string;
	CodecCandidates?: AyleCodecCandidateGroup[] | string[] | null;
	RequestHeaders?: {
		[name: string]: string;
	};
	Stream?: AyleStreamOptions;
	VideoType?: string;
	AudioType?: string;
	SubtitleType?: string;
}

export interface AyleCustomMediaProviderConfig {
	Type: string & {};
	[key: string]: unknown;
}

export type AyleMediaProviderConfig =
	AyleHTTPMediaProviderConfig |
	AyleCustomMediaProviderConfig;

export interface AyleSubtitleStyle {
	Color?: string;
	Background?: string;
	FontFamily?: string;
	FontSize?: string;
	FontWeight?: string | number;
	LineHeight?: string | number;
	TextShadow?: string;
	Padding?: string;
	BorderRadius?: string;
	LetterSpacing?: string;
	Bottom?: string;
	MaxWidth?: string;
}

export interface AyleToolbarMenuContext {
	Player: AylePlayer;
	UI: AyleUI;
	ToolbarItem?: AyleToolbarButton;
	Item: AyleToolbarMenuItem;
	Event: Event | null;
}

export interface AyleToolbarButtonContext {
	Player: AylePlayer;
	UI: AyleUI;
	Element: HTMLElement;
	Item: AyleToolbarButton;
	Event?: Event | null;
}

export interface AyleToolbarMenuItem {
	ID?: string;
	Title?: string;
	Label?: string;
	Value?: unknown;
	Event?: string;
	ClassName?: string;
	Disabled?: boolean;
	CloseMenu?: boolean;
	Action?: ((context: AyleToolbarMenuContext) => unknown) | null;
	OnClick?: ((context: AyleToolbarMenuContext) => unknown) | null;
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
	Menu?: Array<AyleToolbarMenuItem | ''> | {
		Items: Array<AyleToolbarMenuItem | ''>;
	};
	OnClick?: ((context: AyleToolbarButtonContext) => unknown) | null;
	OnCreate?: ((context: AyleToolbarButtonContext) => unknown) | null;
	OnDestroy?: ((context: AyleToolbarButtonContext) => unknown) | null;
}

export type AyleToolbarItem =
	'previous' |
	'play' |
	'next' |
	'timeline' |
	'time' |
	'volume' |
	'chapters' |
	'quality' |
	'settings' |
	'pip' |
	'fullscreen' |
	'' |
	(string & {}) |
	AyleToolbarButton;

export interface AyleToolbarConfig {
	Layout?: AyleToolbarLayout;
	Items?: AyleToolbarItem[];
}

export interface AyleUIConfig {
	Header?: string[];
	Track?: string[];
	Channel?: string[];
	Overlay?: string[];
	Toolbar?: AyleToolbarConfig;
}

export interface AyleAudioVisualConfig {
	Type?: AyleAudioVisualType;
	Image?: string;
	Subtitles?: boolean;
	MinHeight?: number;
}

export interface AyleArtworkSlideshowConfig {
	Enabled?: boolean;
	HideControls?: boolean;
	Interval?: number;
	FadeDuration?: number;
	Fit?: AyleArtworkFit;
}

export interface AyleShortcutConfig {
	PlayPause?: boolean;
	SeekArrows?: boolean;
	SeekAngle?: boolean;
	Volume?: boolean;
	Mute?: boolean;
	Subtitles?: boolean;
	Fullscreen?: boolean;
	PictureInPicture?: boolean;
}

export interface AyleTimelineRange {
	ID?: string;
	Start: number;
	End?: number;
	Duration?: number;
	Label?: string;
	ClassName?: string;
}


export interface AyleMediaSessionArtwork {
	src: string;
	sizes?: string;
	type?: string;
}

export interface AyleMediaSessionMetadata {
	Title?: string;
	Artist?: string;
	Album?: string;
	Artwork?: AyleMediaSessionArtwork[] | null;
}

export interface AyleMediaSessionConfig {
	Enabled?: boolean;
	Metadata?: AyleMediaSessionMetadata;
}

export interface AyleHintOffset {
	X?: number;
	Y?: number;
}

export interface AyleHintAction {
	Type?: string;
	Title?: string;
	Label?: string;
	Name?: string;
	URL?: string;
	Target?: string;
	Time?: number;
	ID?: string;
	Source?: AyleSource | AyleSourceConfig | null;
	Callback?: ((
		action: AyleHintAction,
		hint: AyleHint,
		player: AylePlayer,
		event: Event | null
	) => unknown) | null;
	Correct?: boolean;
}

export interface AyleHint {
	ID?: string;
	Type?: string;
	Position?: string;
	Start?: number;
	End?: number;
	Duration?: number;
	Offset?: AyleHintOffset;
	Title?: string;
	Text?: string;
	Label?: string;
	URL?: string;
	Target?: string;
	Image?: string;
	Action?: AyleHintAction | null;
	Actions?: AyleHintAction[];
	Dismissible?: boolean;
	Once?: boolean;
	Repeatable?: boolean;
	PauseOnShow?: boolean;
	ResumeOnAction?: boolean;
	HideOnAction?: boolean;
	ShowTitle?: boolean;
	ShowDescription?: boolean;
	ResultMode?: 'off' | 'instant' | 'result';
	ResultDuration?: number;
}

export interface AyleIntegrationChannelProfile {
	Name?: string;
	URL?: string;
	Target?: string;
}

export interface AyleIntegrationChannel {
	Name?: string;
	Avatar?: string;
	URL?: string;
	Action?: ((context: unknown) => unknown) | null;
	Profile?: AyleIntegrationChannelProfile | null;
}

export interface AyleIntegrationSetting {
	ID?: string;
	Title?: string;
	Label?: string;
	Value?: unknown;
	Event?: string;
	ClassName?: string;
	Disabled?: boolean;
	CloseMenu?: boolean;
	Items?: AyleIntegrationSetting[];
	Action?: ((context: unknown) => unknown) | null;
	OnSelect?: ((context: unknown) => unknown) | null;
}

export interface AyleIntegrationMediaSession {
	Metadata?: AyleMediaSessionMetadata;
}

export interface AyleIntegrationConfig<TData = unknown> {
	Channel?: AyleIntegrationChannel | null;
	Hints?: AyleHint[];
	Settings?: AyleIntegrationSetting[];
	Toolbar?: AyleToolbarButton[];
	TimelineRanges?: AyleTimelineRange[];
	MediaSession?: AyleIntegrationMediaSession | null;
	Data?: TData;
}

export interface AyleHintSafeArea {
	Top?: number;
	Right?: number;
	Bottom?: number;
	Left?: number;
}

export type AyleLocalization = string | {
	[key: string]: string;
};

export interface AylePlayerOptions<TIntegrationData = unknown> {
	AutoSelectFirstSubtitleTrack?: boolean;
	AutoPlay?: boolean;
	AutoPlayMode?: AyleAutoplayMode;
	Volume?: number;
	Muted?: boolean;
	Start?: number;
	NativeSubtitles?: boolean;
	SubtitleOffset?: number;
	AutoNativeSubtitlesInPictureInPicture?: boolean;
	SubtitleStyle?: AyleSubtitleStyle;
	LoadingDelay?: number;
	ForceShowQualityList?: boolean;
	ForceShowChaptersList?: boolean;
	ForceShowPreviousButton?: boolean;
	ForceShowNextButton?: boolean;
	ShowCenterPlayButton?: boolean;
	AutoFocus?: boolean;
	MediaMode?: AyleMediaMode;
	Preset?: string;
	UI?: AyleUIConfig;
	AudioVisual?: AyleAudioVisualConfig;
	ArtworkSlideshow?: AyleArtworkSlideshowConfig;
	KeyboardArrowSeekStep?: number;
	KeyboardAngleSeekStep?: number | 'frame';
	KeyboardFrameRateFallback?: number;
	Shortcuts?: AyleShortcutConfig;
	MediaSession?: AyleMediaSessionConfig | false;
	SettingsOrder?: string[];
	FontFamily?: string;
	Debug?: boolean;
	DebugMP4?: boolean;
	Localization?: AyleLocalization | null;
	HintSafeArea?: number | AyleHintSafeArea;
	Integration?: AyleIntegrationConfig<TIntegrationData>;
}

export interface AylePlaylistItem<TIntegrationData = unknown> {
	ID?: string | number;
	Driver?: AyleDriverConfig;
	MediaProvider?: AyleMediaProviderConfig;
	Player?: AylePlayerOptions<TIntegrationData>;
}

export interface AylePlaylistConfig<TIntegrationData = unknown> {
	AutoAdvance?: boolean;
	AutoAdvanceDelay?: number;
	Loop?: boolean;
	StartIndex?: number;
	Items: AylePlaylistItem<TIntegrationData>[];
}

export type AylePlaylist<TIntegrationData = unknown> =
	AylePlaylistConfig<TIntegrationData>;

export interface AyleConfig<TIntegrationData = unknown> {
	ID?: string;
	Driver?: AyleDriverConfig;
	MediaProvider?: AyleMediaProviderConfig;
	Playlist?: AylePlaylistConfig<TIntegrationData> | AylePlaylistItem<TIntegrationData>[];
	Player?: AylePlayerOptions<TIntegrationData>;
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
	Stream: AyleStreamOptions | null;
}

export interface AyleSubtitleCue {
	Start?: number;
	End?: number;
	StartTime?: number;
	EndTime?: number;
	Text?: string;
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
	Native: TextTrack | unknown;
	Cues: AyleSubtitleCue[];
	Stream: AyleStreamOptions | null;
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
	Source: unknown;
}

export interface AyleMediaChapter {
	ID: string;
	Start: number;
	End: number;
	Title: string;
	Native: unknown;
}

export interface AyleSourceConfig {
	ID?: string;
	URL?: string;
	Type?: string;
	Codecs?: string;
	Title?: string;
	Artist?: string;
	Album?: string;
	Duration?: number;
	Live?: boolean;
	MediaMode?: AyleMediaMode;
	Cover?: string;
	Covers?: AyleMediaCover[];
	Stream?: AyleStreamOptions | null;
	Variants?: AyleMediaVariant[];
	AudioTracks?: AyleMediaTrack[];
	SubtitleTracks?: AyleMediaTrack[];
	Chapters?: AyleMediaChapter[];
	Hints?: AyleHint[];
}

export class AyleSource {
	constructor(options?: AyleSourceConfig);
	ID: string;
	URL: string;
	Type: string;
	Codecs: string;
	Title: string;
	Artist: string;
	Album: string;
	Duration: number;
	Live: boolean;
	MediaMode: AyleMediaMode;
	Cover: string;
	Covers: AyleMediaCover[];
	Stream: AyleStreamOptions | null;
	Variants: AyleMediaVariant[];
	AudioTracks: AyleMediaTrack[];
	SubtitleTracks: AyleMediaTrack[];
	Chapters: AyleMediaChapter[];
}

export interface AylePlaylistItemChangeEvent {
	PreviousIndex: number;
	Index: number;
	PreviousItem: AylePlaylistItem | null;
	Item: AylePlaylistItem;
	Reason: 'initial' | 'reload' | 'next' | 'previous' | 'index' | 'id' | 'ended' | (string & {});
}

export interface AylePlaylistItemErrorEvent {
	Index: number;
	Item: AylePlaylistItem;
	Error: Error | MediaError | null;
}

export interface AylePlaylistAutoAdvanceEvent {
	Index: number;
	Item: AylePlaylistItem | null;
	NextIndex: number;
	NextItem: AylePlaylistItem;
	Delay: number;
	StartedAt?: number;
	Reason?: string;
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
	MediaMode: AyleMediaMode;
	PlaylistIndex: number;
	PlaylistItem: AylePlaylistItem | null;
	HasPrevious: boolean;
	HasNext: boolean;
}

export interface AyleMetadataEvent {
	Duration: number;
	Width: number;
	Height: number;
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
	Result: unknown;
}

export interface AyleHintMediaEvent {
	Hint: AyleHint;
	Action: AyleHintAction;
}

export interface AyleHintRendererChangeEvent {
	Type: string;
	Renderer: (...args: unknown[]) => unknown;
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
	Result: unknown;
}

export interface AyleToolbarMenuActionEvent {
	Player: AylePlayer;
	UI: AyleUI;
	ToolbarItem: AyleToolbarButton;
	Item: AyleToolbarMenuItem;
	Event: Event | null;
}

export interface AyleToolbarMenuSelectEvent extends AyleToolbarMenuActionEvent {
	Result: unknown;
}

export interface AyleSettingsChangeEvent {
	Name: string;
	Value: unknown;
	Item?: AyleIntegrationSetting;
	Event?: Event | null;
	UI?: AyleUI;
	Result?: unknown;
}

export interface AyleShortcutChangeEvent {
	Name: string;
	Value: boolean;
}

export interface AyleUIAttachEvent {
	Element: HTMLElement;
	UI: AyleUI;
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
	playlistChange: AylePlaylist;
	playlistItemChanging: AylePlaylistItemChangeEvent;
	playlistItemChange: AylePlaylistItemChangeEvent;
	playlistIndexChange: number;
	playlistItemError: AylePlaylistItemErrorEvent;
	playlistAutoAdvanceStart: AylePlaylistAutoAdvanceEvent;
	playlistAutoAdvanceCancel: AylePlaylistAutoAdvanceEvent;
	playlistAutoAdvanceComplete: AylePlaylistAutoAdvanceEvent;
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
	subtitleStyleChange: AyleSubtitleStyle;
	chapterChange: AyleMediaChapter | null;
	chaptersChange: AyleMediaChapter[];
	playUnavailable: AylePlayUnavailableEvent;
	emptyPlay: void;
	autoplayBlocked: Error | DOMException;
	autoplayChange: boolean;
	autoplayModeChange: AyleAutoplayMode;
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
	mediaModeChange: AyleMediaMode;
	uiAttach: AyleUIAttachEvent;
	uiDetach: AyleUIAttachEvent;
	uiChange: AyleUIConfig;
	audioVisualChange: AyleAudioVisualConfig;
	artworkSlideshowChange: AyleArtworkSlideshowChangeEvent;
	artworkSlideshowStart: AyleArtworkSlideshowStartEvent;
	artworkSlideshowStop: AyleArtworkSlideshowStopEvent;
	localizationChange: AyleLocalization | null;
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
	keyboardAngleSeekStepChange: number | 'frame';
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
	integrationChange: AyleIntegrationConfig;
	quizAnswer: AyleQuizAnswerEvent;
}

export type AyleKnownEventName = keyof AyleEventMap;
export type AyleEventCallback<K extends AyleKnownEventName> =
	(data: AyleEventMap[K]) => void;

export type AyleDynamicPlayerEventCallback = {
	bivarianceHack(data: unknown): void;
}['bivarianceHack'];

export type AyleDynamicEventHandler = {
	bivarianceHack(data: unknown, instance: AyleInstance): void;
}['bivarianceHack'];

export interface AyleEventHandlers {
	ready?: (data: AyleEventMap['ready'], instance: AyleInstance) => void;
	play?: (data: AyleEventMap['play'], instance: AyleInstance) => void;
	playing?: (data: AyleEventMap['playing'], instance: AyleInstance) => void;
	pause?: (data: AyleEventMap['pause'], instance: AyleInstance) => void;
	ended?: (data: AyleEventMap['ended'], instance: AyleInstance) => void;
	error?: (data: AyleEventMap['error'], instance: AyleInstance) => void;
	buffering?: (data: AyleEventMap['buffering'], instance: AyleInstance) => void;
	progress?: (data: AyleEventMap['progress'], instance: AyleInstance) => void;
	timeUpdate?: (data: AyleEventMap['timeUpdate'], instance: AyleInstance) => void;
	seeking?: (data: AyleEventMap['seeking'], instance: AyleInstance) => void;
	seeked?: (data: AyleEventMap['seeked'], instance: AyleInstance) => void;
	sourceChange?: (data: AyleEventMap['sourceChange'], instance: AyleInstance) => void;
	playlistChange?: (data: AyleEventMap['playlistChange'], instance: AyleInstance) => void;
	playlistItemChanging?: (data: AyleEventMap['playlistItemChanging'], instance: AyleInstance) => void;
	playlistItemChange?: (data: AyleEventMap['playlistItemChange'], instance: AyleInstance) => void;
	playlistIndexChange?: (data: AyleEventMap['playlistIndexChange'], instance: AyleInstance) => void;
	playlistItemError?: (data: AyleEventMap['playlistItemError'], instance: AyleInstance) => void;
	playlistAutoAdvanceStart?: (data: AyleEventMap['playlistAutoAdvanceStart'], instance: AyleInstance) => void;
	playlistAutoAdvanceCancel?: (data: AyleEventMap['playlistAutoAdvanceCancel'], instance: AyleInstance) => void;
	playlistAutoAdvanceComplete?: (data: AyleEventMap['playlistAutoAdvanceComplete'], instance: AyleInstance) => void;
	variantChange?: (data: AyleEventMap['variantChange'], instance: AyleInstance) => void;
	variantSwitched?: (data: AyleEventMap['variantSwitched'], instance: AyleInstance) => void;
	variantSwitchError?: (data: AyleEventMap['variantSwitchError'], instance: AyleInstance) => void;
	variantsChange?: (data: AyleEventMap['variantsChange'], instance: AyleInstance) => void;
	audioTrackChange?: (data: AyleEventMap['audioTrackChange'], instance: AyleInstance) => void;
	audioTracksChange?: (data: AyleEventMap['audioTracksChange'], instance: AyleInstance) => void;
	subtitleTrackChange?: (data: AyleEventMap['subtitleTrackChange'], instance: AyleInstance) => void;
	subtitleTracksChange?: (data: AyleEventMap['subtitleTracksChange'], instance: AyleInstance) => void;
	subtitleData?: (data: AyleEventMap['subtitleData'], instance: AyleInstance) => void;
	subtitleDataChange?: (data: AyleEventMap['subtitleDataChange'], instance: AyleInstance) => void;
	subtitleOffsetChange?: (data: AyleEventMap['subtitleOffsetChange'], instance: AyleInstance) => void;
	subtitleStyleChange?: (data: AyleEventMap['subtitleStyleChange'], instance: AyleInstance) => void;
	chapterChange?: (data: AyleEventMap['chapterChange'], instance: AyleInstance) => void;
	chaptersChange?: (data: AyleEventMap['chaptersChange'], instance: AyleInstance) => void;
	playUnavailable?: (data: AyleEventMap['playUnavailable'], instance: AyleInstance) => void;
	emptyPlay?: (data: AyleEventMap['emptyPlay'], instance: AyleInstance) => void;
	autoplayBlocked?: (data: AyleEventMap['autoplayBlocked'], instance: AyleInstance) => void;
	autoplayChange?: (data: AyleEventMap['autoplayChange'], instance: AyleInstance) => void;
	autoplayModeChange?: (data: AyleEventMap['autoplayModeChange'], instance: AyleInstance) => void;
	autoplaySettingsChange?: (data: AyleEventMap['autoplaySettingsChange'], instance: AyleInstance) => void;
	nativeSubtitlesChange?: (data: AyleEventMap['nativeSubtitlesChange'], instance: AyleInstance) => void;
	autoNativeSubtitlesInPictureInPictureChange?: (data: AyleEventMap['autoNativeSubtitlesInPictureInPictureChange'], instance: AyleInstance) => void;
	pictureInPictureChange?: (data: AyleEventMap['pictureInPictureChange'], instance: AyleInstance) => void;
	loadStart?: (data: AyleEventMap['loadStart'], instance: AyleInstance) => void;
	metadata?: (data: AyleEventMap['metadata'], instance: AyleInstance) => void;
	durationChange?: (data: AyleEventMap['durationChange'], instance: AyleInstance) => void;
	rateChange?: (data: AyleEventMap['rateChange'], instance: AyleInstance) => void;
	volumeChange?: (data: AyleEventMap['volumeChange'], instance: AyleInstance) => void;
	stateChange?: (data: AyleEventMap['stateChange'], instance: AyleInstance) => void;
	mediaModeChange?: (data: AyleEventMap['mediaModeChange'], instance: AyleInstance) => void;
	uiAttach?: (data: AyleEventMap['uiAttach'], instance: AyleInstance) => void;
	uiDetach?: (data: AyleEventMap['uiDetach'], instance: AyleInstance) => void;
	uiChange?: (data: AyleEventMap['uiChange'], instance: AyleInstance) => void;
	audioVisualChange?: (data: AyleEventMap['audioVisualChange'], instance: AyleInstance) => void;
	artworkSlideshowChange?: (data: AyleEventMap['artworkSlideshowChange'], instance: AyleInstance) => void;
	artworkSlideshowStart?: (data: AyleEventMap['artworkSlideshowStart'], instance: AyleInstance) => void;
	artworkSlideshowStop?: (data: AyleEventMap['artworkSlideshowStop'], instance: AyleInstance) => void;
	localizationChange?: (data: AyleEventMap['localizationChange'], instance: AyleInstance) => void;
	fontFamilyChange?: (data: AyleEventMap['fontFamilyChange'], instance: AyleInstance) => void;
	settingsChange?: (data: AyleEventMap['settingsChange'], instance: AyleInstance) => void;
	settingsOrderChange?: (data: AyleEventMap['settingsOrderChange'], instance: AyleInstance) => void;
	settingsAction?: (data: AyleEventMap['settingsAction'], instance: AyleInstance) => void;
	integrationSettingsAction?: (data: AyleEventMap['integrationSettingsAction'], instance: AyleInstance) => void;
	toolbarMenuAction?: (data: AyleEventMap['toolbarMenuAction'], instance: AyleInstance) => void;
	toolbarMenuSelect?: (data: AyleEventMap['toolbarMenuSelect'], instance: AyleInstance) => void;
	shortcutChange?: (data: AyleEventMap['shortcutChange'], instance: AyleInstance) => void;
	shortcutSettingsChange?: (data: AyleEventMap['shortcutSettingsChange'], instance: AyleInstance) => void;
	keyboardArrowSeekStepChange?: (data: AyleEventMap['keyboardArrowSeekStepChange'], instance: AyleInstance) => void;
	keyboardAngleSeekStepChange?: (data: AyleEventMap['keyboardAngleSeekStepChange'], instance: AyleInstance) => void;
	keyboardFrameRateFallbackChange?: (data: AyleEventMap['keyboardFrameRateFallbackChange'], instance: AyleInstance) => void;
	debugChange?: (data: AyleEventMap['debugChange'], instance: AyleInstance) => void;
	debugMP4Change?: (data: AyleEventMap['debugMP4Change'], instance: AyleInstance) => void;
	debugSettingsChange?: (data: AyleEventMap['debugSettingsChange'], instance: AyleInstance) => void;
	debugMP4SettingsChange?: (data: AyleEventMap['debugMP4SettingsChange'], instance: AyleInstance) => void;
	hintOpen?: (data: AyleEventMap['hintOpen'], instance: AyleInstance) => void;
	hintClose?: (data: AyleEventMap['hintClose'], instance: AyleInstance) => void;
	hintShow?: (data: AyleEventMap['hintShow'], instance: AyleInstance) => void;
	hintHide?: (data: AyleEventMap['hintHide'], instance: AyleInstance) => void;
	hintDismiss?: (data: AyleEventMap['hintDismiss'], instance: AyleInstance) => void;
	hintResume?: (data: AyleEventMap['hintResume'], instance: AyleInstance) => void;
	hintAction?: (data: AyleEventMap['hintAction'], instance: AyleInstance) => void;
	hintMedia?: (data: AyleEventMap['hintMedia'], instance: AyleInstance) => void;
	hintsChange?: (data: AyleEventMap['hintsChange'], instance: AyleInstance) => void;
	hintRenderersChange?: (data: AyleEventMap['hintRenderersChange'], instance: AyleInstance) => void;
	hintSafeAreaChange?: (data: AyleEventMap['hintSafeAreaChange'], instance: AyleInstance) => void;
	integrationChange?: (data: AyleEventMap['integrationChange'], instance: AyleInstance) => void;
	quizAnswer?: (data: AyleEventMap['quizAnswer'], instance: AyleInstance) => void;
	[eventName: string]: AyleDynamicEventHandler | undefined;
}

export type AyleLoadCallback = (
	error?: Error | null,
	source?: AyleSource | null,
	metadata?: AyleUnknownObject | null
) => void;

export interface AyleDriver {
	Element?: HTMLMediaElement;
	UI?: AyleUI | null;
	Options?: unknown;
	SetUI?(ui: AyleUI | null): unknown;
	SetOptions?(options: unknown): unknown;
	Destroy?(): unknown;
}

export interface AyleMediaProvider {
	Player: AylePlayer;
	Options: AyleUnknownObject;
	Source?: AyleSource | null;
	Metadata?: AyleUnknownObject | null;
	Load(callback?: AyleLoadCallback): unknown;
	Destroy?(): unknown;
}

export interface AyleHTTPMediaProvider extends AyleMediaProvider {
	SupportedCodecs?: string[];
}

export interface AyleUI {
	Element: HTMLElement;
	Player: AylePlayer;
	Destroy(): this;
}

export interface AylePlayer {
	State: AyleState;
	Options: AylePlayerOptions;
	Element: HTMLElement | null;
	MediaElement: HTMLMediaElement | null;
	Driver: AyleDriver;
	MediaProvider: AyleMediaProvider | null;
	MediaProviderOptions: AyleMediaProviderConfig | null;
	UI: AyleUI | null;
	Playlist: AylePlaylist;
	PlaylistIndex: number;
	PlaylistItem: AylePlaylistItem | null;
	Load(): unknown;
	Load(callback: AyleLoadCallback): unknown;
	Load(source: AyleSource): boolean;
	LoadMedia(callback?: AyleLoadCallback): unknown;
	SetDriver(driver: AyleDriver): this;
	SetMediaProvider(provider: AyleMediaProvider | AyleMediaProviderConfig | null): this;
	SetPlaylist(playlist: AylePlaylist | AylePlaylistItem[]): this;
	SetPlaylistIndex(index: number, reason?: string): boolean;
	SetPlaylistItemByID(id: string | number): boolean;
	Next(): boolean;
	Previous(): boolean;
	HasNext(): boolean;
	HasPrevious(): boolean;
	AttachUI(target: string | Element): this;
	DetachUI(): this;
	Destroy(): this;
	Play(): boolean | Promise<unknown>;
	Pause(): unknown;
	Seek(position: number): boolean;
	SetVolume(volume: number): unknown;
	SetMuted(muted: boolean): unknown;
	SetPlaybackRate(rate: number): unknown;
	SetVariant(variant: AyleMediaVariant): boolean;
	SetVariantByID(id: string): boolean;
	SetAudioTrack(track: AyleMediaTrack): boolean;
	SetSubtitleTrack(track: AyleMediaTrack | null): boolean;
	SetSubtitleTrackByID(id: string | null): boolean;
	On<K extends AyleKnownEventName>(
		name: K,
		callback: (data: AyleEventMap[K]) => void
	): this;
	On(name: string, callback: (data: unknown) => void): this;
	Off<K extends AyleKnownEventName>(
		name: K,
		callback: (data: AyleEventMap[K]) => void
	): this;
	Off(name: string, callback: (data: unknown) => void): this;
	Once<K extends AyleKnownEventName>(
		name: K,
		callback: (data: AyleEventMap[K]) => void
	): this;
	Emit<K extends AyleKnownEventName>(name: K, data?: AyleEventMap[K]): this;
	Emit(name: string, data?: unknown): this;
}

export type AylePlayerCore = AylePlayer;

export interface AyleInstance {
	ID: string;
	Element: HTMLElement;
	Video: HTMLMediaElement;
	Driver: AyleDriver;
	Player: AylePlayer;
	UI: AyleUI;
	MediaProvider: AyleMediaProvider | null;
	MediaProviderOptions: AyleMediaProviderConfig | null;
	Config: AyleConfig;
	Source?: AyleSource | null;
	Metadata?: AyleUnknownObject | null;
	Error?: Error | null;
}

export class AyleEventEmitter {
	On(name: string, callback: (data: unknown) => void): this;
	Off(name: string, callback: (data: unknown) => void): this;
	Once(name: string, callback: (data: unknown) => void): this;
	Emit(name: string, data?: unknown): this;
}

export class AyleMediaVariant {
	constructor(options?: Partial<AyleMediaVariant>);
}

export class AyleMediaTrack {
	constructor(options?: Partial<AyleMediaTrack>);
}

export class AyleMediaCover {
	constructor(options?: Partial<AyleMediaCover>);
}

export class AyleMediaChapter {
	constructor(options?: Partial<AyleMediaChapter>);
}

export class AyleMediaDriver implements AyleDriver {
	Element?: HTMLMediaElement;
	UI?: AyleUI | null;
	Options?: unknown;
	SetUI(ui: AyleUI | null): this;
	Destroy(): this;
}

export class AyleHTML5MediaDriver extends AyleMediaDriver {
	constructor(element?: HTMLMediaElement | null, options?: unknown);
}

export class AyleMSEMediaDriver extends AyleHTML5MediaDriver {
	constructor(element?: HTMLMediaElement | null, options?: unknown);
}

export class AyleMediaProvider {
	constructor(player: AylePlayer, options?: AyleUnknownObject);
}

export class AyleHTTPMediaProvider extends AyleMediaProvider {
	constructor(player: AylePlayer, options?: AyleHTTPMediaProviderConfig);
}

export class AyleUI {
	constructor(element: HTMLElement, player: AylePlayer);
}

export class Ayle implements AylePlayer {
	constructor(config?: AyleConfig);
	static Init(target: string | Element, config?: AyleConfig): Ayle;
	static RegisterPreset(name: string, preset: AylePresetConfig): typeof Ayle;
	static GetPreset(name: string): AylePresetConfig | null;
	static HasPreset(name: string): boolean;
	static RemovePreset(name: string): boolean;
	static RegisterDriver(name: string, driver: Function): typeof Ayle;
	static GetDriver(name: string): Function | null;
	static HasDriver(name: string): boolean;
	static RemoveDriver(name: string): boolean;
	static CreateDriver(name: string, options?: unknown): AyleDriver;
	static RegisterMediaProvider(name: string, provider: Function): typeof Ayle;
	static GetMediaProvider(name: string): Function | null;
	static HasMediaProvider(name: string): boolean;
	static RemoveMediaProvider(name: string): boolean;
	static CreateMediaProvider(
		name: string,
		player: AylePlayer,
		options?: AyleUnknownObject
	): AyleMediaProvider;

	State: AyleState;
	Options: AylePlayerOptions;
	Element: HTMLElement | null;
	MediaElement: HTMLMediaElement | null;
	Driver: AyleDriver;
	MediaProvider: AyleMediaProvider | null;
	MediaProviderOptions: AyleMediaProviderConfig | null;
	UI: AyleUI | null;
	Playlist: AylePlaylist;
	PlaylistIndex: number;
	PlaylistItem: AylePlaylistItem | null;
	Load(): unknown;
	Load(callback: AyleLoadCallback): unknown;
	Load(source: AyleSource): boolean;
	LoadMedia(callback?: AyleLoadCallback): unknown;
	SetDriver(driver: AyleDriver): this;
	SetMediaProvider(provider: AyleMediaProvider | AyleMediaProviderConfig | null): this;
	SetPlaylist(playlist: AylePlaylist | AylePlaylistItem[]): this;
	SetPlaylistIndex(index: number, reason?: string): boolean;
	SetPlaylistItemByID(id: string | number): boolean;
	Next(): boolean;
	Previous(): boolean;
	HasNext(): boolean;
	HasPrevious(): boolean;
	AttachUI(target: string | Element): this;
	DetachUI(): this;
	Destroy(): this;
	Play(): boolean | Promise<unknown>;
	Pause(): unknown;
	Seek(position: number): boolean;
	SetVolume(volume: number): unknown;
	SetMuted(muted: boolean): unknown;
	SetPlaybackRate(rate: number): unknown;
	SetVariant(variant: AyleMediaVariant): boolean;
	SetVariantByID(id: string): boolean;
	SetAudioTrack(track: AyleMediaTrack): boolean;
	SetSubtitleTrack(track: AyleMediaTrack | null): boolean;
	SetSubtitleTrackByID(id: string | null): boolean;
	On<K extends AyleKnownEventName>(
		name: K,
		callback: (data: AyleEventMap[K]) => void
	): this;
	On(name: string, callback: (data: unknown) => void): this;
	Off<K extends AyleKnownEventName>(
		name: K,
		callback: (data: AyleEventMap[K]) => void
	): this;
	Off(name: string, callback: (data: unknown) => void): this;
	Once<K extends AyleKnownEventName>(
		name: K,
		callback: (data: AyleEventMap[K]) => void
	): this;
	Emit<K extends AyleKnownEventName>(name: K, data?: AyleEventMap[K]): this;
	Emit(name: string, data?: unknown): this;
}

export interface AylePresetConfig {
	Player?: AylePlayerOptions;
	UI?: AyleUIConfig;
}
