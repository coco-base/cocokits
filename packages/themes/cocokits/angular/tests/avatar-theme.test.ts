import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckAvatarImports } from '@cocokits/angular/avatar';
import { CckAvatarGroupImports } from '@cocokits/angular/avatar-group';
import { CckAvatarLabelImports } from '@cocokits/angular/avatar-label';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import {
  CckAvatarGroupTheme,
  CckAvatarLabelTheme,
  CckAvatarTheme,
  type CckAvatarGroupSize,
  type CckAvatarLabelAvatarPosition,
  type CckAvatarLabelSize,
  type CckAvatarLabelTextLayout,
  type CckAvatarSize,
} from '../src/index';
import { providers } from './helpers';

@Component({
  imports: [
    CckAvatarImports,
    CckAvatarTheme,
    CckAvatarGroupImports,
    CckAvatarGroupTheme,
    CckAvatarLabelImports,
    CckAvatarLabelTheme,
  ],
  template: `
    <cck-avatar data-testid="avatar" [size]="avatar()"><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>
    <cck-avatar-group data-testid="group" [size]="group()"></cck-avatar-group>
    <cck-avatar-label
      data-testid="label"
      name="Ada"
      [size]="labelSize()"
      [avatarPosition]="position()"
      [textLayout]="layout()"
    ></cck-avatar-label>
  `,
})
class Host {
  readonly avatar = signal<CckAvatarSize | null | undefined>(undefined);
  readonly group = signal<CckAvatarGroupSize | null | undefined>(undefined);
  readonly labelSize = signal<CckAvatarLabelSize | null | undefined>(undefined);
  readonly position = signal<CckAvatarLabelAvatarPosition | null | undefined>(undefined);
  readonly layout = signal<CckAvatarLabelTextLayout | null | undefined>(undefined);
}

@Component({
  imports: [CckAvatarImports, CckAvatarTheme],
  template: `<cck-avatar data-testid="avatar" size="lg"></cck-avatar>`,
})
class Static {
  readonly unused = true;
}

const attr = (id: string, name: string): string | null => screen.getByTestId(id).getAttribute(name);
const { avatar, 'avatar-group': group, 'avatar-label': label } = cocokitsThemeConfig.components;

describe('avatar theme layers', () => {
  it('render the config defaults next to the base classes', async () => {
    await render(Host, { providers });
    expect(screen.getByTestId('avatar').className).toBe('cck-avatar');
    expect(screen.getByTestId('group').className).toBe('cck-avatar-group');
    expect(screen.getByTestId('label').className).toBe('cck-avatar-label');
    expect(attr('avatar', 'data-size')).toBe('md');
    expect(attr('group', 'data-size')).toBe('md');
    expect(attr('label', 'data-size')).toBe('md');
    expect(attr('label', 'data-avatar-position')).toBe('start');
    expect(attr('label', 'data-text-layout')).toBe('stacked');
  });

  it.each([
    ['avatar', 'avatar', 'data-size', avatar.size.values],
    ['group', 'group', 'data-size', group.size.values],
    ['label', 'labelSize', 'data-size', label.size.values],
    ['label', 'position', 'data-avatar-position', label.avatarPosition.values],
    ['label', 'layout', 'data-text-layout', label.textLayout.values],
  ] as const)('the %s %s input renders %s for every value', async (id, option, name, values) => {
    const { fixture } = await render(Host, { providers });
    for (const value of values) {
      (fixture.componentInstance[option] as { set(v: string): void }).set(value);
      await fixture.whenStable();
      expect(attr(id, name)).toBe(value);
    }
  });

  it('remove an attribute with null and restore the default with undefined', async () => {
    const { fixture } = await render(Host, { providers });
    const host = fixture.componentInstance;
    const all = [host.avatar, host.group, host.labelSize, host.position, host.layout];
    for (const s of all) s.set(null);
    await fixture.whenStable();
    expect([attr('avatar', 'data-size'), attr('group', 'data-size'), attr('label', 'data-size')]).toEqual([
      null,
      null,
      null,
    ]);
    expect([attr('label', 'data-avatar-position'), attr('label', 'data-text-layout')]).toEqual([null, null]);
    for (const s of all) s.set(undefined);
    await fixture.whenStable();
    expect(attr('avatar', 'data-size')).toBe('md');
    expect(attr('label', 'data-text-layout')).toBe('stacked');
  });

  it('let an own input win over a provider override', async () => {
    await render(Static, { providers: [provideCckTheme(cocokitsThemeConfig, { avatar: { size: 'xs' } })] });
    expect(attr('avatar', 'data-size')).toBe('lg');
  });

  it('let a provider override win over the config default', async () => {
    await render(Host, {
      providers: [provideCckTheme(cocokitsThemeConfig, { 'avatar-label': { textLayout: 'inline' } })],
    });
    expect(attr('label', 'data-text-layout')).toBe('inline');
  });

  it('render no theme data-* without a theme provider', async () => {
    await render(Host);
    expect(attr('avatar', 'data-size')).toBeNull();
    expect(attr('label', 'data-avatar-position')).toBeNull();
  });
});
