const path = require("path")
const GasPlugin = require("gas-webpack-plugin")

module.exports = {
  mode: "development",
  devtool: false,
  context: __dirname,
  entry: "./src/main.js",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "index.js",
  },
  resolve: {
    extensions: [".js"],
  },
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      }
    ],
  },
  plugins: [new GasPlugin()],
};
