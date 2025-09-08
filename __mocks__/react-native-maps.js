import React from 'react';
import { View, Text } from 'react-native';

// Mock MapView component for web
export const MapView = React.forwardRef((props, ref) => {
  return (
    <View
      ref={ref}
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