'use client';

import type { ReactElement } from 'react';
import { Avatar as BaseAvatar, type AvatarRootProps as BaseAvatarRootProps } from '@cocokits/react/avatar';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type AvatarOptions = CocokitsThemeConfig['components']['avatar'];

/** The `size` values of the cocokits theme. */
export type AvatarSize = AvatarOptions['size']['values'][number];

/** Props of the themed {@link Avatar.Root}: the base props plus the cocokits `size`. */
export interface AvatarRootProps extends BaseAvatarRootProps {
  /**
   * Side of the circle and size of the fallback text.
   */
  readonly size?: AvatarSize | null | undefined;
}

function ThemedAvatarRoot({ size, ...props }: AvatarRootProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="avatar" options={{ size }}>
      <BaseAvatar.Root {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Avatar.Root} component and its `displayName`. */
export interface AvatarRootComponent {
  (props: AvatarRootProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Avatar root. It renders the base `<span>` and supplies `size` to it, which renders the `data-size`
 * attribute. The option resolves in order: the prop, then the `ThemeProvider` override, then the config default;
 * `null` removes the attribute. The theme needs a `ThemeProvider`. Inside an `AvatarGroup` or `AvatarLabel`, the
 * size of the container wins.
 *
 * @example
 * <Avatar.Root size="lg">
 *   <Avatar.Image src="/ada.webp" alt="Ada Lovelace" />
 *   <Avatar.Fallback>AL</Avatar.Fallback>
 * </Avatar.Root>
 * @cckPart root
 */
export const AvatarRoot: AvatarRootComponent = Object.assign(ThemedAvatarRoot, { displayName: 'AvatarRoot' });
