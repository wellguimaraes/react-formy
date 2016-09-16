var webpack = require('webpack');

module.exports = {
  entry    : [
    './demo/demo.js'
  ],
  output   : {
    path    : __dirname + '/demo',
    filename: 'bundle.js'
  },
  module   : {
    loaders: [
      {
        test   : /\.jsx?$/,
        exclude: /node_modules/,
        loader : 'babel'
      },
      {
        test   : /\.s[ac]ss$/,
        loaders: [ 'style', 'css', 'sass' ]
      },
      {
        test   : /\.css$/,
        loaders: [ 'style', 'css' ]
      }
    ]
  },
  devServer: {
    historyApiFallback: true,
    contentBase       : './demo',
    inline            : true,
    port              : 8002
  }
};
