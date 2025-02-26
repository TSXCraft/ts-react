const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    publicPath: "/",
    path: path.join(__dirname, "../dist"),
    filename: "[name].[chunkhash].js",
    clean: true,
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    modules: [path.resolve(__dirname, "../src"), "node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|webp)$/,
        type: "asset",
        generator: {
          filename: "assets/[name][hash][ext]",
        },
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
    hot: true,
    open: true,
  },
  performance: {
    hints: false,
  },
};
