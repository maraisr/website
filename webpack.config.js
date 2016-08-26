let webpack = require('webpack'),
	path = require('path');

module.exports = {
	entry: [
		'./src/assets/js/main.ts'
	],
	output: {
		path: './dist/',
		filename: '[name].js'
	},
	resolve: {
		extensions: ['', '.ts', '.js']
	},
	module: {
		loaders: ((l) => {
			l.push({
				test: /\.ts$/,
				include: [
					path.resolve(__dirname, 'src/assets/js/')
				],
				exclude: /(node_modules|bower_components)/,
				loader: (process.env.NODE_ENV == 'production') ? 'ts!babel' : 'ts'
			});

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
