// craco.config.js
module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        webpackConfig.resolve.fallback = {
          ...webpackConfig.resolve.fallback,
          fs: false, // disable 'fs' polyfill
          path: require.resolve('path-browserify'),
        };
        return webpackConfig;
      },
    },
  };
  