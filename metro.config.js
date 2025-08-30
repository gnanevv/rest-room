const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web compatibility for react-native-maps
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Alias problematic native modules for web
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  'react-native-maps': require.resolve('react-native-maps/lib/index.js'),
};

// Handle native-only modules for web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;