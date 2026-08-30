import {
	useMemo
} from 'react';
import type {
	AyleConfig,
	AyleHTTPMediaProviderConfig,
	AylePlayerOptions,
	AylePlaylistConfig
} from '@qybercom/ayle';
import {
	AylePlayer,
	type AylePlayerProps
} from '@qybercom/ayle-react';

function minimalMediaProvider (file: string): AyleHTTPMediaProviderConfig {
	return {
		File: file
	};
}

function fullMediaProvider (): AyleHTTPMediaProviderConfig {
	return {
	Type: 'http',
	MetadataURL: '/server/metadata.php?file={file}',
	TrackURL: '/server/track.php?file={file}&type={kind}&track={track}&start={time}',
	VideoURL: '',
	AudioURL: '',
	SubtitleURL: '',
	ArtworkURL: '',
	CoverURL: '',
	CodecHeader: 'X-Media-Codec',
	CodecListHeader: 'X-Media-Codec-List',
	CodecCandidates: null,
	RequestHeaders: {},
	Stream: {
		Mode: 'time',
		ChunkSize: 2097152,
		BufferAhead: 30,
		BufferBehind: 20,
		SkipInit: true,
		Init: {
			URL: '',
			RangeStart: 0,
			RangeEnd: 0
		},
		InitValue: 'init',
		Segments: [
			{
				Start: 0,
				End: 0,
				URL: '',
				RangeStart: 0,
				RangeEnd: 0
			}
		],
		TimeURL: '',
		TimeParameter: 'time',
		TimePrecision: 3,
		TimeStartHeader: 'X-Media-Start',
		TimeEndHeader: 'X-Media-End',
		TimeDurationHeader: 'X-Media-Duration',
		TimeEOFHeader: 'X-Media-EOF',
		AlignTimestamps: true,
		MaxNoProgressRequests: 3,
		UseBufferedEndForNextTime: true,
		GapTolerance: 0.15,
		MaxGapRetries: 2,
		TimeEpsilon: 0.001
	},
	VideoType: 'video/mp4',
	AudioType: 'audio/mp4',
	SubtitleType: 'text/vtt'
};
}

const MINIMAL_VIDEO_CONFIG: AyleConfig = {
	Driver: {
		Type: 'html5'
	},
	MediaProvider: minimalMediaProvider('example.mp4'),
	Player: {
		MediaMode: 'video'
	}
};

const MINIMAL_AUDIO_CONFIG: AyleConfig = {
	Driver: {
		Type: 'html5'
	},
	MediaProvider: minimalMediaProvider('example.mp3'),
	Player: {
		MediaMode: 'audio'
	}
};

function fullPlaylist (
	file: string,
	nextFile: string,
	mediaMode: 'video' | 'audio'
): AylePlaylistConfig {
	return {
		AutoAdvance: true,
		AutoAdvanceDelay: 5000,
		Loop: false,
		StartIndex: 0,
		Items: [
			{
				ID: 'first',
				MediaProvider: {
					File: file
				}
			},
			{
				ID: 'second',
				Driver: {
					Type: 'mse',
					Options: {}
				},
				MediaProvider: {
					File: nextFile
				},
				Player: {
					MediaMode: mediaMode,
					Integration: {
						Hints: [
							{
								ID: 'info',
								Start: 8,
								Duration: 8,
								Title: 'Second item information',
								Text: 'This item overrides the global info hint.'
							},
							{
								ID: 'second-item-hint',
								Start: 20,
								Duration: 5,
								Title: 'Playlist item hint',
								Text: 'This hint exists only on the second playlist item.'
							}
						],
						TimelineRanges: [
							{
								ID: 'integration-range',
								Start: 30,
								End: 45,
								Label: 'Second item range override',
								ClassName: 'example-range-item-override'
							},
							{
								ID: 'second-item-range',
								Start: 80,
								End: 100,
								Label: 'Second item range',
								ClassName: 'example-range-item'
							}
						]
					}
				}
			}
		]
	};
}

function fullPlayer (mediaMode: 'video' | 'audio'): AylePlayerOptions {
	return {
		AutoSelectFirstSubtitleTrack: false,
		AutoPlay: false,
		AutoPlayMode: 'audible',
		Volume: 1,
		Muted: false,
		Start: 0,
		NativeSubtitles: false,
		SubtitleOffset: mediaMode === 'audio' ? -2.85 : 0,
		AutoNativeSubtitlesInPictureInPicture: false,
		SubtitleStyle: {
			Color: '#fff',
			Background: 'rgba(0, 0, 0, .72)',
			FontFamily: 'Arial, sans-serif',
			FontSize: '1.15em',
			FontWeight: '400',
			LineHeight: '1.25',
			TextShadow: 'none',
			Padding: '8px',
			BorderRadius: '8px',
			LetterSpacing: 'normal',
			Bottom: '64px',
			MaxWidth: '90%'
		},
		LoadingDelay: 180,
		ForceShowQualityList: mediaMode === 'video',
		ForceShowChaptersList: false,
		ForceShowPreviousButton: true,
		ForceShowNextButton: true,
		ShowCenterPlayButton: mediaMode !== 'audio',
		AutoFocus: false,
		MediaMode: mediaMode,
		Preset: '',
		UI: {
			Header: [],
			Track: mediaMode === 'audio' ?
				['artwork', 'title', 'artist', 'album'] :
				['title', 'chapter'],
			Channel: ['name', 'profile'],
			Overlay: mediaMode === 'audio' ?
				['track:compact', 'subtitles'] :
				['track:compact'],
			Toolbar: {
				Layout: mediaMode === 'video' ? 'timeline-top' : 'inline',
				Items: mediaMode === 'audio' ?
					['previous', 'play', 'next', 'timeline', 'time', 'volume', 'settings'] :
					['previous', 'play', 'next', 'timeline', 'time', 'volume', 'chapters', 'quality', 'fullscreen', 'settings']
			}
		},
		AudioVisual: {
			Type: mediaMode === 'audio' ? 'cover' : 'auto',
			Image: '',
			Subtitles: true,
			MinHeight: 240
		},
		ArtworkSlideshow: {
			Enabled: true,
			HideControls: false,
			Interval: 3000,
			FadeDuration: 500,
			Fit: 'cover'
		},
		KeyboardArrowSeekStep: 10,
		KeyboardAngleSeekStep: 'frame',
		KeyboardFrameRateFallback: 30,
		Shortcuts: {
			PlayPause: true,
			SeekArrows: true,
			SeekAngle: true,
			Volume: true,
			Mute: true,
			Subtitles: true,
			Fullscreen: true,
			PictureInPicture: true
		},
		MediaSession: {
			Enabled: true,
			Metadata: {
				Title: '',
				Artist: '',
				Album: '',
				Artwork: null
			}
		},
		SettingsOrder: [
			'autoplay',
			'audio',
			'subtitles',
			'nativeSubtitles',
			'nativeSubtitlesInPiP',
			'',
			'shortcuts',
			'debug',
			'',
			'integration'
		],
		FontFamily: 'Arial, sans-serif',
		Debug: false,
		DebugMP4: false,
		Localization: {},
		HintSafeArea: {
			Top: 16,
			Right: 16,
			Bottom: 16,
			Left: 16
		},
		Integration: {
			Channel: {
				Name: 'Nature Explorer',
				Avatar: '/img/channel-avatar.png',
				URL: '#',
				Action: null,
				Profile: {
					Name: '@natureexplorer',
					URL: '#',
					Target: '_blank'
				}
			},
			Hints: [
				{
					ID: 'info',
					Type: 'info',
					Start: 5,
					End: 13,
					Duration: 8,
					Position: 'top-right',
					Offset: {
						X: 0,
						Y: 0
					},
					Title: 'Information',
					Text: 'A normal timed hint.',
					Label: '',
					URL: '',
					Target: '_blank',
					Image: '',
					Action: null,
					Actions: [
						{
							Type: 'callback',
							Title: 'Action',
							Label: 'Action',
							Name: 'example-action',
							URL: '',
							Target: '_blank',
							Time: 0,
							Source: null,
							Callback: null,
							Correct: false
						},
						{
							Type: 'next',
							Title: 'Next file',
							Label: 'Next file',
							Name: '',
							URL: '',
							Target: '_blank',
							Time: 0,
							Source: null,
							Callback: null,
							Correct: false
						},
						{
							Type: 'previous',
							Title: 'Previous file',
							Label: 'Previous file',
							Name: '',
							URL: '',
							Target: '_blank',
							Time: 0,
							Source: null,
							Callback: null,
							Correct: false
						}
					],
					Dismissible: true,
					Once: false,
					Repeatable: false,
					PauseOnShow: false,
					ResumeOnAction: false,
					HideOnAction: true,
					ShowTitle: true,
					ShowDescription: true,
					ResultMode: 'off',
					ResultDuration: 0
				}
			],
			Settings: [
				{
					ID: 'integration-action',
					Title: 'Integration action',
					Label: 'Integration action',
					Value: 'Run',
					Disabled: false,
					Items: [],
					Action: null,
					OnSelect: null,
					Event: 'integration-action',
					CloseMenu: true
				}
			],
			Toolbar: [
				{
					ID: 'favorite',
					Type: 'button',
					Before: 'settings',
					After: '',
					Icon: '',
					Label: '★',
					Title: 'Favorite',
					ClassName: '',
					Visible: true,
					Disabled: false,
					Event: 'favoriteAction',
					Menu: [
						{
							ID: 'add',
							Title: 'Add to favorites',
							Label: 'Add to favorites',
							Value: '',
							Event: 'add',
							ClassName: '',
							Disabled: false,
							CloseMenu: true,
							Action: null,
							OnClick: null
						},
						''
					],
					OnClick: null,
					OnCreate: null,
					OnDestroy: null
				}
			],
			TimelineRanges: [
				{
					ID: 'integration-range',
					Start: 45,
					End: 75,
					Duration: 30,
					Label: 'Integration range',
					ClassName: 'example-range-integration'
				}
			],
			MediaSession: {
				Metadata: {
					Title: '',
					Artist: '',
					Album: '',
					Artwork: null
				}
			},
			Data: {
				Example: 'full'
			}
		}
	};
}

const FULL_VIDEO_CONFIG: AyleConfig = {
	Driver: {
		Type: 'mse'
	},
	MediaProvider: fullMediaProvider(),
	Playlist: fullPlaylist('example.mkv', 'example2.mkv', 'video'),
	Player: fullPlayer('video')
};

const FULL_AUDIO_CONFIG: AyleConfig = {
	Driver: {
		Type: 'mse'
	},
	MediaProvider: fullMediaProvider(),
	Playlist: fullPlaylist('example.mp3', 'example2.mp3', 'audio'),
	Player: fullPlayer('audio')
};

const FULL_EVENTS = {
	favoriteAction: function (context: any) {
		console.log('Ayle React favorite button clicked:', context.Item.ID);
	}
};


type ExampleCardProps = {
	title: string;
	description: string;
	badge: string;
	code: string;
	player: AylePlayerProps;
};

function ExampleCard (props: ExampleCardProps) {
	return (
		<section className="example-card">
			<div className="example-card-header">
				<div>
					<h2>{props.title}</h2>
					<p>{props.description}</p>
				</div>
				<span className="example-badge">{props.badge}</span>
			</div>
			<div className="example-preview">
				<AylePlayer {...props.player} />
			</div>
			<div className="example-code-title">React / TSX</div>
			<pre className="example-code"><code>{props.code}</code></pre>
		</section>
	);
}

export default function App () {
	const examples = useMemo(function (): ExampleCardProps[] {
		return [
			{
				title: 'Minimal video',
				description: 'Minimal configuration + video media mode.',
				badge: 'minimal-video',
				code: `<AylePlayer
	id="react-minimal-video"
	config={MINIMAL_VIDEO_CONFIG}
/>`,
				player: {
					id: 'react-minimal-video',
					config: MINIMAL_VIDEO_CONFIG
				}
			},
			{
				title: 'Minimal audio',
				description: 'Minimal configuration + audio media mode.',
				badge: 'minimal-audio',
				code: `<AylePlayer
	id="react-minimal-audio"
	config={MINIMAL_AUDIO_CONFIG}
/>`,
				player: {
					id: 'react-minimal-audio',
					config: MINIMAL_AUDIO_CONFIG
				}
			},
			{
				title: 'Full video',
				description: 'Full configuration surface for video.',
				badge: 'full-video',
				code: `<AylePlayer
	id="react-full-video"
	config={FULL_VIDEO_CONFIG}
	settings="localStorage"
	events={FULL_EVENTS}
	onEvent={handleEvent}
/>`,
				player: {
					id: 'react-full-video',
					config: FULL_VIDEO_CONFIG,
					settings: 'localStorage',
					events: FULL_EVENTS,
					onEvent: function (event) {
						console.log('Ayle React event:', event.Type, event.Data);
					}
				}
			},
			{
				title: 'Full audio',
				description: 'Full player UI in audio media mode.',
				badge: 'full-audio',
				code: `<AylePlayer
	id="react-full-audio"
	config={FULL_AUDIO_CONFIG}
	settings="localStorage"
	events={FULL_EVENTS}
	onEvent={handleEvent}
/>`,
				player: {
					id: 'react-full-audio',
					config: FULL_AUDIO_CONFIG,
					settings: 'localStorage',
					events: FULL_EVENTS,
					onEvent: function (event) {
						console.log('Ayle React event:', event.Type, event.Data);
					}
				}
			}
		];
	}, []);

	return (
		<main className="example-shell">
			<header className="example-hero">
				<p className="example-eyebrow">Ayle / React</p>
				<h1>Four canonical React examples</h1>
				<p>Every card is runnable and shows the exact JSX shape used for that variant.</p>
			</header>

			<div className="example-grid">
				{examples.map(function (example) {
					return <ExampleCard key={example.badge} {...example} />;
				})}
			</div>

			<div className="example-note">
				The complete reusable Ayle config objects live at the top of App.tsx; React only receives config plus framework integration props.
			</div>
		</main>
	);
}