export const Colors = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  secondary: '#3B82F6',
  accent: '#F8BBD9',
  background: '#FFFFFF',
  backgroundDark: '#1A1A1A',
  surface: '#F8F9FA',
  surfaceDark: '#2D2D2D',
  text: '#1A1A1A',
  textDark: '#FFFFFF',
  textSecondary: '#6B7280',
  textSecondaryDark: '#9CA3AF',
  border: '#E5E7EB',
  borderDark: '#374151',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Status colors for bids
  pending: '#F59E0B',
  accepted: '#10B981',
  rejected: '#EF4444',
  
  // Gradient colors
  gradientStart: '#2563EB',
  gradientEnd: '#3B82F6',
  
  // Additional semantic colors
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
  orange: '#F97316',
  lime: '#84CC16',
  cyan: '#06B6D4',
  emerald: '#059669',
  rose: '#F43F5E',
  amber: '#F59E0B',
  violet: '#7C3AED',
  sky: '#0EA5E9',
};

export const lightTheme = {
  ...Colors,
  background: Colors.background,
  surface: Colors.surface,
  text: Colors.text,
  textSecondary: Colors.textSecondary,
  border: Colors.border,
};

export const darkTheme = {
  ...Colors,
  background: Colors.backgroundDark,
  surface: Colors.surfaceDark,
  text: Colors.textDark,
  textSecondary: Colors.textSecondaryDark,
  border: Colors.borderDark,
};