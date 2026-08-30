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
		AutoPlay: false,
		AutoFocus: true,
		ShowCenterPlayButton: false,
		MediaMode: 'video',
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

	readonly MinimalAudio = {
		...this.MinimalVideo,
		MediaMode: 'audio',
		UI: {
			...this.MinimalVideo.UI,
			Track: ['artwork', 'title', 'artist', 'album'],
			Overlay: ['track:compact', 'subtitles']
		},
		AudioVisual: {
			Enabled: true
		}
	};

	readonly FullVideo = this.FullPlayer('video');
	readonly FullAudio = {
		...this.FullPlayer('audio'),
		AudioVisual: {
			Enabled: true
		},
		ArtworkSlideshow: {
			Enabled: true
		}
	};

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
	[http]="HTTP"
	[player]="FullVideo"
	(ayleEvent)="OnEvent($event)">
</ayle-player>`;

	readonly FullAudioCode = `<ayle-player
	id="angular-full-audio"
	file="example.mp3"
	driver="mse"
	settings="localStorage"
	[http]="HTTP"
	[player]="FullAudio"
	(ayleEvent)="OnEvent($event)">
</ayle-player>`;

	OnEvent (event: AyleAnyAngularEvent): void {
		console.log('Ayle Angular event:', event.Type, event.Data);
	}

	private FullPlayer (mediaMode: 'video' | 'audio') {
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
				Track: mediaMode === 'audio' ?
					['artwork', 'title', 'artist', 'album'] :
					['title', 'chapter'],
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
}