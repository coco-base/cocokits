// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Checkbox } from '../../checkbox';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { CheckboxGroup } from '../index';

describe('CheckboxGroup on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the group with its checked boxes', () => {
    const html = renderToString(
      <CheckboxGroup aria-label="Toppings" name="t" defaultValue={['b']} disabled>
        <Checkbox value="a">A</Checkbox>
        <Checkbox value="b">B</Checkbox>
      </CheckboxGroup>,
    );
    expect(html).toContain('class="cck-checkbox-group"');
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Toppings"');
    expect(html).toContain('data-disabled=""');
    expect(html).toContain('data-orientation="vertical"');
    expect(html).toMatch(/<input[^>]*value="b"[^>]*checked=""|<input[^>]*checked=""[^>]*value="b"/);
    expect(html).not.toMatch(/<input[^>]*value="a"[^>]*checked=""/);
    expect(html).not.toContain('<fieldset');
  });

  it('renders inside a FormField', () => {
    const html = renderToString(
      <FormField label={<Label>Toppings</Label>}>
        <CheckboxGroup>
          <Checkbox value="a">A</Checkbox>
        </CheckboxGroup>
      </FormField>,
    );
    expect(html).toContain('role="group"');
  });
});
