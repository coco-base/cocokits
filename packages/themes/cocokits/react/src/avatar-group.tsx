'use client';

import type { ReactElement } from 'react';
import {
  AvatarGroup as BaseAvatarGroup,
  type AvatarGroupProps as BaseAvatarGroupProps,
} from '@cocokits/react/avatar-group';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type AvatarGroupOptions = CocokitsThemeConfig['components']['avatar-group'];

/** The `size` values of the cocokits theme. */
export type AvatarGroupSize = AvatarGroupOptions['size']['values'][number];

/** Props of the themed {@link AvatarGroup}: the base props plus the cocokits `size`. */
export interface AvatarGroupProps extends BaseAvatarGroupProps {
  /**
   * Overlap, ring and the size of its direct avatars; it wins over their own size.
   */
  readonly size?: AvatarGroupSize | null | undefined;
}

function ThemedAvatarGroup({ size, ...props }: AvatarGroupProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="avatar-group" options={{ size }}>
      <BaseAvatarGroup {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link AvatarGroup} component and its `displayName`. */
interface AvatarGroupComponent {
  (props: AvatarGroupProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Avatar group. It renders the base `<div>` and supplies `size` to it, which renders the `data-size`
 * attribute. The option resolves in order: the prop, then the `ThemeProvider` override, then the config default;
 * `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <AvatarGroup size="sm" role="group" aria-label="Team">
 *   <Avatar.Root><Avatar.Fallback>AL</Avatar.Fallback></Avatar.Root>
 *   <Avatar.Root><Avatar.Fallback>GH</Avatar.Fallback></Avatar.Root>
 * </AvatarGroup>
 * @cckPart root
 */
export const AvatarGroup: AvatarGroupComponent = Object.assign(ThemedAvatarGroup, { displayName: 'AvatarGroup' });
