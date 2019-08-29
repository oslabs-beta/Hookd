const path = require('path');

module.exports= {
  entry: './index.ts',
  output: {
    path: path.resolve(__dirname),
    filename: 'index.js'
  },
  mode: process.env.NODE_ENV,
  devServer: {
    publicPath: '/build'
  },
  resolve: {
    modules: [path.join(__dirname, './node_modules')],
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        exclude: /node_modules/,
        use: [
          {loader: 'ts-loader'}
        ]
      },
      {
        enforce: 'pre',
        test: /\.jsx?/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          },
        }
      },
    ]
  }
};