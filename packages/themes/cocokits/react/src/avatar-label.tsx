'use client';

import type { ReactElement } from 'react';
import {
  AvatarLabel as BaseAvatarLabel,
  type AvatarLabelProps as BaseAvatarLabelProps,
} from '@cocokits/react/avatar-label';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type AvatarLabelOptions = CocokitsThemeConfig['components']['avatar-label'];

/** The `size` values of the cocokits theme. */
export type AvatarLabelSize = AvatarLabelOptions['size']['values'][number];
/** The `avatarPosition` values of the cocokits theme. */
export type AvatarLabelAvatarPosition = AvatarLabelOptions['avatarPosition']['values'][number];
/** The `textLayout` values of the cocokits theme. */
export type AvatarLabelTextLayout = AvatarLabelOptions['textLayout']['values'][number];

/** Props of the themed {@link AvatarLabel}: the base props plus the three cocokits options. */
export interface AvatarLabelProps extends BaseAvatarLabelProps {
  /**
   * Gap, text size and the size of its direct avatar; it wins over its own size.
   */
  readonly size?: AvatarLabelSize | null | undefined;
  /**
   * Which side of the text the avatar sits on, in the writing direction.
   */
  readonly avatarPosition?: AvatarLabelAvatarPosition | null | undefined;
  /**
   * Name and description on two lines or side by side.
   */
  readonly textLayout?: AvatarLabelTextLayout | null | undefined;
}

function ThemedAvatarLabel({ size, avatarPosition, textLayout, ...props }: AvatarLabelProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="avatar-label" options={{ size, avatarPosition, textLayout }}>
      <BaseAvatarLabel {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link AvatarLabel} component and its `displayName`. */
interface AvatarLabelComponent {
  (props: AvatarLabelProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Avatar label. It renders the base `<div>` and supplies `size`, `avatarPosition` and `textLayout` to
 * it, which renders the `data-*` attributes. Each option resolves in order: the prop, then the `ThemeProvider`
 * override, then the config default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <AvatarLabel name="Ada Lovelace" description="Mathematician" size="lg" avatarPosition="end">
 *   <Avatar.Root aria-hidden="true"><Avatar.Fallback>AL</Avatar.Fallback></Avatar.Root>
 * </AvatarLabel>
 * @cckPart root
 */
export const AvatarLabel: AvatarLabelComponent = Object.assign(ThemedAvatarLabel, { displayName: 'AvatarLabel' });
