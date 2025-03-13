const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './src/index.tsx',
  },
  output: {
    publicPath: '/',
    path: path.join(__dirname, '../dist'),
    filename: '[name].[chunkhash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: [
      path.resolve(__dirname, '../src'),
      'node_modules',
    ],
    alias: {
      "@core": path.resolve(__dirname, "../src/core"),
      "@/jsx-runtime": path.resolve(__dirname, "../src/jsx-runtime.ts")
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    })
  ],
  devServer: {
    historyApiFallback: true,
    host: 'localhost',
    port: 3000,
    open: true,
  },
};