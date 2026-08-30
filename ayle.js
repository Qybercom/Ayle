(function (global) {
	'use strict';

	function AyleEventEmitter () {
		this._events = {};
	}

	AyleEventEmitter.prototype.On = function (name, callback) {
		if (!this._events[name])
			this._events[name] = [];

		this._events[name].push(callback);
		return this;
	};

	AyleEventEmitter.prototype.Off = function (name, callback) {
		var list = this._events[name];

		if (!list)
			return this;

		var i = list.length;

		while (i--) {
			if (list[i] === callback)
				list.splice(i, 1);
		}

		return this;
	};

	AyleEventEmitter.prototype.Once = function (name, callback) {
		var self = this;

		var wrapper = function (data) {
			self.Off(name, wrapper);
			callback(data);
		};

		this.On(name, wrapper);
		return this;
	};

	AyleEventEmitter.prototype.Emit = function (name, data) {
		var list = this._events[name];

		if (list) {
			// Make a copy so handlers can safely detach themselves while emitting.
			list = list.slice(0);

			var i = 0;
			var count = list.length;

			while (i < count) {
				list[i](data);
				i++;
			}
		}

		if (
			this._eventTarget &&
			this._eventTarget !== this &&
			this._eventPrefix
		)
			this._eventTarget.Emit(this._eventPrefix + name, data);

		return this;
	};

	AyleEventEmitter.prototype.SetEventTarget = function (target, prefix) {
		this._eventTarget = target || null;
		this._eventPrefix = prefix || '';
		return this;
	};


	function AyleMediaVariant (options) {
		options = options || {};

		this.ID = options.ID || '';
		this.URL = options.URL || '';
		this.Type = options.Type || '';
		this.Width = options.Width || 0;
		this.Height = options.Height || 0;
		this.Bitrate = options.Bitrate || 0;
		this.FrameRate = Number(options.FrameRate) || 0;
		this.Codecs = options.Codecs || '';
		this.Label = options.Label || '';
		this.Default = !!options.Default;
		this.Stream = options.Stream || null;
	}

	function AyleMediaTrack (options) {
		options = options || {};

		this.ID = options.ID || '';
		this.URL = options.URL || '';
		this.Type = options.Type || '';
		this.Codecs = options.Codecs || '';
		this.Language = options.Language || '';
		this.Label = options.Label || '';
		this.Default = !!options.Default;
		this.Forced = !!options.Forced;
		this.Native = options.Native || null;
		this.Cues = options.Cues || [];
		this.Stream = options.Stream || null;
	}


	function AyleMediaCover (options) {
		options = options || {};

		this.ID = options.ID || '';
		this.URL = options.URL || '';
		this.Type = options.Type || '';
		this.Codec = options.Codec || '';
		this.Width = Number(options.Width) || 0;
		this.Height = Number(options.Height) || 0;
		this.Label = options.Label || '';
		this.Default = !!options.Default;
		this.AttachedPicture = options.AttachedPicture !== false;
		this.Source = options.Source || null;
	}

	function AyleMediaChapter (options) {
		options = options || {};

		this.ID = options.ID !== undefined && options.ID !== null ? String(options.ID) : '';
		this.Start = Number(options.Start) || 0;
		this.End = Number(options.End) || 0;
		this.Title = options.Title || '';
		this.Native = options.Native || null;
	}

	function AyleSource (options) {
		options = options || {};

		this.ID = options.ID || '';
		this.URL = options.URL || '';
		this.Type = options.Type || '';
		this.Codecs = options.Codecs || '';
		this.Title = options.Title || '';
		this.Artist = options.Artist || '';
		this.Album = options.Album || '';
		this.Duration = Number(options.Duration) || 0;
		this.Live = !!options.Live;
		this.MediaMode = options.MediaMode || 'auto';
		this.Cover = options.Cover || '';
		this.Covers = options.Covers || [];
		this.Stream = options.Stream || null;
		this.Variants = options.Variants || [];
		this.AudioTracks = options.AudioTracks || [];
		this.SubtitleTracks = options.SubtitleTracks || [];
		this.Chapters = options.Chapters || [];
	}

	function AyleIsElement (value) {
		return !!(
			value &&
			value.nodeType === 1 &&
			typeof value.querySelector === 'function'
		);
	}

	function AyleResolveElement (target, label) {
		label = label || 'Ayle target';

		if (typeof target === 'string') {
			var selector = String(target);
			var elements;

			try {
				elements = document.querySelectorAll(selector);
			}
			catch (error) {
				throw new Error(label + ' selector is invalid: ' + selector);
			}

			if (!elements.length)
				throw new Error(label + ' was not found: ' + selector);

			if (elements.length !== 1)
				throw new Error(
					label + ' selector must resolve to exactly one Element; ' +
					'matched ' + elements.length + ': ' + selector
				);

			return elements[0];
		}

		if (!AyleIsElement(target))
			throw new Error(
				label + ' must be a single DOM Element or a selector ' +
				'resolving to exactly one Element'
			);

		return target;
	}


	function AyleReadTimeRanges (ranges) {
		var result = [];
		var i = 0;
		var count = ranges ? ranges.length : 0;

		while (i < count) {
			result.push({
				Start: ranges.start(i),
				End: ranges.end(i)
			});
			i++;
		}

		return result;
	}


	function AyleMediaDriver () {
		AyleEventEmitter.call(this);
		this.UI = null;
		this.Options = {};
	}

	AyleMediaDriver.prototype = Object.create(AyleEventEmitter.prototype);
	AyleMediaDriver.prototype.constructor = AyleMediaDriver;

	AyleMediaDriver.prototype.SetUI = function (ui) {
		this.UI = ui || null;
		return this;
	};

	AyleMediaDriver.prototype.SetOptions = function (options) {
		this.Options = options || {};
		return this;
	};

	AyleMediaDriver.prototype.Load = function (source) {};
	AyleMediaDriver.prototype.Play = function () {};
	AyleMediaDriver.prototype.Pause = function () {};
	AyleMediaDriver.prototype.Seek = function (position) {};
	AyleMediaDriver.prototype.SetVariant = function (variant) { return false; };
	AyleMediaDriver.prototype.SetAudioTrack = function (track) { return false; };
	AyleMediaDriver.prototype.SetSubtitleTrack = function (track) { return false; };
	AyleMediaDriver.prototype.SetNativeSubtitles = function (enabled) { return false; };
	AyleMediaDriver.prototype.GetPosition = function () { return 0; };
	AyleMediaDriver.prototype.GetDuration = function () { return 0; };
	AyleMediaDriver.prototype.SetVolume = function (volume) {};
	AyleMediaDriver.prototype.GetVolume = function () { return 1; };
	AyleMediaDriver.prototype.SetMuted = function (muted) {};
	AyleMediaDriver.prototype.GetMuted = function () { return false; };
	AyleMediaDriver.prototype.SetPlaybackRate = function (rate) {};
	AyleMediaDriver.prototype.GetPlaybackRate = function () { return 1; };
	AyleMediaDriver.prototype.SupportsPictureInPicture = function () { return false; };
	AyleMediaDriver.prototype.EnterPictureInPicture = function () { return false; };
	AyleMediaDriver.prototype.ExitPictureInPicture = function () { return false; };
	AyleMediaDriver.prototype.SetRequestHeader = function (name, value) { return this; };
	AyleMediaDriver.prototype.SetRequestHeaders = function (headers) { return this; };
	AyleMediaDriver.prototype.SetDebug = function (value) { return this; };
	AyleMediaDriver.prototype.SetDebugMP4 = function (value) { return this; };
	AyleMediaDriver.prototype.GetCodecCandidates = function () { return []; };
	AyleMediaDriver.prototype.SupportsCodec = function (type, codec) { return false; };
	AyleMediaDriver.prototype.Destroy = function () {};

	AyleMediaDriver.prototype.GetSupportedCodecs = function (candidates) {
		var result = [];
		var seen = {};
		var groups = candidates || this.GetCodecCandidates() || [];
		var i = 0;

		while (i < groups.length) {
			var group = groups[i] || {};
			var codecs = group.Codecs || [];
			var j = 0;

			while (j < codecs.length) {
				var codec = codecs[j];

				if (!seen[codec] && this.SupportsCodec(group.Type, codec)) {
					seen[codec] = true;
					result.push(codec);
				}

				j++;
			}

			i++;
		}

		return result;
	};


	function AyleHTML5MediaDriver () {
		AyleMediaDriver.call(this);

		this.Element = null;
		this._domListeners = [];
		this.Source = null;
		this.RequestHeaders = {};
		this.NativeSubtitles = false;
		this._subtitleSourceTracks = [];
		this._subtitleObjectURLs = [];
		this._chapterTextTracks = [];
		this._eventsBound = false;
		this._volume = 1;
		this._muted = false;
		this._playbackRate = 1;
	}

	AyleHTML5MediaDriver.prototype = Object.create(AyleMediaDriver.prototype);
	AyleHTML5MediaDriver.prototype.constructor = AyleHTML5MediaDriver;

	AyleHTML5MediaDriver.prototype._listen = function (target, name, callback) {
		if (!target || typeof target.addEventListener !== 'function')
			return callback;

		target.addEventListener(name, callback);
		this._domListeners.push({
			Target: target,
			Name: name,
			Callback: callback
		});
		return callback;
	};

	AyleHTML5MediaDriver.prototype._unbindDOMEvents = function () {
		var i = this._domListeners.length;

		while (i--) {
			var item = this._domListeners[i];

			if (
				item.Target &&
				typeof item.Target.removeEventListener === 'function'
			)
				item.Target.removeEventListener(
					item.Name,
					item.Callback
				);
		}

		this._domListeners = [];
		this._eventsBound = false;
		return this;
	};

	AyleHTML5MediaDriver.prototype.SetUI = function (ui) {
		if (!ui) {
			if (this.Element) {
				try {
					this.Element.pause();
				}
				catch (ignore) {}

				try {
					this.Element.removeAttribute('src');
					this.Element.load();
				}
				catch (ignore) {}
			}

			this._unbindDOMEvents();
			this.Element = null;
			AyleMediaDriver.prototype.SetUI.call(this, null);
			return this;
		}

		var element = ui.MediaElement || null;

		if (!element)
			throw new Error('Ayle media driver requires a UI with a media element');

		if (this.Element && this.Element !== element)
			this.SetUI(null);

		AyleMediaDriver.prototype.SetUI.call(this, ui);
		this.Element = element;

		if (!this._eventsBound) {
			this._bindEvents();
			this._bindDriverMediaEvents();
			this._eventsBound = true;
		}

		this.Element.volume = this._volume;
		this.Element.muted = this._muted;
		this.Element.playbackRate = this._playbackRate;

		return this;
	};

	AyleHTML5MediaDriver.prototype.SetOptions = function (options) {
		AyleMediaDriver.prototype.SetOptions.call(this, options);
		return this;
	};

	AyleHTML5MediaDriver.prototype._bindDriverMediaEvents = function () {
	};

		AyleHTML5MediaDriver.prototype.SetRequestHeader = function (name, value) {
		if (!name)
			return this;

		if (value === undefined || value === null || value === '')
			delete this.RequestHeaders[name];
		else
			this.RequestHeaders[name] = String(value);

		return this;
	};

	AyleHTML5MediaDriver.prototype.SetRequestHeaders = function (headers) {
		this.RequestHeaders = {};

		if (!headers)
			return this;

		for (var name in headers) {
			if (Object.prototype.hasOwnProperty.call(headers, name))
				this.SetRequestHeader(name, headers[name]);
		}

		return this;
	};

	AyleHTML5MediaDriver.prototype._applyRequestHeaders = function (xhr) {
		var headers = this.RequestHeaders || {};

		for (var name in headers) {
			if (Object.prototype.hasOwnProperty.call(headers, name))
				xhr.setRequestHeader(name, headers[name]);
		}
	};

	AyleHTML5MediaDriver.prototype._applyMediaRequestHeaders = function (xhr, options) {
		this._applyRequestHeaders(xhr);
		options = options || {};

		/*
		 * A metadata request may advertise every codec supported by the browser.
		 * A fragment request may not: its SourceBuffer already has one concrete
		 * codec, so require the backend to return that exact codec.
		 */
		if (options.CodecHeader && options.Codec)
			xhr.setRequestHeader(options.CodecHeader, options.Codec);

		if (
			options.CodecListHeader &&
			options.CodecList &&
			options.CodecList.length
		)
			xhr.setRequestHeader(
				options.CodecListHeader,
				options.CodecList.join(',')
			);
	};

	AyleHTML5MediaDriver.prototype.SupportsCodec = function (type, codec) {
		if (!this.Element || typeof this.Element.canPlayType !== 'function' || !type)
			return false;

		var mime = type;
		if (codec)
			mime += '; codecs="' + codec + '"';

		return this.Element.canPlayType(mime) !== '';
	};

	AyleHTML5MediaDriver.prototype._bindEvents = function () {
		var self = this;
		var media = this.Element;

		this._listen(media, 'loadstart', function () {
			self.Emit('loadStart');
		});

		this._listen(media, 'loadedmetadata', function () {
			self.Emit('metadata', {
				Duration: media.duration,
				Width: media.videoWidth || 0,
				Height: media.videoHeight || 0
			});

			self.Emit('subtitleTracksChange', self._readSubtitleTracks());
			self.Emit('audioTracksChange', self._readAudioTracks());
		});

		this._listen(media, 'canplay', function () {
			self.Emit('ready');
		});

		this._listen(media, 'play', function () {
			self.Emit('play');
		});

		this._listen(media, 'playing', function () {
			self.Emit('playing');
		});

		this._listen(media, 'pause', function () {
			self.Emit('pause');
		});

		this._listen(media, 'ended', function () {
			self.Emit('ended');
		});

		this._listen(media, 'waiting', function () {
			self.Emit('buffering', true);
		});

		this._listen(media, 'stalled', function () {
			self.Emit('buffering', true);
		});

		this._listen(media, 'timeupdate', function () {
			self.Emit('timeUpdate', {
				Position: media.currentTime,
				Duration: media.duration
			});
		});

		this._listen(media, 'durationchange', function () {
			self.Emit('durationChange', media.duration);
		});

		this._listen(media, 'progress', function () {
			self.Emit('progress', {
				Buffered: AyleReadTimeRanges(media.buffered),
				Seekable: AyleReadTimeRanges(media.seekable)
			});
		});

		this._listen(media, 'volumechange', function () {
			self.Emit('volumeChange', {
				Volume: media.volume,
				Muted: media.muted
			});
		});

		this._listen(media, 'ratechange', function () {
			self.Emit('rateChange', media.playbackRate);
		});

		this._listen(media, 'seeking', function () {
			self.Emit('seeking', true);
		});

		this._listen(media, 'seeked', function () {
			self.Emit('seeked');
			self.Emit('seeking', false);
		});

		this._listen(media, 'error', function () {
			self.Emit('error', media.error);
		});

		this._listen(media, 'enterpictureinpicture', function () {
			self.Emit('pictureInPictureChange', true);
		});

		this._listen(media, 'leavepictureinpicture', function () {
			self.Emit('pictureInPictureChange', false);
		});

		if (media.textTracks && media.textTracks.addEventListener) {
			this._listen(media.textTracks, 'addtrack', function () {
				self.Emit('subtitleTracksChange', self._readSubtitleTracks());
			});
			this._listen(media.textTracks, 'removetrack', function () {
				self.Emit('subtitleTracksChange', self._readSubtitleTracks());
			});
			this._listen(media.textTracks, 'change', function () {
				self.Emit('subtitleTracksChange', self._readSubtitleTracks());
			});
		}

		if (media.audioTracks && media.audioTracks.addEventListener) {
			this._listen(media.audioTracks, 'addtrack', function () {
				self.Emit('audioTracksChange', self._readAudioTracks());
			});
			this._listen(media.audioTracks, 'removetrack', function () {
				self.Emit('audioTracksChange', self._readAudioTracks());
			});
			this._listen(media.audioTracks, 'change', function () {
				self.Emit('audioTracksChange', self._readAudioTracks());
			});
		}
	};

	AyleHTML5MediaDriver.prototype._clearSubtitleTracks = function () {
		var tracks = this.Element.querySelectorAll('track[data-ayle-track=\'1\']');
		var i = tracks.length;

		while (i--)
			tracks[i].parentNode.removeChild(tracks[i]);

		i = this._subtitleObjectURLs.length;
		while (i--) {
			try { URL.revokeObjectURL(this._subtitleObjectURLs[i]); }
			catch (ignore) {}
		}

		this._subtitleObjectURLs = [];
		this._subtitleSourceTracks = [];
	};

	AyleHTML5MediaDriver.prototype._normalizeSubtitleText = function (text) {
		text = text === undefined || text === null ? '' : String(text);

		/* Strip UTF-8 BOM if XMLHttpRequest preserved it. */
		if (text.charCodeAt(0) === 0xFEFF)
			text = text.substring(1);

		/* Normalize line endings first. */
		text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

		/* Already WebVTT. */
		if (/^WEBVTT(?:\s|$)/i.test(text))
			return text;

		/*
		 * SubRip -> WebVTT. Numeric cue identifiers are legal WebVTT cue IDs,
		 * so the only syntax change required for ordinary SRT is the timestamp
		 * decimal separator. Keep cue text (including simple markup) untouched.
		 */
		text = text.replace(
			/(\d{1,2}:\d{2}:\d{2}),(\d{3})(\s*-->\s*)(\d{1,2}:\d{2}:\d{2}),(\d{3})/g,
			'$1.$2$3$4.$5'
		);

		return 'WEBVTT\n\n' + text;
	};


	AyleHTML5MediaDriver.prototype._parseSubtitleTime = function (value) {
		value = String(value || '').replace(/^\s+|\s+$/g, '');

		var parts = value.split(':');
		var seconds = 0;

		if (parts.length === 3) {
			seconds += (parseFloat(parts[0]) || 0) * 3600;
			seconds += (parseFloat(parts[1]) || 0) * 60;
			seconds += parseFloat(parts[2]) || 0;
		}
		else if (parts.length === 2) {
			seconds += (parseFloat(parts[0]) || 0) * 60;
			seconds += parseFloat(parts[1]) || 0;
		}
		else
			seconds = parseFloat(value) || 0;

		return seconds;
	};

	AyleHTML5MediaDriver.prototype._parseSubtitleCues = function (text) {
		text = this._normalizeSubtitleText(text || '');
		var lines = text.split('\n');
		var result = [];
		var i = 0;

		while (i < lines.length) {
			var line = lines[i].replace(/^\s+|\s+$/g, '');

			if (
				!line ||
				/^WEBVTT(?:\s|$)/i.test(line) ||
				/^NOTE(?:\s|$)/i.test(line) ||
				/^STYLE(?:\s|$)/i.test(line) ||
				/^REGION(?:\s|$)/i.test(line)
			) {
				i++;
				continue;
			}

			var id = '';
			var timing = line;

			if (timing.indexOf('-->') === -1 && i + 1 < lines.length) {
				id = timing;
				i++;
				timing = lines[i].replace(/^\s+|\s+$/g, '');
			}

			if (timing.indexOf('-->') === -1) {
				i++;
				continue;
			}

			var arrow = timing.indexOf('-->');
			var startText = timing.substring(0, arrow).replace(/^\s+|\s+$/g, '');
			var endPart = timing.substring(arrow + 3).replace(/^\s+|\s+$/g, '');
			var space = endPart.indexOf(' ');
			var endText = space === -1 ? endPart : endPart.substring(0, space);

			var start = this._parseSubtitleTime(startText);
			var end = this._parseSubtitleTime(endText);

			i++;
			var cueLines = [];

			while (i < lines.length && lines[i].replace(/^\s+|\s+$/g, '') !== '') {
				cueLines.push(lines[i]);
				i++;
			}

			if (isFinite(start) && isFinite(end) && end > start) {
				result.push({
					ID: id,
					Start: start,
					End: end,
					Text: cueLines.join('\n')
				});
			}

			i++;
		}

		return result;
	};

	AyleHTML5MediaDriver.prototype._loadSubtitleTracks = function (source) {
		this._clearSubtitleTracks();

		var self = this;
		var media = this.Element;
		var tracks = source.SubtitleTracks || [];
		var i = 0;
		var count = tracks.length;

		var appendTrack = function (item, url) {
			var element = document.createElement('track');
			element.setAttribute('data-ayle-track', '1');
			element.kind = 'subtitles';
			element.src = url;
			element._MediaTrackID = item.ID;

			if (item.ID)
				element.id = item.ID;

			if (item.Language)
				element.srclang = item.Language;

			if (item.Label)
				element.label = item.Label;

			/*
			 * Do NOT set element.default from container metadata. Subtitle
			 * auto-selection is a Ayle policy and is disabled by default.
			 */
			self._subtitleSourceTracks.push(item);

			/*
			 * A <track> whose TextTrack remains disabled is not required to
			 * load/parse its WebVTT resource. That is especially visible with
			 * <audio>: the track exists, but cues/activeCues stay empty forever.
			 *
			 * Temporarily switch it to hidden to force the browser to load and
			 * parse the Blob URL. On load we disable it again BEFORE notifying
			 * Ayle, so actual subtitle selection remains Ayle policy.
			 */
			element.addEventListener('load', function () {
				if (element.track)
					element.track.mode = 'disabled';

				self.Emit('subtitleTracksChange', self._readSubtitleTracks());
			});

			media.appendChild(element);

			if (element.track)
				element.track.mode = 'hidden';
		};

		while (i < count) {
			(function (item) {
				if (!item.URL)
					return;

				/*
				 * Always fetch subtitle text ourselves. This lets the player attach
				 * X-Media-Codec/custom headers and, importantly, convert SubRip/SRT
				 * responses to WebVTT before handing them to HTMLMediaElement.
				 */
				var xhr = new XMLHttpRequest();
				xhr.open('GET', item.URL, true);
				self._applyRequestHeaders(xhr);

				xhr.onload = function () {
					if (xhr.status < 200 || xhr.status >= 300) {
						self.Emit('error', new Error('HTTP ' + xhr.status + ' while loading subtitle ' + item.URL));
						return;
					}

					var vtt = self._normalizeSubtitleText(xhr.responseText || '');

					/*
					 * Keep our own parsed cue timeline as well. Audio playback
					 * must not depend on browser TextTrack.activeCues support.
					 */
					item.Cues = self._parseSubtitleCues(vtt);

					/*
					 * Do not wait for the browser TextTrack lifecycle to propagate
					 * parsed cue data back into Ayle.State. The source AyleMediaTrack
					 * is the canonical subtitle object for our HTML renderer.
					 */
					self.Emit('subtitleData', {
						ID: item.ID,
						Cues: item.Cues,
						Track: item
					});

					var blob = new Blob([vtt], { type: 'text/vtt;charset=utf-8' });
					var objectURL = URL.createObjectURL(blob);
					self._subtitleObjectURLs.push(objectURL);
					appendTrack(item, objectURL);
				};

				xhr.onerror = function () {
					self.Emit('error', new Error('Network error while loading subtitle ' + item.URL));
				};

				xhr.send();
			})(tracks[i]);

			i++;
		}
	};

	AyleHTML5MediaDriver.prototype._readSubtitleTracks = function () {
		var nativeTracks = this.Element.textTracks;
		var result = [];
		var i = 0;
		var count = nativeTracks ? nativeTracks.length : 0;

		while (i < count) {
			var nativeTrack = nativeTracks[i];

			if (nativeTrack.kind !== 'subtitles' && nativeTrack.kind !== 'captions') {
				i++;
				continue;
			}

			var sourceTrack = null;
			var j = 0;
			var sourceCount = this._subtitleSourceTracks.length;

			while (j < sourceCount) {
				var candidate = this._subtitleSourceTracks[j];
				if (
					(candidate.ID && nativeTrack.id === candidate.ID) ||
					(candidate.Label && nativeTrack.label === candidate.Label && candidate.Language === nativeTrack.language)
				) {
					sourceTrack = candidate;
					break;
				}
				j++;
			}

			result.push(new AyleMediaTrack({
				ID: sourceTrack ? sourceTrack.ID : (nativeTrack.id || String(i)),
				URL: sourceTrack ? sourceTrack.URL : '',
				Type: sourceTrack ? sourceTrack.Type : '',
				Language: nativeTrack.language || (sourceTrack ? sourceTrack.Language : ''),
				Label: nativeTrack.label || (sourceTrack ? sourceTrack.Label : ''),
				Default: sourceTrack ? sourceTrack.Default : false,
				Forced: sourceTrack ? sourceTrack.Forced : false,
				Native: nativeTrack,
				Cues: sourceTrack ? (sourceTrack.Cues || []) : []
			}));

			i++;
		}

		return result;
	};

	AyleHTML5MediaDriver.prototype._readAudioTracks = function () {
		var media = this.Element;
		var result = [];

		if (!media.audioTracks)
			return result;

		var tracks = media.audioTracks;
		var i = 0;
		var count = tracks.length;

		while (i < count) {
			var nativeTrack = tracks[i];

			result.push(new AyleMediaTrack({
				ID: nativeTrack.id || String(i),
				Language: nativeTrack.language || '',
				Label: nativeTrack.label || '',
				Native: nativeTrack
			}));

			i++;
		}

		return result;
	};

	AyleHTML5MediaDriver.prototype._loadChapterTracks = function (chapters) {
		var i = 0;
		var count = this._chapterTextTracks.length;

		while (i < count) {
			try { this._chapterTextTracks[i].mode = 'disabled'; }
			catch (ignore) {}
			i++;
		}

		this._chapterTextTracks = [];

		if (!chapters || !chapters.length || !this.Element.addTextTrack)
			return null;

		var nativeTrack = this.Element.addTextTrack('chapters', 'Chapters', '');
		nativeTrack.mode = 'hidden';

		i = 0;
		count = chapters.length;

		while (i < count) {
			var chapter = chapters[i];
			var start = Number(chapter.Start);
			var end = Number(chapter.End);

			if (isFinite(start) && isFinite(end) && end > start && global.VTTCue) {
				var cue = new global.VTTCue(start, end, chapter.Title || ('Chapter ' + (i + 1)));
				cue.id = chapter.ID !== undefined && chapter.ID !== null ? String(chapter.ID) : String(i);
				nativeTrack.addCue(cue);
				chapter.Native = cue;
			}

			i++;
		}

		this._chapterTextTracks.push(nativeTrack);
		return nativeTrack;
	};

	AyleHTML5MediaDriver.prototype.Load = function (source) {
		this.Source = source;
		this._loadSubtitleTracks(source);
		this._loadChapterTracks(source.Chapters);

		if (!source.Variants.length && source.URL) {
			this.Element.src = source.URL;
			this.Element.load();
		}

		return true;
	};

	AyleHTML5MediaDriver.prototype.SetVariant = function (variant) {
		if (!variant || !variant.URL)
			return false;

		this.Element.src = variant.URL;
		this.Element.load();
		return true;
	};

	AyleHTML5MediaDriver.prototype.Play = function () {
		return this.Element.play();
	};

	AyleHTML5MediaDriver.prototype.Pause = function () {
		this.Element.pause();
	};

	AyleHTML5MediaDriver.prototype.Seek = function (position) {
		this.Element.currentTime = position;
		return true;
	};

	AyleHTML5MediaDriver.prototype.GetPosition = function () {
		return this.Element.currentTime;
	};

	AyleHTML5MediaDriver.prototype.GetDuration = function () {
		return this.Element.duration;
	};

	AyleHTML5MediaDriver.prototype.SetVolume = function (volume) {
		if (volume < 0)
			volume = 0;

		if (volume > 1)
			volume = 1;

		this._volume = volume;

		if (this.Element)
			this.Element.volume = volume;
	};

	AyleHTML5MediaDriver.prototype.GetVolume = function () {
		return this.Element ? this.Element.volume : this._volume;
	};

	AyleHTML5MediaDriver.prototype.SetMuted = function (muted) {
		this._muted = !!muted;

		if (this.Element)
			this.Element.muted = this._muted;
	};

	AyleHTML5MediaDriver.prototype.GetMuted = function () {
		return this.Element ? this.Element.muted : this._muted;
	};

	AyleHTML5MediaDriver.prototype.SetPlaybackRate = function (rate) {
		this._playbackRate = rate;

		if (this.Element)
			this.Element.playbackRate = rate;
	};

	AyleHTML5MediaDriver.prototype.GetPlaybackRate = function () {
		return this.Element ? this.Element.playbackRate : this._playbackRate;
	};

	AyleHTML5MediaDriver.prototype.SetAudioTrack = function (track) {
		var tracks = this.Element.audioTracks;

		if (!tracks || !track || !track.Native)
			return false;

		var i = 0;
		var count = tracks.length;

		while (i < count) {
			tracks[i].enabled = tracks[i] === track.Native;
			i++;
		}

		return true;
	};

	AyleHTML5MediaDriver.prototype.SetNativeSubtitles = function (enabled) {
		this.NativeSubtitles = !!enabled;
		return true;
	};

	AyleHTML5MediaDriver.prototype.SetSubtitleTrack = function (track) {
		var tracks = this.Element.textTracks;
		var i = 0;
		var count = tracks ? tracks.length : 0;

		/* Only subtitle/caption tracks belong to subtitle selection.
		 * Chapter/metadata tracks must remain hidden and usable. */
		while (i < count) {
			if (tracks[i].kind === 'subtitles' || tracks[i].kind === 'captions')
				tracks[i].mode = 'disabled';
			i++;
		}

		if (!track)
			return true;

		if (!track.Native)
			return false;

		/* hidden keeps activeCues updated but suppresses browser rendering. */
		track.Native.mode = this.NativeSubtitles ? 'showing' : 'hidden';
		return true;
	};

	AyleHTML5MediaDriver.prototype.SupportsPictureInPicture = function () {
		return !!(
			this.Element &&
			typeof this.Element.requestPictureInPicture === 'function' &&
			document.pictureInPictureEnabled !== false
		);
	};

	AyleHTML5MediaDriver.prototype.EnterPictureInPicture = function () {
		if (!this.SupportsPictureInPicture())
			return false;

		return this.Element.requestPictureInPicture();
	};

	AyleHTML5MediaDriver.prototype.ExitPictureInPicture = function () {
		if (!document.pictureInPictureElement)
			return false;

		return document.exitPictureInPicture();
	};


	function AyleMSEStreamLoader (driver, buffer, item, generation, kind) {
		this.Driver = driver;
		this.Kind = kind || 'media';
		this.Buffer = buffer;
		this.Item = item;
		this.Generation = generation;
		this.Options = item.Stream || {};
		this.Mode = this.Options.Mode || 'range';
		this.ChunkSize = this.Options.ChunkSize || (2 * 1024 * 1024);
		this.BufferAhead = this.Options.BufferAhead || 30;
		this.BufferBehind = this.Options.BufferBehind || 20;
		this.NextByte = 0;
		this.TotalBytes = null;
		this.NextTime = 0;
		this.SegmentIndex = 0;
		this.InitLoaded = false;
		this.Loading = false;
		this.Ended = false;
		this.Stopped = false;
		this.Request = null;
		this._resetGeneration = 0;
		this.Seeking = false;
		this._quotaRecovering = false;
		this.AlignTimestamps = this.Options.AlignTimestamps !== false;

		/*
		 * time-mode flow control.  Do not trust X-Media-End blindly: an
		 * independently muxed fMP4 response may contain more (or less) media
		 * than the HTTP interval claims.  After append/updateend we use the
		 * SourceBuffer's real buffered range as the authoritative next point.
		 */
		this.NoProgressCount = 0;
		this.MaxNoProgressRequests = this.Options.MaxNoProgressRequests;
		if (this.MaxNoProgressRequests === undefined || this.MaxNoProgressRequests === null)
			this.MaxNoProgressRequests = 3;
		this.UseBufferedEndForNextTime = this.Options.UseBufferedEndForNextTime !== false;

		/* Gap-repair protection. Pump decisions are made relative to currentTime,
		 * so a forward cursor must never run away while the playback head itself
		 * is not covered by this SourceBuffer. */
		this.GapTolerance = this.Options.GapTolerance;
		if (this.GapTolerance === undefined || this.GapTolerance === null)
			this.GapTolerance = 0.15;
		this.MaxGapRetries = this.Options.MaxGapRetries;
		if (this.MaxGapRetries === undefined || this.MaxGapRetries === null)
			this.MaxGapRetries = 2;
		this.GapRetryCount = 0;
		this.LastGapTime = null;
	}


	AyleMSEStreamLoader.prototype.MarkEnded = function () {
		if (this.Ended)
			return;

		this.Ended = true;
		this.Loading = false;
		this.Driver._emitMSEProgress();
		this.Driver._checkEndOfStream();
	};

	AyleMSEStreamLoader.prototype.Stop = function () {
		this.Stopped = true;
		this._resetGeneration++;

		if (this.Request) {
			try { this.Request.abort(); }
			catch (ignore) {}
			this.Request = null;
		}
	};

	AyleMSEStreamLoader.prototype._valid = function () {
		return !this.Stopped &&
			this.Generation === this.Driver._generation &&
			this.Buffer &&
			this.Driver._mediaSource &&
			this.Driver._mediaSource.readyState === 'open';
	};

	AyleMSEStreamLoader.prototype._bufferedEnd = function (position) {
		var ranges = this.Buffer.buffered;
		var i = 0;
		var count = ranges.length;

		while (i < count) {
			if (position >= ranges.start(i) - 0.1 && position <= ranges.end(i) + 0.1)
				return ranges.end(i);
			i++;
		}

		return position;
	};

	AyleMSEStreamLoader.prototype._contains = function (position, tolerance) {
		var ranges = this.Buffer.buffered;
		var i = 0;
		var count = ranges.length;

		if (tolerance === undefined || tolerance === null)
			tolerance = 0;

		while (i < count) {
			if (
				position >= ranges.start(i) - tolerance &&
				position <= ranges.end(i) + tolerance
			)
				return true;
			i++;
		}

		return false;
	};

	AyleMSEStreamLoader.prototype._selectTimeRequestPoint = function () {
		var position = this.Driver.Element.currentTime || 0;

		/* If playback head is in a hole, repairing that hole has priority over
		 * prefetching at NextTime. This is the critical distinction that prevents
		 * a request storm while currentTime is stalled. */
		if (!this._contains(position, this.GapTolerance))
			return { Time: position, GapRepair: true };

		return { Time: this.NextTime, GapRepair: false };
	};

	AyleMSEStreamLoader.prototype._needsData = function () {
		if (this.Ended)
			return false;

		var position = this.Driver.Element.currentTime || 0;
		var end = this._bufferedEnd(position);
		return end - position < this.BufferAhead;
	};

	AyleMSEStreamLoader.prototype._removeRanges = function (ranges, callback) {
		var self = this;
		var index = 0;

		var next = function () {
			if (!self._valid())
				return;

			if (index >= ranges.length) {
				self.Driver._emitMSEProgress();
				callback();
				return;
			}

			var range = ranges[index++];
			if (range.End <= range.Start) {
				next();
				return;
			}

			self.Driver._waitSourceBuffer(self.Buffer, function () {
				if (!self._valid())
					return;

				var done = function () {
					self.Buffer.removeEventListener('updateend', done);
					self.Buffer.removeEventListener('error', fail);
					next();
				};

				var fail = function () {
					self.Buffer.removeEventListener('updateend', done);
					self.Buffer.removeEventListener('error', fail);
					next();
				};

				self.Buffer.addEventListener('updateend', done);
				self.Buffer.addEventListener('error', fail);

				try {
					self.Buffer.remove(range.Start, range.End);
				}
				catch (error) {
					fail();
				}
			});
		};

		next();
	};

	AyleMSEStreamLoader.prototype._cleanupRanges = function (aggressiveLevel) {
		var result = [];
		if (!this.Buffer || !this.Buffer.buffered.length)
			return result;

		var position = this.Driver.Element.currentTime || 0;
		var behind = this.BufferBehind;
		var ahead = this.BufferAhead * 2;

		if (aggressiveLevel === 1) {
			behind = Math.min(this.BufferBehind, 5);
			ahead = Math.max(5, this.BufferAhead / 2);
		}
		else if (aggressiveLevel >= 2) {
			behind = 1;
			ahead = 5;
		}
		var keepStart = Math.max(0, position - behind);
		var keepEnd = position + ahead;
		var ranges = AyleReadTimeRanges(this.Buffer.buffered);
		var i = 0;

		while (i < ranges.length) {
			var range = ranges[i];

			if (range.Start < keepStart) {
				var leftEnd = Math.min(range.End, keepStart);
				if (leftEnd > range.Start)
					result.push({ Start: range.Start, End: leftEnd });
			}

			if (range.End > keepEnd) {
				var rightStart = Math.max(range.Start, keepEnd);
				if (range.End > rightStart)
					result.push({ Start: rightStart, End: range.End });
			}

			i++;
		}

		return result;
	};

	AyleMSEStreamLoader.prototype._evict = function (callback) {
		var ranges = this._cleanupRanges(0);
		if (!ranges.length) {
			callback();
			return;
		}

		this._removeRanges(ranges, callback);
	};

	AyleMSEStreamLoader.prototype._appendData = function (data, callback, retries, context) {
		var self = this;
		retries = retries || 0;

		this.Driver._append(this.Buffer, data, function (error) {
			if (!error) {
				self._quotaRecovering = false;
				callback(null);
				return;
			}

			if (error.name !== 'QuotaExceededError' || retries >= 2) {
				callback(error);
				return;
			}

			var ranges = self._cleanupRanges(retries + 1);
			if (!ranges.length) {
				callback(error);
				return;
			}

			self._quotaRecovering = true;
			self._removeRanges(ranges, function () {
				if (!self._valid() || self.Seeking)
					return;
				self._appendData(data, callback, retries + 1, context);
			});
		}, context);
	};


	AyleMSEStreamLoader.prototype._validateResponseCodec = function (result) {
		result = result || {};

		var expected = String(
			(this.Options && this.Options.Codec) ||
			(this.Item && this.Item.Codecs) ||
			''
		).toLowerCase();

		if (!expected)
			return null;

		var contentType = String(result.ContentType || '').toLowerCase();
		var contentCodec = '';
		var match = /codecs\s*=\s*["']?([^"';,\s]+)/i.exec(contentType);

		if (match)
			contentCodec = match[1] || '';

		var actual =
			contentCodec ||
			String(result.OutputCodec || result.Codec || '').toLowerCase();

		if (!actual)
			return null;

		var normalize = function (codec) {
			codec = String(codec || '').toLowerCase().replace(/^\s+|\s+$/g, '');

			/*
			 * FFmpeg/backend codec names and MSE codec strings are not always
			 * the same vocabulary.
			 */
			if (codec === 'aac')
				return 'mp4a.40.2';

			if (codec === 'ac3' || codec === 'ac-3')
				return 'ac-3';

			if (
				codec === 'eac3' ||
				codec === 'e-ac-3' ||
				codec === 'ec3' ||
				codec === 'ec-3'
			)
				return 'ec-3';

			return codec;
		};

		expected = normalize(expected);
		actual = normalize(actual);

		if (expected === actual)
			return null;

		return new Error(
			'MSE codec mismatch: SourceBuffer expects "' +
			expected +
			'", server returned "' +
			actual +
			'"'
		);
	};


	AyleMSEStreamLoader.prototype._appendContext = function (result, phase) {
		result = result || {};
		return {
			Kind: this.Kind,
			Phase: phase || 'media',
			Mode: this.Mode,
			URL: result.URL || this.Item.URL || '',
			Status: result.Status || 0,
			ContentType: result.ContentType || '',
			Codec: result.Codec || '',
			SourceCodec: result.SourceCodec || '',
			OutputCodec: result.OutputCodec || '',
			MediaMode: result.MediaMode || '',
			RequestedTime: result.RequestedTime !== undefined ? result.RequestedTime : null,
			Start: result.Start !== undefined ? result.Start : null,
			End: result.End !== undefined ? result.End : null,
			Duration: result.Duration !== undefined ? result.Duration : null,
			ItemID: this.Item.ID || '',
			ConfiguredCodec: this.Item.Codecs || ''
		};
	};

	AyleMSEStreamLoader.prototype._debugResult = function (result, phase) {
		var context = this._appendContext(result, phase);
		this.Driver._debugResponse(context, result);
		return context;
	};

	AyleMSEStreamLoader.prototype._prepareTimestampContext = function (result, context) {
		if (!context)
			context = this._appendContext(result, 'media');

		if (
			this.Mode !== 'time' ||
			!this.AlignTimestamps ||
			!result ||
			!result.Data ||
			!result.Data.byteLength ||
			result.Start === undefined ||
			result.Start === null ||
			!isFinite(result.Start)
		)
			return context;

		var timeline = this.Driver._getMP4InternalTimeline(result.Data);
		if (!timeline || timeline.Start === null || !isFinite(timeline.Start))
			return context;

		context.InternalStart = timeline.Start;
		context.InternalTrackID = timeline.TrackID;
		context.InternalTimescale = timeline.Timescale;
		context.TimestampOffset = result.Start - timeline.Start;

		if (Math.abs(context.TimestampOffset) < 0.000001)
			context.TimestampOffset = 0;

		return context;
	};

	AyleMSEStreamLoader.prototype.Start = function (position) {
		position = position || 0;
		this.NoProgressCount = 0;
		this.GapRetryCount = 0;
		this.LastGapTime = null;

		if (this.Mode === 'segments')
			this.SegmentIndex = this._findSegment(position);
		else if (this.Mode === 'time')
			this.NextTime = position;
		else
			this.NextByte = 0;

		this.Pump();
	};

	AyleMSEStreamLoader.prototype.Pump = function () {
		if (!this._valid() || this.Seeking || this.Loading || this.Buffer.updating)
			return;

		if (!this._needsData())
			return;

		var self = this;
		this._evict(function () {
			if (!self._valid() || self.Loading || self.Buffer.updating || !self._needsData())
				return;

			if (self.Mode === 'segments')
				self._pumpSegment();
			else if (self.Mode === 'time')
				self._pumpTime();
			else
				self._pumpRange();
		});
	};

	AyleMSEStreamLoader.prototype._pumpRange = function () {
		var self = this;
		var start = this.NextByte;
		var end = start + this.ChunkSize - 1;
		this.Loading = true;

		this.Request = this.Driver._requestBytes(this.Item.URL, start, end, true, function (error, result) {
			self.Request = null;
			self.Loading = false;

			if (!self._valid())
				return;

			if (error) {
				self.Driver.Emit('error', error);
				return;
			}


			var codecError = self._validateResponseCodec(result);
			if (codecError) {
				console.error('[MSE codec mismatch]', {
					Kind: self.Kind,
					ConfiguredCodec: self.Options.Codec || '',
					ResponseCodec: result.OutputCodec || result.Codec || '',
					ContentType: result.ContentType || '',
					URL: result.URL || ''
				});
				self.Driver.Emit('error', codecError);
				return;
			}

			if (result.EOF && (!result.Data || !result.Data.byteLength)) {
				self.MarkEnded();
				return;
			}

			if (result.Total !== null)
				self.TotalBytes = result.Total;

			self.NextByte = result.End + 1;

			var finalRangeChunk =
				self.TotalBytes !== null &&
				self.NextByte >= self.TotalBytes;

			self._appendData(result.Data, function (appendError) {
				if (appendError) {
					self.Driver.Emit('error', appendError);
					return;
				}

				if (finalRangeChunk)
					self.MarkEnded();
				else {
					self.Driver._emitMSEProgress();
					self.Pump();
				}
			}, 0, self._debugResult(result, 'media'));
		}, this.Options);
	};

	AyleMSEStreamLoader.prototype._findSegment = function (position) {
		var segments = this.Options.Segments || [];
		var i = 0;
		var count = segments.length;

		while (i < count) {
			if (position >= segments[i].Start && position < segments[i].End)
				return i;
			i++;
		}

		if (count && position >= segments[count - 1].End)
			return count - 1;

		return 0;
	};

	AyleMSEStreamLoader.prototype._loadDescriptor = function (descriptor, callback) {
		var url = descriptor.URL || this.Item.URL;
		var hasRange = descriptor.RangeStart !== undefined && descriptor.RangeStart !== null;
		var start = hasRange ? descriptor.RangeStart : null;
		var end = hasRange ? descriptor.RangeEnd : null;
		this.Request = this.Driver._requestBytes(
			url,
			start,
			end,
			hasRange,
			callback,
			this.Options
		);
	};

	AyleMSEStreamLoader.prototype._ensureInit = function (callback) {
		if (this.InitLoaded) {
			callback(null);
			return;
		}

		/*
		 * Some endpoints return a self-contained fMP4 structure for every time
		 * request. In that case there is no separate initialization request.
		 */
		if (this.Options.SkipInit) {
			this.InitLoaded = true;
			callback(null);
			return;
		}

		var init = this.Options.Init;

		/*
		 * Time mode convenience: when Init is omitted and the media URL uses
		 * {time}, request the initialization segment from the same endpoint by
		 * substituting {time} with InitValue (default: "init").
		 */
		if (!init && this.Mode === 'time') {
			var template = this.Options.TimeURL || this.Item.URL || '';

			if (template.indexOf('{time}') !== -1) {
				var initValue = this.Options.InitValue;

				if (initValue === undefined || initValue === null)
					initValue = 'init';

				init = {
					URL: template.replace(/\{time\}/g, encodeURIComponent(String(initValue)))
				};
			}
		}

		if (!init) {
			this.InitLoaded = true;
			callback(null);
			return;
		}

		var self = this;
		this.Loading = true;
		this._loadDescriptor(init, function (error, result) {
			self.Request = null;
			self.Loading = false;

			if (error) {
				callback(error);
				return;
			}

			var codecError = self._validateResponseCodec(result);
			if (codecError) {
				console.error('[MSE codec mismatch]', {
					Kind: self.Kind,
					Phase: 'init',
					ConfiguredCodec: self.Options.Codec || '',
					ResponseCodec: result.OutputCodec || result.Codec || '',
					ContentType: result.ContentType || '',
					URL: result.URL || ''
				});
				callback(codecError);
				return;
			}

			self._appendData(result.Data, function (appendError) {
				if (!appendError)
					self.InitLoaded = true;
				callback(appendError);
			}, 0, self._debugResult(result, 'init'));
		});
	};

	AyleMSEStreamLoader.prototype._pumpSegment = function () {
		var self = this;
		var segments = this.Options.Segments || [];

		if (!segments.length) {
			this.Driver.Emit('error', new Error('Segment mode requires Stream.Segments'));
			return;
		}

		this._ensureInit(function (initError) {
			if (initError) {
				self.Driver.Emit('error', initError);
				return;
			}

			if (!self._valid())
				return;

			if (self.SegmentIndex >= segments.length) {
				self.MarkEnded();
				return;
			}

			var segment = segments[self.SegmentIndex];
			self.Loading = true;
			self._loadDescriptor(segment, function (error, result) {
				self.Request = null;
				self.Loading = false;

				if (!self._valid())
					return;

				if (error) {
					self.Driver.Emit('error', error);
					return;
				}

				var codecError = self._validateResponseCodec(result);
				if (codecError) {
					console.error('[MSE codec mismatch]', {
						Kind: self.Kind,
						Phase: 'media',
						ConfiguredCodec: self.Options.Codec || '',
						ResponseCodec: result.OutputCodec || result.Codec || '',
						ContentType: result.ContentType || '',
						URL: result.URL || ''
					});
					self.Driver.Emit('error', codecError);
					return;
				}

				self._appendData(result.Data, function (appendError) {
					if (appendError) {
						self.Driver.Emit('error', appendError);
						return;
					}

					self.SegmentIndex++;

					if (self.SegmentIndex >= segments.length)
						self.MarkEnded();
					else {
						self.Driver._emitMSEProgress();
						self.Pump();
					}
				}, 0, self._debugResult(result, 'media'));
			});
		});
	};

	AyleMSEStreamLoader.prototype._pumpTime = function () {
		var self = this;

		this._ensureInit(function (initError) {
			if (initError) {
				self.Driver.Emit('error', initError);
				return;
			}

			if (!self._valid())
				return;

			/* Snapshot the exact request point. If currentTime is not actually
			 * covered, repair that gap before continuing sequential prefetch. */
			var requestPoint = self._selectTimeRequestPoint();
			var requestedTime = requestPoint.Time;
			var gapRepair = requestPoint.GapRepair;
			var beforeEnd = self._bufferedEnd(requestedTime);

			self.Loading = true;
			self.Request = self.Driver._requestTime(self.Item, self.Options, requestedTime, function (error, result) {
				self.Request = null;
				self.Loading = false;

				if (!self._valid())
					return;

				if (error) {
					self.Driver.Emit('error', error);
					return;
				}


			var codecError = self._validateResponseCodec(result);
			if (codecError) {
				console.error('[MSE codec mismatch]', {
					Kind: self.Kind,
					ConfiguredCodec: self.Options.Codec || '',
					ResponseCodec: result.OutputCodec || result.Codec || '',
					ContentType: result.ContentType || '',
					URL: result.URL || ''
				});
				self.Driver.Emit('error', codecError);
				return;
			}

				if (result.EOF && (!result.Data || !result.Data.byteLength)) {
					self.MarkEnded();
					return;
				}

				if (result.Duration !== null)
					self.Driver._setMSEDuration(result.Duration);

				var epsilon = self.Options.TimeEpsilon;
				if (epsilon === undefined || epsilon === null)
					epsilon = 0.001;

				var responseDuration =
					result.Duration !== null && isFinite(result.Duration) ?
						result.Duration :
						self.Driver._duration;

				/*
				 * A positive final fragment can legitimately start BEFORE the
				 * requested point when our cursor advanced by epsilon beyond the
				 * real media duration, e.g.:
				 *
				 *   requested = 1470.038
				 *   returned  = 1469.843 .. 1470.037
				 *   duration  = 1470.037
				 *
				 * That is the final usable fragment, not a non-advancing
				 * endpoint response. It must be appended before EOF is marked.
				 */
				var terminalResponse = !!(
					isFinite(responseDuration) &&
					responseDuration > 0 &&
					result.End > result.Start &&
					result.End >= responseDuration - epsilon
				);

				/*
				 * A zero-length response at the exact media duration is a normal
				 * terminal condition. This commonly appears as e.g.
				 * 1470.037..1470.037 when the next sequential request lands
				 * exactly on Duration.
				 */
				if (
					result.End <= result.Start &&
					(
						result.EOF ||
						(
							isFinite(responseDuration) &&
							responseDuration > 0 &&
							result.Start >= responseDuration - epsilon
						) ||
						(
							isFinite(responseDuration) &&
							responseDuration > 0 &&
							requestedTime >= responseDuration - epsilon
						)
					)
				) {
					self.MarkEnded();
					return;
				}

				if (result.End <= result.Start) {
					self.Driver.Emit('error', new Error(
						'Invalid time fragment interval: ' +
						result.Start + '..' + result.End
					));
					return;
				}

				/*
				 * A broken endpoint must not make us request the same point forever.
				 * Exception: the real final fragment may end at Duration while our
				 * request cursor is already Duration + epsilon.
				 */
				if (
					!terminalResponse &&
					result.End <= requestedTime + epsilon * 0.5
				) {
					self.Driver.Emit('error', new Error(
						'Media endpoint did not advance timeline: requested=' + requestedTime +
						', returned=' + result.Start + '..' + result.End
					));
					return;
				}

				var appendContext = self._debugResult(result, 'media');
				appendContext = self._prepareTimestampContext(result, appendContext);

				self._appendData(result.Data, function (appendError) {
					if (appendError) {
						self.Driver.Emit('error', appendError);
						return;
					}

					/* For a gap-repair request, generic "some range grew" is not enough.
					 * The requested playback-head time itself must become covered. */
					var gapCovered = true;
					if (gapRepair) {
						gapCovered = self._contains(requestedTime, self.GapTolerance);

						if (gapCovered) {
							self.GapRetryCount = 0;
							self.LastGapTime = null;
						}
						else {
							if (
								self.LastGapTime !== null &&
								Math.abs(self.LastGapTime - requestedTime) <= epsilon
							)
								self.GapRetryCount++;
							else {
								self.LastGapTime = requestedTime;
								self.GapRetryCount = 1;
							}

							if (self.Driver.Debug) {
								console.warn('[MSE gap not covered]', {
									Kind: self.Kind,
									RequestedTime: requestedTime,
									HeaderStart: result.Start,
									HeaderEnd: result.End,
									Buffered: AyleReadTimeRanges(self.Buffer.buffered),
									Retry: self.GapRetryCount,
									MaxRetries: self.MaxGapRetries
								});
							}

							if (self.GapRetryCount >= self.MaxGapRetries) {
								self.Driver.Emit('error', new Error(
									'Time fragment did not cover playback gap at ' + requestedTime +
									' after ' + self.GapRetryCount + ' attempts'
								));
								return;
							}
						}
					}

					/* SourceBuffer.buffered is authoritative. A response can contain
					 * media beyond X-Media-End (e.g. extra GOP/moof). Do not immediately
					 * request overlapping data in that case. */
					var probe = result.Start;
					if (requestedTime > probe)
						probe = requestedTime;

					var bufferedEnd = self._bufferedEnd(probe);
					var progressedEnd = Math.max(beforeEnd, bufferedEnd);
					var progressed = bufferedEnd > beforeEnd + epsilon;

					/* First append after a seek can create a range that starts before the
					 * requested point. If probe missed it by a tiny gap, also inspect the
					 * HTTP start. */
					if (!progressed) {
						var startEnd = self._bufferedEnd(result.Start);
						if (startEnd > progressedEnd)
							progressedEnd = startEnd;
						if (startEnd > beforeEnd + epsilon)
							progressed = true;
					}

					if (progressed)
						self.NoProgressCount = 0;
					else
						self.NoProgressCount++;

					var nextTime = result.End + epsilon;
					if (self.UseBufferedEndForNextTime && progressedEnd > result.End + epsilon)
						nextTime = progressedEnd + epsilon;

					if (
						!terminalResponse &&
						nextTime <= requestedTime + epsilon * 0.5
					) {
						self.Driver.Emit('error', new Error(
							'Time loader could not advance after append: requested=' + requestedTime +
							', headerEnd=' + result.End + ', bufferedEnd=' + progressedEnd
						));
						return;
					}

					if (self.Driver.Debug) {
						console.log('[MSE time advance]', {
							Kind: self.Kind,
							RequestedTime: requestedTime,
							HeaderStart: result.Start,
							HeaderEnd: result.End,
							BufferedEndBefore: beforeEnd,
							BufferedEndAfter: progressedEnd,
							Progressed: progressed,
							GapRepair: gapRepair,
							GapCovered: gapCovered,
							GapRetryCount: self.GapRetryCount,
							NoProgressCount: self.NoProgressCount,
							NextTime: nextTime
						});
					}

					if (
						!terminalResponse &&
						!progressed &&
						self.NoProgressCount >= self.MaxNoProgressRequests
					) {
						self.Driver.Emit('error', new Error(
							'SourceBuffer did not advance after ' + self.NoProgressCount +
							' time fragments; stopping loader to prevent request storm'
						));
						return;
					}

					self.NextTime = nextTime;

					if (result.EOF || terminalResponse)
						self.MarkEnded();
					else {
						self.Driver._emitMSEProgress();
						self.Pump();
					}
				}, 0, appendContext);
			});
		});
	};

	AyleMSEStreamLoader.prototype.Seek = function (position, callback) {
		if (this.Mode === 'range') {
			if (this._contains(position)) {
				callback(null);
				return true;
			}

			callback(new Error('Random seek outside the buffered range requires segment or time mode'));
			return false;
		}

		var self = this;
		var resetGeneration = ++this._resetGeneration;
		this.Seeking = true;

		if (this.Request) {
			try { this.Request.abort(); }
			catch (ignore) {}
			this.Request = null;
		}

		this.Loading = false;
		this.Ended = false;
		this._quotaRecovering = false;
		this.NoProgressCount = 0;
		this.GapRetryCount = 0;
		this.LastGapTime = null;

		if (this.Mode === 'segments')
			this.SegmentIndex = this._findSegment(position);
		else
			this.NextTime = position;

		this.Driver._waitSourceBuffer(this.Buffer, function () {
			if (!self._valid() || resetGeneration !== self._resetGeneration)
				return;

			var ranges = AyleReadTimeRanges(self.Buffer.buffered);
			if (!ranges.length) {
				self.Seeking = false;
				callback(null);
				self.Pump();
				return;
			}

			self._removeRanges(ranges, function () {
				if (!self._valid() || resetGeneration !== self._resetGeneration)
					return;

				self.Seeking = false;
				callback(null);
				self.Pump();
			});
		});

		return true;
	};


	AyleHTML5MediaDriver.prototype.Destroy = function () {
		if (this.Element) {
			try {
				this.Element.pause();
			}
			catch (ignore) {}

			try {
				this.Element.removeAttribute('src');
				this.Element.load();
			}
			catch (ignore) {}
		}

		if (this._subtitleObjectURLs) {
			var i = this._subtitleObjectURLs.length;

			while (i--) {
				try {
					URL.revokeObjectURL(this._subtitleObjectURLs[i]);
				}
				catch (ignore) {}
			}
		}

		this._unbindDOMEvents();
		this.Element = null;
		this.UI = null;
		this._subtitleObjectURLs = [];
		this._subtitleSourceTracks = [];
		this._chapterTextTracks = [];
		this.Source = null;
		this._events = {};
		return this;
	};


	function AyleMSEMediaDriver () {
		AyleHTML5MediaDriver.call(this);

		this.Source = null;
		this._mediaSource = null;
		this._objectURL = '';
		this._videoBuffer = null;
		this._audioBuffer = null;
		this._videoLoader = null;
		this._audioLoader = null;
		this._videoType = '';
		this._audioType = '';
		this._selectedVariant = null;
		this._selectedAudioTrack = null;
		this._generation = 0;
		this._audioSwitchGeneration = 0;
		this._seekGeneration = 0;
		this._duration = 0;
		this.Debug = false;
		this.DebugMP4 = false;
		this._appendSequence = 0;
		this.LastFailedAppend = null;
		this._endOfStreamPending = false;
		this._endOfStreamDone = false;

	}

	AyleMSEMediaDriver.prototype = Object.create(AyleHTML5MediaDriver.prototype);
	AyleMSEMediaDriver.prototype.constructor = AyleMSEMediaDriver;

	AyleMSEMediaDriver.prototype._bindDriverMediaEvents = function () {
		var self = this;
		var pump = function () { self._pumpStreams(); };

		this._listen(this.Element, 'timeupdate', pump);
		this._listen(this.Element, 'waiting', pump);
		this._listen(this.Element, 'playing', pump);
	};

	AyleMSEMediaDriver.prototype.SetUI = function (ui) {
		if (!ui)
			this._destroyMediaSource();

		return AyleHTML5MediaDriver.prototype.SetUI.call(this, ui);
	};

	AyleMSEMediaDriver.CodecCandidates = [
		{ Type: 'video/mp4', Codecs: [
			'avc1.42E01E',
			'avc1.4D401F',
			'avc1.640028',
			'avc1.640029',
			'hvc1.1.6.L120.90',
			'hev1.1.6.L120.90',
			'av01.0.08M.08'
		] },
		{ Type: 'video/webm', Codecs: [
			'vp8',
			'vp09.00.10.08',
			'av01.0.08M.08'
		] },
		{ Type: 'audio/mp4', Codecs: [
			'mp4a.40.2',
			'mp4a.40.5',
			'ac-3',
			'ec-3',
			'opus'
		] },
		{ Type: 'audio/webm', Codecs: [
			'opus',
			'vorbis'
		] }
	];

	AyleMSEMediaDriver.prototype.GetCodecCandidates = function () {
		return AyleMSEMediaDriver.CodecCandidates;
	};

	AyleMSEMediaDriver.prototype.SupportsCodec = function (type, codec) {
		var mse = global.MediaSource;
		if (!mse || typeof mse.isTypeSupported !== 'function' || !type)
			return false;

		var mime = type;
		if (codec)
			mime += '; codecs="' + codec + '"';

		return mse.isTypeSupported(mime);
	};

	AyleMSEMediaDriver.prototype._mime = function (item, fallbackType) {
		if (!item)
			return '';

		var type = item.Type || fallbackType || '';
		var codecs = item.Codecs || '';

		if (!type)
			return '';

		if (type.indexOf('codecs=') !== -1 || !codecs)
			return type;

		return type + '; codecs="' + codecs + '"';
	};

	AyleMSEMediaDriver.prototype._defaultAudioTrack = function (source) {
		var tracks = source.AudioTracks || [];
		var i = 0;
		var count = tracks.length;

		while (i < count) {
			if (tracks[i].Default)
				return tracks[i];
			i++;
		}

		return count ? tracks[0] : null;
	};

	AyleMSEMediaDriver.prototype._readAudioTracks = function () {
		var source = this.Source;
		var tracks = source ? source.AudioTracks || [] : [];
		var result = [];
		var i = 0;
		var count = tracks.length;

		while (i < count) {
			var item = tracks[i];
			result.push(new AyleMediaTrack({
				ID: item.ID,
				URL: item.URL,
				Type: item.Type,
				Codecs: item.Codecs,
				Language: item.Language,
				Label: item.Label,
				Default: item.Default,
				Forced: item.Forced,
				Stream: item.Stream,
				Native: {
					enabled: !!(this._selectedAudioTrack && this._selectedAudioTrack.ID === item.ID)
				}
			}));
			i++;
		}

		return result;
	};

	AyleMSEMediaDriver.prototype._requestBytes = function (url, start, end, requireRange, callback, options) {
		if (!url) {
			callback(new Error('Empty media URL'));
			return null;
		}

		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';
		this._applyMediaRequestHeaders(xhr, options);

		if (start !== null && start !== undefined) {
			var value = 'bytes=' + start + '-';
			if (end !== null && end !== undefined)
				value += end;
			xhr.setRequestHeader('Range', value);
		}

		xhr.onload = function () {
			if (xhr.status === 416) {
				callback(null, { Data: null, Start: start || 0, End: (start || 0) - 1, Total: null, EOF: true });
				return;
			}

			if (xhr.status < 200 || xhr.status >= 300) {
				callback(new Error('HTTP ' + xhr.status + ' while loading ' + url));
				return;
			}

			if (requireRange && xhr.status !== 206) {
				callback(new Error('Server did not honor HTTP Range for ' + url + ' (expected 206, got ' + xhr.status + ')'));
				return;
			}

			var response = xhr.response;
			var actualStart = start || 0;
			var actualEnd = actualStart + (response ? response.byteLength : 0) - 1;
			var total = null;
			var contentRange = xhr.getResponseHeader('Content-Range');

			if (contentRange) {
				var match = /bytes\s+(\d+)-(\d+)\/(\d+|\*)/i.exec(contentRange);
				if (match) {
					actualStart = parseInt(match[1], 10);
					actualEnd = parseInt(match[2], 10);
					if (match[3] !== '*')
						total = parseInt(match[3], 10);
				}
			}

			var result = {
				Data: response,
				Start: actualStart,
				End: actualEnd,
				Total: total,
				EOF: total !== null && actualEnd + 1 >= total,
				URL: url,
				Status: xhr.status,
				ContentType: xhr.getResponseHeader('Content-Type') || '',
				Codec: xhr.getResponseHeader('X-Media-Codec') || '',
				SourceCodec: xhr.getResponseHeader('X-Media-Source-Codec') || '',
				OutputCodec: xhr.getResponseHeader('X-Media-Output-Codec') || '',
				MediaMode: xhr.getResponseHeader('X-Media-Mode') || ''
			};

			callback(null, result);
		};

		xhr.onerror = function () {
			callback(new Error('Network error while loading ' + url));
		};

		xhr.onabort = function () {};
		xhr.send();
		return xhr;
	};

	AyleMSEMediaDriver.prototype._timeURL = function (item, options, position) {
		var precision = options.TimePrecision;
		if (precision === undefined || precision === null)
			precision = 3;

		var value = Number(position).toFixed(precision);
		var template = options.TimeURL || item.URL || '';

		if (template.indexOf('{time}') !== -1)
			return template.replace(/\{time\}/g, encodeURIComponent(value));

		var parameter = options.TimeParameter || 'time';
		return template + (template.indexOf('?') === -1 ? '?' : '&') + encodeURIComponent(parameter) + '=' + encodeURIComponent(value);
	};

	AyleMSEMediaDriver.prototype._requestTime = function (item, options, position, callback) {
		var url = this._timeURL(item, options, position);
		if (!url) {
			callback(new Error('Empty media time URL'));
			return null;
		}

		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';
		this._applyMediaRequestHeaders(xhr, options);

		var startHeader = options.TimeStartHeader || 'X-Media-Start';
		var endHeader = options.TimeEndHeader || 'X-Media-End';
		var durationHeader = options.TimeDurationHeader || 'X-Media-Duration';
		var eofHeader = options.TimeEOFHeader || 'X-Media-EOF';

		xhr.onload = function () {
			if (xhr.status === 204) {
				callback(null, { Data: null, Start: position, End: position, Duration: null, EOF: true });
				return;
			}

			if (xhr.status < 200 || xhr.status >= 300) {
				callback(new Error('HTTP ' + xhr.status + ' while loading ' + url));
				return;
			}

			var startValue = xhr.getResponseHeader(startHeader);
			var endValue = xhr.getResponseHeader(endHeader);

			if (startValue === null || endValue === null) {
				callback(new Error('Time endpoint must return ' + startHeader + ' and ' + endHeader));
				return;
			}

			var start = parseFloat(startValue);
			var end = parseFloat(endValue);
			if (!isFinite(start) || !isFinite(end)) {
				callback(new Error('Invalid time headers returned by ' + url));
				return;
			}

			var durationValue = xhr.getResponseHeader(durationHeader);
			var duration = durationValue !== null ? parseFloat(durationValue) : null;
			if (duration !== null && !isFinite(duration))
				duration = null;

			var eofValue = xhr.getResponseHeader(eofHeader);
			var eof = eofValue === '1' || eofValue === 'true' || eofValue === 'yes';

			var result = {
				Data: xhr.response,
				Start: start,
				End: end,
				Duration: duration,
				EOF: eof,
				URL: url,
				Status: xhr.status,
				ContentType: xhr.getResponseHeader('Content-Type') || '',
				Codec: xhr.getResponseHeader('X-Media-Codec') || '',
				SourceCodec: xhr.getResponseHeader('X-Media-Source-Codec') || '',
				OutputCodec: xhr.getResponseHeader('X-Media-Output-Codec') || '',
				MediaMode: xhr.getResponseHeader('X-Media-Mode') || '',
				RequestedTime: position
			};

			callback(null, result);
		};

		xhr.onerror = function () {
			callback(new Error('Network error while loading ' + url));
		};

		xhr.onabort = function () {};
		xhr.send();
		return xhr;
	};

	AyleMSEMediaDriver.prototype._setMSEDuration = function (duration) {
		if (!isFinite(duration) || duration < 0)
			return;

		this._duration = duration;

		if (!this._mediaSource || this._mediaSource.readyState !== 'open')
			return;

		try {
			if (!isFinite(this._mediaSource.duration) || Math.abs(this._mediaSource.duration - duration) > 0.001)
				this._mediaSource.duration = duration;
		}
		catch (ignore) {}
	};

	AyleMSEMediaDriver.prototype.SetDebug = function (value) {
		this.Debug = !!value;
		return this;
	};

	AyleMSEMediaDriver.prototype._debugResponse = function (context, result) {
		if (!this.Debug)
			return;

		console.log('[MSE response]', {
			Kind: context.Kind,
			Phase: context.Phase,
			Mode: context.Mode,
			URL: context.URL,
			Status: context.Status,
			Bytes: result && result.Data ? result.Data.byteLength : 0,
			ContentType: context.ContentType,
			Codec: context.Codec,
			SourceCodec: context.SourceCodec,
			OutputCodec: context.OutputCodec,
			MediaMode: context.MediaMode,
			RequestedTime: context.RequestedTime,
			Start: context.Start,
			End: context.End,
			Duration: context.Duration
		});
	};

	AyleMSEMediaDriver.prototype.DownloadLastFailedChunk = function (filename) {
		var failed = this.LastFailedAppend;
		if (!failed || !failed.Data || !failed.Data.byteLength)
			return false;

		var context = failed.Context || {};
		var name = filename || (
			'mse-failed-' + (context.Kind || 'media') + '-' +
			(context.AppendID || 'unknown') + '.mp4'
		);
		var blob = new Blob([failed.Data], {
			type: context.ContentType || 'application/octet-stream'
		});
		var url = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
		a.download = name;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
		return true;
	};

	AyleMSEMediaDriver.prototype.SetDebugMP4 = function (value) {
		this.DebugMP4 = !!value;
		return this;
	};

	AyleMSEMediaDriver.prototype._mp4UInt64 = function (view, offset) {
		var high = view.getUint32(offset, false);
		var low = view.getUint32(offset + 4, false);
		return high * 4294967296 + low;
	};

	AyleMSEMediaDriver.prototype._mp4Type = function (view, offset) {
		return String.fromCharCode(
			view.getUint8(offset),
			view.getUint8(offset + 1),
			view.getUint8(offset + 2),
			view.getUint8(offset + 3)
		);
	};

	AyleMSEMediaDriver.prototype._parseMP4Boxes = function (data, start, end, depth) {
		var result = [];
		if (!data || !data.byteLength)
			return result;

		var view = new DataView(data);
		start = start || 0;
		end = end === undefined || end === null ? data.byteLength : Math.min(end, data.byteLength);
		depth = depth || 0;

		var containers = {
			moov: true, trak: true, mdia: true, minf: true, stbl: true,
			moof: true, traf: true, mvex: true, edts: true, dinf: true
		};
		var offset = start;

		while (offset + 8 <= end) {
			var size32 = view.getUint32(offset, false);
			var type = this._mp4Type(view, offset + 4);
			var header = 8;
			var size = size32;

			if (size32 === 1) {
				if (offset + 16 > end)
					break;
				size = this._mp4UInt64(view, offset + 8);
				header = 16;
			}
			else if (size32 === 0) {
				size = end - offset;
			}

			if (!size || size < header || offset + size > end) {
				result.push({
					Type: type || '????',
					Offset: offset,
					Size: size,
					Invalid: true,
					Available: end - offset
				});
				break;
			}

			var box = {
				Type: type,
				Offset: offset,
				Size: size
			};
			var payload = offset + header;

			if (type === 'tfhd' && payload + 8 <= offset + size) {
				box.Version = view.getUint8(payload);
				box.Flags = (view.getUint8(payload + 1) << 16) | (view.getUint8(payload + 2) << 8) | view.getUint8(payload + 3);
				box.TrackID = view.getUint32(payload + 4, false);
			}
			else if (type === 'tfdt' && payload + 8 <= offset + size) {
				box.Version = view.getUint8(payload);
				box.BaseMediaDecodeTime = box.Version === 1 ?
					this._mp4UInt64(view, payload + 4) :
					view.getUint32(payload + 4, false);
			}
			else if (type === 'trun' && payload + 8 <= offset + size) {
				box.Version = view.getUint8(payload);
				box.Flags = (view.getUint8(payload + 1) << 16) | (view.getUint8(payload + 2) << 8) | view.getUint8(payload + 3);
				box.SampleCount = view.getUint32(payload + 4, false);
			}
			else if (type === 'mfhd' && payload + 8 <= offset + size) {
				box.SequenceNumber = view.getUint32(payload + 4, false);
			}
			else if (type === 'mdhd' && payload + 16 <= offset + size) {
				box.Version = view.getUint8(payload);
				if (box.Version === 1 && payload + 28 <= offset + size)
					box.Timescale = view.getUint32(payload + 20, false);
				else if (box.Version === 0 && payload + 16 <= offset + size)
					box.Timescale = view.getUint32(payload + 12, false);
			}
			else if (type === 'mvhd' && payload + 16 <= offset + size) {
				box.Version = view.getUint8(payload);
				if (box.Version === 1 && payload + 28 <= offset + size)
					box.Timescale = view.getUint32(payload + 20, false);
				else if (box.Version === 0 && payload + 16 <= offset + size)
					box.Timescale = view.getUint32(payload + 12, false);
			}
			else if (type === 'tkhd' && payload + 16 <= offset + size) {
				box.Version = view.getUint8(payload);
				if (box.Version === 1 && payload + 28 <= offset + size)
					box.TrackID = view.getUint32(payload + 20, false);
				else if (box.Version === 0 && payload + 16 <= offset + size)
					box.TrackID = view.getUint32(payload + 12, false);
			}

			if (containers[type] && depth < 6)
				box.Children = this._parseMP4Boxes(data, payload, offset + size, depth + 1);

			result.push(box);
			offset += size;
		}

		return result;
	};

	AyleMSEMediaDriver.prototype._flattenMP4Boxes = function (boxes, prefix, result) {
		result = result || [];
		prefix = prefix || '';
		var i = 0;

		while (i < boxes.length) {
			var box = boxes[i];
			var path = prefix ? prefix + '/' + box.Type : box.Type;
			var row = {
				Path: path,
				Offset: box.Offset,
				Size: box.Size
			};

			if (box.Invalid)
				row.Invalid = true;
			if (box.TrackID !== undefined)
				row.TrackID = box.TrackID;
			if (box.BaseMediaDecodeTime !== undefined)
				row.BaseMediaDecodeTime = box.BaseMediaDecodeTime;
			if (box.SampleCount !== undefined)
				row.SampleCount = box.SampleCount;
			if (box.SequenceNumber !== undefined)
				row.SequenceNumber = box.SequenceNumber;
			if (box.Timescale !== undefined)
				row.Timescale = box.Timescale;

			result.push(row);
			if (box.Children)
				this._flattenMP4Boxes(box.Children, path, result);
			i++;
		}

		return result;
	};

	AyleMSEMediaDriver.prototype._findMP4Child = function (box, type) {
		if (!box || !box.Children)
			return null;

		var i = 0;
		while (i < box.Children.length) {
			if (box.Children[i].Type === type)
				return box.Children[i];
			i++;
		}

		return null;
	};

	AyleMSEMediaDriver.prototype._findMP4Descendant = function (box, type) {
		if (!box)
			return null;

		if (box.Type === type)
			return box;

		if (!box.Children)
			return null;

		var i = 0;
		while (i < box.Children.length) {
			var found = this._findMP4Descendant(box.Children[i], type);
			if (found)
				return found;
			i++;
		}

		return null;
	};

	AyleMSEMediaDriver.prototype._getMP4InternalTimeline = function (data) {
		var boxes;

		try {
			boxes = this._parseMP4Boxes(data, 0, data.byteLength, 0);
		}
		catch (error) {
			return null;
		}

		var timescales = {};
		var moov = null;
		var moof = null;
		var i = 0;

		while (i < boxes.length) {
			if (boxes[i].Type === 'moov')
				moov = boxes[i];
			else if (!moof && boxes[i].Type === 'moof')
				moof = boxes[i];
			i++;
		}

		if (moov && moov.Children) {
			i = 0;
			while (i < moov.Children.length) {
				var trak = moov.Children[i];

				if (trak.Type === 'trak') {
					var tkhd = this._findMP4Descendant(trak, 'tkhd');
					var mdhd = this._findMP4Descendant(trak, 'mdhd');

					if (
						tkhd && tkhd.TrackID !== undefined &&
						mdhd && mdhd.Timescale
					)
						timescales[tkhd.TrackID] = mdhd.Timescale;
				}

				i++;
			}
		}

		if (!moof || !moof.Children)
			return null;

		var best = null;
		i = 0;

		while (i < moof.Children.length) {
			var traf = moof.Children[i];

			if (traf.Type === 'traf') {
				var tfhd = this._findMP4Descendant(traf, 'tfhd');
				var tfdt = this._findMP4Descendant(traf, 'tfdt');

				if (tfhd && tfdt && tfhd.TrackID !== undefined && tfdt.BaseMediaDecodeTime !== undefined) {
					var timescale = timescales[tfhd.TrackID];

					if (timescale) {
						var start = tfdt.BaseMediaDecodeTime / timescale;
						var candidate = {
							Start: start,
							TrackID: tfhd.TrackID,
							Timescale: timescale,
							BaseMediaDecodeTime: tfdt.BaseMediaDecodeTime
						};

						if (!best || candidate.Start < best.Start)
							best = candidate;
					}
				}
			}

			i++;
		}

		return best;
	};

	AyleMSEMediaDriver.prototype._debugMP4 = function (context, data) {
		if (!this.DebugMP4 || !data || !data.byteLength)
			return;

		var boxes;
		try {
			boxes = this._parseMP4Boxes(data, 0, data.byteLength, 0);
		}
		catch (error) {
			console.error('[MSE MP4 parse failed]', context, error);
			return;
		}

		console.groupCollapsed(
			'[MSE MP4] #' + context.AppendID + ' ' + context.Kind +
			' bytes=' + data.byteLength + ' ' + (context.URL || '')
		);
		console.log('Context', context);
		console.table(this._flattenMP4Boxes(boxes));
		console.log('Boxes', boxes);
		console.groupEnd();
	};

	AyleMSEMediaDriver.prototype._waitSourceBuffer = function (buffer, callback) {
		if (!buffer || !buffer.updating) {
			callback();
			return;
		}

		var done = function () {
			buffer.removeEventListener('updateend', done);
			callback();
		};

		buffer.addEventListener('updateend', done);
	};

	AyleMSEMediaDriver.prototype._hasSourceBuffer = function (buffer) {
		if (!buffer || !this._mediaSource)
			return false;

		var buffers = this._mediaSource.sourceBuffers;
		var i = 0;
		var count = buffers.length;

		while (i < count) {
			if (buffers[i] === buffer)
				return true;
			i++;
		}

		return false;
	};

	AyleMSEMediaDriver.prototype._clearSourceBuffer = function (buffer, callback) {
		var self = this;

		if (!buffer || !this._hasSourceBuffer(buffer)) {
			callback(null);
			return;
		}

		this._waitSourceBuffer(buffer, function () {
			if (!self._hasSourceBuffer(buffer)) {
				callback(null);
				return;
			}

			var ranges = AyleReadTimeRanges(buffer.buffered);
			var index = 0;

			var next = function () {
				if (!self._hasSourceBuffer(buffer)) {
					callback(null);
					return;
				}

				if (index >= ranges.length) {
					callback(null);
					return;
				}

				var range = ranges[index++];
				if (range.End <= range.Start) {
					next();
					return;
				}

				self._waitSourceBuffer(buffer, function () {
					if (!self._hasSourceBuffer(buffer)) {
						callback(null);
						return;
					}

					var done = function () {
						buffer.removeEventListener('updateend', done);
						buffer.removeEventListener('error', fail);
						next();
					};

					var fail = function (event) {
						buffer.removeEventListener('updateend', done);
						buffer.removeEventListener('error', fail);
						callback(event instanceof Error ? event : new Error('Unable to clear SourceBuffer'));
					};

					buffer.addEventListener('updateend', done);
					buffer.addEventListener('error', fail);

					try {
						buffer.remove(range.Start, range.End);
					}
					catch (error) {
						buffer.removeEventListener('updateend', done);
						buffer.removeEventListener('error', fail);
						callback(error);
					}
				});
			};

			next();
		});
	};

	AyleMSEMediaDriver.prototype._append = function (buffer, data, callback, context) {
		if (!data || !data.byteLength) {
			callback(null);
			return;
		}

		var self = this;
		context = context || {};
		context.AppendID = ++this._appendSequence;
		context.Bytes = data.byteLength;
		context.CurrentTime = this.Element.currentTime || 0;
		context.BufferedBefore = AyleReadTimeRanges(buffer.buffered);

		if (this.Debug) {
			console.log('[MSE append start]', context);
		}
		this._debugMP4(context, data);

		this._waitSourceBuffer(buffer, function () {
			if (context.TimestampOffset !== undefined && context.TimestampOffset !== null) {
				try {
					buffer.timestampOffset = context.TimestampOffset;
					context.AppliedTimestampOffset = buffer.timestampOffset;

					if (self.Debug) {
						console.log('[MSE timestamp]', {
							Kind: context.Kind,
							URL: context.URL,
							RequestedTime: context.RequestedTime,
							HTTPStart: context.Start,
							InternalStart: context.InternalStart,
							TrackID: context.InternalTrackID,
							Timescale: context.InternalTimescale,
							TimestampOffset: context.TimestampOffset,
							AppliedTimestampOffset: context.AppliedTimestampOffset
						});
					}
				}
				catch (offsetError) {
					console.error('[MSE timestamp FAILED]', context, offsetError);
					callback(offsetError);
					return;
				}
			}
			var done = function () {
				buffer.removeEventListener('updateend', done);
				buffer.removeEventListener('error', fail);
				context.BufferedAfter = AyleReadTimeRanges(buffer.buffered);
				if (self.Debug)
					console.log('[MSE append OK]', context);
				callback(null);
			};

			var fail = function (event) {
				buffer.removeEventListener('updateend', done);
				buffer.removeEventListener('error', fail);
				context.BufferedAfter = AyleReadTimeRanges(buffer.buffered);
				self.LastFailedAppend = { Context: context, Data: data };
				console.error('[MSE append FAILED]', context, event || null);
				callback(new Error('SourceBuffer append failed'));
			};

			buffer.addEventListener('updateend', done);
			buffer.addEventListener('error', fail);

			try {
				buffer.appendBuffer(data);
			}
			catch (error) {
				buffer.removeEventListener('updateend', done);
				buffer.removeEventListener('error', fail);
				context.BufferedAfter = AyleReadTimeRanges(buffer.buffered);
				self.LastFailedAppend = { Context: context, Data: data };
				console.error('[MSE append THROW]', context, error);
				callback(error);
			}
		});
	};

	AyleMSEMediaDriver.prototype._intersectRanges = function (a, b) {
		var result = [];
		var ai = 0;
		var bi = 0;

		while (ai < a.length && bi < b.length) {
			var start = Math.max(a[ai].Start, b[bi].Start);
			var end = Math.min(a[ai].End, b[bi].End);

			if (end > start) {
				result.push({
					Start: start,
					End: end
				});
			}

			if (a[ai].End < b[bi].End)
				ai++;
			else
				bi++;
		}

		return result;
	};

	AyleMSEMediaDriver.prototype._getBufferedRanges = function () {
		var video = [];
		var audio = [];

		if (this._videoBuffer)
			video = AyleReadTimeRanges(this._videoBuffer.buffered);

		if (this._audioBuffer)
			audio = AyleReadTimeRanges(this._audioBuffer.buffered);

		if (!video.length) {
			if (this._audioBuffer)
				return audio;

			return [];
		}

		if (!this._audioBuffer)
			return video;

		if (!audio.length)
			return [];

		return this._intersectRanges(video, audio);
	};

	AyleMSEMediaDriver.prototype._emitMSEProgress = function () {
		var video = this._videoBuffer ? AyleReadTimeRanges(this._videoBuffer.buffered) : [];
		var audio = this._audioBuffer ? AyleReadTimeRanges(this._audioBuffer.buffered) : [];
		var buffered = this._getBufferedRanges();
		var mediaBuffered = AyleReadTimeRanges(this.Element.buffered);

		if (this.Debug && typeof console !== 'undefined' && console.log) {
			console.log('[MSE buffered]', {
				Video: video,
				Audio: audio,
				Playable: buffered,
				MediaElement: mediaBuffered,
				Duration: this._duration
			});
		}

		this.Emit('progress', {
			Buffered: buffered,
			Seekable: AyleReadTimeRanges(this.Element.seekable),
			Duration: this._duration,
			VideoBuffered: video,
			AudioBuffered: audio,
			MediaBuffered: mediaBuffered
		});
	};


	AyleMSEMediaDriver.prototype._allActiveLoadersEnded = function () {
		if (this._videoLoader && !this._videoLoader.Ended)
			return false;

		if (this._audioLoader && !this._audioLoader.Ended)
			return false;

		return !!(this._videoLoader || this._audioLoader);
	};

	AyleMSEMediaDriver.prototype._checkEndOfStream = function () {
		var self = this;
		var mediaSource = this._mediaSource;

		if (
			this._endOfStreamDone ||
			this._endOfStreamPending ||
			!mediaSource ||
			mediaSource.readyState !== 'open' ||
			!this._allActiveLoadersEnded()
		)
			return;

		this._endOfStreamPending = true;

		var finish = function () {
			if (
				self._endOfStreamDone ||
				!self._mediaSource ||
				self._mediaSource !== mediaSource ||
				mediaSource.readyState !== 'open' ||
				!self._allActiveLoadersEnded()
			) {
				self._endOfStreamPending = false;
				return;
			}

			if (
				(self._videoBuffer && self._videoBuffer.updating) ||
				(self._audioBuffer && self._audioBuffer.updating)
			) {
				setTimeout(finish, 0);
				return;
			}

			self._endOfStreamPending = false;

			try {
				/*
				 * This is the important part: telling MediaSource that no more
				 * samples are coming lets the browser finalize the effective
				 * media duration at the actual buffered end. Without this,
				 * playback can stall ~1 frame/1 second before metadata Duration
				 * and emit 'waiting' forever instead of native 'ended'.
				 */
				mediaSource.endOfStream();
				self._endOfStreamDone = true;
				self._emitMSEProgress();
			}
			catch (error) {
				self.Emit('error', error);
			}
		};

		finish();
	};

	AyleMSEMediaDriver.prototype._pumpStreams = function () {
		if (this._videoLoader)
			this._videoLoader.Pump();
		if (this._audioLoader)
			this._audioLoader.Pump();
	};

	AyleMSEMediaDriver.prototype._destroyMediaSource = function () {
		this._generation++;

		if (this._videoLoader)
			this._videoLoader.Stop();
		if (this._audioLoader)
			this._audioLoader.Stop();

		this._videoLoader = null;
		this._audioLoader = null;
		this._videoBuffer = null;
		this._audioBuffer = null;
		this._videoType = '';
		this._audioType = '';
		this._duration = 0;
		this._endOfStreamPending = false;
		this._endOfStreamDone = false;

		if (this._mediaSource && this._mediaSource.readyState === 'open') {
			try {
				var i = this._mediaSource.sourceBuffers.length;
				while (i--) {
					var buffer = this._mediaSource.sourceBuffers[i];
					if (buffer.updating)
						buffer.abort();
					this._mediaSource.removeSourceBuffer(buffer);
				}
			}
			catch (ignore) {}
		}

		this._mediaSource = null;

		if (this._objectURL) {
			URL.revokeObjectURL(this._objectURL);
			this._objectURL = '';
		}
	};

	AyleMSEMediaDriver.prototype.Destroy = function () {
		this._destroyMediaSource();
		AyleHTML5MediaDriver.prototype.Destroy.call(this);
		return this;
	};

	AyleMSEMediaDriver.prototype._build = function (variant, audioTrack) {
		var NativeMediaSource = window.MediaSource;

		if (!NativeMediaSource || typeof NativeMediaSource.isTypeSupported !== 'function') {
			this.Emit('error', new Error('Media Source Extensions are not supported'));
			return false;
		}

		if (!variant || !variant.URL) {
			this.Emit('error', new Error('MSE video variant URL is missing'));
			return false;
		}

		var videoType = this._mime(variant, this.Source ? this.Source.Type : '');
		var audioType = audioTrack ? this._mime(audioTrack, 'audio/mp4') : '';

		if (!videoType || !NativeMediaSource.isTypeSupported(videoType)) {
			this.Emit('error', new Error('Unsupported MSE video type: ' + videoType));
			return false;
		}

		if (audioTrack && (!audioType || !NativeMediaSource.isTypeSupported(audioType))) {
			this.Emit('error', new Error('Unsupported MSE audio type: ' + audioType));
			return false;
		}

		this._destroyMediaSource();

		var self = this;
		var generation = this._generation;
		var mediaSource = new NativeMediaSource();
		this._mediaSource = mediaSource;
		this._selectedVariant = variant;
		this._selectedAudioTrack = audioTrack || null;
		this._videoType = videoType;
		this._audioType = audioType;

		this._objectURL = URL.createObjectURL(mediaSource);
		this.Element.src = this._objectURL;
		this.Element.load();

		var onOpen = function () {
			mediaSource.removeEventListener('sourceopen', onOpen);

			if (generation !== self._generation || mediaSource !== self._mediaSource)
				return;

			try {
				self._videoBuffer = mediaSource.addSourceBuffer(videoType);
				if (audioTrack)
					self._audioBuffer = mediaSource.addSourceBuffer(audioType);
			}
			catch (error) {
				self.Emit('error', error);
				return;
			}

			self._videoLoader = new AyleMSEStreamLoader(self, self._videoBuffer, variant, generation, 'video');
			if (audioTrack)
				self._audioLoader = new AyleMSEStreamLoader(self, self._audioBuffer, audioTrack, generation, 'audio');

			self._videoLoader.Start(0);
			if (self._audioLoader)
				self._audioLoader.Start(0);

			self.Emit('audioTracksChange', self._readAudioTracks());
		};

		mediaSource.addEventListener('sourceopen', onOpen);
		return true;
	};


	AyleMSEMediaDriver.prototype._buildAudioOnly = function (audioTrack) {
		var NativeMediaSource = window.MediaSource;

		if (!NativeMediaSource || typeof NativeMediaSource.isTypeSupported !== 'function') {
			this.Emit('error', new Error('Media Source Extensions are not supported'));
			return false;
		}

		if (!audioTrack || !audioTrack.URL) {
			this.Emit('error', new Error('MSE audio track URL is missing'));
			return false;
		}

		var audioType = this._mime(audioTrack, 'audio/mp4');

		if (!audioType || !NativeMediaSource.isTypeSupported(audioType)) {
			this.Emit('error', new Error('Unsupported MSE audio type: ' + audioType));
			return false;
		}

		this._destroyMediaSource();

		var self = this;
		var generation = this._generation;
		var mediaSource = new NativeMediaSource();

		this._mediaSource = mediaSource;
		this._selectedVariant = null;
		this._selectedAudioTrack = audioTrack;
		this._videoType = '';
		this._audioType = audioType;

		this._objectURL = URL.createObjectURL(mediaSource);
		this.Element.src = this._objectURL;
		this.Element.load();

		var onOpen = function () {
			mediaSource.removeEventListener('sourceopen', onOpen);

			if (generation !== self._generation || mediaSource !== self._mediaSource)
				return;

			try {
				self._audioBuffer = mediaSource.addSourceBuffer(audioType);
			}
			catch (error) {
				self.Emit('error', error);
				return;
			}

			self._audioLoader = new AyleMSEStreamLoader(
				self,
				self._audioBuffer,
				audioTrack,
				generation,
				'audio'
			);

			self._audioLoader.Start(0);
			self.Emit('audioTracksChange', self._readAudioTracks());
		};

		mediaSource.addEventListener('sourceopen', onOpen);
		return true;
	};

	AyleMSEMediaDriver.prototype.Load = function (source) {
		this.Source = source;
		this._loadSubtitleTracks(source);
		this._loadChapterTracks(source.Chapters);
		this._selectedAudioTrack = this._defaultAudioTrack(source);

		if (!source.Variants.length && this._selectedAudioTrack && !source.URL)
			return this._buildAudioOnly(this._selectedAudioTrack);

		if (!source.Variants.length && source.URL) {
			return this._build({
				ID: 'default',
				URL: source.URL,
				Type: source.Type,
				Codecs: source.Codecs,
				Label: source.Title || 'Default',
				Stream: source.Stream || null
			}, this._selectedAudioTrack);
		}

		return true;
	};

	AyleMSEMediaDriver.prototype.SetVariant = function (variant) {
		return this._build(variant, this._selectedAudioTrack);
	};


	AyleMSEMediaDriver.prototype._restartEndedStream = function (position) {
		var self = this;
		var source = this.Source;
		var variant = this._selectedVariant;
		var audioTrack = this._selectedAudioTrack;
		var started = false;

		if (!source)
			return false;

		/*
		 * endOfStream() moves MediaSource to readyState="ended". Existing
		 * AyleMSEStreamLoader instances intentionally reject all work in that
		 * state, so a replay must create a fresh MediaSource / SourceBuffers.
		 */
		this.Once('ready', function () {
			try {
				self.Element.currentTime = position || 0;
			}
			catch (error) {
				self.Emit('error', error);
				return;
			}

			/*
			 * Ayle.Play() is waiting for seeked before it issues Driver.Play().
			 * A rebuilt MediaSource does not produce a seeked event by itself at
			 * t=0, so complete that logical seek explicitly once initial media is
			 * ready.
			 */
			self.Emit('seeked');
		});

		if (!source.Variants.length && audioTrack && !source.URL)
			started = this._buildAudioOnly(audioTrack);
		else {
			if (!variant && source.Variants && source.Variants.length)
				variant = source.Variants[0];

			if (!variant && source.URL) {
				variant = {
					ID: 'default',
					URL: source.URL,
					Type: source.Type,
					Codecs: source.Codecs,
					Label: source.Title || 'Default',
					Stream: source.Stream || null
				};
			}

			if (variant)
				started = this._build(variant, audioTrack);
		}

		if (!started) {
			/*
			 * Remove the one-shot callback if rebuilding failed synchronously.
			 * Once() hides its wrapper, so clear all ready listeners added by
			 * this path by using a generation-safe fallback: the failed rebuild
			 * cannot become ready anyway, and the Ayle will receive error from
			 * the builder where appropriate.
			 */
			return false;
		}

		return true;
	};

	AyleMSEMediaDriver.prototype.Seek = function (position) {
		/*
		 * After MediaSource.endOfStream(), readyState is "ended" and the old
		 * loaders cannot issue a new initial fragment request. Replay from the
		 * beginning therefore rebuilds the MSE pipeline instead of trying to
		 * seek the closed one.
		 */
		if (
			this._mediaSource &&
			this._mediaSource.readyState === 'ended' &&
			position <= 0.001
		)
			return this._restartEndedStream(0);

		var loaders = [];

		if (this._videoLoader)
			loaders.push(this._videoLoader);

		if (this._audioLoader)
			loaders.push(this._audioLoader);

		if (!loaders.length) {
			this.Element.currentTime = position;
			return true;
		}

		var i = 0;
		while (i < loaders.length) {
			if (loaders[i].Mode === 'range') {
				if (!loaders[i]._contains(position)) {
					this.Emit(
						'error',
						new Error('Random seek outside buffered data is unavailable in range mode; use segment or time mode for arbitrary seeking')
					);
					return false;
				}
			}
			i++;
		}

		/* All range loaders already contain the requested position. */
		var allRange = true;
		i = 0;
		while (i < loaders.length) {
			if (loaders[i].Mode !== 'range') {
				allRange = false;
				break;
			}
			i++;
		}

		if (allRange) {
			this.Element.currentTime = position;
			return true;
		}

		var self = this;
		var seekGeneration = ++this._seekGeneration;
		var pending = loaders.length;
		var failed = false;

		var done = function (error) {
			if (seekGeneration !== self._seekGeneration || failed)
				return;

			if (error) {
				failed = true;
				self.Emit('error', error);
				return;
			}

			pending--;
			if (pending !== 0)
				return;

			try {
				self.Element.currentTime = position;
			}
			catch (seekError) {
				self.Emit('error', seekError);
				return;
			}

			self._emitMSEProgress();
			self._pumpStreams();
		};

		i = 0;
		while (i < loaders.length) {
			if (loaders[i].Mode === 'range')
				done(null);
			else
				loaders[i].Seek(position, done);

			i++;
		}

		return true;
	};


	AyleMSEMediaDriver.prototype.SetAudioTrack = function (track) {
		if (!track || !track.URL || !this._mediaSource || this._mediaSource.readyState !== 'open')
			return false;

		if (this._selectedAudioTrack && this._selectedAudioTrack.ID === track.ID)
			return true;

		var NativeMediaSource = window.MediaSource;
		var type = this._mime(track, 'audio/mp4');
		if (!type || !NativeMediaSource.isTypeSupported(type))
			return false;

		var position = this.Element.currentTime || 0;
		var mode = track.Stream && track.Stream.Mode ? track.Stream.Mode : 'range';
		if (position > 0.25 && mode !== 'segments' && mode !== 'time') {
			this.Emit('error', new Error('Switching an external audio track at a non-zero position requires segment or time mode'));
			return false;
		}

		var self = this;
		var mediaSource = this._mediaSource;
		var generation = this._generation;
		var switchGeneration = ++this._audioSwitchGeneration;

		if (this._audioLoader) {
			this._audioLoader.Stop();
			this._audioLoader = null;
		}

		var buffer = this._audioBuffer;

		/* Create the audio SourceBuffer only once. Normal track switches reuse it. */
		if (!buffer || !this._hasSourceBuffer(buffer)) {
			try {
				buffer = mediaSource.addSourceBuffer(type);
				this._audioBuffer = buffer;
				this._audioType = type;
			}
			catch (createError) {
				this.Emit('error', createError);
				return false;
			}
		}

		var activate = function () {
			if (
				generation !== self._generation ||
				switchGeneration !== self._audioSwitchGeneration ||
				mediaSource !== self._mediaSource ||
				mediaSource.readyState !== 'open' ||
				!self._hasSourceBuffer(buffer)
			)
				return;

			self._waitSourceBuffer(buffer, function () {
				if (
					generation !== self._generation ||
					switchGeneration !== self._audioSwitchGeneration ||
					!self._hasSourceBuffer(buffer)
				)
					return;

				try {
					if (self._audioType !== type) {
						if (typeof buffer.changeType !== 'function')
							throw new Error('Audio SourceBuffer type change is not supported: ' + self._audioType + ' -> ' + type);

						buffer.changeType(type);
						self._audioType = type;
					}
				}
				catch (typeError) {
					self.Emit('error', typeError);
					return;
				}

				self._clearSourceBuffer(buffer, function (clearError) {
					if (clearError) {
						self.Emit('error', clearError);
						return;
					}

					if (
						generation !== self._generation ||
						switchGeneration !== self._audioSwitchGeneration ||
						!self._hasSourceBuffer(buffer)
					)
						return;

					self._selectedAudioTrack = track;
					self._audioLoader = new AyleMSEStreamLoader(self, buffer, track, generation, 'audio');
					self._audioLoader.Start(position);

					if (self.Debug) {
						console.log('[MSE audio track switched]', {
							TrackID: track.ID,
							Type: type,
							Position: position,
							ReusedSourceBuffer: true
						});
					}

					self.Emit('audioTracksChange', self._readAudioTracks());
					self._emitMSEProgress();
				});
			});
		};

		activate();
		return true;
	};

	AyleMSEMediaDriver.prototype.ClearCache = function () {};


	
	var PlayerDefaultLocalization = {
		'play': 'Play',
		'pause': 'Pause',
		'previous': 'Previous',
		'next': 'Next',
		'mute': 'Mute',
		'unmute': 'Unmute',
		'chapters': 'Chapters',
		'quality': 'Quality',
		'videoQuality': 'Video quality',
		'qualityValue': 'Quality: {value}',
		'settings': 'Settings',
		'autoplay': 'Autoplay',
		'audio': 'Audio',
		'audioTrack': 'Audio track',
		'audioFallback': 'Audio {index}',
		'subtitles': 'Subtitles',
		'subtitlesOff': 'Off',
		'subtitlesFallback': 'Subtitles {index}',
		'forced': 'Forced',
		'nativeSubtitles': 'Native subtitles',
		'nativeSubtitlesInPiP': 'Native subtitles in PiP',
		'pictureInPicture': 'Picture in Picture',
		'exitPictureInPicture': 'Exit Picture in Picture',
		'enterFullscreen': 'Enter fullscreen',
		'exitFullscreen': 'Exit fullscreen',
		'back': 'Back',
		'dismiss': 'Dismiss',
		'open': 'Open',
		'quizAnswer': 'Answer',
		'debug': 'Debug',
		'debugEnabled': 'Ayle debug',
		'debugMP4': 'MP4 debug',
		'shortcuts': 'Shortcuts',
		'shortcutPlayPause': 'Play / Pause',
		'shortcutSeekArrows': 'Seek with arrows',
		'shortcutSeekAngle': 'Seek with , / .',
		'shortcutVolume': 'Volume with arrows',
		'shortcutMute': 'Mute',
		'shortcutSubtitles': 'Subtitles',
		'shortcutFullscreen': 'Fullscreen',
		'shortcutPictureInPicture': 'Picture in Picture'
	};

	var PlayerRussianLocalization = {
		'play': 'Воспроизвести',
		'pause': 'Пауза',
		'previous': 'Предыдущий',
		'next': 'Следующий',
		'mute': 'Выключить звук',
		'unmute': 'Включить звук',
		'chapters': 'Главы',
		'quality': 'Качество',
		'videoQuality': 'Качество видео',
		'qualityValue': 'Качество: {value}',
		'settings': 'Настройки',
		'autoplay': 'Автовоспроизведение',
		'audio': 'Аудио',
		'audioTrack': 'Аудиодорожка',
		'audioFallback': 'Аудио {index}',
		'subtitles': 'Субтитры',
		'subtitlesOff': 'Выключены',
		'subtitlesFallback': 'Субтитры {index}',
		'forced': 'Форсированные',
		'nativeSubtitles': 'Нативные субтитры',
		'nativeSubtitlesInPiP': 'Нативные субтитры в PiP',
		'pictureInPicture': 'Картинка в картинке',
		'exitPictureInPicture': 'Выйти из режима Картинка в картинке',
		'enterFullscreen': 'На весь экран',
		'exitFullscreen': 'Выйти из полноэкранного режима',
		'back': 'Назад',
		'dismiss': 'Закрыть',
		'open': 'Открыть',
		'quizAnswer': 'Ответить',
		'debug': 'Отладка',
		'debugEnabled': 'Основная отладка',
		'debugMP4': 'Отладка MP4',
		'shortcuts': 'Горячие клавиши',
		'shortcutPlayPause': 'Воспроизведение / Пауза',
		'shortcutSeekArrows': 'Перемотка стрелками',
		'shortcutSeekAngle': 'Перемотка , / .',
		'shortcutVolume': 'Громкость стрелками',
		'shortcutMute': 'Выключение звука',
		'shortcutSubtitles': 'Субтитры',
		'shortcutFullscreen': 'Полноэкранный режим',
		'shortcutPictureInPicture': 'Картинка в картинке'
	};


	var PlayerMoldovanLocalization = {
		'play': 'Redare',
		'pause': 'Pauză',
		'mute': 'Dezactivează sunetul',
		'unmute': 'Activează sunetul',
		'chapters': 'Capitole',
		'quality': 'Calitate',
		'videoQuality': 'Calitate video',
		'qualityValue': 'Calitate: {value}',
		'settings': 'Setări',
		'autoplay': 'Redare automată',
		'audio': 'Audio',
		'audioTrack': 'Pistă audio',
		'audioFallback': 'Audio {index}',
		'subtitles': 'Subtitrări',
		'subtitlesOff': 'Dezactivate',
		'subtitlesFallback': 'Subtitrări {index}',
		'forced': 'Forțate',
		'nativeSubtitles': 'Subtitrări native',
		'nativeSubtitlesInPiP': 'Subtitrări native în PiP',
		'pictureInPicture': 'Imagine în imagine',
		'exitPictureInPicture': 'Ieșire din modul Imagine în imagine',
		'enterFullscreen': 'Ecran complet',
		'exitFullscreen': 'Ieșire din ecran complet',
		'back': 'Înapoi',
		'dismiss': 'Închide',
		'open': 'Deschide',
		'quizAnswer': 'Răspunde',
		'debug': 'Depanare',
		'debugEnabled': 'Depanare player',
		'debugMP4': 'Depanare MP4',
		'shortcuts': 'Scurtături',
		'shortcutPlayPause': 'Redare / Pauză',
		'shortcutSeekArrows': 'Derulare cu săgețile',
		'shortcutSeekAngle': 'Derulare cu , / .',
		'shortcutVolume': 'Volum cu săgețile',
		'shortcutMute': 'Dezactivare sunet',
		'shortcutSubtitles': 'Subtitrări',
		'shortcutFullscreen': 'Ecran complet',
		'shortcutPictureInPicture': 'Imagine în imagine'
	};

	var PlayerGermanLocalization = {
		'play': 'Wiedergabe',
		'pause': 'Pause',
		'mute': 'Stummschalten',
		'unmute': 'Ton einschalten',
		'chapters': 'Kapitel',
		'quality': 'Qualität',
		'videoQuality': 'Videoqualität',
		'qualityValue': 'Qualität: {value}',
		'settings': 'Einstellungen',
		'autoplay': 'Automatische Wiedergabe',
		'audio': 'Audio',
		'audioTrack': 'Audiospur',
		'audioFallback': 'Audio {index}',
		'subtitles': 'Untertitel',
		'subtitlesOff': 'Aus',
		'subtitlesFallback': 'Untertitel {index}',
		'forced': 'Erzwungen',
		'nativeSubtitles': 'Native Untertitel',
		'nativeSubtitlesInPiP': 'Native Untertitel in PiP',
		'pictureInPicture': 'Bild-in-Bild',
		'exitPictureInPicture': 'Bild-in-Bild beenden',
		'enterFullscreen': 'Vollbild',
		'exitFullscreen': 'Vollbild beenden',
		'back': 'Zurück',
		'dismiss': 'Schließen',
		'open': 'Öffnen',
		'quizAnswer': 'Antworten',
		'debug': 'Debug',
		'debugEnabled': 'Ayle-Debug',
		'debugMP4': 'MP4-Debug',
		'shortcuts': 'Tastenkürzel',
		'shortcutPlayPause': 'Wiedergabe / Pause',
		'shortcutSeekArrows': 'Spulen mit Pfeiltasten',
		'shortcutSeekAngle': 'Spulen mit , / .',
		'shortcutVolume': 'Lautstärke mit Pfeiltasten',
		'shortcutMute': 'Stummschalten',
		'shortcutSubtitles': 'Untertitel',
		'shortcutFullscreen': 'Vollbild',
		'shortcutPictureInPicture': 'Bild-in-Bild'
	};

	var PlayerSpanishLocalization = {
		'play': 'Reproducir',
		'pause': 'Pausa',
		'mute': 'Silenciar',
		'unmute': 'Activar sonido',
		'chapters': 'Capítulos',
		'quality': 'Calidad',
		'videoQuality': 'Calidad de vídeo',
		'qualityValue': 'Calidad: {value}',
		'settings': 'Configuración',
		'autoplay': 'Reproducción automática',
		'audio': 'Audio',
		'audioTrack': 'Pista de audio',
		'audioFallback': 'Audio {index}',
		'subtitles': 'Subtítulos',
		'subtitlesOff': 'Desactivados',
		'subtitlesFallback': 'Subtítulos {index}',
		'forced': 'Forzados',
		'nativeSubtitles': 'Subtítulos nativos',
		'nativeSubtitlesInPiP': 'Subtítulos nativos en PiP',
		'pictureInPicture': 'Imagen en imagen',
		'exitPictureInPicture': 'Salir de Imagen en imagen',
		'enterFullscreen': 'Pantalla completa',
		'exitFullscreen': 'Salir de pantalla completa',
		'back': 'Atrás',
		'dismiss': 'Cerrar',
		'open': 'Abrir',
		'quizAnswer': 'Responder',
		'debug': 'Depuración',
		'debugEnabled': 'Depuración del reproductor',
		'debugMP4': 'Depuración MP4',
		'shortcuts': 'Atajos de teclado',
		'shortcutPlayPause': 'Reproducir / Pausa',
		'shortcutSeekArrows': 'Buscar con flechas',
		'shortcutSeekAngle': 'Buscar con , / .',
		'shortcutVolume': 'Volumen con flechas',
		'shortcutMute': 'Silenciar',
		'shortcutSubtitles': 'Subtítulos',
		'shortcutFullscreen': 'Pantalla completa',
		'shortcutPictureInPicture': 'Imagen en imagen'
	};

	var PlayerFrenchLocalization = {
		'play': 'Lire',
		'pause': 'Pause',
		'mute': 'Couper le son',
		'unmute': 'Activer le son',
		'chapters': 'Chapitres',
		'quality': 'Qualité',
		'videoQuality': 'Qualité vidéo',
		'qualityValue': 'Qualité : {value}',
		'settings': 'Paramètres',
		'autoplay': 'Lecture automatique',
		'audio': 'Audio',
		'audioTrack': 'Piste audio',
		'audioFallback': 'Audio {index}',
		'subtitles': 'Sous-titres',
		'subtitlesOff': 'Désactivés',
		'subtitlesFallback': 'Sous-titres {index}',
		'forced': 'Forcés',
		'nativeSubtitles': 'Sous-titres natifs',
		'nativeSubtitlesInPiP': 'Sous-titres natifs en PiP',
		'pictureInPicture': 'Image dans l’image',
		'exitPictureInPicture': 'Quitter le mode Image dans l’image',
		'enterFullscreen': 'Plein écran',
		'exitFullscreen': 'Quitter le plein écran',
		'back': 'Retour',
		'dismiss': 'Fermer',
		'open': 'Ouvrir',
		'quizAnswer': 'Répondre',
		'debug': 'Débogage',
		'debugEnabled': 'Débogage du lecteur',
		'debugMP4': 'Débogage MP4',
		'shortcuts': 'Raccourcis clavier',
		'shortcutPlayPause': 'Lecture / Pause',
		'shortcutSeekArrows': 'Recherche avec les flèches',
		'shortcutSeekAngle': 'Recherche avec , / .',
		'shortcutVolume': 'Volume avec les flèches',
		'shortcutMute': 'Couper le son',
		'shortcutSubtitles': 'Sous-titres',
		'shortcutFullscreen': 'Plein écran',
		'shortcutPictureInPicture': 'Image dans l’image'
	};

	var PlayerChineseLocalization = {
		'play': '播放',
		'pause': '暂停',
		'mute': '静音',
		'unmute': '取消静音',
		'chapters': '章节',
		'quality': '清晰度',
		'videoQuality': '视频清晰度',
		'qualityValue': '清晰度：{value}',
		'settings': '设置',
		'autoplay': '自动播放',
		'audio': '音频',
		'audioTrack': '音轨',
		'audioFallback': '音频 {index}',
		'subtitles': '字幕',
		'subtitlesOff': '关闭',
		'subtitlesFallback': '字幕 {index}',
		'forced': '强制字幕',
		'nativeSubtitles': '原生字幕',
		'nativeSubtitlesInPiP': '画中画中的原生字幕',
		'pictureInPicture': '画中画',
		'exitPictureInPicture': '退出画中画',
		'enterFullscreen': '全屏',
		'exitFullscreen': '退出全屏',
		'back': '返回',
		'dismiss': '关闭',
		'open': '打开',
		'quizAnswer': '回答',
		'debug': '调试',
		'debugEnabled': '播放器调试',
		'debugMP4': 'MP4 调试',
		'shortcuts': '快捷键',
		'shortcutPlayPause': '播放 / 暂停',
		'shortcutSeekArrows': '使用方向键快进/快退',
		'shortcutSeekAngle': '使用 , / . 快进/快退',
		'shortcutVolume': '使用方向键调节音量',
		'shortcutMute': '静音',
		'shortcutSubtitles': '字幕',
		'shortcutFullscreen': '全屏',
		'shortcutPictureInPicture': '画中画'
	};

	var PlayerJapaneseLocalization = {
		'play': '再生',
		'pause': '一時停止',
		'mute': 'ミュート',
		'unmute': 'ミュート解除',
		'chapters': 'チャプター',
		'quality': '画質',
		'videoQuality': '動画の画質',
		'qualityValue': '画質: {value}',
		'settings': '設定',
		'autoplay': '自動再生',
		'audio': '音声',
		'audioTrack': '音声トラック',
		'audioFallback': '音声 {index}',
		'subtitles': '字幕',
		'subtitlesOff': 'オフ',
		'subtitlesFallback': '字幕 {index}',
		'forced': '強制',
		'nativeSubtitles': 'ネイティブ字幕',
		'nativeSubtitlesInPiP': 'PiP のネイティブ字幕',
		'pictureInPicture': 'ピクチャーインピクチャー',
		'exitPictureInPicture': 'ピクチャーインピクチャーを終了',
		'enterFullscreen': '全画面表示',
		'exitFullscreen': '全画面表示を終了',
		'back': '戻る',
		'dismiss': '閉じる',
		'open': '開く',
		'quizAnswer': '回答',
		'debug': 'デバッグ',
		'debugEnabled': 'プレーヤーデバッグ',
		'debugMP4': 'MP4 デバッグ',
		'shortcuts': 'ショートカット',
		'shortcutPlayPause': '再生 / 一時停止',
		'shortcutSeekArrows': '矢印キーでシーク',
		'shortcutSeekAngle': ', / . でシーク',
		'shortcutVolume': '矢印キーで音量調整',
		'shortcutMute': 'ミュート',
		'shortcutSubtitles': '字幕',
		'shortcutFullscreen': '全画面表示',
		'shortcutPictureInPicture': 'ピクチャーインピクチャー'
	};

	var PlayerGreekLocalization = {
		'play': 'Αναπαραγωγή',
		'pause': 'Παύση',
		'mute': 'Σίγαση',
		'unmute': 'Κατάργηση σίγασης',
		'chapters': 'Κεφάλαια',
		'quality': 'Ποιότητα',
		'videoQuality': 'Ποιότητα βίντεο',
		'qualityValue': 'Ποιότητα: {value}',
		'settings': 'Ρυθμίσεις',
		'autoplay': 'Αυτόματη αναπαραγωγή',
		'audio': 'Ήχος',
		'audioTrack': 'Κομμάτι ήχου',
		'audioFallback': 'Ήχος {index}',
		'subtitles': 'Υπότιτλοι',
		'subtitlesOff': 'Απενεργοποιημένοι',
		'subtitlesFallback': 'Υπότιτλοι {index}',
		'forced': 'Εξαναγκασμένοι',
		'nativeSubtitles': 'Εγγενείς υπότιτλοι',
		'nativeSubtitlesInPiP': 'Εγγενείς υπότιτλοι σε PiP',
		'pictureInPicture': 'Εικόνα σε εικόνα',
		'exitPictureInPicture': 'Έξοδος από Εικόνα σε εικόνα',
		'enterFullscreen': 'Πλήρης οθόνη',
		'exitFullscreen': 'Έξοδος από πλήρη οθόνη',
		'back': 'Πίσω',
		'dismiss': 'Κλείσιμο',
		'open': 'Άνοιγμα',
		'quizAnswer': 'Απάντηση',
		'debug': 'Αποσφαλμάτωση',
		'debugEnabled': 'Αποσφαλμάτωση player',
		'debugMP4': 'Αποσφαλμάτωση MP4',
		'shortcuts': 'Συντομεύσεις',
		'shortcutPlayPause': 'Αναπαραγωγή / Παύση',
		'shortcutSeekArrows': 'Μετακίνηση με βέλη',
		'shortcutSeekAngle': 'Μετακίνηση με , / .',
		'shortcutVolume': 'Ένταση με βέλη',
		'shortcutMute': 'Σίγαση',
		'shortcutSubtitles': 'Υπότιτλοι',
		'shortcutFullscreen': 'Πλήρης οθόνη',
		'shortcutPictureInPicture': 'Εικόνα σε εικόνα'
	};

	var PlayerItalianLocalization = {
		'play': 'Riproduci',
		'pause': 'Pausa',
		'mute': 'Disattiva audio',
		'unmute': 'Attiva audio',
		'chapters': 'Capitoli',
		'quality': 'Qualità',
		'videoQuality': 'Qualità video',
		'qualityValue': 'Qualità: {value}',
		'settings': 'Impostazioni',
		'autoplay': 'Riproduzione automatica',
		'audio': 'Audio',
		'audioTrack': 'Traccia audio',
		'audioFallback': 'Audio {index}',
		'subtitles': 'Sottotitoli',
		'subtitlesOff': 'Disattivati',
		'subtitlesFallback': 'Sottotitoli {index}',
		'forced': 'Forzati',
		'nativeSubtitles': 'Sottotitoli nativi',
		'nativeSubtitlesInPiP': 'Sottotitoli nativi in PiP',
		'pictureInPicture': 'Picture in Picture',
		'exitPictureInPicture': 'Esci da Picture in Picture',
		'enterFullscreen': 'Schermo intero',
		'exitFullscreen': 'Esci da schermo intero',
		'back': 'Indietro',
		'dismiss': 'Chiudi',
		'open': 'Apri',
		'quizAnswer': 'Rispondi',
		'debug': 'Debug',
		'debugEnabled': 'Debug del player',
		'debugMP4': 'Debug MP4',
		'shortcuts': 'Scorciatoie',
		'shortcutPlayPause': 'Riproduci / Pausa',
		'shortcutSeekArrows': 'Spostamento con le frecce',
		'shortcutSeekAngle': 'Spostamento con , / .',
		'shortcutVolume': 'Volume con le frecce',
		'shortcutMute': 'Disattiva audio',
		'shortcutSubtitles': 'Sottotitoli',
		'shortcutFullscreen': 'Schermo intero',
		'shortcutPictureInPicture': 'Picture in Picture'
	};

	var PlayerTurkishLocalization = {
		'play': 'Oynat',
		'pause': 'Duraklat',
		'mute': 'Sesi kapat',
		'unmute': 'Sesi aç',
		'chapters': 'Bölümler',
		'quality': 'Kalite',
		'videoQuality': 'Video kalitesi',
		'qualityValue': 'Kalite: {value}',
		'settings': 'Ayarlar',
		'autoplay': 'Otomatik oynatma',
		'audio': 'Ses',
		'audioTrack': 'Ses parçası',
		'audioFallback': 'Ses {index}',
		'subtitles': 'Altyazılar',
		'subtitlesOff': 'Kapalı',
		'subtitlesFallback': 'Altyazı {index}',
		'forced': 'Zorunlu',
		'nativeSubtitles': 'Yerel altyazılar',
		'nativeSubtitlesInPiP': 'PiP’de yerel altyazılar',
		'pictureInPicture': 'Resim içinde resim',
		'exitPictureInPicture': 'Resim içinde resimden çık',
		'enterFullscreen': 'Tam ekran',
		'exitFullscreen': 'Tam ekrandan çık',
		'back': 'Geri',
		'dismiss': 'Kapat',
		'open': 'Aç',
		'quizAnswer': 'Yanıtla',
		'debug': 'Hata ayıklama',
		'debugEnabled': 'Oynatıcı hata ayıklaması',
		'debugMP4': 'MP4 hata ayıklaması',
		'shortcuts': 'Kısayollar',
		'shortcutPlayPause': 'Oynat / Duraklat',
		'shortcutSeekArrows': 'Ok tuşlarıyla sar',
		'shortcutSeekAngle': ', / . ile sar',
		'shortcutVolume': 'Ok tuşlarıyla ses',
		'shortcutMute': 'Sesi kapat',
		'shortcutSubtitles': 'Altyazılar',
		'shortcutFullscreen': 'Tam ekran',
		'shortcutPictureInPicture': 'Resim içinde resim'
	};

	var PlayerArabicLocalization = {
		'play': 'تشغيل',
		'pause': 'إيقاف مؤقت',
		'mute': 'كتم الصوت',
		'unmute': 'إلغاء كتم الصوت',
		'chapters': 'الفصول',
		'quality': 'الجودة',
		'videoQuality': 'جودة الفيديو',
		'qualityValue': 'الجودة: {value}',
		'settings': 'الإعدادات',
		'autoplay': 'التشغيل التلقائي',
		'audio': 'الصوت',
		'audioTrack': 'المسار الصوتي',
		'audioFallback': 'الصوت {index}',
		'subtitles': 'الترجمة',
		'subtitlesOff': 'متوقفة',
		'subtitlesFallback': 'الترجمة {index}',
		'forced': 'إجبارية',
		'nativeSubtitles': 'الترجمة الأصلية',
		'nativeSubtitlesInPiP': 'الترجمة الأصلية في PiP',
		'pictureInPicture': 'صورة داخل صورة',
		'exitPictureInPicture': 'الخروج من صورة داخل صورة',
		'enterFullscreen': 'ملء الشاشة',
		'exitFullscreen': 'الخروج من ملء الشاشة',
		'back': 'رجوع',
		'dismiss': 'إغلاق',
		'open': 'فتح',
		'quizAnswer': 'إجابة',
		'debug': 'تصحيح',
		'debugEnabled': 'تصحيح المشغل',
		'debugMP4': 'تصحيح MP4',
		'shortcuts': 'اختصارات لوحة المفاتيح',
		'shortcutPlayPause': 'تشغيل / إيقاف مؤقت',
		'shortcutSeekArrows': 'التقديم والترجيع بالأسهم',
		'shortcutSeekAngle': 'التقديم والترجيع بـ , / .',
		'shortcutVolume': 'الصوت بالأسهم',
		'shortcutMute': 'كتم الصوت',
		'shortcutSubtitles': 'الترجمة',
		'shortcutFullscreen': 'ملء الشاشة',
		'shortcutPictureInPicture': 'صورة داخل صورة'
	};

	var PlayerHindiLocalization = {
		'play': 'चलाएँ',
		'pause': 'रोकें',
		'mute': 'आवाज़ बंद करें',
		'unmute': 'आवाज़ चालू करें',
		'chapters': 'अध्याय',
		'quality': 'गुणवत्ता',
		'videoQuality': 'वीडियो गुणवत्ता',
		'qualityValue': 'गुणवत्ता: {value}',
		'settings': 'सेटिंग्स',
		'autoplay': 'अपने आप चलाएँ',
		'audio': 'ऑडियो',
		'audioTrack': 'ऑडियो ट्रैक',
		'audioFallback': 'ऑडियो {index}',
		'subtitles': 'उपशीर्षक',
		'subtitlesOff': 'बंद',
		'subtitlesFallback': 'उपशीर्षक {index}',
		'forced': 'अनिवार्य',
		'nativeSubtitles': 'नेटिव उपशीर्षक',
		'nativeSubtitlesInPiP': 'PiP में नेटिव उपशीर्षक',
		'pictureInPicture': 'पिक्चर इन पिक्चर',
		'exitPictureInPicture': 'पिक्चर इन पिक्चर से बाहर निकलें',
		'enterFullscreen': 'पूर्ण स्क्रीन',
		'exitFullscreen': 'पूर्ण स्क्रीन से बाहर निकलें',
		'back': 'वापस',
		'dismiss': 'बंद करें',
		'open': 'खोलें',
		'quizAnswer': 'उत्तर दें',
		'debug': 'डीबग',
		'debugEnabled': 'प्लेयर डीबग',
		'debugMP4': 'MP4 डीबग',
		'shortcuts': 'कीबोर्ड शॉर्टकट',
		'shortcutPlayPause': 'चलाएँ / रोकें',
		'shortcutSeekArrows': 'तीर कुंजियों से आगे/पीछे जाएँ',
		'shortcutSeekAngle': ', / . से आगे/पीछे जाएँ',
		'shortcutVolume': 'तीर कुंजियों से आवाज़',
		'shortcutMute': 'आवाज़ बंद करें',
		'shortcutSubtitles': 'उपशीर्षक',
		'shortcutFullscreen': 'पूर्ण स्क्रीन',
		'shortcutPictureInPicture': 'पिक्चर इन पिक्चर'
	};



	function AyleNormalizeLocalizationCode (language) {
		language = String(language || '').replace(/_/g, '-');

		if (!language)
			return '';

		var parts = language.split('-');
		var result = parts[0].toLowerCase();

		if (parts.length > 1 && parts[1])
			result += '-' + parts[1].toUpperCase();

		return result;
	}


	function AyleGetBrowserLocalization () {
		var navigatorObject = global.navigator || {};
		var languages = navigatorObject.languages instanceof Array ?
			navigatorObject.languages.slice(0) : [];

		if (!languages.length && navigatorObject.language)
			languages.push(navigatorObject.language);

		var localizations = {
			'ru': PlayerRussianLocalization,
			'ru-RU': PlayerRussianLocalization,
			'ru-MD': PlayerRussianLocalization,
			'ro': PlayerMoldovanLocalization,
			'ro-MD': PlayerMoldovanLocalization,
			'md': PlayerMoldovanLocalization,
			'md-MD': PlayerMoldovanLocalization,
			'de': PlayerGermanLocalization,
			'es': PlayerSpanishLocalization,
			'fr': PlayerFrenchLocalization,
			'zh': PlayerChineseLocalization,
			'zh-CN': PlayerChineseLocalization,
			'ja': PlayerJapaneseLocalization,
			'el': PlayerGreekLocalization,
			'it': PlayerItalianLocalization,
			'tr': PlayerTurkishLocalization,
			'ar': PlayerArabicLocalization,
			'hi': PlayerHindiLocalization,
			'hi-IN': PlayerHindiLocalization
		};

		var i = 0;

		while (i < languages.length) {
			var code = AyleNormalizeLocalizationCode(languages[i]);

			if (code === 'en' || code.indexOf('en-') === 0)
				return null;

			if (localizations[code] !== undefined)
				return localizations[code];

			if (code.indexOf('-') !== -1) {
				var base = code.split('-')[0];

				if (localizations[base] !== undefined)
					return localizations[base];
			}

			i++;
		}

		return null;
	}


	function AyleCopyLocalization (source) {
		var result = {};
		var name;

		for (name in PlayerDefaultLocalization) {
			if (Object.prototype.hasOwnProperty.call(PlayerDefaultLocalization, name))
				result[name] = PlayerDefaultLocalization[name];
		}

		source = source || {};
		for (name in source) {
			if (Object.prototype.hasOwnProperty.call(source, name))
				result[name] = source[name];
		}

		return result;
	}


	function AyleNormalizeSettingsOrder (order) {
		if (!(order instanceof Array))
			return [];

		var result = [];
		var used = {};
		var separatorPending = false;
		var i = 0;

		while (i < order.length) {
			var raw = order[i];
			var name = raw === '' ? '' : String(raw || '');

			if (name === '') {
				/*
				 * Do not append immediately. A separator is only materialized
				 * when a real unique item follows it. This automatically removes
				 * leading, trailing and repeated separators.
				 */
				if (result.length)
					separatorPending = true;
			}
			else if (!used[name]) {
				if (separatorPending && result.length && result[result.length - 1] !== '')
					result.push('');

				separatorPending = false;
				used[name] = true;
				result.push(name);
			}

			i++;
		}

		return result;
	}


	var AyleDriverRegistry = {};
	var AyleBuiltInDrivers = {
		html5: true,
		mse: true
	};

	function AyleNormalizeDriverName (name) {
		return String(name || '').replace(/^\s+|\s+$/g, '').toLowerCase();
	}

	Ayle.RegisterDriver = function (name, Driver) {
		name = AyleNormalizeDriverName(name);

		if (!name)
			throw new Error('Ayle driver name is empty');

		if (AyleBuiltInDrivers[name])
			throw new Error('Built-in Ayle driver cannot be overwritten: ' + name);

		if (typeof Driver !== 'function')
			throw new Error('Ayle driver must be a constructor: ' + name);

		AyleDriverRegistry[name] = Driver;
		return Ayle;
	};

	Ayle.GetDriver = function (name) {
		name = AyleNormalizeDriverName(name);
		return name && AyleDriverRegistry[name] ?
			AyleDriverRegistry[name] : null;
	};

	Ayle.HasDriver = function (name) {
		return !!Ayle.GetDriver(name);
	};

	Ayle.RemoveDriver = function (name) {
		name = AyleNormalizeDriverName(name);

		if (!name || AyleBuiltInDrivers[name])
			return false;

		if (!AyleDriverRegistry[name])
			return false;

		delete AyleDriverRegistry[name];
		return true;
	};

	Ayle.CreateDriver = function (name, options) {
		name = AyleNormalizeDriverName(name || 'html5');

		var Driver = Ayle.GetDriver(name);

		if (!Driver)
			throw new Error('Unknown Ayle driver: ' + name);

		var driver = new Driver();

		if (options !== undefined && typeof driver.SetOptions === 'function')
			driver.SetOptions(options || {});

		return driver;
	};

	AyleDriverRegistry.html5 = AyleHTML5MediaDriver;
	AyleDriverRegistry.mse = AyleMSEMediaDriver;


	var AylePresetRegistry = {};
	var AyleBuiltInPresets = {
		video: true,
		audio: true
	};

	function AylePresetCloneValue (value) {
		if (Array.isArray(value)) {
			var array = [];
			var i = 0;

			while (i < value.length) {
				array.push(AylePresetCloneValue(value[i]));
				i++;
			}

			return array;
		}

		if (value && typeof value === 'object') {
			var object = {};

			for (var key in value) {
				if (Object.prototype.hasOwnProperty.call(value, key))
					object[key] = AylePresetCloneValue(value[key]);
			}

			return object;
		}

		return value;
	}

	function AylePresetMerge (base, override) {
		var result = AylePresetCloneValue(base || {});
		override = override || {};

		for (var key in override) {
			if (!Object.prototype.hasOwnProperty.call(override, key))
				continue;

			if (
				result[key] &&
				override[key] &&
				typeof result[key] === 'object' &&
				typeof override[key] === 'object' &&
				!Array.isArray(result[key]) &&
				!Array.isArray(override[key])
			)
				result[key] = AylePresetMerge(result[key], override[key]);
			else
				result[key] = AylePresetCloneValue(override[key]);
		}

		return result;
	}

	function AyleMergeIntegrationOverlays (base, override) {
		base = base instanceof Array ? base : [];
		override = override instanceof Array ? override : [];

		var result = AylePresetCloneValue(base);
		var indexes = {};
		var i = 0;

		while (i < result.length) {
			var baseItem = result[i];

			if (
				baseItem &&
				baseItem.ID !== undefined &&
				baseItem.ID !== null &&
				baseItem.ID !== ''
			)
				indexes[String(baseItem.ID)] = i;

			i++;
		}

		i = 0;
		while (i < override.length) {
			var item = AylePresetCloneValue(override[i]);
			var hasID = !!(
				item &&
				item.ID !== undefined &&
				item.ID !== null &&
				item.ID !== ''
			);
			var id = hasID ? String(item.ID) : '';

			if (hasID && indexes[id] !== undefined)
				result[indexes[id]] = item;
			else {
				result.push(item);

				if (hasID)
					indexes[id] = result.length - 1;
			}

			i++;
		}

		return result;
	}

	function AyleNormalizePreset (preset) {
		preset = preset || {};

		var player = AylePresetCloneValue(preset.Player || {});
		var ui = preset.UI || player.UI || {};

		delete player.MediaMode;
		delete player.Preset;
		delete player.UI;

		var result = {
			Player: player,
			UI: {}
		};

		if (ui.Header instanceof Array)
			result.UI.Header = AylePresetCloneValue(ui.Header);

		if (ui.Track instanceof Array)
			result.UI.Track = AylePresetCloneValue(ui.Track);

		if (ui.Channel instanceof Array)
			result.UI.Channel = AylePresetCloneValue(ui.Channel);

		if (ui.Overlay instanceof Array)
			result.UI.Overlay = AylePresetCloneValue(ui.Overlay);

		if (ui.Toolbar) {
			result.UI.Toolbar = {};

			if (ui.Toolbar.Layout !== undefined)
				result.UI.Toolbar.Layout = String(ui.Toolbar.Layout).toLowerCase();

			if (ui.Toolbar.Items instanceof Array)
				result.UI.Toolbar.Items = AylePresetCloneValue(ui.Toolbar.Items);
		}

		return result;
	}

	function AyleGetPresetInternal (name) {
		name = String(name || '').toLowerCase();

		if (!name || !Object.prototype.hasOwnProperty.call(AylePresetRegistry, name))
			return null;

		return AylePresetRegistry[name];
	}

	function AylePresetToPlayerOptions (preset) {
		preset = AyleNormalizePreset(preset);

		var result = AylePresetCloneValue(preset.Player);

		if (
			preset.UI.Header instanceof Array ||
			preset.UI.Track instanceof Array ||
			preset.UI.Channel instanceof Array ||
			preset.UI.Overlay instanceof Array ||
			preset.UI.Toolbar
		)
			result.UI = AylePresetCloneValue(preset.UI);

		return result;
	}

	function AyleGetEffectivePreset (mode, customName) {
		var builtIn = AyleGetPresetInternal(mode === 'audio' ? 'audio' : 'video') || {};
		var result = AyleNormalizePreset(builtIn);
		var custom = customName ? AyleGetPresetInternal(customName) : null;

		if (custom) {
			result.Player = AylePresetMerge(result.Player, custom.Player);
			result.UI = AylePresetMerge(result.UI, custom.UI);
		}

		return result;
	}

	AylePresetRegistry.video = AyleNormalizePreset({
		Player: {
			ShowCenterPlayButton: true
		},
		UI: {
			Header: [],
			Track: ['title', 'chapter'],
			Channel: ['name', 'profile'],
			Overlay: ['track:compact'],
			Toolbar: {
				Layout: 'inline',
				Items: ['previous', 'play', 'next', 'timeline', 'time', 'volume', 'chapters', 'quality', 'fullscreen', 'settings']
			}
		}
	});

	AylePresetRegistry.audio = AyleNormalizePreset({
		Player: {
			ShowCenterPlayButton: false
		},
		UI: {
			Header: [],
			Track: ['artwork', 'title', 'artist', 'album'],
			Channel: ['name', 'profile'],
			Overlay: ['track:compact', 'subtitles'],
			Toolbar: {
				Layout: 'inline',
				Items: ['previous', 'play', 'next', 'timeline', 'time', 'volume', 'settings']
			}
		}
	});


function Ayle (config, internalOptions) {
		AyleEventEmitter.call(this);

		var assembly = null;
		var driver = null;
		var mediaProviderConfig = null;
		var playlistConfig = null;
		var explicitOptions;
		var options;

		if (
			config &&
			typeof config === 'object' &&
			typeof config.Load !== 'function'
		) {
			assembly = config;
			explicitOptions = assembly.Player || {};

			if (
				assembly.Driver &&
				typeof assembly.Driver.Load === 'function'
			)
				driver = assembly.Driver;
			else {
				var driverConfig = assembly.Driver || {};
				var driverType = driverConfig.Type || 'html5';
				var driverOptions = driverConfig.Options || {};
				driver = Ayle.CreateDriver(driverType, driverOptions);
			}

			mediaProviderConfig = assembly.MediaProvider || null;
			playlistConfig = assembly.Playlist || null;
		}
		else {
			/*
			 * Internal compatibility path used only by existing integrations
			 * while all canonical public examples use the assembly form.
			 */
			driver = config;
			explicitOptions = internalOptions || {};
		}

		if (!driver || typeof driver.Load !== 'function')
			throw new Error('Ayle driver is not configured');

		var requestedMediaMode = explicitOptions.MediaMode || 'auto';
		var requestedMediaMode = explicitOptions.MediaMode || 'auto';
		if (requestedMediaMode !== 'auto' && requestedMediaMode !== 'video' && requestedMediaMode !== 'audio')
			requestedMediaMode = 'auto';

		var requestedPreset = explicitOptions.Preset !== undefined && explicitOptions.Preset !== null ?
			String(explicitOptions.Preset).toLowerCase() : '';

		if (requestedPreset && !AyleGetPresetInternal(requestedPreset))
			throw new Error('Unknown Ayle preset: ' + requestedPreset);

		var effectivePreset = AyleGetEffectivePreset(
			requestedMediaMode === 'audio' ? 'audio' : 'video',
			requestedPreset
		);

		options = AylePresetMerge(
			AylePresetToPlayerOptions(effectivePreset),
			explicitOptions
		);

		options.MediaMode = requestedMediaMode;
		options.Preset = requestedPreset;

		var integration = options.Integration || {};
		var shortcuts = options.Shortcuts || {};
		var ui = options.UI || {};
		var toolbar = ui.Toolbar || options.Toolbar || {};
		var audioVisual = options.AudioVisual || {};
		var artworkSlideshow = options.ArtworkSlideshow || {};
		var hintSafeArea = options.HintSafeArea;
		if (typeof hintSafeArea === 'number') {
			hintSafeArea = {
				Top: hintSafeArea,
				Right: hintSafeArea,
				Bottom: hintSafeArea,
				Left: hintSafeArea
			};
		}
		else
			hintSafeArea = hintSafeArea || {};

		var explicitUI = explicitOptions.UI || {};
		var explicitToolbar = explicitUI.Toolbar || {};

		this._showCenterPlayButtonExplicit = explicitOptions.ShowCenterPlayButton !== undefined;
		this._uiExplicit = {
			Header: explicitUI.Header instanceof Array,
			Track: explicitUI.Track instanceof Array,
			Channel: explicitUI.Channel instanceof Array,
			Overlay: explicitUI.Overlay instanceof Array,
			ToolbarLayout: explicitToolbar.Layout !== undefined,
			ToolbarItems: explicitToolbar.Items instanceof Array
		};

		this.Options = {
			AutoSelectFirstSubtitleTrack: !!options.AutoSelectFirstSubtitleTrack,
			AutoPlay: !!options.AutoPlay,
			AutoPlayMode: options.AutoPlayMode || 'audible',
			Volume: options.Volume !== undefined ? Math.max(0, Math.min(1, Number(options.Volume) || 0)) : driver.GetVolume(),
			Muted: options.Muted !== undefined ? !!options.Muted : driver.GetMuted(),
			Start: options.Start !== undefined ? Math.max(0, Number(options.Start) || 0) : 0,
			NativeSubtitles: !!options.NativeSubtitles,
			SubtitleOffset: Number(options.SubtitleOffset) || 0,
			AutoNativeSubtitlesInPictureInPicture: !!options.AutoNativeSubtitlesInPictureInPicture,
			SubtitleStyle: options.SubtitleStyle || {},
			LoadingDelay: options.LoadingDelay !== undefined ? Math.max(0, Number(options.LoadingDelay) || 0) : 180,
			ForceShowQualityList: !!options.ForceShowQualityList,
			ForceShowChaptersList: !!options.ForceShowChaptersList,
			ForceShowPreviousButton: !!options.ForceShowPreviousButton,
			ForceShowNextButton: !!options.ForceShowNextButton,
			ShowCenterPlayButton: !!options.ShowCenterPlayButton,
			AutoFocus: options.AutoFocus === true,
			MediaMode: requestedMediaMode,
			Preset: requestedPreset,
			UI: {
				Header: ui.Header instanceof Array ? ui.Header.slice(0) : [],
				Track: ui.Track instanceof Array ? ui.Track.slice(0) : [],
				Channel: ui.Channel instanceof Array ? ui.Channel.slice(0) : [],
				Overlay: ui.Overlay instanceof Array ? ui.Overlay.slice(0) : [],
				Toolbar: {
					Layout: toolbar.Layout ? String(toolbar.Layout).toLowerCase() : 'inline',
					Items: toolbar.Items instanceof Array ? toolbar.Items.slice(0) : []
				}
			},
			AudioVisual: {
				Type: audioVisual.Type || 'auto',
				Image: audioVisual.Image || '',
				Subtitles: audioVisual.Subtitles !== false,
				MinHeight: audioVisual.MinHeight !== undefined ?
					Math.max(0, Number(audioVisual.MinHeight) || 0) : 240
			},
			ArtworkSlideshow: {
				Enabled: artworkSlideshow.Enabled !== false,
				HideControls: artworkSlideshow.HideControls === true,
				Interval: artworkSlideshow.Interval !== undefined ?
					Math.max(250, Number(artworkSlideshow.Interval) || 0) : 3000,
				FadeDuration: artworkSlideshow.FadeDuration !== undefined ?
					Math.max(0, Number(artworkSlideshow.FadeDuration) || 0) : 500,
				Fit: artworkSlideshow.Fit || 'cover'
			},
			KeyboardArrowSeekStep: options.KeyboardArrowSeekStep !== undefined ?
				Math.max(0, Number(options.KeyboardArrowSeekStep) || 0) : 10,
			KeyboardAngleSeekStep: options.KeyboardAngleSeekStep !== undefined ?
				(options.KeyboardAngleSeekStep === 'frame' ? 'frame' : Math.max(0, Number(options.KeyboardAngleSeekStep) || 0)) :
				'frame',
			KeyboardFrameRateFallback: options.KeyboardFrameRateFallback !== undefined ?
				Math.max(1, Number(options.KeyboardFrameRateFallback) || 30) : 30,
			Shortcuts: {
				PlayPause: shortcuts.PlayPause !== false,
				SeekArrows: shortcuts.SeekArrows !== false,
				SeekAngle: shortcuts.SeekAngle !== false,
				Volume: shortcuts.Volume !== false,
				Mute: shortcuts.Mute !== false,
				Subtitles: shortcuts.Subtitles !== false,
				Fullscreen: shortcuts.Fullscreen !== false,
				PictureInPicture: shortcuts.PictureInPicture !== false
			},
			MediaSession: options.MediaSession === false ? { Enabled: false } : {
				Enabled: !options.MediaSession || options.MediaSession.Enabled !== false,
				Metadata: options.MediaSession && options.MediaSession.Metadata ? options.MediaSession.Metadata : {}
			},
			SettingsOrder: AyleNormalizeSettingsOrder(
				options.SettingsOrder instanceof Array ?
					options.SettingsOrder :
					[
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
					]
			),
			FontFamily: options.FontFamily || 'Arial, sans-serif',
			Debug: !!options.Debug,
			DebugMP4: !!options.DebugMP4,
			Localization: AyleCopyLocalization(
				explicitOptions.Localization === undefined ?
					AyleGetBrowserLocalization() :
					options.Localization
			),
			HintSafeArea: {
				Top: hintSafeArea.Top !== undefined ? Math.max(0, Number(hintSafeArea.Top) || 0) : 16,
				Right: hintSafeArea.Right !== undefined ? Math.max(0, Number(hintSafeArea.Right) || 0) : 16,
				Bottom: hintSafeArea.Bottom !== undefined ? Math.max(0, Number(hintSafeArea.Bottom) || 0) : 16,
				Left: hintSafeArea.Left !== undefined ? Math.max(0, Number(hintSafeArea.Left) || 0) : 16
			},
			Integration: {
				Channel: integration.Channel || null,
				Hints: integration.Hints instanceof Array ? integration.Hints : [],
				Settings: integration.Settings instanceof Array ? integration.Settings : [],
				Toolbar: integration.Toolbar instanceof Array ? integration.Toolbar : [],
				TimelineRanges: integration.TimelineRanges instanceof Array ? integration.TimelineRanges : [],
				MediaSession: integration.MediaSession || null,
				Data: integration.Data !== undefined ? integration.Data : null
			}
		};

		if (
			this.Options.AutoPlayMode !== 'audible' &&
			this.Options.AutoPlayMode !== 'muted'
		)
			this.Options.AutoPlayMode = 'audible';

		if (
			this.Options.MediaMode !== 'auto' &&
			this.Options.MediaMode !== 'video' &&
			this.Options.MediaMode !== 'audio'
		)
			this.Options.MediaMode = 'auto';

		if (
			this.Options.UI.Toolbar.Layout !== 'inline' &&
			this.Options.UI.Toolbar.Layout !== 'timeline-top' &&
			this.Options.UI.Toolbar.Layout !== 'auto'
		)
			this.Options.UI.Toolbar.Layout = 'inline';

		if (
			this.Options.AudioVisual.Type !== 'auto' &&
			this.Options.AudioVisual.Type !== 'none' &&
			this.Options.AudioVisual.Type !== 'cover'
		)
			this.Options.AudioVisual.Type = 'auto';

		if (
			this.Options.ArtworkSlideshow.Fit !== 'cover' &&
			this.Options.ArtworkSlideshow.Fit !== 'contain'
		)
			this.Options.ArtworkSlideshow.Fit = 'cover';


		this._baseDriverConfig = assembly && assembly.Driver ?
			AylePresetCloneValue(assembly.Driver) : { Type: 'html5' };
		this._baseMediaProviderConfig = mediaProviderConfig ?
			AylePresetCloneValue(mediaProviderConfig) : null;
		this._basePlayerOptions = AylePresetCloneValue(explicitOptions || {});
		this.Playlist = {
			AutoAdvance: true,
			AutoAdvanceDelay: 0,
			Loop: false,
			StartIndex: 0,
			Items: []
		};
		this.PlaylistIndex = -1;
		this.PlaylistItem = null;
		this._playlistTransition = null;
		this._playlistAutoAdvanceTimer = null;
		this._playlistAutoAdvanceContext = null;

		this.Driver = driver;
		this.Driver.SetEventTarget(this, 'driver:');
		this.MediaProvider = null;
		this.MediaProviderOptions = mediaProviderConfig ?
			AylePresetCloneValue(mediaProviderConfig) : null;
		this.Element = null;
		this.MediaElement = driver && driver.Element ? driver.Element : null;
		this.UI = null;
		this.Driver.SetDebug(this.Options.Debug);
		this.Driver.SetDebugMP4(this.Options.DebugMP4);
		this._autoPlayPending = false;
		this._pictureInPictureNativeSubtitles = false;
		this._desiredSubtitleTrackID = null;
		this._lastSubtitleTrackID = null;
		this._hintRenderers = {};
		this._hintActionHandlers = {};
		this._initialStartPending = this.Options.Start > 0;
		this.Driver.SetNativeSubtitles(this.Options.NativeSubtitles);
		this.Driver.SetVolume(this.Options.Volume);
		this.Driver.SetMuted(this.Options.Muted);

		this.State = {
			Ready: false,
			Loading: false,
			Playing: false,
			Buffering: false,
			Seeking: false,
			Ended: false,
			Error: null,
			Position: 0,
			Duration: 0,
			Buffered: [],
			Seekable: [],
			Volume: this.Options.Volume,
			Muted: this.Options.Muted,
			PlaybackRate: driver.GetPlaybackRate(),
			PictureInPicture: false,
			MediaMode: this.Options.MediaMode === 'auto' ? 'video' : this.Options.MediaMode,
			Source: null,
			Variants: [],
			Variant: null,
			AudioTracks: [],
			AudioTrack: null,
			SubtitleTracks: [],
			SubtitleTrack: null,
			Chapters: [],
			Chapter: null,
			ActiveHints: [],
			PlaylistIndex: -1,
			PlaylistItem: null,
			HasPrevious: false,
			HasNext: false
		};

		this._switch = null;
		this._restartPlayPending = false;
		this._bindDriver();

		if (playlistConfig) {
			var initialItems = Array.isArray(playlistConfig.Items) ?
				AylePresetCloneValue(playlistConfig.Items) :
				(Array.isArray(playlistConfig) ? AylePresetCloneValue(playlistConfig) : []);
			var initialStartIndex = Number(playlistConfig.StartIndex);
			if (!isFinite(initialStartIndex))
				initialStartIndex = 0;
			initialStartIndex = Math.max(0, Math.floor(initialStartIndex));
			if (initialItems.length && initialStartIndex >= initialItems.length)
				initialStartIndex = initialItems.length - 1;

			this.Playlist = {
				AutoAdvance: playlistConfig.AutoAdvance !== false,
				AutoAdvanceDelay: playlistConfig.AutoAdvanceDelay !== undefined ?
					Math.max(0, Number(playlistConfig.AutoAdvanceDelay) || 0) : 0,
				Loop: playlistConfig.Loop === true,
				StartIndex: initialStartIndex,
				Items: initialItems
			};
			this.PlaylistIndex = initialItems.length ? initialStartIndex : -1;
			this.PlaylistItem = this.PlaylistIndex >= 0 ?
				initialItems[this.PlaylistIndex] : null;
			this._updatePlaylistState();
		}
		else if (mediaProviderConfig)
			this.SetMediaProvider(mediaProviderConfig);
	}

	Ayle.prototype = Object.create(AyleEventEmitter.prototype);
	Ayle.prototype.constructor = Ayle;

	Ayle.RegisterPreset = function (name, preset) {
		name = String(name || '').toLowerCase();

		if (!name)
			throw new Error('Ayle preset name is required');

		if (AyleBuiltInPresets[name])
			throw new Error('Built-in Ayle preset cannot be overwritten: ' + name);

		AylePresetRegistry[name] = AyleNormalizePreset(preset);
		return Ayle;
	};

	Ayle.GetPreset = function (name) {
		var preset = AyleGetPresetInternal(name);
		return preset ? AylePresetCloneValue(preset) : null;
	};

	Ayle.HasPreset = function (name) {
		return !!AyleGetPresetInternal(name);
	};

	Ayle.RemovePreset = function (name) {
		name = String(name || '').toLowerCase();

		if (!name || AyleBuiltInPresets[name] || !AyleGetPresetInternal(name))
			return false;

		delete AylePresetRegistry[name];
		return true;
	};



	Ayle.prototype._normalizePlaylist = function (playlist) {
		playlist = playlist || {};

		if (Array.isArray(playlist))
			playlist = { Items: playlist };

		var items = Array.isArray(playlist.Items) ?
			AylePresetCloneValue(playlist.Items) : [];
		var startIndex = Number(playlist.StartIndex);

		if (!isFinite(startIndex))
			startIndex = 0;

		startIndex = Math.floor(startIndex);

		if (startIndex < 0)
			startIndex = 0;

		if (items.length && startIndex >= items.length)
			startIndex = items.length - 1;

		return {
			AutoAdvance: playlist.AutoAdvance !== false,
			AutoAdvanceDelay: playlist.AutoAdvanceDelay !== undefined ?
				Math.max(0, Number(playlist.AutoAdvanceDelay) || 0) : 0,
			Loop: playlist.Loop === true,
			StartIndex: startIndex,
			Items: items
		};
	};

	Ayle.prototype._updatePlaylistState = function () {
		var count = this.Playlist && this.Playlist.Items ?
			this.Playlist.Items.length : 0;

		this.State.PlaylistIndex = this.PlaylistIndex;
		this.State.PlaylistItem = this.PlaylistItem;
		this.State.HasPrevious = count > 0 && (
			this.Playlist.Loop || this.PlaylistIndex > 0
		);
		this.State.HasNext = count > 0 && (
			this.Playlist.Loop || this.PlaylistIndex < count - 1
		);

		return this;
	};

	Ayle.prototype.SetPlaylist = function (playlist, initialize) {
		this._cancelPlaylistAutoAdvance('playlist-change');
		this.Playlist = this._normalizePlaylist(playlist);
		this.PlaylistIndex = this.Playlist.Items.length ?
			this.Playlist.StartIndex : -1;
		this.PlaylistItem = this.PlaylistIndex >= 0 ?
			this.Playlist.Items[this.PlaylistIndex] : null;

		if (this.State)
			this._updatePlaylistState();

		if (!initialize)
			this.Emit('playlistChange', this.Playlist);

		return this;
	};

	Ayle.prototype.HasPrevious = function () {
		return !!(
			this.Playlist &&
			this.Playlist.Items.length > 0 &&
			(this.Playlist.Loop || this.PlaylistIndex > 0)
		);
	};

	Ayle.prototype.HasNext = function () {
		return !!(
			this.Playlist &&
			this.Playlist.Items.length > 0 &&
			(
				this.Playlist.Loop ||
				this.PlaylistIndex < this.Playlist.Items.length - 1
			)
		);
	};

	Ayle.prototype._playlistDriverConfig = function (item) {
		var base = AylePresetCloneValue(this._baseDriverConfig || {});
		var override = item && item.Driver ? item.Driver : null;

		if (!override)
			return base;

		return AylePresetMerge(base, override);
	};

	Ayle.prototype._playlistMediaProviderConfig = function (item) {
		var base = this._baseMediaProviderConfig ?
			AylePresetCloneValue(this._baseMediaProviderConfig) : {};
		var override = item && item.MediaProvider ?
			AylePresetCloneValue(item.MediaProvider) : {};

		if (
			base.Type &&
			override.Type &&
			String(base.Type).toLowerCase() !== String(override.Type).toLowerCase()
		)
			return override;

		return AylePresetMerge(base, override);
	};

	Ayle.prototype._playlistPlayerOptions = function (item) {
		var base = this._basePlayerOptions || {};
		var override = item && item.Player ? item.Player : {};
		var result = AylePresetMerge(base, override);
		var baseIntegration = base.Integration || {};
		var itemIntegration = override.Integration || {};

		if (
			baseIntegration.Hints instanceof Array ||
			itemIntegration.Hints instanceof Array
		) {
			result.Integration = result.Integration || {};
			result.Integration.Hints = AyleMergeIntegrationOverlays(
				baseIntegration.Hints,
				itemIntegration.Hints
			);
		}

		if (
			baseIntegration.TimelineRanges instanceof Array ||
			itemIntegration.TimelineRanges instanceof Array
		) {
			result.Integration = result.Integration || {};
			result.Integration.TimelineRanges = AyleMergeIntegrationOverlays(
				baseIntegration.TimelineRanges,
				itemIntegration.TimelineRanges
			);
		}

		return result;
	};

	Ayle.prototype._sameDriverConfig = function (a, b) {
		try {
			return JSON.stringify(a || {}) === JSON.stringify(b || {});
		}
		catch (error) {
			return false;
		}
	};

	Ayle.prototype._applyPlaylistPlayerOptions = function (options) {
		options = options || {};
		var base = this._basePlayerOptions || {};
		var mediaMode = options.MediaMode !== undefined ?
			options.MediaMode :
			(base.MediaMode !== undefined ? base.MediaMode : 'auto');

		this.Options.MediaMode = mediaMode;
		this.Options.AutoPlay = options.AutoPlay !== undefined ?
			!!options.AutoPlay : !!base.AutoPlay;
		this.Options.AutoPlayMode = options.AutoPlayMode !== undefined ?
			options.AutoPlayMode : (base.AutoPlayMode || 'audible');
		this.Options.ForceShowQualityList = !!options.ForceShowQualityList;
		this.Options.ForceShowChaptersList = !!options.ForceShowChaptersList;
		this.Options.ForceShowPreviousButton = !!options.ForceShowPreviousButton;
		this.Options.ForceShowNextButton = !!options.ForceShowNextButton;

		var explicitUI = options.UI || {};
		this._uiExplicit.Header = explicitUI.Header instanceof Array;
		this._uiExplicit.Track = explicitUI.Track instanceof Array;
		this._uiExplicit.Channel = explicitUI.Channel instanceof Array;
		this._uiExplicit.Overlay = explicitUI.Overlay instanceof Array;
		this._uiExplicit.ToolbarLayout = !!(
			explicitUI.Toolbar &&
			explicitUI.Toolbar.Layout !== undefined
		);
		this._uiExplicit.ToolbarItems = !!(
			explicitUI.Toolbar &&
			explicitUI.Toolbar.Items instanceof Array
		);

		var resolvedMode = mediaMode === 'audio' ? 'audio' : 'video';
		var preset = this._getEffectivePreset(resolvedMode);
		var presetUI = preset.UI || {};
		var presetToolbar = presetUI.Toolbar || {};
		var itemUI =
			options.UI && options.UI !== base.UI ?
				options.UI : explicitUI;
		explicitUI = itemUI || {};

		this.Options.UI.Header = explicitUI.Header instanceof Array ?
			explicitUI.Header.slice(0) :
			(presetUI.Header instanceof Array ? presetUI.Header.slice(0) : []);
		this.Options.UI.Track = explicitUI.Track instanceof Array ?
			explicitUI.Track.slice(0) :
			(presetUI.Track instanceof Array ? presetUI.Track.slice(0) : []);
		this.Options.UI.Channel = explicitUI.Channel instanceof Array ?
			explicitUI.Channel.slice(0) :
			(presetUI.Channel instanceof Array ? presetUI.Channel.slice(0) : []);
		this.Options.UI.Overlay = explicitUI.Overlay instanceof Array ?
			explicitUI.Overlay.slice(0) :
			(presetUI.Overlay instanceof Array ? presetUI.Overlay.slice(0) : []);
		this.Options.UI.Toolbar.Layout =
			explicitUI.Toolbar && explicitUI.Toolbar.Layout !== undefined ?
				String(explicitUI.Toolbar.Layout).toLowerCase() :
				(presetToolbar.Layout || 'inline');
		this.Options.UI.Toolbar.Items =
			explicitUI.Toolbar && explicitUI.Toolbar.Items instanceof Array ?
				explicitUI.Toolbar.Items.slice(0) :
				(
					presetToolbar.Items instanceof Array ?
						presetToolbar.Items.slice(0) : []
				);

		var visual = options.AudioVisual || {};
		var baseVisual = base.AudioVisual || {};
		this.Options.AudioVisual.Type = visual.Type !== undefined ?
			visual.Type : (baseVisual.Type || 'auto');
		this.Options.AudioVisual.Image = visual.Image !== undefined ?
			(visual.Image || '') : (baseVisual.Image || '');
		this.Options.AudioVisual.Subtitles = visual.Subtitles !== undefined ?
			!!visual.Subtitles : baseVisual.Subtitles !== false;
		this.Options.AudioVisual.MinHeight = visual.MinHeight !== undefined ?
			Math.max(0, Number(visual.MinHeight) || 0) :
			(
				baseVisual.MinHeight !== undefined ?
					Math.max(0, Number(baseVisual.MinHeight) || 0) : 240
			);

		/*
		 * Integration overlays are platform state, not AyleSource metadata.
		 * _playlistPlayerOptions() has already combined global Hints and
		 * TimelineRanges with the current item's overlays by ID. Applying the
		 * effective Integration here makes both collections follow the same
		 * item-local timeline and restores the global set on the next item.
		 */
		this.SetIntegration(options.Integration || {}, false);

		var previousMode = this.State.MediaMode;
		var resolved = this.ResolveMediaMode(this.State.Source);

		if (previousMode !== resolved) {
			this.State.MediaMode = resolved;
			this.Emit('mediaModeChange', resolved);
		}

		this.Emit('uiChange', this.Options.UI);
		this.Emit('audioVisualChange', this.Options.AudioVisual);
		return this;
	};

	Ayle.prototype._ensureMediaElementForMode = function (mode) {
		if (!this.UI || !this.MediaElement)
			return this;

		var desired = mode === 'audio' ? 'audio' : 'video';
		var current = String(this.MediaElement.tagName || '').toLowerCase();

		if (current === desired)
			return this;

		var oldElement = this.MediaElement;
		var media = document.createElement(desired);
		media.className = 'ayle-media ' + (
			desired === 'audio' ? 'ayle-audio' : 'ayle-video'
		);
		media.preload = 'metadata';

		if (oldElement.parentNode)
			oldElement.parentNode.replaceChild(media, oldElement);

		this.UI.MediaElement = media;
		this.MediaElement = media;

		if (this.Driver && typeof this.Driver.SetUI === 'function') {
			if (this.Driver.UI)
				this.Driver.SetUI(null);

			this.Driver.SetUI(this.UI);
		}

		return this;
	};

	Ayle.prototype._cancelPlaylistAutoAdvance = function (reason) {
		if (this._playlistAutoAdvanceTimer) {
			clearTimeout(this._playlistAutoAdvanceTimer);
			this._playlistAutoAdvanceTimer = null;
		}

		if (!this._playlistAutoAdvanceContext)
			return this;

		var context = this._playlistAutoAdvanceContext;
		this._playlistAutoAdvanceContext = null;

		this.Emit('playlistAutoAdvanceCancel', {
			Index: context.Index,
			Item: context.Item,
			NextIndex: context.NextIndex,
			NextItem: context.NextItem,
			Delay: context.Delay,
			Reason: reason || 'cancel'
		});

		return this;
	};

	Ayle.prototype._schedulePlaylistAutoAdvance = function () {
		if (
			!this.Playlist ||
			!this.Playlist.AutoAdvance ||
			!this.HasNext()
		)
			return false;

		this._cancelPlaylistAutoAdvance('reschedule');

		var count = this.Playlist.Items.length;
		var nextIndex = this.PlaylistIndex + 1;

		if (nextIndex >= count && this.Playlist.Loop)
			nextIndex = 0;

		if (nextIndex < 0 || nextIndex >= count)
			return false;

		var delay = Math.max(
			0,
			Number(this.Playlist.AutoAdvanceDelay) || 0
		);
		var context = {
			Index: this.PlaylistIndex,
			Item: this.PlaylistItem,
			NextIndex: nextIndex,
			NextItem: this.Playlist.Items[nextIndex],
			Delay: delay,
			StartedAt: Date.now()
		};

		if (!delay) {
			this.Emit('playlistAutoAdvanceStart', context);
			this.Emit('playlistAutoAdvanceComplete', context);
			return this._activatePlaylistItem(
				nextIndex,
				'ended',
				true
			);
		}

		this._playlistAutoAdvanceContext = context;
		this.Emit('playlistAutoAdvanceStart', context);

		var self = this;
		this._playlistAutoAdvanceTimer = setTimeout(function () {
			if (self._playlistAutoAdvanceContext !== context)
				return;

			self._playlistAutoAdvanceTimer = null;
			self._playlistAutoAdvanceContext = null;
			self.Emit('playlistAutoAdvanceComplete', context);
			self._activatePlaylistItem(
				nextIndex,
				'ended',
				true
			);
		}, delay);

		return true;
	};

	Ayle.prototype._activatePlaylistItem = function (index, reason, playAfterLoad, callback) {
		if (reason !== 'ended')
			this._cancelPlaylistAutoAdvance(reason || 'playlist');

		var items = this.Playlist.Items;
		var count = items.length;

		if (!count)
			return false;

		if (index < 0 || index >= count) {
			if (!this.Playlist.Loop)
				return false;

			index = index < 0 ? count - 1 : 0;
		}

		/*
		 * Playlist navigation begins loading at the click/API boundary, before
		 * changing Driver/MediaProvider or requesting metadata. The UI therefore
		 * acknowledges Next/Previous immediately.
		 */
		this._beginMediaLoad();

		var previousIndex = this.PlaylistIndex;
		var previousItem = this.PlaylistItem;
		var item = items[index];
		var context = {
			PreviousIndex: previousIndex,
			Index: index,
			PreviousItem: previousItem,
			Item: item,
			Reason: reason || 'index'
		};

		this.Emit('playlistItemChanging', context);

		var driverConfig = this._playlistDriverConfig(item);
		var currentDriverConfig = this._activePlaylistDriverConfig ||
			this._baseDriverConfig || {};
		var replaceDriver = !this._sameDriverConfig(
			currentDriverConfig,
			driverConfig
		);

		if (replaceDriver && this.Driver && typeof this.Driver.SetUI === 'function')
			this.Driver.SetUI(null);

		this._applyPlaylistPlayerOptions(this._playlistPlayerOptions(item));
		this._ensureMediaElementForMode(
			this.Options.MediaMode === 'audio' ? 'audio' : 'video'
		);

		if (replaceDriver) {
			var driverType = driverConfig.Type || 'html5';
			var driverOptions = driverConfig.Options || {};
			this.SetDriver(Ayle.CreateDriver(driverType, driverOptions));
		}

		this._activePlaylistDriverConfig = AylePresetCloneValue(driverConfig);
		this.SetMediaProvider(this._playlistMediaProviderConfig(item));

		this.PlaylistIndex = index;
		this.PlaylistItem = item;
		this._updatePlaylistState();
		this._playlistTransition = {
			Context: context,
			Play: !!playAfterLoad
		};

		this.Emit('playlistIndexChange', index);
		this.Emit('playlistItemChange', context);
		this.Emit('stateChange', this.State);

		var self = this;

		try {
			this.LoadMedia(function (error, source, metadata) {
				if (typeof callback === 'function')
					callback(error, source, metadata);

				if (error) {
					self._playlistTransition = null;
					self.Emit('playlistItemError', {
						Index: index,
						Item: item,
						Error: error
					});
					return;
				}

				var transition = self._playlistTransition;
				self._playlistTransition = null;

				if (transition && transition.Play)
					self.Play();
			});
		}
		catch (error) {
			this._playlistTransition = null;
			this.Emit('playlistItemError', {
				Index: index,
				Item: item,
				Error: error
			});
			throw error;
		}

		return true;
	};

	Ayle.prototype.SetPlaylistIndex = function (index, reason) {
		index = Number(index);

		if (!isFinite(index))
			return false;

		index = Math.floor(index);

		if (index === this.PlaylistIndex && this.State.Source)
			return true;

		return this._activatePlaylistItem(
			index,
			reason || 'index',
			!!this.State.Playing
		);
	};

	Ayle.prototype.SetPlaylistItemByID = function (id) {
		var items = this.Playlist.Items;
		var i = 0;

		while (i < items.length) {
			if (
				items[i] &&
				items[i].ID !== undefined &&
				String(items[i].ID) === String(id)
			)
				return this.SetPlaylistIndex(i, 'id');

			i++;
		}

		return false;
	};

	Ayle.prototype.Next = function () {
		if (!this.HasNext())
			return false;

		return this._activatePlaylistItem(
			this.PlaylistIndex + 1,
			'next',
			!!this.State.Playing
		);
	};

	Ayle.prototype.Previous = function () {
		if (!this.HasPrevious())
			return false;

		return this._activatePlaylistItem(
			this.PlaylistIndex - 1,
			'previous',
			!!this.State.Playing
		);
	};

	Ayle.prototype.HasPlayableSource = function () {
		var source = this.State.Source;

		if (!source)
			return false;

		if (source.URL)
			return true;

		if (source.Variants && source.Variants.length)
			return true;

		if (source.AudioTracks && source.AudioTracks.length)
			return true;

		return false;
	};

	Ayle.prototype.IsEmpty = function () {
		return !this.HasPlayableSource();
	};

	Ayle.prototype._findTrackByID = function (tracks, id) {
		var i = 0;
		var count = tracks.length;

		while (i < count) {
			if (tracks[i].ID === id)
				return tracks[i];
			i++;
		}

		return null;
	};

	Ayle.prototype._selectDefaultVariant = function () {
		var variants = this.State.Variants;
		if (!variants.length)
			return null;

		var i = 0;
		var count = variants.length;

		while (i < count) {
			if (variants[i].Default)
				return variants[i];
			i++;
		}

		return variants[0];
	};

	Ayle.prototype._selectDefaultTrack = function (tracks) {
		var i = 0;
		var count = tracks.length;

		while (i < count) {
			if (tracks[i].Default)
				return tracks[i];
			i++;
		}

		return null;
	};

	Ayle.prototype._chapterAt = function (position) {
		var chapters = this.State.Chapters || [];
		var i = 0;
		var count = chapters.length;

		while (i < count) {
			var chapter = chapters[i];
			if (position >= chapter.Start && position < chapter.End)
				return chapter;
			i++;
		}

		return null;
	};

	Ayle.prototype._syncChapter = function (position) {
		var chapter = this._chapterAt(position);

		if (this.State.Chapter === chapter)
			return;

		this.State.Chapter = chapter;
		this.Emit('chapterChange', chapter);
	};


	Ayle.prototype._mergeSubtitleTracks = function (driverTracks) {
		driverTracks = driverTracks || [];

		var sourceTracks =
			this.State.Source && this.State.Source.SubtitleTracks ?
				this.State.Source.SubtitleTracks : [];

		/*
		 * Source metadata is canonical. Native textTracks appear asynchronously
		 * and may temporarily be empty; they enrich logical tracks with Native
		 * objects, but must never erase the source list from Settings.
		 */
		if (!sourceTracks.length)
			return driverTracks.slice(0);

		var result = [];
		var usedDriver = {};
		var i = 0;

		while (i < sourceTracks.length) {
			var sourceTrack = sourceTracks[i];
			var nativeTrack = null;
			var j = 0;

			while (j < driverTracks.length) {
				var candidate = driverTracks[j];

				if (
					!usedDriver[j] &&
					(
						String(candidate.ID) === String(sourceTrack.ID) ||
						(
							candidate.Label &&
							sourceTrack.Label &&
							candidate.Label === sourceTrack.Label &&
							candidate.Language === sourceTrack.Language
						)
					)
				) {
					nativeTrack = candidate;
					usedDriver[j] = true;
					break;
				}

				j++;
			}

			if (nativeTrack) {
				sourceTrack.Native = nativeTrack.Native || sourceTrack.Native || null;

				if (nativeTrack.Cues && nativeTrack.Cues.length)
					sourceTrack.Cues = nativeTrack.Cues;
			}

			result.push(sourceTrack);
			i++;
		}

		/* Keep unexpected native-only subtitle tracks too. */
		i = 0;
		while (i < driverTracks.length) {
			if (!usedDriver[i])
				result.push(driverTracks[i]);

			i++;
		}

		return result;
	};

	Ayle.prototype._bindDriver = function () {
		var self = this;

		this.Driver.On('loadStart', function () {
			self.State.Loading = true;
			self.State.Ready = false;
			self.Emit('loadStart');
			self.Emit('stateChange', self.State);
		});

		this.Driver.On('metadata', function (data) {
			if (isFinite(data.Duration))
				self.State.Duration = data.Duration;

			self.Emit('metadata', data);

			if (self._switch)
				self._switchMetadata();
		});

		this.Driver.On('ready', function () {
			self.State.Ready = true;
			self.State.Loading = false;
			self.State.Buffering = false;

			if (!self._switch && self._initialStartPending) {
				self._initialStartPending = false;
				self.Seek(self.Options.Start);
			}

			if (self._switch) {
				self._switch.Ready = true;
				self._finishSwitchIfReady();
			}

			self.Emit('ready');
			self.Emit('stateChange', self.State);

			if (!self._switch && self._autoPlayPending) {
				self._autoPlayPending = false;
				self._startAutoPlay();
			}
		});

		this.Driver.On('play', function () {
			self.State.Playing = true;
			self.State.Ended = false;

			if (self._switch)
				return;

			self.Emit('play');
			self.Emit('stateChange', self.State);
		});

		this.Driver.On('playing', function () {
			self.State.Playing = true;
			self.State.Buffering = false;

			if (self._switch)
				return;

			self.Emit('playing');
			self.Emit('stateChange', self.State);
		});

		this.Driver.On('pause', function () {
			if (self._switch)
				return;

			self.State.Playing = false;
			self.Emit('pause');
			self.Emit('stateChange', self.State);
		});

		this.Driver.On('ended', function () {
			if (self._switch)
				return;

			self.State.Playing = false;
			self.State.Loading = false;
			self.State.Buffering = false;
			self.State.Seeking = false;
			self.State.Ended = true;

			var mediaDuration = self.Driver && self.Driver.Element ?
				self.Driver.Element.duration : NaN;

			if (isFinite(mediaDuration) && mediaDuration > 0)
				self.State.Duration = mediaDuration;

			self.State.Position = self.State.Duration;
			self.Emit('timeUpdate', {
				Position: self.State.Position,
				Duration: self.State.Duration
			});
			self.Emit('ended');
			self.Emit('stateChange', self.State);

			if (
				self.Playlist &&
				self.Playlist.AutoAdvance &&
				self.HasNext()
			)
				self._schedulePlaylistAutoAdvance();
		});

		this.Driver.On('buffering', function (value) {
			self.State.Buffering = value;
			self.Emit('buffering', value);
			self.Emit('stateChange', self.State);
		});

		this.Driver.On('timeUpdate', function (data) {
			self.State.Position = data.Position;

			if (isFinite(data.Duration))
				self.State.Duration = data.Duration;

			self._syncChapter(self.State.Position);
			self._syncHints(self.State.Position);
			self.Emit('timeUpdate', data);
		});

		this.Driver.On('durationChange', function (duration) {
			if (isFinite(duration))
				self.State.Duration = duration;

			self.Emit('durationChange', duration);
		});

		this.Driver.On('progress', function (data) {
			self.State.Buffered = data.Buffered || [];
			self.State.Seekable = data.Seekable || [];

			if (data.Duration !== undefined && data.Duration !== null && isFinite(data.Duration))
				self.State.Duration = data.Duration;

			self.Emit('progress', data);
		});

		this.Driver.On('volumeChange', function (data) {
			self.State.Volume = data.Volume;
			self.State.Muted = data.Muted;
			self.Emit('volumeChange', data);
		});

		this.Driver.On('rateChange', function (rate) {
			self.State.PlaybackRate = rate;
			self.Emit('rateChange', rate);
		});

		this.Driver.On('seeking', function (value) {
			self.State.Seeking = value;
			self.Emit('seeking', value);
			self.Emit('stateChange', self.State);
		});

		this.Driver.On('seeked', function () {
			self.State.Seeking = false;

			if (self._switch) {
				self._switch.Seeked = true;
				self._finishSwitchIfReady();
				return;
			}

			if (self._restartPlayPending) {
				self._restartPlayPending = false;
				self.State.Ended = false;
				self.State.Position = 0;
				self.Emit('stateChange', self.State);

				var result = self.Driver.Play();

				if (result && typeof result.catch === 'function') {
					result.catch(function (error) {
						self.Emit('error', error);
					});
				}
			}
		});

		this.Driver.On('audioTracksChange', function (tracks) {
			self.State.AudioTracks = tracks;

			var selected = null;
			var i = 0;
			var count = tracks.length;

			while (i < count) {
				if (tracks[i].Native && tracks[i].Native.enabled) {
					selected = tracks[i];
					break;
				}
				i++;
			}

			self.State.AudioTrack = selected;

			if (self._switch)
				self._restoreSwitchTracks();

			self.Emit('audioTracksChange', tracks);
			self.Emit('stateChange', self.State);
		});

		this.Driver.On('subtitleData', function (data) {
			data = data || {};
			var id = data.ID !== undefined && data.ID !== null ? String(data.ID) : '';
			var cues = data.Cues || [];
			var i = 0;

			if (self.State.Source && self.State.Source.SubtitleTracks) {
				i = 0;
				while (i < self.State.Source.SubtitleTracks.length) {
					if (String(self.State.Source.SubtitleTracks[i].ID) === id)
						self.State.Source.SubtitleTracks[i].Cues = cues;
					i++;
				}
			}

			i = 0;
			while (i < self.State.SubtitleTracks.length) {
				if (String(self.State.SubtitleTracks[i].ID) === id)
					self.State.SubtitleTracks[i].Cues = cues;
				i++;
			}

			if (
				self.State.SubtitleTrack &&
				String(self.State.SubtitleTrack.ID) === id
			)
				self.State.SubtitleTrack.Cues = cues;

			self.Emit('subtitleDataChange', {
				ID: id,
				Cues: cues,
				Track: self.State.SubtitleTrack
			});

			self.Emit('stateChange', self.State);
		});

		this.Driver.On('subtitleTracksChange', function (tracks) {
			var previous = self.State.SubtitleTrack;
			var selected = null;
			var desiredID = self._desiredSubtitleTrackID;
			tracks = self._mergeSubtitleTracks(tracks);
			var i = 0;
			var count = tracks.length;

			self.State.SubtitleTracks = tracks;

			/* First trust the browser if a native subtitle track is already active. */
			while (i < count) {
				if (tracks[i].Native && tracks[i].Native.mode !== 'disabled') {
					selected = tracks[i];
					break;
				}
				i++;
			}

			/*
			 * Subtitle <track> elements are created asynchronously. During that
			 * process textTracks may temporarily be empty/disabled. Do not lose
			 * the logical Ayle selection merely because the native TextTrack
			 * has not finished appearing yet.
			 */
			if (!selected && desiredID !== null) {
				i = 0;
				while (i < count) {
					if (String(tracks[i].ID) === String(desiredID)) {
						selected = tracks[i];

						if (tracks[i].Native)
							self.Driver.SetSubtitleTrack(tracks[i]);

						break;
					}
					i++;
				}

				/* Keep the source-level placeholder until its native track arrives. */
				if (
					!selected &&
					previous &&
					String(previous.ID) === String(desiredID)
				)
					selected = previous;
			}

			if (
				!selected &&
				desiredID === null &&
				self.Options.AutoSelectFirstSubtitleTrack &&
				tracks.length
			) {
				selected = tracks[0];
				self._desiredSubtitleTrackID = String(selected.ID);

				if (selected.Native)
					self.Driver.SetSubtitleTrack(selected);
			}

			self.State.SubtitleTrack = selected;

			if (selected)
				self._lastSubtitleTrackID = String(selected.ID);

			if (previous !== selected)
				self.Emit('subtitleTrackChange', selected);

			if (self._switch)
				self._restoreSwitchTracks();

			self.Emit('subtitleTracksChange', tracks);
			self.Emit('stateChange', self.State);
		});

		this.Driver.On('variantsChange', function (variants) {
			self.State.Variants = variants;
			self.Emit('variantsChange', variants);
			self.Emit('stateChange', self.State);
		});

		this.Driver.On('pictureInPictureChange', function (value) {
			self.State.PictureInPicture = value;
			self._pictureInPictureNativeSubtitles = !!(value && self.Options.AutoNativeSubtitlesInPictureInPicture);
			self._applyNativeSubtitlesMode();

			self.Emit('pictureInPictureChange', value);
			self.Emit('stateChange', self.State);
		});

		this.Driver.On('error', function (error) {
			var context = self._switch;

			if (context)
				self.State.Variant = context.PreviousVariant;

			self._switch = null;
			self.State.Loading = false;
			self.State.Buffering = false;
			self.State.Seeking = false;
			self.State.Error = error;

			if (context) {
				self.Emit('variantSwitchError', {
					Variant: context.Variant,
					Error: error
				});
			}

			self.Emit('error', error);
			self.Emit('stateChange', self.State);
		});
	};


	Ayle.prototype.SetRequestHeader = function (name, value) {
		if (this.Driver && typeof this.Driver.SetRequestHeader === 'function')
			this.Driver.SetRequestHeader(name, value);

		return this;
	};

	Ayle.prototype.SetRequestHeaders = function (headers) {
		if (this.Driver && typeof this.Driver.SetRequestHeaders === 'function')
			this.Driver.SetRequestHeaders(headers);

		return this;
	};

	Ayle.prototype.GetCodecCandidates = function () {
		if (!this.Driver || typeof this.Driver.GetCodecCandidates !== 'function')
			return [];

		return this.Driver.GetCodecCandidates() || [];
	};

	Ayle.prototype.SupportsCodec = function (type, codec) {
		if (!this.Driver || typeof this.Driver.SupportsCodec !== 'function')
			return false;

		return !!this.Driver.SupportsCodec(type, codec);
	};

	Ayle.prototype.GetSupportedCodecs = function (candidates) {
		if (!this.Driver || typeof this.Driver.GetSupportedCodecs !== 'function')
			return [];

		return this.Driver.GetSupportedCodecs(candidates || this.GetCodecCandidates()) || [];
	};

	Ayle.ResolveElement = function (target, label) {
		return AyleResolveElement(target, label);
	};

	Ayle.IsElement = function (value) {
		return AyleIsElement(value);
	};

	Ayle.prototype.AttachUI = function (target) {
		var element = AyleResolveElement(target, 'Ayle UI target');

		if (this.UI) {
			if (this.Element === element)
				return this;

			throw new Error(
				'Ayle UI is already attached. Call DetachUI() before ' +
				'attaching another target.'
			);
		}

		var ui = null;
		var mediaElement = element.querySelector(
			'.ayle-media, .ayle-video, .ayle-audio'
		);

		if (!mediaElement)
			throw new Error('Ayle UI target does not contain a media element');

		/*
		 * AyleUI evaluates capabilities such as Picture-in-Picture during its
		 * construction. Bind the Driver to the resolved media element first so
		 * those capability checks see the real runtime element, not null.
		 *
		 * This bridge is internal and short-lived. Once AyleUI is constructed,
		 * SetUI(ui) replaces it with the real owned UI instance without
		 * rebinding DOM listeners because the media element is unchanged.
		 */
		var binding = {
			Element: element,
			MediaElement: mediaElement
		};

		try {
			if (this.Driver && typeof this.Driver.SetUI === 'function')
				this.Driver.SetUI(binding);

			ui = new AyleUI(element, this);

			if (this.Driver && typeof this.Driver.SetUI === 'function')
				this.Driver.SetUI(ui);

			this.Element = element;
			this.UI = ui;
			this.MediaElement = ui.MediaElement || null;

			/*
			 * Reattaching an already loaded player rebuilds the concrete playback
			 * pipeline on the new media element from the authoritative AyleSource.
			 */
			if (this.State && this.State.Source) {
				this.Driver.Load(this.State.Source);

				if (this.State.Variant)
					this.Driver.SetVariant(this.State.Variant);

				if (this.State.AudioTrack)
					this.Driver.SetAudioTrack(this.State.AudioTrack);

				this.Driver.SetSubtitleTrack(this.State.SubtitleTrack);
			}
		}
		catch (error) {
			if (this.Driver && typeof this.Driver.SetUI === 'function')
				this.Driver.SetUI(null);

			if (ui && typeof ui.Destroy === 'function')
				ui.Destroy();

			this.Element = null;
			this.UI = null;
			this.MediaElement = null;
			throw error;
		}

		this.Emit('uiAttach', {
			Element: element,
			UI: ui
		});

		return this;
	};

	Ayle.prototype.DetachUI = function () {
		if (!this.UI)
			return this;

		var ui = this.UI;
		var element = this.Element;

		if (this.Driver && typeof this.Driver.SetUI === 'function')
			this.Driver.SetUI(null);

		if (ui && typeof ui.Destroy === 'function')
			ui.Destroy();

		this.UI = null;
		this.Element = null;
		this.MediaElement = null;

		this.Emit('uiDetach', {
			Element: element,
			UI: ui
		});

		return this;
	};

	Ayle.prototype.SetDriver = function (driver) {
		if (!driver || typeof driver.Load !== 'function')
			throw new Error('Invalid Ayle driver');

		if (this.Driver === driver)
			return this;

		/*
		 * Driver replacement must preserve runtime playback controls.
		 * A freshly-created HTML5/MSE driver starts with volume=1, muted=false
		 * and playbackRate=1.  Apply the current player state before attaching
		 * the existing UI so SetUI() never writes those defaults into the media
		 * element and emits a transient volumechange/ratechange.
		 */
		var volume = this.State ?
			this.State.Volume : this.Options.Volume;
		var muted = this.State ?
			this.State.Muted : this.Options.Muted;
		var playbackRate = this.State ?
			this.State.PlaybackRate : 1;

		if (this.Driver && typeof this.Driver.SetEventTarget === 'function')
			this.Driver.SetEventTarget(null, '');

		if (this.Driver && typeof this.Driver.Destroy === 'function')
			this.Driver.Destroy();

		this.Driver = driver;
		this.Driver.SetEventTarget(this, 'driver:');

		if (typeof this.Driver.SetVolume === 'function')
			this.Driver.SetVolume(volume);

		if (typeof this.Driver.SetMuted === 'function')
			this.Driver.SetMuted(muted);

		if (typeof this.Driver.SetPlaybackRate === 'function')
			this.Driver.SetPlaybackRate(playbackRate);

		if (typeof this.Driver.SetDebug === 'function')
			this.Driver.SetDebug(this.Options.Debug);

		if (typeof this.Driver.SetDebugMP4 === 'function')
			this.Driver.SetDebugMP4(this.Options.DebugMP4);

		if (typeof this.Driver.SetNativeSubtitles === 'function')
			this.Driver.SetNativeSubtitles(this.Options.NativeSubtitles);

		if (this.UI && typeof this.Driver.SetUI === 'function')
			this.Driver.SetUI(this.UI);

		this._bindDriver();
		return this;
	};

	Ayle.prototype.SetMediaProvider = function (provider) {
		if (this.MediaProvider && typeof this.MediaProvider.Destroy === 'function')
			this.MediaProvider.Destroy();

		if (!provider) {
			this.MediaProvider = null;
			this.MediaProviderOptions = null;
			return this;
		}

		if (typeof provider.Load === 'function') {
			this.MediaProvider = provider;
			this.MediaProviderOptions = provider.Options || {};
		}
		else {
			var config = AylePresetCloneValue(provider || {});
			var type = String(config.Type || 'http').toLowerCase();
			delete config.Type;
			this.MediaProvider = Ayle.CreateMediaProvider(type, this, config);
			this.MediaProviderOptions = AylePresetCloneValue(provider || {});
		}

		this.MediaProvider.Player = this;

		if (typeof this.MediaProvider.SetEventTarget === 'function')
			this.MediaProvider.SetEventTarget(this, 'provider:');

		var self = this;
		this.MediaProvider.On('error', function (error) {
			self.State.Error = error;
			self.State.Loading = false;
			self.Emit('error', error);

			if (self.PlaylistItem)
				self.Emit('playlistItemError', {
					Index: self.PlaylistIndex,
					Item: self.PlaylistItem,
					Error: error
				});

			self.Emit('stateChange', self.State);
		});

		return this;
	};

	Ayle.prototype._beginMediaLoad = function () {
		/*
		 * Loading starts at the orchestration boundary, before MediaProvider has
		 * resolved an AyleSource. This makes UI feedback immediate for initial
		 * player initialization and playlist navigation instead of waiting for
		 * metadata/provider work or Driver.Load().
		 */
		this.State.Ready = false;
		this.State.Loading = true;
		this.State.Buffering = false;
		this.State.Seeking = false;
		this.State.Error = null;
		this.Emit('stateChange', this.State);
		return this;
	};

	Ayle.prototype.LoadMedia = function (callback) {
		if (!this._playlistTransition)
			this._cancelPlaylistAutoAdvance('load');

		if (!this.UI)
			throw new Error('Ayle UI is not attached. Call AttachUI() before Load().');

		if (
			this.Playlist &&
			this.Playlist.Items.length &&
			!this._playlistTransition
		) {
			return this._activatePlaylistItem(
				this.PlaylistIndex >= 0 ? this.PlaylistIndex : this.Playlist.StartIndex,
				this.State.Source ? 'reload' : 'initial',
				false,
				callback
			);
		}

		if (!this.MediaProvider)
			throw new Error('Ayle media provider is not configured');

		if (!this._playlistTransition)
			this._beginMediaLoad();

		return this.MediaProvider.Load(callback);
	};

	Ayle.prototype.Load = function (source) {
		if (source && typeof source !== 'function' && !this._playlistTransition)
			this._cancelPlaylistAutoAdvance('load');

		if (typeof source === 'function')
			return this.LoadMedia(source);

		if (!source)
			return this.LoadMedia();

		if (!this.UI)
			throw new Error('Ayle UI is not attached. Call AttachUI() before Load().');

		this._switch = null;
		this.State.Source = source;
		var previousMediaMode = this.State.MediaMode;
		this.State.MediaMode = this.ResolveMediaMode(source);
		this._applyPresetForMediaMode(this.State.MediaMode);
		this.State.Ready = false;
		this.State.Loading = true;
		this.State.Playing = false;
		this.State.Buffering = false;
		this.State.Seeking = false;
		this.State.Ended = false;
		this.State.Error = null;
		this.State.Position = 0;
		this.State.Duration = source.Duration > 0 ? source.Duration : 0;
		this.State.Buffered = [];
		this.State.Seekable = [];
		this.State.Variants = source.Variants.slice(0);
		this.State.AudioTracks = source.AudioTracks.slice(0);
		this.State.SubtitleTracks = source.SubtitleTracks.slice(0);
		this.State.Chapters = source.Chapters.slice(0);
		this.State.Chapter = null;
		this.State.ActiveHints = [];
		this.State.Variant = this._selectDefaultVariant();
		this.State.AudioTrack = this._selectDefaultTrack(this.State.AudioTracks);
		this.State.SubtitleTrack = this.Options.AutoSelectFirstSubtitleTrack && this.State.SubtitleTracks.length ? this.State.SubtitleTracks[0] : null;
		this._desiredSubtitleTrackID = this.State.SubtitleTrack ?
			String(this.State.SubtitleTrack.ID) : null;
		this._lastSubtitleTrackID = this.State.SubtitleTrack ?
			String(this.State.SubtitleTrack.ID) : null;
		this._autoPlayPending = !!this.Options.AutoPlay;
		this._restartPlayPending = false;
		this._initialStartPending = this.Options.Start > 0;

		/*
		 * Loading another source (including Playlist Next/Previous) must keep
		 * the user's current runtime audio state.  Options.Volume/Muted are
		 * initialization defaults; after playback starts State.Volume/Muted are
		 * authoritative.
		 */
		this.Driver.SetVolume(this.State.Volume);
		this.Driver.SetMuted(this.State.Muted);
		this.Driver.Load(source);

		if (this.State.Variant)
			this.Driver.SetVariant(this.State.Variant);

		this._syncHints(0);

		if (previousMediaMode !== this.State.MediaMode)
			this.Emit('mediaModeChange', this.State.MediaMode);

		this.Emit('sourceChange', source);
		this.Emit('variantsChange', this.State.Variants);
		this.Emit('audioTracksChange', this.State.AudioTracks);
		this.Emit('subtitleTracksChange', this.State.SubtitleTracks);
		this.Emit('chaptersChange', this.State.Chapters);
		this.Emit('chapterChange', null);
		this.Emit('stateChange', this.State);

		return true;
	};


	Ayle.prototype._startAutoPlay = function () {
		var mode = this.Options.AutoPlayMode || 'audible';

		if (mode === 'muted')
			this.SetMuted(true);

		var result = this.Play();
		var self = this;

		if (result && typeof result.catch === 'function') {
			result.catch(function (error) {
				self.Emit('autoplayBlocked', error);
			});
		}

		return result;
	};

	Ayle.prototype.Play = function () {
		this._cancelPlaylistAutoAdvance('play');

		if (!this.HasPlayableSource()) {
			this.State.Playing = false;
			this.State.Loading = false;
			this.State.Buffering = false;
			this.State.Seeking = false;

			this.Emit('playUnavailable', {
				Reason: 'no-source',
				State: this.State
			});
			this.Emit('emptyPlay');
			this.Emit('stateChange', this.State);
			return false;
		}

		/*
		 * Native media elements stay at duration after 'ended'. Calling play()
		 * there is not a reliable restart, especially with MSE/time streaming.
		 * Seek to zero first and start playback only after the seek completes.
		 */
		if (this.State.Ended) {
			this._restartPlayPending = true;
			this.State.Playing = false;
			this.State.Seeking = true;

			if (this.Driver.Seek(0) === false) {
				this._restartPlayPending = false;
				this.State.Seeking = false;
				return false;
			}

			this.Emit('stateChange', this.State);
			return true;
		}

		return this.Driver.Play();
	};

	Ayle.prototype.Pause = function () {
		if (!this.HasPlayableSource()) {
			this.State.Playing = false;
			this.State.Loading = false;
			this.State.Buffering = false;
			this.State.Seeking = false;
			this.Emit('stateChange', this.State);
			return false;
		}

		this.Driver.Pause();
		return true;
	};

	Ayle.prototype.Toggle = function () {
		if (!this.HasPlayableSource())
			return false;

		if (this.State.Playing)
			return this.Pause();

		return this.Play();
	};

	Ayle.prototype.Seek = function (position) {
		this._cancelPlaylistAutoAdvance('seek');

		if (!this.HasPlayableSource())
			return false;

		if (!isFinite(position))
			return false;

		if (position < 0)
			position = 0;

		if (isFinite(this.State.Duration) && this.State.Duration > 0 && position > this.State.Duration)
			position = this.State.Duration;

		return this.Driver.Seek(position) !== false;
	};

	Ayle.prototype.SetVolume = function (volume) {
		this.Driver.SetVolume(volume);
	};

	Ayle.prototype.SetMuted = function (muted) {
		this.Driver.SetMuted(muted);
	};

	Ayle.prototype.SetPlaybackRate = function (rate) {
		this.Driver.SetPlaybackRate(rate);
	};

	Ayle.prototype._createSwitchContext = function (variant) {
		return {
			PreviousVariant: this.State.Variant,
			Variant: variant,
			Position: this.State.Position,
			Playing: this.State.Playing,
			Volume: this.State.Volume,
			Muted: this.State.Muted,
			PlaybackRate: this.State.PlaybackRate,
			AudioTrackID: this.State.AudioTrack ? this.State.AudioTrack.ID : null,
			SubtitleTrackID: this.State.SubtitleTrack ? this.State.SubtitleTrack.ID : null,
			MetadataReady: false,
			Ready: false,
			Seeked: false
		};
	};

	Ayle.prototype.SetVariant = function (variant) {
		if (!variant)
			return false;

		if (this.State.Variant === variant)
			return true;

		if (this._switch)
			return false;

		var context = this._createSwitchContext(variant);
		this._switch = context;
		this.State.Variant = variant;
		this.State.Ready = false;
		this.State.Loading = true;
		this.State.Buffering = false;
		this.State.Seeking = false;
		this.State.Ended = false;
		this.State.Buffered = [];
		this.State.Seekable = [];

		if (!this.Driver.SetVariant(variant)) {
			this._switch = null;
			this.State.Variant = context.PreviousVariant;
			this.State.Loading = false;
			return false;
		}

		this.Emit('variantChange', variant);
		this.Emit('stateChange', this.State);
		return true;
	};

	Ayle.prototype.SetVariantByID = function (id) {
		var variants = this.State.Variants;
		var i = 0;
		var count = variants.length;

		while (i < count) {
			if (variants[i].ID === id)
				return this.SetVariant(variants[i]);
			i++;
		}

		return false;
	};

	Ayle.prototype._switchMetadata = function () {
		var context = this._switch;
		if (!context)
			return;

		context.MetadataReady = true;
		this._restoreSwitchTracks();

		if (!this.State.Source.Live && context.Position > 0) {
			this.State.Seeking = true;
			if (this.Driver.Seek(context.Position) === false)
				return;
		}
		else {
			context.Seeked = true;
			this._finishSwitchIfReady();
		}
	};

	Ayle.prototype._restoreSwitchTracks = function () {
		var context = this._switch;
		if (!context)
			return;

		var track;

		if (context.AudioTrackID !== null) {
			track = this._findTrackByID(this.State.AudioTracks, context.AudioTrackID);
			if (track && this.State.AudioTrack !== track)
				this.SetAudioTrack(track);
		}

		if (context.SubtitleTrackID !== null) {
			track = this._findTrackByID(this.State.SubtitleTracks, context.SubtitleTrackID);
			if (track && this.State.SubtitleTrack !== track)
				this.SetSubtitleTrack(track);
		}
		else if (this.State.SubtitleTrack !== null) {
			this.SetSubtitleTrack(null);
		}
	};

	Ayle.prototype._finishSwitchIfReady = function () {
		var context = this._switch;
		if (!context || !context.MetadataReady || !context.Ready || !context.Seeked)
			return;

		this._restoreSwitchTracks();
		this.Driver.SetVolume(context.Volume);
		this.Driver.SetMuted(context.Muted);
		this.Driver.SetPlaybackRate(context.PlaybackRate);

		var playing = context.Playing;
		var variant = context.Variant;

		this._switch = null;
		this.State.Ready = true;
		this.State.Loading = false;
		this.State.Buffering = false;
		this.State.Seeking = false;
		this.Emit('variantSwitched', variant);
		this.Emit('stateChange', this.State);

		if (playing)
			this.Play();
	};

	Ayle.prototype.IsSwitchingVariant = function () {
		return this._switch !== null;
	};

	Ayle.prototype.GetPendingVariant = function () {
		return this._switch ? this._switch.Variant : null;
	};

	Ayle.prototype.SetAudioTrack = function (track) {
		if (!track)
			return false;

		if (this.State.AudioTrack === track)
			return true;

		if (!this.Driver.SetAudioTrack(track))
			return false;

		this.State.AudioTrack = track;
		this.Emit('audioTrackChange', track);
		this.Emit('stateChange', this.State);
		return true;
	};

	Ayle.prototype.SetAudioTrackByID = function (id) {
		var track = this._findTrackByID(this.State.AudioTracks, id);
		return track ? this.SetAudioTrack(track) : false;
	};

	Ayle.prototype.SetSubtitleOffset = function (offset) {
		offset = Number(offset);

		if (!isFinite(offset))
			return false;

		if (this.Options.SubtitleOffset === offset)
			return true;

		this.Options.SubtitleOffset = offset;
		this.Emit('subtitleOffsetChange', offset);
		this.Emit('stateChange', this.State);
		return true;
	};

	Ayle.prototype.GetSubtitleOffset = function () {
		return this.Options.SubtitleOffset;
	};

	Ayle.prototype.SetSubtitleTrack = function (track) {
		if (this.State.SubtitleTrack === track) {
			this._desiredSubtitleTrackID = track ? String(track.ID) : null;

			if (track)
				this._lastSubtitleTrackID = String(track.ID);

			return true;
		}

		if (!this.Driver.SetSubtitleTrack(track))
			return false;

		if (track)
			this._lastSubtitleTrackID = String(track.ID);

		this._desiredSubtitleTrackID = track ? String(track.ID) : null;
		this.State.SubtitleTrack = track;
		this.Emit('subtitleTrackChange', track);
		this.Emit('stateChange', this.State);
		return true;
	};

	Ayle.prototype.SetSubtitleTrackByID = function (id) {
		if (id === null || id === '')
			return this.SetSubtitleTrack(null);

		var track = this._findTrackByID(this.State.SubtitleTracks, id);
		return track ? this.SetSubtitleTrack(track) : false;
	};

	Ayle.prototype.ToggleSubtitles = function () {
		var sourceTracks =
			this.State.Source && this.State.Source.SubtitleTracks ?
				this.State.Source.SubtitleTracks : [];
		var tracks = sourceTracks.length ?
			sourceTracks : (this.State.SubtitleTracks || []);

		/* No subtitle metadata: S is a no-op. */
		if (!tracks.length)
			return false;

		/*
		 * If subtitles are currently enabled, remember the selected track and
		 * disable subtitles. The next S must restore this exact track.
		 */
		if (this.State.SubtitleTrack) {
			this._lastSubtitleTrackID = String(this.State.SubtitleTrack.ID);
			return this.SetSubtitleTrack(null);
		}

		var track = null;

		/* Restore the track that was selected before subtitles were disabled. */
		if (this._lastSubtitleTrackID !== null)
			track = this._findTrackByID(tracks, this._lastSubtitleTrackID);

		/*
		 * There is no previously selected track yet. This happens on the first
		 * S press when automatic selection is disabled, so use the first
		 * available subtitle track.
		 */
		if (!track)
			track = tracks[0];

		return track ? this.SetSubtitleTrack(track) : false;
	};

	Ayle.prototype.SetChapter = function (chapter) {
		if (!chapter)
			return false;

		return this.Seek(chapter.Start);
	};

	Ayle.prototype.SetChapterByID = function (id) {
		var chapters = this.State.Chapters || [];
		var stringID = String(id);
		var i = 0;
		var count = chapters.length;

		while (i < count) {
			if (String(chapters[i].ID) === stringID)
				return this.SetChapter(chapters[i]);
			i++;
		}

		return false;
	};


	Ayle.prototype._hintEnd = function (hint) {
		var start = Number(hint && hint.Start) || 0;

		if (hint && hint.End !== undefined && hint.End !== null)
			return Number(hint.End);

		if (hint && hint.Duration !== undefined && hint.Duration !== null)
			return start + Math.max(0, Number(hint.Duration) || 0);

		return Infinity;
	};

	Ayle.prototype._hintID = function (hint, index) {
		if (hint && hint.ID !== undefined && hint.ID !== null && hint.ID !== '')
			return String(hint.ID);

		return 'hint-' + index;
	};

	Ayle.prototype._syncHints = function (position) {
		var hints = this.Options.Integration && this.Options.Integration.Hints instanceof Array ?
			this.Options.Integration.Hints : [];
		var active = [];
		var i = 0;
		var count = hints.length;

		while (i < count) {
			var hint = hints[i] || {};
			var start = Math.max(0, Number(hint.Start) || 0);
			var end = this._hintEnd(hint);

			if (position >= start && position < end)
				active.push(hint);

			i++;
		}

		var previous = this.State.ActiveHints || [];
		var changed = previous.length !== active.length;

		if (!changed) {
			i = 0;
			while (i < active.length) {
				if (previous[i] !== active[i]) {
					changed = true;
					break;
				}
				i++;
			}
		}

		if (!changed)
			return;

		this.State.ActiveHints = active;
		this.Emit('hintsChange', active);
		this.Emit('stateChange', this.State);
	};

	Ayle.prototype.RegisterHintRenderer = function (type, renderer) {
		type = String(type || 'default').toLowerCase();

		if (typeof renderer !== 'function')
			delete this._hintRenderers[type];
		else
			this._hintRenderers[type] = renderer;

		this.Emit('hintRenderersChange', {
			Type: type,
			Renderer: renderer
		});

		return this;
	};

	Ayle.prototype.GetHintRenderer = function (type) {
		type = String(type || 'default').toLowerCase();
		return this._hintRenderers[type] || this._hintRenderers.default || null;
	};

	Ayle.prototype.HasHintRenderer = function (type) {
		type = String(type || 'default').toLowerCase();
		return typeof this._hintRenderers[type] === 'function';
	};

	Ayle.prototype.RegisterHintAction = function (type, handler) {
		type = String(type || '').toLowerCase();

		if (!type)
			return this;

		if (typeof handler !== 'function')
			delete this._hintActionHandlers[type];
		else
			this._hintActionHandlers[type] = handler;

		return this;
	};

	Ayle.prototype.ExecuteHintAction = function (hint, action, event) {
		action = action || {};
		var type = String(action.Type || '').toLowerCase();
		var handler = this._hintActionHandlers[type];
		var result;

		if (handler)
			result = handler(action, hint, this, event);
		else if (type === 'url') {
			if (action.URL) {
				var target = action.Target || '_blank';

				if (target === '_self')
					global.location.href = action.URL;
				else
					global.open(action.URL, target, target === '_blank' ? 'noopener,noreferrer' : '');
			}
			result = true;
		}
		else if (type === 'seek') {
			result = this.Seek(Math.max(0, Number(action.Time) || 0));
		}
		else if (type === 'next' || type === 'playlist-next') {
			result = this.Next();
		}
		else if (type === 'previous' || type === 'playlist-previous') {
			result = this.Previous();
		}
		else if (type === 'media') {
			if (action.Source)
				result = this.Load(action.Source);
			else {
				this.Emit('hintMedia', {
					Hint: hint,
					Action: action
				});
				result = true;
			}
		}
		else if (type === 'callback') {
			if (typeof action.Callback === 'function')
				result = action.Callback(action, hint, this, event);
			else if (action.Name) {
				this.Emit('hintAction:' + action.Name, {
					Hint: hint,
					Action: action,
					Event: event
				});
				result = true;
			}
		}
		else {
			this.Emit('hintAction:' + type, {
				Hint: hint,
				Action: action,
				Event: event
			});
			result = true;
		}

		this.Emit('hintAction', {
			Hint: hint,
			Action: action,
			Event: event,
			Result: result
		});

		return result;
	};





	Ayle.prototype.Localize = function (key, parameters) {
		var localization = this.Options.Localization || {};
		var value = localization[key];

		if (value === undefined || value === null)
			value = PlayerDefaultLocalization[key];

		if (value === undefined || value === null)
			value = key;

		value = String(value);
		parameters = parameters || {};

		for (var name in parameters) {
			if (Object.prototype.hasOwnProperty.call(parameters, name))
				value = value.replace(new RegExp('\\{' + name + '\\}', 'g'), String(parameters[name]));
		}

		return value;
	};

	Ayle.prototype.SetLocalization = function (localization) {
		this.Options.Localization = AyleCopyLocalization(localization);
		this.Emit('localizationChange', this.Options.Localization);
		return this;
	};

	Ayle.prototype.SetLocalizationValue = function (key, value) {
		if (!this.Options.Localization)
			this.Options.Localization = AyleCopyLocalization();

		if (value === undefined || value === null)
			this.Options.Localization[key] = PlayerDefaultLocalization[key] !== undefined ?
				PlayerDefaultLocalization[key] : key;
		else
			this.Options.Localization[key] = String(value);

		this.Emit('localizationChange', this.Options.Localization);
		return this;
	};





	Ayle.prototype.SetSettingsOrder = function (order) {
		if (!(order instanceof Array))
			return this;

		var result = AyleNormalizeSettingsOrder(order);

		this.Options.SettingsOrder = result;
		this.Emit('settingsOrderChange', result.slice(0));
		return this;
	};

	Ayle.prototype.SetShortcut = function (name, enabled) {
		if (!this.Options.Shortcuts || !Object.prototype.hasOwnProperty.call(this.Options.Shortcuts, name))
			return this;

		enabled = !!enabled;

		if (this.Options.Shortcuts[name] === enabled)
			return this;

		this.Options.Shortcuts[name] = enabled;
		this.Emit('shortcutChange', {
			Name: name,
			Value: enabled
		});
		return this;
	};

	Ayle.prototype.SetShortcuts = function (shortcuts) {
		shortcuts = shortcuts || {};
		var names = [
			'PlayPause',
			'SeekArrows',
			'SeekAngle',
			'Volume',
			'Mute',
			'Subtitles',
			'Fullscreen',
			'PictureInPicture'
		];
		var i = 0;

		while (i < names.length) {
			var name = names[i];
			if (shortcuts[name] !== undefined)
				this.SetShortcut(name, shortcuts[name]);
			i++;
		}

		return this;
	};



	Ayle.prototype._getEffectivePreset = function (mode) {
		return AyleGetEffectivePreset(mode, this.Options.Preset);
	};

	Ayle.prototype._applyPresetForMediaMode = function (mode) {
		var preset = this._getEffectivePreset(mode);
		var player = preset.Player || {};
		var presetUI = preset.UI || {};
		var presetToolbar = presetUI.Toolbar || {};
		var ui = this.Options.UI;

		if (
			!this._showCenterPlayButtonExplicit &&
			player.ShowCenterPlayButton !== undefined
		)
			this.Options.ShowCenterPlayButton = !!player.ShowCenterPlayButton;

		if (!this._uiExplicit.Header && presetUI.Header instanceof Array)
			ui.Header = presetUI.Header.slice(0);

		if (!this._uiExplicit.Track && presetUI.Track instanceof Array)
			ui.Track = presetUI.Track.slice(0);

		if (!this._uiExplicit.Channel && presetUI.Channel instanceof Array)
			ui.Channel = presetUI.Channel.slice(0);

		if (!this._uiExplicit.Overlay && presetUI.Overlay instanceof Array)
			ui.Overlay = presetUI.Overlay.slice(0);

		if (!this._uiExplicit.ToolbarLayout && presetToolbar.Layout !== undefined)
			ui.Toolbar.Layout = presetToolbar.Layout;

		if (!this._uiExplicit.ToolbarItems && presetToolbar.Items instanceof Array)
			ui.Toolbar.Items = presetToolbar.Items.slice(0);

		return this;
	};


	Ayle.prototype.ResolveMediaMode = function (source) {
		if (this.Options.MediaMode !== 'auto')
			return this.Options.MediaMode;

		if (source && source.MediaMode && source.MediaMode !== 'auto')
			return source.MediaMode;

		if (source && source.Variants && source.Variants.length)
			return 'video';

		if (source && source.AudioTracks && source.AudioTracks.length)
			return 'audio';

		return 'video';
	};

	Ayle.prototype.SetMediaMode = function (mode) {
		mode = mode || 'auto';

		if (mode !== 'auto' && mode !== 'video' && mode !== 'audio')
			return this;

		if (this.Options.MediaMode === mode)
			return this;

		this.Options.MediaMode = mode;

		var resolved = this.ResolveMediaMode(this.State.Source);
		this._applyPresetForMediaMode(resolved);

		if (this.State.MediaMode !== resolved) {
			this.State.MediaMode = resolved;
			this.Emit('mediaModeChange', resolved);
			this.Emit('stateChange', this.State);
		}

		return this;
	};

	Ayle.prototype.SetUI = function (options) {
		options = options || {};
		var ui = this.Options.UI;

		if (options.Header instanceof Array) {
			this._uiExplicit.Header = true;
			ui.Header = options.Header.slice(0);
		}

		if (options.Track instanceof Array) {
			this._uiExplicit.Track = true;
			ui.Track = options.Track.slice(0);
		}

		if (options.Channel instanceof Array) {
			this._uiExplicit.Channel = true;
			ui.Channel = options.Channel.slice(0);
		}

		if (options.Overlay instanceof Array) {
			this._uiExplicit.Overlay = true;
			ui.Overlay = options.Overlay.slice(0);
		}

		if (options.Toolbar) {
			if (options.Toolbar.Layout !== undefined) {
				this._uiExplicit.ToolbarLayout = true;
				ui.Toolbar.Layout = String(options.Toolbar.Layout).toLowerCase();
			}

			if (options.Toolbar.Items instanceof Array) {
				this._uiExplicit.ToolbarItems = true;
				ui.Toolbar.Items = options.Toolbar.Items.slice(0);
			}

			if (
				ui.Toolbar.Layout !== 'inline' &&
				ui.Toolbar.Layout !== 'timeline-top' &&
				ui.Toolbar.Layout !== 'auto'
			)
				ui.Toolbar.Layout = 'inline';
		}


		this.Emit('uiChange', ui);
		return this;
	};

	Ayle.prototype.SetAudioVisual = function (options) {
		options = options || {};

		if (options.Type !== undefined)
			this.Options.AudioVisual.Type = options.Type;

		if (options.Image !== undefined)
			this.Options.AudioVisual.Image = options.Image || '';

		if (options.Subtitles !== undefined)
			this.Options.AudioVisual.Subtitles = !!options.Subtitles;

		if (options.MinHeight !== undefined)
			this.Options.AudioVisual.MinHeight = Math.max(0, Number(options.MinHeight) || 0);

		this.Emit('audioVisualChange', this.Options.AudioVisual);
		return this;
	};

	Ayle.prototype.SetKeyboardArrowSeekStep = function (step) {
		step = Math.max(0, Number(step) || 0);

		if (this.Options.KeyboardArrowSeekStep === step)
			return this;

		this.Options.KeyboardArrowSeekStep = step;
		this.Emit('keyboardArrowSeekStepChange', step);
		return this;
	};

	Ayle.prototype.SetKeyboardAngleSeekStep = function (step) {
		if (step !== 'frame')
			step = Math.max(0, Number(step) || 0);

		if (this.Options.KeyboardAngleSeekStep === step)
			return this;

		this.Options.KeyboardAngleSeekStep = step;
		this.Emit('keyboardAngleSeekStepChange', step);
		return this;
	};

	Ayle.prototype.SetKeyboardFrameRateFallback = function (frameRate) {
		frameRate = Math.max(1, Number(frameRate) || 30);

		if (this.Options.KeyboardFrameRateFallback === frameRate)
			return this;

		this.Options.KeyboardFrameRateFallback = frameRate;
		this.Emit('keyboardFrameRateFallbackChange', frameRate);
		return this;
	};

	Ayle.prototype.GetKeyboardAngleSeekStep = function () {
		if (this.Options.KeyboardAngleSeekStep !== 'frame')
			return this.Options.KeyboardAngleSeekStep;

		var variant = this.State.Variant;
		var frameRate = variant ? Number(variant.FrameRate) || 0 : 0;

		if (!frameRate)
			frameRate = this.Options.KeyboardFrameRateFallback || 30;

		return 1 / frameRate;
	};

	Ayle.prototype.SetFontFamily = function (fontFamily) {
		fontFamily = fontFamily || 'Arial, sans-serif';

		if (this.Options.FontFamily === fontFamily)
			return this;

		this.Options.FontFamily = fontFamily;
		this.Emit('fontFamilyChange', fontFamily);
		return this;
	};

	Ayle.prototype.SetDebug = function (enabled) {
		enabled = !!enabled;

		if (this.Options.Debug === enabled)
			return this;

		this.Options.Debug = enabled;
		if (this.Driver && typeof this.Driver.SetDebug === 'function')
			this.Driver.SetDebug(enabled);

		this.Emit('debugChange', enabled);
		return this;
	};

	Ayle.prototype.SetDebugMP4 = function (enabled) {
		enabled = !!enabled;

		if (this.Options.DebugMP4 === enabled)
			return this;

		this.Options.DebugMP4 = enabled;
		if (this.Driver && typeof this.Driver.SetDebugMP4 === 'function')
			this.Driver.SetDebugMP4(enabled);

		this.Emit('debugMP4Change', enabled);
		return this;
	};


	Ayle.prototype.SetAutoPlayMode = function (mode) {
		mode = mode || 'audible';

		if (mode !== 'audible' && mode !== 'muted')
			mode = 'audible';

		if (this.Options.AutoPlayMode === mode)
			return this;

		this.Options.AutoPlayMode = mode;
		this.Emit('autoplayModeChange', mode);
		return this;
	};

	Ayle.prototype.SetAutoPlay = function (enabled) {
		enabled = !!enabled;

		if (this.Options.AutoPlay === enabled)
			return this;

		this.Options.AutoPlay = enabled;

		if (this.State.Loading && this.State.Source)
			this._autoPlayPending = enabled;
		else if (!enabled)
			this._autoPlayPending = false;

		this.Emit('autoplayChange', enabled);
		return this;
	};

	Ayle.prototype.SetHintSafeArea = function (area) {
		if (typeof area === 'number') {
			area = {
				Top: area,
				Right: area,
				Bottom: area,
				Left: area
			};
		}
		else
			area = area || {};

		this.Options.HintSafeArea = {
			Top: area.Top !== undefined ? Math.max(0, Number(area.Top) || 0) : 0,
			Right: area.Right !== undefined ? Math.max(0, Number(area.Right) || 0) : 0,
			Bottom: area.Bottom !== undefined ? Math.max(0, Number(area.Bottom) || 0) : 0,
			Left: area.Left !== undefined ? Math.max(0, Number(area.Left) || 0) : 0
		};

		this.Emit('hintSafeAreaChange', this.Options.HintSafeArea);
		return this;
	};

	Ayle.prototype.SetIntegration = function (integration, synchronizeHints) {
		integration = integration || {};
		this.Options.Integration = {
			Channel: integration.Channel || null,
			Hints: integration.Hints instanceof Array ? integration.Hints : [],
			Settings: integration.Settings instanceof Array ? integration.Settings : [],
			Toolbar: integration.Toolbar instanceof Array ? integration.Toolbar : [],
			TimelineRanges: integration.TimelineRanges instanceof Array ? integration.TimelineRanges : [],
			MediaSession: integration.MediaSession || null,
			Data: integration.Data !== undefined ? integration.Data : null
		};

		if (synchronizeHints === false) {
			this.State.ActiveHints = [];
			this.Emit('hintsChange', this.State.ActiveHints);
		}
		else
			this._syncHints(this.State.Position);

		this.Emit('integrationChange', this.Options.Integration);
		return this;
	};

	Ayle.prototype.SetSubtitleStyle = function (style) {
		this.Options.SubtitleStyle = style || {};
		this.Emit('subtitleStyleChange', this.Options.SubtitleStyle);
		return this;
	};

	Ayle.prototype.IsNativeSubtitlesActive = function () {
		return !!(this.Options.NativeSubtitles || this._pictureInPictureNativeSubtitles);
	};

	Ayle.prototype._applyNativeSubtitlesMode = function () {
		var enabled = this.IsNativeSubtitlesActive();
		this.Driver.SetNativeSubtitles(enabled);

		/* Re-apply the selected track so its mode changes between hidden/showing. */
		if (this.State.SubtitleTrack)
			this.Driver.SetSubtitleTrack(this.State.SubtitleTrack);

		return enabled;
	};

	Ayle.prototype.SetNativeSubtitles = function (enabled) {
		enabled = !!enabled;
		if (this.Options.NativeSubtitles === enabled)
			return this;

		this.Options.NativeSubtitles = enabled;
		this._applyNativeSubtitlesMode();

		this.Emit('nativeSubtitlesChange', enabled);
		this.Emit('stateChange', this.State);
		return this;
	};

	Ayle.prototype.SetAutoNativeSubtitlesInPictureInPicture = function (enabled) {
		enabled = !!enabled;
		if (this.Options.AutoNativeSubtitlesInPictureInPicture === enabled)
			return this;

		this.Options.AutoNativeSubtitlesInPictureInPicture = enabled;
		this._pictureInPictureNativeSubtitles = !!(enabled && this.State.PictureInPicture);
		this._applyNativeSubtitlesMode();

		this.Emit('autoNativeSubtitlesInPictureInPictureChange', enabled);
		this.Emit('stateChange', this.State);
		return this;
	};

	Ayle.prototype.SupportsPictureInPicture = function () {
		return this.Driver.SupportsPictureInPicture();
	};

	Ayle.prototype.EnterPictureInPicture = function () {
		return this.Driver.EnterPictureInPicture();
	};

	Ayle.prototype.ExitPictureInPicture = function () {
		return this.Driver.ExitPictureInPicture();
	};

	Ayle.prototype.TogglePictureInPicture = function () {
		if (this.State.PictureInPicture)
			return this.ExitPictureInPicture();

		return this.EnterPictureInPicture();
	};



	var AyleMediaProviderRegistry = {};
	var AyleBuiltInMediaProviders = {
		http: true
	};

	function AyleNormalizeMediaProviderName (name) {
		return String(name || '').replace(/^\s+|\s+$/g, '').toLowerCase();
	}

	function AyleMediaProvider (player, options) {
		AyleEventEmitter.call(this);

		if (!player)
			throw new Error('AyleMediaProvider requires Ayle');

		this.Player = player;
		this.Options = options || {};
		this.Source = null;
		this.Metadata = null;
	}

	AyleMediaProvider.prototype = Object.create(AyleEventEmitter.prototype);
	AyleMediaProvider.prototype.constructor = AyleMediaProvider;

	AyleMediaProvider.prototype.Load = function (callback) {
		throw new Error('AyleMediaProvider.Load() is not implemented');
	};

	AyleMediaProvider.prototype.Destroy = function () {
		this.SetEventTarget(null, '');
		this.Source = null;
		this.Metadata = null;
		this._events = {};
		return this;
	};

	Ayle.RegisterMediaProvider = function (name, Provider) {
		name = AyleNormalizeMediaProviderName(name);

		if (!name)
			throw new Error('Ayle media provider name is empty');

		if (AyleBuiltInMediaProviders[name])
			throw new Error('Built-in Ayle media provider cannot be overwritten: ' + name);

		if (typeof Provider !== 'function')
			throw new Error('Ayle media provider must be a constructor: ' + name);

		AyleMediaProviderRegistry[name] = Provider;
		return Ayle;
	};

	Ayle.GetMediaProvider = function (name) {
		name = AyleNormalizeMediaProviderName(name);
		return name && AyleMediaProviderRegistry[name] ?
			AyleMediaProviderRegistry[name] : null;
	};

	Ayle.HasMediaProvider = function (name) {
		return !!Ayle.GetMediaProvider(name);
	};

	Ayle.RemoveMediaProvider = function (name) {
		name = AyleNormalizeMediaProviderName(name);

		if (!name || AyleBuiltInMediaProviders[name])
			return false;

		if (!AyleMediaProviderRegistry[name])
			return false;

		delete AyleMediaProviderRegistry[name];
		return true;
	};

	Ayle.CreateMediaProvider = function (name, player, options) {
		name = AyleNormalizeMediaProviderName(name);

		var Provider = Ayle.GetMediaProvider(name);

		if (!Provider)
			throw new Error('Unknown Ayle media provider: ' + name);

		var provider = new Provider(player, options || {});

		if (!provider || typeof provider.Load !== 'function')
			throw new Error('Invalid Ayle media provider implementation: ' + name);

		return provider;
	};


	function AyleHTTPMediaProvider (player, options) {
		options = options || {};
		AyleMediaProvider.call(this, player, options);

		this.Options = {
			File: options.File || '',
			MetadataURL: options.MetadataURL || '',
			TrackURL: options.TrackURL || '',
			VideoURL: options.VideoURL || '',
			AudioURL: options.AudioURL || '',
			SubtitleURL: options.SubtitleURL || '',
			ArtworkURL: options.ArtworkURL || options.CoverURL || '',
			CodecHeader: options.CodecHeader || 'X-Media-Codec',
			CodecListHeader: options.CodecListHeader || 'X-Media-Codec-List',
			CodecCandidates: options.CodecCandidates || null,
			RequestHeaders: options.RequestHeaders || {},
			Stream: options.Stream || {},
			VideoType: options.VideoType || 'video/mp4',
			AudioType: options.AudioType || 'audio/mp4',
			SubtitleType: options.SubtitleType || 'text/vtt'
		};

		this.SupportedCodecs = [];
		this._supportedCodecMap = {};
		this.UpdateCodecSupport();
	}

	AyleHTTPMediaProvider.prototype = Object.create(AyleMediaProvider.prototype);
	AyleHTTPMediaProvider.prototype.constructor = AyleHTTPMediaProvider;

	AyleHTTPMediaProvider.GetQueryParameter = function (name) {
		var query = global.location ? global.location.search : '';
		if (!query || query.length < 2)
			return '';

		var items = query.substring(1).split('&');
		var i = 0;

		while (i < items.length) {
			var pair = items[i].split('=');
			var key = decodeURIComponent((pair[0] || '').replace(/\+/g, ' '));

			if (key === name)
				return decodeURIComponent((pair.slice(1).join('=') || '').replace(/\+/g, ' '));

			i++;
		}

		return '';
	};

	AyleHTTPMediaProvider.prototype._replaceURLValue = function (url, key, value) {
		return String(url || '').replace(
			new RegExp('\\{' + key + '\\}', 'g'),
			encodeURIComponent(String(value))
		);
	};

	AyleHTTPMediaProvider.prototype._codecCandidates = function () {
		return this.Options.CodecCandidates || this.Player.GetCodecCandidates() || [];
	};

	AyleHTTPMediaProvider.prototype.UpdateCodecSupport = function () {
		var candidates = this._codecCandidates();
		var supported = this.Player.GetSupportedCodecs(candidates);
		var map = {};
		var seen = {};
		var i = 0;

		while (i < candidates.length) {
			var group = candidates[i] || {};
			var codecs = group.Codecs || [];
			var j = 0;

			while (j < codecs.length) {
				var codec = codecs[j];

				if (this.Player.SupportsCodec(group.Type, codec)) {
					if (!map[group.Type])
						map[group.Type] = [];

					map[group.Type].push(codec);

					if (!seen[codec]) {
						seen[codec] = true;
					}
				}

				j++;
			}

			i++;
		}

		this.SupportedCodecs = supported;
		this._supportedCodecMap = map;

		var value = supported.join(',');

		/*
		 * X-Media-Codec-List advertises browser capabilities globally.
		 * X-Media-Codec is reserved for one concrete selected pipeline codec.
		 */
		this.Player.SetRequestHeader(this.Options.CodecListHeader, value);
		this.Player.SetRequestHeader(this.Options.CodecHeader, '');

		return supported;
	};

	AyleHTTPMediaProvider.prototype.GetSupportedCodecs = function (type) {
		if (!type)
			return this.SupportedCodecs.slice(0);

		var codecs = this._supportedCodecMap[type] || [];
		return codecs.slice(0);
	};

	AyleHTTPMediaProvider.prototype.GetPreferredCodec = function (type) {
		var codecs = this._supportedCodecMap[type] || [];
		return codecs.length ? codecs[0] : '';
	};

	AyleHTTPMediaProvider.prototype._applyMetadataHeaders = function (xhr) {
		var headers = this.Options.RequestHeaders || {};
		var name;

		xhr.setRequestHeader('Accept', 'application/json');

		if (this.SupportedCodecs.length)
			xhr.setRequestHeader(
				this.Options.CodecListHeader,
				this.SupportedCodecs.join(',')
			);

		for (name in headers) {
			if (Object.prototype.hasOwnProperty.call(headers, name))
				xhr.setRequestHeader(name, headers[name]);
		}
	};

	AyleHTTPMediaProvider.prototype.BuildMetadataURL = function (file) {
		return this._replaceURLValue(this.Options.MetadataURL, 'file', file);
	};

	AyleHTTPMediaProvider.prototype.ResolveTrackURL = function (kind) {
		if (kind === 'video' && this.Options.VideoURL)
			return this.Options.VideoURL;

		if (kind === 'audio' && this.Options.AudioURL)
			return this.Options.AudioURL;

		if (kind === 'subtitle' && this.Options.SubtitleURL)
			return this.Options.SubtitleURL;

		if (kind === 'artwork' && this.Options.ArtworkURL)
			return this.Options.ArtworkURL;

		return this.Options.TrackURL || '';
	};

	AyleHTTPMediaProvider.prototype.BuildTrackURL = function (kind, file, track) {
		var template = this.ResolveTrackURL(kind);
		if (!template)
			throw new Error('No URL template configured for ' + kind + ' track');

		var url = this._replaceURLValue(template, 'file', file);
		url = this._replaceURLValue(url, 'kind', kind);
		url = this._replaceURLValue(url, 'track', track);

		return url;
	};

	AyleHTTPMediaProvider.prototype.LoadMetadata = function (file, callback) {
		var self = this;
		var xhr = new XMLHttpRequest();
		var url = this.BuildMetadataURL(file);

		if (!url) {
			callback(new Error('MetadataURL is empty'));
			return null;
		}

		xhr.open('GET', url, true);
		this._applyMetadataHeaders(xhr);

		xhr.onload = function () {
			if (xhr.status < 200 || xhr.status >= 300) {
				callback(new Error('Metadata request failed: HTTP ' + xhr.status));
				return;
			}

			var metadata;

			try {
				metadata = JSON.parse(xhr.responseText);
			}
			catch (error) {
				callback(new Error('Invalid metadata JSON: ' + error.message));
				return;
			}

			callback(null, metadata);
		};

		xhr.onerror = function () {
			callback(new Error('Network error while loading metadata: ' + url));
		};

		xhr.send();
		return xhr;
	};

	AyleHTTPMediaProvider.prototype._trackLanguage = function (track) {
		return track.tags && track.tags.language ? track.tags.language : '';
	};

	AyleHTTPMediaProvider.prototype._trackTitle = function (track) {
		return track.tags && track.tags.title ? track.tags.title : '';
	};

	AyleHTTPMediaProvider.prototype._trackDefault = function (track) {
		return !!(
			track.disposition &&
			Number(track.disposition.default) === 1
		);
	};

	AyleHTTPMediaProvider.prototype._trackForced = function (track) {
		return !!(
			track.disposition &&
			Number(track.disposition.forced) === 1
		);
	};

	AyleHTTPMediaProvider.prototype._hasDefaultTrack = function (items) {
		var i = 0;

		while (i < items.length) {
			if (this._trackDefault(items[i]))
				return true;

			i++;
		}

		return false;
	};

	AyleHTTPMediaProvider.prototype._trackLabel = function (track, fallback) {
		var title = this._trackTitle(track);
		var language = this._trackLanguage(track);

		if (title && language)
			return title + ' [' + language + ']';

		if (title)
			return title;

		if (language)
			return language;

		return fallback;
	};

	AyleHTTPMediaProvider.prototype._metadataCodec = function (track) {
		return track.mseCodec ||
			track.outputMseCodec ||
			track.sourceMseCodec ||
			'';
	};


	AyleHTTPMediaProvider.prototype._frameRate = function (track) {
		var value = track ? (
			track.avg_frame_rate ||
			track.r_frame_rate ||
			track.frame_rate ||
			track.frameRate ||
			0
		) : 0;

		if (typeof value === 'string' && value.indexOf('/') !== -1) {
			var parts = value.split('/');
			var numerator = Number(parts[0]) || 0;
			var denominator = Number(parts[1]) || 0;

			if (numerator && denominator)
				return numerator / denominator;

			return 0;
		}

		return Math.max(0, Number(value) || 0);
	};

	AyleHTTPMediaProvider.prototype.ResolveVideoCodec = function (track) {
		var codec = this._metadataCodec(track);

		if (codec)
			return codec;

		return this.GetPreferredCodec(this.Options.VideoType);
	};

	AyleHTTPMediaProvider.prototype.ResolveAudioCodec = function (track) {
		var codec = this._metadataCodec(track);

		if (codec)
			return codec;

		if (track.sourceCodec === 'aac' && this.Player.SupportsCodec(this.Options.AudioType, 'mp4a.40.2'))
			return 'mp4a.40.2';

		return this.GetPreferredCodec(this.Options.AudioType);
	};

	AyleHTTPMediaProvider.prototype.BuildStreamOptions = function (codec) {
		var source = this.Options.Stream || {};
		var result = {
			Mode: source.Mode || 'time',
			CodecHeader: this.Options.CodecHeader,
			CodecListHeader: this.Options.CodecListHeader,
			CodecList: this.SupportedCodecs.slice(0),
			Codec: codec || ''
		};
		var name;

		for (name in source) {
			if (Object.prototype.hasOwnProperty.call(source, name))
				result[name] = source[name];
		}

		return result;
	};



	AyleHTTPMediaProvider.prototype._isAttachedPicture = function (item) {
		return !!(
			item &&
			(
				item.attachedPicture ||
				(item.disposition && Number(item.disposition.attached_pic) === 1)
			)
		);
	};

	AyleHTTPMediaProvider.prototype._coverItems = function (metadata) {
		metadata = metadata || {};

		var artwork = metadata.artwork || [];
		var result = [];
		var i = 0;

		if (!(artwork instanceof Array))
			artwork = [artwork];

		while (i < artwork.length) {
			var item = artwork[i];

			if (item && typeof item === 'object') {
				item._PlayerCoverKind = 'artwork';
				result.push(item);
			}

			i++;
		}

		return result;
	};

	AyleHTTPMediaProvider.prototype._coverLabel = function (item, fallback) {
		var tags = item && item.tags ? item.tags : {};

		return tags.title ||
			tags.comment ||
			item.label ||
			fallback;
	};

	AyleHTTPMediaProvider.prototype.BuildCovers = function (metadata, file) {
		var items = this._coverItems(metadata);
		var result = [];
		var i = 0;

		while (i < items.length) {
			var item = items[i] || {};
			var track = item.track;

			if (track === undefined || track === null)
				track = item.streamIndex;

			if (track === undefined || track === null)
				track = i;

			var url = item.URL || item.url || '';
			if (!url) {
				try {
					url = this.BuildTrackURL(
						item._PlayerCoverKind || 'artwork',
						file,
						track
					);
				}
				catch (ignore) {}
			}

			if (url) {
				result.push(new AyleMediaCover({
					ID: 'cover-' + track,
					URL: url,
					Type: item.type || item.mimeType || '',
					Codec: item.sourceCodec || item.codec || '',
					Width: item.width,
					Height: item.height,
					Label: this._coverLabel(item, 'Cover ' + (i + 1)),
					Default: !!(
						item.default ||
						(item.disposition && Number(item.disposition.default) === 1)
					),
					AttachedPicture: !!(
						item.attachedPicture ||
						(item.disposition && Number(item.disposition.attached_pic) === 1)
					),
					Source: item
				}));
			}

			i++;
		}

		return result;
	};

	AyleHTTPMediaProvider.prototype.SelectCover = function (covers) {
		covers = covers || [];

		if (!covers.length)
			return null;

		var i = 0;

		while (i < covers.length) {
			if (covers[i].Default)
				return covers[i];
			i++;
		}

		i = 0;
		while (i < covers.length) {
			var label = String(covers[i].Label || '').toLowerCase();

			if (
				label.indexOf('cover (front)') !== -1 ||
				label.indexOf('front cover') !== -1 ||
				label === 'cover'
			)
				return covers[i];

			i++;
		}

		return covers[0];
	};

	AyleHTTPMediaProvider.prototype.BuildSource = function (metadata, file) {
		metadata = metadata || {};
		file = file || this.Options.File || metadata.file || '';

		var variants = [];
		var audioTracks = [];
		var subtitleTracks = [];
		var chapters = [];
		var covers = this.BuildCovers(metadata, file);
		var selectedCover = this.SelectCover(covers);
		var items;
		var item;
		var codec;
		var i;
		var hasDefault;

		items = metadata.video || [];
		i = 0;

		/* attached_pic is artwork, not a playable video variant. */
		var playableVideoItems = [];
		while (i < items.length) {
			if (!this._isAttachedPicture(items[i]))
				playableVideoItems.push(items[i]);
			i++;
		}

		i = 0;
		hasDefault = this._hasDefaultTrack(playableVideoItems);

		while (i < playableVideoItems.length) {
			item = playableVideoItems[i];
			codec = this.ResolveVideoCodec(item);

			if (!codec)
				throw new Error('No MSE codec for video track ' + item.track);

			variants.push(new AyleMediaVariant({
				ID: 'video-' + item.track,
				URL: this.BuildTrackURL('video', file, item.track),
				Type: this.Options.VideoType,
				Codecs: codec,
				Width: Number(item.width) || 0,
				Height: Number(item.height) || 0,
				FrameRate: this._frameRate(item),
				Label: item.height ? item.height + 'p' : this._trackLabel(item, 'Video ' + (i + 1)),
				Default: this._trackDefault(item) || (!hasDefault && i === 0),
				Stream: this.BuildStreamOptions(codec)
			}));

			i++;
		}

		items = metadata.audio || [];
		i = 0;
		hasDefault = this._hasDefaultTrack(items);

		while (i < items.length) {
			item = items[i];
			codec = this.ResolveAudioCodec(item);

			if (!codec)
				throw new Error('No MSE codec for audio track ' + item.track);

			audioTracks.push(new AyleMediaTrack({
				ID: 'audio-' + item.track,
				URL: this.BuildTrackURL('audio', file, item.track),
				Type: this.Options.AudioType,
				Codecs: codec,
				Language: this._trackLanguage(item),
				Label: this._trackLabel(item, 'Audio ' + (i + 1)),
				Default: this._trackDefault(item) || (!hasDefault && i === 0),
				Stream: this.BuildStreamOptions(codec)
			}));

			i++;
		}

		items = metadata.subtitles || [];
		i = 0;

		while (i < items.length) {
			item = items[i];

			subtitleTracks.push(new AyleMediaTrack({
				ID: 'subtitle-' + item.track,
				URL: this.BuildTrackURL('subtitle', file, item.track),
				Type: this.Options.SubtitleType,
				Language: this._trackLanguage(item),
				Label: this._trackLabel(item, 'Subtitles ' + (i + 1)),
				Default: this._trackDefault(item),
				Forced: this._trackForced(item)
			}));

			i++;
		}

		items = metadata.chapters || [];
		i = 0;

		while (i < items.length) {
			item = items[i];

			chapters.push(new AyleMediaChapter({
				ID: item.id,
				Start: Number(item.start_time) || 0,
				End: Number(item.end_time) || 0,
				Title: item.tags && item.tags.title ? item.tags.title : 'Chapter ' + (i + 1)
			}));

			i++;
		}

		var duration = Number(metadata.duration);
		if (!duration && metadata.format)
			duration = Number(metadata.format.duration);

		var tags = metadata.format && metadata.format.tags ?
			metadata.format.tags : {};

		var title = tags.title || file;
		var artist =
			tags.artist ||
			tags.album_artist ||
			tags.albumArtist ||
			tags.author ||
			'';
		var album = tags.album || '';

		return new AyleSource({
			ID: metadata.file || file,
			Title: title,
			Artist: artist,
			Album: album,
			Duration: duration || 0,
			MediaMode: variants.length ? 'video' : (audioTracks.length ? 'audio' : 'auto'),
			Cover: selectedCover ?
				selectedCover.URL :
				(typeof metadata.cover === 'string' ? metadata.cover : (
					metadata.format && metadata.format.tags ?
						(metadata.format.tags.cover || '') : ''
				)),
			Covers: covers,
			Variants: variants,
			AudioTracks: audioTracks,
			SubtitleTracks: subtitleTracks,
			Chapters: chapters
		});
	};

	AyleHTTPMediaProvider.prototype.Load = function (callback) {
		var self = this;
		var file = this.Options.File;

		callback = callback || function () {};

		if (!file) {
			var fileError = new Error('AyleHTTPMediaProvider file is empty');
			this.Emit('error', fileError);
			callback(fileError);
			return null;
		}

		this.Emit('loadStart', {
			File: file,
			Mode: this.Options.MetadataURL ? 'metadata' : 'direct'
		});

		/*
		 * No metadata endpoint means ordinary HTTP media. The provider resolves
		 * the resource into an AyleSource; the selected driver decides how that
		 * source is played.
		 */
		if (!this.Options.MetadataURL) {
			var directSource = new AyleSource({
				ID: file,
				URL: file,
				Title: file,
				MediaMode: 'auto'
			});

			this.Source = directSource;
			this.Metadata = null;
			this.Player.Load(directSource);
			this.Emit('ready', {
				Source: directSource,
				Metadata: null
			});
			callback(null, directSource, null);
			return directSource;
		}

		this.UpdateCodecSupport();

		return this.LoadMetadata(file, function (error, metadata) {
			if (error) {
				self.Emit('error', error);
				callback(error);
				return;
			}

			self.Emit('metadata', metadata);

			var source;

			try {
				source = self.BuildSource(metadata, file);
			}
			catch (buildError) {
				self.Emit('error', buildError);
				callback(buildError, null, metadata);
				return;
			}

			self.Source = source;
			self.Metadata = metadata;
			self.Player.Load(source);
			self.Emit('ready', {
				Source: source,
				Metadata: metadata
			});
			callback(null, source, metadata);
		});
	};


	AyleMediaProviderRegistry.http = AyleHTTPMediaProvider;


	Ayle.prototype.Destroy = function () {
		this._cancelPlaylistAutoAdvance('destroy');
		this.DetachUI();

		if (this.MediaProvider) {
			if (typeof this.MediaProvider.SetEventTarget === 'function')
				this.MediaProvider.SetEventTarget(null, '');

			if (typeof this.MediaProvider.Destroy === 'function')
				this.MediaProvider.Destroy();
		}

		if (this.Driver) {
			if (typeof this.Driver.SetEventTarget === 'function')
				this.Driver.SetEventTarget(null, '');

			if (typeof this.Driver.Destroy === 'function')
				this.Driver.Destroy();
		}

		this.MediaProvider = null;
		this.Driver = null;
		this.UI = null;
		this.Element = null;
		this.MediaElement = null;
		this._events = {};
		return this;
	};


	function AyleUI (element, player) {
		this.Element = AyleResolveElement(element, 'AyleUI target');
		element = this.Element;
		this.Player = player || null;
		this._domListeners = [];
		this._playerListeners = [];
		this.MediaElement = this.Element.querySelector(
			'.ayle-media, .ayle-video, .ayle-audio'
		);
		this.AudioCover = element.querySelector('.ayle-audio-cover');
		this.ArtworkSlideshow = element.querySelector('.ayle-artwork-slideshow');
		this.ArtworkSlideA = element.querySelector('.ayle-artwork-slide-a');
		this.ArtworkSlideB = element.querySelector('.ayle-artwork-slide-b');
		this._artworkSlideshowTimer = null;
		this._artworkSlideshowIndex = 0;
		this._artworkSlideshowFront = 0;
		this._artworkSlideshowPlayed = false;
		this.TrackCompactOverlay = element.querySelector('.ayle-overlay-track-compact');
		this.TrackCompactOverlayArtwork = element.querySelector('.ayle-overlay-track-compact-artwork');
		this.TrackCompactOverlayTitle = element.querySelector('.ayle-overlay-track-compact-title');
		this.TrackCompactOverlayMeta = element.querySelector('.ayle-overlay-track-compact-meta');
		this.TrackCompactOverlayChannel = element.querySelector('.ayle-overlay-track-compact-channel');
		this.TrackCompactOverlayChannelAvatar = element.querySelector('.ayle-overlay-track-compact-channel-avatar');
		this.TrackCompactOverlayChannelText = element.querySelector('.ayle-overlay-track-compact-channel-text');
		this.TrackCompactOverlaySubtitle = element.querySelector('.ayle-overlay-track-compact-subtitle');
		this.AudioSubtitleOverlay = element.querySelector('.ayle-overlay-audio-subtitles');
		this.AudioSubtitleOverlayText = element.querySelector('.ayle-overlay-audio-subtitles-text');
		this._trackCompactOverlaySubtitleText = '';
		this._trackCompactOverlayTimer = null;
		this._trackCompactOverlayHideTimer = null;
		this._trackCompactOverlayHover = false;
		this.PlayButton = element.querySelector('.ayle-play');
		this.PreviousButton = element.querySelector('.ayle-previous');
		this.NextButton = element.querySelector('.ayle-next');
		this.CenterPlayButton = element.querySelector('.ayle-center-play');
		this.CenterPlayCountdown = element.querySelector('.ayle-center-play-countdown');
		this._playlistAutoAdvanceFrame = null;
		this.Timeline = element.querySelector('.ayle-timeline');
		this.TimelineRanges = null;
		this._toolbarCustomElements = [];
		this._toolbarCustomMenus = [];
		this._toolbarRenderedItems = [];
		this.Buffered = element.querySelector('.ayle-buffered');
		this.Progress = element.querySelector('.ayle-progress');
		this.Handle = element.querySelector('.ayle-handle');
		this.Preview = element.querySelector('.ayle-preview');
		this.PreviewTime = element.querySelector('.ayle-preview-time');
		this.Time = element.querySelector('.ayle-time');
		this.Current = element.querySelector('.ayle-current');
		this.Duration = element.querySelector('.ayle-duration');
		this.Volume = element.querySelector('.ayle-volume');
		this.Mute = element.querySelector('.ayle-mute');
		this.Loading = element.querySelector('.ayle-loading');
		if (this.Loading) {
			this.Loading.classList.remove('is-visible');
			this.Loading.setAttribute('aria-hidden', 'true');
		}
		this.Fullscreen = element.querySelector('.ayle-fullscreen');
		this.PictureInPicture = element.querySelector('.ayle-pip');
		this.Quality = element.querySelector('.ayle-quality');
		this.QualityList = element.querySelector('.ayle-quality-list');
		this.QualityControl = element.querySelector('.ayle-quality-control');
		this.QualityButton = element.querySelector('.ayle-quality-button');
		this.QualityButtonName = element.querySelector('.ayle-quality-button-name');
		this.QualityBadge = element.querySelector('.ayle-quality-badge');
		this.QualityPopover = element.querySelector('.ayle-quality-popover');
		this.Audio = element.querySelector('.ayle-audio');
		this.AudioList = element.querySelector('.ayle-audio-list');
		this.AudioField = element.querySelector('.ayle-audio-field');
		this.AudioSubmenuButton = element.querySelector('.ayle-audio-submenu-button');
		this.AudioSubmenuValue = element.querySelector('.ayle-audio-submenu-value');
		this.Subtitles = element.querySelector('.ayle-subtitles');
		this.SubtitleList = element.querySelector('.ayle-subtitle-list');
		this.SubtitleField = element.querySelector('.ayle-subtitles-field');
		this.SubtitlesSubmenuButton = element.querySelector('.ayle-subtitles-submenu-button');
		this.SubtitlesSubmenuValue = element.querySelector('.ayle-subtitles-submenu-value');
		this.SettingsPages = element.querySelectorAll('.ayle-settings-page');
		this.SettingsBackButtons = element.querySelectorAll('.ayle-settings-back');
		this.IntegrationSettingsSection = element.querySelector('.ayle-integration-settings');
		this.IntegrationSettingsList = element.querySelector('.ayle-integration-settings-list');
		this.AutoPlayToggle = element.querySelector('.ayle-autoplay-toggle');
		this.DebugSubmenuButton = element.querySelector('.ayle-debug-submenu-button');
		this.DebugToggle = element.querySelector('.ayle-debug-toggle');
		this.DebugMP4Toggle = element.querySelector('.ayle-debug-mp4-toggle');
		this.ShortcutsSubmenuButton = element.querySelector('.ayle-shortcuts-submenu-button');
		this.ShortcutPlayPauseToggle = element.querySelector('.ayle-shortcut-play-pause-toggle');
		this.ShortcutSeekArrowsToggle = element.querySelector('.ayle-shortcut-seek-arrows-toggle');
		this.ShortcutSeekAngleToggle = element.querySelector('.ayle-shortcut-seek-angle-toggle');
		this.ShortcutVolumeToggle = element.querySelector('.ayle-shortcut-volume-toggle');
		this.ShortcutMuteToggle = element.querySelector('.ayle-shortcut-mute-toggle');
		this.ShortcutSubtitlesToggle = element.querySelector('.ayle-shortcut-subtitles-toggle');
		this.ShortcutFullscreenToggle = element.querySelector('.ayle-shortcut-fullscreen-toggle');
		this.ShortcutPictureInPictureToggle = element.querySelector('.ayle-shortcut-pip-toggle');
		this.NativeSubtitlesToggle = element.querySelector('.ayle-native-subtitles-toggle');
		this.AutoNativeSubtitlesInPictureInPictureToggle = element.querySelector('.ayle-pip-native-subtitles-toggle');
		this.SubtitleOverlay = element.querySelector('.ayle-subtitle-overlay');
		this._subtitleCueTrack = null;
		this._subtitleCueHandler = null;
		this.Chapters = element.querySelector('.ayle-chapters');
		this.ChaptersList = element.querySelector('.ayle-chapters-list');
		this.ChaptersControl = element.querySelector('.ayle-chapters-control');
		this.ChaptersButton = element.querySelector('.ayle-chapters-button');
		this.ChaptersPopover = element.querySelector('.ayle-chapters-popover');
		this.SettingsControl = element.querySelector('.ayle-settings-control');
		this.SettingsButton = element.querySelector('.ayle-settings-button');
		this.SettingsPopover = element.querySelector('.ayle-settings-popover');
		this.SettingsMainPage = element.querySelector('.ayle-settings-page-main');
		this.Controls = element.querySelector('.ayle-controls');
		this.Header = element.querySelector('.ayle-header');
		this.Title = element.querySelector('.ayle-title');
		this.Channel = element.querySelector('.ayle-channel');
		this.ChannelAvatar = element.querySelector('.ayle-channel-avatar');
		this.ChannelInfo = element.querySelector('.ayle-channel-info');
		this.ChannelName = element.querySelector('.ayle-channel-name');
		this.ChannelProfile = element.querySelector('.ayle-channel-profile');
		this.Hints = element.querySelector('.ayle-hints');
		this.MediaTitle = element.querySelector('.ayle-title-media');
		this.CurrentChapterTitle = element.querySelector('.ayle-title-chapter');
		this.Surface = element.querySelector('.ayle-surface');
		this._seeking = false;
		this._seekPosition = 0;
		this._controlsTimer = null;
		this._surfaceClickTimer = null;
		this._loadingTimer = null;
		this._safeAreaFrame = null;
		this._safeAreaObserver = null;
		this._hintElements = {};
		this._hintShown = {};
		this._hintDismissed = {};
		this._hintPausedPlayback = {};
		this._controlsVisible = true;
		this._controlsHover = false;
		this._touchRevealPending = false;
		this._quickTapTime = 0;
		this._quickTapX = 0;
		this._quickTapY = 0;
		this._quickTapPointerType = '';
		this._pendingQuickSeekDelta = 0;
		this._registerBuiltInHintRenderers();
		this._bind();
		this.UpdateTimelineRanges();
		this.UpdateMediaSession();
		this.UpdateTime();
		this.UpdateTimeWidth();
		this.UpdateBuffer();
		this.UpdateLoading();
		this.UpdateQualityMenu();
		this.UpdateAudioMenu();
		this.UpdateSubtitleMenu();
		this.UpdateAutoPlaySettings();
		this.UpdateDebugSettings();
		this.UpdateShortcutsSettings();
		this.ApplySettingsOrder();
		this.UpdateSubtitleSettings();
		this.UpdateIntegrationSettings();
		this.UpdateChapterMenu();
		this.UpdatePlayButton();
		this.UpdatePlaylistButtons();
		this.UpdateVolumeButton();
		this.UpdateVolumeSlider();
		this.UpdateFullscreenButton();
		this.UpdatePictureInPictureButton();
		this.ApplyPlayerStyle();
		this.ApplyLocalization();
		this.UpdateTitle();
		this.UpdateHints();
		this.UpdateSettingsVisibility();
		this.ApplySubtitleStyle();
		this.UpdateSubtitleTrackBinding();
		this.UpdateSubtitleOverlay();
		this.ApplyUIComposition();
		this.ApplyToolbar();
		this.UpdateControlLayoutMode();
		this.UpdateTrackCompactOverlay(false);

		if (this.TrackCompactOverlay) {
			var infoSelf = this;

			this._listen(element, 'mouseenter', function () {
				infoSelf._trackCompactOverlayHover = true;

				if (infoSelf._hasOverlayItem('track:compact'))
					infoSelf.ShowTrackCompactOverlay(false);
			});

			this._listen(element, 'mouseleave', function (event) {
				if (
					event.relatedTarget &&
					infoSelf.TrackCompactOverlay &&
					infoSelf.TrackCompactOverlay.contains(event.relatedTarget)
				)
					return;

				infoSelf._trackCompactOverlayHover = false;

				if (infoSelf._hasOverlayItem('track:compact'))
					infoSelf.ScheduleTrackCompactOverlayHide();
			});

			this._listen(element, 'focusin', function () {
				if (infoSelf._hasOverlayItem('track:compact'))
					infoSelf.ShowTrackCompactOverlay(false);
			});

			this._listen(element, 'focusout', function (event) {
				if (
					event.relatedTarget &&
					(
						element.contains(event.relatedTarget) ||
						(infoSelf.TrackCompactOverlay && infoSelf.TrackCompactOverlay.contains(event.relatedTarget))
					)
				)
					return;

				if (infoSelf._hasOverlayItem('track:compact'))
					infoSelf.ScheduleTrackCompactOverlayHide();
			});

			this._listen(this.TrackCompactOverlay, 'mouseenter', function () {
				infoSelf._trackCompactOverlayHover = true;

				if (infoSelf._trackCompactOverlayHideTimer) {
					clearTimeout(infoSelf._trackCompactOverlayHideTimer);
					infoSelf._trackCompactOverlayHideTimer = null;
				}

				infoSelf.ShowTrackCompactOverlay(false);
			});

			this._listen(this.TrackCompactOverlay, 'mouseleave', function (event) {
				if (event.relatedTarget && element.contains(event.relatedTarget))
					return;

				infoSelf._trackCompactOverlayHover = false;

				if (infoSelf._hasOverlayItem('track:compact'))
					infoSelf.ScheduleTrackCompactOverlayHide();
			});

			this._listen(this.TrackCompactOverlay, 'focusin', function () {
				infoSelf._trackCompactOverlayHover = true;

				if (infoSelf._trackCompactOverlayHideTimer) {
					clearTimeout(infoSelf._trackCompactOverlayHideTimer);
					infoSelf._trackCompactOverlayHideTimer = null;
				}

				infoSelf.ShowTrackCompactOverlay(false);
			});

			this._listen(this.TrackCompactOverlay, 'focusout', function (event) {
				if (
					event.relatedTarget &&
					(
						infoSelf.TrackCompactOverlay.contains(event.relatedTarget) ||
						element.contains(event.relatedTarget)
					)
				)
					return;

				infoSelf._trackCompactOverlayHover = false;

				if (infoSelf._hasOverlayItem('track:compact'))
					infoSelf.ScheduleTrackCompactOverlayHide();
			});

			this._trackCompactOverlayPositionHandler = function () {
				if (
					infoSelf.TrackCompactOverlay &&
					infoSelf.TrackCompactOverlay.classList.contains('is-enabled')
				)
					infoSelf.UpdateTrackCompactOverlayPosition();

				infoSelf.UpdateAudioSubtitleOverlayPosition();
			};

			this._listen(window, 'resize', this._trackCompactOverlayPositionHandler);
			this._listen(window, 'scroll', this._trackCompactOverlayPositionHandler, true);
		}

		this._bindSafeArea();

		if (this.PictureInPicture && !player.SupportsPictureInPicture())
			this.PictureInPicture.style.display = 'none';

		if (player.Options.AutoFocus)
			this.AutoFocus();
	}


	AyleUI.prototype._listen = function (target, name, callback, options) {
		if (!target || typeof target.addEventListener !== 'function')
			return callback;

		target.addEventListener(name, callback, options);
		this._domListeners.push({
			Target: target,
			Name: name,
			Callback: callback,
			Options: options
		});
		return callback;
	};

	AyleUI.prototype._unbindDOMListeners = function () {
		var i = this._domListeners.length;

		while (i--) {
			var item = this._domListeners[i];

			if (
				item.Target &&
				typeof item.Target.removeEventListener === 'function'
			)
				item.Target.removeEventListener(
					item.Name,
					item.Callback,
					item.Options
				);
		}

		this._domListeners = [];
		return this;
	};

	AyleUI.prototype._onPlayer = function (player, name, callback) {
		if (!player || typeof player.On !== 'function')
			return callback;

		player.On(name, callback);
		this._playerListeners.push({
			Player: player,
			Name: name,
			Callback: callback
		});
		return callback;
	};

	AyleUI.prototype._unbindPlayerListeners = function () {
		var i = this._playerListeners.length;

		while (i--) {
			var item = this._playerListeners[i];

			if (item.Player && typeof item.Player.Off === 'function')
				item.Player.Off(
					item.Name,
					item.Callback
				);
		}

		this._playerListeners = [];
		return this;
	};



	AyleUI.prototype.StopArtworkSlideshow = function (reason) {
		if (this._artworkSlideshowTimer) {
			clearTimeout(this._artworkSlideshowTimer);
			this._artworkSlideshowTimer = null;
		}

		if (this.ArtworkSlideshow) {
			this.ArtworkSlideshow.classList.remove('is-visible');
			this.ArtworkSlideshow.setAttribute('aria-hidden', 'true');
		}

		this.Element.classList.remove('ayle-artwork-slideshow-active');
		this.Element.classList.remove('ayle-artwork-slideshow-hide-controls');

		if (this.ArtworkSlideA)
			this.ArtworkSlideA.classList.remove('is-active');

		if (this.ArtworkSlideB)
			this.ArtworkSlideB.classList.remove('is-active');

		this.Player.Emit('artworkSlideshowStop', {
			Reason: reason || 'stop'
		});
	};

	AyleUI.prototype._showArtworkSlide = function (covers, index) {
		if (
			!this.ArtworkSlideshow ||
			!this.ArtworkSlideA ||
			!this.ArtworkSlideB ||
			!covers.length
		)
			return;

		index = index % covers.length;
		var cover = covers[index];
		var next = this._artworkSlideshowFront === 0 ?
			this.ArtworkSlideB : this.ArtworkSlideA;
		var previous = this._artworkSlideshowFront === 0 ?
			this.ArtworkSlideA : this.ArtworkSlideB;

		next.src = cover.URL;
		next.style.objectFit = this.Player.Options.ArtworkSlideshow.Fit;
		next.style.transitionDuration =
			this.Player.Options.ArtworkSlideshow.FadeDuration + 'ms';

		previous.style.transitionDuration =
			this.Player.Options.ArtworkSlideshow.FadeDuration + 'ms';

		/*
		 * Let the image decode/load if possible, but do not block slideshow
		 * startup on browsers without decode().
		 */
		var activate = function () {
			next.classList.add('is-active');
			previous.classList.remove('is-active');
		};

		if (typeof next.decode === 'function')
			next.decode().then(activate).catch(activate);
		else
			activate();

		this._artworkSlideshowFront = this._artworkSlideshowFront === 0 ? 1 : 0;
		this._artworkSlideshowIndex = index;

		this.Player.Emit('artworkSlideshowChange', {
			Index: index,
			Cover: cover
		});
	};

	AyleUI.prototype.StartArtworkSlideshow = function () {
		var source = this.Player.State.Source;
		var options = this.Player.Options.ArtworkSlideshow || {};
		var covers = source && source.Covers instanceof Array ?
			source.Covers : [];

		if (
			!options.Enabled ||
			this.Player.State.MediaMode !== 'video' ||
			this._artworkSlideshowPlayed ||
			this.Player.State.Playing ||
			!covers.length ||
			!this.ArtworkSlideshow
		) {
			this.StopArtworkSlideshow('unavailable');
			return false;
		}

		if (this._artworkSlideshowTimer) {
			clearTimeout(this._artworkSlideshowTimer);
			this._artworkSlideshowTimer = null;
		}

		this.ArtworkSlideshow.classList.add('is-visible');
		this.ArtworkSlideshow.setAttribute('aria-hidden', 'false');
		this.Element.classList.add('ayle-artwork-slideshow-active');
		this.Element.classList.toggle(
			'ayle-artwork-slideshow-hide-controls',
			options.HideControls === true
		);

		/*
		 * A slideshow is only a visual layer. Controls remain available by
		 * default and are hidden only when explicitly requested.
		 */
		if (options.HideControls !== true)
			this.ShowControls();

		this._artworkSlideshowIndex = 0;
		this._artworkSlideshowFront = 0;

		if (this.ArtworkSlideA) {
			this.ArtworkSlideA.src = covers[0].URL;
			this.ArtworkSlideA.style.objectFit = options.Fit;
			this.ArtworkSlideA.style.transitionDuration = options.FadeDuration + 'ms';
			this.ArtworkSlideA.classList.add('is-active');
		}

		if (this.ArtworkSlideB) {
			this.ArtworkSlideB.removeAttribute('src');
			this.ArtworkSlideB.classList.remove('is-active');
			this.ArtworkSlideB.style.objectFit = options.Fit;
			this.ArtworkSlideB.style.transitionDuration = options.FadeDuration + 'ms';
		}

		this.Player.Emit('artworkSlideshowStart', {
			Covers: covers.slice(0)
		});

		if (covers.length < 2)
			return true;

		var self = this;
		var tick = function () {
			if (
				self._artworkSlideshowPlayed ||
				self.Player.State.Playing ||
				self.Player.State.MediaMode !== 'video'
			) {
				self.StopArtworkSlideshow('playback');
				return;
			}

			var currentSource = self.Player.State.Source;
			var currentCovers =
				currentSource && currentSource.Covers instanceof Array ?
					currentSource.Covers : [];

			if (!currentCovers.length) {
				self.StopArtworkSlideshow('no-artwork');
				return;
			}

			var nextIndex =
				(self._artworkSlideshowIndex + 1) % currentCovers.length;

			self._showArtworkSlide(currentCovers, nextIndex);
			self._artworkSlideshowTimer = setTimeout(
				tick,
				self.Player.Options.ArtworkSlideshow.Interval
			);
		};

		this._artworkSlideshowTimer = setTimeout(tick, options.Interval);
		return true;
	};


	AyleUI.prototype.ApplyMediaMode = function () {
		var mode = this.Player.State.MediaMode || 'video';
		var visual = this.Player.Options.AudioVisual || {};
		var source = this.Player.State.Source || null;
		var sourceCover = source && source.Cover ? source.Cover : '';
		var visualImage = visual.Image || sourceCover;
		var hints = this.Player.Options.Integration && this.Player.Options.Integration.Hints ?
			this.Player.Options.Integration.Hints : [];
		var hasActiveSubtitles = !!(
			visual.Subtitles !== false &&
			this.Player.State.SubtitleTrack
		);
		var subtitlesInTrackCompactOverlay = this._hasOverlayItem('subtitles');
		var visualType = visual.Type || 'auto';

		this.Element.classList.toggle('ayle-media-audio', mode === 'audio');
		this.Element.classList.toggle('ayle-media-video', mode !== 'audio');

		if (mode !== 'audio') {
			this.Element.classList.remove('ayle-audio-no-visual');
			this.Element.classList.remove('ayle-audio-has-visual');

			if (this.AudioCover)
				this.AudioCover.style.display = 'none';

			return;
		}

		if (visualType === 'auto') {
			/*
			 * When the compact track overlay is configured, artwork belongs to
			 * that Now Playing presentation instead of the large audio visual
			 * surface. Hints/subtitles may still require the visual surface.
			 * Explicit Type:'cover' still means "show large cover".
			 */
			if (
				visualImage &&
				!this._hasOverlayItem('track:compact')
			)
				visualType = 'cover';
			else if (hints.length)
				visualType = 'hints';
			else if (hasActiveSubtitles && !subtitlesInTrackCompactOverlay)
				visualType = 'subtitles';
			else
				visualType = 'none';
		}

		/*
		 * Even with a cover, subtitles share the same visual surface.
		 * With Type:none the caller explicitly requested a collapsed audio UI,
		 * so subtitles continue to run but are intentionally not rendered.
		 */
		var hasVisual =
			visualType === 'cover' ||
			visualType === 'hints' ||
			visualType === 'subtitles' ||
			(
				visualType !== 'none' &&
				hasActiveSubtitles &&
				!subtitlesInTrackCompactOverlay
			);

		this.Element.classList.toggle('ayle-audio-no-visual', !hasVisual);
		this.Element.classList.toggle('ayle-audio-has-visual', hasVisual);

		if (visual.MinHeight)
			this.Element.style.setProperty('--ayle-audio-visual-min-height', visual.MinHeight + 'px');

		if (this.AudioCover) {
			if (visualType === 'cover' && visualImage) {
				this.AudioCover.src = visualImage;

				/*
				 * .ayle-audio-cover is hidden by default in CSS.
				 * Setting style.display to an empty string merely removes the
				 * inline declaration and therefore leaves CSS display:none in
				 * effect. Use an explicit visible display value.
				 */
				this.AudioCover.style.display = 'block';
			}
			else
				this.AudioCover.style.display = 'none';
		}
	};


	AyleUI.prototype._hasOverlayItem = function (name) {
		var items = this.Player.Options.UI && this.Player.Options.UI.Overlay instanceof Array ?
			this.Player.Options.UI.Overlay : [];

		return items.indexOf(name) !== -1;
	};

	AyleUI.prototype.UpdateTrackCompactOverlay = function (showOnUpdate) {
		if (!this.TrackCompactOverlay)
			return;

		var source = this.Player.State.Source || {};
		var trackItems = this.Player.Options.UI && this.Player.Options.UI.Track instanceof Array ?
			this.Player.Options.UI.Track : [];
		var artwork = source.Cover || '';
		var title = source.Title || '';
		var artist = source.Artist || '';
		var album = source.Album || '';
		var chapter = this.Player.State.Chapter || null;
		var chapterTitle = chapter ? (chapter.Title || chapter.Name || chapter.Label || '') : '';
		var artworkEnabled = trackItems.indexOf('artwork') !== -1;
		var titleEnabled = trackItems.indexOf('title') !== -1;
		var meta = [];
		var i = 0;

		while (i < trackItems.length) {
			var item = String(trackItems[i] || '');

			if (item === 'artist' && artist)
				meta.push(artist);
			else if (item === 'album' && album)
				meta.push(album);
			else if (item === 'chapter' && chapterTitle)
				meta.push(chapterTitle);

			i++;
		}

		if (this.TrackCompactOverlayArtwork) {
			if (artworkEnabled && artwork) {
				this.TrackCompactOverlayArtwork.src = artwork;
				this.TrackCompactOverlayArtwork.style.display = 'block';
			}
			else {
				this.TrackCompactOverlayArtwork.removeAttribute('src');
				this.TrackCompactOverlayArtwork.style.display = 'none';
			}
		}

		if (this.TrackCompactOverlayTitle) {
			this.TrackCompactOverlayTitle.textContent = titleEnabled ? title : '';
			this.TrackCompactOverlayTitle.style.display =
				titleEnabled && title ? '' : 'none';
		}

		if (this.TrackCompactOverlayMeta) {
			this.TrackCompactOverlayMeta.textContent = meta.join(' · ');
			this.TrackCompactOverlayMeta.style.display =
				meta.length ? '' : 'none';
		}

		if (this.TrackCompactOverlayChannel)
			this.TrackCompactOverlayChannel.style.display = 'none';

		var hasContent = !!(
			(artworkEnabled && artwork) ||
			(titleEnabled && title) ||
			meta.length
		);

		this.TrackCompactOverlay.classList.toggle('has-content', hasContent);
		this.UpdateAudioSubtitleOverlay();

		if (showOnUpdate)
			this.ShowTrackCompactOverlay(true);
	};

	AyleUI.prototype.UpdateTrackCompactOverlaySubtitle = function () {
		/* Backward-compatible method name: subtitle rendering now lives in
		 * the dedicated audio subtitle overlay. */
		this.UpdateAudioSubtitleOverlay();
	};

	AyleUI.prototype.UpdateAudioSubtitleOverlayPosition = function () {
		if (!this.AudioSubtitleOverlay)
			return;

		var playerRect = this.Element.getBoundingClientRect();
		var popupHeight = this.AudioSubtitleOverlay.offsetHeight || 28;
		var viewportHeight =
			window.innerHeight ||
				document.documentElement.clientHeight ||
				0;
		var spaceTop = playerRect.top;
		var spaceBottom = viewportHeight - playerRect.bottom;
		var resolved;

		if (spaceTop >= popupHeight)
			resolved = 'top';
		else if (spaceBottom >= popupHeight)
			resolved = 'bottom';
		else
			resolved = spaceBottom > spaceTop ? 'bottom' : 'top';

		this.AudioSubtitleOverlay.classList.toggle(
			'ayle-overlay-audio-subtitles-top',
			resolved === 'top'
		);

		this.AudioSubtitleOverlay.classList.toggle(
			'ayle-overlay-audio-subtitles-bottom',
			resolved === 'bottom'
		);

		this.AudioSubtitleOverlay.setAttribute(
			'data-ayle-overlay-audio-subtitles-position',
			resolved
		);
	};

	AyleUI.prototype.UpdateAudioSubtitleOverlay = function () {
		if (!this.AudioSubtitleOverlay)
			return;

		var track = this.Player.State.SubtitleTrack;
		var enabled = !!(
			this._hasOverlayItem('subtitles') &&
			this.Player.State.MediaMode === 'audio' &&
			track
		);
		var cues = enabled ? this.GetActiveSubtitleCues() : [];
		var text = enabled ? this.GetActiveSubtitleText() : '';
		var visible = !!(enabled && text);

		if (this.AudioSubtitleOverlayText) {
			this.AudioSubtitleOverlayText.innerHTML = '';

			var cueIndex = 0;
			while (cueIndex < cues.length) {
				if (cueIndex > 0)
					this.AudioSubtitleOverlayText.appendChild(document.createElement('br'));

				this.AppendSubtitleCue(
					this.AudioSubtitleOverlayText,
					cues[cueIndex]
				);

				cueIndex++;
			}
		}

		this.AudioSubtitleOverlay.classList.toggle('has-text', !!text);
		this.AudioSubtitleOverlay.classList.toggle('is-visible', visible);
		this.AudioSubtitleOverlay.setAttribute(
			'data-ayle-overlay-audio-subtitles-state',
			text ? 'active' : 'hidden'
		);

		this.UpdateAudioSubtitleOverlayPosition();

		if (this.TrackCompactOverlaySubtitle)
			this.TrackCompactOverlaySubtitle.style.display = 'none';
	};

	AyleUI.prototype.UpdateTrackCompactOverlayPosition = function () {
		if (!this.TrackCompactOverlay)
			return;

		var playerRect = this.Element.getBoundingClientRect();
		var popupHeight = this.TrackCompactOverlay.offsetHeight || 80;
		var gap = 8;
		var viewportHeight =
			window.innerHeight ||
				document.documentElement.clientHeight ||
				0;
		var spaceTop = playerRect.top;
		var spaceBottom = viewportHeight - playerRect.bottom;
		var resolved;

		if (spaceTop >= popupHeight + gap)
			resolved = 'top';
		else if (spaceBottom >= popupHeight + gap)
			resolved = 'bottom';
		else
			resolved = spaceBottom > spaceTop ? 'bottom' : 'top';

		this.TrackCompactOverlay.classList.toggle(
			'ayle-overlay-track-compact-top',
			resolved === 'top'
		);

		this.TrackCompactOverlay.classList.toggle(
			'ayle-overlay-track-compact-bottom',
			resolved === 'bottom'
		);

		this.TrackCompactOverlay.setAttribute(
			'data-ayle-overlay-track-compact-position',
			resolved
		);

		this.UpdateAudioSubtitleOverlayPosition();
	};

	AyleUI.prototype.ShowTrackCompactOverlay = function (automatic) {
		if (!this.TrackCompactOverlay)
			return;

		if (
			!this._hasOverlayItem('track:compact') ||
			!this.TrackCompactOverlay.classList.contains('has-content')
		) {
			this.HideTrackCompactOverlay(true);
			return;
		}

		this.UpdateTrackCompactOverlayPosition();

		if (this._trackCompactOverlayHideTimer) {
			clearTimeout(this._trackCompactOverlayHideTimer);
			this._trackCompactOverlayHideTimer = null;
		}

		this.TrackCompactOverlay.classList.add('is-visible');
		this.UpdateAudioSubtitleOverlayPosition();

		if (this._trackCompactOverlayTimer) {
			clearTimeout(this._trackCompactOverlayTimer);
			this._trackCompactOverlayTimer = null;
		}

		if (automatic && !this._trackCompactOverlayHover) {
			var self = this;
			this._trackCompactOverlayTimer = setTimeout(function () {
				self._trackCompactOverlayTimer = null;

				if (!self._trackCompactOverlayHover)
					self.HideTrackCompactOverlay();
			}, 3500);
		}
	};

	AyleUI.prototype.ScheduleTrackCompactOverlayHide = function (delay) {
		var self = this;

		if (this._trackCompactOverlayHideTimer) {
			clearTimeout(this._trackCompactOverlayHideTimer);
			this._trackCompactOverlayHideTimer = null;
		}

		delay = delay !== undefined ? Math.max(0, Number(delay) || 0) : 120;

		this._trackCompactOverlayHideTimer = setTimeout(function () {
			self._trackCompactOverlayHideTimer = null;

			if (!self._trackCompactOverlayHover)
				self.HideTrackCompactOverlay();
		}, delay);
	};

	AyleUI.prototype.HideTrackCompactOverlay = function (force) {
		if (!this.TrackCompactOverlay)
			return;

		if (!force && this._trackCompactOverlayHover)
			return;

		if (this._trackCompactOverlayTimer) {
			clearTimeout(this._trackCompactOverlayTimer);
			this._trackCompactOverlayTimer = null;
		}

		if (this._trackCompactOverlayHideTimer) {
			clearTimeout(this._trackCompactOverlayHideTimer);
			this._trackCompactOverlayHideTimer = null;
		}

		this.TrackCompactOverlay.classList.remove('is-visible');
		this.UpdateAudioSubtitleOverlayPosition();
	};

	AyleUI.prototype.ApplyTrackCompactOverlayMode = function (showOnUpdate) {
		if (!this.TrackCompactOverlay)
			return;

		var enabled = this._hasOverlayItem('track:compact');

		this.Element.classList.toggle('ayle-has-track-compact', enabled);
		this.TrackCompactOverlay.classList.toggle('is-enabled', enabled);
		this.UpdateTrackCompactOverlay(false);
		this.UpdateTrackCompactOverlayPosition();

		if (!enabled) {
			this.HideTrackCompactOverlay(true);
			return;
		}

		if (showOnUpdate)
			this.ShowTrackCompactOverlay(true);
		else
			this.HideTrackCompactOverlay();
	};

	AyleUI.prototype.ApplyUIComposition = function () {
		var ui = this.Player.Options.UI || {};
		var header = ui.Header instanceof Array ? ui.Header : [];

		this.Element.classList.toggle('ayle-ui-headerless', header.length === 0);

		this.ApplyMediaMode();
		this.ApplyTrackCompactOverlayMode(false);
		this.UpdateAudioSubtitleOverlay();
		this.UpdateTitle();
	};

	AyleUI.prototype._toolbarElement = function (name) {
		switch (name) {
			case 'previous': return this.PreviousButton;
			case 'play': return this.PlayButton;
			case 'next': return this.NextButton;
			case 'timeline': return this.Timeline;
			case 'time': return this.Time;
			case 'volume': return this.Volume ? this.Volume.parentNode : null;
			case 'chapters': return this.ChaptersControl;
			case 'quality': return this.QualityControl;
			case 'settings': return this.SettingsControl;
			case 'pip': return this.PictureInPicture;
			case 'fullscreen': return this.Fullscreen;
		}

		return null;
	};

	AyleUI.prototype._executeToolbarMenuItem = function (toolbarItem, menuItem, event) {
		if (!menuItem)
			return;

		var result;
		var context = {
			Player: this.Player,
			UI: this,
			ToolbarItem: toolbarItem,
			Item: menuItem,
			Event: event
		};

		if (typeof menuItem.Action === 'function')
			result = menuItem.Action(context);
		else if (typeof menuItem.OnClick === 'function')
			result = menuItem.OnClick(context);
		else if (menuItem.Event) {
			this.Player.Emit('toolbarMenuAction:' + menuItem.Event, context);
			result = true;
		}
		else {
			this.Player.Emit('toolbarMenuAction', context);
			result = true;
		}

		this.Player.Emit('toolbarMenuSelect', {
			ToolbarItem: toolbarItem,
			Item: menuItem,
			Event: event,
			Result: result,
			UI: this
		});

		return result;
	};

	AyleUI.prototype._createToolbarCustomMenu = function (toolbarItem, button) {
		var items =
			toolbarItem.Menu instanceof Array ?
				toolbarItem.Menu :
				(
					toolbarItem.Menu &&
					toolbarItem.Menu.Items instanceof Array ?
						toolbarItem.Menu.Items :
						[]
				);

		if (!items.length)
			return null;

		var container = document.createElement('div');
		container.className = 'ayle-popover-container ayle-toolbar-custom-control';

		var popover = document.createElement('div');
		popover.className = 'ayle-popover ayle-toolbar-custom-menu';
		popover.setAttribute('role', 'menu');

		container.appendChild(button);
		container.appendChild(popover);

		var i = 0;
		var self = this;

		while (i < items.length) {
			var item = items[i];

			if (item === '') {
				var separator = document.createElement('div');
				separator.className =
					'ayle-settings-order-separator ' +
					'ayle-toolbar-custom-menu-separator';
				separator.setAttribute('role', 'separator');
				popover.appendChild(separator);
				i++;
				continue;
			}

			item = item || {};

			var menuButton = document.createElement('button');
			menuButton.type = 'button';
			menuButton.className =
				'ayle-settings-submenu-item ' +
				'ayle-toolbar-custom-menu-item';
			menuButton.setAttribute('role', 'menuitem');
			menuButton.disabled = item.Disabled === true;

			if (item.ClassName)
				menuButton.className += ' ' + item.ClassName;

			var label = document.createElement('span');
			label.className =
				'ayle-settings-submenu-label ' +
				'ayle-toolbar-custom-menu-label';
			label.textContent = item.Label || item.Title || item.ID || '';
			menuButton.appendChild(label);

			if (item.Value !== undefined && item.Value !== null && item.Value !== '') {
				var value = document.createElement('span');
				value.className =
					'ayle-settings-submenu-value ' +
					'ayle-toolbar-custom-menu-value';
				value.textContent =
					typeof item.Value === 'function' ?
						item.Value(item, this.Player, this) :
						String(item.Value);
				menuButton.appendChild(value);
			}

			(function (descriptor, control) {
				self._listen(control, 'click', function (event) {
					event.preventDefault();
					event.stopPropagation();

					self._executeToolbarMenuItem(toolbarItem, descriptor, event);

					if (descriptor.CloseMenu !== false)
						self._closePopovers();
				});
			})(item, menuButton);

			popover.appendChild(menuButton);
			i++;
		}

		button.setAttribute('aria-haspopup', 'menu');
		button.setAttribute('aria-expanded', 'false');

		var pair = {
			Button: button,
			Container: container,
			Popover: popover,
			Item: toolbarItem
		};

		button._ayleToolbarControl = container;
		this._toolbarCustomMenus.push(pair);

		return pair;
	};

	AyleUI.prototype._toggleToolbarCustomMenu = function (pair) {
		if (!pair || !pair.Button || !pair.Popover)
			return this;

		var open = !pair.Popover.classList.contains('is-open');
		this._closePopovers(pair.Popover);

		if (open) {
			var buttonRect = pair.Button.getBoundingClientRect();
			var playerRect = this.Element.getBoundingClientRect();
			var buttonCenter = buttonRect.left + buttonRect.width / 2;
			var playerCenter = playerRect.left + playerRect.width / 2;
			var anchorLeft = buttonCenter <= playerCenter;

			pair.Popover.classList.toggle('is-anchor-left', anchorLeft);
			pair.Popover.classList.toggle('is-anchor-right', !anchorLeft);
		}

		pair.Popover.classList.toggle('is-open', open);
		pair.Button.setAttribute('aria-expanded', open ? 'true' : 'false');

		if (open)
			this.ShowControls();

		return this;
	};

	AyleUI.prototype._createToolbarButton = function (item) {
		item = item || {};
		var button = document.createElement('button');
		button.type = 'button';
		button.className = 'ayle-icon-button ayle-toolbar-custom-button';

		if (item.ID)
			button.setAttribute('data-ayle-toolbar-id', String(item.ID));

		var title = item.Title || item.Label || '';
		if (title) {
			button.title = title;
			button.setAttribute('aria-label', title);
		}

		if (item.ClassName)
			button.className += ' ' + item.ClassName;

		var content = document.createElement('span');
		content.className = 'ayle-toolbar-custom-content';

		if (item.Icon) {
			if (String(item.Icon).indexOf('<') !== -1)
				content.innerHTML = String(item.Icon);
			else {
				var image = document.createElement('img');
				image.className = 'ayle-toolbar-custom-icon';
				image.src = String(item.Icon);
				image.alt = '';
				content.appendChild(image);
			}
		}
		else
			content.textContent = item.Label || item.Title || item.ID || '';

		button.appendChild(content);

		button.disabled = item.Disabled === true;
		button.style.display = item.Visible === false ? 'none' : '';

		var self = this;
		var menuPair = this._createToolbarCustomMenu(item, button);

		this._listen(button, 'click', function (event) {
			event.stopPropagation();

			var context = {
				Player: self.Player,
				UI: self,
				Element: button,
				Item: item,
				Event: event
			};

			if (menuPair)
				self._toggleToolbarCustomMenu(menuPair);

			if (typeof item.OnClick === 'function')
				item.OnClick(context);

			self.Player.Emit(item.Event || 'toolbarAction', context);
		});

		if (typeof item.OnCreate === 'function') {
			item.OnCreate({
				Player: this.Player,
				UI: this,
				Element: button,
				Item: item
			});
		}

		return button;
	};

	AyleUI.prototype.ApplyToolbar = function () {
		if (!this.Controls)
			return this;

		var i = 0;
		while (i < this._toolbarCustomElements.length) {
			var custom = this._toolbarCustomElements[i];
			if (custom.Item && typeof custom.Item.OnDestroy === 'function') {
				custom.Item.OnDestroy({
					Player: this.Player,
					UI: this,
					Element: custom.Element,
					Item: custom.Item
				});
			}

			var layoutElement = custom.LayoutElement || custom.Element;

			if (layoutElement && layoutElement.parentNode)
				layoutElement.parentNode.removeChild(layoutElement);

			i++;
		}
		this._toolbarCustomElements = [];

		this._toolbarCustomMenus = [];
		this._toolbarRenderedItems = [];

		var oldSpacers = this.Controls.querySelectorAll('.ayle-toolbar-spacer');
		var spacerIndex = 0;
		while (spacerIndex < oldSpacers.length) {
			if (oldSpacers[spacerIndex].parentNode)
				oldSpacers[spacerIndex].parentNode.removeChild(oldSpacers[spacerIndex]);
			spacerIndex++;
		}

		var items = this.Player.Options.UI && this.Player.Options.UI.Toolbar && this.Player.Options.UI.Toolbar.Items instanceof Array ?
			this.Player.Options.UI.Toolbar.Items.slice(0) : [];
		var injected = this.Player.Options.Integration && this.Player.Options.Integration.Toolbar instanceof Array ?
			this.Player.Options.Integration.Toolbar : [];

		i = 0;
		while (i < injected.length) {
			var descriptor = injected[i] || {};
			var index = items.length;
			var reference;
			var j;

			if (descriptor.Before) {
				reference = String(descriptor.Before);
				j = 0;
				while (j < items.length) {
					if (String(typeof items[j] === 'string' ? items[j] : items[j].ID) === reference) {
						index = j;
						break;
					}
					j++;
				}
			}
			else if (descriptor.After) {
				reference = String(descriptor.After);
				j = 0;
				while (j < items.length) {
					if (String(typeof items[j] === 'string' ? items[j] : items[j].ID) === reference)
						index = j + 1;
					j++;
				}
			}

			items.splice(index, 0, descriptor);
			i++;
		}

		var layout = this.Player.Options.UI && this.Player.Options.UI.Toolbar ? this.Player.Options.UI.Toolbar.Layout : 'inline';
		var hasSpacer = false;
		i = 0;
		while (i < items.length) {
			if (items[i] === '') {
				hasSpacer = true;
				break;
			}
			i++;
		}

		if ((layout === 'timeline-top' || layout === 'auto') && !hasSpacer) {
			var spacerAt = items.length;
			i = 0;
			while (i < items.length) {
				var itemName = typeof items[i] === 'string' ? items[i] : (items[i] && items[i].ID);

				if (
					itemName === 'volume' ||
					itemName === 'chapters' ||
					itemName === 'quality' ||
					itemName === 'settings' ||
					itemName === 'pip' ||
					itemName === 'fullscreen'
				) {
					spacerAt = i;
					break;
				}

				i++;
			}

			items.splice(spacerAt, 0, '');
		}

		var builtInNames = ['previous', 'play', 'next', 'timeline', 'time', 'volume', 'chapters', 'quality', 'settings', 'pip', 'fullscreen'];
		i = 0;
		while (i < builtInNames.length) {
			var builtIn = this._toolbarElement(builtInNames[i]);
			if (builtIn) {
				builtIn.style.order = '1000';
				builtIn.style.display = 'none';
			}
			i++;
		}

		i = 0;
		while (i < items.length) {
			var item = items[i];
			var element = null;

			if (typeof item === 'string') {
				if (item === '') {
					element = document.createElement('span');
					element.className = 'ayle-toolbar-spacer';
					element.setAttribute('aria-hidden', 'true');
					this.Controls.appendChild(element);
				}
				else
					element = this._toolbarElement(item);
			}
			else if (item && item.Type === 'button') {
				var button = this._createToolbarButton(item);
				var layoutElement = button._ayleToolbarControl || button;

				this.Controls.appendChild(layoutElement);
				this._toolbarCustomElements.push({
					Element: button,
					LayoutElement: layoutElement,
					Item: item
				});
				element = layoutElement;
			}

			if (element) {
				element.style.order = String(i);
				element.style.display = item && item.Visible === false ? 'none' : '';
				this._toolbarRenderedItems.push({
					Element: element,
					Item: item
				});
			}

			i++;
		}

		this._applyToolbarLayoutGeometry();

		/*
		 * ApplyToolbar() temporarily exposes every configured built-in control
		 * while rebuilding the ordered layout. Restore data-dependent
		 * visibility afterwards so Chapters/Quality immediately respect both
		 * their available data and ForceShow* options.
		 */
		this.UpdateChapterMenu();
		this.UpdateQualityMenu();

		this.UpdatePlaylistButtons();
		return this;
	};

	AyleUI.prototype._applyToolbarLayoutGeometry = function () {
		if (!this.Controls)
			return this;

		this.Controls.style.removeProperty('grid-template-columns');

		var i = 0;
		while (i < this._toolbarRenderedItems.length) {
			var entry = this._toolbarRenderedItems[i];
			if (entry.Element) {
				entry.Element.style.removeProperty('grid-column');
				entry.Element.style.removeProperty('grid-row');
			}
			i++;
		}

		if (!this.Element.classList.contains('ayle-controls-timeline-top'))
			return this;

		var columns = [];
		var column = 1;

		i = 0;
		while (i < this._toolbarRenderedItems.length) {
			var rendered = this._toolbarRenderedItems[i];
			var element = rendered.Element;

			if (!element || element.style.display === 'none') {
				i++;
				continue;
			}

			if (element === this.Timeline) {
				element.style.gridColumn = '1 / -1';
				element.style.gridRow = '1';
				i++;
				continue;
			}

			element.style.gridColumn = String(column);
			element.style.gridRow = '2';

			if (element.classList.contains('ayle-toolbar-spacer'))
				columns.push('minmax(0, 1fr)');
			else
				columns.push('max-content');

			column++;
			i++;
		}

		if (!columns.length)
			columns.push('minmax(0, 1fr)');

		this.Controls.style.gridTemplateColumns = columns.join(' ');
		return this;
	};

	AyleUI.prototype.UpdateTimelineRanges = function () {
		if (!this.Timeline)
			return this;

		if (!this.TimelineRanges) {
			this.TimelineRanges = document.createElement('div');
			this.TimelineRanges.className = 'ayle-timeline-ranges';
			this.Timeline.insertBefore(this.TimelineRanges, this.Buffered || this.Timeline.firstChild);
		}

		this.TimelineRanges.innerHTML = '';

		var ranges = this.Player.Options.Integration && this.Player.Options.Integration.TimelineRanges instanceof Array ?
			this.Player.Options.Integration.TimelineRanges : [];
		var i = 0;

		var duration = Number(this.Player.State.Duration) || 0;
		if (!duration)
			return this;

		i = 0;
		while (i < ranges.length) {
			var range = ranges[i] || {};
			var start = Math.max(0, Number(range.Start) || 0);
			var end = range.End !== undefined ?
				Number(range.End) :
				start + Math.max(0, Number(range.Duration) || 0);

			end = Math.min(duration, Math.max(start, end));

			if (end > start) {
				var visual = document.createElement('div');
				visual.className = 'ayle-timeline-range';

				if (range.ClassName)
					visual.className += ' ' + range.ClassName;

				if (range.ID)
					visual.setAttribute('data-ayle-range-id', String(range.ID));

				if (range.Label)
					visual.title = String(range.Label);

				visual.style.left = ((start / duration) * 100) + '%';
				visual.style.width = (((end - start) / duration) * 100) + '%';

				this.TimelineRanges.appendChild(visual);
			}

			i++;
		}

		return this;
	};

	AyleUI.prototype._mediaSessionMetadata = function () {
		var source = this.Player.State.Source || {};
		var integration = this.Player.Options.Integration || {};
		var override = this.Player.Options.MediaSession.Metadata || {};
		var integrationOverride = integration.MediaSession && integration.MediaSession.Metadata ?
			integration.MediaSession.Metadata : {};
		var channel = integration.Channel || {};
		var artwork = integrationOverride.Artwork || override.Artwork || null;

		if (!artwork) {
			var image = source.Cover || channel.Avatar || '';
			artwork = image ? [{ src: image }] : [];
		}

		return {
			title: integrationOverride.Title || override.Title || source.Title || '',
			artist: integrationOverride.Artist || override.Artist || source.Artist || channel.Name || '',
			album: integrationOverride.Album || override.Album || source.Album || '',
			artwork: artwork
		};
	};

	AyleUI.prototype.UpdateMediaSession = function () {
		if (!navigator.mediaSession || !this.Player.Options.MediaSession.Enabled)
			return this;

		var session = navigator.mediaSession;
		var state = this.Player.State;
		var metadata = this._mediaSessionMetadata();

		try {
			session.metadata = new MediaMetadata(metadata);
		}
		catch (error) {}

		try {
			session.playbackState = state.Playing ? 'playing' : 'paused';
		}
		catch (error) {}

		if (typeof session.setPositionState === 'function') {
			var duration = Number(state.Duration);
			var position = Number(state.Position);
			var rate = Number(state.PlaybackRate) || 1;

			try {
				if (isFinite(duration) && duration > 0) {
					session.setPositionState({
						duration: duration,
						playbackRate: rate,
						position: Math.max(0, Math.min(duration, isFinite(position) ? position : 0))
					});
				}
			}
			catch (error) {}
		}

		if (!this._mediaSessionActionsBound) {
			this._mediaSessionActionsBound = true;
			var self = this;
			var actions = {
				play: function () { self.Player.Play(); },
				pause: function () { self.Player.Pause(); },
				previoustrack: function () { self.Player.Previous(); },
				nexttrack: function () { self.Player.Next(); },
				stop: function () { self.Player.Pause(); self.Player.Seek(0); },
				seekbackward: function (details) {
					self.Player.Seek(Math.max(0, self.Player.State.Position - (details.seekOffset || 10)));
				},
				seekforward: function (details) {
					self.Player.Seek(Math.min(self.Player.State.Duration, self.Player.State.Position + (details.seekOffset || 10)));
				},
				seekto: function (details) {
					if (details.seekTime !== undefined)
						self.Player.Seek(details.seekTime);
				}
			};
			var name;
			for (name in actions) {
				try {
					session.setActionHandler(name, actions[name]);
				}
				catch (error) {}
			}
		}

		return this;
	};

	AyleUI.prototype.Focus = function () {
		if (
			this.Element &&
			document.documentElement.contains(this.Element)
		)
			this.Element.focus();

		return this;
	};

	AyleUI.prototype.AutoFocus = function () {
		var self = this;
		var done = false;

		var focus = function () {
			if (done)
				return;

			done = true;

			if (global.requestAnimationFrame)
				global.requestAnimationFrame(function () {
					self.Focus();
				});
			else
				setTimeout(function () {
					self.Focus();
				}, 0);
		};

		/*
		 * When AyleUI is created while the HTML document is still being
		 * parsed, focusing immediately can be lost as page initialization
		 * continues. Wait until DOMContentLoaded in that case.
		 */
		if (document.readyState === 'loading')
			this._listen(document, 'DOMContentLoaded', focus, { once: true });
		else
			focus();

		return this;
	};

	AyleUI.prototype._formatTime = function (seconds, forceHours) {
		if (!isFinite(seconds) || seconds < 0)
			seconds = 0;

		seconds = Math.floor(seconds);
		var hours = Math.floor(seconds / 3600);
		var minutes = Math.floor((seconds % 3600) / 60);
		var secs = seconds % 60;
		var result = '';

		if (hours || forceHours) {
			result += hours + ':';
			result += minutes < 10 ? '0' + minutes : minutes;
		}
		else {
			result += minutes;
		}

		result += ':';
		result += secs < 10 ? '0' + secs : secs;
		return result;
	};

	AyleUI.prototype._formatTimeForDuration = function (seconds, duration) {
		if (!isFinite(duration) || duration < 0)
			return this._formatTime(seconds);

		duration = Math.floor(duration);
		var forceHours = duration >= 3600;
		var formatted = this._formatTime(seconds, forceHours);
		var durationText = this._formatTime(duration);
		var targetWidth = durationText.indexOf(':');
		var separator = formatted.indexOf(':');

		if (targetWidth <= separator)
			return formatted;

		var padding = '';
		var i = separator;

		while (i < targetWidth) {
			padding += '0';
			i++;
		}

		return padding + formatted;
	};

	AyleUI.prototype._setLoadingVisible = function (visible) {
		visible = !!visible;

		if (this.Element)
			this.Element.classList.toggle('is-loading', visible);

		if (!this.Loading)
			return;

		this.Loading.classList.toggle('is-visible', visible);
		this.Loading.setAttribute('aria-hidden', visible ? 'false' : 'true');
	};

	AyleUI.prototype.UpdateLoading = function () {
		var self = this;

		if (!this.Loading)
			return;

		var visible = !!(
			this.Player.State.Loading ||
			this.Player.State.Buffering ||
			this.Player.State.Seeking
		);

		if (!visible) {
			if (this._loadingTimer) {
				clearTimeout(this._loadingTimer);
				this._loadingTimer = null;
			}

			this._setLoadingVisible(false);
			return;
		}

		/* Already visible: keep it visible without restarting the delay. */
		if (this.Loading.classList.contains('is-visible'))
			return;

		/*
		 * A not-yet-ready media load is initialization, not transient buffering.
		 * Show feedback immediately so Next/Previous and the first Load() never
		 * leave the UI looking idle while provider/metadata work is in progress.
		 */
		if (this.Player.State.Loading && !this.Player.State.Ready) {
			if (this._loadingTimer) {
				clearTimeout(this._loadingTimer);
				this._loadingTimer = null;
			}

			this._setLoadingVisible(true);
			return;
		}

		if (this._loadingTimer)
			return;

		var delay = this.Player.Options.LoadingDelay;

		if (!delay) {
			this._setLoadingVisible(true);
			return;
		}

		this._loadingTimer = setTimeout(function () {
			self._loadingTimer = null;

			if (
				self.Player.State.Loading ||
				self.Player.State.Buffering ||
				self.Player.State.Seeking
			)
				self._setLoadingVisible(true);
		}, delay);
	};


	AyleUI.prototype.ApplyLocalization = function () {
		var self = this;
		var textElements = this.Element.querySelectorAll('[data-ayle-i18n]');
		var labelElements = this.Element.querySelectorAll('[data-ayle-i18n-label]');
		var titleElements = this.Element.querySelectorAll('[data-ayle-i18n-title]');
		var i = 0;

		while (i < textElements.length) {
			var textKey = textElements[i].getAttribute('data-ayle-i18n');
			textElements[i].textContent = this.Player.Localize(textKey);
			i++;
		}

		i = 0;
		while (i < labelElements.length) {
			var labelKey = labelElements[i].getAttribute('data-ayle-i18n-label');
			var label = this.Player.Localize(labelKey);
			labelElements[i].setAttribute('aria-label', label);
			labelElements[i].setAttribute('title', label);
			i++;
		}

		i = 0;
		while (i < titleElements.length) {
			var titleKey = titleElements[i].getAttribute('data-ayle-i18n-title');
			titleElements[i].setAttribute('title', this.Player.Localize(titleKey));
			i++;
		}

		this.UpdatePlayButton();
		this.UpdateVolumeButton();
		this.UpdateFullscreenButton();
		this.UpdatePictureInPictureButton();
		this.UpdateQualityMenu();
		this.UpdateAudioMenu();
		this.UpdateSubtitleMenu();
	};

	AyleUI.prototype.StopPlaylistAutoAdvanceCountdown = function () {
		if (this._playlistAutoAdvanceFrame !== null) {
			if (global.cancelAnimationFrame)
				global.cancelAnimationFrame(this._playlistAutoAdvanceFrame);
			else
				clearTimeout(this._playlistAutoAdvanceFrame);

			this._playlistAutoAdvanceFrame = null;
		}

		if (this.CenterPlayButton)
			this.CenterPlayButton.classList.remove('is-auto-advance-pending');

		if (this.CenterPlayCountdown)
			this.CenterPlayCountdown.style.setProperty(
				'--ayle-auto-advance-angle',
				'0deg'
			);

		return this;
	};

	AyleUI.prototype.StartPlaylistAutoAdvanceCountdown = function (context) {
		this.StopPlaylistAutoAdvanceCountdown();

		if (
			!this.CenterPlayButton ||
			!this.CenterPlayCountdown ||
			!context ||
			!(context.Delay > 0)
		)
			return this;

		var delay = Number(context.Delay) || 0;
		var startedAt = Number(context.StartedAt) || Date.now();
		var self = this;

		this.CenterPlayButton.classList.add('is-auto-advance-pending');

		var render = function () {
			var elapsed = Math.max(0, Date.now() - startedAt);
			var progress = Math.max(0, Math.min(1, elapsed / delay));

			self.CenterPlayCountdown.style.setProperty(
				'--ayle-auto-advance-angle',
				(progress * 360) + 'deg'
			);

			if (progress >= 1) {
				self._playlistAutoAdvanceFrame = null;
				return;
			}

			if (global.requestAnimationFrame)
				self._playlistAutoAdvanceFrame =
					global.requestAnimationFrame(render);
			else
				self._playlistAutoAdvanceFrame =
					setTimeout(render, 16);
		};

		render();
		return this;
	};

	AyleUI.prototype.UpdatePlaylistButtons = function () {
		var count =
			this.Player.Playlist && this.Player.Playlist.Items ?
				this.Player.Playlist.Items.length : 0;
		var previousConfigured = false;
		var nextConfigured = false;
		var i = 0;

		while (i < this._toolbarRenderedItems.length) {
			var rendered = this._toolbarRenderedItems[i];

			if (rendered.Element === this.PreviousButton)
				previousConfigured = true;
			else if (rendered.Element === this.NextButton)
				nextConfigured = true;

			i++;
		}

		/*
		 * Keep playlist transport geometry stable. Once a non-empty Playlist
		 * exists, configured Previous/Next controls stay visible for every
		 * item and availability is expressed only through disabled state.
		 *
		 * Outside playlist mode ForceShow* still has a purpose: it can expose
		 * an otherwise unavailable configured control as disabled.
		 * Toolbar.Items remains authoritative and ForceShow never injects a
		 * missing control.
		 */
		var hasPlaylist = count > 0;
		var previousVisible =
			previousConfigured &&
			(
				hasPlaylist ||
				this.Player.Options.ForceShowPreviousButton
			);
		var nextVisible =
			nextConfigured &&
			(
				hasPlaylist ||
				this.Player.Options.ForceShowNextButton
			);

		if (this.PreviousButton) {
			this.PreviousButton.style.display = previousVisible ? '' : 'none';
			this.PreviousButton.disabled = !this.Player.HasPrevious();
		}

		if (this.NextButton) {
			this.NextButton.style.display = nextVisible ? '' : 'none';
			this.NextButton.disabled = !this.Player.HasNext();
		}

		return this;
	};

	AyleUI.prototype.UpdatePlayButton = function () {
		var playing = !!this.Player.State.Playing;
		var playable = this.Player.HasPlayableSource();

		this.Element.setAttribute(
			'data-ayle-source-state',
			playable ? 'ready' :
				(this.Player.State.Error ? 'error' :
					(this.Player.State.Loading ? 'loading' : 'empty'))
		);

		if (this.PlayButton) {
			this.PlayButton.disabled = !playable;
			this.PlayButton.classList.toggle('is-playing', playing);
			var playLabel = this.Player.Localize(playing ? 'pause' : 'play');
			this.PlayButton.setAttribute('aria-label', playLabel);
			this.PlayButton.setAttribute('title', playLabel);
		}

		if (this.CenterPlayButton) {
			this.CenterPlayButton.disabled = !playable;
			this.CenterPlayButton.classList.toggle('is-playing', playing);
			var centerPlayLabel = this.Player.Localize(playing ? 'pause' : 'play');
			this.CenterPlayButton.setAttribute('aria-label', centerPlayLabel);
			this.CenterPlayButton.setAttribute('title', centerPlayLabel);
			this.CenterPlayButton.style.display = this.Player.Options.ShowCenterPlayButton ? '' : 'none';
		}
	};


	AyleUI.prototype.UpdateVolumeSlider = function () {
		if (!this.Volume)
			return;

		var value = Math.max(
			0,
			Math.min(100, Number(this.Volume.value) || 0)
		);

		this.Volume.style.setProperty(
			'--ayle-volume-percent',
			value + '%'
		);
	};

	AyleUI.prototype.UpdateVolumeButton = function () {
		if (!this.Mute)
			return;

		var muted = !!this.Player.State.Muted || this.Player.State.Volume <= 0;
		this.Mute.classList.toggle('is-muted', muted);
		this.Mute.setAttribute('aria-pressed', muted ? 'true' : 'false');
		var muteLabel = this.Player.Localize(muted ? 'unmute' : 'mute');
		this.Mute.setAttribute('aria-label', muteLabel);
		this.Mute.setAttribute('title', muteLabel);
	};

	AyleUI.prototype.UpdateFullscreenButton = function () {
		if (!this.Fullscreen)
			return;

		var active = document.fullscreenElement === this.Element;
		this.Fullscreen.classList.toggle('is-fullscreen', active);
		this.Fullscreen.setAttribute('aria-pressed', active ? 'true' : 'false');
		var fullscreenLabel = this.Player.Localize(active ? 'exitFullscreen' : 'enterFullscreen');
		this.Fullscreen.setAttribute('aria-label', fullscreenLabel);
		this.Fullscreen.setAttribute('title', fullscreenLabel);
	};

	AyleUI.prototype.UpdatePictureInPictureButton = function () {
		if (!this.PictureInPicture)
			return;

		var video = this.Player && this.Player.Driver ? this.Player.Driver.Element : null;
		var active = !!video && document.pictureInPictureElement === video;
		this.PictureInPicture.classList.toggle('is-active', active);
		this.PictureInPicture.setAttribute('aria-pressed', active ? 'true' : 'false');
		var pipLabel = this.Player.Localize(active ? 'exitPictureInPicture' : 'pictureInPicture');
		this.PictureInPicture.setAttribute('aria-label', pipLabel);
		this.PictureInPicture.setAttribute('title', pipLabel);
	};

	AyleUI.prototype._setSelectFieldVisible = function (select, visible) {
		if (!select)
			return;

		select.style.display = '';
		var field = select.parentNode;
		if (field && field.classList && field.classList.contains('ayle-field'))
			field.style.display = visible ? '' : 'none';
		else
			select.style.display = visible ? '' : 'none';
	};



	AyleUI.prototype.GetEffectiveSettingsOrder = function () {
		var source = this.Player.Options.SettingsOrder instanceof Array ?
			this.Player.Options.SettingsOrder : [];
		var result = [];
		var audio = this.Player.State.MediaMode === 'audio';
		var i = 0;

		while (i < source.length) {
			var name = source[i] === '' ? '' : String(source[i] || '');

			/* PiP has no useful visual target in pure audio mode. */
			if (
				audio &&
				(
					name === 'nativeSubtitles' ||
					name === 'nativeSubtitlesInPiP'
				)
			) {
				i++;
				continue;
			}

			result.push(name);
			i++;
		}

		return AyleNormalizeSettingsOrder(result);
	};


	AyleUI.prototype.CleanupSettingsSeparators = function () {
		if (!this.SettingsMainPage)
			return;

		var children = this.SettingsMainPage.children;
		var visibleRealBefore = false;
		var pendingSeparators = [];
		var i = 0;

		while (i < children.length) {
			var node = children[i];
			var separator = node.classList &&
				node.classList.contains('ayle-settings-order-separator');
			var hidden = false;

			if (!separator) {
				hidden =
					node.classList.contains('is-settings-order-hidden') ||
					node.style.display === 'none' ||
					global.getComputedStyle(node).display === 'none';
			}

			if (separator) {
				node.style.display = 'none';
				pendingSeparators.push(node);
			}
			else if (!hidden) {
				/* Materialize exactly one separator only when it has a visible
				 * real item on both sides. */
				if (visibleRealBefore && pendingSeparators.length)
					pendingSeparators[0].style.display = '';

				pendingSeparators = [];
				visibleRealBefore = true;
			}

			i++;
		}

		/* Any pending separators at EOF stay hidden: they are trailing. */
	};

	AyleUI.prototype.ApplySettingsOrder = function () {
		if (!this.SettingsMainPage)
			return;

		var order = this.GetEffectiveSettingsOrder();
		var items = this.SettingsMainPage.querySelectorAll('[data-ayle-settings-item]');
		var map = {};
		var i = 0;

		/* Remove old generated separators and hide every known item first.
		 * Only keys explicitly present in SettingsOrder become visible. */
		var separators = this.SettingsMainPage.querySelectorAll('.ayle-settings-order-separator');
		while (i < separators.length) {
			if (separators[i].parentNode)
				separators[i].parentNode.removeChild(separators[i]);
			i++;
		}

		i = 0;
		while (i < items.length) {
			var key = items[i].getAttribute('data-ayle-settings-item');

			if (key)
				map[key] = items[i];

			items[i].classList.add('is-settings-order-hidden');
			items[i].style.order = '';
			i++;
		}

		i = 0;
		while (i < order.length) {
			var name = order[i] === '' ? '' : String(order[i] || '');

			if (name === '') {
				var separator = document.createElement('div');
				separator.className = 'ayle-settings-order-separator';
				separator.setAttribute('aria-hidden', 'true');
				this.SettingsMainPage.appendChild(separator);
			}
			else if (map[name]) {
				map[name].classList.remove('is-settings-order-hidden');
				this.SettingsMainPage.appendChild(map[name]);
			}

			i++;
		}

		this.CleanupSettingsSeparators();

		/* If the currently open submenu is no longer present in SettingsOrder,
		 * return to the main Settings page. */
		if (this.SettingsPopover) {
			var activePage = this.SettingsPopover.querySelector('.ayle-settings-page.is-active');
			var activeName = activePage ? activePage.getAttribute('data-settings-page') : 'main';

			if (
				activeName !== 'main' &&
				(
					(activeName === 'debug' && order.indexOf('debug') === -1) ||
					(activeName === 'shortcuts' && order.indexOf('shortcuts') === -1) ||
					(activeName === 'audio' && order.indexOf('audio') === -1) ||
					(activeName === 'subtitles' && order.indexOf('subtitles') === -1)
				)
			)
				this.OpenSettingsPage('main');
		}
	};


	AyleUI.prototype.UpdateSettingsVisibility = function () {
		if (!this.SettingsControl)
			return;

		var hasAudio = !!(this.Player.State.AudioTracks && this.Player.State.AudioTracks.length > 1);
		var hasSubtitles = !!(this.Player.State.SubtitleTracks && this.Player.State.SubtitleTracks.length);
		var hasSubtitleSettings = !!(this.NativeSubtitlesToggle || this.AutoNativeSubtitlesInPictureInPictureToggle);
		var order = this.GetEffectiveSettingsOrder();
		var integrationSettings = this.Player.Options.Integration && this.Player.Options.Integration.Settings;
		var hasIntegrationSettings = !!(integrationSettings && integrationSettings.length && order.indexOf('integration') !== -1);
		var hasPlaybackSettings = !!(this.AutoPlayToggle && order.indexOf('autoplay') !== -1);
		var hasDebugSettings = !!(this.DebugSubmenuButton && order.indexOf('debug') !== -1);
		var hasShortcutsSettings = !!(this.ShortcutsSubmenuButton && order.indexOf('shortcuts') !== -1);
		var visible = (
			(hasAudio && order.indexOf('audio') !== -1) ||
			(hasSubtitles && order.indexOf('subtitles') !== -1) ||
			(hasSubtitleSettings && (
				order.indexOf('nativeSubtitles') !== -1 ||
				order.indexOf('nativeSubtitlesInPiP') !== -1
			)) ||
			hasPlaybackSettings ||
			hasDebugSettings ||
			hasShortcutsSettings ||
			hasIntegrationSettings
		);

		this.SettingsControl.style.display = visible ? '' : 'none';
		this.CleanupSettingsSeparators();
	};

	AyleUI.prototype._closePopovers = function (except) {
		var pairs = [
			[this.ChaptersPopover, this.ChaptersButton],
			[this.QualityPopover, this.QualityButton],
			[this.SettingsPopover, this.SettingsButton]
		];
		var i = 0;

		while (i < pairs.length) {
			var popover = pairs[i][0];
			var button = pairs[i][1];
			if (popover && popover !== except) {
				popover.classList.remove('is-open');
				if (button)
					button.setAttribute('aria-expanded', 'false');
			}
			i++;
		}

		i = 0;
		while (i < this._toolbarCustomMenus.length) {
			var custom = this._toolbarCustomMenus[i];

			if (custom.Popover && custom.Popover !== except) {
				custom.Popover.classList.remove('is-open');
				if (custom.Button)
					custom.Button.setAttribute('aria-expanded', 'false');
			}

			i++;
		}
	};



	AyleUI.prototype._settingsPages = function () {
		if (!this.SettingsPopover)
			return [];

		return this.SettingsPopover.querySelectorAll('.ayle-settings-page');
	};

	AyleUI.prototype.OpenSettingsPage = function (name) {
		var pages = this._settingsPages();
		if (!pages || !pages.length)
			return;

		name = name || 'main';
		var i = 0;
		var found = false;

		while (i < pages.length) {
			var page = pages[i];
			var active = page.getAttribute('data-settings-page') === name;
			page.classList.toggle('is-active', active);

			if (active)
				found = true;

			i++;
		}

		if (!found && name !== 'main') {
			this.OpenSettingsPage('main');
			return;
		}

		this.SettingsPages = pages;

		if (this.SettingsPopover) {
			this.SettingsPopover.setAttribute('data-settings-page', found ? name : 'main');

			if (this.SettingsPopover.classList.contains('is-open'))
				this.UpdatePopoverBounds(this.SettingsPopover);
		}
	};

	AyleUI.prototype.OpenSettingsSubmenu = function (name) {
		this.OpenSettingsPage(name);
	};

	AyleUI.prototype.CloseSettingsSubmenu = function () {
		if (!this.SettingsPopover) {
			this.OpenSettingsPage('main');
			return;
		}

		var currentName = this.SettingsPopover.getAttribute('data-settings-page') || 'main';
		var current = this.SettingsPopover.querySelector('.ayle-settings-page[data-settings-page="' + currentName + '"]');
		var parent = current ? current.getAttribute('data-settings-parent') : null;

		this.OpenSettingsPage(parent || 'main');
	};

	AyleUI.prototype._settingsItemID = function (item, path, index) {
		if (item && item.ID !== undefined && item.ID !== null && item.ID !== '')
			return String(item.ID);

		return 'integration-' + path + '-' + index;
	};

	AyleUI.prototype._settingsItemValue = function (item) {
		if (!item)
			return '';

		if (typeof item.Value === 'function')
			return item.Value(item, this.Player, this);

		if (item.Value === undefined || item.Value === null)
			return '';

		return String(item.Value);
	};

	AyleUI.prototype._executeIntegrationSetting = function (item, event) {
		if (!item)
			return;

		var result;

		if (typeof item.Action === 'function')
			result = item.Action(item, this.Player, this, event);
		else if (typeof item.OnSelect === 'function')
			result = item.OnSelect(item, this.Player, this, event);
		else if (item.Event) {
			this.Player.Emit('settingsAction:' + item.Event, {
				Item: item,
				Event: event,
				UI: this
			});
			result = true;
		}
		else {
			this.Player.Emit('settingsAction', {
				Item: item,
				Event: event,
				UI: this
			});
			result = true;
		}

		this.Player.Emit('integrationSettingsAction', {
			Item: item,
			Event: event,
			Result: result,
			UI: this
		});

		this.Player.Emit('settingsChange', {
			Name: item.ID || item.Title || item.Label || 'Integration',
			Value: item.Value !== undefined ? item.Value : null,
			Item: item,
			Event: event,
			UI: this,
			Result: result
		});

		return result;
	};

	AyleUI.prototype._createIntegrationSettingsItem = function (item, parentPage, path, index) {
		var self = this;
		var id = this._settingsItemID(item, path, index);
		var hasItems = !!(item && item.Items instanceof Array);
		var button = document.createElement('button');
		button.type = 'button';
		button.className = 'ayle-settings-submenu-item ayle-integration-settings-item';
		button.setAttribute('data-integration-setting-id', id);

		var label = document.createElement('span');
		label.className = 'ayle-settings-submenu-label';
		label.textContent = item && (item.Title || item.Label) ? (item.Title || item.Label) : id;
		button.appendChild(label);

		var value = document.createElement('span');
		value.className = 'ayle-settings-submenu-value';
		value.textContent = this._settingsItemValue(item);
		button.appendChild(value);

		if (hasItems) {
			button.classList.add('has-submenu');

			var arrow = document.createElement('span');
			arrow.className = 'ayle-settings-submenu-arrow';
			arrow.setAttribute('aria-hidden', 'true');
			arrow.textContent = '\u203a';
			button.appendChild(arrow);
		}

		if (item && item.Disabled) {
			button.disabled = true;
			button.classList.add('is-disabled');
		}

		if (hasItems) {
			var pageName = 'integration:' + path + ':' + id;
			button.setAttribute('data-settings-target', pageName);
			button.onclick = function (event) {
				event.stopPropagation();
				self.OpenSettingsSubmenu(pageName);
			};

			this._createIntegrationSettingsPage(item, pageName, parentPage, path + '-' + id);
		}
		else {
			button.onclick = function (event) {
				event.stopPropagation();
				self._executeIntegrationSetting(item, event);

				if (!item || item.CloseMenu !== false)
					self._closePopovers();
			};
		}

		return button;
	};

	AyleUI.prototype._createIntegrationSettingsPage = function (item, pageName, parentPage, path) {
		if (!this.SettingsPopover)
			return;

		var self = this;
		var page = document.createElement('div');
		page.className = 'ayle-settings-page ayle-integration-settings-page';
		page.setAttribute('data-settings-page', pageName);
		page.setAttribute('data-settings-parent', parentPage || 'main');

		var header = document.createElement('div');
		header.className = 'ayle-settings-submenu-header';

		var back = document.createElement('button');
		back.type = 'button';
		back.className = 'ayle-settings-back';
		var backLabel = this.Player.Localize('back');
		back.setAttribute('aria-label', backLabel);
		back.setAttribute('title', backLabel);
		back.textContent = '\u2039';
		back.onclick = function (event) {
			event.stopPropagation();
			self.CloseSettingsSubmenu();
		};

		var title = document.createElement('div');
		title.className = 'ayle-settings-submenu-title';
		title.textContent = item && (item.Title || item.Label) ? (item.Title || item.Label) : '';

		header.appendChild(back);
		header.appendChild(title);
		page.appendChild(header);

		var section = document.createElement('div');
		section.className = 'ayle-settings-section ayle-integration-settings-page-list';

		var items = item && item.Items instanceof Array ? item.Items : [];
		var i = 0;
		while (i < items.length) {
			section.appendChild(this._createIntegrationSettingsItem(items[i], pageName, path, i));
			i++;
		}

		page.appendChild(section);
		this.SettingsPopover.appendChild(page);
	};

	AyleUI.prototype.UpdateIntegrationSettings = function () {
		if (!this.SettingsPopover)
			return;

		var oldPages = this.SettingsPopover.querySelectorAll('.ayle-integration-settings-page');
		var i = oldPages.length - 1;
		while (i >= 0) {
			if (oldPages[i].parentNode)
				oldPages[i].parentNode.removeChild(oldPages[i]);
			i--;
		}

		var settings = this.Player.Options.Integration && this.Player.Options.Integration.Settings instanceof Array ?
			this.Player.Options.Integration.Settings : [];

		if (this.IntegrationSettingsList)
			this.IntegrationSettingsList.innerHTML = '';

		if (this.IntegrationSettingsSection)
			this.IntegrationSettingsSection.style.display = settings.length ? '' : 'none';

		i = 0;
		while (i < settings.length) {
			if (this.IntegrationSettingsList)
				this.IntegrationSettingsList.appendChild(this._createIntegrationSettingsItem(settings[i], 'main', 'root', i));
			i++;
		}

		this.SettingsPages = this._settingsPages();
		this.SettingsBackButtons = this.SettingsPopover.querySelectorAll('.ayle-settings-back');
		this.ApplySettingsOrder();
		this.UpdateSettingsVisibility();

		var current = this.SettingsPopover.getAttribute('data-settings-page') || 'main';
		if (!this.SettingsPopover.querySelector('.ayle-settings-page[data-settings-page="' + current + '"]'))
			this.OpenSettingsPage('main');
	};



	AyleUI.prototype.UpdatePopoverHorizontalBounds = function (popover) {
		if (!popover || !this.Element)
			return;

		popover.style.transform = '';

		if (!this.Element.classList.contains('ayle-controls-narrow'))
			return;

		var wasOpen = popover.classList.contains('is-open');
		var oldVisibility = popover.style.visibility;
		var oldDisplay = popover.style.display;

		if (!wasOpen) {
			popover.style.visibility = 'hidden';
			popover.style.display = 'block';
		}

		var playerRect = this.Element.getBoundingClientRect();
		var padding = 8;
		var availableWidth = Math.max(0, playerRect.width - padding * 2);

		/*
		 * The menu must fit the actual Player, not the viewport. This matters
		 * when Ayle is embedded in a narrow column/card on a wide desktop.
		 * Wide menu contents remain reachable through horizontal scrolling.
		 */
		popover.style.maxWidth = Math.floor(availableWidth) + 'px';

		if (popover.scrollWidth > availableWidth)
			popover.style.width = Math.floor(availableWidth) + 'px';
		else
			popover.style.width = '';

		var popoverRect = popover.getBoundingClientRect();
		var shift = 0;

		if (popoverRect.left < playerRect.left + padding)
			shift += playerRect.left + padding - popoverRect.left;

		if (popoverRect.right + shift > playerRect.right - padding)
			shift -= popoverRect.right + shift - (playerRect.right - padding);

		if (shift)
			popover.style.transform = 'translateX(' + Math.round(shift) + 'px)';

		if (!wasOpen) {
			popover.style.display = oldDisplay;
			popover.style.visibility = oldVisibility;
		}
	};

	AyleUI.prototype.UpdatePopoverBounds = function (popover) {
		if (!popover || !this.Element)
			return;

		var container = popover.parentNode;
		if (!container || !container.getBoundingClientRect)
			return;

		var containerRect = container.getBoundingClientRect();
		var viewportHeight =
			window.innerHeight ||
			document.documentElement.clientHeight ||
			0;

		var gap = 8;
		var padding = 8;

		popover.classList.remove('ayle-popover-top');
		popover.classList.remove('ayle-popover-bottom');

		var topSpace = Math.max(0, containerRect.top - padding);
		var bottomSpace = Math.max(0, viewportHeight - containerRect.bottom - padding);

		/* Measure desired height without permanently changing visibility. */
		var wasOpen = popover.classList.contains('is-open');
		var oldVisibility = popover.style.visibility;
		var oldDisplay = popover.style.display;

		if (!wasOpen) {
			popover.style.visibility = 'hidden';
			popover.style.display = 'block';
		}

		var desiredHeight = popover.scrollHeight || 0;

		if (!wasOpen) {
			popover.style.display = oldDisplay;
			popover.style.visibility = oldVisibility;
		}

		var placeTop =
			topSpace >= desiredHeight + gap ||
			(topSpace >= bottomSpace && topSpace > 80);

		var available = (placeTop ? topSpace : bottomSpace) - gap;

		if (available < 80)
			available = 80;

		popover.classList.add(
			placeTop ? 'ayle-popover-top' : 'ayle-popover-bottom'
		);

		popover.style.maxHeight = Math.floor(available) + 'px';
		popover.setAttribute(
			'data-ayle-popover-position',
			placeTop ? 'top' : 'bottom'
		);

		this.UpdatePopoverHorizontalBounds(popover);
	};

	AyleUI.prototype._togglePopover = function (popover, button) {
		if (!popover || !button)
			return;

		var open = !popover.classList.contains('is-open');
		this._closePopovers(popover);

		if (open) {
			if (popover === this.SettingsPopover)
				this.OpenSettingsPage('main');

			this.UpdatePopoverBounds(popover);
		}

		popover.classList.toggle('is-open', open);
		button.setAttribute('aria-expanded', open ? 'true' : 'false');

		if (open)
			this.ShowControls();
	};


	AyleUI.prototype._hintID = function (hint, index) {
		return this.Player._hintID(hint, index);
	};

	AyleUI.prototype._hintActions = function (hint) {
		if (hint.Actions instanceof Array)
			return hint.Actions;

		if (hint.Action)
			return [hint.Action];

		return [];
	};


	AyleUI.prototype._hintSafeAreaPadding = function () {
		var area = this.Player.Options.HintSafeArea || {};

		return {
			Top: Math.max(0, Number(area.Top) || 0),
			Right: Math.max(0, Number(area.Right) || 0),
			Bottom: Math.max(0, Number(area.Bottom) || 0),
			Left: Math.max(0, Number(area.Left) || 0)
		};
	};

	AyleUI.prototype.ScheduleSafeAreaUpdate = function () {
		var self = this;

		if (this._safeAreaFrame !== null)
			return;

		this._safeAreaFrame = global.requestAnimationFrame(function () {
			self._safeAreaFrame = null;
			self.UpdateSafeArea();
		});
	};

	AyleUI.prototype.UpdateSafeArea = function () {
		if (!this.Element)
			return;

		var playerRect = this.Element.getBoundingClientRect();
		var padding = this._hintSafeAreaPadding();
		var topOccupied = 0;
		var rightOccupied = 0;
		var bottomOccupied = 0;
		var leftOccupied = 0;
		var rect;

		if (this.Header && this.Header.offsetParent !== null) {
			rect = this.Header.getBoundingClientRect();

			if (rect.width > 0 && rect.height > 0)
				topOccupied = Math.max(0, Math.min(playerRect.height, rect.bottom - playerRect.top));
		}

		if (this.Controls && this.Controls.offsetParent !== null) {
			rect = this.Controls.getBoundingClientRect();

			if (rect.width > 0 && rect.height > 0)
				bottomOccupied = Math.max(0, Math.min(playerRect.height, playerRect.bottom - rect.top));
		}

		var top = Math.min(playerRect.height, topOccupied + padding.Top);
		var right = Math.min(playerRect.width, rightOccupied + padding.Right);
		var bottom = Math.min(playerRect.height, bottomOccupied + padding.Bottom);
		var left = Math.min(playerRect.width, leftOccupied + padding.Left);

		var usableWidth = Math.max(0, playerRect.width - left - right);
		var usableHeight = Math.max(0, playerRect.height - top - bottom);
		var centerX = left + usableWidth / 2;
		var centerY = top + usableHeight / 2;

		this.Element.style.setProperty('--ayle-hint-safe-top', top + 'px');
		this.Element.style.setProperty('--ayle-hint-safe-right', right + 'px');
		this.Element.style.setProperty('--ayle-hint-safe-bottom', bottom + 'px');
		this.Element.style.setProperty('--ayle-hint-safe-left', left + 'px');
		this.Element.style.setProperty('--ayle-hint-safe-center-x', centerX + 'px');
		this.Element.style.setProperty('--ayle-hint-safe-center-y', centerY + 'px');
	};

	AyleUI.prototype._bindSafeArea = function () {
		var self = this;

		this._safeAreaResizeHandler = function () {
			self.UpdateControlLayoutMode();
			self.ScheduleSafeAreaUpdate();

			if (self.SettingsPopover && self.SettingsPopover.classList.contains('is-open'))
				self.UpdatePopoverBounds(self.SettingsPopover);
		};

		this._safeAreaScrollHandler = function () {
			if (self.SettingsPopover && self.SettingsPopover.classList.contains('is-open'))
				self.UpdatePopoverBounds(self.SettingsPopover);
		};

		this._listen(global, 'resize', this._safeAreaResizeHandler);
		this._listen(global, 'scroll', this._safeAreaScrollHandler, true);

		if (typeof ResizeObserver !== 'undefined') {
			this._safeAreaObserver = new ResizeObserver(function () {
				self.UpdateControlLayoutMode();
				self.ScheduleSafeAreaUpdate();
			});

			this._safeAreaObserver.observe(this.Element);

			if (this.Header)
				this._safeAreaObserver.observe(this.Header);

			if (this.Controls)
				this._safeAreaObserver.observe(this.Controls);
		}

		this.ScheduleSafeAreaUpdate();
	};

	AyleUI.prototype._normalizeHintPosition = function (position) {
		position = String(position || 'top-right').toLowerCase();

		var positions = {
			'top-left': true,
			'top-center': true,
			'top-right': true,
			'top-right-corner': true,
			'center-left': true,
			'center': true,
			'center-right': true,
			'bottom-left': true,
			'bottom-center': true,
			'bottom-right': true
		};

		return positions[position] ? position : 'top-right';
	};

	AyleUI.prototype._applyHintPosition = function (hint, element) {
		var position = this._normalizeHintPosition(hint.Position);
		var offset = hint.Offset || {};
		var x = Number(offset.X) || 0;
		var y = Number(offset.Y) || 0;

		element.setAttribute('data-hint-position', position);
		element.style.setProperty('--ayle-hint-offset-x', x + 'px');
		element.style.setProperty('--ayle-hint-offset-y', y + 'px');
	};


	AyleUI.prototype.ExecuteHintAction = function (hint, action, event, options) {
		options = options || {};

		var hints = this.Player.Options.Integration && this.Player.Options.Integration.Hints instanceof Array ?
			this.Player.Options.Integration.Hints : [];
		var index = hints.indexOf(hint);
		var id = this._hintID(hint, index < 0 ? 0 : index);
		var resume = !!(
			hint &&
			hint.ResumeOnAction &&
			this._hintPausedPlayback[id]
		);

		var result = this.Player.ExecuteHintAction(hint, action, event);
		var hideDelay = Math.max(0, Number(options.HideDelay) || 0);

		if (hint.HideOnAction !== false) {
			if (hideDelay) {
				var self = this;
				setTimeout(function () {
					/*
					 * It may already have disappeared because playback left the
					 * active interval. DismissHint is harmless in that case.
					 */
					self.DismissHint(hint);
				}, hideDelay);
			}
			else
				this.DismissHint(hint);
		}

		if (resume) {
			delete this._hintPausedPlayback[id];
			this.Player.Play();
			this.Player.Emit('hintResume', {
				Hint: hint,
				Action: action,
				Event: event
			});
		}

		return result;
	};

	AyleUI.prototype._registerBuiltInHintRenderer = function (type, renderer) {
		if (!this.Player.HasHintRenderer(type))
			this.Player.RegisterHintRenderer(type, renderer);
	};

	AyleUI.prototype._registerBuiltInHintRenderers = function () {
		var self = this;

		this._registerBuiltInHintRenderer('info', function (hint, element) {
			self._renderNoticeHint(hint, element, 'info', 'i');
		});

		this._registerBuiltInHintRenderer('correction', function (hint, element) {
			self._renderNoticeHint(hint, element, 'correction', '\u270e');
		});

		this._registerBuiltInHintRenderer('warning', function (hint, element) {
			self._renderNoticeHint(hint, element, 'warning', '!');
		});

		this._registerBuiltInHintRenderer('source', function (hint, element) {
			self._renderNoticeHint(hint, element, 'source', '\u2197');
		});

		this._registerBuiltInHintRenderer('link', function (hint, element) {
			self._renderLinkHint(hint, element);
		});

		this._registerBuiltInHintRenderer('definition', function (hint, element) {
			self._renderDefinitionHint(hint, element);
		});

		this._registerBuiltInHintRenderer('card', function (hint, element) {
			self._renderCardHint(hint, element, 'card');
		});

		this._registerBuiltInHintRenderer('media', function (hint, element) {
			self._renderCardHint(hint, element, 'media');
		});

		this._registerBuiltInHintRenderer('product', function (hint, element) {
			self._renderCardHint(hint, element, 'product');
		});

		this._registerBuiltInHintRenderer('action', function (hint, element) {
			self._renderActionHint(hint, element, 'action', '\u26a1');
		});

		this._registerBuiltInHintRenderer('cta', function (hint, element) {
			self._renderActionHint(hint, element, 'cta', '\u2605');
		});

		this._registerBuiltInHintRenderer('navigation', function (hint, element) {
			self._renderNavigationHint(hint, element);
		});

		this._registerBuiltInHintRenderer('poll', function (hint, element) {
			self._renderChoiceHint(hint, element, 'poll', false);
		});

		this._registerBuiltInHintRenderer('quiz', function (hint, element) {
			self._renderQuizHint(hint, element);
		});

		this._registerBuiltInHintRenderer('tutorial', function (hint, element) {
			self._renderTutorialHint(hint, element);
		});

		this._registerBuiltInHintRenderer('share', function (hint, element) {
			self._renderActionHint(hint, element, 'share', '\u2197');
		});

		this._registerBuiltInHintRenderer('rating', function (hint, element) {
			self._renderChoiceHint(hint, element, 'rating', false);
		});
	};

	AyleUI.prototype._prepareHintElement = function (hint, element, type) {
		element.innerHTML = '';
		element.className = 'ayle-hint ayle-hint-type-' + type;
		element.setAttribute('data-ayle-hint-type', type);
		return element;
	};

	AyleUI.prototype._appendHintIcon = function (body, icon) {
		if (!icon)
			return null;

		var element = document.createElement('span');
		element.className = 'ayle-hint-icon';
		element.setAttribute('aria-hidden', 'true');
		element.textContent = icon;
		body.appendChild(element);
		return element;
	};

	AyleUI.prototype._appendHintHeading = function (hint, body, icon, titleClass) {
		if (!icon && !hint.Title)
			return null;

		var heading = document.createElement('div');
		heading.className = 'ayle-hint-heading';

		if (icon) {
			var iconElement = document.createElement('span');
			iconElement.className = 'ayle-hint-icon';
			iconElement.setAttribute('aria-hidden', 'true');
			iconElement.textContent = icon;
			heading.appendChild(iconElement);
		}

		if (hint.Title) {
			var title = document.createElement('div');
			title.className = titleClass || 'ayle-hint-title';
			title.textContent = hint.Title;
			heading.appendChild(title);
		}

		body.appendChild(heading);
		return heading;
	};

	AyleUI.prototype._appendHintDescription = function (hint, body) {
		if (!hint.Text)
			return null;

		var text = document.createElement('div');
		text.className = 'ayle-hint-text';
		text.textContent = hint.Text;
		body.appendChild(text);
		return text;
	};

	AyleUI.prototype._appendHintImage = function (hint, element) {
		if (!hint.Image)
			return null;

		var image = document.createElement('img');
		image.className = 'ayle-hint-image';
		image.src = hint.Image;
		image.alt = hint.Title || '';
		element.appendChild(image);
		return image;
	};

	AyleUI.prototype._createHintBody = function () {
		var body = document.createElement('div');
		body.className = 'ayle-hint-body';
		return body;
	};

	AyleUI.prototype._appendHintText = function (hint, body, titleClass) {
		if (hint.Title) {
			var title = document.createElement('div');
			title.className = titleClass || 'ayle-hint-title';
			title.textContent = hint.Title;
			body.appendChild(title);
		}

		if (hint.Text) {
			var text = document.createElement('div');
			text.className = 'ayle-hint-text';
			text.textContent = hint.Text;
			body.appendChild(text);
		}
	};

	AyleUI.prototype._appendHintClose = function (hint, element) {
		if (hint.Dismissible === false)
			return null;

		var self = this;
		var close = document.createElement('button');
		close.type = 'button';
		close.className = 'ayle-hint-close';
		var dismissLabel = this.Player.Localize('dismiss');
		close.setAttribute('aria-label', dismissLabel);
		close.title = dismissLabel;
		close.textContent = '\u00d7';
		close.onclick = function (event) {
			event.stopPropagation();
			self.DismissHint(hint);
		};
		element.appendChild(close);
		return close;
	};

	AyleUI.prototype._appendHintActions = function (hint, body, className) {
		var self = this;
		var actions = this._hintActions(hint);

		if (!actions.length)
			return null;

		var actionsElement = document.createElement('div');
		actionsElement.className = className || 'ayle-hint-actions';

		var i = 0;
		while (i < actions.length) {
			(function (action) {
				var button = document.createElement('button');
				button.type = 'button';
				button.className = 'ayle-hint-action';
				button.textContent = action.Title || action.Label || action.Name || action.Type || self.Player.Localize('open');

				button.onclick = function (event) {
					event.stopPropagation();
					self.ExecuteHintAction(hint, action, event);
				};

				actionsElement.appendChild(button);
			})(actions[i]);

			i++;
		}

		body.appendChild(actionsElement);
		return actionsElement;
	};

	AyleUI.prototype._renderNoticeHint = function (hint, element, type, icon) {
		this._prepareHintElement(hint, element, type);

		var body = this._createHintBody();
		this._appendHintHeading(hint, body, icon);
		this._appendHintDescription(hint, body);
		this._appendHintActions(hint, body);
		element.appendChild(body);
		this._appendHintClose(hint, element);
	};

	AyleUI.prototype._renderLinkHint = function (hint, element) {
		var self = this;
		this._prepareHintElement(hint, element, 'link');

		var link = document.createElement('a');
		link.className = 'ayle-hint-link';
		link.href = hint.URL || '#';
		link.target = hint.Target || '_blank';

		if (link.target === '_blank')
			link.rel = 'noopener noreferrer';

		var label = document.createElement('span');
		label.className = 'ayle-hint-link-label';
		label.textContent = hint.Label || hint.Title || hint.Text || this.Player.Localize('open');
		link.appendChild(label);

		var icon = document.createElement('span');
		icon.className = 'ayle-hint-link-icon';
		icon.setAttribute('aria-hidden', 'true');
		icon.textContent = '\u2197';
		link.appendChild(icon);

		link.onclick = function (event) {
			if (!hint.URL) {
				event.preventDefault();
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			self.ExecuteHintAction(
				hint,
				{ Type: 'url', URL: hint.URL, Target: hint.Target || '_blank' },
				event
			);
		};

		element.appendChild(link);

		this._appendHintClose(hint, element);
	};

	AyleUI.prototype._renderDefinitionHint = function (hint, element) {
		this._prepareHintElement(hint, element, 'definition');

		var body = this._createHintBody();
		this._appendHintHeading(hint, body, 'Aa', 'ayle-hint-title ayle-hint-definition-term');
		this._appendHintDescription(hint, body);
		this._appendHintActions(hint, body);
		element.appendChild(body);
		this._appendHintClose(hint, element);
	};

	AyleUI.prototype._renderCardHint = function (hint, element, type) {
		this._prepareHintElement(hint, element, type);
		this._appendHintImage(hint, element);

		var body = this._createHintBody();
		this._appendHintText(hint, body);
		this._appendHintActions(hint, body, 'ayle-hint-actions ayle-hint-card-actions');
		element.appendChild(body);
		this._appendHintClose(hint, element);
	};

	AyleUI.prototype._renderActionHint = function (hint, element, type, icon) {
		this._prepareHintElement(hint, element, type);

		var body = this._createHintBody();
		this._appendHintHeading(hint, body, icon);
		this._appendHintDescription(hint, body);
		this._appendHintActions(hint, body, 'ayle-hint-actions ayle-hint-primary-actions');
		element.appendChild(body);
		this._appendHintClose(hint, element);
	};

	AyleUI.prototype._renderNavigationHint = function (hint, element) {
		this._prepareHintElement(hint, element, 'navigation');

		var body = this._createHintBody();

		if (hint.ShowTitle !== false)
			this._appendHintHeading(hint, body, '\u21aa');

		if (hint.ShowDescription !== false)
			this._appendHintDescription(hint, body);

		var row = document.createElement('div');
		row.className = 'ayle-hint-navigation-row';

		var actions = this._hintActions(hint);
		var i = 0;
		while (i < actions.length) {
			if (String(actions[i].Type || '').toLowerCase() === 'seek') {
				var meta = document.createElement('div');
				meta.className = 'ayle-hint-navigation-time';
				meta.textContent = this._formatTime(Number(actions[i].Time) || 0);
				row.appendChild(meta);
				break;
			}
			i++;
		}

		this._appendHintActions(hint, row, 'ayle-hint-actions ayle-hint-navigation-actions');
		body.appendChild(row);
		element.appendChild(body);
		this._appendHintClose(hint, element);
	};

	AyleUI.prototype._renderChoiceHint = function (hint, element, type, showResult) {
		var self = this;
		this._prepareHintElement(hint, element, type);

		var body = this._createHintBody();
		this._appendHintHeading(hint, body, type === 'rating' ? '\u2605' : '?');
		this._appendHintDescription(hint, body);

		var actions = this._hintActions(hint);
		var choices = document.createElement('div');
		choices.className = 'ayle-hint-choices';
		choices.setAttribute('role', 'group');

		var i = 0;
		while (i < actions.length) {
			(function (action) {
				var button = document.createElement('button');
				button.type = 'button';
				button.className = 'ayle-hint-choice';
				button.textContent = action.Title || action.Label || action.Name || action.Type || self.Player.Localize('open');

				button.onclick = function (event) {
					event.stopPropagation();

					var buttons = choices.querySelectorAll('.ayle-hint-choice');
					var j = 0;
					while (j < buttons.length) {
						buttons[j].classList.remove('is-selected');
						j++;
					}

					button.classList.add('is-selected');

					if (showResult && action.Correct !== undefined) {
						button.classList.add(action.Correct ? 'is-correct' : 'is-incorrect');
						choices.classList.add('has-result');
					}

					self.ExecuteHintAction(hint, action, event);
				};

				choices.appendChild(button);
			})(actions[i]);

			i++;
		}

		body.appendChild(choices);
		element.appendChild(body);
		this._appendHintClose(hint, element);
	};


	AyleUI.prototype._renderQuizHint = function (hint, element) {
		var self = this;
		this._prepareHintElement(hint, element, 'quiz');

		var body = this._createHintBody();
		this._appendHintHeading(hint, body, '?');
		this._appendHintDescription(hint, body);

		var actions = this._hintActions(hint);
		var selectedAction = null;
		var selectedButton = null;
		var resultTimer = null;
		var choices = document.createElement('div');
		choices.className = 'ayle-hint-choices';
		choices.setAttribute('role', 'radiogroup');

		var resultMode = String(hint.ResultMode || 'result').toLowerCase();
		if (
			resultMode !== 'off' &&
			resultMode !== 'instant' &&
			resultMode !== 'result'
		)
			resultMode = 'result';

		var resultDuration = hint.ResultDuration !== undefined ?
			Math.max(0, Number(hint.ResultDuration) || 0) : 1500;

		var clearResult = function () {
			if (resultTimer) {
				clearTimeout(resultTimer);
				resultTimer = null;
			}

			var buttons = choices.querySelectorAll('.ayle-hint-choice');
			var j = 0;

			while (j < buttons.length) {
				buttons[j].classList.remove('is-correct', 'is-incorrect');
				j++;
			}

			choices.classList.remove('has-result');
		};

		var showResult = function (action, button, temporary) {
			if (
				resultMode === 'off' ||
				!action ||
				action.Correct === undefined ||
				!button
			)
				return;

			clearResult();
			button.classList.add(action.Correct ? 'is-correct' : 'is-incorrect');
			choices.classList.add('has-result');

			if (temporary && resultDuration > 0) {
				resultTimer = setTimeout(function () {
					resultTimer = null;
					clearResult();
				}, resultDuration);
			}
		};

		var i = 0;
		while (i < actions.length) {
			(function (action) {
				var button = document.createElement('button');
				button.type = 'button';
				button.className = 'ayle-hint-choice';
				button.setAttribute('role', 'radio');
				button.setAttribute('aria-checked', 'false');
				button.textContent = action.Title || action.Label || action.Name || action.Type || self.Player.Localize('open');

				button.onclick = function (event) {
					event.stopPropagation();

					var buttons = choices.querySelectorAll('.ayle-hint-choice');
					var j = 0;
					while (j < buttons.length) {
						buttons[j].classList.remove('is-selected');

						if (resultMode !== 'instant')
							buttons[j].classList.remove('is-correct', 'is-incorrect');

						buttons[j].setAttribute('aria-checked', 'false');
						j++;
					}

					if (resultMode !== 'instant')
						choices.classList.remove('has-result');

					selectedAction = action;
					selectedButton = button;
					button.classList.add('is-selected');
					button.setAttribute('aria-checked', 'true');
					answer.disabled = false;

					if (resultMode === 'instant')
						showResult(action, button, false);
				};

				choices.appendChild(button);
			})(actions[i]);

			i++;
		}

		body.appendChild(choices);

		var footer = document.createElement('div');
		footer.className = 'ayle-hint-quiz-footer';

		var answer = document.createElement('button');
		answer.type = 'button';
		answer.className = 'ayle-hint-action ayle-hint-quiz-answer';
		answer.textContent = this.Player.Localize('quizAnswer');
		answer.disabled = true;

		answer.onclick = function (event) {
			event.stopPropagation();

			if (!selectedAction)
				return;

			var hideDelay = 0;

			if (resultMode === 'result') {
				showResult(selectedAction, selectedButton, true);
				hideDelay = resultDuration;
			}

			self.Player.Emit('quizAnswer', {
				Hint: hint,
				Action: selectedAction,
				Option: selectedAction,
				Event: event,
				UI: self
			});

			self.ExecuteHintAction(
				hint,
				selectedAction,
				event,
				{ HideDelay: hideDelay }
			);
		};

		footer.appendChild(answer);
		body.appendChild(footer);
		element.appendChild(body);
		this._appendHintClose(hint, element);
	};

	AyleUI.prototype._renderTutorialHint = function (hint, element) {
		this._prepareHintElement(hint, element, 'tutorial');

		var body = this._createHintBody();
		this._appendHintHeading(hint, body, '?');
		this._appendHintDescription(hint, body);
		this._appendHintActions(hint, body);
		element.appendChild(body);
		this._appendHintClose(hint, element);
	};

	AyleUI.prototype._createDefaultHint = function (hint, element) {
		var self = this;
		element.innerHTML = '';
		element.className = 'ayle-hint';

		var type = String(hint.Type || 'info').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
		element.classList.add('ayle-hint-type-' + type);
		element.setAttribute('data-ayle-hint-type', type);

		if (hint.Image) {
			var image = document.createElement('img');
			image.className = 'ayle-hint-image';
			image.src = hint.Image;
			image.alt = hint.Title || '';
			element.appendChild(image);
		}

		var body = document.createElement('div');
		body.className = 'ayle-hint-body';

		if (hint.Title) {
			var title = document.createElement('div');
			title.className = 'ayle-hint-title';
			title.textContent = hint.Title;
			body.appendChild(title);
		}

		if (hint.Text) {
			var text = document.createElement('div');
			text.className = 'ayle-hint-text';
			text.textContent = hint.Text;
			body.appendChild(text);
		}

		var actions = this._hintActions(hint);
		if (actions.length) {
			var actionsElement = document.createElement('div');
			actionsElement.className = 'ayle-hint-actions';
			var i = 0;

			while (i < actions.length) {
				(function (action) {
					var button = document.createElement('button');
					button.type = 'button';
					button.className = 'ayle-hint-action';
					button.textContent = action.Title || action.Label || action.Name || action.Type || self.Player.Localize('open');

					button.onclick = function (event) {
						event.stopPropagation();
						self.ExecuteHintAction(hint, action, event);
					};

					actionsElement.appendChild(button);
				})(actions[i]);

				i++;
			}

			body.appendChild(actionsElement);
		}

		element.appendChild(body);

		if (hint.Dismissible !== false) {
			var close = document.createElement('button');
			close.type = 'button';
			close.className = 'ayle-hint-close';
			var dismissLabel = this.Player.Localize('dismiss');
			close.setAttribute('aria-label', dismissLabel);
			close.title = dismissLabel;
			close.textContent = '\u00d7';
			close.onclick = function (event) {
				event.stopPropagation();
				self.DismissHint(hint);
			};
			element.appendChild(close);
		}
	};

	AyleUI.prototype.DismissHint = function (hint) {
		var hints = this.Player.Options.Integration && this.Player.Options.Integration.Hints instanceof Array ?
			this.Player.Options.Integration.Hints : [];
		var index = hints.indexOf(hint);
		var id = this._hintID(hint, index < 0 ? 0 : index);

		this._hintDismissed[id] = true;
		delete this._hintPausedPlayback[id];
		this.Player.Emit('hintDismiss', hint);
		this.UpdateHints();
	};

	AyleUI.prototype.ResetHints = function () {
		this._hintElements = {};
		this._hintShown = {};
		this._hintDismissed = {};
		this._hintPausedPlayback = {};

		if (this.Hints)
			this.Hints.innerHTML = '';

		this.UpdateHints();
	};

	AyleUI.prototype.UpdateHints = function () {
		if (!this.Hints)
			return;

		var player = this.Player;
		var hints = player.Options.Integration && player.Options.Integration.Hints instanceof Array ?
			player.Options.Integration.Hints : [];
		var active = player.State.ActiveHints || [];
		var wanted = {};
		var activeIDs = {};
		var i = 0;

		while (i < active.length) {
			var hint = active[i] || {};
			var sourceIndex = hints.indexOf(hint);
			var id = this._hintID(hint, sourceIndex < 0 ? i : sourceIndex);
			activeIDs[id] = true;

			if (!this._hintDismissed[id] && !(hint.Once && this._hintShown[id] && !this._hintElements[id])) {
				wanted[id] = true;

				var element = this._hintElements[id];
				if (!element) {
					element = document.createElement('div');
					element.setAttribute('data-hint-id', id);
					element.setAttribute(
						'data-ayle-hint-type',
						String(hint.Type || 'info').toLowerCase()
					);
					this._applyHintPosition(hint, element);
					this.Hints.appendChild(element);
					this._hintElements[id] = element;

					var renderer = player.GetHintRenderer(hint.Type);
					if (renderer)
						renderer(hint, element, player, this);
					else
						this._createDefaultHint(hint, element);

					this._hintShown[id] = true;
					player.Emit('hintShow', hint);
					player.Emit('hintOpen', hint);

					if (hint.PauseOnShow && player.State.Playing) {
						this._hintPausedPlayback[id] = true;
						player.Pause();
					}
				}
			}

			i++;
		}

		/* Repeatable hints remain dismissed until playback leaves their active
		 * interval. Once outside, clear the dismissal so a later seek/pass can
		 * show them again. */
		var dismissedIDs = Object.keys(this._hintDismissed);
		i = 0;
		while (i < dismissedIDs.length) {
			var dismissedID = dismissedIDs[i];

			if (!activeIDs[dismissedID]) {
				var dismissedHint = null;
				var d = 0;

				while (d < hints.length) {
					if (this._hintID(hints[d], d) === dismissedID) {
						dismissedHint = hints[d];
						break;
					}
					d++;
				}

				if (dismissedHint && dismissedHint.Repeatable)
					delete this._hintDismissed[dismissedID];
			}

			i++;
		}

		var ids = Object.keys(this._hintElements);
		i = 0;

		while (i < ids.length) {
			var currentID = ids[i];

			if (!wanted[currentID]) {
				var currentElement = this._hintElements[currentID];
				var currentHint = null;
				var j = 0;

				while (j < hints.length) {
					if (this._hintID(hints[j], j) === currentID) {
						currentHint = hints[j];
						break;
					}
					j++;
				}

				if (currentElement && currentElement.parentNode)
					currentElement.parentNode.removeChild(currentElement);

				delete this._hintElements[currentID];

				if (currentHint) {
					player.Emit('hintHide', currentHint);
					player.Emit('hintClose', currentHint);
				}
			}

			i++;
		}
	};

	AyleUI.prototype.UpdateTitle = function () {
		var source = this.Player.State.Source;
		var chapter = this.Player.State.Chapter;
		var integration = this.Player.Options.Integration || {};
		var channel = integration.Channel || null;
		var ui = this.Player.Options.UI || {};
		var headerItems = ui.Header instanceof Array ? ui.Header : [];
		var trackItems = ui.Track instanceof Array ? ui.Track : [];
		var channelItems = ui.Channel instanceof Array ? ui.Channel : [];
		var mediaTitle = source && source.Title ? source.Title : '';
		var chapterTitle = chapter && chapter.Title ? chapter.Title : '';
		var showTitle = trackItems.indexOf('title') !== -1 && !!mediaTitle;
		var showChapter = trackItems.indexOf('chapter') !== -1 && !!chapterTitle;
		var showName = channelItems.indexOf('name') !== -1 && !!(channel && channel.Name);
		var profile = channel && channel.Profile ? channel.Profile : null;
		var profileName = profile && profile.Name ? profile.Name : '';
		var showProfile = channelItems.indexOf('profile') !== -1 && !!profileName;
		var showAvatar = !!(channel && channel.Avatar);
		var channelType = '';
		var headerHasTrack = false;
		var i = 0;

		while (i < headerItems.length) {
			var headerItem = String(headerItems[i] || '');

			if (headerItem === 'track')
				headerHasTrack = true;
			else if (!channelType && (headerItem === 'channel:card' || headerItem === 'channel:contact'))
				channelType = headerItem.substring(8);

			i++;
		}

		var hasTrack = headerHasTrack && (showTitle || showChapter);
		var hasChannel = !!channelType && (showAvatar || showName || showProfile);

		if (this.MediaTitle) {
			this.MediaTitle.textContent = mediaTitle;
			this.MediaTitle.style.display = showTitle ? '' : 'none';
		}

		if (this.CurrentChapterTitle) {
			this.CurrentChapterTitle.textContent = chapterTitle;
			this.CurrentChapterTitle.style.display = showChapter ? '' : 'none';
		}

		if (this.Title)
			this.Title.style.display = hasTrack ? '' : 'none';

		if (this.Channel) {
			this.Channel.classList.toggle('is-visible', hasChannel);
			this.Channel.classList.toggle('ayle-channel-card', channelType === 'card');
			this.Channel.classList.toggle('ayle-channel-contact', channelType === 'contact');
		}

		if (this.ChannelAvatar) {
			this.ChannelAvatar.src = showAvatar ? channel.Avatar : '';
			this.ChannelAvatar.alt = channel && channel.Name ? channel.Name : '';
			this.ChannelAvatar.style.display = showAvatar ? '' : 'none';
		}

		if (this.ChannelInfo)
			this.ChannelInfo.style.display = showName || showProfile ? '' : 'none';

		if (this.ChannelName) {
			this.ChannelName.textContent = channel && channel.Name ? channel.Name : '';
			this.ChannelName.style.display = showName ? '' : 'none';
		}

		if (this.ChannelProfile) {
			this.ChannelProfile.textContent = profileName;
			this.ChannelProfile.style.display = showProfile ? '' : 'none';

			if (profile && profile.URL) {
				this.ChannelProfile.setAttribute('href', profile.URL);
				this.ChannelProfile.removeAttribute('aria-disabled');
			}
			else {
				this.ChannelProfile.setAttribute('href', '#');
				this.ChannelProfile.setAttribute('aria-disabled', 'true');
			}

			if (profile && profile.Target) {
				this.ChannelProfile.setAttribute('target', profile.Target);
				if (profile.Target === '_blank')
					this.ChannelProfile.setAttribute('rel', 'noopener noreferrer');
				else
					this.ChannelProfile.removeAttribute('rel');
			}
			else {
				this.ChannelProfile.removeAttribute('target');
				this.ChannelProfile.removeAttribute('rel');
			}
		}

		if (this.Title) {
			i = 0;
			while (i < trackItems.length) {
				var trackItem = String(trackItems[i] || '');
				var trackElement = null;

				if (trackItem === 'title')
					trackElement = this.MediaTitle;
				else if (trackItem === 'chapter')
					trackElement = this.CurrentChapterTitle;

				if (trackElement && trackElement.parentNode === this.Title)
					this.Title.appendChild(trackElement);

				i++;
			}
		}

		if (this.ChannelInfo) {
			i = 0;
			while (i < channelItems.length) {
				var channelItem = String(channelItems[i] || '');
				var channelElement = null;

				if (channelItem === 'name')
					channelElement = this.ChannelName;
				else if (channelItem === 'profile')
					channelElement = this.ChannelProfile;

				if (channelElement && channelElement.parentNode === this.ChannelInfo)
					this.ChannelInfo.appendChild(channelElement);

				i++;
			}
		}

		if (this.Channel && this.Title && this.Header) {
			i = 0;
			while (i < headerItems.length) {
				var item = String(headerItems[i] || '');
				var element = null;

				if (item === 'channel:' + channelType && hasChannel)
					element = this.Channel;
				else if (item === 'track' && hasTrack)
					element = this.Title;

				if (element && element.parentNode === this.Header)
					this.Header.appendChild(element);

				i++;
			}
		}

		if (this.Header)
			this.Header.style.display = hasTrack || hasChannel ? '' : 'none';

		this.ScheduleSafeAreaUpdate();
	};

	AyleUI.prototype.UpdateTimeWidth = function () {
		if (!this.Time)
			return;

		var duration = this.Player.State.Duration;
		if (!duration || !isFinite(duration) || duration < 0) {
			this.Time.style.width = '';
			this.Time.style.minWidth = '';
			this.Time.style.maxWidth = '';
			this.Time.style.flex = '';
			return;
		}

		var text = this._formatTime(duration);
		var measure = this.Time.cloneNode(true);
		var current = measure.querySelector('.ayle-current');
		var total = measure.querySelector('.ayle-duration');

		if (current)
			current.textContent = text;
		if (total)
			total.textContent = text;

		measure.style.position = 'absolute';
		measure.style.left = '-100000px';
		measure.style.top = '-100000px';
		measure.style.width = 'auto';
		measure.style.minWidth = '0';
		measure.style.maxWidth = 'none';
		measure.style.flex = 'none';
		measure.style.visibility = 'hidden';
		measure.style.pointerEvents = 'none';

		this.Element.appendChild(measure);
		var width = Math.ceil(measure.getBoundingClientRect().width);
		this.Element.removeChild(measure);

		if (width <= 0)
			return;

		this.Time.style.width = width + 'px';
		this.Time.style.minWidth = width + 'px';
		this.Time.style.maxWidth = width + 'px';
		this.Time.style.flex = '0 0 ' + width + 'px';
	};

	AyleUI.prototype.UpdateTime = function () {
		var state = this.Player.State;
		var position = this._seeking ? this._seekPosition : state.Position;

		this.Current.innerHTML = this._formatTimeForDuration(position, state.Duration);
		this.Duration.innerHTML = this._formatTime(state.Duration);

		var value = 0;
		if (state.Duration > 0 && isFinite(state.Duration))
			value = position / state.Duration * 100;

		if (value < 0)
			value = 0;
		if (value > 100)
			value = 100;

		this.Progress.style.width = value + '%';
		this.Handle.style.left = value + '%';
	};

	AyleUI.prototype.UpdateBuffer = function () {
		var state = this.Player.State;
		var container = this.Buffered;

		if (!container)
			return;

		if (
			!state.Duration ||
			!isFinite(state.Duration) ||
			!state.Buffered ||
			!state.Buffered.length
		) {
			container.style.width = '0%';
			return;
		}

		var position = state.Position;
		var bufferedEnd = 0;
		var ranges = state.Buffered;
		var i = 0;
		var count = ranges.length;

		/*
		 * Classic media-player buffer bar: draw from the beginning of
		 * the timeline up to the end of the range containing currentTime.
		 * The progress bar is rendered above it.
		 */
		while (i < count) {
			var range = ranges[i];

			if (
				isFinite(range.Start) &&
				isFinite(range.End) &&
				position >= range.Start &&
				position <= range.End
			) {
				bufferedEnd = range.End;
				break;
			}

			i++;
		}

		/*
		 * During seeks there can briefly be no range containing currentTime.
		 * Keep the bar useful by falling back to the furthest buffered end.
		 */
		if (!bufferedEnd) {
			i = 0;

			while (i < count) {
				if (
					isFinite(ranges[i].End) &&
					ranges[i].End > bufferedEnd
				)
					bufferedEnd = ranges[i].End;

				i++;
			}
		}

		var width = bufferedEnd / state.Duration * 100;

		if (width < 0)
			width = 0;
		if (width > 100)
			width = 100;

		container.style.width = width + '%';
	};

	AyleUI.prototype._formatBitrate = function (bitrate) {
		bitrate = Number(bitrate) || 0;
		if (!bitrate)
			return '';

		if (bitrate >= 1000000) {
			var mbps = bitrate / 1000000;
			return (Math.round(mbps * 10) / 10) + ' Mbps';
		}

		if (bitrate >= 1000)
			return Math.round(bitrate / 1000) + ' Kbps';

		return bitrate + ' bps';
	};

	AyleUI.prototype._qualityLabel = function (variant) {
		if (variant.Label)
			return variant.Label;
		if (variant.Height)
			return variant.Height + 'p';
		return variant.ID || 'Quality';
	};

	AyleUI.prototype._qualityBadge = function (variant) {
		if (!variant)
			return '';

		var height = Number(variant.Height) || 0;
		var width = Number(variant.Width) || 0;
		var label = String(variant.Label || '').toLowerCase();

		if (height >= 2160 || width >= 3840 || label.indexOf('2160') !== -1 || label.indexOf('4k') !== -1)
			return '4K';

		if (height === 1080 || label.indexOf('1080p') !== -1)
			return 'FHD';

		if (height === 720 || label.indexOf('720p') !== -1)
			return 'HD';

		return '';
	};

	AyleUI.prototype._qualityMeta = function (variant) {
		var parts = [];

		if (variant.Width && variant.Height)
			parts.push(variant.Width + '×' + variant.Height);

		var bitrate = this._formatBitrate(variant.Bitrate);
		if (bitrate)
			parts.push(bitrate);

		if (variant.Codecs)
			parts.push(variant.Codecs);

		return parts.join(' · ');
	};

	AyleUI.prototype.UpdateQualityMenu = function () {
		var variants = this.Player.State.Variants;
		var select = this.Quality;
		var list = this.QualityList;
		var i = 0;
		var count = variants.length;
		var switching = this.Player.IsSwitchingVariant();

		/* Keep the original select populated for backwards compatibility. */
		if (select) {
			select.innerHTML = '';

			i = 0;
			while (i < count) {
				var selectVariant = variants[i];
				var option = document.createElement('option');
				option.value = selectVariant.ID;
				option.innerHTML = this._qualityLabel(selectVariant);

				if (this.Player.State.Variant === selectVariant)
					option.selected = true;

				select.appendChild(option);
				i++;
			}

			select.disabled = switching;
		}

		if (list) {
			list.innerHTML = '';
			list.setAttribute('aria-busy', switching ? 'true' : 'false');

			i = 0;
			while (i < count) {
				var variant = variants[i];
				var button = document.createElement('button');
				button.type = 'button';
				button.className = 'ayle-quality-option';
				button.setAttribute('data-quality-id', variant.ID);
				button.setAttribute('role', 'radio');
				button.setAttribute('aria-checked', this.Player.State.Variant === variant ? 'true' : 'false');
				button.disabled = switching;

				if (this.Player.State.Variant === variant)
					button.classList.add('is-active');

				var text = document.createElement('span');
				text.className = 'ayle-quality-text';

				var nameRow = document.createElement('span');
				nameRow.className = 'ayle-quality-name-row';

				var name = document.createElement('span');
				name.className = 'ayle-quality-name';
				name.textContent = this._qualityLabel(variant);
				nameRow.appendChild(name);

				var listBadgeText = this._qualityBadge(variant);
				if (listBadgeText) {
					var listBadge = document.createElement('span');
					listBadge.className = 'ayle-quality-badge ayle-quality-list-badge';
					listBadge.textContent = listBadgeText;
					listBadge.classList.toggle('is-4k', listBadgeText === '4K');
					listBadge.classList.toggle('is-fhd', listBadgeText === 'FHD');
					listBadge.classList.toggle('is-hd', listBadgeText === 'HD');
					nameRow.appendChild(listBadge);
				}

				text.appendChild(nameRow);

				var metaText = this._qualityMeta(variant);
				if (metaText) {
					var meta = document.createElement('span');
					meta.className = 'ayle-quality-meta';
					meta.textContent = metaText;
					text.appendChild(meta);
				}

				var indicator = document.createElement('span');
				indicator.className = 'ayle-quality-indicator';
				indicator.setAttribute('aria-hidden', 'true');

				button.appendChild(text);
				button.appendChild(indicator);
				list.appendChild(button);
				i++;
			}
		}

		var activeVariant = this.Player.State.Variant || (count ? variants[0] : null);
		if (this.QualityButtonName)
			this.QualityButtonName.textContent = activeVariant ? this._qualityLabel(activeVariant) : 'Quality';

		if (this.QualityBadge) {
			var badge = this._qualityBadge(activeVariant);
			this.QualityBadge.textContent = badge;
			this.QualityBadge.style.display = badge ? '' : 'none';
			this.QualityBadge.classList.toggle('is-4k', badge === '4K');
			this.QualityBadge.classList.toggle('is-fhd', badge === 'FHD');
			this.QualityBadge.classList.toggle('is-hd', badge === 'HD');
		}

		if (this.QualityButton) {
			var buttonTitle = activeVariant ?
				this.Player.Localize('qualityValue', { value: this._qualityLabel(activeVariant) }) :
				this.Player.Localize('videoQuality');
			this.QualityButton.setAttribute('aria-label', buttonTitle);
			this.QualityButton.setAttribute('title', buttonTitle);
			this.QualityButton.disabled = switching;
		}

		var visible = count > 1 || this.Player.Options.ForceShowQualityList;
		if (this.QualityControl)
			this.QualityControl.style.display = visible ? '' : 'none';

		if (!visible && this.QualityPopover) {
			this.QualityPopover.classList.remove('is-open');
			if (this.QualityButton)
				this.QualityButton.setAttribute('aria-expanded', 'false');
		}

		this.UpdateSettingsVisibility();
	};

	AyleUI.prototype._createSettingsListItem = function (label, active, className) {
		var button = document.createElement('button');
		button.type = 'button';
		button.className = 'ayle-settings-list-item ' + className;
		button.classList.toggle('is-active', !!active);

		var title = document.createElement('span');
		title.className = 'ayle-settings-list-title';
		title.textContent = label;

		var indicator = document.createElement('span');
		indicator.className = 'ayle-settings-list-indicator';
		indicator.setAttribute('aria-hidden', 'true');

		button.appendChild(title);
		button.appendChild(indicator);
		return button;
	};

	AyleUI.prototype.UpdateAudioMenu = function () {
		var tracks = this.Player.State.AudioTracks || [];
		var list = this.AudioList;
		var select = this.Audio;
		var count = tracks.length;
		var i = 0;

		if (select) {
			select.innerHTML = '';
			while (i < count) {
				var selectTrack = tracks[i];
				var option = document.createElement('option');
				option.value = selectTrack.ID;
				option.textContent = selectTrack.Label || selectTrack.Language || this.Player.Localize('audioFallback', { index: i + 1 });
				option.selected = this.Player.State.AudioTrack === selectTrack;
				select.appendChild(option);
				i++;
			}
		}

		if (list) {
			list.innerHTML = '';
			i = 0;
			while (i < count) {
				var track = tracks[i];
				var label = track.Label || track.Language || this.Player.Localize('audioFallback', { index: i + 1 });
				var button = this._createSettingsListItem(label, this.Player.State.AudioTrack === track, 'ayle-audio-option');
				button.setAttribute('data-audio-id', track.ID);
				list.appendChild(button);
				i++;
			}
		}

		if (this.AudioField)
			this.AudioField.style.display = count > 1 ? '' : 'none';
		else if (select)
			this._setSelectFieldVisible(select, count > 1);

		if (this.AudioSubmenuButton)
			this.AudioSubmenuButton.style.display = count > 1 ? '' : 'none';

		if (this.AudioSubmenuValue) {
			var activeAudio = this.Player.State.AudioTrack;
			this.AudioSubmenuValue.textContent = activeAudio ?
				(activeAudio.Label || activeAudio.Language || 'Audio') : '';
		}

		this.UpdateSettingsVisibility();
	};

	AyleUI.prototype.UpdateSubtitleMenu = function () {
		var tracks = this.Player.State.SubtitleTracks || [];
		var list = this.SubtitleList;
		var select = this.Subtitles;
		var count = tracks.length;

		if (select) {
			select.innerHTML = '';
			var off = document.createElement('option');
			off.value = '';
			off.textContent = this.Player.Localize('subtitlesOff');
			off.selected = !this.Player.State.SubtitleTrack;
			select.appendChild(off);
		}

		if (list) {
			list.innerHTML = '';
			var offButton = this._createSettingsListItem(this.Player.Localize('subtitlesOff'), !this.Player.State.SubtitleTrack, 'ayle-subtitle-option');
			offButton.setAttribute('data-subtitle-id', '');
			list.appendChild(offButton);
		}

		var i = 0;
		while (i < count) {
			var track = tracks[i];
			var label = track.Label || track.Language || this.Player.Localize('subtitlesFallback', { index: i + 1 });
			if (track.Forced && label.toLowerCase().indexOf('forced') === -1)
				label += ' (' + this.Player.Localize('forced') + ')';

			if (select) {
				var option = document.createElement('option');
				option.value = track.ID;
				option.textContent = label;
				option.selected = this.Player.State.SubtitleTrack === track;
				select.appendChild(option);
			}

			if (list) {
				var button = this._createSettingsListItem(label, this.Player.State.SubtitleTrack === track, 'ayle-subtitle-option');
				button.setAttribute('data-subtitle-id', track.ID);
				list.appendChild(button);
			}
			i++;
		}

		if (this.SubtitleField)
			this.SubtitleField.style.display = count > 0 ? '' : 'none';
		else if (select)
			this._setSelectFieldVisible(select, count > 0);

		if (this.SubtitlesSubmenuButton)
			this.SubtitlesSubmenuButton.style.display = count > 0 ? '' : 'none';

		if (this.SubtitlesSubmenuValue) {
			var activeSubtitle = this.Player.State.SubtitleTrack;
			this.SubtitlesSubmenuValue.textContent = activeSubtitle ?
				(activeSubtitle.Label || activeSubtitle.Language || 'Subtitles') : this.Player.Localize('subtitlesOff');
		}

		this.UpdateSettingsVisibility();
	};



	AyleUI.prototype.ApplyPlayerStyle = function () {
		if (!this.Element)
			return;

		this.Element.style.setProperty(
			'--ayle-font-family',
			this.Player.Options.FontFamily || 'Arial, sans-serif'
		);
	};


	AyleUI.prototype.UpdateShortcutsSettings = function () {
		var shortcuts = this.Player.Options.Shortcuts || {};

		var pairs = [
			[this.ShortcutPlayPauseToggle, 'PlayPause'],
			[this.ShortcutSeekArrowsToggle, 'SeekArrows'],
			[this.ShortcutSeekAngleToggle, 'SeekAngle'],
			[this.ShortcutVolumeToggle, 'Volume'],
			[this.ShortcutMuteToggle, 'Mute'],
			[this.ShortcutSubtitlesToggle, 'Subtitles'],
			[this.ShortcutFullscreenToggle, 'Fullscreen'],
			[this.ShortcutPictureInPictureToggle, 'PictureInPicture']
		];

		var audio = this.Player.State.MediaMode === 'audio';
		var videoOnly = [
			this.ShortcutFullscreenToggle,
			this.ShortcutPictureInPictureToggle
		];
		var videoIndex = 0;

		while (videoIndex < videoOnly.length) {
			var videoInput = videoOnly[videoIndex];

			if (videoInput && videoInput.parentNode)
				videoInput.parentNode.style.display = audio ? 'none' : '';

			videoIndex++;
		}

		var i = 0;
		while (i < pairs.length) {
			var input = pairs[i][0];
			var name = pairs[i][1];

			if (input) {
				input.checked = shortcuts[name] !== false;
				input.setAttribute('aria-checked', input.checked ? 'true' : 'false');
			}

			i++;
		}

		this.UpdateSettingsVisibility();
	};

	AyleUI.prototype.UpdateDebugSettings = function () {
		if (this.DebugToggle) {
			this.DebugToggle.checked = !!this.Player.Options.Debug;
			this.DebugToggle.setAttribute('aria-checked', this.Player.Options.Debug ? 'true' : 'false');
		}

		if (this.DebugMP4Toggle) {
			this.DebugMP4Toggle.checked = !!this.Player.Options.DebugMP4;
			this.DebugMP4Toggle.setAttribute('aria-checked', this.Player.Options.DebugMP4 ? 'true' : 'false');
		}

		this.UpdateSettingsVisibility();
	};

	AyleUI.prototype.UpdateAutoPlaySettings = function () {
		if (!this.AutoPlayToggle)
			return;

		this.AutoPlayToggle.checked = !!this.Player.Options.AutoPlay;
		this.AutoPlayToggle.setAttribute('aria-checked', this.Player.Options.AutoPlay ? 'true' : 'false');
	};

	AyleUI.prototype.UpdateSubtitleSettings = function () {
		if (this.NativeSubtitlesToggle) {
			this.NativeSubtitlesToggle.checked = !!this.Player.Options.NativeSubtitles;
			this.NativeSubtitlesToggle.setAttribute('aria-checked', this.Player.Options.NativeSubtitles ? 'true' : 'false');
		}

		if (this.AutoNativeSubtitlesInPictureInPictureToggle) {
			this.AutoNativeSubtitlesInPictureInPictureToggle.checked = !!this.Player.Options.AutoNativeSubtitlesInPictureInPicture;
			this.AutoNativeSubtitlesInPictureInPictureToggle.setAttribute('aria-checked', this.Player.Options.AutoNativeSubtitlesInPictureInPicture ? 'true' : 'false');
		}

		this.UpdateSettingsVisibility();
	};

	AyleUI.prototype.ApplySubtitleStyle = function () {
		var style = this.Player.Options.SubtitleStyle || {};
		var element = this.Element;

		element.style.setProperty('--ayle-subtitle-color', style.Color || '#fff');
		element.style.setProperty('--ayle-subtitle-background', style.Background || 'rgba(0, 0, 0, .72)');
		element.style.setProperty('--ayle-subtitle-font-family', style.FontFamily || 'Arial, sans-serif');
		element.style.setProperty('--ayle-subtitle-font-size', style.FontSize || '1.15em');
		element.style.setProperty('--ayle-subtitle-font-weight', style.FontWeight || '400');
		element.style.setProperty('--ayle-subtitle-line-height', style.LineHeight || '1.25');
		element.style.setProperty('--ayle-subtitle-text-shadow', style.TextShadow || 'none');
		element.style.setProperty('--ayle-subtitle-padding', style.Padding || '8px');
		element.style.setProperty('--ayle-subtitle-border-radius', style.BorderRadius || '8px');
		element.style.setProperty('--ayle-subtitle-letter-spacing', style.LetterSpacing || 'normal');
		element.style.setProperty('--ayle-subtitle-bottom', style.Bottom || '64px');
		element.style.setProperty('--ayle-subtitle-max-width', style.MaxWidth || '90%');

		this.UpdateSubtitleOverlay();
	};

	AyleUI.prototype.UpdateSubtitleTrackBinding = function () {
		if (this._subtitleCueTrack && this._subtitleCueHandler && this._subtitleCueTrack.removeEventListener)
			this._subtitleCueTrack.removeEventListener('cuechange', this._subtitleCueHandler);

		this._subtitleCueTrack = null;
		this._subtitleCueHandler = null;

		var track = this.Player.State.SubtitleTrack;
		if (!track || !track.Native || !track.Native.addEventListener)
			return;

		var self = this;
		this._subtitleCueTrack = track.Native;
		this._subtitleCueHandler = function () {
			self.UpdateSubtitleOverlay();
		};
		this._listen(track.Native, 'cuechange', this._subtitleCueHandler);
	};


	AyleUI.prototype.GetActiveSubtitleCues = function () {
		var track = this.Player.State.SubtitleTrack;
		if (!track)
			return [];

		var cues = [];
		var position = Number(this.Player.State.Position) || 0;
		var subtitleOffset = Number(this.Player.Options.SubtitleOffset) || 0;
		var customCues = track.Cues || [];
		var i = 0;

		if (!customCues.length && this.Player.State.Source) {
			var sourceTracks = this.Player.State.Source.SubtitleTracks || [];
			i = 0;

			while (i < sourceTracks.length) {
				if (String(sourceTracks[i].ID) === String(track.ID)) {
					customCues = sourceTracks[i].Cues || [];
					break;
				}
				i++;
			}
		}

		i = 0;
		while (i < customCues.length) {
			var customCue = customCues[i];

			if (
				customCue &&
				position >= Number(customCue.Start) + subtitleOffset &&
				position < Number(customCue.End) + subtitleOffset
			)
				cues.push(customCue);

			i++;
		}

		/*
		 * Parsed cues are authoritative for the HTML renderer. In particular,
		 * SubtitleOffset is applied above to their Start/End timestamps. Falling
		 * back to TextTrack.activeCues when the shifted interval has no active cue
		 * would re-introduce the browser's unshifted cue and can make the previous
		 * subtitle flash/persist around fragment boundaries.
		 *
		 * Native activeCues are therefore only a fallback when no parsed cue data
		 * exists at all.
		 */
		if (!customCues.length && track.Native && track.Native.mode !== 'disabled') {
			var activeCues = track.Native.activeCues;
			var nativeCount = activeCues ? activeCues.length : 0;
			i = 0;

			while (i < nativeCount) {
				cues.push(activeCues[i]);
				i++;
			}
		}

		return cues;
	};


	AyleUI.prototype.AppendSubtitleMarkup = function (target, text) {
		if (!target)
			return;

		text = String(text || '');

		if (!text) {
			target.textContent = '';
			return;
		}

		/*
		 * Custom-parsed cues store VTT payload as plain strings. Render the
		 * formatting subset we actually support instead of using textContent,
		 * while still avoiding arbitrary HTML injection.
		 */
		var source = document.createElement('div');
		source.innerHTML = text;

		var allowed = {
			'I': true,
			'B': true,
			'U': true,
			'BR': true,
			'RUBY': true,
			'RT': true
		};

		var copyChildren = function (from, to) {
			var child = from.firstChild;

			while (child) {
				if (child.nodeType === 3) {
					to.appendChild(document.createTextNode(child.nodeValue || ''));
				}
				else if (child.nodeType === 1) {
					var name = String(child.tagName || '').toUpperCase();

					if (allowed[name]) {
						var element = document.createElement(name.toLowerCase());
						copyChildren(child, element);
						to.appendChild(element);
					}
					else {
						/*
						 * Unknown tags are stripped, but their text/children are
						 * preserved. This keeps VTT text readable without letting
						 * arbitrary attributes/elements through.
						 */
						copyChildren(child, to);
					}
				}

				child = child.nextSibling;
			}
		};

		target.innerHTML = '';
		copyChildren(source, target);
	};

	AyleUI.prototype.AppendSubtitleCue = function (target, cue) {
		if (!target || !cue)
			return;

		if (typeof cue.getCueAsHTML === 'function') {
			try {
				target.appendChild(cue.getCueAsHTML());
				return;
			}
			catch (ignore) {}
		}

		this.AppendSubtitleMarkup(target, this.GetSubtitleCueText(cue));
	};

	AyleUI.prototype.GetSubtitleCueText = function (cue) {
		if (!cue)
			return '';

		if (cue.Text !== undefined)
			return String(cue.Text || '');

		if (cue.text !== undefined)
			return String(cue.text || '');

		return '';
	};

	AyleUI.prototype.GetActiveSubtitleText = function () {
		var cues = this.GetActiveSubtitleCues();
		var lines = [];
		var i = 0;

		while (i < cues.length) {
			var text = this.GetSubtitleCueText(cues[i]);

			if (text)
				lines.push(text);

			i++;
		}

		return lines.join('\n');
	};

	AyleUI.prototype.UpdateSubtitleOverlay = function () {
		var overlay = this.SubtitleOverlay;
		if (!overlay)
			return;

		overlay.innerHTML = '';

		if (this.Player.IsNativeSubtitlesActive()) {
			overlay.style.display = 'none';
			return;
		}

		var track = this.Player.State.SubtitleTrack;
		if (!track) {
			overlay.setAttribute('data-ayle-subtitle-state', 'no-track');
			overlay.style.display = 'none';
			return;
		}

		overlay.setAttribute('data-ayle-subtitle-track', String(track.ID || ''));
		overlay.setAttribute(
			'data-ayle-subtitle-offset',
			String(Number(this.Player.Options.SubtitleOffset) || 0)
		);

		var sourceTrack = track;
		var customCues = track.Cues || [];
		var i = 0;

		if (!customCues.length && this.Player.State.Source) {
			var sourceTracks = this.Player.State.Source.SubtitleTracks || [];

			while (i < sourceTracks.length) {
				if (String(sourceTracks[i].ID) === String(track.ID)) {
					sourceTrack = sourceTracks[i];
					customCues = sourceTrack.Cues || [];
					break;
				}
				i++;
			}
		}

		var cues = this.GetActiveSubtitleCues();

		if (!cues.length) {
			overlay.setAttribute(
				'data-ayle-subtitle-state',
				customCues.length ? 'no-active-cue' : 'no-cues'
			);
			overlay.setAttribute('data-ayle-subtitle-cues', String(customCues.length));
			overlay.style.display = 'none';
			return;
		}

		overlay.setAttribute('data-ayle-subtitle-state', 'visible');
		overlay.setAttribute('data-ayle-subtitle-cues', String(customCues.length));

		i = 0;
		while (i < cues.length) {
			var cue = cues[i];
			var node = document.createElement('div');
			node.className = 'ayle-subtitle-cue';

			this.AppendSubtitleCue(node, cue);

			overlay.appendChild(node);
			i++;
		}

		overlay.style.display = 'flex';
	};

	AyleUI.prototype.UpdateChapterMenu = function () {
		var chapters = this.Player.State.Chapters || [];
		var list = this.ChaptersList;

		if (!list) {
			if (this.ChaptersControl)
				this.ChaptersControl.style.display =
					chapters.length || this.Player.Options.ForceShowChaptersList ?
						'' : 'none';
			return;
		}

		list.innerHTML = '';
		var self = this;
		var i = 0;
		var count = chapters.length;

		while (i < count) {
			(function (chapter, index) {
				var button = document.createElement('button');
				button.type = 'button';
				button.className = 'ayle-chapter-item';
				button.setAttribute('role', 'menuitem');

				if (self.Player.State.Chapter === chapter)
					button.classList.add('is-active');

				var time = document.createElement('span');
				time.className = 'ayle-chapter-time';
				time.textContent = self._formatTime(chapter.Start);

				var title = document.createElement('span');
				title.className = 'ayle-chapter-title';
				title.textContent = chapter.Title || ('Chapter ' + (index + 1));

				button.appendChild(time);
				button.appendChild(title);
				button.onclick = function (event) {
					event.stopPropagation();
					self.Player.SetChapter(chapter);
					self._closePopovers();
				};

				list.appendChild(button);
			})(chapters[i], i);
			i++;
		}

		var visible = count > 0 || this.Player.Options.ForceShowChaptersList;

		if (this.ChaptersControl)
			this.ChaptersControl.style.display = visible ? '' : 'none';

		if (!visible)
			this._closePopovers();
	};

	AyleUI.prototype._getTimelinePosition = function (event) {
		var rect = this.Timeline.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var value = x / rect.width;

		if (value < 0)
			value = 0;
		if (value > 1)
			value = 1;

		return value;
	};

	AyleUI.prototype._getTimelineTime = function (event) {
		var duration = this.Player.State.Duration;
		if (!duration || !isFinite(duration))
			return 0;
		return duration * this._getTimelinePosition(event);
	};

	AyleUI.prototype._showPreview = function (event) {
		var value = this._getTimelinePosition(event);
		var time = this._getTimelineTime(event);
		this.Preview.style.left = (value * 100) + '%';
		this.PreviewTime.innerHTML = this._formatTime(time);
		this.Preview.style.display = 'block';
	};

	AyleUI.prototype._hidePreview = function () {
		if (!this._seeking)
			this.Preview.style.display = 'none';
	};

	AyleUI.prototype._beginSeek = function (event) {
		if (!this.Player.State.Duration || !isFinite(this.Player.State.Duration))
			return;

		this._seeking = true;
		this.Timeline.setPointerCapture(event.pointerId);
		this._updateSeek(event);
	};

	AyleUI.prototype._updateSeek = function (event) {
		if (!this._seeking)
			return;

		this._seekPosition = this._getTimelineTime(event);
		this._showPreview(event);
		this.UpdateTime();
	};

	AyleUI.prototype._endSeek = function (event) {
		if (!this._seeking)
			return;

		this._updateSeek(event);
		this._seeking = false;

		if (this.Timeline.hasPointerCapture && this.Timeline.hasPointerCapture(event.pointerId))
			this.Timeline.releasePointerCapture(event.pointerId);

		this.Player.Seek(this._seekPosition);
		this.Preview.style.display = 'none';
	};



	AyleUI.prototype.ScheduleSurfaceToggle = function () {
		var self = this;

		if (this._surfaceClickTimer)
			clearTimeout(this._surfaceClickTimer);

		this._surfaceClickTimer = setTimeout(function () {
			self._surfaceClickTimer = null;
			self.Player.Toggle();
		}, 210);
	};

	AyleUI.prototype.CancelSurfaceToggle = function () {
		if (!this._surfaceClickTimer)
			return;

		clearTimeout(this._surfaceClickTimer);
		this._surfaceClickTimer = null;
	};

	AyleUI.prototype.SuppressNextDocumentClick = function () {
		var done = false;

		var handler = function (event) {
			if (done)
				return;

			done = true;
			event.preventDefault();
			event.stopPropagation();

			if (event.stopImmediatePropagation)
				event.stopImmediatePropagation();

			document.removeEventListener('click', handler, true);
		};

		this._listen(document, 'click', handler, true);

		setTimeout(function () {
			if (done)
				return;

			done = true;
			document.removeEventListener('click', handler, true);
		}, 500);
	};

	AyleUI.prototype.SeekBy = function (delta) {
		var player = this.Player;
		delta = Number(delta || 0);

		if (!delta)
			return false;

		/*
		 * A Ayle can already have a playable Source while the underlying
		 * media/MSE pipeline is not ready to accept a real seek yet. This is
		 * especially visible when the user double-clicks immediately after the
		 * page appears: Driver.Seek() may accept currentTime syntactically, but
		 * the browser then keeps/clamps it at 0 until metadata/init are ready.
		 *
		 * Preserve that first quick-seek and apply it as soon as the Ayle is
		 * ready instead of silently losing it.
		 */
		if (
			!player.State.Ready ||
			!isFinite(player.State.Duration) ||
			player.State.Duration <= 0
		) {
			this._pendingQuickSeekDelta += delta;
			return true;
		}

		var duration = player.State.Duration;
		var position = Math.max(
			0,
			Math.min(duration, player.State.Position + delta)
		);

		return player.Seek(position);
	};

	AyleUI.prototype.FlushPendingQuickSeek = function () {
		if (!this._pendingQuickSeekDelta)
			return false;

		var player = this.Player;

		if (
			!player.State.Ready ||
			!isFinite(player.State.Duration) ||
			player.State.Duration <= 0
		)
			return false;

		var delta = this._pendingQuickSeekDelta;
		this._pendingQuickSeekDelta = 0;

		var position = Math.max(
			0,
			Math.min(
				player.State.Duration,
				player.State.Position + delta
			)
		);

		return player.Seek(position);
	};

	AyleUI.prototype._handleKey = function (event) {
		var self = this;
		var player = this.Player;
		var target = event.target;

		if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA'))
			return;

		var seek = function (delta) {
			self.SeekBy(delta);
		};

		/*
		 * YouTube-style comma/period shortcuts:
		 * the physical comma and period keys work without Shift.
		 * Shifted < / > therefore work too, but Shift is not required.
		 */
		var keyCode = event.keyCode || event.which || 0;

		var angleLeft = (
			event.key === '<' ||
			event.key === ',' ||
			event.code === 'Comma' ||
			keyCode === 188
		);

		var angleRight = (
			event.key === '>' ||
			event.key === '.' ||
			event.code === 'Period' ||
			keyCode === 190
		);

		if (angleLeft) {
			event.preventDefault();
			if (player.Options.Shortcuts.SeekAngle)
				seek(-player.GetKeyboardAngleSeekStep());
			return;
		}

		if (angleRight) {
			event.preventDefault();
			if (player.Options.Shortcuts.SeekAngle)
				seek(player.GetKeyboardAngleSeekStep());
			return;
		}

		switch (event.code) {
			case 'Escape':
				this._closePopovers();
				break;

			case 'Space':
				event.preventDefault();
				if (player.Options.Shortcuts.PlayPause)
					player.Toggle();
				break;

			case 'ArrowLeft':
				event.preventDefault();
				if (player.Options.Shortcuts.SeekArrows)
					seek(-player.Options.KeyboardArrowSeekStep);
				break;

			case 'ArrowRight':
				event.preventDefault();
				if (player.Options.Shortcuts.SeekArrows)
					seek(player.Options.KeyboardArrowSeekStep);
				break;

			case 'ArrowUp':
				event.preventDefault();
				if (player.Options.Shortcuts.Volume)
					player.SetVolume(Math.min(1, player.State.Volume + 0.05));
				break;

			case 'ArrowDown':
				event.preventDefault();
				if (player.Options.Shortcuts.Volume)
					player.SetVolume(Math.max(0, player.State.Volume - 0.05));
				break;

			case 'KeyM':
				if (player.Options.Shortcuts.Mute)
					player.SetMuted(!player.State.Muted);
				break;

			case 'KeyS':
				if (player.Options.Shortcuts.Subtitles)
					player.ToggleSubtitles();
				break;

			case 'KeyF':
				if (player.Options.Shortcuts.Fullscreen)
					this.ToggleFullscreen();
				break;

			case 'KeyP':
				if (player.Options.Shortcuts.PictureInPicture)
					this.TogglePictureInPicture();
				break;
		}
	};

	AyleUI.prototype.TogglePictureInPicture = function () {
		return this.Player.TogglePictureInPicture();
	};

	AyleUI.prototype.ToggleFullscreen = function () {
		if (document.fullscreenElement) {
			if (document.exitFullscreen)
				return document.exitFullscreen();
			return false;
		}

		if (this.Element.requestFullscreen)
			return this.Element.requestFullscreen();

		return false;
	};


	AyleUI.prototype._inlineToolbarOverflows = function () {
		if (!this.Controls)
			return false;

		var available = this.Controls.clientWidth || 0;

		if (!available)
			return false;

		/*
		 * Measure the actual inline composition instead of guessing from the
		 * Player width. Different toolbar presets can have radically different
		 * fixed-width controls, so a hard 760px breakpoint caused perfectly
		 * valid compact toolbars to jump to the multi-row layout.
		 */
		return this.Controls.scrollWidth > available + 1;
	};

	AyleUI.prototype.UpdateControlLayoutMode = function () {
		if (!this.Element || !this.Controls)
			return;

		var width =
			this.Element.clientWidth ||
			this.Element.getBoundingClientRect().width ||
			0;
		var layout = this.Player.Options.UI && this.Player.Options.UI.Toolbar ?
			this.Player.Options.UI.Toolbar.Layout : 'inline';

		/* Always measure from the normal inline geometry first. */
		this.Element.classList.remove('ayle-controls-narrow');
		this.Element.classList.remove('ayle-controls-very-narrow');
		this.Element.classList.remove('ayle-controls-timeline-top');
		this._applyToolbarLayoutGeometry();

		var inlineOverflow = this._inlineToolbarOverflows();
		var timelineTop = false;
		var narrow = false;

		if (layout === 'timeline-top')
			timelineTop = true;
		else if (layout === 'auto' && inlineOverflow)
			timelineTop = true;
		else if (layout === 'inline' && inlineOverflow)
			narrow = true;

		/*
		 * The explicit/automatic timeline-top layout itself can still become too
		 * wide on very small Players. In that case fall back to the narrow grid.
		 */
		if (timelineTop) {
			this.Element.classList.add('ayle-controls-timeline-top');
			this._applyToolbarLayoutGeometry();

			if (this.Controls.scrollWidth > this.Controls.clientWidth + 1) {
				timelineTop = false;
				narrow = true;
				this.Element.classList.remove('ayle-controls-timeline-top');
			}
		}

		var veryNarrow = narrow && width > 0 && width <= 430;

		this.Element.classList.toggle('ayle-controls-narrow', narrow);
		this.Element.classList.toggle('ayle-controls-very-narrow', veryNarrow);
		this.Element.classList.toggle('ayle-controls-timeline-top', timelineTop);
		this._applyToolbarLayoutGeometry();
	};

	AyleUI.prototype.ShowControls = function () {
		this._controlsVisible = true;
		this.Element.classList.remove('controls-hidden');
		this._scheduleControlsHide();
	};

	AyleUI.prototype.HideControls = function () {
		if (!this.Player.State.Playing || this._seeking || this._controlsHover)
			return;

		this._controlsVisible = false;
		this.Element.classList.add('controls-hidden');
	};

	AyleUI.prototype._scheduleControlsHide = function () {
		var self = this;

		if (this._controlsTimer)
			clearTimeout(this._controlsTimer);

		this._controlsTimer = null;

		if (!this.Player.State.Playing || this._controlsHover)
			return;

		this._controlsTimer = setTimeout(function () {
			self.HideControls();
		}, 2500);
	};

	AyleUI.prototype._bind = function () {
		var self = this;
		var player = this.Player;

		/*
		 * Any interaction with a Ayle control makes this Ayle the active
		 * keyboard target. Use pointerdown rather than click so focus is
		 * established immediately, including sliders/timeline dragging.
		 */
		this._listen(this.Element, 'pointerdown', function (event) {
			var target = event.target;

			if (!target || !target.closest)
				return;

			var control = target.closest(
				'button, input, select, textarea, [role="button"], [role="slider"], [data-ayle-control]'
			);

			if (!control || !self.Element.contains(control))
				return;

			/*
			 * Do not steal focus from controls where keyboard interaction with
			 * the control itself is meaningful.
			 */
			var tag = String(control.tagName || '').toLowerCase();

			if (tag === 'select' || tag === 'textarea')
				return;

			if (
				tag === 'input' &&
				String(control.type || '').toLowerCase() !== 'range' &&
				String(control.type || '').toLowerCase() !== 'button'
			)
				return;

			setTimeout(function () {
				self.Focus();
			}, 0);
		}, true);

		if (this.PreviousButton) {
			this.PreviousButton.onclick = function (event) {
				event.stopPropagation();
				player.Previous();
			};
		}

		if (this.PlayButton) {
			this.PlayButton.onclick = function (event) {
				event.stopPropagation();
				player.Toggle();
			};
		}

		if (this.NextButton) {
			this.NextButton.onclick = function (event) {
				event.stopPropagation();
				player.Next();
			};
		}

		if (this.Channel) {
			this._listen(this.Channel, 'click', function (event) {
				var channel = self.Player.Options.Integration && self.Player.Options.Integration.Channel;
				if (!channel) {
					event.preventDefault();
					return;
				}

				if (typeof channel.Action === 'function') {
					event.preventDefault();
					channel.Action(channel, self.Player);
					return;
				}

				if (!channel.URL)
					event.preventDefault();
			});
		}

		if (this.CenterPlayButton) {
			this.CenterPlayButton.onclick = function (event) {
				event.stopPropagation();
				self.ScheduleSurfaceToggle();
			};
		}

		this.Volume.oninput = function () {
			self.UpdateVolumeSlider();
			player.SetVolume(parseInt(self.Volume.value, 10) / 100);
		};

		this.Mute.onclick = function () {
			player.SetMuted(!player.State.Muted);
		};

		if (this.ChaptersButton) {
			this.ChaptersButton.onclick = function (event) {
				event.stopPropagation();
				self._togglePopover(self.ChaptersPopover, self.ChaptersButton);
			};
		}

		if (this.QualityButton) {
			this.QualityButton.onclick = function (event) {
				event.stopPropagation();
				self._togglePopover(self.QualityPopover, self.QualityButton);
			};
		}

		if (this.SettingsButton) {
			this.SettingsButton.onclick = function (event) {
				event.stopPropagation();
				self._togglePopover(self.SettingsPopover, self.SettingsButton);
			};
		}

		if (this.Fullscreen) {
			this.Fullscreen.onclick = function () {
				self.ToggleFullscreen();
			};
		}

		if (this.PictureInPicture) {
			this.PictureInPicture.onclick = function () {
				self.TogglePictureInPicture();
			};
		}

		if (this.Quality) {
			this.Quality.onchange = function () {
				player.SetVariantByID(self.Quality.value);
			};
		}

		if (this.QualityList) {
			this.QualityList.onclick = function (event) {
				var target = event.target;
				var button = target && target.closest ? target.closest('.ayle-quality-option') : null;
				if (!button || button.disabled)
					return;

				var id = button.getAttribute('data-quality-id');
				player.SetVariantByID(id);

				if (self.QualityPopover)
					self.QualityPopover.classList.remove('is-open');
				if (self.QualityButton)
					self.QualityButton.setAttribute('aria-expanded', 'false');
			};
		}

		if (this.Audio) {
			this.Audio.onchange = function () {
				player.SetAudioTrackByID(self.Audio.value);
			};
		}

		if (this.Subtitles) {
			this.Subtitles.onchange = function () {
				player.SetSubtitleTrackByID(self.Subtitles.value);
			};
		}

		if (this.AudioList) {
			this.AudioList.onclick = function (event) {
				var target = event.target;
				var button = target && target.closest ? target.closest('.ayle-audio-option') : null;
				if (!button)
					return;

				player.SetAudioTrackByID(button.getAttribute('data-audio-id'));
				self.CloseSettingsSubmenu();
			};
		}

		if (this.SubtitleList) {
			this.SubtitleList.onclick = function (event) {
				var target = event.target;
				var button = target && target.closest ? target.closest('.ayle-subtitle-option') : null;
				if (!button)
					return;

				player.SetSubtitleTrackByID(button.getAttribute('data-subtitle-id'));
				self.CloseSettingsSubmenu();
			};
		}

		if (this.AudioSubmenuButton) {
			this.AudioSubmenuButton.onclick = function (event) {
				event.stopPropagation();
				self.OpenSettingsSubmenu('audio');
			};
		}

		if (this.SubtitlesSubmenuButton) {
			this.SubtitlesSubmenuButton.onclick = function (event) {
				event.stopPropagation();
				self.OpenSettingsSubmenu('subtitles');
			};
		}

		if (this.SettingsBackButtons) {
			var backIndex = 0;
			while (backIndex < this.SettingsBackButtons.length) {
				this.SettingsBackButtons[backIndex].onclick = function (event) {
					event.stopPropagation();
					self.CloseSettingsSubmenu();
				};
				backIndex++;
			}
		}

		if (this.ShortcutsSubmenuButton) {
			this.ShortcutsSubmenuButton.onclick = function (event) {
				event.stopPropagation();
				self.OpenSettingsSubmenu('shortcuts');
			};
		}

		var bindShortcutToggle = function (input, name) {
			if (!input)
				return;

			input.onchange = function (event) {
				var enabled = !!input.checked;
				player.SetShortcut(name, enabled);

				var data = {
					Name: name,
					Value: enabled,
					Event: event,
					UI: self
				};

				player.Emit('shortcutSettingsChange', data);
				player.Emit('settingsChange', {
					Name: 'Shortcuts.' + name,
					Value: enabled,
					Event: event,
					UI: self
				});
			};
		};

		bindShortcutToggle(this.ShortcutPlayPauseToggle, 'PlayPause');
		bindShortcutToggle(this.ShortcutSeekArrowsToggle, 'SeekArrows');
		bindShortcutToggle(this.ShortcutSeekAngleToggle, 'SeekAngle');
		bindShortcutToggle(this.ShortcutVolumeToggle, 'Volume');
		bindShortcutToggle(this.ShortcutMuteToggle, 'Mute');
		bindShortcutToggle(this.ShortcutSubtitlesToggle, 'Subtitles');
		bindShortcutToggle(this.ShortcutFullscreenToggle, 'Fullscreen');
		bindShortcutToggle(this.ShortcutPictureInPictureToggle, 'PictureInPicture');

		if (this.DebugSubmenuButton) {
			this.DebugSubmenuButton.onclick = function (event) {
				event.stopPropagation();
				self.OpenSettingsSubmenu('debug');
			};
		}

		if (this.DebugToggle) {
			this.DebugToggle.onchange = function (event) {
				var enabled = !!self.DebugToggle.checked;
				player.SetDebug(enabled);

				var data = {
					Name: 'Debug',
					Value: enabled,
					Event: event,
					UI: self
				};

				player.Emit('debugSettingsChange', data);
				player.Emit('settingsChange', data);
			};
		}

		if (this.DebugMP4Toggle) {
			this.DebugMP4Toggle.onchange = function (event) {
				var enabled = !!self.DebugMP4Toggle.checked;
				player.SetDebugMP4(enabled);

				var data = {
					Name: 'DebugMP4',
					Value: enabled,
					Event: event,
					UI: self
				};

				player.Emit('debugMP4SettingsChange', data);
				player.Emit('settingsChange', data);
			};
		}

		if (this.AutoPlayToggle) {
			this.AutoPlayToggle.onchange = function (event) {
				var enabled = !!self.AutoPlayToggle.checked;
				player.SetAutoPlay(enabled);

				var data = {
					Name: 'AutoPlay',
					Value: enabled,
					Event: event,
					UI: self
				};

				player.Emit('autoplaySettingsChange', data);
				player.Emit('settingsChange', data);
			};
		}

		if (this.NativeSubtitlesToggle) {
			this.NativeSubtitlesToggle.onchange = function () {
				player.SetNativeSubtitles(!!self.NativeSubtitlesToggle.checked);
			};
		}

		if (this.AutoNativeSubtitlesInPictureInPictureToggle) {
			this.AutoNativeSubtitlesInPictureInPictureToggle.onchange = function () {
				player.SetAutoNativeSubtitlesInPictureInPicture(!!self.AutoNativeSubtitlesInPictureInPictureToggle.checked);
			};
		}


		this._listen(this.Timeline, 'pointerdown', function (event) {
			self._beginSeek(event);
		});

		this._listen(this.Timeline, 'pointermove', function (event) {
			if (self._seeking)
				self._updateSeek(event);
			else
				self._showPreview(event);
		});

		this._listen(this.Timeline, 'pointerup', function (event) {
			self._endSeek(event);
		});

		this._listen(this.Timeline, 'pointercancel', function (event) {
			self._seeking = false;
			self.Preview.style.display = 'none';
			if (self.Timeline.hasPointerCapture && self.Timeline.hasPointerCapture(event.pointerId))
				self.Timeline.releasePointerCapture(event.pointerId);
		});

		this._listen(this.Timeline, 'pointerleave', function () {
			self._hidePreview();
		});

		this._listen(this.Element, 'keydown', function (event) {
			self._handleKey(event);
		});

		this._listen(this.Element, 'pointerdown', function (event) {
			var target = event.target;
			var insideTrackCompactOverlay = target && target.closest ?
				target.closest('.ayle-overlay-track-compact') : null;

			/*
			 * On touch devices the first tap while controls are hidden is a UI
			 * reveal gesture, not a Play/Pause gesture. Remember that state
			 * before ShowControls() changes _controlsVisible.
			 */
			if (
				event.pointerType === 'touch' &&
				!self._controlsVisible &&
				self.Surface &&
				target &&
				self.Surface.contains(target)
			)
				self._touchRevealPending = true;
			else if (event.pointerType === 'touch')
				self._touchRevealPending = false;

			/*
			 * The player root has user-select:none and normally grabs focus on
			 * pointerdown. Do not do that for the interactive Now Playing popup:
			 * text selection and channel links must behave like ordinary HTML.
			 */
			if (insideTrackCompactOverlay)
				return;

			self.Element.focus();
			self.ShowControls();

			var insidePopover = target && target.closest ? target.closest('.ayle-popover-container') : null;
			if (!insidePopover)
				self._closePopovers();
		});

		this._listen(this.Element, 'pointermove', function () {
			self.ShowControls();
		});


		this._listen(this.Element, 'pointerup', function (event) {
			var target = event.target;

			if (
				target &&
				target.closest &&
				target.closest(
					'.ayle-controls, .ayle-header, .ayle-popover, ' +
					'.ayle-overlay-track-compact, .ayle-hint, a, input, select, textarea'
				)
			) {
				self._quickTapTime = 0;
				return;
			}

			/*
			 * The first touch while controls are hidden is reserved for
			 * revealing the UI. It must not participate in double-tap seek.
			 */
			if (event.pointerType === 'touch' && self._touchRevealPending) {
				self._quickTapTime = 0;
				return;
			}

			var now = Date.now();
			var pointerType = event.pointerType || 'mouse';
			var dx = event.clientX - self._quickTapX;
			var dy = event.clientY - self._quickTapY;
			var distance = Math.sqrt(dx * dx + dy * dy);

			var isDouble = !!(
				self._quickTapTime &&
				now - self._quickTapTime <= 190 &&
				self._quickTapPointerType === pointerType &&
				distance <= 64
			);

			if (!isDouble) {
				self._quickTapTime = now;
				self._quickTapX = event.clientX;
				self._quickTapY = event.clientY;
				self._quickTapPointerType = pointerType;
				return;
			}

			self._quickTapTime = 0;
			self.CancelSurfaceToggle();
			self.SuppressNextDocumentClick();

			event.preventDefault();

			if (event.stopPropagation)
				event.stopPropagation();

			if (event.stopImmediatePropagation)
				event.stopImmediatePropagation();

			var rect = self.Element.getBoundingClientRect();
			var x = event.clientX - rect.left;
			var ratio = rect.width > 0 ? x / rect.width : 0.5;
			var step = Math.abs(player.Options.KeyboardArrowSeekStep || 10);

			if (ratio < 1 / 3) {
				self.SeekBy(-step);
				return;
			}

			if (ratio > 2 / 3) {
				self.SeekBy(step);
				return;
			}

			self.ToggleFullscreen();
		}, true);




		this._documentPointerDownHandler = function (event) {
			if (!self.Element.contains(event.target)) {
				self._closePopovers();
				return;
			}

			var i = 0;
			while (i < self._toolbarCustomMenus.length) {
				var pair = self._toolbarCustomMenus[i];

				if (
					pair.Popover &&
					pair.Popover.classList.contains('is-open') &&
					!pair.Popover.contains(event.target) &&
					!pair.Button.contains(event.target)
				) {
					pair.Popover.classList.remove('is-open');
					pair.Button.setAttribute('aria-expanded', 'false');
				}

				i++;
			}
		};

		this._listen(document, 'pointerdown', this._documentPointerDownHandler);

		this._listen(this.Controls, 'pointerenter', function () {
			self._controlsHover = true;
			if (self._controlsTimer) {
				clearTimeout(self._controlsTimer);
				self._controlsTimer = null;
			}
		});

		this._listen(this.Controls, 'pointerleave', function () {
			self._controlsHover = false;
			self._scheduleControlsHide();
		});

		if (this.Surface) {
			this.Surface.onclick = function (event) {
				/*
				 * Consume the click generated by the touch that merely revealed
				 * hidden controls. The next tap behaves normally.
				 */
				if (
					self._touchRevealPending &&
					(!event || !event.pointerType || event.pointerType === 'touch')
				) {
					self._touchRevealPending = false;

					self.CancelSurfaceToggle();
					return;
				}

				self._touchRevealPending = false;

				self.ScheduleSurfaceToggle();
			};

		}

		this._fullscreenChangeHandler = function () {
			self._quickTapTime = 0;
			self._quickTapPointerType = '';
			self.CancelSurfaceToggle();

			self.UpdateFullscreenButton();
			self.ScheduleSafeAreaUpdate();

			if (self.SettingsPopover && self.SettingsPopover.classList.contains('is-open'))
				self.UpdatePopoverBounds(self.SettingsPopover);
		};

		this._listen(document, 'fullscreenchange', this._fullscreenChangeHandler);

		var mediaElement = player.Driver ? player.Driver.Element : null;
		if (mediaElement) {
			this._listen(mediaElement, 'enterpictureinpicture', function () {
				self.UpdatePictureInPictureButton();
			});
			this._listen(mediaElement, 'leavepictureinpicture', function () {
				self.UpdatePictureInPictureButton();
			});
		}

		this._onPlayer(player, 'timeUpdate', function () {
			self.UpdateTime();
			self.UpdateSubtitleOverlay();
			self.UpdateTrackCompactOverlaySubtitle();
			self.UpdateHints();
		});

		this._onPlayer(player, 'hintsChange', function () {
			self.UpdateHints();
		});

		this._onPlayer(player, 'hintRenderersChange', function () {
			self.ResetHints();
		});

		this._onPlayer(player, 'hintSafeAreaChange', function () {
			self.ScheduleSafeAreaUpdate();
		});

		this._onPlayer(player, 'autoplayChange', function () {
			self.UpdateAutoPlaySettings();
		});

		this._onPlayer(player, 'debugChange', function () {
			self.UpdateDebugSettings();
		});

		this._onPlayer(player, 'debugMP4Change', function () {
			self.UpdateDebugSettings();
		});

		this._onPlayer(player, 'shortcutChange', function () {
			self.UpdateShortcutsSettings();
		});


		this._onPlayer(player, 'settingsOrderChange', function () {
			self.ApplySettingsOrder();
		});


		this._onPlayer(player, 'fontFamilyChange', function () {
			self.ApplyPlayerStyle();
		});

		this._onPlayer(player, 'mediaModeChange', function () {
			self.ApplyMediaMode();
			self.UpdatePlayButton();

			if (self.Player.State.MediaMode === 'video' && !self._artworkSlideshowPlayed)
				self.StartArtworkSlideshow();
			else
				self.StopArtworkSlideshow('media-mode');

			self.UpdatePictureInPictureButton();
			self.UpdateQualityMenu();
			self.UpdateShortcutsSettings();
			self.ApplySettingsOrder();
			self.UpdateSettingsVisibility();
		});

		this._onPlayer(player, 'sourceChange', function () {
			self._pendingQuickSeekDelta = 0;
			player.State.VideoWidth = 0;
			player.State.VideoHeight = 0;
			self._artworkSlideshowPlayed = false;
			self.ApplyMediaMode();
			self.UpdatePlayButton();
			self.UpdateTrackCompactOverlay(true);
			self.StartArtworkSlideshow();
		});

		this._onPlayer(player, 'uiChange', function () {
			self.ApplyUIComposition();
			self.ApplyToolbar();
			self.ApplyTrackCompactOverlayMode(true);
		});

		this._onPlayer(player, 'playlistChange', function () {
			self.ApplyToolbar();
			self.UpdatePlaylistButtons();
			self.UpdateMediaSession();
		});

		this._onPlayer(player, 'playlistItemChange', function () {
			self.ApplyToolbar();
			self.UpdatePlaylistButtons();
			self.UpdateMediaSession();
		});

		this._onPlayer(player, 'playlistAutoAdvanceStart', function (context) {
			self.StartPlaylistAutoAdvanceCountdown(context);
			self.ShowControls();
		});

		this._onPlayer(player, 'playlistAutoAdvanceCancel', function () {
			self.StopPlaylistAutoAdvanceCountdown();
		});

		this._onPlayer(player, 'playlistAutoAdvanceComplete', function () {
			self.StopPlaylistAutoAdvanceCountdown();
		});

		this._onPlayer(player, 'audioVisualChange', function () {
			self.ApplyMediaMode();
		});

		this._onPlayer(player, 'localizationChange', function () {
			self.ApplyLocalization();
		});

		this._onPlayer(player, 'durationChange', function () {
			self.UpdateTimeWidth();
			self.UpdateTime();
			self.UpdateTimelineRanges();
			self.UpdateMediaSession();
			self.FlushPendingQuickSeek();
		});

		this._onPlayer(player, 'progress', function () {
			self.UpdateBuffer();
		});

		this._onPlayer(player, 'play', function () {
			self.UpdateMediaSession();
			self._artworkSlideshowPlayed = true;
			self.StopArtworkSlideshow('playback');
			self.UpdatePlayButton();
			self._scheduleControlsHide();
		});

		this._onPlayer(player, 'pause', function () {
			self.UpdateMediaSession();
			self.UpdatePlayButton();
			self.ShowControls();
		});

		this._onPlayer(player, 'ended', function () {
			if (self._loadingTimer) {
				clearTimeout(self._loadingTimer);
				self._loadingTimer = null;
			}

			self._setLoadingVisible(false);
			self.UpdateTime();
			self.UpdatePlayButton();
			self.ShowControls();
		});

		this._onPlayer(player, 'loadStart', function () {
			self.UpdateLoading();
		});

		this._onPlayer(player, 'ready', function () {
			self.UpdateLoading();
			self.FlushPendingQuickSeek();

		});

		this._onPlayer(player, 'buffering', function () {
			self.UpdateLoading();
		});

		this._onPlayer(player, 'seeking', function () {
			self.UpdateLoading();
		});

		this._onPlayer(player, 'playing', function () {
			self.UpdateLoading();
		});

		this._onPlayer(player, 'error', function () {
			self.UpdateLoading();
			self.UpdatePlayButton();
		});


		this._onPlayer(player, 'stateChange', function () {
			self.UpdatePlayButton();
			self.UpdateLoading();
		});

		this._onPlayer(player, 'emptyPlay', function () {
			self.UpdateLoading();
			self.UpdatePlayButton();
		});

		this._onPlayer(player, 'playUnavailable', function (data) {
			self.Element.setAttribute(
				'data-ayle-play-unavailable',
				data && data.Reason ? data.Reason : 'unknown'
			);
			self.Element.classList.add('is-play-unavailable');

			if (self._playUnavailableTimer)
				clearTimeout(self._playUnavailableTimer);

			self._playUnavailableTimer = setTimeout(function () {
				self._playUnavailableTimer = null;
				self.Element.classList.remove('is-play-unavailable');
			}, 700);
		});

		this._onPlayer(player, 'volumeChange', function (data) {
			self.Volume.value = Math.round(data.Volume * 100);
			self.UpdateVolumeSlider();
			self.UpdateVolumeButton();
		});

		this._onPlayer(player, 'variantsChange', function () {
			self.UpdateQualityMenu();
		});

		this._onPlayer(player, 'variantChange', function () {
			self.UpdateQualityMenu();
		});

		this._onPlayer(player, 'variantSwitched', function () {
			self.UpdateQualityMenu();
		});

		this._onPlayer(player, 'variantSwitchError', function () {
			self.UpdateQualityMenu();
		});

		this._onPlayer(player, 'audioTracksChange', function () {
			self.UpdateAudioMenu();
		});

		this._onPlayer(player, 'audioTrackChange', function () {
			self.UpdateAudioMenu();
		});

		this._onPlayer(player, 'subtitleTracksChange', function () {
			self.UpdateSubtitleMenu();
			self.UpdateSubtitleTrackBinding();
			self.UpdateSubtitleOverlay();
			self.UpdateTrackCompactOverlaySubtitle();
			self.ApplyMediaMode();
		});

		this._onPlayer(player, 'subtitleTrackChange', function () {
			self.UpdateSubtitleMenu();
			self.UpdateSubtitleTrackBinding();
			self.UpdateSubtitleOverlay();
			self.UpdateTrackCompactOverlaySubtitle();
			self.ApplyMediaMode();
		});

		this._onPlayer(player, 'subtitleDataChange', function () {
			self.UpdateSubtitleOverlay();
			self.UpdateTrackCompactOverlaySubtitle();
			self.ApplyMediaMode();
		});

		this._onPlayer(player, 'subtitleOffsetChange', function () {
			self.UpdateSubtitleOverlay();
			self.UpdateTrackCompactOverlaySubtitle();
		});

		this._onPlayer(player, 'chaptersChange', function () {
			self.UpdateChapterMenu();
		});

		this._onPlayer(player, 'sourceChange', function () {
			self.UpdateTimelineRanges();
			self.UpdateMediaSession();
			self.UpdateTimeWidth();
			self.UpdateTitle();
			self.UpdatePlayButton();
			self.UpdateLoading();
			self.ResetHints();
		});

		this._onPlayer(player, 'chapterChange', function () {
			self.UpdateChapterMenu();
			self.UpdateTitle();
			self.UpdateTrackCompactOverlay(true);
		});

		this._onPlayer(player, 'integrationChange', function () {
			self.ApplyToolbar();
			self.UpdateTimelineRanges();
			self.UpdateMediaSession();
			self.UpdateTitle();
			self.ResetHints();
			self.UpdateIntegrationSettings();
			self.UpdateTrackCompactOverlay(true);
		});

		this._onPlayer(player, 'subtitleStyleChange', function () {
			self.ApplySubtitleStyle();
		});

		this._onPlayer(player, 'nativeSubtitlesChange', function () {
			self.UpdateSubtitleSettings();
			self.UpdateSubtitleTrackBinding();
			self.UpdateSubtitleOverlay();
		});

		this._onPlayer(player, 'autoNativeSubtitlesInPictureInPictureChange', function () {
			self.UpdateSubtitleSettings();
		});
	};

	global.AyleEventEmitter = AyleEventEmitter;
	global.AyleMediaVariant = AyleMediaVariant;
	global.AyleMediaTrack = AyleMediaTrack;
	global.AyleMediaCover = AyleMediaCover;
	global.AyleMediaChapter = AyleMediaChapter;
	global.AyleSource = AyleSource;
	global.AyleMediaDriver = AyleMediaDriver;
	global.AyleHTML5MediaDriver = AyleHTML5MediaDriver;
	global.AyleMSEMediaDriver = AyleMSEMediaDriver;
	Ayle.DefaultLocalization = PlayerDefaultLocalization;
	Ayle.RussianLocalization = PlayerRussianLocalization;
	Ayle.MoldovanLocalization = PlayerMoldovanLocalization;
	Ayle.GermanLocalization = PlayerGermanLocalization;
	Ayle.SpanishLocalization = PlayerSpanishLocalization;
	Ayle.FrenchLocalization = PlayerFrenchLocalization;
	Ayle.ChineseLocalization = PlayerChineseLocalization;
	Ayle.JapaneseLocalization = PlayerJapaneseLocalization;
	Ayle.GreekLocalization = PlayerGreekLocalization;
	Ayle.ItalianLocalization = PlayerItalianLocalization;
	Ayle.TurkishLocalization = PlayerTurkishLocalization;
	Ayle.ArabicLocalization = PlayerArabicLocalization;
	Ayle.HindiLocalization = PlayerHindiLocalization;

	Ayle.Localizations = {
		'en': null,
		'en-US': null,
		'ru': PlayerRussianLocalization,
		'ru-RU': PlayerRussianLocalization,
		'ru-MD': PlayerRussianLocalization,
		'ro': PlayerMoldovanLocalization,
		'ro-MD': PlayerMoldovanLocalization,
		'md': PlayerMoldovanLocalization,
		'md-MD': PlayerMoldovanLocalization,
		'de': PlayerGermanLocalization,
		'es': PlayerSpanishLocalization,
		'fr': PlayerFrenchLocalization,
		'zh': PlayerChineseLocalization,
		'zh-CN': PlayerChineseLocalization,
		'ja': PlayerJapaneseLocalization,
		'el': PlayerGreekLocalization,
		'it': PlayerItalianLocalization,
		'tr': PlayerTurkishLocalization,
		'ar': PlayerArabicLocalization,
		'hi': PlayerHindiLocalization,
		'hi-IN': PlayerHindiLocalization
	};


	AyleUI.prototype.Destroy = function () {
		this.StopPlaylistAutoAdvanceCountdown();
		this.StopArtworkSlideshow('destroy');
		this._unbindPlayerListeners();
		this._unbindDOMListeners();

		if (this._controlsTimer) clearTimeout(this._controlsTimer);
		if (this._trackCompactOverlayTimer) clearTimeout(this._trackCompactOverlayTimer);
		if (this._trackCompactOverlayHideTimer) clearTimeout(this._trackCompactOverlayHideTimer);
		if (this._safeAreaUpdateTimer) clearTimeout(this._safeAreaUpdateTimer);

		this._controlsTimer = null;
		this._trackCompactOverlayTimer = null;
		this._trackCompactOverlayHideTimer = null;
		this._safeAreaUpdateTimer = null;

		if (this._trackCompactOverlayPositionHandler) {
			window.removeEventListener('resize', this._trackCompactOverlayPositionHandler);
			window.removeEventListener('scroll', this._trackCompactOverlayPositionHandler, true);
			this._trackCompactOverlayPositionHandler = null;
		}

		if (this._safeAreaResizeHandler) {
			global.removeEventListener('resize', this._safeAreaResizeHandler);
			this._safeAreaResizeHandler = null;
		}

		if (this._safeAreaScrollHandler) {
			global.removeEventListener('scroll', this._safeAreaScrollHandler, true);
			this._safeAreaScrollHandler = null;
		}

		if (this._documentPointerDownHandler) {
			document.removeEventListener('pointerdown', this._documentPointerDownHandler);
			this._documentPointerDownHandler = null;
		}

		if (this._fullscreenChangeHandler) {
			document.removeEventListener('fullscreenchange', this._fullscreenChangeHandler);
			this._fullscreenChangeHandler = null;
		}

		if (this._safeAreaObserver) {
			this._safeAreaObserver.disconnect();
			this._safeAreaObserver = null;
		}

		if (this._popoverResizeObserver) {
			this._popoverResizeObserver.disconnect();
			this._popoverResizeObserver = null;
		}

		if (this.Surface)
			this.Surface.onclick = null;

		this.Player = null;
		return this;
	};


	Ayle.Init = function (target, config) {
		var player = new Ayle(config || {});

		try {
			return player.AttachUI(target);
		}
		catch (error) {
			player.Destroy();
			throw error;
		}
	};

	global.Ayle = Ayle;
	global.AyleMediaProvider = AyleMediaProvider;
	global.AyleHTTPMediaProvider = AyleHTTPMediaProvider;
	global.AyleUI = AyleUI;
})(window);