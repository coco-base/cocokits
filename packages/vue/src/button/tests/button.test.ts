// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buttonAnatomy, buttonMeta } from '@cocokits/machines/button';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { Button } from '../index';
import { mountView, testThemeConfig } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// An option that targets every part of the anatomy.
const allPartsConfig = defineThemeConfig({
  name: 'test',
  components: {
    [buttonAnatomy.block]: {
      probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(buttonAnatomy.parts) },
    },
  },
});

describe('Button (rendered contract)', () => {
  it('renders a button with the class and type="button", and no role', () => {
    mountView(() => h(Button, null, () => 'Save'));
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.tagName).toBe('BUTTON');
    expect(button.classList.contains('cck-button')).toBe(true);
    expect(button.getAttribute('type')).toBe('button');
    expect(button.hasAttribute('role')).toBe(false);
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.hasAttribute('tabindex')).toBe(false);
    expect(button.hasAttribute('data-disabled')).toBe(false);
  });

  it('falls class, style and attrs through, and merges the class with the fixed one', () => {
    mountView(() =>
      h(
        Button,
        { class: 'mine', style: { color: 'red' }, id: 'x', name: 'n', value: 'v', form: 'f', 'aria-label': 'Close' },
        () => 'x',
      ),
    );
    const button = screen.getByRole('button', { name: 'Close' });
    expect([...button.classList].sort()).toEqual(['cck-button', 'mine']);
    expect(button.style.color).toBe('red');
    expect(['id', 'name', 'value', 'form'].map((name) => button.getAttribute(name))).toEqual(['x', 'n', 'v', 'f']);
  });

  it('lets a consumer type win, and an undefined type keep the default', () => {
    mountView(() => [h(Button, { type: 'submit' }, () => 'a'), h(Button, { type: undefined }, () => 'b')]);
    expect(screen.getByRole('button', { name: 'a' }).getAttribute('type')).toBe('submit');
    expect(screen.getByRole('button', { name: 'b' }).getAttribute('type')).toBe('button');
  });

  it('keeps a consumer tabindex on an enabled button', () => {
    mountView(() => h(Button, { tabindex: 3 }, () => 'x'));
    expect(screen.getByRole('button').getAttribute('tabindex')).toBe('3');
  });

  it('emits only declared data-* and the theme options, and logs no warning', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const allowed = new Set([...buttonMeta.dataAttrs.root, 'data-variant', 'data-cck-color', 'data-size']);
    const disabled = ref(true);
    const dataNames = (): string[] =>
      screen
        .getByRole('button')
        .getAttributeNames()
        .filter((name) => name.startsWith('data-'));
    mountView(() =>
      h(ThemeProvider, { themeConfig: testThemeConfig }, () => h(Button, { disabled: disabled.value }, () => 'x')),
    );
    expect(dataNames().every((name) => allowed.has(name))).toBe(true);
    expect(dataNames()).toContain('data-disabled');
    disabled.value = false;
    await nextTick();
    expect(dataNames()).toEqual(['data-variant', 'data-cck-color', 'data-size']);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('Button (keyboard and click)', () => {
  it('activates on click, Enter and Space, and Tab moves in and out', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    mountView(() => [h('button', 'before'), h(Button, { onClick }, () => 'Go'), h('button', 'after')]);
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Go' }));
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(3);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Go' }));
  });

  it('is disabled natively, skipped by Tab, and runs no click handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    mountView(() => [h('button', 'before'), h(Button, { disabled: true, onClick }, () => 'Off'), h('button', 'after')]);
    const off = screen.getByRole('button', { name: 'Off' });
    expect((off as HTMLButtonElement).disabled).toBe(true);
    expect(off.getAttribute('data-disabled')).toBe('');
    expect(off.hasAttribute('aria-disabled')).toBe(false);
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
    await user.click(off);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('runs the consumer click.capture first', async () => {
    const calls: string[] = [];
    mountView(() =>
      h(Button, { onClickCapture: () => calls.push('capture'), onClick: () => calls.push('click') }, () => 'Go'),
    );
    await userEvent.click(screen.getByRole('button'));
    expect(calls).toEqual(['capture', 'click']);
  });
});

describe('Button (forms)', () => {
  function form(onSubmit: () => void, type?: 'submit' | 'reset'): void {
    mountView(() =>
      h(
        'form',
        {
          onSubmit: (event: Event) => {
            event.preventDefault();
            onSubmit();
          },
        },
        [h('input', { 'aria-label': 'field', '^value': 'start' }), h(Button, { type }, () => 'Action')],
      ),
    );
  }

  it('submits nothing by default', async () => {
    const onSubmit = vi.fn();
    form(onSubmit);
    await userEvent.click(screen.getByRole('button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a real form with type="submit"', async () => {
    const onSubmit = vi.fn();
    form(onSubmit, 'submit');
    await userEvent.click(screen.getByRole('button'));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('resets a real form with type="reset"', async () => {
    form(vi.fn(), 'reset');
    const field = screen.getByLabelText<HTMLInputElement>('field');
    await userEvent.clear(field);
    await userEvent.type(field, 'changed');
    await userEvent.click(screen.getByRole('button'));
    expect(field.value).toBe('start');
  });
});

describe('Button theme', () => {
  it('puts the theme attribute on every rendered part', () => {
    const { container } = mountView(() =>
      h(ThemeProvider, { themeConfig: allPartsConfig }, () => h(Button, null, () => 'Save')),
    );
    for (const className of Object.values(buttonAnatomy.classes)) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});
