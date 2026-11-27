// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../../checkbox';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Label } from '../../label';
import { Prefix } from '../../prefix';
import { Suffix } from '../../suffix';
import { Trailing } from '../../trailing';
import { Leading } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const holdsOne = (warn: { readonly mock: { readonly calls: unknown[][] } }): boolean =>
  warn.mock.calls.some(([message]) => String(message).includes('holds one control'));

const zones: [string, (content: ReactNode) => Record<string, ReactElement>][] = [
  ['Leading', (content) => ({ leading: <Leading>{content}</Leading> })],
  ['Trailing', (content) => ({ trailing: <Trailing>{content}</Trailing> })],
  ['Prefix', (content) => ({ prefix: <Prefix>{content}</Prefix> })],
  ['Suffix', (content) => ({ suffix: <Suffix>{content}</Suffix> })],
];

describe('A control in a zone of a FormField', () => {
  it.each(zones)('leaves the Label, the id and the warning to the Input when a Checkbox is in a %s', (_name, zone) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = render(
      <FormField disabled label={<Label>Discount</Label>} {...zone(<Checkbox aria-label="Apply" />)}>
        <Input />
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: 'Discount' });
    const checkbox = screen.getByRole('checkbox', { name: 'Apply' });
    expect(input.id).toMatch(/-control$/);
    expect(container.querySelector('label')?.htmlFor).toBe(input.id);
    expect(checkbox.id).not.toMatch(/-control$/);
    expect(checkbox.getAttribute('aria-describedby')).toBeNull();
    expect(holdsOne(warn)).toBe(false);
    // The control still reads the field's state.
    expect((checkbox as HTMLInputElement).disabled).toBe(true);
  });
});
