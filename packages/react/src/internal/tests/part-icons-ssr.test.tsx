// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Accordion } from '../../accordion';
import { Checkbox } from '../../checkbox';
import { Select } from '../../select';
import { withPartIcons } from './part-icon-fixtures';

const accordion = (
  <Accordion.Root type="single" collapsible defaultValue="a">
    <Accordion.Item value="a">
      <Accordion.Header>
        <Accordion.Trigger>Shipping</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>Orders leave in two days.</Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>
);

describe('part icons on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('has the Accordion indicator with its icon last in the trigger', () => {
    const html = renderToString(withPartIcons(accordion));
    const button = /<button\b[\s\S]*?<\/button>/.exec(html)?.[0] ?? '';
    expect(button).toMatch(
      /Shipping<span class="cck-accordion__indicator" aria-hidden="true"><span [^>]*data-icon="chevron-down"[\s\S]*<\/svg><\/span><\/span><\/button>$/,
    );
  });

  it('has the Select dropdown icon in the trigger', () => {
    const html = renderToString(
      withPartIcons(
        <Select.Root>
          <Select.Trigger aria-label="Dish">
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
        </Select.Root>,
      ),
    );
    expect(html).toMatch(/cck-select__dropdown-icon[^>]*><span [^>]*data-icon="chevron-down"/);
  });

  it('has the Checkbox tick while checked, and none while unchecked or mixed', () => {
    const tick = (props: object): boolean =>
      renderToString(withPartIcons(<Checkbox {...props}>Accept</Checkbox>)).includes('data-icon="check"');
    expect(tick({ defaultChecked: true })).toBe(true);
    expect(tick({})).toBe(false);
    expect(tick({ defaultChecked: true, indeterminate: true })).toBe(false);
  });

  it('has the default icon without a theme and without a provider', () => {
    expect(renderToString(accordion)).toContain('data-icon="chevron-down"');
  });
});
