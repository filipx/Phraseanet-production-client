// Webpack config for development
import webpack from 'webpack';
import path from 'path';
import config from '../config';

module.exports = {
    cache: true,
    debug: true,
    hot:false,
    output: {},
	entry: {},
    module: {
		postLoaders: [{
            test: /\.js$/,
            include: path.resolve('src/'),
            loader: 'istanbul-instrumenter'
        }],
        loaders: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loaders: ['babel-loader']
        }]
    },
    resolve: {
        extensions: ['', '.js']
    },
    plugins: []
};