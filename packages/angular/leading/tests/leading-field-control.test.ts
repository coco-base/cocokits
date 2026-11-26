import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckCheckboxImports } from '../../checkbox';
import { CckFormFieldImports } from '../../form-field';
import { CckInputImports } from '../../input';
import { CckLabelImports } from '../../label';
import { CckPrefixImports } from '../../prefix';
import { CckSuffixImports } from '../../suffix';
import { CckTrailingImports } from '../../trailing';
import { CckLeadingImports } from '../index';

const imports = [
  ...CckFormFieldImports,
  ...CckLabelImports,
  ...CckInputImports,
  ...CckCheckboxImports,
  ...CckLeadingImports,
  ...CckTrailingImports,
  ...CckPrefixImports,
  ...CckSuffixImports,
];

const holdsOne = (warn: { readonly mock: { readonly calls: unknown[][] } }): boolean =>
  warn.mock.calls.some(([message]) => String(message).includes('holds one control'));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('A control in a zone of a FormField', () => {
  it.each(['cckLeading', 'cckTrailing', 'cckPrefix', 'cckSuffix'])(
    'leaves the Label, the id and the warning to the Input when a Checkbox is in a %s',
    async (zone) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { container } = await render(
        `<cck-form-field disabled><label cckLabel>Discount</label><span ${zone}><cck-checkbox aria-label="Apply" /></span><input cckInput /></cck-form-field>`,
        { imports },
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
    },
  );
});
