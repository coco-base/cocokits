import { checkIcon, chevronDownIcon, type Icon } from '@cocokits/icons';

/**
 * The icons the cocokits theme names in `components.<name>.icons`. Both are base icons, so they are always
 * registered. An app that names another icon in `components.<name>.icons` must register it, or the part draws its
 * default and development logs an error.
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
