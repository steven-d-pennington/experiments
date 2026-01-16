import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
  };
  isDark: boolean;
}

const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  colors: {
    primary: '#1E1E2E',
    secondary: '#CBA6F7',
    accent: '#F5C2E7',
    background: '#11111B',
    surface: '#313244',
    text: '#CDD6F4',
    textSecondary: '#A6ADC8',
    error: '#F38BA8',
  },
  isDark: true,
};

const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  colors: {
    primary: '#2D3748', // deep blue-gray
    secondary: '#2563EB', // blue accent
    accent: '#0EA5E9', // cyan accent
    background: '#FFFFFF', // pure white
    surface: '#F1F5F9', // very light gray
    text: '#1A202C', // almost black
    textSecondary: '#64748B', // blue-gray
    error: '#DC2626',
  },
  isDark: false,
};

const THEME_STORAGE_KEY = 'theme-id';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

const themes = [darkTheme, lightTheme];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<string>('dark'); // Always default to dark for SSR

  useEffect(() => {
    // Only run on client
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      setThemeId(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeId('dark');
    } else {
      setThemeId('light');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, [themeId]);

  const currentTheme = useMemo(() => themes.find((t) => t.id === themeId) || darkTheme, [themeId]);

  const setTheme = (id: string) => setThemeId(id);
  const isDarkMode = currentTheme.isDark;
  const toggleDarkMode = () => setThemeId(isDarkMode ? 'light' : 'dark');

  return (
    <ThemeContext.Provider
      value={{ currentTheme, setTheme, availableThemes: themes, isDarkMode, toggleDarkMode }}
    >
      <StyledThemeProvider theme={currentTheme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
