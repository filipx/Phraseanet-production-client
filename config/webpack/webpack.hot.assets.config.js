/* eslint-disable no-var, strict */
require('babel-core/register');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const environment = require('../environment');
const config = require('./webpack.development.config');

config.entry = [
    // For hot style updates
    'webpack/hot/only-dev-server',
    // The script refreshing the browser on none hot updates
    'webpack-dev-server/client?http://localhost:8080'
].concat(config.entry);

config.plugins = [
    // Used for hot-reload
    new webpack.HotModuleReplacementPlugin()
];

new WebpackDevServer(webpack(config), {
    publicPath: 'http://localhost:8080/assets/',
    // Configure hot replacement
    hot: true,
    // The rest is terminal configurations
    quiet: false,
    noInfo: true,
    historyApiFallback: {
        index: './templates/index.html'
    },
    progress: true,
    stats: {
        colors: true
    }
    // We fire up the development server and give notice in the terminal
    // that we are starting the initial bundle
}).listen(8080, environment.HOST, function(err, result) {

    if (err) {
        console.log(err);
    }
    console.log('The asset server is listening  at localhost: 8080');
});