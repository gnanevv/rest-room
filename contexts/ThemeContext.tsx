import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ColorScheme;
}

interface ColorScheme {
  primary: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  accent: string;
  overlay: string;
  shadow: string;
  gradientStart: string;
  gradientEnd: string;
}

const lightColors: ColorScheme = {
  primary: '#3B82F6',
  primaryDark: '#1E40AF',
  secondary: '#8B5CF6',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceVariant: '#F1F5F9',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  accent: '#EC4899',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  gradientStart: '#3B82F6',
  gradientEnd: '#1E40AF',
};

const darkColors: ColorScheme = {
  primary: '#60A5FA',
  primaryDark: '#3B82F6',
  secondary: '#A78BFA',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceVariant: '#334155',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  border: '#475569',
  borderLight: '#334155',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  accent: '#F472B6',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  gradientStart: '#1E293B',
  gradientEnd: '#0F172A',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(newTheme));
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}