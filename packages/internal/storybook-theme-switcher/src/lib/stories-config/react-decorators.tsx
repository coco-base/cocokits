import { ThemeConfigContext } from "@cocokits/react-core";

import { getSelectedCckTheme } from "../components/theme-switcher.utils";


export function withThemeConfig(Story: any) {
  return (
    <ThemeConfigContext.Provider value={getSelectedCckTheme()?.themeConfig}>
      <Story />
    </ThemeConfigContext.Provider>
  );
}