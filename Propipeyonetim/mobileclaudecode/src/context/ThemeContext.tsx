import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const lightColors = {
  // Backgrounds
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceVariant: '#f1f5f9',
  card: '#ffffff',

  // Text
  text: '#0f172a',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',

  // Primary (Cyan/Teal)
  primary: '#06b6d4',
  primaryLight: '#22d3ee',
  primaryDark: '#0891b2',

  // Success (Green)
  success: '#10b981',
  successLight: '#34d399',

  // Warning (Amber)
  warning: '#f59e0b',
  warningLight: '#fbbf24',

  // Error (Red)
  error: '#ef4444',
  errorLight: '#f87171',

  // Info (Purple)
  info: '#8b5cf6',
  infoLight: '#a78bfa',

  // Borders
  border: '#e2e8f0',
  borderLight: '#f1f5f9',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',

  // Tab bar
  tabBar: '#ffffff',
  tabBarBorder: '#e2e8f0',
  tabActive: '#06b6d4',
  tabInactive: '#94a3b8',
};

const darkColors = {
  // Backgrounds
  background: '#0c1226',
  surface: '#1e293b',
  surfaceVariant: '#0f172a',
  card: '#1e293b',

  // Text
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',

  // Primary (Cyan/Teal)
  primary: '#22d3ee',
  primaryLight: '#67e8f9',
  primaryDark: '#06b6d4',

  // Success (Green)
  success: '#10b981',
  successLight: '#34d399',

  // Warning (Amber)
  warning: '#fbbf24',
  warningLight: '#fcd34d',

  // Error (Red)
  error: '#f87171',
  errorLight: '#fca5a5',

  // Info (Purple)
  info: '#a78bfa',
  infoLight: '#c4b5fd',

  // Borders
  border: '#334155',
  borderLight: '#1e293b',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',

  // Tab bar
  tabBar: '#0f172a',
  tabBarBorder: '#1e293b',
  tabActive: '#22d3ee',
  tabInactive: '#64748b',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    // AsyncStorage'dan kaydedilmiş temayı yükle
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setMode(savedTheme);
        } else if (systemColorScheme) {
          setMode(systemColorScheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    try {
      await AsyncStorage.setItem('theme', newMode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = mode === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
