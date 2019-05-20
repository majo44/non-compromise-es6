const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	externals: {
		"/web_modules/storeon/devtools/index.js" : 'null',
		"/web_modules/storeon/devtools/logger.browser.js": 'null'
	},
	module: {

		rules: [
			{
				test: /\.js/,
				include: [
					path.join(__dirname, 'web_modules'),
					path.join(__dirname, 'node_modules'),
				],
				loader: "ts-loader",
				options: {transpileOnly: true, instance: 'A'}
			},
			{
				test: /\.js/,
				include: [path.join(__dirname, 'app/src')],
				use: [
					{ loader: "ts-loader", options: {instance: 'B'}},
					{
						loader: 'string-replace-loader',
						options: {
							multiple: [
								{search: '/env.js', replace: '/env.prod.js', flags: 'g'},
							]
						}
					}
				],
			},
		]
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"]
	},
	output: {
		path: path.resolve(__dirname, 'app/dist'),
		chunkFilename: '[name].js',
		filename: 'index.js',
		publicPath: 'app/'
	},
	mode: 'production',
    entry: './app/src/index.js',
	target: "web",
	plugins: [
		new UglifyJSPlugin({ sourceMap: true, extractComments: true }),
	]
};
