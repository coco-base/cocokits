import { Component, Directive, forwardRef, input, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { defineAnatomy, defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckAttrs, provideCckTheme, provideThemeOptions, themeAttrs } from '../src/index';

const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    box: {
      inner: { attrName: 'inner', values: ['x'], default: 'x', partNames: ['inner'] },
      size: { attrName: 'size', values: ['sm', 'md'], default: 'md' },
      tone: { attrName: 'tone', values: ['a', 'b'], default: 'a' },
      rounded: { attrName: 'rounded', values: [true, false], default: false },
    },
  },
});

const anatomy = defineAnatomy({
  block: 'box',
  parts: {
    root: { name: 'Root', description: 'The host.' },
    inner: { name: 'Inner', description: 'An internal part.' },
  },
});

@Directive({ selector: '[testBox]' })
class TestBox {
  readonly attrs = themeAttrs(anatomy);
}

@Component({
  selector: '[testNested]',
  imports: [CckAttrs],
  template: `<i data-testid="inner" [cckAttrs]="theme().inner"></i>`,
})
class TestNested {
  protected readonly theme = themeAttrs(anatomy);
}

@Directive({
  selector: '[testBox], [testNested]',
  providers: [
    provideThemeOptions(
      'box',
      forwardRef(() => TestBoxTheme),
      (theme: TestBoxTheme) => ({ size: theme.size, tone: theme.tone, rounded: theme.rounded, inner: theme.inner }),
    ),
  ],
})
class TestBoxTheme {
  readonly size = input<'sm' | 'md' | null>();
  readonly tone = input<'a' | 'b' | null>();
  readonly rounded = input<boolean | null>();
  readonly inner = input<'x' | null>();
}

@Component({
  imports: [TestBox, TestBoxTheme],
  template: `<div testBox data-testid="box" [size]="size()" [tone]="tone()" [rounded]="rounded()"></div>`,
})
class Host {
  readonly size = signal<'sm' | 'md' | null | undefined>(undefined);
  readonly tone = signal<'a' | 'b' | null | undefined>(undefined);
  readonly rounded = signal<boolean | null | undefined>(undefined);
}

@Component({ imports: [TestBox], template: `<div testBox data-testid="box"></div>` })
class Plain {
  readonly plain = true;
}

function attrs(el: HTMLElement): Record<string, string> {
  const result: Record<string, string> = {};
  for (const { name, value } of Array.from(el.attributes)) {
    if (name.startsWith('data-') && name !== 'data-testid') result[name] = value;
  }
  return result;
}

@Component({
  imports: [TestNested, TestBoxTheme],
  template: `<div testNested data-testid="box" [inner]="inner()"></div>`,
})
class Nested {
  readonly inner = signal<'x' | null | undefined>(undefined);
}

@Component({
  imports: [CckAttrs],
  template: `<i data-testid="free" [cckAttrs]="record()"></i>`,
})
class Free {
  readonly record = signal<Record<string, string>>({});
}

describe('theme runtime', () => {
  it('skips a cckAttrs key that is not data-*, and removes a dropped data-* key', async () => {
    const { fixture } = await render(Free);
    fixture.componentInstance.record.set({ onclick: 'x()', 'data-a': '1' });
    await fixture.whenStable();
    expect(screen.getByTestId('free').hasAttribute('onclick')).toBe(false);
    expect(attrs(screen.getByTestId('free'))).toEqual({ 'data-a': '1' });

    fixture.componentInstance.record.set({});
    await fixture.whenStable();
    expect(attrs(screen.getByTestId('free'))).toEqual({});
  });

  it('applies the root record to the host and each other part through cckAttrs', async () => {
    await render(Nested, { providers: [provideCckTheme(themeConfig)] });
    expect(attrs(screen.getByTestId('box'))).toEqual({ 'data-size': 'md', 'data-tone': 'a' });
    expect(attrs(screen.getByTestId('inner'))).toEqual({ 'data-inner': 'x' });
  });

  it('removes the attribute of an inner part when its option is null', async () => {
    const { fixture } = await render(Nested, { providers: [provideCckTheme(themeConfig)] });
    fixture.componentInstance.inner.set(null);
    await fixture.whenStable();
    expect(attrs(screen.getByTestId('inner'))).toEqual({});
    fixture.componentInstance.inner.set('x');
    await fixture.whenStable();
    expect(attrs(screen.getByTestId('inner'))).toEqual({ 'data-inner': 'x' });
  });

  it('renders nothing without a provided theme', async () => {
    await render(Plain);
    expect(attrs(screen.getByTestId('box'))).toEqual({});
  });

  it('renders the config defaults on the host', async () => {
    await render(Plain, { providers: [provideCckTheme(themeConfig)] });
    expect(attrs(screen.getByTestId('box'))).toEqual({ 'data-size': 'md', 'data-tone': 'a' });
  });

  it('applies provider overrides over the defaults', async () => {
    await render(Plain, {
      providers: [provideCckTheme(themeConfig, { box: { size: 'sm' } })],
    });
    expect(attrs(screen.getByTestId('box'))).toEqual({ 'data-size': 'sm', 'data-tone': 'a' });
  });

  it('uses the theme directive options over the overrides, and updates them', async () => {
    const { fixture } = await render(Host, {
      providers: [provideCckTheme(themeConfig, { box: { size: 'sm' } })],
    });
    expect(attrs(screen.getByTestId('box'))['data-size']).toBe('sm');

    fixture.componentInstance.size.set('md');
    fixture.componentInstance.tone.set('b');
    await fixture.whenStable();
    expect(attrs(screen.getByTestId('box'))).toEqual({ 'data-size': 'md', 'data-tone': 'b' });
  });

  it('removes an attribute when the option is null', async () => {
    const { fixture } = await render(Host, { providers: [provideCckTheme(themeConfig)] });
    expect(attrs(screen.getByTestId('box'))['data-tone']).toBe('a');

    fixture.componentInstance.tone.set(null);
    await fixture.whenStable();
    expect(attrs(screen.getByTestId('box'))).toEqual({ 'data-size': 'md' });
  });

  it('renders a boolean option as a presence attribute and removes it when false or null', async () => {
    const { fixture } = await render(Host, { providers: [provideCckTheme(themeConfig)] });
    expect(attrs(screen.getByTestId('box'))).not.toHaveProperty('data-rounded');

    fixture.componentInstance.rounded.set(true);
    await fixture.whenStable();
    expect(attrs(screen.getByTestId('box'))['data-rounded']).toBe('');

    fixture.componentInstance.rounded.set(false);
    await fixture.whenStable();
    expect(attrs(screen.getByTestId('box'))).not.toHaveProperty('data-rounded');

    fixture.componentInstance.rounded.set(true);
    await fixture.whenStable();
    fixture.componentInstance.rounded.set(null);
    await fixture.whenStable();
    expect(attrs(screen.getByTestId('box'))).not.toHaveProperty('data-rounded');
  });

  it('types overrides from the config', () => {
    provideCckTheme(themeConfig, { box: { size: 'sm', tone: null } });
    provideCckTheme(themeConfig, { box: { size: undefined } });
    // @ts-expect-error a value the option does not list
    provideCckTheme(themeConfig, { box: { size: 'huge' } });
    // @ts-expect-error an option the component does not have
    provideCckTheme(themeConfig, { box: { shade: 'a' } });
    // @ts-expect-error a component the config does not have
    provideCckTheme(themeConfig, { card: { size: 'sm' } });
    expect(true).toBe(true);
  });
});
