import type { InjectionKey } from 'vue';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type Components = CocokitsThemeConfig['components'];
type Values<C extends keyof Components, O extends keyof Components[C]> = Components[C][O] extends {
  readonly values: readonly (infer V)[];
}
  ? V | null | undefined
  : never;

/**
 * The options a themed parent gives to the themed children below it, by parent component. A child injects the key of
 * its parent only: another theme wrapper in between does not hide it. `undefined` means the parent sets none. The
 * keys are not exported from the package: each theme owns its own parent links. @internal
 */
export interface ParentThemeValues {
  readonly formField: { readonly size?: Values<'form-field', 'size'> };
  /** The size a list resolves for itself (its own, else the field's); the chips of a composition will read it. */
  readonly chipList: { readonly size?: Values<'chip-list', 'size'> };
  readonly avatarGroup: { readonly size?: Values<'avatar-group', 'size'> };
  readonly avatarLabel: { readonly size?: Values<'avatar-label', 'size'> };
  readonly radioGroup: {
    readonly size?: Values<'radio-group', 'size'>;
    readonly color?: Values<'radio-group', 'color'>;
    readonly labelPosition?: Values<'radio-group', 'labelPosition'>;
  };
  readonly dialog: { readonly size?: Values<'dialog', 'size'> };
  readonly tooltip: { readonly size?: Values<'tooltip', 'size'> };
  readonly select: { readonly size?: Values<'select', 'size'>; readonly indicator?: Values<'select', 'indicator'> };
}

/** A getter, so a changed prop of the parent reaches its children. */
type ParentKey<K extends keyof ParentThemeValues> = InjectionKey<() => ParentThemeValues[K]>;

export const formFieldThemeKey: ParentKey<'formField'> = Symbol('cck-form-field-theme');
export const chipListThemeKey: ParentKey<'chipList'> = Symbol('cck-chip-list-theme');
export const avatarGroupThemeKey: ParentKey<'avatarGroup'> = Symbol('cck-avatar-group-theme');
export const avatarLabelThemeKey: ParentKey<'avatarLabel'> = Symbol('cck-avatar-label-theme');
export const radioGroupThemeKey: ParentKey<'radioGroup'> = Symbol('cck-radio-group-theme');
export const dialogThemeKey: ParentKey<'dialog'> = Symbol('cck-dialog-theme');
export const tooltipThemeKey: ParentKey<'tooltip'> = Symbol('cck-tooltip-theme');
export const selectThemeKey: ParentKey<'select'> = Symbol('cck-select-theme');
