import { COMMANDS } from './consts.js';

const script = `import('/commands.js')
	.then(({ observeCommands }) => observeCommands());`;

const hash = await crypto.subtle.digest('SHA-384', new TextEncoder().encode(script))
	.then(digest => new Uint8Array(digest).toBase64())
	.then(hash => `sha384-${hash}`);

const headers = new Headers({
	'Content-Type': 'text/html',
	'Content-Security-Policy': `default-src: 'self'; script-src 'self' '${hash}'`,
});


const doc = `<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width" />
		<meta name="color-scheme" content="light dark" />
		<script type="module" integrity="${hash}">${script}</script>
	</head>
	<body>
		<header id="header"></header>
		<nav id="nav">
			<button type="button" command="${COMMANDS.remove}" commandfor="main">Remove</button>
		</nav>
		<main id="main"></main>
		<aside id="sidebar"></aside>
		<footer id="footer"></footer>
	</body>
</html>`;

export default async () => new Response(doc, { headers });
