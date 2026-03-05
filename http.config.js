import { readFile } from 'node:fs/promises';
const icon = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
	<rect x="0" y="0" height="100" width="100" rx="10" ry="10" fill="red"></rect>
</svg>`;

const sri = async text => await crypto.subtle.digest('SHA-384', new TextEncoder().encode(text))
	.then(digest => 'sha384-' + new Uint8Array(digest).toBase64());

const commands = await readFile('commands.js', { encoding: 'utf-8' });
const scriptSRI = await sri(commands);
const iconSRI = await sri(icon);

export default {
	open: true,
	routes: {
		'/': import.meta.resolve('./home.js'),
		'/favicon.svg': () => new Response(icon, {
			headers: {
				'Content-Type': 'image/svg+xml',
				'Access-Control-Allow-Origin': 'http://localhost:8080',
				'Integrity': iconSRI,
			},
		}),
		'/commands.js': () => new Response(commands, {
			headers: {
				'Content-Type': 'application/javascript',
				'Access-Control-Allow-Origin': 'http://localhost:8080',
				'Integrity': scriptSRI,
			},
		})
	}
};
