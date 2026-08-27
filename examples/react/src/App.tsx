import {
	useRef,
	useState
} from 'react';
import {
	AylePlayer,
	type AylePlayerHandle
} from '@qybercom/ayle-react';

export default function App () {
	const video = useRef<AylePlayerHandle>(null);
	const audio = useRef<AylePlayerHandle>(null);
	const [lastEvent, setLastEvent] = useState('none');

	function toggleVideo () {
		const player = video.current?.Player;

		if (!player)
			return;

		if (player.State && player.State.Playing)
			player.Pause();
		else
			player.Play();
	}

	function restartVideo () {
		const player = video.current?.Player;

		if (!player)
			return;

		player.Seek(0);
		player.Play();
	}

	return (
		<main className="app">
			<header className="hero">
				<p className="eyebrow">Ayle React binding</p>
				<h1>Runnable React + TypeScript example</h1>
				<p>
					This app uses the local Ayle core and React binding packages
					from the same repository.
				</p>
			</header>

			<section className="card">
				<div className="card-header">
					<div>
						<h2>Video preset</h2>
						<p>MSE, HTTP metadata/track pipeline, ref access and events.</p>
					</div>

					<div className="actions">
						<button type="button" onClick={toggleVideo}>
							Play / Pause through ref
						</button>

						<button type="button" onClick={restartVideo}>
							Restart
						</button>
					</div>
				</div>

				<AylePlayer
					ref={video}
					id="react-video"
					preset="video"
					file="example.mkv"
					driver="mse"
					settings="localStorage"
					http={{
						MetadataURL: '/server/metadata.php?file={file}',
						TrackURL: '/server/track.php?file={file}&type={kind}&track={track}&start={time}',
						Stream: {
							SkipInit: true
						}
					}}
					events={{
						play: function () {
							setLastEvent('play');
						},
						pause: function () {
							setLastEvent('pause');
						},
						ended: function () {
							setLastEvent('ended');
						},
						error: function (error: unknown) {
							console.error('Ayle video error:', error);
							setLastEvent('error');
						}
					}}
					onReady={function (instance: unknown) {
						console.log('Video Ayle ready:', instance);
						setLastEvent('ready');
					}}
				/>

				<p className="status">
					Last video event: <strong>{lastEvent}</strong>
				</p>
			</section>

			<section className="card">
				<div className="card-header">
					<div>
						<h2>Audio preset</h2>
						<p>
							No explicit localization is supplied, so Ayle uses browser
							localization auto-detection.
						</p>
					</div>
				</div>

				<AylePlayer
					ref={audio}
					id="react-audio"
					preset="audio"
					file="example.mp3"
					driver="mse"
					http={{
						MetadataURL: '/server/metadata.php?file={file}',
						TrackURL: '/server/track.php?file={file}&type={kind}&track={track}&start={time}',
						Stream: {
							SkipInit: true
						}
					}}
					events={{
						error: function (error: unknown) {
							console.error('Ayle audio error:', error);
						}
					}}
				/>
			</section>
		</main>
	);
}