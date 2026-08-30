import type {
	AyleEventMap,
	AyleInstance,
	AyleKnownEventName,
	AylePlayer
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
	AylePlayer,
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

export interface AyleAngularEvent<K extends AyleKnownEventName = AyleKnownEventName> {
	Type: K;
	Data: AyleEventMap[K];
	Player: AylePlayer;
	Instance: AyleInstance;
	Element: HTMLElement;
}

export interface AyleDynamicAngularEvent {
	Type: string;
	Data: unknown;
	Player: AylePlayer;
	Instance: AyleInstance;
	Element: HTMLElement;
}

export type AyleAnyAngularEvent =
	AyleAngularEvent |
	AyleDynamicAngularEvent;
