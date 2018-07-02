module.exports = {
	minimize: true,
	mangle: true,
	warnings: false,
	output: { comments: false },
	sourceMap: false,
	compress: {
		sequences: true,
		dead_code: true,
		conditionals: true,
		booleans: true,
		unused: true,
		if_return: true,
		join_vars: true,
		unsafe: true,
		loops: true,
		passes: 3
	}
};
