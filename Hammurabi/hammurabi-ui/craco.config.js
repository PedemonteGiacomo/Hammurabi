// craco.config.js
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: require.resolve('path-browserify'),
      };

      webpackConfig.plugins = webpackConfig.plugins.filter(
        (p) => p.constructor.name !== 'ModuleScopePlugin'
      );
      if (webpackConfig.resolve && Array.isArray(webpackConfig.resolve.plugins)) {
        webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
          (p) => p.constructor && p.constructor.name !== 'ModuleScopePlugin'
        );
      }
      webpackConfig.plugins.push(new NodePolyfillPlugin());

      return webpackConfig;
    },
  },
};
  