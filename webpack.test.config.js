const path = require("path");
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './tests/all_tests.ts',
  watch: false,
  mode: 'development',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    filename: 'test.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};