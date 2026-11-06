// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { Select } from '../src/index';
import { html } from './helpers';

describe('theme select on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the size on the root, the placeholder and no list', () => {
    const markup = html(
      <Select.Root size="lg">
        <Select.Trigger aria-label="Dish">
          <Select.Value placeholder="Choose a dish" />
          <Select.Icon />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="Cake">
            <Select.ItemIndicator />
            <Select.ItemText>Cake</Select.ItemText>
          </Select.Item>
        </Select.Content>
      </Select.Root>,
    );
    expect(/<div[^>]*cck-select"[^>]*>/.exec(markup)?.[0] ?? '').toContain('data-size="lg"');
    expect(markup).toContain('Choose a dish');
    expect(markup).not.toContain('role="listbox"');
  });

  it('renders the label of the selected value from items on the server', () => {
    const markup = html(
      <Select.Root defaultValue="cake" items={{ cake: 'Cake' }}>
        <Select.Trigger aria-label="Dish">
          <Select.Value placeholder="Choose a dish" />
        </Select.Trigger>
      </Select.Root>,
    );
    expect(markup).toMatch(/cck-select__value[^>]*>Cake</);
  });
});
