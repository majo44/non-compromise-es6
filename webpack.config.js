const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    module: {
        rules: [
            {
                test: /\.js/,
                include: [
                    path.join(__dirname, 'web_modules'),
                    path.join(__dirname, 'node_modules'),
                    path.join(__dirname, 'app/src'),
                ],
                loader: 'ts-loader',
                options: { transpileOnly: true },
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, 'app/dist'),
        chunkFilename: '[name].js',
        filename: 'index.js',
        publicPath: 'app/',
    },
    mode: 'production',
    entry: './app/src/index.js',
    target: 'web',
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/\/env\.js/, path.join(__dirname, 'app/src/env.prod.js')),
        new UglifyJSPlugin({ sourceMap: true, extractComments: true }),
    ],
};
