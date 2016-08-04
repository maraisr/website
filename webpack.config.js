var webpack = require('webpack');

module.exports = {
    entry: [
        './src/app/entry.ts'
    ],
    output: {
        path: (process.env.NODE_ENV == 'production') ? './tmp/' : './dist/',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['', '.ts', '.js', '.pug']
    },
    module: {
        loaders: [
            { test: /\.ts?$/, loader: 'ts' },
            { test: /\.pug?$/, loader: 'pug-html', exclude: /(src\/public)/ }
        ]
    },
    plugins: (function () {
        var returns = [];

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
