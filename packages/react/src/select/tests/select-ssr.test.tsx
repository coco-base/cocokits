// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Select } from '../index';
import { Example, Dishes, Opt } from './fixtures';

describe('Select on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the closed trigger with its class, ARIA and value, the hidden input, and no list', () => {
    const html = renderToString(
      <Dishes name="dish" defaultValue="Pizza" placeholder="Choose">
        <Opt value="Cake">Cake</Opt>
        <Opt value="Pizza">Pizza</Opt>
      </Dishes>,
    );
    expect(html).toContain('class="cck-select__trigger"');
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-state="closed"');
    expect(html).toContain('cck-select__value');
    expect(html).toMatch(/<input[^>]*name="dish"[^>]*value="Pizza"/);
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('role="listbox"');
    expect(html).not.toContain('role="option"');
    expect(html).not.toContain('cck-select__content');
  });

  it('renders an open-by-default Select closed: the trigger says expanded, but nothing points at a missing list', () => {
    const html = renderToString(<Example defaultOpen />);
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('role="listbox"');
    expect(html).not.toContain('aria-activedescendant');
  });

  it('renders the placeholder while nothing is selected', () => {
    const html = renderToString(<Example />);
    expect(html).toContain('cck-select__placeholder');
    expect(html).toContain('data-placeholder-shown');
  });

  it('renders the label of the selected value from items, with no part registering text', () => {
    const html = renderToString(
      <Dishes defaultValue="pizza" items={[{ value: 'pizza', label: 'Pizza' }]}>
        <Opt value="pizza">Pizza</Opt>
      </Dishes>,
    );
    expect(html).toMatch(/cck-select__value[^>]*>Pizza</);
    expect(html).not.toContain('cck-select__placeholder');
  });

  it('renders the value as text without items, and itemToStringLabel when given', () => {
    expect(renderToString(<Dishes defaultValue="steak" />)).toMatch(/cck-select__value[^>]*>steak</);
    expect(renderToString(<Dishes defaultValue="steak" itemToStringLabel={(value) => value.toUpperCase()} />)).toMatch(
      /cck-select__value[^>]*>STEAK</,
    );
  });

  it('renders the first value and the count of a multiple Select with a search, and no list', () => {
    const html = renderToString(
      <Select.Root multiple filter defaultValue={['Cake', 'Pizza', 'Steak']}>
        <Select.Trigger aria-label="Dishes">
          <Select.Value placeholder="Choose" />
          <Select.Count />
          <Select.Icon />
        </Select.Trigger>
        <Select.Content>
          <Select.Header>
            <Select.Search />
          </Select.Header>
          <Opt value="Cake">Cake</Opt>
          <Select.Empty>No dish</Select.Empty>
          <Select.Footer>Actions</Select.Footer>
        </Select.Content>
      </Select.Root>,
    );
    expect(html).toContain('<span class="cck-select__count">+2</span>');
    expect(html).toMatch(/cck-select__value[^>]*>Cake</);
    expect(html).not.toContain('aria-activedescendant');
    expect(html).not.toContain('cck-select__search');
    expect(html).not.toContain('cck-select__footer');
  });
});
