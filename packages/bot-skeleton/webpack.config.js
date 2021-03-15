const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const is_release = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

module.exports = function(env, argv) {
    return {
        entry: path.join(__dirname, 'src', 'app.js'),
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bot-skeleton.js',
            libraryExport: 'default',
            library: '@deriv/bot-skeleton',
            libraryTarget: 'umd',
        },
        devServer: {
            publicPath: '/dist/',
            disableHostCheck: true,
        },
        resolve: {
            extensions: ['.js'],
        },
        mode: is_release ? 'production' : 'development',
        devtool: is_release ? 'source-map' : 'cheap-module-eval-source-map',
        target: 'web',
        module: {
            rules: [
                {
                    enforce: 'pre',
                    test: /\.(js|jsx)$/,
                    exclude: [/node_modules/, /lib/, /utils/],
                    loader: 'eslint-loader',
                    options: {
                        fix: true,
                    },
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    loader: [
                        '@deriv/shared/utils/react-import-loader.js',
                        'babel-loader',
                    ]
                },
                {
                    test: /\.xml$/,
                    exclude: /node_modules/,
                    use: 'raw-loader',
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin([
                { from: './node_modules/scratch-blocks/media', to: 'media' },
                { from: './src/assets/images', to: 'media' },
                { from: './src/scratch/sounds', to: 'media' },
            ]),
        ],
        externals: [
            {
                '@babel/polyfill': '@babel/polyfill',
                classnames: 'classnames',
                '@deriv/shared': '@deriv/shared',
                '@deriv/translations': '@deriv/translations',
                formik: 'formik',
                react: 'react',
                'react-dom': 'react-dom',
                '@deriv/deriv-charts': '@deriv/deriv-charts',
            },
            /^@deriv\/shared\/.+$/,
            /^@deriv\/translations\/.+$/,
        ],
    };
};
