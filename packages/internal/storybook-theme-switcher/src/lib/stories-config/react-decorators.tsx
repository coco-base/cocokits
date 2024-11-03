import { UiComponentConfig } from '@cocokits/react-core';

import { getSelectedCckTheme } from "../components/theme-switcher.utils";

export function withUiComponentConfig(Story: any) {
  return (
    <UiComponentConfig.Provider value={getSelectedCckTheme()?.uiComponentConfig}>
      <Story />
    </UiComponentConfig.Provider>
  );
}