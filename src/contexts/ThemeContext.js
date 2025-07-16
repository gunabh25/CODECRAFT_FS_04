// contexts/ThemeContext.js - Theme context provider
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [primaryColor, setPrimaryColor] = useState('blue');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    const savedPrimaryColor = localStorage.getItem('primaryColor') || 'blue';

    setTheme(savedTheme);
    setFontSize(savedFontSize);
    setPrimaryColor(savedPrimaryColor);

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-font-size', savedFontSize);
    document.documentElement.setAttribute('data-primary-color', savedPrimaryColor);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    document.documentElement.setAttribute('data-font-size', size);
  };

  const changePrimaryColor = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
    document.documentElement.setAttribute('data-primary-color', color);
  };

  const value = {
    theme,
    fontSize,
    primaryColor,
    toggleTheme,
    changeFontSize,
    changePrimaryColor,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme styles object for JavaScript usage
export const themeStyles = {
  light: {
    background: 'bg-white',
    surface: 'bg-gray-50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-50'
  },
  dark: {
    background: 'bg-gray-900',
    surface: 'bg-gray-800',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    border: 'border-gray-700',
    hover: 'hover:bg-gray-700'
  }
};