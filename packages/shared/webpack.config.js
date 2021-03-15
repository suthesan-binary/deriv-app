const StyleLintPlugin = require('stylelint-webpack-plugin');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isServe = process.env.BUILD_MODE === 'serve';

module.exports = {
    target: 'web',
    entry: {
        config: path.resolve(__dirname, 'src', 'utils/config/index.js'),
        currency: path.resolve(__dirname, 'src', 'utils/currency/index.js'),
        object: path.resolve(__dirname, 'src', 'utils/object/index.js'),
        screen: path.resolve(__dirname, 'src', 'utils/screen/index.js'),
        string  : path.resolve(__dirname, 'src', 'utils/string/index.js'),
        os: path.resolve(__dirname, 'src', 'utils/os/index.js'),
        route: path.resolve(__dirname, 'src', 'utils/route/index.js'),
        routes: path.resolve(__dirname, 'src', 'utils/routes/index.js'),
        date: path.resolve(__dirname, 'src', 'utils/date/index.js'),
        platform: path.resolve(__dirname, 'src', 'utils/platform/index.js'),
        url: path.resolve(__dirname, 'src', 'utils/url/index.js'),
        storage: path.resolve(__dirname, 'src', 'utils/storage/index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'utils'),
        filename: '[name].js',
        libraryExport: 'default',
        library: '@deriv/shared',
        libraryTarget: 'umd',
    },
    optimization: {
        minimize: true,
    },
    module: {
        rules: [
            !isServe
                ? {
                      enforce: 'pre',
                      test: /\.(js)$/,
                      exclude: [/node_modules/, /utils/],
                      loader: 'eslint-loader',
                      options: {
                          fix: true,
                      },
                  }
                : {},
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'src/styles/*.scss', to: 'styles', flatten: true },
            { from: 'src/styles/index.js', to: 'index.js' },
            { from: 'src/loaders/deriv-components-loader.js', to: 'deriv-components-loader.js' },
            { from: 'src/loaders/react-import-loader.js', to: 'react-import-loader.js' },
            { from: 'src/loaders/deriv-account-loader.js', to: 'deriv-account-loader.js' },
        ]),
        new StyleLintPlugin({ fix: true }),
    ],
    externals: [
        {
            'babel-polyfill': 'babel-polyfill',
            moment: 'moment',
            '@deriv/components': '@deriv/components',
        },
        /^@deriv\/components\/.+$/,
    ],
};
