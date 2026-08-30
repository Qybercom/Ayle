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

const MINIMAL_VIDEO = {
	AutoPlay: false,
	AutoFocus: true,
	MediaMode: 'video',
	UIMode: 'minimal',
	UI: {
		Header: [],
		Track: ['title', 'chapter'],
		Channel: ['name', 'profile'],
		Overlay: ['track:compact'],
		Toolbar: {
			Layout: 'inline',
			Items: ['play', 'timeline', 'time', 'volume']
		}
	}
};

const MINIMAL_AUDIO = {
	...MINIMAL_VIDEO,
	MediaMode: 'audio',
	UI: {
		...MINIMAL_VIDEO.UI,
		Overlay: ['track:compact', 'subtitles']
	},
	AudioVisual: {
		Enabled: true
	}
};

function fullPlayer (mediaMode: 'video' | 'audio') {
	return {
		AutoSelectFirstSubtitleTrack: false,
		AutoPlay: false,
		AutoPlayMode: 'muted',
		Volume: 0.8,
		Muted: false,
		Start: 0,
		NativeSubtitles: false,
		SubtitleOffset: 0,
		AutoNativeSubtitlesInPictureInPicture: true,
		SubtitleStyle: {
			Color: '#fff',
			Background: 'rgba(0,0,0,.72)',
			FontFamily: 'Calibri, sans-serif',
			FontWeight: 400,
			FontSize: '16px',
			LineHeight: '16px',
			TextShadow: '0 1px 2px #000'
		},
		LoadingDelay: 180,
		ForceShowQualityList: true,
		ShowCenterPlayButton: true,
		AutoFocus: true,
		MediaMode: mediaMode,
		UIMode: 'normal',
		KeyboardArrowSeekStep: 10,
		KeyboardAngleSeekStep: 'frame',
		KeyboardFrameRateFallback: 30,
		Shortcuts: {
			PlayPause: true,
			SeekArrows: true,
			SeekAngle: true,
			Volume: true,
			Mute: true,
			Fullscreen: true,
			PictureInPicture: true
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
		FontFamily: 'Calibri, sans-serif',
		Debug: false,
		DebugMP4: false,
		Localization: 'en-US',
		HintSafeArea: {
			Top: 16,
			Right: 16,
			Bottom: 16,
			Left: 16
		},
		UI: {
			Header: ['channel:card', 'track'],
			Track: ['title', 'chapter'],
			Channel: ['name', 'profile'],
			Toolbar: {
				Layout: 'auto',
				Items: [
					'play',
					'timeline',
					'time',
					'',
					'volume',
					'chapters',
					'quality',
					'settings',
					'pip',
					'fullscreen'
				]
			}
		},
		Timeline: {
			Ranges: [
				{
					ID: 'intro',
					Start: 0,
					Duration: 15,
					Label: 'Intro',
					ClassName: 'example-range-intro'
				}
			]
		},
		MediaSession: {
			Enabled: true,
			Metadata: {}
		},
		Integration: {
			Channel: {
				Name: 'Nature Explorer',
				Avatar: '/img/channel-avatar.png',
				Profile: {
					Name: '@natureexplorer',
					URL: '#',
					Target: '_blank'
				}
			},
			Hints: [
				{
					ID: 'github',
					Type: 'link',
					Position: 'top-right-corner',
					Label: 'Ayle on GitHub',
					URL: 'https://github.com/Qybercom/Ayle',
					Target: '_blank'
				},
				{
					ID: 'info',
					Type: 'info',
					Position: 'top-right',
					Start: 5,
					Duration: 8,
					Title: 'Information',
					Text: 'A normal timed hint.',
					Dismissible: true
				}
			],
			Settings: [
				{
					ID: 'integration-action',
					Title: 'Integration action',
					Value: 'Run',
					Event: 'integration-action'
				}
			],
			Toolbar: [
				{
					ID: 'favorite',
					Type: 'button',
					Before: 'settings',
					Label: '★',
					Title: 'Favorite',
					Menu: [
						{
							Label: 'Add to favorites',
							Event: 'add'
						},
						{
							Label: 'Save for later',
							Event: 'later'
						},
						'',
						{
							Label: 'Manage favorites',
							Value: '↗',
							Event: 'manage'
						}
					]
				}
			],
			TimelineRanges: [
				{
					ID: 'integration-range',
					Start: 45,
					End: 75,
					Label: 'Integration range',
					ClassName: 'example-range-integration'
				}
			]
		}
	};
}

const FULL_VIDEO = fullPlayer('video');
const FULL_AUDIO = {
	...fullPlayer('audio'),
	AudioVisual: {
		Enabled: true
	},
	ArtworkSlideshow: {
		Enabled: true
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
				description: 'Minimal UI + video media mode.',
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
				description: 'Minimal UI + audio media mode.',
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
	http={HTTP}
	player={FULL_VIDEO}
	onEvent={handleEvent}
/>`,
				player: {
					id: 'react-full-video',
					file: 'example.mkv',
					driver: 'mse',
					settings: 'localStorage',
					http: HTTP,
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
	http={HTTP}
	player={FULL_AUDIO}
	onEvent={handleEvent}
/>`,
				player: {
					id: 'react-full-audio',
					file: 'example.mp3',
					driver: 'mse',
					settings: 'localStorage',
					http: HTTP,
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