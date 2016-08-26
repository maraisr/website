let webpack = require('webpack'),
	path = require('path');

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
	module: {
		loaders: ((l) => {
			if (process.env.NODE_ENV == 'production') {
				l.push({
					test: /\.js$/,
					include: [
						path.resolve(__dirname, 'src/assets/js/')
					],
					exclude: /(node_modules|bower_components)/,
					loader: 'babel',
					query: {
						presets: ['es2015', 'babili']
					}
				});
			}

			return l;
		})([])
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
