const path = require('path');
const slsw = require('serverless-webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { devDependencies } = require('./package.json');

const config = {
    target: 'node',
    entry: slsw.lib.entries,
    devtool: process.env.CI ? false : 'source-map',
    mode: process.env.CI ? 'production' : 'development',
    externals: [...Object.keys(devDependencies), 'dd-trace', 'datadog-lambda-js'],
    optimization: {
        minimize: false,
        chunkIds: 'named',
        moduleIds: 'named',
    },
    output: {
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '.build'),
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.js'],
    },
};

if (process.env.STATS) {
    config.plugins = [
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
        }),
    ];
}

module.exports = config;
