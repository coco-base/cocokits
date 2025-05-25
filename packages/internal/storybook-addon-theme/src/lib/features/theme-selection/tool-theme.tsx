import React, { memo } from 'react';

import { THEMES } from '../../config/addon-theme.config';
import { SelectedTheme } from '../../model/theme.model';
import { useTheme } from '../../utils/use-manager-theme';

export const ToolTheme = memo(() => {
  const { dispatchTheme, displayName } = useTheme();

  const selectedTheme: SelectedTheme = {
    id: THEMES.cocokits.id,
    selectedModes: THEMES.cocokits.defaultSelectedModes,
  };

  return <button onClick={() => dispatchTheme(selectedTheme)}>{displayName}</button>;
});
