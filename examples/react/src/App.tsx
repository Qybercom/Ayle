import {
	useMemo
} from 'react';
import {
	AylePlayer,
	type AylePlayerProps
} from '@qybercom/ayle-react';

const HTTP = {
	MetadataURL: '/server/metadata.php?file={file}',
	TrackURL: '/server/track.php?file={file}&type={kind}&track={track}&start={time}',
	Stream: {
		SkipInit: true
	}
};

function fullHTTP (file: string) {
	return {
	File: file,
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

const MINIMAL_VIDEO = {
	ShowCenterPlayButton: false,
	MediaMode: 'video',
	UI: {
		Header: [],
		Overlay: ['track:compact'],
		Toolbar: {
			Items: ['play', 'timeline', 'time', 'volume']
		}
	}
};

const MINIMAL_AUDIO = {
	ShowCenterPlayButton: false,
	MediaMode: 'audio',
	UI: {
		Header: [],
		Track: ['artwork', 'title', 'artist', 'album'],
		Overlay: ['track:compact', 'subtitles'],
		Toolbar: {
			Items: ['play', 'timeline', 'time', 'volume']
		}
	}
};

function fullPlayer (mediaMode: 'video' | 'audio') {
	return {
		AutoSelectFirstSubtitleTrack: false,
		AutoPlay: false,
		AutoPlayMode: 'audible',
		Volume: 1,
		Muted: false,
		Start: 0,
		NativeSubtitles: false,
		SubtitleOffset: 0,
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
		ForceShowQualityList: false,
		ShowCenterPlayButton: true,
		AutoFocus: false,
		MediaMode: mediaMode,
		UI: {
			Header: ['channel:card', 'track'],
			Track: mediaMode === 'audio' ?
				['artwork', 'title', 'artist', 'album'] :
				['title', 'chapter'],
			Channel: ['name', 'profile'],
			Overlay: [],
			Toolbar: {
				Layout: 'inline',
				Items: [
					'play',
					'timeline',
					'time',
					'volume',
					'chapters',
					'quality',
					'settings',
					'pip',
					'fullscreen'
				]
			}
		},
		AudioVisual: {
			Type: 'auto',
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
		Timeline: {
			Ranges: [
				{
					ID: 'intro',
					Start: 0,
					End: 15,
					Duration: 15,
					Label: 'Intro',
					ClassName: 'example-range-intro'
				}
			]
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
					Event: '',
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

const FULL_VIDEO = fullPlayer('video');
const FULL_AUDIO = fullPlayer('audio');

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
	file="example.mkv"
	driver="mse"
	http={HTTP}
	player={MINIMAL_VIDEO}
/>`,
				player: {
					id: 'react-minimal-video',
					file: 'example.mkv',
					driver: 'mse',
					http: HTTP,
					player: MINIMAL_VIDEO
				}
			},
			{
				title: 'Minimal audio',
				description: 'Minimal configuration + audio media mode.',
				badge: 'minimal-audio',
				code: `<AylePlayer
	id="react-minimal-audio"
	file="example.mp3"
	driver="mse"
	http={HTTP}
	player={MINIMAL_AUDIO}
/>`,
				player: {
					id: 'react-minimal-audio',
					file: 'example.mp3',
					driver: 'mse',
					http: HTTP,
					player: MINIMAL_AUDIO
				}
			},
			{
				title: 'Full video',
				description: 'Full configuration surface for video.',
				badge: 'full-video',
				code: `<AylePlayer
	id="react-full-video"
	file="example.mkv"
	driver="mse"
	settings="localStorage"
	http={fullHTTP('example.mkv')}
	player={FULL_VIDEO}
	onEvent={handleEvent}
/>`,
				player: {
					id: 'react-full-video',
					file: 'example.mkv',
					driver: 'mse',
					settings: 'localStorage',
					http: fullHTTP('example.mkv'),
					player: FULL_VIDEO,
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
	file="example.mp3"
	driver="mse"
	settings="localStorage"
	http={fullHTTP('example.mp3')}
	player={FULL_AUDIO}
	onEvent={handleEvent}
/>`,
				player: {
					id: 'react-full-audio',
					file: 'example.mp3',
					driver: 'mse',
					settings: 'localStorage',
					http: fullHTTP('example.mp3'),
					player: FULL_AUDIO,
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
				The complete reusable Player objects live at the top of App.tsx so the full examples remain readable without hiding any Ayle configuration.
			</div>
		</main>
	);
}