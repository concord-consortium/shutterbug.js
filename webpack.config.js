var path = require('path')
var webpack = require('webpack')
var CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    shutterbug: './js/index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    libraryExport: 'default',
    library: {
      // name of the global var: "Shutterbug"
      root: 'Shutterbug',
      amd: 'shutterbug',
      commonjs: 'shutterbug'
    }
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CopyWebpackPlugin([
      {from: 'public'}
    ])
  ],
  externals: [
    {
      'jquery': {
        root: 'jQuery',
        commonjs2: 'jquery',
        commonjs: 'jquery',
        amd: 'jquery'
      }
    }
  ]
}

