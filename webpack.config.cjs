const path = require("path");

module.exports = {
  entry: {
    decode: "./src/decode.ts",
    decrypt: "./src/decrypt.ts",
  },
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
    fallback: { crypto: false },
  },
  output: {
    filename: "[name].js",
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
