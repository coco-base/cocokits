import { provideCckIcons, provideCckTheme } from '@cocokits/angular-core';
import { cocokitsThemeConfig, cocokitsThemeIcons } from '@cocokits/theme-cocokits';

/** The providers of an app that has the cocokits theme and registers the icons the theme names. */
export const providers = [provideCckTheme(cocokitsThemeConfig), provideCckIcons({ icons: cocokitsThemeIcons })];

/** The markup without the `ngh` hydration attributes. */
export const strip = (markup: string): string => markup.replace(/ ngh="\d+"/g, '');
