import { PREFIX, COMMANDS } from './consts.js';

/**
 * @typedef {Event & {source: Element, command: string}} CommandEvent
 * @property {Element} source - The element that triggered the command
 * @property {string} command - The command string
 */

const registeredCommands = new Map();
let registrationOpen = true;

/**
 * Handles a `CommandEvent` with a built-in or registered handler
 *
 * @param {CommandEvent} event The event to handle
 */
export function handleCommand(event) {
	switch(event.command) {
		case COMMANDS.hide:
			event.target.hidden = true;
			break;

		case COMMANDS.unhide:
			event.target.hidden = false;
			break;

		case COMMANDS.disable:
			event.target.disabled = true;
			break;

		case COMMANDS.enable:
			event.target.disabled = false;
			break;

		case COMMANDS.scrollIntoView:
			event.target.scrollIntoView({
				behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
			});
			break;

		case COMMANDS.remove:
			event.target.remove();
			break;

		case COMMANDS.requestFullscreen:
			event.target.requestFullscreen();
			break;

		case COMMANDS.exitFullscreen:
			if (event.target.isSameNode(document.fullscreenElement)) {
				document.exitFullscreen();
			}

			break;

		case COMMANDS.toggleFullscreen:
			if (event.target.isSameNode(document.fullscreenElement)) {
				document.exitFullscreen();
			} else {
				event.target.requestFullscreen();
			}
			break;

		case COMMANDS.showPicker:
			event.target.showPicker();
			break;

		case COMMANDS.stepUp:
			event.target.stepUp();
			break;

		case COMMANDS.stepDown:
			event.target.stepDown();
			break;

		case COMMANDS.openDetails:
			event.target.open = true;
			break;

		case COMMANDS.closeDetails:
			event.target.open = false;
			break;

		case COMMANDS.toggleDetails:
			event.target.open = ! event.target.open;
			break;

		case COMMANDS.playMedia:
			event.target.play();
			break;

		case COMMANDS.pauseMedia:
			event.target.pause();
			break;


		case COMMANDS.requestPictureInPicture:
			event.target.requestPictureInPicture();
			break;

		case COMMANDS.copyText:
			navigator.clipboard.writeText(event.target.textContent);
			break;

		default:
			if (registeredCommands.has(event.command)) {
				const callback = registeredCommands.get(event.command);
				callback(event);
			}
	}
}

/**
 * Adds a `command` listener to the target element
 *
 * @param {Element} target The target element for the listener
 * @param {object} init Extra event listener config object
 */
export function listenForCommands(target, init) {
	if (! (target instanceof Element)) {
		throw new TypeError('Target must be an element.');
	} else {
		target.addEventListener('command', handleCommand, init);
	}
}

const observer = typeof globalThis.document === 'undefined' ? null : new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		if (mutation.type === 'attributes' && mutation.attributeName === 'commandfor') {
			const target = mutation.target.commandForElement;

			if (target instanceof Element) {
				target.addEventListener('command', handleCommand);
			}
		}

		if (mutation.type === 'childList') {
			mutation.addedNodes.forEach(node => {
				if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('commandfor')) {
					const el = node.commandForElement;

					if (el instanceof Element) {
						el.addEventListener('command', handleCommand);
					}
				} else if (node.nodeType == Node.ELEMENT_NODE) {
					node.querySelectorAll('[commandfor]').forEach(el => {
						const target = el.commandForElement;

						if (target instanceof Element) {
							target.addEventListener('command', handleCommand);
						}
					});
				}
			});
		}
	});
});

/**
 * Automatically adds `command` listeners to added elements or when `commandfor` attribute is added
 *
 * @param {Element|DocumentFragment} target The root for the observer to watch from
 */
export function observeCommands(target = document.body) {
	target.querySelectorAll('button[commandfor]').forEach(el => {
		const target = el.commandForElement;

		if (target instanceof Element) {
			target.addEventListener('command', handleCommand);
		}
	});

	observer.observe(target, {
		attributes: true,
		attributeFilter: ['commandfor'],
		childList: true,
		subtree: true
	});
}

/**
 * Registers a command to be handled in a `CommandEvent`
 *
 * @param {string} command The command name
 * @param {(event: CommandEvent) => void} callback The callback to call
 */
export function registerCommand(command, callback) {
	if (typeof command !== 'string' || ! command.startsWith('--')) {
		throw new TypeError('Command must be a string prefixed with "--"');
	} else if (typeof callback !== 'function') {
		throw new TypeError('Callback must be a function to register.');
	} else if (registeredCommands.has(command)) {
		throw new Error(`Command "${command}" is already registered.`);
	} else if (registrationOpen) {
		registeredCommands.set(command, callback);
	}
}

/**
 * Creates a `command` and registers the callback
 *
 * @param {(event: CommandEvent) => void} callback The callback to call
 * @returns {string} The `command` that was generated
 */
export function createCommand(callback) {
	if (typeof callback !== 'function') {
		throw new TypeError('Callback must be a function.');
	} else if (registrationOpen) {
		const command = `${PREFIX}${crypto.randomUUID()}`;
		registeredCommands.set(command, callback);

		return command;
	} else {
		return '';
	}
}

/**
 * Creates a `command`, registers it, and returns the whole attribute
 *
 * @param {(event: CommandEvent) => void} callback The callback to call
 * @returns {string} `"command="..."`
 */
export function command(callback) {
	return `command="${createCommand(callback)}"`;
}

/**
 * Closes registration of new commands
 *
 * @returns {boolean}
 */
export const closeCommandRegistration = () => registrationOpen = false;

export { COMMANDS };
