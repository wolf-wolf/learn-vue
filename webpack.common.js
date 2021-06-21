const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    mode: 'development',
    devtool: 'source-map',
    optimization: {
        usedExports: true
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        // disable type checker - we will use it in fork plugin
                        transpileOnly: true
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        // new MiniCssExtractPlugin({
        //     // Options similar to the same options in webpackOptions.output
        //     // both options are optional
        //     filename: '[name].[contenthash].css',
        //     chunkFilename: '[id].css'
        // }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/templates/index.html'
        }),
        new ForkTsCheckerWebpackPlugin(),
        // new CopyPlugin({
        //     patterns: [{ from: 'src/assets', to: 'assets' }]
        // })
    ]
};