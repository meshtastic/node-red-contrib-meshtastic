const path = require("path");

module.exports = {
  entry: "./src/decode.ts",
  target: "web",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "decode.js",
    path: path.resolve(__dirname, "dist/esm"),
    library: {
      type: "module",
    },
  },
  experiments: {
    outputModule: true,
  },
  optimization: {
    minimize: false, // enabling this reduces file size and readability
  },
};
