import {
	Component,
	ViewChild
} from '@angular/core';
import {
	AylePlayerComponent,
	type AyleAnyAngularEvent,
	type AyleInstance
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
	@ViewChild('videoPlayer')
	private VideoPlayer?: AylePlayerComponent;

	LastEvent = 'none';

	readonly HTTP = {
		MetadataURL: '/server/metadata.php?file={file}',
		TrackURL: '/server/track.php?file={file}&type={kind}&track={track}&start={time}',
		Stream: {
			SkipInit: true
		}
	};

	ToggleVideo (): void {
		const player = this.VideoPlayer?.Player;

		if (!player)
			return;

		if (player.State.Playing)
			player.Pause();
		else
			player.Play();
	}

	RestartVideo (): void {
		const player = this.VideoPlayer?.Player;

		if (!player)
			return;

		player.Seek(0);
		player.Play();
	}

	OnReady (instance: AyleInstance): void {
		console.log('Angular Ayle ready:', instance);
		this.SetLastEvent('ready');
	}

	OnPlay (): void {
		this.SetLastEvent('play');
	}

	OnPause (): void {
		this.SetLastEvent('pause');
	}

	OnError (error: Error | MediaError | null): void {
		console.error('Angular Ayle error:', error);
		this.SetLastEvent('error');
	}

	private SetLastEvent (event: string): void {
		queueMicrotask(() => {
			this.LastEvent = event;
		});
	}

	OnAyleEvent (event: AyleAnyAngularEvent): void {
		console.log('Ayle event:', event.Type, event.Data);
	}
}