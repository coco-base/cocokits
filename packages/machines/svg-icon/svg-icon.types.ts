import type { Icon } from '@cocokits/icons';

/** Inputs of `getSvgIconProps`. */
export interface SvgIconProps {
  /** The registered name the icon was looked up by. Leave it out for an icon given as an `svg` string. */
  readonly iconName?: string | undefined;
  /** The icon to draw: the adapter resolves it from the registry or the parsed `svg`. Leave it out while there is none. */
  readonly icon?: Icon | undefined;
  /** Names the icon: the root becomes an image with this label. Leave it out or empty for a decorative icon. */
  readonly label?: string | undefined;
}

/** Props of the root part. Absent keys are not rendered. */
export interface SvgIconRootProps {
  /** The `cck-svg-icon` block class. */
  readonly class: string;
  /** The icon name; present only when `iconName` is set and not empty. */
  readonly 'data-icon'?: string;
  /** Present without a label: the icon is hidden from assistive technology. */
  readonly 'aria-hidden'?: 'true';
  /** Present with a label: `img`. */
  readonly role?: 'img';
  /** Present with a label. */
  readonly 'aria-label'?: string;
}

/** Props of the `<svg>` part, which the component always owns. */
export interface SvgIconSvgProps {
  /** The `cck-svg-icon__svg` class. */
  readonly class: string;
  /** The icon `viewBox`; absent while there is no icon. */
  readonly viewBox?: string;
  /** Always `'true'`: the label is on the root. */
  readonly 'aria-hidden': 'true';
  /** Always `'false'`: an icon is no tab stop in old browsers. */
  readonly focusable: 'false';
}

/** What an adapter renders: the root, the `<svg>` and the markup inside it. */
export interface SvgIconRenderProps {
  /** Props of the root. */
  readonly root: SvgIconRootProps;
  /** Props of the `<svg>`. */
  readonly svg: SvgIconSvgProps;
  /** The markup inside the `<svg>` (`icon.body`); an empty string while there is no icon. Trusted content only. */
  readonly body: string;
}
