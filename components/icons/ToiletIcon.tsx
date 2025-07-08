import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { ColorValue } from 'react-native';

interface ToiletIconProps {
  size?: number;
  color?: ColorValue;
}

export default function ToiletIcon({ size = 24, color = '#FFFFFF' }: ToiletIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Bowl */}
      <Path
        d="M7 3h10v5a5 5 0 0 1-5 5 5 5 0 0 1-5-5V3Z"
        stroke={color as string}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Seat */}
      <Path
        d="M9 13h6v5a3 3 0 0 1-6 0v-5Z"
        stroke={color as string}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Flush button */}
      <Circle cx={17} cy={5} r={1} fill={color as string} />
    </Svg>
  );
}
