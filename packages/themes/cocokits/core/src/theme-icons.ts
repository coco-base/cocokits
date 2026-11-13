import { checkIcon, chevronDownIcon, type Icon } from '@cocokits/icons';

/**
 * The icons the cocokits theme names in `components.<name>.icons`. Register them with the icon registry of the app,
 * or a part that names one draws nothing.
 *
 * @example
 * Pass it as the `icons` option of the app's icon registry:
 * ```ts
 * provideCckIcons({ icons: cocokitsThemeIcons });
 * ```
 */
export const cocokitsThemeIcons: { readonly 'chevron-down': Icon; readonly check: Icon } = {
  'chevron-down': chevronDownIcon,
  check: checkIcon,
};

/** The name of an icon of `cocokitsThemeIcons`. */
export type ThemeIconName = keyof typeof cocokitsThemeIcons;
