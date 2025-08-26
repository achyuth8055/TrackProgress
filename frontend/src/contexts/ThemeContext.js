import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const THEMES = {
  GRADIENT: 'gradient',
  DARK: 'dark'
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return saved || THEMES.GRADIENT;
  });

  useEffect(() => {
    localStorage.setItem('app-theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Update CSS custom properties based on theme
    const root = document.documentElement;
    
    if (currentTheme === THEMES.GRADIENT) {
      root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
      root.style.setProperty('--secondary-gradient', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)');
      root.style.setProperty('--success-gradient', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)');
      root.style.setProperty('--warning-gradient', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)');
      root.style.setProperty('--bg-primary', 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)');
      root.style.setProperty('--bg-secondary', '#ffffff');
      root.style.setProperty('--text-primary', '#2d3748');
      root.style.setProperty('--text-secondary', '#718096');
      root.style.setProperty('--border-color', '#e2e8f0');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
    } else {
      root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
      root.style.setProperty('--secondary-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
      root.style.setProperty('--success-gradient', 'linear-gradient(135deg, #48bb78 0%, #38b2ac 100%)');
      root.style.setProperty('--warning-gradient', 'linear-gradient(135deg, #ed8936 0%, #f56500 100%)');
      root.style.setProperty('--bg-primary', '#1a202c');
      root.style.setProperty('--bg-secondary', '#2d3748');
      root.style.setProperty('--text-primary', '#f7fafc');
      root.style.setProperty('--text-secondary', '#a0aec0');
      root.style.setProperty('--border-color', '#4a5568');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
    }
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme(prev => 
      prev === THEMES.GRADIENT ? THEMES.DARK : THEMES.GRADIENT
    );
  };

  const value = {
    currentTheme,
    setTheme: setCurrentTheme,
    toggleTheme,
    isGradientTheme: currentTheme === THEMES.GRADIENT,
    isDarkTheme: currentTheme === THEMES.DARK,
    themes: THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};