import { COMMANDS, ROOT_COMMANDS } from './consts.js';
import { getCommandWithArgs } from './utils.js';
import { Importmap } from '@shgysk8zer0/importmap';

const importmap = new Importmap(); // Serializes to `{"imports": {...}, "scropes": {}}` from a trusted library
await importmap.importLocalPackage(); // Adds the local project/package to the `imports` via `package.json`
const importmapSRI = await importmap.getIntegrity({ algo: 'SHA-384' });
const POLYFILL_SRI = 'sha384-7yz8QDqFdoZyAnsrpHCA/lGoTyWgsFBb4jWnbCDDEDI/AUhhqgBPDhAejhhSRgAN';
const script = `
import { observeCommands, initRootCommands, registerRootCommand, registerCommand } from '/commands.js'
import properties from '@aegisjsproject/styles/css/properties.css' with { type: 'css' };
import theme from '@aegisjsproject/styles/css/theme.css' with { type: 'css' };
import btn from '@aegisjsproject/styles/css/button.css' with { type: 'css' };
import misc from '@aegisjsproject/styles/css/misc.css' with { type: 'css' };

trustedTypes.createPolicy('default', {
	createHTML(input) {
		const el = document.createElement('template'); // Ensures it is inert
		el.setHTML(input); // Uses the Sanitizer API
		return el.innerHTML; // Returns safe, sanitized HTML;
	}
});

document.adoptedStyleSheets = [properties, theme, btn, misc];
registerRootCommand('--menu', () => document.getElementById('menu').showPopover());
registerRootCommand('--help', () => document.getElementById('help').showPopover());
registerRootCommand('--log', (event, ...args) => console.log({ event, args }));
observeCommands();
initRootCommands();
`;

const style = `:root {
	color-scheme: dark;

	& body.foo {
		filter: invert(1);
	}
}`;

const sri = async text => await crypto.subtle.digest('SHA-384', new TextEncoder().encode(text))
	.then(digest => 'sha384-' + new Uint8Array(digest).toBase64());

const scriptSRI = await sri(script);
const styleSRI = await sri(style);

const headers = new Headers({
	'Content-Type': 'text/html',
	'Referrer-Policy': 'no-referrer',
	// Cannot add `integrity` to an `import`ed module
	// 'Integrity-Policy': 'blocked-destinations=(script)',
	'Content-Security-Policy': `default-src 'none'; script-src 'self' '${scriptSRI}' '${POLYFILL_SRI}' '${importmapSRI}'; style-src ${importmap.resolve('@aegisjsproject/styles/css/')} '${styleSRI}'; font-src 'self'; base-uri 'self'; manifest-src 'self'; worker-src 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; child-src 'self'; connect-src 'self'; img-src 'self' blob:; media-src https://0eff4f4c-7f45-405c-8cf6-f7a3b3c1f07e.mdnplay.dev; sandbox allow-scripts allow-modals allow-popups allow-forms allow-downloads allow-top-navigation-by-user-activation allow-same-origin; trusted-types default aegis-sanitizer#html; require-trusted-types-for 'script'; upgrade-insecure-requests;`,
	'Permissions-Policy': 'accelerometer=(), ambient-light-sensor=(), attribution-reporting=(), autoplay=(), battery=(), bluetooth=(), browsing-topics=(), camera=(self), compute-pressure=(), cross-origin-isolated=(), display-capture=(), encrypted-media=(), fullscreen=(self), gamepad=(), geolocation=(self), gyroscope=(), hid=(), identity-credentials-get=(), idle-detection=(), local-fonts=(self), magnetometer=(), microphone=(self), midi=(), otp-credentials=(), payment=(), picture-in-picture=(self), publickey-credentials-get=(self), screen-wake-lock=(self), serial=(), speaker-selection=(), storage-access=(), usb=(), web-share=(self), window-management=(), xr-spatial-tracking=()',
	'Cross-Origin-Embedder-Policy': 'require-corp',
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Cross-Origin-Resource-Policy': 'same-site',
	'Origin-Agent-Cluster': '?1',
});

const doc = `<!DOCTYPE html>
<html id="doc">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width" />
		<meta name="color-scheme" content="light dark" />
		<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any">
		${await importmap.getScript()}
		<script src="${importmap.resolve('@shgysk8zer0/polyfills')}" crossorigin="anonymous" referrerpolicy="no-referrer" integrity="${POLYFILL_SRI}" defer=""></script>
		<script type="module" integrity="${scriptSRI}">${script}</script>
		<style integrity="${styleSRI}" id="style">${style}</style>
	</head>
	<body id="top">
		<header id="header"></header>
		<nav id="nav">
			<button type="button" class="btn btn-primary" command="${COMMANDS.disable}" commandfor="btn">Disable</button>
			<button type="button" class="btn btn-primary" command="${COMMANDS.remove}" commandfor="main" id="btn">Remove</button>
			<button type="button" class="btn btn-primary" command="${COMMANDS.show}" commandfor="dialog">Show Dialog</button>
			<button type="button" class="btn btn-primary" command="${COMMANDS.showModal}" commandfor="dialog">Show Modal Dialog</button>
			<button type="button" class="btn btn-primary" command="${COMMANDS.showPopover}" commandfor="popover">Show Popover</button>
			<button type="button" class="btn btn-primary" command="${COMMANDS.togglePopover}" commandfor="popover">Toggle Popover</button>
			<button type="button" class="btn btn-primary" command="${ROOT_COMMANDS.help}" commandfor="doc" accesskey="h">Help</button>
			<button type="button" class="btn btn-primary" command="${COMMANDS.disable}" commandfor="style">Disable Styles</button>
			<button type="button" class="btn btn-primary" command="${COMMANDS.enable}" commandfor="style">Enable Styles</button>
			<button type="button" class="btn btn-primary" command="${getCommandWithArgs(COMMANDS.addClass, 'foo', 'bar')}:foo:bar" commandfor="top">Add <code>foo</code> <code>bar</code></button>
			<button type="button" class="btn btn-primary" command="${getCommandWithArgs(COMMANDS.removeClass, 'foo', 'bar')}" commandfor="top">Remove <code>foo</code> <code>bar</code></button>
			<button type="button" class="btn btn-primary" command="--menu" commandfor="doc" accesskey="m">Menu</button>
			<button type="button" class="btn btn-primary" command="${COMMANDS.requestFullscreen}" commandfor="nav">Fullscreen</button>
			<button type="button" class="btn btn-primary" command="${ROOT_COMMANDS.exitFullscreen}" commandfor="doc">Exit Fullscreen</button>
			<button type="button" class="btn btn-primary" command="${ROOT_COMMANDS.share}" data-share-title="test" data-share-url="https://example.com" data-share-text="Hello, World!" commandfor="doc">Share</button>
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
				<button type="button" class="btn btn-primary" command="${COMMANDS.playMedia}" commandfor="vid">Play</button>
				<button type="button" class="btn btn-primary" command="${COMMANDS.pauseMedia}" commandfor="vid">Pause</button>
				<button type="button" class="btn btn-primary" command="${COMMANDS.requestFullscreen}" commandfor="vid">Fullscreen</button>
				<button type="button" class="btn btn-primary" command="${COMMANDS.requestPictureInPicture}" commandfor="vid">Picture-in-Picture</button>
			</div>
			<button type="button" class="btn btn-primary" command="${COMMANDS.close}" commandfor="dialog">Close</button>
			<button type="button" class="btn btn-primary" command="${COMMANDS.requestClose}" commandfor="dialog">Request Close</button>
		</dialog>
		<div id="popover" popover="auto">
			<p>This is a test of the <code>popover</code> API.</p>
			<button type="button" class="btn btn-primary" command="${COMMANDS.hidePopover}" commandfor="popover">Hide</button>
		</div>
		<menu id="menu" popover="auto">${[...Object.values(ROOT_COMMANDS), '--help'].map(command => `
			<li><button type="button" class="btn btn-primary" command="${command}" commandfor="doc"><code>${command}</code></button></li>
		`).join('')}
			<li><button type="button" class="btn btn-primary" command="--log:foo:bar:abc:123" commandfor="doc">Log</button></li>
		</menu>
		<div id="help" popover="auto">
			<p>Lorem Ipsum</p>
			<button type="button" class="btn btn-primary" command="hide-popover" commandfor="help">Close</button>
		</div>
	</body>
</html>`;

export default async () => new Response(doc, { headers });
