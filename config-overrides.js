const path = require('path');

module.exports = function override(config, env) {
  // Add fallback configuration for 'crypto'
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    path: require.resolve('path-browserify'),
    domain: require.resolve('domain-browser'),
    buffer: require.resolve('buffer/'),

  };

  return config;
};
