const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enhanced web compatibility configuration
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Enhanced alias configuration for web compatibility
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  'react-native': 'react-native-web',
};

// Enhanced extraNodeModules configuration
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-maps': path.resolve(__dirname, '__mocks__/react-native-maps.js'),
  'react-native-reanimated': path.resolve(__dirname, '__mocks__/react-native-reanimated.js'),
};

// Add custom resolver to intercept native module imports
config.resolver.resolverMainFields = ['browser', 'react-native', 'main'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

// Override the resolver to handle native modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle UIManager imports for web platform
  if (platform === 'web') {
    // Direct UIManager imports
    if (moduleName === 'react-native/Libraries/ReactNative/UIManager' || 
        moduleName === 'UIManager' ||
        moduleName.includes('UIManager')) {
      return {
        filePath: path.resolve(__dirname, '__mocks__/react-native-web-uimanager.js'),
        type: 'sourceFile'
      };
    }
    
    // react-native-reanimated imports
    if (moduleName === 'react-native-reanimated' || 
        moduleName.startsWith('react-native-reanimated/')) {
      return {
        filePath: path.resolve(__dirname, '__mocks__/react-native-reanimated.js'),
        type: 'sourceFile'
      };
    }
    
    // codegenNativeCommands imports
    if (moduleName === 'react-native/Libraries/Utilities/codegenNativeCommands' ||
        moduleName.includes('codegenNativeCommands')) {
      return {
        filePath: path.resolve(__dirname, '__mocks__/codegenNativeCommands.js'),
        type: 'sourceFile'
      };
    }
    
    // react-native-maps imports
    if (moduleName === 'react-native-maps' || 
        moduleName.startsWith('react-native-maps/')) {
      return {
        filePath: path.resolve(__dirname, '__mocks__/react-native-maps.js'),
        type: 'sourceFile'
      };
    }
  }
  
  // Fall back to default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;