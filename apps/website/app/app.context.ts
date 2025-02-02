'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ColorMode = 'dark' | 'light';
type ThemeName = 'cocokits' | 'frames-x';

const frameXBaseClassNames = [
  'frames-x__local-style--default',
  'frames-x__sizing--compact',
  'frames-x__theme--theme-a',
  'frames-x__radius--default',
  'frames-x__typography--font-a',
];

const cocokitsBaseClassNames = [
  'cocokits__local-style--default',
  'cocokits__global--default',
  'cocokits__components--default',
];

const THEME_SELECTORS: Record<ThemeName, Record<ColorMode, string>> = {
  'frames-x': {
    light: [...frameXBaseClassNames, 'frames-x__color-mode--light'].join(' '),
    dark: [...frameXBaseClassNames, 'frames-x__color-mode--dark'].join(' '),
  },
  cocokits: {
    light: [...cocokitsBaseClassNames, 'cocokits__brand-color-1--light'].join(' '),
    dark: [...cocokitsBaseClassNames, 'cocokits__brand-color-1--dark'].join(' '),
  },
};

interface WebsiteContextProps {
  colorMode: ColorMode;
  selectedTheme: ThemeName;
  setColorMode: (mode: ColorMode) => void;
  setSelectedTheme: (theme: ThemeName) => void;
}

export const WebsiteContext = createContext<WebsiteContextProps | null>(null);

export function useWebsiteContext() {
  return useContext(WebsiteContext);
}

export const useWebsiteContextCreation = (): WebsiteContextProps | null => {
  const [colorMode, setColorMode] = useState<ColorMode | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('frames-x');

  useEffect(() => {
    setColorMode((localStorage.getItem('colorMode') as ColorMode) || 'dark');
  }, []);

  useEffect(() => {
    if (!colorMode) {
      return;
    }
    document.documentElement.classList.add(colorMode);
    return () => {
      document.documentElement.classList.remove(colorMode);
    };
  }, [colorMode]);

  useEffect(() => {
    if (!colorMode) {
      return;
    }

    document.documentElement.setAttribute('data-cck-theme-name', selectedTheme);
    document.documentElement.setAttribute('data-cck-theme', THEME_SELECTORS[selectedTheme][colorMode]);

    return () => {
      document.documentElement.removeAttribute('data-cck-theme-name');
      document.documentElement.removeAttribute('data-cck-theme');
    };
  }, [selectedTheme, colorMode]);

  const _setColorMode = (mode: ColorMode) => {
    setColorMode(mode);
    localStorage.setItem('colorMode', mode);
  };

  if (!colorMode) {
    return null;
  }

  return {
    colorMode,
    setColorMode: _setColorMode,
    selectedTheme,
    setSelectedTheme,
  };
};
