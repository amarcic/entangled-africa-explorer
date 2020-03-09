var path = require('path');
var HtmlWebpackPlugin =  require('html-webpack-plugin');

module.exports = {
    entry : './src/index.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        publicPath: '/',
        filename: 'index_bundle.js'
    },
    resolve: {
        modules: [__dirname + './src', 'node_modules'],
        extensions: ['.js', '.jsx']
    },
    devServer: {
        contentBase: './dist',
        historyApiFallback: true
    },
    module : {
        rules : [
            {
                test : /\.(js|jsx)$/,
                exclude: /node_modules/,
                use:'babel-loader'
            },
            {
                test : /\.css$/,
                use:['style-loader', 'css-loader']
            }
        ]
    },
//    mode:'development',
    plugins : [
        new HtmlWebpackPlugin ({
            template : 'src/index.html',
            favicon: 'src/favicon.ico'
        })
    ]

};


