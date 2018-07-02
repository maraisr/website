const webpack = require('webpack');
const path = require('path');
const ClosureCompiler = require('google-closure-compiler-js').webpack;
const Wrapper = require('wrapper-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');

module.exports = {
	context: path.join(__dirname, 'src/assets/js'),

	entry: './main.ts',

	output: {
		path: `${__dirname}/dist/`,
		filename: '[name].js',
		devtoolModuleFilenameTemplate: 'mr:///[resource-path]',
		sourceMapFilename: '[name].map'
	},

	resolve: {
		extensions: ['.ts', '.js']
	},

	cache: true,
	devtool: 'source-map',

	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

	optimization: {
		minimizer: [
			new webpack.optimize.OccurrenceOrderPlugin(),
			new UglifyJsPlugin({ uglifyOptions: require('./config/uglifyjs') })
		]
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'awesome-typescript-loader'
			},
			{
				test: /\.(j|t)s$/,
				enforce: 'pre',
				loader: 'source-map-loader'
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
	plugins: (returns => {
		returns.push(
			new webpack.DefinePlugin({
				__DEV__: JSON.stringify(
					JSON.parse(process.env.NODE_ENV != 'production')
				),
				__BUILD__: JSON.stringify(
					parseInt(process.env.CIRCLE_BUILD_NUM || 0)
				)
			}),
			new CheckerPlugin()
		);

		if (process.env.NODE_ENV == 'production') {
			returns.push(
				new webpack.LoaderOptionsPlugin({
					minimize: true,
					debug: false
				})
			);

			returns.push(
				new ClosureCompiler({
					options: {
						languageIn: 'ECMASCRIPT6',
						languageOut: 'ECMASCRIPT5_STRICT',
						rewritePolyfills: false,
						processCommonJsModules: false,
						assumeFunctionWrapper: true,
						useTypesForOptimization: true,
						compilationLevel: 'SIMPLE',
						warningLevel: 'DEFAULT',
						createSourceMap: true,
						applyInputSourceMaps: true,
						externs: ['./src/externs/ga.js']
					}
				})
			);

			returns.push(
				new Wrapper({
					header: '(function(){',
					footer: '}).call(this)'
				})
			);
		}

		return returns;
	})([])
};
