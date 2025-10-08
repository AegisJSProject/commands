export function _enableSource({ source }) {
	if (source instanceof HTMLButtonElement) {
		source.disabled = false;
	}
}

export function _disableSource({ source }) {
	if (source instanceof HTMLButtonElement) {
		source.disabled = true;
	}
}

export function _finalizeEvent(event) {
	if (event.cancelable) {
		event.preventDefault();
	}

	event.stopImmediatePropagation();
}

export const getCommandWithArgs = (command, ...args) => args.length === 0 ? command : `${command}:${args.join(':')}`;
