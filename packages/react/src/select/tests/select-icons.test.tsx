// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { iconNamesIn, withPartIcons } from '../../internal/tests/part-icon-fixtures';
import { Select } from '../index';
import { Dishes, must, Opt, stubTopLayer, trigger } from './fixtures';

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const dropdownIcon = (): HTMLElement => must(trigger().querySelector<HTMLElement>('.cck-select__dropdown-icon'));
const indicatorOf = (name: string): HTMLElement =>
  must(screen.getByRole('option', { name }).querySelector<HTMLElement>('.cck-select__option-indicator'));

describe('Select theme part icons', () => {
  it('draws the theme icon in the dropdown icon, which stays aria-hidden', () => {
    render(withPartIcons(<Dishes />));
    expect(iconNamesIn(dropdownIcon())).toEqual(['chevron-down']);
    expect(dropdownIcon().getAttribute('aria-hidden')).toBe('true');
    expect(dropdownIcon().querySelector('.cck-svg-icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws the check in the indicator of the selected option only', async () => {
    render(
      withPartIcons(
        <Dishes defaultValue="Cake" defaultOpen>
          <Opt value="Cake">Cake</Opt>
          <Opt value="Pizza">Pizza</Opt>
        </Dishes>,
      ),
    );
    await screen.findByRole('listbox');
    expect(iconNamesIn(indicatorOf('Cake'))).toEqual(['check']);
    expect(iconNamesIn(indicatorOf('Pizza'))).toEqual([]);
    expect(indicatorOf('Pizza').getAttribute('aria-hidden')).toBe('true');
  });

  it('adds and removes the check with the selection', async () => {
    const user = userEvent.setup();
    render(
      withPartIcons(
        <Dishes defaultOpen>
          <Opt value="Cake">Cake</Opt>
          <Opt value="Pizza">Pizza</Opt>
        </Dishes>,
      ),
    );
    await screen.findByRole('listbox');
    expect(iconNamesIn(screen.getByRole('listbox'))).toEqual([]);
    await user.click(screen.getByRole('option', { name: 'Pizza' }));
    await user.click(trigger());
    await screen.findByRole('listbox');
    expect(iconNamesIn(indicatorOf('Pizza'))).toEqual(['check']);
    expect(iconNamesIn(indicatorOf('Cake'))).toEqual([]);
  });

  it('draws the check for every selected option of a multiple Select', async () => {
    render(
      withPartIcons(
        <Dishes multiple defaultValue={['Cake', 'Pizza']} defaultOpen>
          <Opt value="Cake">Cake</Opt>
          <Opt value="Pizza">Pizza</Opt>
          <Opt value="Steak">Steak</Opt>
        </Dishes>,
      ),
    );
    await screen.findByRole('listbox');
    expect(iconNamesIn(screen.getByRole('listbox'))).toEqual(['check', 'check']);
  });

  const content: readonly [string, ReactNode][] = [
    ['an element', <i key="own" data-own="" />],
    ['text', 'v'],
    ['an array with an element', [false, <i key="own" data-own="" />]],
  ];

  it.each(content)('shows author content (%s) in the part and no theme icon', async (_name, own) => {
    render(
      withPartIcons(
        <Select.Root defaultValue="Cake" defaultOpen>
          <Select.Trigger aria-label="Dish">
            <Select.Value />
            <Select.Icon>{own}</Select.Icon>
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="Cake">
              <Select.ItemIndicator>{own}</Select.ItemIndicator>
              <Select.ItemText>Cake</Select.ItemText>
            </Select.Item>
          </Select.Content>
        </Select.Root>,
      ),
    );
    await screen.findByRole('listbox');
    expect(iconNamesIn(document.body)).toEqual([]);
    expect(document.body.textContent).toContain(typeof own === 'string' ? own : '');
    if (typeof own !== 'string') expect(document.querySelectorAll('[data-own]')).toHaveLength(2);
  });

  const empty: readonly [string, ReactNode][] = [
    ['undefined', undefined],
    ['null', null],
    ['false', false],
    ['true', true],
    ['an empty string', ''],
    ['an array of only those', [null, false, '', undefined]],
  ];

  it.each(empty)('treats %s as no content and draws the theme icons', async (_name, none) => {
    render(
      withPartIcons(
        <Select.Root defaultValue="Cake" defaultOpen>
          <Select.Trigger aria-label="Dish">
            <Select.Value />
            <Select.Icon>{none}</Select.Icon>
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="Cake">
              <Select.ItemIndicator>{none}</Select.ItemIndicator>
              <Select.ItemText>Cake</Select.ItemText>
            </Select.Item>
          </Select.Content>
        </Select.Root>,
      ),
    );
    await screen.findByRole('listbox');
    expect(iconNamesIn(document.body)).toEqual(['chevron-down', 'check']);
  });

  it('keeps the author content of a render element instead of the theme icon', () => {
    render(
      withPartIcons(
        <Select.Root defaultValue="Cake">
          <Select.Trigger aria-label="Dish">
            <Select.Value />
            <Select.Icon
              render={
                <i>
                  <b>v</b>
                </i>
              }
            />
          </Select.Trigger>
        </Select.Root>,
      ),
    );
    expect(dropdownIcon().tagName).toBe('I');
    expect(dropdownIcon().innerHTML).toBe('<b>v</b>');
    expect(iconNamesIn(dropdownIcon())).toEqual([]);
  });

  const renders: readonly [string, ReactElement | ((props: object) => ReactElement)][] = [
    ['an element', <i key="own" data-own="" />],
    ['a function', (props) => <i data-own="" {...props} />],
  ];

  it.each(renders)(
    'draws the theme icons inside an empty author element given through render (%s)',
    async (_name, make) => {
      render(
        withPartIcons(
          <Select.Root defaultValue="Cake" defaultOpen>
            <Select.Trigger aria-label="Dish">
              <Select.Value />
              <Select.Icon render={make} />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="Cake">
                <Select.ItemIndicator render={make} />
                <Select.ItemText>Cake</Select.ItemText>
              </Select.Item>
              <Select.Item value="Pizza">
                <Select.ItemIndicator render={make} />
                <Select.ItemText>Pizza</Select.ItemText>
              </Select.Item>
            </Select.Content>
          </Select.Root>,
        ),
      );
      await screen.findByRole('listbox');
      expect(dropdownIcon().tagName).toBe('I');
      expect(iconNamesIn(dropdownIcon())).toEqual(['chevron-down']);
      expect(indicatorOf('Cake').tagName).toBe('I');
      expect(iconNamesIn(indicatorOf('Cake'))).toEqual(['check']);
      expect(iconNamesIn(indicatorOf('Pizza'))).toEqual([]);
      expect(document.querySelectorAll('[data-own]')).toHaveLength(3);
    },
  );

  it('draws the default icons without a theme', async () => {
    const withoutTheme: ReactElement = (
      <Dishes defaultValue="Cake" defaultOpen>
        <Opt value="Cake">Cake</Opt>
      </Dishes>
    );
    render(withoutTheme);
    await screen.findByRole('listbox');
    expect(iconNamesIn(dropdownIcon())).toEqual(['chevron-down']);
    expect(iconNamesIn(indicatorOf('Cake'))).toEqual(['check']);
  });

  it('draws the default icon when the theme names no icon for the part', () => {
    render(<Dishes />);
    expect(iconNamesIn(dropdownIcon())).toEqual(['chevron-down']);
  });

  it('keeps the name of the combobox and the option unchanged', async () => {
    render(
      withPartIcons(
        <Dishes defaultValue="Cake" defaultOpen>
          <Opt value="Cake">Cake</Opt>
        </Dishes>,
      ),
    );
    await screen.findByRole('listbox');
    expect(screen.getByRole('combobox', { name: 'Dish' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Cake' })).toBeTruthy();
  });
});
