import React from 'react';
import { View, Text } from 'react-native';

// Mock MapView component for web
export const MapView = React.forwardRef((props, ref) => {
  // Add camera methods to the ref
  React.useImperativeHandle(ref, () => ({
    getCamera: () => Promise.resolve({
      center: { latitude: 0, longitude: 0 },
      pitch: 0,
      heading: 0,
      zoom: 10,
      altitude: 1000
    }),
    animateCamera: (camera, duration) => Promise.resolve(),
    setCamera: (camera) => Promise.resolve(),
    animateToRegion: (region, duration) => Promise.resolve(),
    fitToElements: (animated) => Promise.resolve(),
    fitToSuppliedMarkers: (markers, animated) => Promise.resolve(),
    fitToCoordinates: (coordinates, options) => Promise.resolve()
  }), []);

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: '#f0f0f0',
          justifyContent: 'center',
          alignItems: 'center',
        },
        props.style,
      ]}
    >
      <Text style={{ color: '#666', fontSize: 16 }}>
        Map View (Web Mock)
      </Text>
    </View>
  );
});

// Mock Marker component for web
export const Marker = ({ children, ...props }) => {
  return (
    <View
      style={{
        position: 'absolute',
        width: 20,
        height: 20,
        backgroundColor: '#ff0000',
        borderRadius: 10,
      }}
    >
      {children}
    </View>
  );
};

// Mock PROVIDER_GOOGLE constant
export const PROVIDER_GOOGLE = 'google';

// Default export
export default MapView;