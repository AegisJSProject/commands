import { COMMANDS } from './consts.js';

const script = `import('/commands.js')
	.then(({ observeCommands }) => observeCommands());`;

const hash = await crypto.subtle.digest('SHA-384', new TextEncoder().encode(script))
	.then(digest => new Uint8Array(digest).toBase64())
	.then(hash => `sha384-${hash}`);

const headers = new Headers({
	'Content-Type': 'text/html',
	'Content-Security-Policy': `default-src 'self'; script-src 'self' '${hash}'; media-src https://0eff4f4c-7f45-405c-8cf6-f7a3b3c1f07e.mdnplay.dev;`,
});


const doc = `<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width" />
		<meta name="color-scheme" content="light dark" />
		<script src="/node_modules/@shgysk8zer0/polyfills/browser.min.js" referrerpolicy="no-referrer" defer=""></script>
		<script type="module" integrity="${hash}">${script}</script>
	</head>
	<body>
		<header id="header"></header>
		<nav id="nav">
			<button type="button" command="${COMMANDS.disable}" commandfor="btn">Disable</button>
			<button type="button" command="${COMMANDS.remove}" commandfor="main" id="btn">Remove</button>
			<button type="button" command="${COMMANDS.show}" commandfor="dialog">Show Dialog</button>
			<button type="button" command="${COMMANDS.showModal}" commandfor="dialog">Show Modal Dialog</button>
			<button type="button" command="${COMMANDS.showPopover}" commandfor="popover">Show Popover</button>
			<button type="button" command="${COMMANDS.togglePopover}" commandfor="popover">Toggle Popover</button>
		</nav>
		<main id="main"></main>
		<aside id="sidebar"></aside>
		<footer id="footer"></footer>
		<dialog id="dialog">
			<p>This is a test of the <code>&lt;dialog&gt;</code> API</p>
			<video id="vid" crossorigin="anonymous">
				<source src="https://0eff4f4c-7f45-405c-8cf6-f7a3b3c1f07e.mdnplay.dev/shared-assets/videos/flower.webm" type="video/webm" />
				<source src="https://0eff4f4c-7f45-405c-8cf6-f7a3b3c1f07e.mdnplay.dev/shared-assets/videos/flower.mp4" type="video/mp4" />
			</video>
			<div>
				<button type="button" command="${COMMANDS.playMedia}" commandfor="vid">Play</button>
				<button type="button" command="${COMMANDS.pauseMedia}" commandfor="vid">Pause</button>
				<button type="button" command="${COMMANDS.requestFullscreen}" commandfor="vid">Fullscreen</button>
				<button type="button" command="${COMMANDS.requestPictureInPicture}" commandfor="vid">Picture-in-Picture</button>
			</div>
			<button type="button" command="${COMMANDS.close}" commandfor="dialog">Close</button>
			<button type="button" command="${COMMANDS.requestClose}" commandfor="dialog">Request Close</button>
		</dialog>
		<div id="popover" popover="auto">
			<p>This is a test of the <code>popover</code> API.</p>
			<button type="button" command="${COMMANDS.hidePopover}" commandfor="popover">Hide</button>
		</div>
	</body>
</html>`;

export default async () => new Response(doc, { headers });
