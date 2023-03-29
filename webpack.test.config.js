const path = require("path");
const nodeExternals = require('webpack-node-externals');
const {CleanWebpackPlugin} = require("clean-webpack-plugin");

module.exports = {
  entry: './tests/all_tests.ts',
  mode: 'development',
  target: 'node',
  devtool: 'eval-source-map',
  externals: [nodeExternals()],
  entry: './tests/all_tests.ts',
  output: {
    filename: 'test.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['dist']
      }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  }
};