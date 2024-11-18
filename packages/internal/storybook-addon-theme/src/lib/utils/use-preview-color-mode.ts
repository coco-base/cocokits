import { getInstance } from '@cocokits/common-utils';
import { ColorModeEvent } from '../data-access/colo-mode-event/preview-color-mode-event';
import { useEffect } from 'react';
import { useState } from 'react';
import { ColorMode } from '../model/theme.model';
import { ColorModeChangeEvent } from '../model/event.model';

export const useColorMode = () => {
  const colorModeEvent = getInstance(ColorModeEvent);
  const [colorMode, setColorMode] = useState<ColorModeChangeEvent>(colorModeEvent.getCurrentColorMode());

  const dispatchColorMode = (colorMode: ColorMode) => {
    colorModeEvent.dispatchColorMode(colorMode);
  };

  useEffect(() => {
    const subscription = colorModeEvent.colorModeChange$.subscribe((event) => {
      setColorMode(event);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    ...colorMode,
    dispatchColorMode,
  };
};
