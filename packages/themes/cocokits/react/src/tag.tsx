'use client';

import type { ReactElement } from 'react';
import { Tag as BaseTag, type TagProps as BaseTagProps } from '@cocokits/react/tag';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TagOptions = CocokitsThemeConfig['components']['tag'];

/** The `variant` values of the cocokits theme. */
export type TagVariant = TagOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type TagColor = TagOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type TagSize = TagOptions['size']['values'][number];
/** The `dot` values of the cocokits theme. */
export type TagDot = TagOptions['dot']['values'][number];

/** Props of the themed {@link Tag}: the base props plus the four cocokits options. */
export interface TagProps extends BaseTagProps {
  /**
   * Look of the label: a tinted fill, a full fill or a border.
   */
  readonly variant?: TagVariant | null | undefined;
  /**
   * Color family, rendered as `data-cck-color`.
   */
  readonly color?: TagColor | null | undefined;
  /**
   * Height, padding, text and icon size.
   */
  readonly size?: TagSize | null | undefined;
  /**
   * Shows a small dot in the text color before the content. The dot is decorative: say the meaning in the text.
   */
  readonly dot?: TagDot | null | undefined;
}

function ThemedTag({ variant, color, size, dot, ...props }: TagProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="tag" options={{ variant, color, size, dot }}>
      <BaseTag {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Tag} component and its `displayName`. */
interface TagComponent {
  (props: TagProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Tag. By default it renders a `<span>` of static text, and supplies `variant`, `color`, `size` and
 * `dot` to the base Tag, which renders the `data-*` attributes. Each option resolves in order: the prop, then the
 * `ThemeProvider` override, then the config default; `null` removes the attribute. The theme needs a
 * `ThemeProvider`.
 *
 * The Tag has no hover, focus or pressed look: it is a label, not a control.
 *
 * @example
 * <Tag variant="solid" color="success" size="sm" dot>Paid</Tag>
 * @cckPart root
 */
export const Tag: TagComponent = Object.assign(ThemedTag, { displayName: 'Tag' });
