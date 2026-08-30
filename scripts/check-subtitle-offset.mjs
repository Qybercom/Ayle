import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../ayle.js', import.meta.url), 'utf8');
globalThis.window = globalThis;
vm.runInThisContext(source, { filename: 'ayle.js' });

function assert(value, message) {
	if (!value)
		throw new Error(message);
}

function makeUI(position, offset, customCues, nativeActiveCues) {
	return {
		Player: {
			Options: {
				SubtitleOffset: offset
			},
			State: {
				Position: position,
				Source: null,
				SubtitleTrack: {
					Cues: customCues,
					Native: {
						mode: 'hidden',
						activeCues: nativeActiveCues
					}
				}
			}
		}
	};
}

const previousCue = { Start: 5, End: 10, Text: 'previous' };
const nativePreviousCue = { startTime: 5, endTime: 10, text: 'previous-native' };

/*
 * With -2.85, a 5..10 cue is active at 2.15..7.15. At 8 seconds the
 * shifted cue is already over, even though the browser's unshifted
 * activeCues may still contain it until 10 seconds.
 */
let ui = makeUI(8, -2.85, [previousCue], [nativePreviousCue]);
let cues = globalThis.AyleUI.prototype.GetActiveSubtitleCues.call(ui);
assert(cues.length === 0, 'Unshifted native cue must not revive an expired offset cue');

ui = makeUI(7, -2.85, [previousCue], [nativePreviousCue]);
cues = globalThis.AyleUI.prototype.GetActiveSubtitleCues.call(ui);
assert(cues.length === 1 && cues[0] === previousCue, 'Shifted custom cue should remain active inside its offset interval');

/* Native remains a compatibility fallback when parsed cue data is absent. */
ui = makeUI(8, -2.85, [], [nativePreviousCue]);
cues = globalThis.AyleUI.prototype.GetActiveSubtitleCues.call(ui);
assert(cues.length === 1 && cues[0] === nativePreviousCue, 'Native fallback should remain available without parsed cues');

console.log('Ayle subtitle offset regression validation passed.');
