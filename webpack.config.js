var webpack = require('webpack');

module.exports = {
    entry: [
        './src/app/entry.ts'
    ],
    output: {
        path: './dist/',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['', '.ts', '.js', '.pug']
    },
    module: {
        loaders: [
            { test: /\.ts?$/, loader: 'ts' },
            { test: /\.pug?$/, loader: 'pug-html', exclude: /(src\/public)/}
        ]
    },
    plugins: (function () {
        var returns = [];

        if (process.env.NODE_ENV == 'production') {
            returns.push(new webpack.optimize.UglifyJsPlugin());
        }

        return returns;
    })()
}
