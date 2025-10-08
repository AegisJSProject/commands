export const PREFIX = '--aegis-command-';

/**
 * Built-in command constants for common DOM operations
 * @type {Object<string, string>}
 */
export const COMMANDS = {
	// Built-in commands
	showModal: 'show-modal',
	requestClose: 'request-close',
	close: 'close',
	showPopover: 'show-popover',
	hidePopover: 'hide-popover',
	togglePopover: 'toggle-popover',

	// Custom commands
	addClass: PREFIX + 'add-class',
	removeClass: PREFIX + 'remove-class',
	show: PREFIX + 'show',
	hide: PREFIX + 'hide',
	unhide: PREFIX + 'unhide',
	disable: PREFIX + 'disable',
	enable: PREFIX + 'enable',
	scrollIntoView: PREFIX + 'scroll-into-view',
	remove: PREFIX + 'remove',
	requestFullscreen: PREFIX + 'request-fullscreen',
	exitFullscreen: PREFIX + 'exit-fullscreen',
	toggleFullscreen: PREFIX + 'toggle-fullscreen',
	showPicker: PREFIX + 'show-picker',
	stepUp: PREFIX + 'step-up',
	stepDown: PREFIX + 'step-down',
	openDetails: PREFIX + 'open-details',
	closeDetails: PREFIX + 'close-details',
	toggleDetails: PREFIX + 'toggle-details',
	playMedia: PREFIX + 'play-media',
	pauseMedia: PREFIX + 'pause-media',
	requestPictureInPicture: PREFIX + 'request-picture-in-picture',
	copyText: PREFIX + 'copy-text',
};

export const ROOT_COMMANDS = {
	print: PREFIX + 'root-print',
	share: PREFIX + 'root-share',
	back: PREFIX + 'root-back',
	forward: PREFIX + 'root-forward',
	reload: PREFIX + 'root-reload',
	exitFullscreen: PREFIX + 'root-exit-fullscreen',
};
