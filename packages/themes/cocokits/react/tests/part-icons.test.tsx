// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Accordion, Checkbox, Select } from '../src/index';
import { themed } from './helpers';

afterEach(cleanup);

const names = (element: Element | null): (string | null)[] =>
  [...(element?.querySelectorAll('.cck-svg-icon') ?? [])].map((icon) => icon.getAttribute('data-icon-name'));

describe('part icons under the cocokits theme', () => {
  it('draws chevron-down in the Select dropdown icon', () => {
    const { container } = render(
      themed(
        <Select.Root>
          <Select.Trigger aria-label="Dish">
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
        </Select.Root>,
      ),
    );
    expect(names(container.querySelector('.cck-select__dropdown-icon'))).toEqual(['chevron-down']);
  });

  it('draws chevron-down in the Accordion indicator, last in the trigger', () => {
    const { container } = render(
      themed(
        <Accordion.Root type="single">
          <Accordion.Item value="a">
            <Accordion.Header>
              <Accordion.Trigger>Shipping</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Two days.</Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>,
      ),
    );
    const indicator = container.querySelector('[aria-expanded]')?.lastElementChild ?? null;
    expect(indicator?.className).toBe('cck-accordion__indicator');
    expect(names(indicator)).toEqual(['chevron-down']);
  });

  it('draws the check in the Checkbox background while checked', () => {
    const { container } = render(themed(<Checkbox defaultChecked>Accept</Checkbox>));
    expect(names(container.querySelector('.cck-checkbox__background'))).toEqual(['check']);
  });
});
