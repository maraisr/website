let webpack = require('webpack');

module.exports = {
	entry: [
		'./src/assets/js/main.js'
	],
	output: {
		path: './dist/',
		filename: '[name].js'
	},
	resolve: {
		extensions: ['', '.js']
	},
	plugins: (() => {
		var returns = [
			new webpack.DefinePlugin({
				__DEV__: JSON.stringify(JSON.parse((process.env.NODE_ENV != 'production')))
			})
		];

		if (process.env.NODE_ENV == 'production') {
			returns.push(new webpack.optimize.UglifyJsPlugin({
				preserveComments: false,
				mangle: true,
				compress: {
					dead_code: true,
					drop_debugger: true,
					drop_console: true
				},
				passes: 3
			}));
		}

		return returns;
	})()
}
