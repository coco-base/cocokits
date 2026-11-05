import { provideCckTheme } from '@cocokits/angular-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';

/** The providers of an app that has the cocokits theme. */
export const providers = [provideCckTheme(cocokitsThemeConfig)];
