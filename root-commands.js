import { ROOT_COMMANDS } from './consts.js';
import { _disableSource, _enableSource, _finalizeEvent } from './utils.js';

/**
 * @typedef {Event & {source: Element, command: string}} CommandEvent
 * @property {Element} source - The element that triggered the command
 * @property {string} command - The command string
 */

let _commandRegistryOpen = true;
const _commands = new Map();

/**
 * Checks if the registry is open
 *
 * @returns {boolean} If the registry is open
 */
export const isCommandRootRegistryOpen = () => _commandRegistryOpen;

/**
 * Registers a command to be handled in a `CommandEvent`
 *
 * @param {string} command The command name
 * @param {(event: CommandEvent) => void} callback The callback to call
 */
export function registerRootCommand(command, callback) {
	if (typeof command !== 'string' || ! command.startsWith('--')) {
		throw new TypeError(`Invalid command "${command}". Commands must be strings prefixed with "--".`);
	} else if (typeof callback !== 'function') {
		throw new TypeError('Callbacks for commands must be functions.');
	} else if (_commands.has(command)) {
		throw new Error(`Command "${command}" already registered.`);
	} else if (! _commandRegistryOpen) {
		throw new Error('Attempting to register command with a closed registry.');
	} else {
		_commands.set(command, callback);
	}
}

/**
 * Closes registration of new commands
 *
 * @returns {boolean} If the call closed the registry
 */
export function closeCommandRootRegistry() {
	if (_commandRegistryOpen) {
		_commandRegistryOpen = false;
		return true;
	} else {
		return false;
	}
}

/**
 * Handles a `CommandEvent` with a built-in or registered handler
 *
 * @param {CommandEvent} event The event to handle
 */
export function handleRootCommand(event) {
	if (! event.defaultPrevented) {
		const [command, ...args] = event.command.split(':');

		switch(command) {
			case ROOT_COMMANDS.reload:
				location.reload();
				_finalizeEvent(event);
				break;

			case ROOT_COMMANDS.back:
				history.back();
				_finalizeEvent(event);
				break;

			case ROOT_COMMANDS.forward:
				history.forward();
				_finalizeEvent(event);
				break;

			case ROOT_COMMANDS.print:
				globalThis.print();
				_finalizeEvent(event);
				break;

			case ROOT_COMMANDS.share:
				if (navigator.share instanceof Function) {
					_disableSource(event);
					_finalizeEvent(event);

					const {
						shareTitle: title = document.title,
						shareUrl: url = location.href,
						shareText: text,
					} = event.source.dataset;

					navigator.share({ title, url, text })
						.then(() => _enableSource(event))
						.catch(globalThis.reportError);
				} else {
					event.source.disabled = true;
				}
				break;

			case ROOT_COMMANDS.exitFullscreen:
				_finalizeEvent(event);

				if (document.fullscreenElement instanceof Element) {
					document.exitFullscreen();
				}
				break;

			default:
				if (_commands.has(command)) {
					_disableSource(event);
					_finalizeEvent(event);

					Promise.try(_commands.get(command), event, ...args)
						.catch(globalThis.reportError)
						.finally(() => _enableSource(event));
				}
		}
	}
}

/**
 * Adds `command` listener on a given target/root element
 *
 * @param {object} config
 * @param {Element} [options.target=document.documentElement] The target element/root (defaults to `<html>`)
 * @param {AbortSignal} [options.signal] An optional `signal` to remove `command` listener
 */
export function initRootCommands({ target = document.documentElement, signal } = {}) {
	target.addEventListener('command', handleRootCommand, { signal });
}
