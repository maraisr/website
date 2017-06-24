const webpack = require('webpack'),
	path = require('path'),
	ClosureCompiler = require('google-closure-compiler-js').webpack,
	Wrapper = require('wrapper-webpack-plugin');

module.exports = {
	entry: ['./src/assets/js/main.ts'],
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
	module: {
		rules: [
			{
				test: /\.ts$/,
				include: [path.resolve(__dirname, 'src/assets/js/')],
				exclude: /node_modules/,
				loader: 'ts-loader'
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
			})
		);

		if (process.env.NODE_ENV == 'production') {
			returns.push(
				new webpack.LoaderOptionsPlugin({
					minimize: true,
					debug: false
				})
			);

			returns.push(new webpack.optimize.OccurrenceOrderPlugin());
			returns.push(new webpack.optimize.AggressiveMergingPlugin());
			returns.push(new webpack.optimize.ModuleConcatenationPlugin());

			returns.push(
				new webpack.optimize.UglifyJsPlugin(
					require('./config/uglifyjs')
				)
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
