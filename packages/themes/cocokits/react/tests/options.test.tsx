// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import {
  Accordion,
  Avatar,
  AvatarGroup,
  AvatarLabel,
  Badge,
  Button,
  FormField,
  IconButton,
  Switch,
  Textarea,
} from '../src/index';
import { themed } from './helpers';

afterEach(cleanup);

const { components } = cocokitsThemeConfig;
/** The root of a component: a native attribute such as `data-testid` may land on its input, so look outwards. */
const attr = (id: string, name: string): string | null => {
  const element = screen.getByTestId(id);
  return (element.closest(`.cck-${id}`) ?? element).getAttribute(name);
};

/** The element of one component with the option `props`; the table below picks the option under test. */
const make = (id: string, props: Record<string, unknown>): ReactElement => {
  const all = { 'data-testid': id, ...props };
  switch (id) {
    case 'button':
      return <Button {...all}>Save</Button>;
    case 'icon-button':
      return <IconButton aria-label="Add" {...all} />;
    case 'avatar':
      return <Avatar.Root {...all} />;
    case 'avatar-group':
      return <AvatarGroup {...all} />;
    case 'avatar-label':
      return <AvatarLabel name="Ada" {...all} />;
    case 'accordion':
      return (
        <Accordion.Root type="single" {...all}>
          <Accordion.Item value="shipping">
            <Accordion.Header>
              <Accordion.Trigger>Shipping</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Orders leave in two days.</Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      );
    case 'switch':
      return <Switch {...all}>Alerts</Switch>;
    case 'form-field':
      return <FormField {...all} />;
    case 'textarea':
      return <Textarea aria-label="Notes" {...all} />;
    default:
      return <Badge content={3} {...all} />;
  }
};

describe('theme options of the design match', () => {
  it.each([
    ['button', 'size', 'data-size', components.button.size.values],
    ['icon-button', 'size', 'data-size', components['icon-button'].size.values],
    ['avatar', 'size', 'data-size', components.avatar.size.values],
    ['avatar-group', 'size', 'data-size', components['avatar-group'].size.values],
    ['avatar-label', 'size', 'data-size', components['avatar-label'].size.values],
    ['accordion', 'size', 'data-size', components.accordion.size.values],
    ['avatar', 'color', 'data-cck-color', components.avatar.color.values],
    ['switch', 'variant', 'data-variant', components.switch.variant.values],
    ['form-field', 'width', 'data-width', components['form-field'].width.values],
  ] as const)('the %s %s prop renders %s for every value', (id, option, name, values) => {
    for (const value of values) {
      render(themed(make(id, { [option]: value })));
      expect(attr(id, name)).toBe(value);
      cleanup();
    }
  });

  it('lists the new values: xs and xl, xl and lg', () => {
    expect(components.button.size.values).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
    expect(components['icon-button'].size.values).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
    expect(components.avatar.size.values).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
    expect(components.accordion.size.values).toEqual(['sm', 'md', 'lg']);
  });

  it.each([
    ['avatar', 'data-cck-color', 'neutral'],
    ['switch', 'data-variant', 'contained'],
    ['form-field', 'data-width', null],
    ['badge', 'data-cck-color', 'brand'],
    ['textarea', 'data-resize', ''],
  ] as const)('the %s renders the default of %s: %s', (id, name, expected) => {
    render(themed(make(id, {})));
    expect(attr(id, name)).toBe(expected);
  });

  it.each([
    ['avatar', 'color', 'data-cck-color'],
    ['switch', 'variant', 'data-variant'],
    ['form-field', 'width', 'data-width'],
  ] as const)('the %s %s prop removes %s with null', (id, option, name) => {
    render(themed(make(id, { [option]: null })));
    expect(attr(id, name)).toBeNull();
  });

  it.each([
    ['unset', undefined, ''],
    ['true', true, ''],
    ['false', false, null],
    ['null', null, null],
  ] as const)('the textarea resize prop %s renders data-resize %j', (_name, value, expected) => {
    render(themed(make('textarea', { resize: value })));
    expect(attr('textarea', 'data-resize')).toBe(expected);
  });

  it('lets a provider override win over the default, and the prop over the override', () => {
    render(
      <ThemeProvider
        themeConfig={cocokitsThemeConfig}
        overrides={{ switch: { variant: 'rail' }, avatar: { color: 'info' } }}
      >
        {make('switch', {})}
        {make('avatar', {})}
      </ThemeProvider>,
    );
    expect(attr('switch', 'data-variant')).toBe('rail');
    expect(attr('avatar', 'data-cck-color')).toBe('info');
    cleanup();
    render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ switch: { variant: 'rail' } }}>
        {make('switch', { variant: 'contained' })}
      </ThemeProvider>,
    );
    expect(attr('switch', 'data-variant')).toBe('contained');
  });

  it('renders no theme attribute without a theme provider', () => {
    render(
      <>
        {make('switch', {})}
        {make('form-field', {})}
        {make('textarea', {})}
        {make('avatar', {})}
      </>,
    );
    expect(attr('switch', 'data-variant')).toBeNull();
    expect(attr('form-field', 'data-width')).toBeNull();
    expect(attr('textarea', 'data-resize')).toBeNull();
    expect(attr('avatar', 'data-cck-color')).toBeNull();
  });
});
