// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { accordionMeta } from '@cocokits/machines/accordion';
import { must } from '../../internal/tests/choice-fixtures';
import { drawnIconsIn, withPartIcons } from '../../internal/tests/part-icon-fixtures';
import { Accordion, type AccordionRenderProps } from '../index';
import { trigger } from './fixtures';

afterEach(cleanup);

/** One item whose trigger is rendered by the form under test. */
const item = (
  rendered: ReactElement | ((props: AccordionRenderProps) => ReactElement),
  nativeButton = true,
): ReactElement => (
  <Accordion.Root type="single" collapsible>
    <Accordion.Item value="a">
      <Accordion.Header>
        <Accordion.Trigger nativeButton={nativeButton} render={rendered}>
          Shipping
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>Orders leave in two days.</Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>
);

const plain = (
  <Accordion.Root type="single" collapsible>
    <Accordion.Item value="a">
      <Accordion.Header>
        <Accordion.Trigger>Shipping</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>Orders leave in two days.</Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>
);

const forms: readonly [string, ReactElement][] = [
  ['no render', plain],
  ['render element', item(<button />)],
  ['render element with its own children', item(<button>Own </button>)],
  ['render function', item((props) => <button {...props} />)],
  ['render function that sets its own children', item((props) => <button {...props}>Own</button>)],
  ['render element, link', item(<a href="#a" />, false)],
];

describe('Accordion indicator', () => {
  it.each(forms)('is the last child of the trigger, holds the theme icon and is hidden: %s', (_form, ui) => {
    render(withPartIcons(ui));
    const button = must(screen.getByText(/Shipping|Own/).closest<HTMLElement>('[aria-expanded]'));
    const last = must(button.lastElementChild) as HTMLElement;
    expect(last.className).toBe('cck-accordion__indicator');
    expect(last.tagName).toBe(accordionMeta.defaultElements?.indicator?.toUpperCase());
    expect(last.getAttribute('aria-hidden')).toBe('true');
    expect(last.hasAttribute('data-state')).toBe(false);
    expect(drawnIconsIn(last)).toEqual(['chevron-down']);
    expect(button.querySelectorAll('.cck-accordion__indicator')).toHaveLength(1);
  });

  it('keeps the accessible name of the trigger', () => {
    render(withPartIcons(plain));
    expect(trigger('Shipping')).toBeTruthy();
  });

  it('keeps the own children of the rendered element, which win, before the indicator', () => {
    render(withPartIcons(item(<button>Own </button>)));
    const button = screen.getByRole('button');
    expect(button.firstChild?.textContent).toBe('Own ');
    expect(button.lastElementChild?.className).toBe('cck-accordion__indicator');
    expect(button.childNodes).toHaveLength(2);
  });

  it('is always rendered, open or closed, and the open state stays on the trigger', async () => {
    render(withPartIcons(plain));
    const button = trigger('Shipping');
    expect(button.querySelectorAll('.cck-accordion__indicator')).toHaveLength(1);
    expect(button.getAttribute('data-state')).toBe('closed');
    await userEvent.setup().click(button);
    expect(button.getAttribute('data-state')).toBe('open');
    expect(button.querySelectorAll('.cck-accordion__indicator')).toHaveLength(1);
    expect(drawnIconsIn(button)).toEqual(['chevron-down']);
  });

  it('draws the default chevron without a theme', () => {
    render(plain);
    const indicator = trigger('Shipping').querySelector('.cck-accordion__indicator');
    expect(drawnIconsIn(indicator)).toEqual(['chevron-down']);
  });
});

describe('Accordion indicator and keys', () => {
  it.each<[string, ReactElement]>([
    [
      'text and an icon in the element',
      item(
        <button>
          Own <i />
        </button>,
      ),
    ],
    ['an array of children in the function form', item((props) => <button {...props}>{[<b key="a" />, 'x']}</button>)],
    [
      'text and an icon as the trigger children',
      <Accordion.Root type="single" collapsible>
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger>
              Shipping <i />
            </Accordion.Trigger>
          </Accordion.Header>
        </Accordion.Item>
      </Accordion.Root>,
    ],
    [
      'children made with createElement, no key',
      item(createElement('button', null, 'Own ', createElement('i'), createElement('b'))),
    ],
  ])('logs no missing-key warning: %s', (_form, ui) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(withPartIcons(ui));
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
