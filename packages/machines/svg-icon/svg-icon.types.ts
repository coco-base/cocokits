import type { SvgIconSet } from '@cocokits/shared';

/** Inputs of `getSvgIconProps`. */
export interface SvgIconProps {
  /** The name of the icon in `icons`. */
  readonly iconName: string;
  /** The icons of the provided theme (the adapter passes the `icons` of its theme icons export). */
  readonly icons: SvgIconSet;
  /** Names the icon: the root becomes an image with this label. Leave it out or empty for a decorative icon. */
  readonly label?: string | undefined;
}

/** Props of the root part. Absent keys are not rendered. */
export interface SvgIconRootProps {
  /** The `cck-svg-icon` block class. */
  readonly class: string;
  /** The icon name, always set. */
  readonly 'data-icon-name': string;
  /** Present without a label: the icon is hidden from assistive technology. */
  readonly 'aria-hidden'?: 'true';
  /** Present with a label: `img`. */
  readonly role?: 'img';
  /** Present with a label. */
  readonly 'aria-label'?: string;
}

/** Props of the `<svg>` part. */
export interface SvgIconSvgProps {
  /** The `cck-svg-icon__svg` class. */
  readonly class: string;
  /** The icon `viewBox`; absent when the icon is not found. */
  readonly viewBox?: string;
}

/** The attributes of one `<path>`. These are the only attributes icon data can set. */
export interface SvgIconPathProps {
  /** The path data. Bind it as an attribute value only. */
  readonly d: string;
  /** Present when the icon path has a `fillRule`. */
  readonly 'fill-rule'?: 'nonzero' | 'evenodd';
  /** Present when the icon path has a `clipRule`. */
  readonly 'clip-rule'?: 'nonzero' | 'evenodd';
}

/** What an adapter renders: the root, the `<svg>` and one `<path>` per entry of `paths`. */
export interface SvgIconRenderProps {
  /** Props of the root. */
  readonly root: SvgIconRootProps;
  /** Props of the `<svg>`. */
  readonly svg: SvgIconSvgProps;
  /** The paths; empty when the icon is not found. */
  readonly paths: readonly SvgIconPathProps[];
}
