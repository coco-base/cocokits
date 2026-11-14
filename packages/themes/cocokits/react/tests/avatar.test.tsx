// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef, type ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Avatar, AvatarGroup, AvatarLabel } from '../src/index';
import { themed } from './helpers';

afterEach(cleanup);

const { avatar, 'avatar-group': group, 'avatar-label': label } = cocokitsThemeConfig.components;
const el = (id: string): HTMLElement => screen.getByTestId(id);
const attr = (id: string, name: string): string | null => el(id).getAttribute(name);

const make = (id: string, props: Record<string, unknown>): ReactElement => {
  const all = { 'data-testid': id, ...props };
  if (id === 'avatar') return <Avatar.Root {...all} />;
  return id === 'group' ? <AvatarGroup {...all} /> : <AvatarLabel {...all} />;
};

describe('theme Avatar, AvatarGroup and AvatarLabel', () => {
  it('render the config defaults next to the base classes', () => {
    render(
      themed(
        <>
          <Avatar.Root data-testid="avatar">
            <Avatar.Fallback>AL</Avatar.Fallback>
          </Avatar.Root>
          <AvatarGroup data-testid="group" />
          <AvatarLabel data-testid="label" name="Ada" />
        </>,
      ),
    );
    expect(el('avatar').className).toBe('cck-avatar');
    expect(el('group').className).toBe('cck-avatar-group');
    expect(el('label').className).toBe('cck-avatar-label');
    expect(attr('avatar', 'data-size')).toBe('md');
    expect(attr('group', 'data-size')).toBe('md');
    expect(attr('label', 'data-size')).toBe('md');
    expect(attr('label', 'data-avatar-position')).toBe('start');
    expect(attr('label', 'data-text-layout')).toBe('stacked');
  });

  it.each([
    ['avatar', 'size', 'data-size', avatar.size.values],
    ['group', 'size', 'data-size', group.size.values],
    ['label', 'size', 'data-size', label.size.values],
    ['label', 'avatarPosition', 'data-avatar-position', label.avatarPosition.values],
    ['label', 'textLayout', 'data-text-layout', label.textLayout.values],
  ] as const)('the %s %s prop renders %s for every value', (id, option, name, values) => {
    for (const value of values) {
      render(themed(make(id, { [option]: value })));
      expect(attr(id, name)).toBe(value);
      cleanup();
    }
  });

  it('remove the attributes with null', () => {
    render(
      themed(
        <>
          {make('avatar', { size: null })}
          {make('group', { size: null })}
          {make('label', { size: null, avatarPosition: null, textLayout: null })}
        </>,
      ),
    );
    for (const [id, name] of [
      ['avatar', 'data-size'],
      ['group', 'data-size'],
      ['label', 'data-size'],
      ['label', 'data-avatar-position'],
      ['label', 'data-text-layout'],
    ] as const) {
      expect(el(id).hasAttribute(name)).toBe(false);
    }
  });

  it('let a provider override win over the default and the own prop over the override', () => {
    render(
      <ThemeProvider
        themeConfig={cocokitsThemeConfig}
        overrides={{ avatar: { size: 'xs' }, 'avatar-label': { textLayout: 'inline' } }}
      >
        <Avatar.Root data-testid="avatar" size="lg" />
        <AvatarLabel data-testid="label" />
      </ThemeProvider>,
    );
    expect(attr('avatar', 'data-size')).toBe('lg');
    expect(attr('label', 'data-text-layout')).toBe('inline');
  });

  it('update a mounted root and keep the element and the ref', () => {
    const ref = createRef<HTMLSpanElement>();
    const { rerender } = render(themed(<Avatar.Root data-testid="avatar" ref={ref} size="lg" />));
    const element = el('avatar');
    expect(ref.current).toBe(element);
    rerender(themed(<Avatar.Root data-testid="avatar" ref={ref} size={null} />));
    expect(el('avatar')).toBe(element);
    expect(element.hasAttribute('data-size')).toBe(false);
    rerender(themed(<Avatar.Root data-testid="avatar" ref={ref} size={undefined} />));
    expect(element.getAttribute('data-size')).toBe('md');
  });
});
