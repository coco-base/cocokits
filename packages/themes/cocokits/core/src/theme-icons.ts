import { checkIcon, chevronDownIcon, circleXmarkIcon, type Icon } from '@cocokits/icons';

/**
 * The icons the cocokits theme names in `components.<name>.icons`. The chevron and the check are base icons and
 * always registered; the `circle-xmark` of the Chip remove button is not, so an app registers this object. An app
 * that names another icon in `components.<name>.icons` must register it too, or the part draws its default and
 * development logs an error.
 *
 * @example
 * Pass it as the `icons` option of the app's icon registry:
 * ```ts
 * provideCckIcons({ icons: cocokitsThemeIcons });
 * ```
 */
export const cocokitsThemeIcons: {
  readonly 'chevron-down': Icon;
  readonly check: Icon;
  readonly 'circle-xmark': Icon;
} = {
  'chevron-down': chevronDownIcon,
  check: checkIcon,
  'circle-xmark': circleXmarkIcon,
};

/** The name of an icon of `cocokitsThemeIcons`. */
export type ThemeIconName = keyof typeof cocokitsThemeIcons;
