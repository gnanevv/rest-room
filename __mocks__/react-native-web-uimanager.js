// Mock UIManager for web compatibility
const UIManager = {
  hasViewManagerConfig: (name) => {
    // Return false for all view manager configs on web
    // This prevents native-only components from trying to render
    return false;
  },
  getViewManagerConfig: (name) => {
    return null;
  },
  dispatchViewManagerCommand: () => {
    // No-op for web
  },
  measure: () => {
    // No-op for web
  },
  measureInWindow: () => {
    // No-op for web
  },
  measureLayout: () => {
    // No-op for web
  },
  measureLayoutRelativeToParent: () => {
    // No-op for web
  },
  setJSResponder: () => {
    // No-op for web
  },
  clearJSResponder: () => {
    // No-op for web
  },
  configureNextLayoutAnimation: () => {
    // No-op for web
  },
  removeSubviewsFromContainerWithID: () => {
    // No-op for web
  },
  replaceExistingNonRootView: () => {
    // No-op for web
  },
  setChildren: () => {
    // No-op for web
  },
  manageChildren: () => {
    // No-op for web
  },
  blur: () => {
    // No-op for web
  },
  focus: () => {
    // No-op for web
  },
  showPopupMenu: () => {
    // No-op for web
  },
  dismissPopupMenu: () => {
    // No-op for web
  },
};

module.exports = UIManager;