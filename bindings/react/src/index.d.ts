import type {
	CSSProperties,
	ForwardRefExoticComponent,
	RefAttributes
} from 'react';

import type {
	AyleConfig,
	AyleEventHandlers,
	AyleEventMap,
	AyleInstance,
	AyleKnownEventName,
	AyleMediaProvider,
	AylePlayerCore,
	AyleUI
} from '@qybercom/ayle';

export type {
	AyleArtworkFit,
	AyleArtworkSlideshowChangeEvent,
	AyleArtworkSlideshowConfig,
	AyleArtworkSlideshowStartEvent,
	AyleArtworkSlideshowStopEvent,
	AyleAudioVisualConfig,
	AyleAudioVisualType,
	AyleAutoplayMode,
	AyleCodecCandidateGroup,
	AyleConfig,
	AyleCustomMediaProviderConfig,
	AyleDriver,
	AyleDriverConfig,
	AyleEventHandlers,
	AyleEventMap,
	AyleHint,
	AyleHintAction,
	AyleHintActionEvent,
	AyleHintMediaEvent,
	AyleHintOffset,
	AyleHintRendererChangeEvent,
	AyleHintResumeEvent,
	AyleHintSafeArea,
	AyleHTTPMediaProvider,
	AyleHTTPMediaProviderConfig,
	AyleInstance,
	AyleIntegrationChannel,
	AyleIntegrationChannelProfile,
	AyleIntegrationConfig,
	AyleIntegrationMediaSession,
	AyleIntegrationSetting,
	AyleIntegrationSettingsActionEvent,
	AyleKnownEventName,
	AyleLoadCallback,
	AyleLocalization,
	AyleMediaChapter,
	AyleMediaCover,
	AyleMediaMode,
	AyleMediaProvider,
	AyleMediaProviderConfig,
	AyleMediaSessionArtwork,
	AyleMediaSessionConfig,
	AyleMediaSessionMetadata,
	AyleMediaTrack,
	AyleMediaVariant,
	AyleMetadataEvent,
	AylePlayerCore,
	AylePlayerOptions,
	AylePlaylist,
	AylePlaylistAutoAdvanceEvent,
	AylePlaylistConfig,
	AylePlaylistItem,
	AylePlaylistItemChangeEvent,
	AylePlaylistItemErrorEvent,
	AylePlayUnavailableEvent,
	AyleProgressEvent,
	AyleQuizAnswerEvent,
	AyleSettingsActionEvent,
	AyleSettingsChangeEvent,
	AyleSettingsStorage,
	AyleShortcutChangeEvent,
	AyleShortcutConfig,
	AyleSource,
	AyleSourceConfig,
	AyleState,
	AyleStreamDescriptor,
	AyleStreamMode,
	AyleStreamOptions,
	AyleSubtitleCue,
	AyleSubtitleDataEvent,
	AyleSubtitleStyle,
	AyleTimeRange,
	AyleTimeUpdateEvent,
	AyleTimelineRange,
	AyleToolbarButton,
	AyleToolbarButtonContext,
	AyleToolbarConfig,
	AyleToolbarItem,
	AyleToolbarLayout,
	AyleToolbarMenuActionEvent,
	AyleToolbarMenuContext,
	AyleToolbarMenuItem,
	AyleToolbarMenuSelectEvent,
	AyleUI,
	AyleUIAttachEvent,
	AyleUIConfig,
	AyleUnknownObject,
	AyleVariantSwitchErrorEvent,
	AyleVolumeChangeEvent
} from '@qybercom/ayle';

export type AyleKnownEvent = {
	[K in AyleKnownEventName]: {
		Type: K;
		Data: AyleEventMap[K];
		Player: AylePlayerCore;
		Instance: AyleInstance;
		Element: HTMLElement;
	}
}[AyleKnownEventName];

export interface AyleDynamicEvent {
	Type: string;
	Data: unknown;
	Player: AylePlayerCore;
	Instance: AyleInstance;
	Element: HTMLElement;
}

export type AyleEventWrapper = AyleKnownEvent | AyleDynamicEvent;

export interface AylePlayerHandle {
	readonly Element: HTMLElement | null;
	readonly Instance: AyleInstance | null;
	readonly Player: AylePlayerCore | null;
	readonly UI: AyleUI | null;
	readonly MediaProvider: AyleMediaProvider | null;
	Reload(): AyleInstance | false;
}

export interface AylePlayerProps {
	id?: string;
	config?: AyleConfig;
	settings?: 'localStorage' | 'sessionStorage' | 'cookie' | '' | null | false;
	events?: AyleEventHandlers;
	onEvent?: (event: AyleEventWrapper) => void;
	onReady?: (instance: AyleInstance) => void;
	onDestroy?: (instance: AyleInstance) => void;
	reloadKey?: string | number;
	className?: string;
	style?: CSSProperties;
}

export declare const AYLE_EVENTS: readonly AyleKnownEventName[];

export declare const AylePlayer: ForwardRefExoticComponent<
	AylePlayerProps & RefAttributes<AylePlayerHandle>
>;
