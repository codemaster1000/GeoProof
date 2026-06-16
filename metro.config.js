const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for Drizzle SQL migration files
config.resolver.assetExts.push('sql');

module.exports = config;
