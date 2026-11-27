// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { accordionAnatomy, accordionMeta } from '@cocokits/machines/accordion';
import { undeclaredData } from '../../internal/tests/declared-data';
import { accordionView, mountView } from './fixtures';

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('Accordion accessibility (axe)', () => {
  it('has no violations closed, open, with a disabled item and when it cannot collapse', async () => {
    const { container } = mountView(accordionView({ returns: { disabled: true } }));
    await nextTick();
    expect((await axe(container)).violations).toEqual([]);
    await userEvent.click(screen.getByRole('button', { name: 'Shipping' }));
    expect((await axe(container)).violations).toEqual([]);
    expect(screen.getByRole('button', { name: 'Shipping' }).getAttribute('aria-disabled')).toBe('true');
  });

  it('has no violations when multiple', async () => {
    const { container } = mountView(
      accordionView({ root: { type: 'multiple', defaultValue: ['shipping', 'returns'] } }),
    );
    await nextTick();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('follows the APG accordion pattern: a heading with one button and a region named by it', async () => {
    mountView(accordionView({ root: { defaultValue: 'shipping' } }));
    await nextTick();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(screen.getByRole('region', { name: 'Shipping' })).toBeTruthy();
    expect(accordionMeta.roles).toMatchObject({ content: 'region' });
    expect(accordionMeta.apg).toContain('/patterns/accordion/');
  });
});

describe('Accordion data attributes', () => {
  it('emits only the data-* the meta declares on each part', () => {
    mountView(accordionView({ root: { defaultValue: 'shipping', disabled: true } }));
    const { undeclared, found } = undeclaredData(accordionAnatomy.classes, accordionMeta.dataAttrs);
    expect(found).toEqual(expect.arrayContaining(['root', 'item', 'header', 'trigger', 'content']));
    expect(undeclared).toEqual([]);
  });
});
