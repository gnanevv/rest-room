// Web-compatible UIManager mock
const UIManager = {
  // View manager methods
  hasViewManagerConfig: () => false,
  getViewManagerConfig: () => ({}),
  getConstants: () => ({}),
  
  // Measurement methods
  measure: () => {},
  measureInWindow: () => {},
  measureLayout: () => {},
  measureLayoutRelativeToParent: () => {},
  
  // Focus methods
  focus: () => {},
  blur: () => {},
  
  // Animation methods
  setJSResponder: () => {},
  clearJSResponder: () => {},
  
  // Layout methods
  updateView: () => {},
  manageChildren: () => {},
  
  // Constants
  getConstantsForViewManager: () => ({}),
  
  // Accessibility
  sendAccessibilityEvent: () => {},
  announceForAccessibility: () => {},
  
  // Platform-specific methods (no-ops for web)
  dispatchViewManagerCommand: () => {},
  showPopupMenu: () => {},
  dismissPopupMenu: () => {},
  
  // Additional methods that might be called
  createView: () => {},
  removeSubviewsFromContainerWithID: () => {},
  replaceExistingNonRootView: () => {},
  setChildren: () => {},
  
  // React Native Web compatibility
  __getViewConfig: () => ({}),
  __hasViewConfig: () => false,
};

// Export in multiple formats for maximum compatibility
module.exports = UIManager;
module.exports.default = UIManager;
module.exports.UIManager = UIManager;

// Also export as ES module for modern bundlers
if (typeof exports === 'object' && typeof module !== 'undefined') {
  module.exports = UIManager;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return UIManager; });
} else {
  (typeof globalThis !== 'undefined' ? globalThis : 
   typeof window !== 'undefined' ? window : 
   typeof global !== 'undefined' ? global : 
   typeof self !== 'undefined' ? self : this).UIManager = UIManager;
}