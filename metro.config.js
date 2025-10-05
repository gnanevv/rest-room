const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enhanced web compatibility configuration
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Enhanced alias configuration for web compatibility
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  'react-native': 'react-native-web',
  'react-native-maps': path.resolve(__dirname, '__mocks__/react-native-maps.js'),
  'react-native-reanimated': path.resolve(__dirname, '__mocks__/react-native-reanimated.js'),
  'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, '__mocks__/codegenNativeCommands.js'),
  'react-native/Libraries/ReactNative/UIManager': path.resolve(__dirname, '__mocks__/react-native-web-uimanager.js')
};

// Enhanced extraNodeModules configuration
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-maps': path.resolve(__dirname, '__mocks__/react-native-maps.js'),
  'react-native-reanimated': path.resolve(__dirname, '__mocks__/react-native-reanimated.js'),
  'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, '__mocks__/codegenNativeCommands.js'),
  'react-native/Libraries/ReactNative/UIManager': path.resolve(__dirname, '__mocks__/react-native-web-uimanager.js')
};

// Add custom resolver to intercept native module imports
const originalResolver = config.resolver.resolverMainFields;
config.resolver.resolverMainFields = ['browser', 'react-native', 'main'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

// Override the resolver to handle native modules
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-reanimated') {
    return {
      filePath: path.resolve(__dirname, '__mocks__/react-native-reanimated.js'),
      type: 'sourceFile'
    };
  }
  
  if (platform === 'web' && moduleName === 'react-native/Libraries/Utilities/codegenNativeCommands') {
    return {
      filePath: path.resolve(__dirname, '__mocks__/codegenNativeCommands.js'),
      type: 'sourceFile'
    };
  }
  
  if (platform === 'web' && moduleName === 'react-native/Libraries/ReactNative/UIManager') {
    return {
      filePath: path.resolve(__dirname, '__mocks__/react-native-web-uimanager.js'),
      type: 'sourceFile'
    };
  }
  
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;