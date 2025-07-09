const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add custom resolver to handle native-only modules on web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Custom resolver to handle native-only imports on web
const originalResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle native-only modules when building for web
  if (platform === 'web') {
    // List of native-only modules to mock for web
    const nativeOnlyModules = [
      'react-native/Libraries/Utilities/codegenNativeCommands',
      'react-native/Libraries/Components/View/ViewNativeComponent',
      'react-native/Libraries/Utilities/codegenNativeComponent',
    ];

    if (nativeOnlyModules.some(module => moduleName.includes(module))) {
      return {
        filePath: require.resolve('./web-mock.js'),
        type: 'sourceFile',
      };
    }
  }

  // Fall back to the default resolver
  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;