import terser from '@rollup/plugin-terser';

export default [{
	input: 'commands.js',
	output: [{
		file: 'commands.cjs',
		format: 'cjs',
	}, {
		file: 'commands.min.js',
		format: 'esm',
		plugins: [terser()],
		sourcemap: true,
	}],
}];
