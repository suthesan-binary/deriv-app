const StyleLintPlugin = require('stylelint-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const shared_utils = require('@deriv/shared/utils/index.js');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const is_serve = process.env.BUILD_MODE === 'serve';
const is_release = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

module.exports = {
    entry: {
        accordion: 'Components/accordion',
        autocomplete: 'Components/autocomplete',
        button: 'Components/button',
        'button-link': 'Components/button-link',
        'button-toggle': 'Components/button-toggle',
        calendar: 'Components/calendar',
        clipboard: 'Components/clipboard',
        checkbox: 'Components/checkbox',
        checklist: 'Components/checklist',
        'circular-progress': 'Components/circular-progress',
        collapsible: 'Components/collapsible',
        counter: 'Components/counter',
        'composite-checkbox': 'Components/composite-checkbox',
        'date-picker': 'Components/date-picker',
        'date-of-birth-picker': 'Components/date-of-birth-picker',
        'desktop-wrapper': 'Components/desktop-wrapper',
        'data-list': 'Components/data-list',
        'data-table': 'Components/data-table',
        dialog: 'Components/dialog',
        'div100vh-container': 'Components/div100vh-container',
        drawer: 'Components/drawer',
        dropdown: 'Components/dropdown',
        'fade-wrapper': 'Components/fade-wrapper',
        'field-error': 'Components/field-error',
        'file-dropzone': 'Components/file-dropzone',
        'form-progress': path.resolve(__dirname, 'src', 'components/form-progress/index.js'),
        'form-submit-button': path.resolve(__dirname, 'src', 'components/form-submit-button/index.js'),
        'auto-height-wrapper': 'Components/auto-height-wrapper',
        icon: 'Components/icon',
        'icon-trade-types': 'Components/icon-trade-types',
        'icon/js/icons': 'Components/icon/icons.js',
        input: 'Components/input',
        label: 'Components/label',
        'linear-progress': 'Components/linear-progress',
        loading: 'Components/loading',
        'mobile-dialog': 'Components/mobile-dialog',
        'mobile-drawer': 'Components/mobile-drawer',
        'mobile-wrapper': 'Components/mobile-wrapper',
        modal: 'Components/modal',
        money: 'Components/money',
        'multi-step': 'Components/multi-step',
        numpad: 'Components/numpad/',
        'page-error': 'Components/page-error',
        'page-overlay': 'Components/page-overlay',
        'password-input': 'Components/password-input',
        'password-meter': 'Components/password-meter',
        popover: 'Components/popover',
        'progress-bar': 'Components/progress-bar',
        'progress-indicator': 'Components/progress-indicator',
        'radio-group': 'Components/radio-group',
        'select-native': 'Components/select-native',
        'send-email-template': 'Components/send-email-template',
        'swipeable-wrapper': 'Components/swipeable-wrapper',
        'relative-datepicker': 'Components/relative-datepicker',
        table: 'Components/table',
        tabs: 'Components/tabs',
        'toast-error': 'Components/toast-error',
        'themed-scrollbars': 'Components/themed-scrollbars',
        'toggle-switch': 'Components/toggle-switch',
        'tick-picker': 'Components/tick-picker',
        'tick-progress': 'Components/tick-progress',
        timeline: 'Components/timeline',
        'u-i-loader': 'Components/u-i-loader',
        'vertical-tab': 'Components/vertical-tab',
    },
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: '[name].js',
        libraryExport: 'default',
        library: '@deriv/component',
        libraryTarget: 'umd',
    },
    resolve: {
        alias: {
            Components: path.resolve(__dirname, 'src', 'components'),
        },
    },
    optimization: {
        minimize: true,
        // TODO enable splitChunks
        // splitChunks: {
        //     chunks: 'all'
        // }
    },
    devServer: {
        publicPath: '/dist/',
    },
    devtool: is_release ? 'source-map' : 'cheap-module-eval-source-map',
    module: {
        rules: [
            {
                test: /\.(s*)css$/,
                use: [
                    'css-hot-loader',
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: { sourceMap: true },
                    },
                    {
                        loader: 'sass-loader',
                        options: { sourceMap: true },
                    },
                    {
                        loader: 'sass-resources-loader',
                        options: {
                            resources: shared_utils,
                        },
                    },
                ],
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'svg-sprite-loader',
                        options: {
                            extract: true,
                            spriteFilename: svgPath => {
                                if (svgPath.includes('components/icon/common')) {
                                    return 'common.svg';
                                }
                                if (svgPath.includes('components/icon/currency')) {
                                    return 'currency.svg';
                                }
                                if (svgPath.includes('components/icon/flag')) {
                                    return 'flag.svg';
                                }
                                if (svgPath.includes('components/icon/mt5')) {
                                    return 'mt5.svg';
                                }
                                if (svgPath.includes('components/icon/tradetype')) {
                                    return 'tradetype.svg';
                                }
                                if (svgPath.includes('components/icon/underlying')) {
                                    return 'underlying.svg';
                                }
                                return 'common.svg';
                            },
                            publicPath: '/icon/sprite/',
                        },
                    },
                    {
                        loader: 'svgo-loader',
                        options: {
                            plugins: [{ removeUselessStrokeAndFill: false }, { removeUnknownsAndDefaults: false }],
                        },
                    },
                ],
            },
            !is_serve
                ? {
                      enforce: 'pre',
                      test: /\.(js|jsx)$/,
                      exclude: /node_modules|lib|shared\/utils/,
                      include: /src/,
                      loader: 'eslint-loader',
                      options: {
                          fix: true,
                      },
                  }
                : {},
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: ['@deriv/shared/utils/react-import-loader.js', 'babel-loader'],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: '[name].css' }),
        new StyleLintPlugin({ fix: true }),
        new SpriteLoaderPlugin({ plainSprite: true }),
        // ...(!is_release ? [ new BundleAnalyzerPlugin({ analyzerMode: 'static' }) ] : []),
    ],
    externals: [
        {
            formik: 'formik',
            classnames: 'classnames',
            '@contentpass/zxcvbn': '@contentpass/zxcvbn',
            'react-div-100vh': 'react-div-100vh',
            'react-drag-drawer': 'react-drag-drawer',
            'react-pose': 'react-pose',
            'babel-polyfill': 'babel-polyfill',
            'prop-types': 'prop-types',
            'react-transition-group': 'react-transition-group',
            react: 'react',
            'react-dom': 'react-dom',
            '@deriv/shared': '@deriv/shared',
            'react-router-dom': 'react-router-dom',
            'react-swipeable': 'react-swipeable',
            'react-tiny-popover': 'react-tiny-popover',
            'react-window': 'react-window',
        },
        /^@deriv\/shared\/.+$/,
    ],
};
