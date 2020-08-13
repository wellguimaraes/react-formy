const path = require('path')
const fs = require('fs')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: {
    formy: './src/formy.tsx',
  },
  target: 'node',
  externals: [nodeExternals()],
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    libraryTarget: 'umd',
    umdNamedDefine: true,
    path: path.resolve(__dirname, 'lib'),
  },
}
