var webpack = require('webpack');

module.exports = {
	entry: './src/index.js',
	output: {
		path: 'www',
		filename: 'bundle.js'
	},
	devServer: {
		inline: true,
		contentBase: './www',
		port: 3000
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				loader: 'babel',
				query: {
					presets: ['flow', 'es2015', 'stage-0']
				}
			},
			{
				test: /\.(scss|css)$/,
				loader: 'style-loader!css-loader!sass-loader'
			}, 
			{
		    test: /\.(png|jpg)$/,
		    loader: 'url-loader?limit=10000'
			}				
		]
	}
};





