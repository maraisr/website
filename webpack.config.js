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
		extensions: ['.ts', '.js']
	},
	cache: true,
	devtool: false,
	module: {
		rules: [
			{
				test: /\.ts$/,
				include: [
					path.resolve(__dirname, 'src/assets/js/')
				],
				exclude: /node_modules/,
				loader: 'ts-loader'
			},
			{
				test: /\.pug$/,
				loaders: [
					{
						loader: 'svelte-loader'
					},
					{
						loader: 'pug-html-loader',
						query: {
							exports: false
						}
					}
				]
			}
		]
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

			returns.push(new webpack.optimize.OccurrenceOrderPlugin());
			returns.push(new webpack.optimize.AggressiveMergingPlugin());

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
