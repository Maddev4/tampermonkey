const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "bundle.user.js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "source-map",
  plugins: [
    new webpack.BannerPlugin({
      banner: `// ==UserScript==
// @name         Automatic Writing
// @namespace    Revolt
// @version      1.0
// @description  Automatic writing assistant
// @author       Revolt
// @match        https://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      localhost
// ==/UserScript==`,
      raw: true,
    }),
  ],
};
