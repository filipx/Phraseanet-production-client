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
            exclude: /node_modules\/(?!phraseanet-common)/,
            loaders: ['babel-loader']
        }, {
            test: require.resolve('jquery-lazyload'),
            loader: "imports?this=>window&$=jquery"
        }]
    },
    resolve: {
        extensions: ['', '.js']
    },
    externals: {
        jquery: 'jQuery',
        ui: 'jQuery.ui'
    }
};
