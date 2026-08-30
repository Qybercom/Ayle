import {
	Component
} from '@angular/core';
import {
	AylePlayerComponent,
	type AyleAnyAngularEvent
} from '@qybercom/ayle-angular';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [
		AylePlayerComponent
	],
	templateUrl: './app.component.html',
	styleUrl: './app.component.css'
})
export class AppComponent {
	readonly HTTP = {
		MetadataURL: '/server/metadata.php?file={file}',
		TrackURL: '/server/track.php?file={file}&type={kind}&track={track}&start={time}',
		Stream: {
			SkipInit: true
		}
	};

	readonly MinimalVideo = {
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

	readonly MinimalAudio = {
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

	readonly FullVideoHTTP = this.FullHTTP('example.mkv');
	readonly FullAudioHTTP = this.FullHTTP('example.mp3');
	readonly FullVideo = this.FullPlayer('video');
	readonly FullAudio = this.FullPlayer('audio');

	readonly MinimalVideoCode = `<ayle-player
	id="angular-minimal-video"
	file="example.mkv"
	driver="mse"
	[http]="HTTP"
	[player]="MinimalVideo">
</ayle-player>`;

	readonly MinimalAudioCode = `<ayle-player
	id="angular-minimal-audio"
	file="example.mp3"
	driver="mse"
	[http]="HTTP"
	[player]="MinimalAudio">
</ayle-player>`;

	readonly FullVideoCode = `<ayle-player
	id="angular-full-video"
	file="example.mkv"
	driver="mse"
	settings="localStorage"
	[http]="FullVideoHTTP"
	[player]="FullVideo"
	(ayleEvent)="OnEvent($event)">
</ayle-player>`;

	readonly FullAudioCode = `<ayle-player
	id="angular-full-audio"
	file="example.mp3"
	driver="mse"
	settings="localStorage"
	[http]="FullAudioHTTP"
	[player]="FullAudio"
	(ayleEvent)="OnEvent($event)">
</ayle-player>`;

	OnEvent (event: AyleAnyAngularEvent): void {
		console.log('Ayle Angular event:', event.Type, event.Data);
	}

	private FullHTTP (file: string) {
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

	private FullPlayer (mediaMode: 'video' | 'audio') {
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
}