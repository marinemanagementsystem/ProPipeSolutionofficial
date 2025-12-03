export const colors = {
  primary: '#0B63B4',
  primaryLight: '#3B8DED',
  primaryDark: '#084A8A',
  secondary: '#6FB1FC',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  
  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  
  border: '#E2E8F0',
  divider: '#F1F5F9',
  
  white: '#FFFFFF',
  black: '#000000',
};

// Dark mode colors
export const darkColors = {
  primary: '#3B8DED',
  primaryLight: '#6FB1FC',
  primaryDark: '#0B63B4',
  secondary: '#6FB1FC',
  
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  
  background: '#0f172a',
  surface: '#1e293b',
  surfaceVariant: '#334155',
  
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textLight: '#64748b',
  
  border: '#334155',
  divider: '#1e293b',
  
  white: '#FFFFFF',
  black: '#000000',
};

export const getThemeColors = (isDark: boolean) => isDark ? darkColors : colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
