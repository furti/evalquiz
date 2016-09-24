var webpack = require("webpack");

var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

module.exports = {
    debug: true,

    devtool: "source-map",

    entry: {
        "vendor": "./src/script/vendor",
        "app": "./src/script/app"
    },

    externals: {
        "jquery": "jQuery",
        "showdown": "showdown",
        "codemirror": "codemirror",
        "jshint": "jshint",
        "lint": "lint",
        "esprima": "esprima"
    },

    output: {
        path: __dirname + "/dist/script",
        filename: "[name].js",
        publicPath: "script/"
    },

    resolve: {
        extensions: ["", ".ts", ".tsx", ".js"]
    },

    module: {
        loaders: [
            {
                test: /\.html$/,
                loaders: ["html-loader"]
            },
            {
                test: /\.ts$/,
                loaders: ["awesome-typescript-loader"],
                exclude: /node_modules/
            }
        ]
    },

    modulesDirectories: ["node_modules"],

    plugins: [
        new CommonsChunkPlugin({
            name: "vendor"
        })
    ],

    node: {
        __filename: true
    },

    devServer: {
        inline: true,
        port: 8080,
        historyApiFallback: true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    }
};