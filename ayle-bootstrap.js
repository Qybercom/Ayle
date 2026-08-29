(function (global) {
	'use strict';

	function AyleBootstrap (options) {
		this.Options = AyleBootstrap.Merge({
			AssetBase: '',
			AutoInit: true,
			Selector: 'script[type="application/json"][data-ayle]',
			Player: {}
		}, options || {});
		this.Instances = {};
		this.List = [];
		this._counter = 0;
	}


	AyleBootstrap.IconSpriteSymbols = "<symbol id=\"icon-play\" viewBox=\"0 0 24 24\">\n    <path d=\"M8 5.2v13.6c0 .76.84 1.22 1.48.81l10.07-6.8a.96.96 0 0 0 0-1.62L9.48 4.39A.96.96 0 0 0 8 5.2Z\" fill=\"currentColor\"/>\n  </symbol>\n  <symbol id=\"icon-pause\" viewBox=\"0 0 24 24\">\n    <rect x=\"6.5\" y=\"5\" width=\"4\" height=\"14\" rx=\"1\" fill=\"currentColor\"/>\n    <rect x=\"13.5\" y=\"5\" width=\"4\" height=\"14\" rx=\"1\" fill=\"currentColor\"/>\n  </symbol>\n  <symbol id=\"icon-volume\" viewBox=\"0 0 24 24\">\n    <path d=\"M4.5 9.5h4L13 6v12l-4.5-3.5h-4Z\" fill=\"currentColor\"/>\n    <path d=\"M15.4 9a4.25 4.25 0 0 1 0 6M17.8 6.6a7.65 7.65 0 0 1 0 10.8\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/>\n  </symbol>\n  <symbol id=\"icon-chapters\" viewBox=\"0 0 24 24\">\n    <path d=\"M8.5 6.5h10M8.5 12h10M8.5 17.5h10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/>\n    <circle cx=\"5\" cy=\"6.5\" r=\"1.25\" fill=\"currentColor\"/>\n    <circle cx=\"5\" cy=\"12\" r=\"1.25\" fill=\"currentColor\"/>\n    <circle cx=\"5\" cy=\"17.5\" r=\"1.25\" fill=\"currentColor\"/>\n  </symbol>\n  <symbol id=\"icon-settings\" viewBox=\"0 0 24 24\">\n    <path d=\"M12 8.3a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4Z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/>\n    <path d=\"M19.2 13.25a7.8 7.8 0 0 0 .05-1.25 7.8 7.8 0 0 0-.05-1.25l2-1.55-2-3.45-2.47 1a8.1 8.1 0 0 0-2.15-1.25L14.2 3h-4.4l-.38 2.5a8.1 8.1 0 0 0-2.15 1.25l-2.47-1-2 3.45 2 1.55A7.8 7.8 0 0 0 4.75 12c0 .42.02.84.05 1.25l-2 1.55 2 3.45 2.47-1a8.1 8.1 0 0 0 2.15 1.25l.38 2.5h4.4l.38-2.5a8.1 8.1 0 0 0 2.15-1.25l2.47 1 2-3.45-2-1.55Z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.45\" stroke-linejoin=\"round\"/>\n  </symbol>\n  <symbol id=\"icon-fullscreen-enter\" viewBox=\"0 0 24 24\">\n    <path d=\"M4.5 9V5.5a1 1 0 0 1 1-1H9M15 4.5h3.5a1 1 0 0 1 1 1V9M19.5 15v3.5a1 1 0 0 1-1 1H15M9 19.5H5.5a1 1 0 0 1-1-1V15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n  </symbol>\n  <symbol id=\"icon-fullscreen-exit\" viewBox=\"0 0 24 24\">\n    <path d=\"M9 4.5V8a1 1 0 0 1-1 1H4.5M19.5 9H16a1 1 0 0 1-1-1V4.5M15 19.5V16a1 1 0 0 1 1-1h3.5M4.5 15H8a1 1 0 0 1 1 1v3.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n  </symbol>\n  <symbol id=\"icon-pip\" viewBox=\"0 0 24 24\">\n    <rect x=\"3.5\" y=\"5\" width=\"17\" height=\"14\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/>\n    <rect x=\"12.5\" y=\"11.5\" width=\"6\" height=\"4.5\" rx=\".8\" fill=\"currentColor\"/>\n  </symbol>";

	AyleBootstrap.EnsureIconSprite = function () {
		if (document.getElementById('ayle-icon-sprite'))
			return;

		var holder = document.createElement('div');
		holder.innerHTML =
			'<svg id="ayle-icon-sprite" xmlns="http://www.w3.org/2000/svg" ' +
			'aria-hidden="true" focusable="false" ' +
			'style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none">' +
			AyleBootstrap.IconSpriteSymbols +
			'</svg>';

		var sprite = holder.firstChild;
		(document.body || document.documentElement).appendChild(sprite);
	};

	AyleBootstrap.Template = "<video class=\"ayle-media ayle-video\" preload=\"metadata\"></video>\n\t<div class=\"ayle-artwork-slideshow\" aria-hidden=\"true\">\n\t\t<img class=\"ayle-artwork-slide ayle-artwork-slide-a\" alt=\"\">\n\t\t<img class=\"ayle-artwork-slide ayle-artwork-slide-b\" alt=\"\">\n\t</div>\n\t<img class=\"ayle-audio-cover\" alt=\"\">\n\t<div class=\"ayle-surface\"></div>\n\t<button class=\"ayle-icon-button ayle-center-play\" type=\"button\" data-ayle-i18n-label=\"play\" aria-label=\"Play\" title=\"Play\">\n\t\t<svg class=\"ayle-icon ayle-icon-play\" aria-hidden=\"true\"><use href=\"#icon-play\"></use></svg>\n\t\t<svg class=\"ayle-icon ayle-icon-pause\" aria-hidden=\"true\"><use href=\"#icon-pause\"></use></svg>\n\t</button>\n\t<div class=\"ayle-header\">\n\t\t<div class=\"ayle-channel\">\n\t\t\t<img class=\"ayle-channel-avatar\" alt=\"\">\n\t\t\t<div class=\"ayle-channel-info\">\n\t\t\t\t<div class=\"ayle-channel-name\"></div>\n\t\t\t\t<a class=\"ayle-channel-profile\" href=\"#\"></a>\n\t\t\t</div>\n\t\t</div>\n\t\t<div class=\"ayle-title\">\n\t\t\t<div class=\"ayle-title-media\"></div>\n\t\t\t<div class=\"ayle-title-chapter\"></div>\n\t\t</div>\n\t</div>\n\t<div class=\"ayle-hints\" aria-live=\"polite\"></div>\n\t<div class=\"ayle-subtitle-overlay\" aria-live=\"off\"></div>\n\n\t<div class=\"ayle-minimal-info\" aria-live=\"polite\">\n\t\t<img class=\"ayle-minimal-info-artwork\" alt=\"\">\n\t\t<div class=\"ayle-minimal-info-body\">\n\t\t\t<div class=\"ayle-minimal-info-title\"></div>\n\t\t\t<div class=\"ayle-minimal-info-meta\"></div>\n\t\t\t<div class=\"ayle-minimal-info-subtitle\" aria-live=\"off\"></div>\n\t\t\t<div class=\"ayle-minimal-info-channel\">\n\t\t\t\t<img class=\"ayle-minimal-info-channel-avatar\" alt=\"\">\n\t\t\t\t<a class=\"ayle-minimal-info-channel-text\"></a>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t<div class=\"ayle-minimal-subtitle-popup\" aria-live=\"off\">\n\t\t<div class=\"ayle-minimal-subtitle-popup-text\">&nbsp;</div>\n\t</div>\n\n\t<div class=\"ayle-loading\" aria-label=\"Loading\">\n\t\t<svg class=\"ayle-loading-icon\" viewBox=\"0 0 48 48\" role=\"img\" aria-label=\"Loading\"><circle cx=\"24\" cy=\"24\" r=\"18\" fill=\"none\" stroke=\"rgba(255,255,255,.22)\" stroke-width=\"4\"/><path d=\"M24 6a18 18 0 0 1 18 18\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\" stroke-linecap=\"round\"/></svg>\n\t</div>\n\n\t\t<div class=\"ayle-controls\">\n\t\t<div class=\"ayle-timeline\">\n\t\t\t<div class=\"ayle-buffered\"></div>\n\t\t\t<div class=\"ayle-progress\"></div>\n\t\t\t<div class=\"ayle-handle\"></div>\n\t\t\t<div class=\"ayle-preview\"><div class=\"ayle-preview-time\">0:00</div></div>\n\t\t</div>\n\n\t\t<div class=\"ayle-primary-left\">\n\t\t\t<button class=\"ayle-icon-button ayle-play\" type=\"button\" data-ayle-i18n-label=\"play\" aria-label=\"Play\" title=\"Play\">\n\t\t\t\t<svg class=\"ayle-icon ayle-icon-play\" aria-hidden=\"true\"><use href=\"#icon-play\"></use></svg>\n\t\t\t\t<svg class=\"ayle-icon ayle-icon-pause\" aria-hidden=\"true\"><use href=\"#icon-pause\"></use></svg>\n\t\t\t</button>\n\t\t\t<div class=\"ayle-time\"><span class=\"ayle-current\">0:00</span><span>/</span><span class=\"ayle-duration\">0:00</span></div>\n\t\t</div>\n\n\t\t<div class=\"ayle-volume-control\">\n\t\t\t<button class=\"ayle-icon-button ayle-mute\" type=\"button\" data-ayle-i18n-label=\"mute\" aria-label=\"Mute\" title=\"Mute\">\n\t\t\t\t<svg class=\"ayle-icon\" aria-hidden=\"true\"><use href=\"#icon-volume\"></use></svg>\n\t\t\t</button>\n\t\t\t<input class=\"ayle-volume\" type=\"range\" min=\"0\" max=\"100\" value=\"100\" aria-label=\"Volume\">\n\t\t</div>\n\n\t\t<div class=\"ayle-popover-container ayle-chapters-control\">\n\t\t\t<button class=\"ayle-icon-button ayle-chapters-button\" type=\"button\" data-ayle-i18n-label=\"chapters\" aria-label=\"Chapters\" title=\"Chapters\" aria-expanded=\"false\">\n\t\t\t\t<svg class=\"ayle-icon\" aria-hidden=\"true\"><use href=\"#icon-chapters\"></use></svg>\n\t\t\t</button>\n\t\t\t<div class=\"ayle-popover ayle-chapters-popover\" role=\"menu\" aria-label=\"Chapters\">\n\t\t\t\t<div class=\"ayle-chapters-list\"></div>\n\t\t\t</div>\n\t\t</div>\n\n\t\t<div class=\"ayle-popover-container ayle-quality-control\">\n\t\t\t<button class=\"ayle-quality-button\" type=\"button\" data-ayle-i18n-label=\"videoQuality\" aria-label=\"Video quality\" title=\"Video quality\" aria-expanded=\"false\">\n\t\t\t\t<span class=\"ayle-quality-button-name\" data-ayle-i18n=\"quality\">Quality</span>\n\t\t\t\t<span class=\"ayle-quality-badge\" aria-hidden=\"true\"></span>\n\t\t\t</button>\n\t\t\t<div class=\"ayle-popover ayle-quality-popover\" role=\"menu\" aria-label=\"Video quality\">\n\t\t\t\t<div class=\"ayle-quality-list\" role=\"radiogroup\" aria-label=\"Video quality\"></div>\n\t\t\t\t<select class=\"ayle-quality ayle-quality-native\" data-ayle-i18n-title=\"quality\" title=\"Quality\" aria-hidden=\"true\" tabindex=\"-1\"></select>\n\t\t\t</div>\n\t\t</div>\n\n\t\t<div class=\"ayle-popover-container ayle-settings-control\">\n\t\t\t<button class=\"ayle-icon-button ayle-settings-button\" type=\"button\" data-ayle-i18n-label=\"settings\" aria-label=\"Settings\" title=\"Settings\" aria-expanded=\"false\">\n\t\t\t\t<svg class=\"ayle-icon\" aria-hidden=\"true\"><use href=\"#icon-settings\"></use></svg>\n\t\t\t</button>\n\t\t\t<div class=\"ayle-popover ayle-settings-popover\">\n\t\t\t\t<div class=\"ayle-settings-page ayle-settings-page-main is-active\" data-settings-page=\"main\">\n\t\t\t\t\t<label class=\"ayle-settings-toggle ayle-playback-settings\" data-ayle-settings-item=\"autoplay\">\n\t\t\t\t\t\t<span data-ayle-i18n=\"autoplay\">Autoplay</span>\n\t\t\t\t\t\t<input class=\"ayle-autoplay-toggle\" type=\"checkbox\">\n\t\t\t\t\t\t<span class=\"ayle-toggle-switch\" aria-hidden=\"true\"></span>\n\t\t\t\t\t</label>\n\n\t\t\t\t\t<button class=\"ayle-settings-submenu-item ayle-audio-submenu-button\" data-ayle-settings-item=\"audio\" type=\"button\">\n\t\t\t\t\t\t<span class=\"ayle-settings-submenu-label\" data-ayle-i18n=\"audio\">Audio</span>\n\t\t\t\t\t\t<span class=\"ayle-settings-submenu-value ayle-audio-submenu-value\"></span>\n\t\t\t\t\t\t<span class=\"ayle-settings-submenu-arrow\" aria-hidden=\"true\">\u203a</span>\n\t\t\t\t\t</button>\n\n\t\t\t\t\t<button class=\"ayle-settings-submenu-item ayle-subtitles-submenu-button\" data-ayle-settings-item=\"subtitles\" type=\"button\">\n\t\t\t\t\t\t<span class=\"ayle-settings-submenu-label\" data-ayle-i18n=\"subtitles\">Subtitles</span>\n\t\t\t\t\t\t<span class=\"ayle-settings-submenu-value ayle-subtitles-submenu-value\"></span>\n\t\t\t\t\t\t<span class=\"ayle-settings-submenu-arrow\" aria-hidden=\"true\">\u203a</span>\n\t\t\t\t\t</button>\n\n\t\t\t\t\t<button class=\"ayle-settings-submenu-item ayle-debug-submenu-button\" data-ayle-settings-item=\"debug\" type=\"button\">\n\t\t\t\t\t\t<span class=\"ayle-settings-submenu-label\" data-ayle-i18n=\"debug\">Debug</span>\n\t\t\t\t\t\t<span class=\"ayle-settings-submenu-value\"></span>\n\t\t\t\t\t\t<span class=\"ayle-settings-submenu-arrow\" aria-hidden=\"true\">\u203a</span>\n\t\t\t\t\t</button>\n\n\t\t\t\t\t<button class=\"ayle-settings-submenu-item ayle-shortcuts-submenu-button\" data-ayle-settings-item=\"shortcuts\" type=\"button\">\n\t\t\t\t\t\t<span class=\"ayle-settings-submenu-label\" data-ayle-i18n=\"shortcuts\">Shortcuts</span>\n\t\t\t\t\t\t<span class=\"ayle-settings-submenu-value\"></span>\n\t\t\t\t\t\t<span class=\"ayle-settings-submenu-arrow\" aria-hidden=\"true\">\u203a</span>\n\t\t\t\t\t</button>\n\n\t\t\t\t\t<div class=\"ayle-integration-settings\" data-ayle-settings-item=\"integration\" style=\"display:none\">\n\t\t\t\t\t\t<div class=\"ayle-integration-settings-list\"></div>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<label class=\"ayle-settings-toggle\" data-ayle-settings-item=\"nativeSubtitles\">\n\t\t\t\t\t\t<span data-ayle-i18n=\"nativeSubtitles\">Native subtitles</span>\n\t\t\t\t\t\t<input class=\"ayle-native-subtitles-toggle\" type=\"checkbox\">\n\t\t\t\t\t\t<span class=\"ayle-toggle-switch\" aria-hidden=\"true\"></span>\n\t\t\t\t\t</label>\n\n\t\t\t\t\t<label class=\"ayle-settings-toggle\" data-ayle-settings-item=\"nativeSubtitlesInPiP\">\n\t\t\t\t\t\t<span data-ayle-i18n=\"nativeSubtitlesInPiP\">Native subtitles in PiP</span>\n\t\t\t\t\t\t<input class=\"ayle-pip-native-subtitles-toggle\" type=\"checkbox\">\n\t\t\t\t\t\t<span class=\"ayle-toggle-switch\" aria-hidden=\"true\"></span>\n\t\t\t\t\t</label>\n\t\t\t\t</div>\n\n\t\t\t\t<div class=\"ayle-settings-page\" data-settings-page=\"audio\">\n\t\t\t\t\t<div class=\"ayle-settings-submenu-header\">\n\t\t\t\t\t\t<button class=\"ayle-settings-back\" type=\"button\" data-ayle-i18n-label=\"back\" aria-label=\"Back\" title=\"Back\">\u2039</button>\n\t\t\t\t\t\t<div class=\"ayle-settings-submenu-title\" data-ayle-i18n=\"audio\">Audio</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"ayle-settings-section ayle-audio-field\">\n\t\t\t\t\t\t<select class=\"ayle-audio ayle-settings-native-select\" data-ayle-i18n-title=\"audioTrack\" title=\"Audio track\"></select>\n\t\t\t\t\t\t<div class=\"ayle-settings-list ayle-audio-list\"></div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\n\t\t\t\t<div class=\"ayle-settings-page\" data-settings-page=\"subtitles\">\n\t\t\t\t\t<div class=\"ayle-settings-submenu-header\">\n\t\t\t\t\t\t<button class=\"ayle-settings-back\" type=\"button\" data-ayle-i18n-label=\"back\" aria-label=\"Back\" title=\"Back\">\u2039</button>\n\t\t\t\t\t\t<div class=\"ayle-settings-submenu-title\" data-ayle-i18n=\"subtitles\">Subtitles</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"ayle-settings-section ayle-subtitles-field\">\n\t\t\t\t\t\t<select class=\"ayle-subtitles ayle-settings-native-select\" data-ayle-i18n-title=\"subtitles\" title=\"Subtitles\"></select>\n\t\t\t\t\t\t<div class=\"ayle-settings-list ayle-subtitle-list\"></div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\n\t\t\t\t<div class=\"ayle-settings-page\" data-settings-page=\"debug\">\n\t\t\t\t\t<div class=\"ayle-settings-submenu-header\">\n\t\t\t\t\t\t<button class=\"ayle-settings-back\" type=\"button\" data-ayle-i18n-label=\"back\" aria-label=\"Back\" title=\"Back\">\u2039</button>\n\t\t\t\t\t\t<div class=\"ayle-settings-submenu-title\" data-ayle-i18n=\"debug\">Debug</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"ayle-settings-section ayle-debug-settings\">\n\t\t\t\t\t\t<label class=\"ayle-settings-toggle\">\n\t\t\t\t\t\t\t<span data-ayle-i18n=\"debugEnabled\">Player debug</span>\n\t\t\t\t\t\t\t<input class=\"ayle-debug-toggle\" type=\"checkbox\">\n\t\t\t\t\t\t\t<span class=\"ayle-toggle-switch\" aria-hidden=\"true\"></span>\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<label class=\"ayle-settings-toggle\">\n\t\t\t\t\t\t\t<span data-ayle-i18n=\"debugMP4\">MP4 debug</span>\n\t\t\t\t\t\t\t<input class=\"ayle-debug-mp4-toggle\" type=\"checkbox\">\n\t\t\t\t\t\t\t<span class=\"ayle-toggle-switch\" aria-hidden=\"true\"></span>\n\t\t\t\t\t\t</label>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\n\t\t\t\t<div class=\"ayle-settings-page\" data-settings-page=\"shortcuts\">\n\t\t\t\t\t<div class=\"ayle-settings-submenu-header\">\n\t\t\t\t\t\t<button class=\"ayle-settings-back\" type=\"button\" data-ayle-i18n-label=\"back\" aria-label=\"Back\" title=\"Back\">\u2039</button>\n\t\t\t\t\t\t<div class=\"ayle-settings-submenu-title\" data-ayle-i18n=\"shortcuts\">Shortcuts</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"ayle-settings-section ayle-shortcuts-settings\">\n\t\t\t\t\t\t<label class=\"ayle-settings-toggle\">\n\t\t\t\t\t\t\t<span data-ayle-i18n=\"shortcutPlayPause\">Play / Pause</span>\n\t\t\t\t\t\t\t<input class=\"ayle-shortcut-play-pause-toggle\" type=\"checkbox\">\n\t\t\t\t\t\t\t<span class=\"ayle-toggle-switch\" aria-hidden=\"true\"></span>\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<label class=\"ayle-settings-toggle\">\n\t\t\t\t\t\t\t<span data-ayle-i18n=\"shortcutSeekArrows\">Seek with arrows</span>\n\t\t\t\t\t\t\t<input class=\"ayle-shortcut-seek-arrows-toggle\" type=\"checkbox\">\n\t\t\t\t\t\t\t<span class=\"ayle-toggle-switch\" aria-hidden=\"true\"></span>\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<label class=\"ayle-settings-toggle\">\n\t\t\t\t\t\t\t<span data-ayle-i18n=\"shortcutSeekAngle\">Seek with , / .</span>\n\t\t\t\t\t\t\t<input class=\"ayle-shortcut-seek-angle-toggle\" type=\"checkbox\">\n\t\t\t\t\t\t\t<span class=\"ayle-toggle-switch\" aria-hidden=\"true\"></span>\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<label class=\"ayle-settings-toggle\">\n\t\t\t\t\t\t\t<span data-ayle-i18n=\"shortcutVolume\">Volume with arrows</span>\n\t\t\t\t\t\t\t<input class=\"ayle-shortcut-volume-toggle\" type=\"checkbox\">\n\t\t\t\t\t\t\t<span class=\"ayle-toggle-switch\" aria-hidden=\"true\"></span>\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<label class=\"ayle-settings-toggle\">\n\t\t\t\t\t\t\t<span data-ayle-i18n=\"shortcutMute\">Mute</span>\n\t\t\t\t\t\t\t<input class=\"ayle-shortcut-mute-toggle\" type=\"checkbox\">\n\t\t\t\t\t\t\t<span class=\"ayle-toggle-switch\" aria-hidden=\"true\"></span>\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<label class=\"ayle-settings-toggle\">\n\t\t\t\t\t\t\t<span data-ayle-i18n=\"shortcutSubtitles\">Subtitles</span>\n\t\t\t\t\t\t\t<input class=\"ayle-shortcut-subtitles-toggle\" type=\"checkbox\">\n\t\t\t\t\t\t\t<span class=\"ayle-toggle-switch\" aria-hidden=\"true\"></span>\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<label class=\"ayle-settings-toggle\">\n\t\t\t\t\t\t\t<span data-ayle-i18n=\"shortcutFullscreen\">Fullscreen</span>\n\t\t\t\t\t\t\t<input class=\"ayle-shortcut-fullscreen-toggle\" type=\"checkbox\">\n\t\t\t\t\t\t\t<span class=\"ayle-toggle-switch\" aria-hidden=\"true\"></span>\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<label class=\"ayle-settings-toggle\">\n\t\t\t\t\t\t\t<span data-ayle-i18n=\"shortcutPictureInPicture\">Picture in Picture</span>\n\t\t\t\t\t\t\t<input class=\"ayle-shortcut-pip-toggle\" type=\"checkbox\">\n\t\t\t\t\t\t\t<span class=\"ayle-toggle-switch\" aria-hidden=\"true\"></span>\n\t\t\t\t\t\t</label>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\n\t\t<button class=\"ayle-icon-button ayle-pip\" type=\"button\" data-ayle-i18n-label=\"pictureInPicture\" aria-label=\"Picture in Picture\" title=\"Picture in Picture\" aria-pressed=\"false\">\n\t\t\t<svg class=\"ayle-icon\" aria-hidden=\"true\"><use href=\"#icon-pip\"></use></svg>\n\t\t</button>\n\t\t<button class=\"ayle-icon-button ayle-fullscreen\" type=\"button\" data-ayle-i18n-label=\"enterFullscreen\" aria-label=\"Enter fullscreen\" title=\"Enter fullscreen\" aria-pressed=\"false\">\n\t\t\t<svg class=\"ayle-icon ayle-icon-fullscreen-enter\" aria-hidden=\"true\"><use href=\"#icon-fullscreen-enter\"></use></svg>\n\t\t\t<svg class=\"ayle-icon ayle-icon-fullscreen-exit\" aria-hidden=\"true\"><use href=\"#icon-fullscreen-exit\"></use></svg>\n\t\t</button>\n\t</div>";

	AyleBootstrap.IsObject = function (value) {
		return value && typeof value === 'object' && !(value instanceof Array);
	};

	AyleBootstrap.Clone = function (value) {
		if (value instanceof Array) {
			var array = [];
			var i = 0;
			while (i < value.length) { array.push(AyleBootstrap.Clone(value[i])); i++; }
			return array;
		}
		if (AyleBootstrap.IsObject(value)) {
			var object = {};
			for (var key in value)
				if (Object.prototype.hasOwnProperty.call(value, key)) object[key] = AyleBootstrap.Clone(value[key]);
			return object;
		}
		return value;
	};

	AyleBootstrap.Merge = function (base, override) {
		var result = AyleBootstrap.Clone(base || {});
		if (!AyleBootstrap.IsObject(override)) return result;
		for (var key in override) {
			if (!Object.prototype.hasOwnProperty.call(override, key)) continue;
			if (AyleBootstrap.IsObject(result[key]) && AyleBootstrap.IsObject(override[key]))
				result[key] = AyleBootstrap.Merge(result[key], override[key]);
			else result[key] = AyleBootstrap.Clone(override[key]);
		}
		return result;
	};


	/*
	 * Presets describe Player behaviour/UI only.
	 *
	 * Resource/transport URLs (MetadataURL, TrackURL, etc.) stay in the
	 * Bootstrap/HTTP configuration and are intentionally not part of presets.
	 *
	 * Merge order:
	 *
	 *   bootstrap defaults -> preset Player config -> instance config
	 *
	 * Media-specific Integration data (Channel, Hints, custom Settings, etc.)
	 * also belongs to MediaConfig rather than to presets.
	 */
	AyleBootstrap.Presets = {};

	AyleBootstrap.RegisterPreset = function (name, config) {
		name = String(name || '').toLowerCase();

		if (!name)
			throw new Error('Player preset name is required');

		config = AyleBootstrap.Clone(config || {});

		/*
		 * Presets must not carry endpoint/resource URLs. Keep HTTP and Driver
		 * setup in Bootstrap/options or in the concrete instance config.
		 */
		delete config.HTTP;
		delete config.File;
		delete config.Files;

		AyleBootstrap.Presets[name] = config;
		return AyleBootstrap;
	};

	AyleBootstrap.GetPreset = function (name) {
		name = String(name || '').toLowerCase();

		if (!name || !AyleBootstrap.Presets[name])
			return null;

		return AyleBootstrap.Clone(AyleBootstrap.Presets[name]);
	};

	AyleBootstrap.prototype.RegisterPreset = function (name, config) {
		AyleBootstrap.RegisterPreset(name, config);
		return this;
	};

	AyleBootstrap.prototype.GetPreset = function (name) {
		return AyleBootstrap.GetPreset(name);
	};

	AyleBootstrap.RegisterPreset('video', {
		Player: {
			UIMode: 'normal',
			AutoPlay: false,
			AutoPlayMode: 'muted',
			FontFamily: 'Calibri, sans-serif',
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
			SettingsOrder: [
				'autoplay',
				'audio',
				'subtitles',
				'nativeSubtitles',
				'nativeSubtitlesInPiP',
				'',
				'shortcuts',
				'',
				'integration'
			],
			Debug: false,
			DebugMP4: false,
			AutoSelectFirstSubtitleTrack: false,
			NativeSubtitles: false,
			AutoNativeSubtitlesInPictureInPicture: true,
			ForceShowQualityList: true,
			ShowCenterPlayButton: true,
			AutoFocus: true,
			ArtworkSlideshow: {
				Enabled: true,
				HideControls: false,
				Interval: 3000,
				FadeDuration: 500,
				Fit: 'cover'
			},
			HintSafeArea: {
				Top: 16,
				Right: 16,
				Bottom: 16,
				Left: 16
			}
		}
	});

	AyleBootstrap.RegisterPreset('audio', {
		Player: {
			MediaMode: 'audio',
			UIMode: 'minimal',
			AutoFocus: true,
			FontFamily: 'Calibri, sans-serif',
			AudioVisual: {
				Type: 'auto',
				Subtitles: true
			},
			MinimalUI: {
				Play: true,
				Timeline: true,
				Time: true,
				Volume: true,
				Settings: true,
				Audio: true,
				Subtitles: true,
				Chapters: false,
				Quality: false,
				PictureInPicture: false,
				Fullscreen: false,
				Header: false,
				Hints: false,
				Info: {
					Enabled: true,
					Mode: 'auto',
					Position: 'auto',
					Artwork: true,
					Title: true,
					Artist: true,
					Album: true,
					Channel: false,
					Subtitles: true
				},
				SubtitlePopup: {
					Enabled: true,
					Persistent: false,
					Position: 'auto'
				}
			},
			Shortcuts: {
				PlayPause: true,
				SeekArrows: true,
				SeekAngle: true,
				Volume: true,
				Mute: true,
				Subtitles: true,
				Fullscreen: false,
				PictureInPicture: false
			},
			SettingsOrder: [
				'autoplay',
				'audio',
				'subtitles',
				'',
				'shortcuts',
				'',
				'integration'
			],
			NativeSubtitles: false,
			AutoSelectFirstSubtitleTrack: false
		}
	});


	AyleBootstrap.prototype.EnsureSettingsItem = function (order, name, before) {
		order = order instanceof Array ? order.slice(0) : [];
		name = String(name || '');

		if (!name)
			return order;

		var i = 0;

		while (i < order.length) {
			if (order[i] === name)
				return order;
			i++;
		}

		var index = order.length;

		if (before) {
			i = 0;

			while (i < order.length) {
				if (order[i] === before) {
					index = i;
					break;
				}

				i++;
			}
		}

		/*
		 * Keep the injected section visually separated. NormalizeSettingsOrder
		 * in Player will collapse duplicate/leading/trailing separators.
		 */
		if (index > 0 && order[index - 1] !== '')
			order.splice(index++, 0, '');

		order.splice(index++, 0, name);

		if (index < order.length && order[index] !== '')
			order.splice(index, 0, '');

		return order;
	};

	AyleBootstrap.prototype.NormalizeSettingsStorage = function (value) {
		if (value === null || value === undefined || value === false)
			return false;

		value = String(value).replace(/^\s+|\s+$/g, '');

		/* Empty value explicitly disables settings persistence. */
		if (!value)
			return false;

		if (
			value !== 'localStorage' &&
			value !== 'sessionStorage' &&
			value !== 'cookie'
		)
			throw new Error(
				'Unknown data-ayle-settings storage: ' + value
			);

		return value;
	};

	AyleBootstrap.prototype.ResolveSettingsStorage = function (element) {
		if (!element || !element.hasAttribute('data-ayle-settings'))
			return undefined;

		return this.NormalizeSettingsStorage(
			element.getAttribute('data-ayle-settings')
		);
	};

	AyleBootstrap.prototype._settingsStorageKey = function (id, name) {
		if (id === null || id === undefined || id === '')
			return 'player.global.' + name;

		return 'player.' + String(id) + '.' + name;
	};

	AyleBootstrap.prototype._readCookie = function (name) {
		var encoded = encodeURIComponent(name) + '=';
		var parts = String(document.cookie || '').split(';');
		var i = 0;

		while (i < parts.length) {
			var part = parts[i].replace(/^\s+|\s+$/g, '');

			if (part.indexOf(encoded) === 0)
				return decodeURIComponent(part.substring(encoded.length));

			i++;
		}

		return null;
	};

	AyleBootstrap.prototype._writeCookie = function (name, value) {
		document.cookie =
			encodeURIComponent(name) + '=' +
			encodeURIComponent(String(value)) +
			'; path=/; max-age=31536000; SameSite=Lax';
	};

	AyleBootstrap.prototype.ReadSetting = function (storage, id, name) {
		var key = this._settingsStorageKey(id, name);

		try {
			if (storage === 'cookie')
				return this._readCookie(key);

			if (global[storage])
				return global[storage].getItem(key);
		}
		catch (error) {
			/* Storage can be blocked by browser/privacy policy. */
		}

		return null;
	};

	AyleBootstrap.prototype.WriteSetting = function (storage, id, name, value) {
		var key = this._settingsStorageKey(id, name);

		try {
			if (storage === 'cookie') {
				this._writeCookie(key, value);
				return true;
			}

			if (global[storage]) {
				global[storage].setItem(key, String(value));
				return true;
			}
		}
		catch (error) {
			/* Keep Player functional even when persistence is unavailable. */
		}

		return false;
	};

	AyleBootstrap.prototype.RestorePlayerSettings = function (storage, id, options) {
		options = AyleBootstrap.Clone(options || {});

		var readBool = function (bootstrap, name) {
			var value = bootstrap.ReadSetting(storage, id, name);

			if (value === null)
				return null;

			return value === 'true';
		};

		var value = readBool(this, 'autoplay');
		if (value !== null)
			options.AutoPlay = value;

		value = readBool(this, 'debug');
		if (value !== null)
			options.Debug = value;

		value = readBool(this, 'debugMP4');
		if (value !== null)
			options.DebugMP4 = value;

		if (!AyleBootstrap.IsObject(options.Shortcuts))
			options.Shortcuts = {};

		var shortcuts = [
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

		while (i < shortcuts.length) {
			value = readBool(this, 'shortcuts.' + shortcuts[i]);

			if (value !== null)
				options.Shortcuts[shortcuts[i]] = value;

			i++;
		}

		return options;
	};

	AyleBootstrap.prototype.BindPlayerSettingsPersistence = function (instance, storage, scope) {
		if (!instance || !instance.Player || !storage)
			return;

		var self = this;
		var id = scope === undefined ? instance.ID : scope;
		var player = instance.Player;

		player.On('autoplaySettingsChange', function (data) {
			self.WriteSetting(
				storage,
				id,
				'autoplay',
				data.Value ? 'true' : 'false'
			);
		});

		player.On('debugSettingsChange', function (data) {
			self.WriteSetting(
				storage,
				id,
				'debug',
				data.Value ? 'true' : 'false'
			);
		});

		player.On('debugMP4SettingsChange', function (data) {
			self.WriteSetting(
				storage,
				id,
				'debugMP4',
				data.Value ? 'true' : 'false'
			);
		});

		player.On('shortcutSettingsChange', function (data) {
			self.WriteSetting(
				storage,
				id,
				'shortcuts.' + data.Name,
				data.Value ? 'true' : 'false'
			);
		});
	};

	AyleBootstrap.prototype.ResolvePresetName = function (config) {
		config = config || {};

		if (config.Preset !== undefined && config.Preset !== null && config.Preset !== '')
			return String(config.Preset).toLowerCase();

		var player = config.Player || {};
		var mode = String(player.MediaMode || '').toLowerCase();

		return mode === 'audio' ? 'audio' : 'video';
	};

	AyleBootstrap.prototype.ApplyPreset = function (config) {
		config = AyleBootstrap.Clone(config || {});

		var name = this.ResolvePresetName(config);

		if (name === 'auto') {
			var player = config.Player || {};
			name = String(player.MediaMode || '').toLowerCase() === 'audio' ?
				'audio' : 'video';
		}

		var preset = this.GetPreset(name);

		if (!preset)
			throw new Error('Unknown player preset: ' + name);

		delete config.Preset;

		/*
		 * Instance config wins over preset.
		 * Bootstrap Options are applied later by Init() as the global base.
		 */
		config = AyleBootstrap.Merge(preset, config);
		config.Preset = name;

		return config;
	};


	AyleBootstrap.NormalizeLocalizationCode = function (value) {
		value = String(value === null || value === undefined ? '' : value)
			.replace(/^\s+|\s+$/g, '')
			.replace(/_/g, '-');

		if (!value)
			return '';

		var parts = value.split('-');
		parts[0] = String(parts[0] || '').toLowerCase();

		if (parts.length > 1 && parts[1])
			parts[1] = String(parts[1]).toUpperCase();

		return parts.join('-');
	};


	AyleBootstrap.prototype.GetBrowserLocalization = function () {
		if (!global.navigator || !global.Ayle || !global.Ayle.Localizations)
			return 'en';

		var languages = [];

		if (global.navigator.languages && global.navigator.languages.length)
			languages = global.navigator.languages.slice(0);
		else if (global.navigator.language)
			languages = [global.navigator.language];

		var i = 0;

		while (i < languages.length) {
			var code = AyleBootstrap.NormalizeLocalizationCode(languages[i]);

			if (global.Ayle.Localizations[code] !== undefined)
				return code;

			if (code.indexOf('-') !== -1) {
				var base = code.split('-')[0];

				if (global.Ayle.Localizations[base] !== undefined)
					return base;
			}

			i++;
		}

		return 'en';
	};

	AyleBootstrap.prototype._resolveLocalization = function (options) {
		if (!options)
			return options;

		if (
			options.Localization === undefined ||
			options.Localization === null ||
			options.Localization === ''
		)
			options.Localization = this.GetBrowserLocalization();

		if (
			typeof options.Localization === 'string' &&
			global.Ayle &&
			global.Ayle.Localizations
		) {
			var code = AyleBootstrap.NormalizeLocalizationCode(options.Localization);
			var localization = global.Ayle.Localizations[code];

			if (localization === undefined && code.indexOf('-') !== -1)
				localization = global.Ayle.Localizations[code.split('-')[0]];

			if (localization !== undefined)
				options.Localization = localization;
			else
				options.Localization = null;
		}

		return options;
	};

	AyleBootstrap.prototype._assetURL = function (path) {
		if (!path) return path;
		if (/^(?:[a-z]+:)?\/\//i.test(path) || path.charAt(0) === '/' || path.indexOf('data:') === 0) return path;
		return (this.Options.AssetBase || '') + path;
	};

	AyleBootstrap.prototype.CreateDOM = function (element, config) {
		element.innerHTML = AyleBootstrap.Template;
		element.classList.add('ayle');

		var requestedMode = config && config.Player ? (config.Player.MediaMode || 'auto') : 'auto';

		if (requestedMode === 'audio') {
			var video = element.querySelector('.ayle-video');

			if (video) {
				var audio = document.createElement('audio');
				audio.className = 'ayle-media ayle-audio';
				audio.preload = 'metadata';
				video.parentNode.replaceChild(audio, video);
			}
		}
		if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '0');

		AyleBootstrap.EnsureIconSprite();
		return element;
	};


	AyleBootstrap.prototype.NormalizeMediaConfig = function (media) {
		media = AyleBootstrap.Clone(media || {});

		var result = {};
		var integration = {};

		if (media.File !== undefined)
			result.File = media.File;

		if (media.Files instanceof Array) {
			result.Files = AyleBootstrap.Clone(media.Files);

			if (result.File === undefined && media.Files.length) {
				var first = media.Files[0];

				if (typeof first === 'string')
					result.File = first;
				else if (AyleBootstrap.IsObject(first) && first.File !== undefined)
					result.File = first.File;
			}
		}

		if (media.HTTP !== undefined)
			result.HTTP = AyleBootstrap.Clone(media.HTTP);

		if (media.Driver !== undefined)
			result.Driver = AyleBootstrap.Clone(media.Driver);

		if (media.Player !== undefined)
			result.Player = AyleBootstrap.Clone(media.Player);

		if (media.Mode !== undefined || media.Cover !== undefined || media.AudioVisual !== undefined) {
			if (!result.Player)
				result.Player = {};

			if (media.Mode !== undefined)
				result.Player.MediaMode = media.Mode;

			if (media.AudioVisual !== undefined)
				result.Player.AudioVisual = AyleBootstrap.Clone(media.AudioVisual);

			if (media.Cover !== undefined) {
				result.Player.AudioVisual = AyleBootstrap.Merge(
					result.Player.AudioVisual || {},
					{
						Type: 'cover',
						Image: media.Cover
					}
				);
			}
		}

		if (media.Channel !== undefined)
			integration.Channel = AyleBootstrap.Clone(media.Channel);

		if (media.Hints !== undefined)
			integration.Hints = AyleBootstrap.Clone(media.Hints);

		if (media.Settings !== undefined)
			integration.Settings = AyleBootstrap.Clone(media.Settings);

		if (media.Data !== undefined)
			integration.Data = AyleBootstrap.Clone(media.Data);

		if (media.Integration !== undefined)
			integration = AyleBootstrap.Merge(integration, media.Integration);

		if (Object.keys(integration).length) {
			if (!result.Player)
				result.Player = {};

			result.Player.Integration = AyleBootstrap.Merge(
				result.Player.Integration || {},
				integration
			);
		}

		return result;
	};

	AyleBootstrap.prototype.ComposeConfig = function (playerConfig, mediaConfig) {
		return AyleBootstrap.Merge(
			AyleBootstrap.Clone(playerConfig || {}),
			this.NormalizeMediaConfig(mediaConfig || {})
		);
	};

	AyleBootstrap.prototype.NormalizeConfig = function (config) {
		config = AyleBootstrap.Clone(config || {});

		if (
			config.PlayerConfig !== undefined ||
			config.MediaConfig !== undefined
		) {
			var composed = this.ComposeConfig(
				config.PlayerConfig || {},
				config.MediaConfig || {}
			);

			var envelope = AyleBootstrap.Clone(config);
			delete envelope.PlayerConfig;
			delete envelope.MediaConfig;

			config = AyleBootstrap.Merge(composed, envelope);
		}

		return this.ApplyPreset(config);
	};


	AyleBootstrap.prototype.ApplyDataAttributes = function (element, config) {
		config = AyleBootstrap.Clone(config || {});

		if (!element || !element.getAttribute)
			return config;

		var preset = element.getAttribute('data-ayle-preset');
		var file = element.getAttribute('data-ayle-file');
		var localization = element.getAttribute('data-ayle-localization');
		var driver = element.getAttribute('data-ayle-driver');
		var driverOptions = element.getAttribute('data-ayle-driver-options');
		var volume = element.getAttribute('data-ayle-volume');
		var start = element.getAttribute('data-ayle-start');
		var muted = element.getAttribute('data-ayle-muted');

		if (preset !== null && preset !== '')
			config.Preset = preset;

		if (localization !== null && localization !== '') {
			/*
			 * Per-instance localization has the same precedence as the other
			 * data-ayle-* shortcuts: it overrides JSON/defaults for this
			 * concrete Player instance.
			 */
			if (!AyleBootstrap.IsObject(config.Player))
				config.Player = {};

			config.Player.Localization = localization;
		}

		if (volume !== null || start !== null || muted !== null) {
			if (!AyleBootstrap.IsObject(config.Player))
				config.Player = {};

			if (volume !== null) {
				var volumeValue = Number(volume);
				if (isFinite(volumeValue))
					config.Player.Volume = Math.max(0, Math.min(1, volumeValue));
			}

			if (start !== null) {
				var startValue = Number(start);
				if (isFinite(startValue))
					config.Player.Start = Math.max(0, startValue);
			}

			if (muted !== null)
				config.Player.Muted = AyleLoaderBool(muted, true);
		}

		if (driver !== null && driver !== '') {
			if (!AyleBootstrap.IsObject(config.Driver))
				config.Driver = {};
			config.Driver.Type = driver;
		}

		if (driverOptions !== null && driverOptions !== '') {
			var parsedDriverOptions;
			try {
				parsedDriverOptions = JSON.parse(driverOptions);
			}
			catch (error) {
				error.message = 'Invalid data-ayle-driver-options JSON: ' + error.message;
				throw error;
			}
			if (!AyleBootstrap.IsObject(parsedDriverOptions))
				throw new Error('data-ayle-driver-options must contain a JSON object');
			if (!AyleBootstrap.IsObject(config.Driver))
				config.Driver = {};
			config.Driver.Options = AyleBootstrap.Merge(
				config.Driver.Options || {},
				parsedDriverOptions
			);
		}

		if (file !== null && file !== '') {
			/*
			 * Preserve split-config semantics: data-ayle-file is equivalent
			 * to MediaConfig.File, not to a Player option.
			 */
			if (
				config.PlayerConfig !== undefined ||
				config.MediaConfig !== undefined
			) {
				if (!AyleBootstrap.IsObject(config.MediaConfig))
					config.MediaConfig = {};

				config.MediaConfig.File = file;
			}
			else
				config.File = file;
		}

		return config;
	};

	AyleBootstrap.prototype.ParseConfig = function (element) {
		var text = element ? (element.textContent || '') : '';
		text = text.replace(/^\s+|\s+$/g, '');

		if (!text)
			return {};

		try {
			return JSON.parse(text);
		}
		catch (error) {
			error.message = 'Invalid player JSON config: ' + error.message;
			throw error;
		}
	};

	AyleBootstrap.prototype.InitConfig = function (configElement, config) {
		if (!configElement)
			return null;

		if (configElement.__playerInstance)
			return configElement.__playerInstance;

		config = config || this.ParseConfig(configElement);

		var element = document.createElement('div');
		var attributes = configElement.attributes || [];
		var i = 0;

		while (i < attributes.length) {
			var attribute = attributes[i];

			if (
				attribute.name !== 'type' &&
				attribute.name !== 'data-ayle-auto'
			)
				element.setAttribute(attribute.name, attribute.value);

			i++;
		}

		if (!element.hasAttribute('data-ayle'))
			element.setAttribute('data-ayle', config.ID || '');

		configElement.parentNode.replaceChild(element, configElement);

		var instance = this.Init(element, config);

		if (instance)
			instance.ConfigElement = configElement;

		return instance;
	};

	AyleBootstrap.prototype.ResolveElement = function (target, root) {
		if (!target)
			return null;

		if (typeof target === 'string')
			return (root || document).querySelector(target);

		return target;
	};

	AyleBootstrap.prototype.InitAt = function (target, playerConfig, mediaConfig, root) {
		/*
		 * Backward compatible forms:
		 *   InitAt(target, config)
		 *   InitAt(target, config, root)
		 *
		 * Split form:
		 *   InitAt(target, playerConfig, mediaConfig, root)
		 */
		if (
			mediaConfig &&
			(
				mediaConfig.nodeType ||
				mediaConfig === document
			)
		) {
			root = mediaConfig;
			mediaConfig = undefined;
		}

		var element = this.ResolveElement(target, root);

		if (!element)
			throw new Error('Player target not found: ' + target);

		var config = mediaConfig !== undefined ?
			{
				PlayerConfig: AyleBootstrap.Clone(playerConfig || {}),
				MediaConfig: AyleBootstrap.Clone(mediaConfig || {})
			} :
			AyleBootstrap.Clone(playerConfig || {});

		return this.Init(element, config);
	};

	AyleBootstrap.prototype.InitSplit = function (target, playerConfig, mediaConfig, root) {
		return this.InitAt(target, playerConfig, mediaConfig, root);
	};

	AyleBootstrap.prototype.InitTargets = function (items, root) {
		if (!(items instanceof Array))
			throw new Error('Player target list must be an array');

		var result = [];
		var i = 0;

		while (i < items.length) {
			var item = items[i] || {};

			if (!item.Target)
				throw new Error('Player target is missing at index ' + i);

			if (
				item.PlayerConfig !== undefined ||
				item.MediaConfig !== undefined
			)
				result.push(this.InitAt(
					item.Target,
					item.PlayerConfig || {},
					item.MediaConfig || {},
					root
				));
			else
				result.push(this.InitAt(
					item.Target,
					item.Config || {},
					root
				));

			i++;
		}

		return result;
	};


	AyleBootstrap.prototype.ParseEventBindings = function (element) {
		if (!element || !element.hasAttribute('data-ayle-on'))
			return [];

		var value = String(element.getAttribute('data-ayle-on') || '');
		var parts = value.split(';');
		var result = [];
		var i = 0;

		while (i < parts.length) {
			var part = parts[i].replace(/^\s+|\s+$/g, '');

			if (part) {
				var separator = part.indexOf(':');

				if (separator > 0) {
					var eventName = part.substring(0, separator)
						.replace(/^\s+|\s+$/g, '');
					var handlerName = part.substring(separator + 1)
						.replace(/^\s+|\s+$/g, '');

					if (eventName && handlerName)
						result.push({
							Event: eventName,
							Handler: handlerName
						});
				}
			}

			i++;
		}

		return result;
	};

	AyleBootstrap.prototype.ResolveGlobalHandler = function (name) {
		name = String(name || '').replace(/^\s+|\s+$/g, '');

		if (!name)
			return null;

		var parts = name.split('.');
		var value = global;
		var i = 0;

		while (i < parts.length) {
			if (!parts[i] || value === null || value === undefined)
				return null;

			value = value[parts[i]];
			i++;
		}

		return typeof value === 'function' ? value : null;
	};

	AyleBootstrap.prototype.BindDataEvents = function (instance, element) {
		if (!instance || !instance.Player || !element)
			return;

		var bindings = this.ParseEventBindings(element);
		var i = 0;

		while (i < bindings.length) {
			(function (binding, bootstrap) {
				var handler = bootstrap.ResolveGlobalHandler(binding.Handler);

				if (!handler) {
					if (global.console && console.warn)
						console.warn(
							'Player event handler not found: ' +
							binding.Handler
						);
					return;
				}

				instance.Player.On(binding.Event, function (data) {
					handler({
						Type: binding.Event,
						Data: data,
						Player: instance.Player,
						Instance: instance,
						Element: instance.Element
					});
				});
			})(bindings[i], this);

			i++;
		}
	};

	AyleBootstrap.prototype.Init = function (element, config) {
		if (!element || element.__playerInstance)
			return element ? element.__playerInstance : null;

		config = config || this.ParseConfig(element);
		config = this.ApplyDataAttributes(element, config);
		config = this.NormalizeConfig(config);
		config = AyleBootstrap.Merge(this.Options, config);

		var id = element.getAttribute('data-ayle') || config.ID || ('ayle-' + (++this._counter));
		var instanceSettingsStorage = this.ResolveSettingsStorage(element);
		var globalSettingsStorage = this.GlobalSettingsStorage;
		var settingsStorage = instanceSettingsStorage !== undefined ?
			instanceSettingsStorage : globalSettingsStorage;

		if (!AyleBootstrap.IsObject(config.Player))
			config.Player = {};

		/*
		 * Debug controls are opt-in for declarative/preset embeds.
		 */
		if (element.hasAttribute('data-ayle-debug'))
			config.Player.SettingsOrder = this.EnsureSettingsItem(
				config.Player.SettingsOrder,
				'debug',
				'integration'
			);

		var driverConfig = config.Driver || {};
		var playerOptions = AyleBootstrap.Clone(config.Player || {});

		/*
		 * Global loader settings are the base. Concrete instance settings are
		 * restored afterwards and therefore override the global values.
		 */
		if (globalSettingsStorage)
			playerOptions = this.RestorePlayerSettings(
				globalSettingsStorage,
				null,
				playerOptions
			);

		if (instanceSettingsStorage)
			playerOptions = this.RestorePlayerSettings(
				instanceSettingsStorage,
				id,
				playerOptions
			);

		playerOptions = this._resolveLocalization(playerOptions);
		var httpOptions = AyleBootstrap.Merge(
			this.LoaderHTTP || {},
			config.HTTP || {}
		);
		if (config.File !== undefined) httpOptions.File = config.File;

		this.CreateDOM(element, config);
		var video = element.querySelector('.ayle-media');
		if (!driverConfig.Type)
			throw new Error(
				'Player driver is not configured. ' +
				'Use data-ayle-driver on the loader or on the Player instance.'
			);

		var type = String(driverConfig.Type).toLowerCase();
		var driver;
		if (type === 'html5') driver = new global.AyleHTML5MediaDriver(video, driverConfig.Options || {});
		else if (type === 'mse') driver = new global.AyleMSEMediaDriver(video, driverConfig.Options || {});
		else throw new Error('Unknown player driver type: ' + driverConfig.Type);

		var player = new global.Ayle(driver, playerOptions);
		var ui = new global.AyleUI(element, player);
		var http = null;
		var instance = {
			ID: id,
			Element: element,
			Video: video,
			Driver: driver,
			Player: player,
			UI: ui,
			HTTP: null,
			HTTPOptions: AyleBootstrap.Clone(httpOptions),
			Config: config
		};
		element.__playerInstance = instance;
		this.Instances[id] = instance;
		this.List.push(instance);

		if (settingsStorage) {
			instance.SettingsStorage = settingsStorage;
			instance.SettingsScope = instanceSettingsStorage !== undefined ? id : null;
			this.BindPlayerSettingsPersistence(
				instance,
				settingsStorage,
				instance.SettingsScope
			);
		}

		this.BindDataEvents(instance, element);

		if (httpOptions.File) {
			http = new global.AyleHTTP(player, httpOptions);
			instance.HTTP = http;
			http.Load(function (error, source, metadata) {
				instance.Source = source || null;
				instance.Metadata = metadata || null;
				instance.Error = error || null;
				var eventName = error ? 'playerError' : 'playerReady';
				var event = new CustomEvent(eventName, { detail: instance });
				element.dispatchEvent(event);
				document.dispatchEvent(new CustomEvent(eventName, { detail: instance }));
			});
		} else {
			element.dispatchEvent(new CustomEvent('playerReady', { detail: instance }));
		}
		return instance;
	};

	AyleBootstrap.prototype.InitAll = function (root) {
		root = root || document;

		var selector = this.Options.Selector ||
			'script[type="application/json"][data-ayle]';
		var elements = root.querySelectorAll(selector);
		var result = [];
		var i = 0;

		while (i < elements.length) {
			var element = elements[i];

			if (element.getAttribute('data-ayle-auto') !== 'false') {
				try {
					if (
						element.tagName === 'SCRIPT' &&
						String(element.getAttribute('type') || '').toLowerCase() === 'application/json'
					)
						result.push(this.InitConfig(element));
					else
						result.push(this.Init(element));
				}
				catch (error) {
					element.setAttribute('data-ayle-error', error.message);

					if (global.console && console.error)
						console.error(error);
				}
			}

			i++;
		}

		return result;
	};

	AyleBootstrap.prototype.Destroy = function (target) {
		var instance = typeof target === 'string' ? this.Get(target) : target;

		if (!instance)
			return false;

		if (instance.UI && typeof instance.UI.Destroy === 'function')
			instance.UI.Destroy();

		if (instance.Driver && typeof instance.Driver.Destroy === 'function')
			instance.Driver.Destroy();

		if (instance.Player)
			instance.Player._events = {};

		if (instance.Element) {
			delete instance.Element.__playerInstance;
			instance.Element.innerHTML = '';
			instance.Element.classList.remove('ayle');
		}

		delete this.Instances[instance.ID];

		var i = this.List.length;
		while (i--) {
			if (this.List[i] === instance)
				this.List.splice(i, 1);
		}

		return true;
	};

	AyleBootstrap.prototype.Get = function (id) { return this.Instances[id] || null; };
	global.AyleBootstrap = AyleBootstrap;

	/* Static loader: this file replaces the old PHP loader. */
	var loaderScript = document.currentScript;

	if (!loaderScript) {
		var markedLoaders = document.querySelectorAll('script[data-ayle-loader]');
		if (markedLoaders.length)
			loaderScript = markedLoaders[markedLoaders.length - 1];
	}

	function AyleLoaderTrim (value) {
		return String(value === null || value === undefined ? '' : value)
			.replace(/^\s+|\s+$/g, '');
	}

	function AyleLoaderBool (value, fallback) {
		if (value === null || value === undefined)
			return fallback;

		value = AyleLoaderTrim(value).toLowerCase();

		if (
			value === '' ||
			value === '1' ||
			value === 'true' ||
			value === 'yes' ||
			value === 'on'
		)
			return true;

		if (
			value === '0' ||
			value === 'false' ||
			value === 'no' ||
			value === 'off'
		)
			return false;

		return fallback;
	}

	function AyleLoaderQuery (url) {
		var result = {};
		var queryIndex = String(url || '').indexOf('?');

		if (queryIndex < 0)
			return result;

		var query = String(url).substring(queryIndex + 1).split('#')[0];
		var parts = query.split('&');
		var i = 0;

		while (i < parts.length) {
			if (parts[i]) {
				var eq = parts[i].indexOf('=');
				var key = eq >= 0 ? parts[i].substring(0, eq) : parts[i];
				var value = eq >= 0 ? parts[i].substring(eq + 1) : '';

				try {
					key = decodeURIComponent(key.replace(/\+/g, ' '));
					value = decodeURIComponent(value.replace(/\+/g, ' '));
				}
				catch (ignore) {}

				result[key] = value;
			}

			i++;
		}

		return result;
	}

	function AyleLoaderAttribute (name) {
		return loaderScript ? loaderScript.getAttribute(name) : null;
	}

	function AyleLoaderHasAttribute (name) {
		return !!loaderScript && loaderScript.hasAttribute(name);
	}

	var loaderURL = loaderScript && loaderScript.src ? loaderScript.src : '';
	var cleanLoaderURL = loaderURL.split('#')[0].split('?')[0];
	var base = cleanLoaderURL.substring(0, cleanLoaderURL.lastIndexOf('/') + 1);
	var query = AyleLoaderQuery(loaderURL);

	var defaults = {
		AssetBase: base,
		AutoInit: true,
		Player: {}
	};

	/* data-* wins; query parameters remain only as compatibility fallback. */
	var localization = AyleLoaderAttribute('data-ayle-localization');
	if (localization === null && query.lang !== undefined)
		localization = query.lang;
	if (AyleLoaderTrim(localization))
		defaults.Player.Localization = AyleLoaderTrim(localization);

	var autoFocus = AyleLoaderAttribute('data-ayle-auto-focus');
	if (autoFocus === null && query.autoFocus !== undefined)
		autoFocus = query.autoFocus;
	if (autoFocus !== null)
		defaults.Player.AutoFocus = AyleLoaderBool(autoFocus, true);

	var autoplay = AyleLoaderAttribute('data-ayle-autoplay');
	if (autoplay === null && query.autoplay !== undefined)
		autoplay = query.autoplay;
	if (autoplay !== null)
		defaults.Player.AutoPlay = AyleLoaderBool(autoplay, true);

	var autoplayMode = AyleLoaderAttribute('data-ayle-autoplay-mode');
	if (autoplayMode === null && query.autoplayMode !== undefined)
		autoplayMode = query.autoplayMode;
	if (AyleLoaderTrim(autoplayMode))
		defaults.Player.AutoPlayMode = AyleLoaderTrim(autoplayMode);

	var volume = AyleLoaderAttribute('data-ayle-volume');
	if (volume !== null) {
		var volumeValue = Number(volume);
		if (isFinite(volumeValue))
			defaults.Player.Volume = Math.max(0, Math.min(1, volumeValue));
	}

	var start = AyleLoaderAttribute('data-ayle-start');
	if (start !== null) {
		var startValue = Number(start);
		if (isFinite(startValue))
			defaults.Player.Start = Math.max(0, startValue);
	}

	var muted = AyleLoaderAttribute('data-ayle-muted');
	if (muted !== null)
		defaults.Player.Muted = AyleLoaderBool(muted, true);

	var autoInit = AyleLoaderAttribute('data-ayle-auto-init');
	if (autoInit === null && query.autoInit !== undefined)
		autoInit = query.autoInit;
	if (autoInit !== null)
		defaults.AutoInit = AyleLoaderBool(autoInit, true);

	var driver = AyleLoaderAttribute('data-ayle-driver');
	if (AyleLoaderTrim(driver))
		defaults.Driver = {
			Type: AyleLoaderTrim(driver),
			Options: {}
		};

	var driverOptions = AyleLoaderAttribute('data-ayle-driver-options');
	if (driverOptions !== null && AyleLoaderTrim(driverOptions)) {
		var parsedDriverOptions;
		try {
			parsedDriverOptions = JSON.parse(driverOptions);
		}
		catch (error) {
			error.message = 'Invalid loader data-ayle-driver-options JSON: ' + error.message;
			throw error;
		}
		if (!AyleBootstrap.IsObject(parsedDriverOptions))
			throw new Error('Loader data-ayle-driver-options must contain a JSON object');
		if (!defaults.Driver)
			defaults.Driver = {};
		defaults.Driver.Options = parsedDriverOptions;
	}

	var metadataURL = AyleLoaderAttribute('data-ayle-url-metadata');
	if (metadataURL === null && query.metadataURL !== undefined)
		metadataURL = query.metadataURL;
	if (AyleLoaderTrim(metadataURL)) {
		if (!defaults.HTTP) defaults.HTTP = {};
		defaults.HTTP.MetadataURL = AyleLoaderTrim(metadataURL);
	}

	var trackURL = AyleLoaderAttribute('data-ayle-url-track');
	if (trackURL === null && query.trackURL !== undefined)
		trackURL = query.trackURL;
	if (AyleLoaderTrim(trackURL)) {
		if (!defaults.HTTP) defaults.HTTP = {};
		defaults.HTTP.TrackURL = AyleLoaderTrim(trackURL);
	}

	var skipInit = AyleLoaderAttribute('data-ayle-skip-init');
	if (skipInit === null && query.skipInit !== undefined)
		skipInit = query.skipInit;
	if (skipInit !== null) {
		if (!defaults.HTTP) defaults.HTTP = {};
		defaults.HTTP.Stream = {
			SkipInit: AyleLoaderBool(skipInit, true)
		};
	}

	if (query.debug !== undefined)
		defaults.Player.Debug = AyleLoaderBool(query.debug, false);
	if (query.debugMP4 !== undefined)
		defaults.Player.DebugMP4 = AyleLoaderBool(query.debugMP4, false);

	function AyleAddStyle (url) {
		if (document.querySelector('link[data-ayle-resource="css"]'))
			return;

		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = url;
		link.setAttribute('data-ayle-resource', 'css');
		(document.head || document.documentElement).appendChild(link);
	}

	function AyleLoadResourceScript (url, marker, test, callback) {
		if (test()) {
			callback();
			return;
		}

		var existing = document.querySelector(
			'script[data-ayle-resource="' + marker + '"]'
		);

		if (existing) {
			if (existing.getAttribute('data-ayle-loaded') === '1') {
				callback();
				return;
			}

			existing.addEventListener('load', callback);
			return;
		}

		var script = document.createElement('script');
		script.src = url;
		script.setAttribute('data-ayle-resource', marker);

		script.onload = function () {
			script.setAttribute('data-ayle-loaded', '1');
			callback();
		};

		script.onerror = function () {
			throw new Error('Cannot load player resource: ' + url);
		};

		(document.head || document.documentElement).appendChild(script);
	}

	function AyleStartLoader () {
		if (!global.AyleBootstrap || !global.Ayle)
			return;

		AyleBootstrap.EnsureIconSprite();

		var bootstrap = new global.AyleBootstrap(defaults);

		bootstrap.LoaderHTTP = {};

		if (metadataURL)
			bootstrap.LoaderHTTP.MetadataURL = AyleLoaderTrim(metadataURL);

		if (trackURL)
			bootstrap.LoaderHTTP.TrackURL = AyleLoaderTrim(trackURL);

		bootstrap.Loader = {
			Element: loaderScript || null,
			MetadataURL: AyleLoaderTrim(metadataURL) || (
				bootstrap.Options.HTTP ?
					bootstrap.Options.HTTP.MetadataURL : null
			),
			TrackURL: AyleLoaderTrim(trackURL) || (
				bootstrap.Options.HTTP ?
					bootstrap.Options.HTTP.TrackURL : null
			),
			SettingsStorage: AyleLoaderHasAttribute('data-ayle-settings') ?
				AyleLoaderAttribute('data-ayle-settings') : null
		};

		if (AyleLoaderHasAttribute('data-ayle-settings'))
			bootstrap.GlobalSettingsStorage =
				bootstrap.NormalizeSettingsStorage(
					AyleLoaderAttribute('data-ayle-settings')
				);

		global.AyleEmbed = bootstrap;
		global.AyleInstances = bootstrap.Instances;

		document.dispatchEvent(new CustomEvent('playerBootstrapReady', {
			detail: {
				Bootstrap: bootstrap,
				Instances: bootstrap.Instances
			}
		}));

		if (!defaults.AutoInit)
			return;

		var initAll = function () {
			bootstrap.InitAll();
		};

		if (document.readyState === 'loading')
			document.addEventListener('DOMContentLoaded', initAll);
		else
			initAll();
	}

	AyleAddStyle(base + 'ayle.css');

	AyleLoadResourceScript(
		base + 'ayle.js',
		'core',
		function () { return !!global.Ayle; },
		AyleStartLoader
	);
})(window);