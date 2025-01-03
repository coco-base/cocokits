import { useEffect, useState } from 'react';

import { getInstance } from '@cocokits/common-utils';

import { ColorModeEvent } from '../data-access/colo-mode-event/preview-color-mode-event';
import { ColorModeChangeEvent } from '../model/event.model';
import { ColorMode } from '../model/theme.model';

export const useColorMode = () => {
  const colorModeEvent = getInstance(ColorModeEvent);
  const [colorMode, setColorMode] = useState<ColorModeChangeEvent>(colorModeEvent.getCurrentColorMode());

  const dispatchColorMode = (newColorMode: ColorMode) => {
    colorModeEvent.dispatchColorMode(newColorMode);
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
