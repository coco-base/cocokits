import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckAccordionImports } from '@cocokits/angular/accordion';
import { CckAvatarImports } from '@cocokits/angular/avatar';
import { CckAvatarGroupImports } from '@cocokits/angular/avatar-group';
import { CckAvatarLabelImports } from '@cocokits/angular/avatar-label';
import { CckBadge } from '@cocokits/angular/badge';
import { CckButton } from '@cocokits/angular/button';
import { CckFormField } from '@cocokits/angular/form-field';
import { CckIconButton } from '@cocokits/angular/icon-button';
import { CckInput } from '@cocokits/angular/input';
import { CckSwitch } from '@cocokits/angular/switch';
import { CckTextarea } from '@cocokits/angular/textarea';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import {
  CckAccordionTheme,
  CckAvatarGroupTheme,
  CckAvatarLabelTheme,
  CckAvatarTheme,
  CckBadgeTheme,
  CckButtonTheme,
  CckFormFieldTheme,
  CckIconButtonTheme,
  CckSwitchTheme,
  CckTextareaTheme,
} from '../src/index';
import { providers } from './helpers';

/** One signal per theme option this job adds; the inputs take `undefined`, `null` and every value. */
@Component({
  imports: [
    CckAccordionImports,
    CckAccordionTheme,
    CckAvatarImports,
    CckAvatarTheme,
    CckAvatarGroupImports,
    CckAvatarGroupTheme,
    CckAvatarLabelImports,
    CckAvatarLabelTheme,
    CckBadge,
    CckBadgeTheme,
    CckButton,
    CckButtonTheme,
    CckFormField,
    CckFormFieldTheme,
    CckIconButton,
    CckIconButtonTheme,
    CckInput,
    CckSwitch,
    CckSwitchTheme,
    CckTextarea,
    CckTextareaTheme,
  ],
  template: `
    <button cckButton data-testid="button" [size]="value()">Save</button>
    <button cckIconButton data-testid="icon-button" [size]="value()" aria-label="Add"></button>
    <cck-avatar data-testid="avatar" [size]="value()" [color]="value()"></cck-avatar>
    <cck-avatar-group data-testid="avatar-group" [size]="value()"></cck-avatar-group>
    <cck-avatar-label data-testid="avatar-label" name="Ada" [size]="value()"></cck-avatar-label>
    <cck-accordion data-testid="accordion" [size]="value()">
      <cck-accordion-item label="Shipping">Orders leave in two days.</cck-accordion-item>
    </cck-accordion>
    <cck-switch data-testid="switch" [variant]="value()">Alerts</cck-switch>
    <cck-form-field data-testid="form-field" [width]="value()"><input cckInput aria-label="Name" /></cck-form-field>
    <textarea cckTextarea data-testid="textarea" aria-label="Notes" [resize]="resize()"></textarea>
    <cck-badge data-testid="badge" [content]="3"></cck-badge>
  `,
})
class Host {
  // The inputs are typed per option; the test sets one value at a time and reads the attribute it renders.
  readonly value = signal<null | undefined>(undefined);
  readonly resize = signal<boolean | string | null | undefined>(undefined);
}

const themed = { providers };
const attr = (id: string, name: string): string | null => screen.getByTestId(id).getAttribute(name);
const { components } = cocokitsThemeConfig;

describe('theme options of the design match', () => {
  it.each([
    ['button', 'data-size', components.button.size.values],
    ['icon-button', 'data-size', components['icon-button'].size.values],
    ['avatar', 'data-size', components.avatar.size.values],
    ['avatar-group', 'data-size', components['avatar-group'].size.values],
    ['avatar-label', 'data-size', components['avatar-label'].size.values],
    ['accordion', 'data-size', components.accordion.size.values],
    ['avatar', 'data-cck-color', components.avatar.color.values],
    ['switch', 'data-variant', components.switch.variant.values],
    ['form-field', 'data-width', components['form-field'].width.values],
  ] as const)('the %s input renders %s for every value', async (id, name, values) => {
    const { fixture } = await render(Host, themed);
    for (const value of values) {
      fixture.componentInstance.value.set(value as never);
      await fixture.whenStable();
      expect(attr(id, name)).toBe(value);
    }
  });

  it('lists the new values: xs and xl, xl and lg', () => {
    expect(components.button.size.values).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
    expect(components['icon-button'].size.values).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
    expect(components.avatar.size.values).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
    expect(components.accordion.size.values).toEqual(['sm', 'md', 'lg']);
  });

  it.each([
    ['avatar', 'data-cck-color', 'contrast'],
    ['switch', 'data-variant', 'contained'],
    ['form-field', 'data-width', null],
    ['badge', 'data-cck-color', 'brand'],
    ['textarea', 'data-resize', ''],
  ] as const)('the %s renders the default of %s: %s', async (id, name, expected) => {
    await render(Host, themed);
    expect(attr(id, name)).toBe(expected);
  });

  it.each([
    ['avatar', 'data-cck-color'],
    ['switch', 'data-variant'],
    ['form-field', 'data-width'],
  ] as const)('the %s removes %s with null', async (id, name) => {
    const { fixture } = await render(Host, themed);
    fixture.componentInstance.value.set(null);
    await fixture.whenStable();
    expect(attr(id, name)).toBeNull();
  });

  it.each([
    ['unset', undefined, ''],
    ['true', true, ''],
    ['the empty attribute form', '', ''],
    ['false', false, null],
    ['the "false" attribute form', 'false', null],
    ['null', null, null],
  ] as const)('the textarea resize input %s renders data-resize %j', async (_name, value, expected) => {
    const { fixture } = await render(Host, themed);
    fixture.componentInstance.resize.set(value);
    await fixture.whenStable();
    expect(attr('textarea', 'data-resize')).toBe(expected);
  });

  it('lets a provider override win over the default, and the input over the override', async () => {
    const { fixture } = await render(Host, {
      providers: [
        ...providers,
        provideCckTheme(cocokitsThemeConfig, { switch: { variant: 'rail' }, avatar: { color: 'info' } }),
      ],
    });
    expect(attr('switch', 'data-variant')).toBe('rail');
    expect(attr('avatar', 'data-cck-color')).toBe('info');
    fixture.componentInstance.value.set('contained' as never);
    await fixture.whenStable();
    expect(attr('switch', 'data-variant')).toBe('contained');
  });

  it('renders no theme attribute without a theme provider', async () => {
    await render(Host);
    expect(attr('switch', 'data-variant')).toBeNull();
    expect(attr('form-field', 'data-width')).toBeNull();
    expect(attr('textarea', 'data-resize')).toBeNull();
    expect(attr('avatar', 'data-cck-color')).toBeNull();
  });
});
