import { useEffect, useState } from 'react';

import { getInstance } from '@cocokits/common-utils';

import { ThemeEvent } from '../data-access/theme-event/preview-theme-event';
import { ThemeChangeEvent } from '../model/event.model';
import { SelectedTheme } from '../model/theme.model';

export const useTheme = () => {
  const themeEvent = getInstance(ThemeEvent);
  const [theme, setTheme] = useState<ThemeChangeEvent>(themeEvent.currentTheme);

  const dispatchTheme = (selectedTheme: SelectedTheme) => {
    themeEvent.dispatchTheme(selectedTheme);
  };

  useEffect(() => {
    const subscription = themeEvent.themeChange$.subscribe((event) => {
      setTheme(event);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    ...theme,
    dispatchTheme,
  };
};
