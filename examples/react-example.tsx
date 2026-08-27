import '@qybercom/ayle/ayle.css';
import {
	AylePlayer,
	type AylePlayerHandle
} from '@qybercom/ayle-react';
import {
	useRef,
	type CSSProperties
} from 'react';

const playerStyle: CSSProperties = {
	width: '100%',
	maxWidth: '960px',
	aspectRatio: '16 / 9'
};

export default function AyleReactExample () {
	const ayle = useRef<AylePlayerHandle>(null);

	return (
		<AylePlayer
			ref={ayle}
			id="react-example"
			preset="video"
			file="example.mkv"
			driver="mse"
			style={playerStyle}
			http={{
				MetadataURL: '../../server/metadata.php?file={file}',
				TrackURL: '../../server/track.php?file={file}&type={kind}&track={track}&start={time}',
				Stream: {
					SkipInit: true
				}
			}}
			events={{
				play: function () {
					console.log('Ayle: play');
				},
				pause: function () {
					console.log('Ayle: pause');
				},
				error: function (error) {
					console.error('Ayle:', error);
				}
			}}
			onReady={function (instance) {
				console.log('Ayle ready:', instance);
			}}
		/>
	);
}