const webpack = require('webpack'),
	path = require('path'),
	ClosureCompiler = require('google-closure-compiler-js').webpack,
	Wrapper = require('wrapper-webpack-plugin');

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
				loader: 'ts'
			});

			return l;
		})([])
	},
	plugins: ((returns) => {
		returns.push(
			new webpack.DefinePlugin({
				__DEV__: JSON.stringify(JSON.parse((process.env.NODE_ENV != 'production')))
			})
		);

		if (process.env.NODE_ENV == 'production') {
			returns.push(new webpack.LoaderOptionsPlugin({
				minimize: true,
				debug: false
			}));

			returns.push(new ClosureCompiler({
				options: {
					languageIn: 'ECMASCRIPT6',
					languageOut: 'ECMASCRIPT5_STRICT',
					rewritePolyfills: true,
					processCommonJsModules: true,
					assumeFunctionWrapper: true,
					useTypesForOptimization: true,
					compilationLevel: 'ADVANCED',
					warningLevel: 'DEFAULT',
					externs: ['./src/externs/ga.js']
				}
			}));

			returns.push(new Wrapper({
				header: '(function(){',
				footer: '}).call(this)'
			}));
		}

		return returns;
	})([])
};
