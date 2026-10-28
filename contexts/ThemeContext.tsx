import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'vocalink-theme';

export type ThemeColors = {
  bg:           string;
  surface:      string;
  border:       string;
  borderSubtle: string;
  text:         string;
  text2:        string;
  text3:        string;
  tealLight:    string;
  purpleLight:  string;
  input:        string;
};

export const LIGHT: ThemeColors = {
  bg:           '#F4F2FF',
  surface:      '#FFFFFF',
  border:       '#E2E8F0',
  borderSubtle: '#F1F5F9',
  text:         '#0F172A',
  text2:        '#475569',
  text3:        '#94A3B8',
  tealLight:    '#E0F5FC',
  purpleLight:  '#EEEDFE',
  input:        '#F1F5F9',
};

export const DARK: ThemeColors = {
  bg:           '#0F172A',
  surface:      '#1E293B',
  border:       '#334155',
  borderSubtle: '#1E293B',
  text:         '#E2E8F0',
  text2:        '#94A3B8',
  text3:        '#64748B',
  tealLight:    'rgba(26,173,220,0.14)',
  purpleLight:  'rgba(83,74,183,0.16)',
  input:        '#0F172A',
};

type ThemeContextType = {
  isDark:      boolean;
  toggleTheme: () => void;
  colors:      ThemeColors;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark:      false,
  toggleTheme: () => {},
  colors:      LIGHT,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme              = useColorScheme();
  const [isDark, setIsDark]       = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      setIsDark(saved !== null ? saved === 'dark' : systemScheme === 'dark');
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  };

  const resolvedDark = isDark ?? (systemScheme === 'dark');
  const colors       = resolvedDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ isDark: resolvedDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
