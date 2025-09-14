const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add web compatibility for react-native-maps
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Alias problematic native modules for web
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  'react-native-maps': path.resolve(__dirname, '__mocks__/react-native-maps.js'),
  'react-native/Libraries/Utilities/codegenNativeCommands': 'react-native-web/dist/cjs/modules/UnimplementedView',
};

// Add extraNodeModules to ensure mock is used
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-maps': path.resolve(__dirname, '__mocks__/react-native-maps.js'),
};

// Handle native-only modules for web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;