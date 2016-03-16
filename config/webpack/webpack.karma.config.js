// Webpack config for development
import webpack from 'webpack';
import path from 'path';
import config from '../config';

module.exports = {
    cache: true,
    debug: true,
    hot: false,
    devtool: 'inline-source-map',
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
            loader: "imports?this=>window"
        }, {
            test: require.resolve('phraseanet-common/src/components/tooltip'),
            loader: "imports?this=>window"
        }, {
            test: require.resolve('phraseanet-common/src/components/vendors/contextMenu'),
            loader: "imports?this=>window"
        }]
    },
    resolve: {
        extensions: ['', '.js']
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
    ]
};
