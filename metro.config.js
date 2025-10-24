const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for JSON imports
config.resolver.sourceExts.push('json');

module.exports = config;



