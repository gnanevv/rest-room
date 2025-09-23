const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enhanced web compatibility configuration
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Enhanced alias configuration for web compatibility
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  'react-native-maps': path.resolve(__dirname, '__mocks__/react-native-maps.js'),
  'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, '__mocks__/codegenNativeCommands.js'),
};

// Enhanced extraNodeModules configuration
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-maps': path.resolve(__dirname, '__mocks__/react-native-maps.js'),
  'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, '__mocks__/codegenNativeCommands.js'),
};

// Enhanced resolver configuration for web
config.resolver.resolverMainFields = ['browser', 'react-native', 'main'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

module.exports = config;