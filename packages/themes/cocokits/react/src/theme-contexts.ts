'use client';

import { createContext, type Context } from 'react';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type Components = CocokitsThemeConfig['components'];
type Values<C extends keyof Components, O extends keyof Components[C]> = Components[C][O] extends {
  readonly values: readonly (infer V)[];
}
  ? V | null | undefined
  : never;

/**
 * The options a themed parent gives to the themed children that sit below it, by parent component. A child reads the
 * context of its parent only: another theme wrapper in between does not hide it. `undefined` means the parent sets
 * none. The contexts are not exported from the package: each theme owns its own parent links. @internal
 */
export interface ParentThemeValues {
  readonly formField: { readonly size?: Values<'form-field', 'size'> };
  readonly avatarGroup: { readonly size?: Values<'avatar-group', 'size'> };
  readonly avatarLabel: { readonly size?: Values<'avatar-label', 'size'> };
  readonly radioGroup: {
    readonly size?: Values<'radio-group', 'size'>;
    readonly color?: Values<'radio-group', 'color'>;
    readonly labelPosition?: Values<'radio-group', 'labelPosition'>;
  };
  readonly dialog: { readonly size?: Values<'dialog', 'size'> };
  readonly tooltip: { readonly size?: Values<'tooltip', 'size'> };
}

const parentContext = <K extends keyof ParentThemeValues>(): Context<ParentThemeValues[K]> =>
  createContext<ParentThemeValues[K]>({});

export const FormFieldThemeContext: Context<ParentThemeValues['formField']> = parentContext<'formField'>();
export const AvatarGroupThemeContext: Context<ParentThemeValues['avatarGroup']> = parentContext<'avatarGroup'>();
export const AvatarLabelThemeContext: Context<ParentThemeValues['avatarLabel']> = parentContext<'avatarLabel'>();
export const RadioGroupThemeContext: Context<ParentThemeValues['radioGroup']> = parentContext<'radioGroup'>();
export const DialogThemeContext: Context<ParentThemeValues['dialog']> = parentContext<'dialog'>();
export const TooltipThemeContext: Context<ParentThemeValues['tooltip']> = parentContext<'tooltip'>();
