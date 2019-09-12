const path = require('path');
const webpack = require('webpack');

// building a knock-off webpack-merge
// https://www.npmjs.com/package/webpack-merge
const mainExport = {
  target: 'node',
  mode: process.env.NODE_ENV,
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
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          },
        }
      },
    ]
  },
}

// options for makign cli
const cli = {
  entry: {
    cli: './cli.ts'
  },
  output: {
    path: path.resolve(__dirname, 'packages/hookd-cli'),
    filename: '[name].js',
    library: '',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  plugins: [
    new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true})
  ],
  node:{
    __dirname: true,
  }
}

// options for making the main module
const index = {
  entry: {
    index:'./index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'packages/hookd'),
    filename: '[name].js',
    library: '',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
}

// conditionals to assign proper variables to build env
if (process.env.BUILD === 'cli') Object.assign(mainExport, cli);
else if (process.env.BUILD === 'index') Object.assign(mainExport, index);

// exports mutated mainExport
module.exports = mainExport;