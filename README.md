# `@aegisjsproject/commands`

A lightweight command system for handling DOM interactions through `command` events and the `commandfor` attribute.

[![CodeQL](https://github.com/AegisJSProject/commands/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/AegisJSProject/commands/actions/workflows/codeql-analysis.yml)
![Node CI](https://github.com/AegisJSProject/commands/workflows/Node%20CI/badge.svg)
![Lint Code Base](https://github.com/AegisJSProject/commands/workflows/Lint%20Code%20Base/badge.svg)

[![GitHub license](https://img.shields.io/github/license/AegisJSProject/commands.svg)](https://github.com/AegisJSProject/commands/blob/master/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/AegisJSProject/commands.svg)](https://github.com/AegisJSProject/commands/commits/master)
[![GitHub release](https://img.shields.io/github/release/AegisJSProject/commands?logo=github)](https://github.com/AegisJSProject/commands/releases)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/shgysk8zer0?logo=github)](https://github.com/sponsors/shgysk8zer0)

[![npm](https://img.shields.io/npm/v/@aegisjsproject/commands)](https://www.npmjs.com/package/@aegisjsproject/commands)
![node-current](https://img.shields.io/node/v/@aegisjsproject/commands)
![npm bundle size gzipped](https://img.shields.io/bundlephobia/minzip/@aegisjsproject/commands)
[![npm](https://img.shields.io/npm/dw/@aegisjsproject/commands?logo=npm)](https://www.npmjs.com/package/@aegisjsproject/commands)

[![GitHub followers](https://img.shields.io/github/followers/AegisJSProject.svg?style=social)](https://github.com/AegisJSProject)
![GitHub forks](https://img.shields.io/github/forks/AegisJSProject/commands.svg?style=social)
![GitHub stars](https://img.shields.io/github/stars/AegisJSProject/commands.svg?style=social)
[![Twitter Follow](https://img.shields.io/twitter/follow/shgysk8zer0.svg?style=social)](https://twitter.com/shgysk8zer0)

[![Donate using Liberapay](https://img.shields.io/liberapay/receives/shgysk8zer0.svg?logo=liberapay)](https://liberapay.com/shgysk8zer0/donate "Donate using Liberapay")
- - -

- [Code of Conduct](./.github/CODE_OF_CONDUCT.md)
- [Contributing](./.github/CONTRIBUTING.md)
<!-- - [Security Policy](./.github/SECURITY.md) -->

## Core Concept

This library is based on the [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API).
Elements with a `commandfor` attribute automatically dispatch `command` events to their target elements when triggered. The
library handles these events with built-in commands or custom registered handlers.

```html
<!-- Using Built-In Commands -->
<button commandfor="my-element" command="show-modal">Show Modal</button>
<dialog id="my-element">
  <p>Hello, World!</p>
  <button commandfor="my-element" command="close">Close</button>
</dialog>
<!-- Using Custom Commands -->
<button commandfor="another-el" command="--aegis-command-remove">Remove Element</button>
<div id="another-el">This content will be removed.</div>
```

## Custom, pre-registered Commands

- `--aegis-command-hide`/`--aegis-command-unhide` - Controls hidden attribute
- `--aegis-command-disable`/`--aegis-command-enable` - Controls disabled attribute
- `--aegis-command-remove` - Removes element from DOM
- `--aegis-command-scroll-into-view` - Scrolls element into view (respects `prefers-reduced-motion`)
- `--aegis-command-request-fullscreen`/`--aegis-command-exit-fullscreen`/`--aegis-command-toggle-fullscreen` - Fullscreen API
- `--aegis-command-show-picker` - Opens input picker (date, color, etc.)
- `--aegis-command-step-up`/`--aegis-command-step-down` - Steps numeric inputs
- `--aegis-command-open-details`/`--aegis-command-close-details`/`--aegis-command-toggle-details` - Controls <details> elements
- `--aegis-command-play-media`/`--aegis-command-pause-media` - Media element controls
- `--aegis-command-request-picture-in-picture` - Picture-in-picture for videos
- `--aegis-command-copy-text` - Copies element's textContent to clipboard

## API

### `observeCommands(target?)`
Sets up automatic command handling. Call once during initialization.

```js
import { observeCommands } from './commands.js';
observeCommands(); // Observes document.body by default
```

### `registerCommand(command, callback)`
Registers custom commands (must be prefixed with `--`).

```js
import { registerCommand } from './commands.js';

registerCommand('--my-command', (event) => {
  console.log('Custom command triggered on', event.target);
});
```

### `createCommand(callback)`
Generates a unique command string and registers the callback.

```js
import { createCommand } from './commands.js';

const cmd = createCommand((event) => {
  event.target.style.color = 'red';
});
// Use `cmd` as the command attribute value
```

### `command(callback)`
Convenience function that returns a complete attribute string.

```js
import { command } from './commands.js';

element.innerHTML = `<button ${command(e => alert('clicked'))}>Click me</button>`;
```

### `listenForCommands(target, init?)`
Manually add command listener to specific elements.

```js
import { listenForCommands } from './commands.js';
listenForCommands(myElement, { once: true });
```

## Usage Patterns

### Basic Setup
```js
import { observeCommands } from './commands.js';
observeCommands();
```

### Custom Commands
```js
import { observeCommands, registerCommand } from './commands.js';

registerCommand('--toggle-class', (event) => {
  event.target.classList.toggle('active');
});

observeCommands();
```

### Dynamic Command Generation
```js
import { observeCommands, createCommand } from './commands.js';

const toggleColor = createCommand((event) => {
  const colors = ['red', 'blue', 'green'];
  const current = colors.indexOf(event.target.style.color);
  event.target.style.color = colors[(current + 1) % colors.length];
});

document.body.innerHTML += `<button commandfor="target" command="${toggleColor}">Change Color</button>`;
observeCommands();
```

## CommandEvent Properties

Command events extend regular events with:
- `source` - The element that triggered the command (the button/trigger)
- `command` - The command string that was executed#

# Memory Considerations

> [!WARNING]
> Command listeners are not automatically removed when elements are deleted. If you're frequently adding/removing elements with `commandfor` attributes in long-running applications, consider using `listenForCommands()` with `{ once: true }` for one-time interactions, or manually manage listeners for dynamic content.

## Security

Command registration closes automatically after initial setup. Call `closeCommandRegistration()` explicitly if needed for additional security.
