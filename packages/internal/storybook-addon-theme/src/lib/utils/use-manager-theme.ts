import { getInstance } from '@cocokits/common-utils';
import { useEffect } from 'react';
import { useState } from 'react';
import { SelectedTheme } from '../model/theme.model';
import { ThemeEvent } from '../data-access/theme-event/manager-theme-event';
import { ThemeChangeEvent } from '../model/event.model';

export const useTheme = () => {
  const themeEvent = getInstance(ThemeEvent);
  const [theme, setTheme] = useState<ThemeChangeEvent>(themeEvent.getCurrentTheme());

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
