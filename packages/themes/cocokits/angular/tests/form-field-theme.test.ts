import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckFormField } from '@cocokits/angular/form-field';
import { CckInput } from '@cocokits/angular/input';
import { defineAnatomy } from '@cocokits/shared';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import { CckFormFieldTheme, type CckFormFieldSize } from '../src/index';
import { providers } from './helpers';

/** The classes come from an anatomy of the same block, as the theme-config tests do; a theme may not import a machine. */
const formFieldAnatomy = defineAnatomy({
  block: 'form-field',
  parts: {
    root: { name: 'Root', description: 'The field.' },
    inputWrapper: { name: 'InputWrapper', description: 'The control zone.' },
  },
});
const inputAnatomy = defineAnatomy({
  block: 'input',
  parts: { root: { name: 'Root', description: 'The input.' } },
});

@Component({
  imports: [CckFormField, CckFormFieldTheme, CckInput],
  template: `
    <cck-form-field data-testid="field" [size]="size()">
      <input cckInput data-testid="input" value="a" />
    </cck-form-field>
  `,
})
class Host {
  readonly size = signal<CckFormFieldSize | null | undefined>(undefined);
}

@Component({
  imports: [CckFormField, CckFormFieldTheme, CckInput],
  template: `
    <cck-form-field data-testid="large" size="lg"><input cckInput aria-label="a" /></cck-form-field>
    <cck-form-field data-testid="small" [size]="small"><input cckInput aria-label="b" /></cck-form-field>
  `,
})
class ElementHost {
  protected readonly small = 'sm';
}

const themed = { providers };
const root = (): HTMLElement => screen.getByTestId('field');
const inputWrapper = (): HTMLElement => {
  const wrapper = root().querySelector<HTMLElement>(`.${formFieldAnatomy.classes.inputWrapper}`);
  if (!wrapper) throw new Error('no input wrapper');
  return wrapper;
};
const sizes = (): (string | null)[] => [root().getAttribute('data-size'), inputWrapper().getAttribute('data-size')];

describe('CckFormFieldTheme', () => {
  it('renders the config default on the root and the input wrapper', async () => {
    await render(Host, themed);
    expect(sizes()).toEqual(['md', 'md']);
  });

  it.each(cocokitsThemeConfig.components['form-field'].size.values)(
    'the size input renders data-size %s on both parts',
    async (value) => {
      const { fixture } = await render(Host, themed);
      fixture.componentInstance.size.set(value);
      await fixture.whenStable();
      expect(sizes()).toEqual([value, value]);
    },
  );

  it('removes the attribute with null and restores the default with undefined', async () => {
    const { fixture } = await render(Host, themed);
    fixture.componentInstance.size.set(null);
    await fixture.whenStable();
    expect(sizes()).toEqual([null, null]);
    fixture.componentInstance.size.set(undefined);
    await fixture.whenStable();
    expect(sizes()).toEqual(['md', 'md']);
  });

  it('lets a provider override win over the default, and the input over the override', async () => {
    const { fixture } = await render(Host, {
      providers: [provideCckTheme(cocokitsThemeConfig, { 'form-field': { size: 'lg' } })],
    });
    expect(sizes()).toEqual(['lg', 'lg']);
    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();
    expect(sizes()).toEqual(['sm', 'sm']);
  });

  it('renders no data-size without a theme provider', async () => {
    await render(Host);
    expect(sizes()).toEqual([null, null]);
  });

  it('does not change the behaviour of the base component', async () => {
    await render(Host, themed);
    const input = screen.getByTestId('input');
    expect(root().classList.contains(formFieldAnatomy.classes.root)).toBe(true);
    expect(inputWrapper().contains(input)).toBe(true);
    expect(input.classList.contains(inputAnatomy.classes.root)).toBe(true);
    expect(input.getAttribute('id')).toMatch(/-control$/);
  });
});

describe('CckFormFieldTheme root element', () => {
  it.each([
    ['large', 'lg'],
    ['small', 'sm'],
  ])('keeps data-size on the %s tag root and its input wrapper', async (id, value) => {
    await render(ElementHost, themed);
    const field = screen.getByTestId(id);
    expect(field.tagName).toBe('CCK-FORM-FIELD');
    expect(field.getAttribute('data-size')).toBe(value);
    expect(field.querySelector(`.${formFieldAnatomy.classes.inputWrapper}`)?.getAttribute('data-size')).toBe(value);
  });
});
