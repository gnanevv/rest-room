// Mock for react-native/Libraries/Utilities/codegenNativeCommands
// This prevents native-only module imports on web

const UnimplementedView = () => {
  console.warn('UnimplementedView: This component is not implemented on web');
  return null;
};

module.exports = UnimplementedView;
module.exports.default = UnimplementedView;