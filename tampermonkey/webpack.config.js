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
// @version      1.1
// @description  Automatic writing assistant for Edgenuity
// @author       Revolt
// @match        https://student.edgenuity.com/
// @match        https://*.core.learn.edgenuity.com/player/
// @match        https://student.edgenuity.com/enrollment/*/coursemap*

// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @connect      *
// @run-at       document-start
// ==/UserScript==`,
      raw: true,
    }),
  ],
};
