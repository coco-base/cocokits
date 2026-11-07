import { provideCckTheme } from '@cocokits/angular-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';

/** The providers of an app that has the cocokits theme. */
export const providers = [provideCckTheme(cocokitsThemeConfig)];

/** The markup without the `ngh` hydration attributes. */
export const strip = (markup: string): string => markup.replace(/ ngh="\d+"/g, '');
