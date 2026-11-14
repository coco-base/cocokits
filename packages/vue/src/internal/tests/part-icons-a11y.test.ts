// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from '../../accordion';
import { Checkbox } from '../../checkbox';
import { selectRoot, stubOverlayBrowser } from '../../select/tests/fixtures';
import { mountView } from './mount-helpers';
import { themed } from './part-icon-fixtures';

beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const accordion = (): VNode =>
  h(AccordionRoot, { defaultValue: 'a' }, () =>
    h(AccordionItem, { value: 'a' }, () => [
      h(AccordionHeader, null, () => h(AccordionTrigger, null, () => 'Shipping')),
      h(AccordionContent, null, () => 'Rates'),
    ]),
  );

describe('part icons accessibility (axe)', () => {
  it.each<[string, () => VNode | VNode[]]>([
    ['Select with the theme chevron', () => selectRoot({ modelValue: 'Cake' })],
    ['Accordion with the theme chevron', accordion],
    ['checked Checkbox with the theme tick', () => h(Checkbox, { modelValue: true }, () => 'Terms')],
  ])('has no violations: %s', async (_name, make) => {
    const { container } = mountView(themed(make));
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
