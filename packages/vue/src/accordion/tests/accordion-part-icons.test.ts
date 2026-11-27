// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, type Component, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { accordionMeta } from '@cocokits/machines/accordion';
import {
  customPartIconsThemeConfig,
  drawnIconsIn,
  missingPartIconsThemeConfig,
  noPartIconsThemeConfig,
  themed,
} from '../../internal/tests/part-icon-fixtures';
import { AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from '../index';
import { must } from '../../internal/tests/choice-helpers';
import { pick } from '../../internal/tests/mount-helpers';
import { mountView } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const accordion = (trigger: () => VNode): VNode =>
  h(AccordionRoot, null, () =>
    h(AccordionItem, { value: 'a' }, () => h(AccordionHeader, null, () => h(trigger as Component))),
  );

const triggerElement = (): HTMLElement => screen.getByRole('button');

/** The ways to render the trigger: its own button, a given element, and a merged child (`asChild`, `as="template"`). */
const forms: readonly [string, () => VNode, string][] = [
  ['its own button', () => h(AccordionTrigger, null, () => 'Shipping'), 'BUTTON'],
  ['as="a"', () => h(AccordionTrigger, { as: 'a' }, () => 'Shipping'), 'A'],
  [
    'asChild with a button',
    () => h(AccordionTrigger, { asChild: true }, () => h('button', { class: 'mine' }, 'Shipping')),
    'BUTTON',
  ],
  [
    'asChild with a link and an icon of its own',
    () => h(AccordionTrigger, { asChild: true }, () => h('a', { href: '#x' }, [h('i', 'a'), 'Shipping'])),
    'A',
  ],
  ['as="template"', () => h(AccordionTrigger, { as: 'template' }, () => h('button', 'Shipping')), 'BUTTON'],
];

describe.each(forms)('Accordion indicator with the trigger as %s', (_form, trigger, tag) => {
  it('is the last child of the trigger and holds the theme chevron', () => {
    mountView(themed(() => accordion(trigger)));
    const element = pick(document.body, '.cck-accordion__trigger');
    expect(element.tagName).toBe(tag);
    const last = must(element.lastElementChild);
    expect(last.className).toBe('cck-accordion__indicator');
    expect(last.tagName).toBe(accordionMeta.defaultElements?.indicator?.toUpperCase());
    expect(last.getAttribute('aria-hidden')).toBe('true');
    expect(drawnIconsIn(last)).toEqual(['chevron-down']);
    expect(element.querySelectorAll('.cck-accordion__indicator')).toHaveLength(1);
  });

  it('keeps the accessible name of the trigger', () => {
    mountView(themed(() => accordion(trigger)));
    const element = pick(document.body, '.cck-accordion__trigger');
    // The indicator is hidden and has no text, so the name comes from the label alone.
    expect(element.querySelector('.cck-accordion__indicator')?.textContent).toBe('');
    if (tag === 'BUTTON') expect(screen.getByRole('button', { name: 'Shipping' })).toBe(element);
  });

  const rows: readonly [string, Parameters<typeof themed>[1] | undefined, string, boolean][] = [
    ['no theme', undefined, 'chevron-down', false],
    ['a theme that names none', noPartIconsThemeConfig, 'chevron-down', false],
    ['a theme icon the registry has', customPartIconsThemeConfig, 'arrow-up', false],
    ['a theme icon the registry lacks', missingPartIconsThemeConfig, 'chevron-down', true],
  ];
  it.each(rows)('draws the icon of the fallback order with %s', (_name, config, expected, logs) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mountView(config ? themed(() => accordion(trigger), config) : () => accordion(trigger));
    const last = must(pick(document.body, '.cck-accordion__trigger').lastElementChild);
    expect(last.className).toBe('cck-accordion__indicator');
    expect(drawnIconsIn(last)).toEqual([expected]);
    const messages = error.mock.calls.map((call) => String(call[0]));
    expect(messages.some((message) => message.includes('"nope"') && message.includes('indicator'))).toBe(logs);
    if (!logs) expect(error).not.toHaveBeenCalled();
  });
});

describe('Accordion indicator', () => {
  it('stays in the trigger when the item opens and closes', async () => {
    mountView(themed(() => accordion(() => h(AccordionTrigger, null, () => 'Shipping'))));
    await userEvent.click(triggerElement());
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true');
    expect(drawnIconsIn(triggerElement().lastElementChild)).toEqual(['chevron-down']);
    await userEvent.click(triggerElement());
    expect(triggerElement().lastElementChild?.className).toBe('cck-accordion__indicator');
  });
});
