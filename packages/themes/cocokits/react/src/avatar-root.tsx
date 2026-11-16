'use client';

import { useContext, type ReactElement } from 'react';
import { Avatar as BaseAvatar, type AvatarRootProps as BaseAvatarRootProps } from '@cocokits/react/avatar';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import { inherited, type CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { AvatarGroupThemeContext, AvatarLabelThemeContext } from './theme-contexts';

type AvatarOptions = CocokitsThemeConfig['components']['avatar'];

/** The `size` values of the cocokits theme. */
export type AvatarSize = AvatarOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type AvatarColor = AvatarOptions['color']['values'][number];

/** Props of the themed {@link Avatar.Root}: the base props plus the two cocokits options. */
export interface AvatarRootProps extends BaseAvatarRootProps {
  /**
   * Side of the circle and size of the fallback text.
   */
  readonly size?: AvatarSize | null | undefined;
  /**
   * Color family of the fallback, rendered as `data-cck-color`.
   */
  readonly color?: AvatarColor | null | undefined;
}

function ThemedAvatarRoot({ size, color, ...props }: AvatarRootProps): ReactElement {
  const label = useContext(AvatarLabelThemeContext);
  const group = useContext(AvatarGroupThemeContext);
  return (
    <ThemeOptionsProvider componentName="avatar" options={{ size: inherited(size, label.size, group.size), color }}>
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
 * The cocokits Avatar root. It renders the base `<span>` and supplies `size` and `color` to it, which renders the
 * `data-size` and `data-cck-color` attributes. Each option resolves in order: the prop, then (for `size`) the one of
 * the `AvatarLabel` or `AvatarGroup` around it, then the `ThemeProvider` override, then the config default; `null`
 * removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <Avatar.Root size="lg">
 *   <Avatar.Image src="/ada.webp" alt="Ada Lovelace" />
 *   <Avatar.Fallback>AL</Avatar.Fallback>
 * </Avatar.Root>
 * @cckPart root
 */
export const AvatarRoot: AvatarRootComponent = Object.assign(ThemedAvatarRoot, { displayName: 'AvatarRoot' });
