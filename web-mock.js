// Mock file for native-only modules when building for web
// This prevents Metro from trying to resolve native modules on web platform

module.exports = {};

// Export common native module patterns
module.exports.default = {};
module.exports.codegenNativeCommands = () => ({});
module.exports.codegenNativeComponent = () => ({});