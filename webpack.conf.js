import * as Webpack from 'webpack';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: {
        index: { import: path.resolve(__dirname, './src/index.ts') },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devServer: {
        contentBase: './dist',
        hot: true
    },
    output: {
        filename: 'bundle.[hash].js', // <- ensure unique bundle name
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "./src/templates/index.html")
        }),
        new Webpack.HotModuleReplacementPlugin(),
    ],
};
