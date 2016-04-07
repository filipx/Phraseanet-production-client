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
            test: /\.css$/,
            loader: 'style-loader!css-loader'
        }, {
            test: /\.png/,
            loader: 'url-loader?limit=100000'
        },  {
            test: /\.(png|jpg|jpeg|gif)$/,
            loader: 'file-loader'
        }, {
            test: /\.js?$/,
            exclude: /node_modules\/(?!phraseanet-common)/,
            loader: 'babel',
            query: {
                presets: ['es2015', 'stage-0']
            }
        }, {
            test: require.resolve('jquery-lazyload'),
            loader: "imports?this=>window"
        }, {
            test: require.resolve('phraseanet-common/src/components/tooltip'),
            loader: "imports?this=>window"
        }, {
            test: require.resolve('phraseanet-common/src/components/vendors/contextMenu'),
            loader: "imports?this=>window"
        }, {
            test: /\.json$/,
            loader: "json"
        }]
    },
    resolve: {
        extensions: ['', '.js', '.css']
    },
    externals: {
        jquery: 'jQuery',
        ui: 'jQuery.ui'
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/\.css$/, path.resolve('./src', './empty.js'))
    ]
};
