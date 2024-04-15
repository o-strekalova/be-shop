const path = require("path");
const nodeExternals = require("webpack-node-externals");
const slsw = require("serverless-webpack");

const isLocal = slsw.lib.webpack.isLocal;

module.exports = {
  mode: isLocal ? "development" : "production",
  entry: slsw.lib.entries,
  externals: [nodeExternals()],
  devtool: "source-map",
  resolve: {
    extensions: [".js", ".json"],
  },
  output: {
    libraryTarget: "commonjs2",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  target: "node",
  cache: {
    type: "filesystem",
    allowCollectingMemory: true,
    cacheDirectory: path.resolve(".webpackCache"),
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
};
