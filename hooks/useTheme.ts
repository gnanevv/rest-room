import { useState, useEffect, createContext, useContext } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: '#FAFBFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  secondary: '#8B5CF6',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#64748B',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  mapBackground: '#FAFBFC',
  mapStreets: '#CBD5E1',
  mapStreetsSecondary: '#E2E8F0',
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  statusBarStyle: 'dark-content' as 'dark-content' | 'light-content',
};

const darkColors = {
  background: '#0A0A0B',
  surface: '#1A1A1D',
  surfaceSecondary: '#2A2A2F',
  primary: '#8B5CF6',
  primaryDark: '#7C3AED',
  secondary: '#06B6D4',
  text: '#FFFFFF',
  textSecondary: '#E2E8F0',
  textTertiary: '#94A3B8',
  border: '#2A2A2F',
  borderLight: '#3A3A3F',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  mapBackground: '#0A0A0B',
  mapStreets: '#2A2A2F',
  mapStreetsSecondary: '#1A1A1D',
  cardBackground: '#1A1A1D',
  cardShadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.8)',
  statusBarStyle: 'light-content' as 'dark-content' | 'light-content',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeProvider() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });

    // Set initial theme
    const currentScheme = Appearance.getColorScheme();
    setTheme(currentScheme === 'dark' ? 'dark' : 'light');

    return () => subscription?.remove();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return {
    theme,
    toggleTheme,
    colors,
  };
}

export { ThemeContext };