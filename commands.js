import { PREFIX, COMMANDS, ROOT_COMMANDS } from './consts.js';
import { _disableSource, _enableSource, _finalizeEvent, getCommandWithArgs } from './utils.js';

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
	const [command, ...args] = event.command.split(':');
	switch(command) {
		case COMMANDS.addClass:
			event.target.classList.add(...args);
			_finalizeEvent(event);
			break;

		case COMMANDS.removeClass:
			event.target.classList.remove(...args);
			_finalizeEvent(event);
			break;

		case COMMANDS.show:
			event.target.show();
			_finalizeEvent(event);
			break;

		case COMMANDS.hide:
			event.target.hidden = true;
			_finalizeEvent(event);
			break;

		case COMMANDS.unhide:
			event.target.hidden = false;
			_finalizeEvent(event);
			break;

		case COMMANDS.disable:
			event.target.disabled = true;
			_finalizeEvent(event);
			break;

		case COMMANDS.enable:
			event.target.disabled = false;
			_finalizeEvent(event);
			break;

		case COMMANDS.scrollIntoView:
			event.target.scrollIntoView({
				behavior: event.target.dataset.behavior ?? matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
				block: event.target.dataset.block ?? 'start',
				container: event.target.dataset.container ?? 'all',
				inline: event.target.dataset.inline ?? 'nearest',
			});

			_finalizeEvent(event);
			break;

		case COMMANDS.remove:
			event.target.remove();
			_finalizeEvent(event);
			break;

		case COMMANDS.requestFullscreen:
			event.target.requestFullscreen();
			_finalizeEvent(event);
			break;

		case COMMANDS.exitFullscreen:
			if (event.target.isSameNode(document.fullscreenElement)) {
				document.exitFullscreen();
				_finalizeEvent(event);
			}

			break;

		case COMMANDS.toggleFullscreen:
			if (event.target.isSameNode(document.fullscreenElement)) {
				document.exitFullscreen();
				_finalizeEvent(event);
			} else {
				event.target.requestFullscreen();
				_finalizeEvent(event);
			}
			break;

		case COMMANDS.showPicker:
			event.target.showPicker();
			_finalizeEvent(event);
			break;

		case COMMANDS.stepUp:
			event.target.stepUp();
			_finalizeEvent(event);
			break;

		case COMMANDS.stepDown:
			event.target.stepDown();
			_finalizeEvent(event);
			break;

		case COMMANDS.openDetails:
			event.target.open = true;
			_finalizeEvent(event);
			break;

		case COMMANDS.closeDetails:
			event.target.open = false;
			_finalizeEvent(event);
			break;

		case COMMANDS.toggleDetails:
			event.target.open = ! event.target.open;
			_finalizeEvent(event);
			break;

		case COMMANDS.playMedia:
			event.target.play();
			_finalizeEvent(event);
			break;

		case COMMANDS.pauseMedia:
			event.target.pause();
			_finalizeEvent(event);
			break;


		case COMMANDS.requestPictureInPicture:
			event.target.requestPictureInPicture();
			_finalizeEvent(event);
			break;

		case COMMANDS.copyText:
			_disableSource(event);
			_finalizeEvent(event);
			navigator.clipboard.writeText(event.target.textContent).finally(() => _enableSource(event));
			break;

		default:
			if (registeredCommands.has(command)) {
				_disableSource(event);
				_finalizeEvent(event);

				Promise.try(registeredCommands.get(command), event, ...args)
					.catch(globalThis.reportError)
					.finally(() => _enableSource(event));
			}
	}
}

const COMMAND_VALUES = Object.values(COMMANDS);

/**
 * Checks if a command is registered
 *
 * @param {string} command The command to check for
 * @returns {boolean} If the command is registered
 */
export function hasCommand(command){
	const cmd = typeof command === 'string' ? command.split(':')[0] : null;

	return typeof cmd === 'string'
		&& cmd.startsWith('--')
		&& (COMMAND_VALUES.includes(cmd) || registeredCommands.has(cmd));
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

			if (target instanceof Element && hasCommand(mutation.target.command)) {
				target.addEventListener('command', handleCommand);
			}
		}

		if (mutation.type === 'childList') {
			mutation.addedNodes.forEach(node => {
				if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('commandfor')) {
					const el = node.commandForElement;

					if (el instanceof Element && hasCommand(node.command)) {
						el.addEventListener('command', handleCommand);
					}
				} else if (node.nodeType == Node.ELEMENT_NODE) {
					node.querySelectorAll('[commandfor][command]').forEach(el => {
						const target = el.commandForElement;

						if (target instanceof Element && hasCommand(el.command)) {
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
	target.querySelectorAll('button[command][commandfor]').forEach(el => {
		const target = el.commandForElement;

		if (target instanceof Element && hasCommand(el.command)) {
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
export function command(callback, ...args) {
	return args.length === 0 ? `command="${createCommand(callback)}"` : `command="${createCommand(callback)}:${args.join(':')}"`;
}

/**
 * Closes registration of new commands
 *
 * @returns {boolean}
 */
export function closeCommandRegistration() {
	if (registrationOpen) {
		registrationOpen = false;
		return true;
	} else {
		return false;
	}
}

export { COMMANDS, ROOT_COMMANDS, getCommandWithArgs };
export { registerRootCommand, closeCommandRootRegistry, handleRootCommand, initRootCommands } from './root-commands.js';
