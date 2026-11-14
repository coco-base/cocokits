// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, type VNode } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { mountView } from '../../internal/tests/mount-helpers';
import { Chip } from '../index';

afterEach(cleanup);

describe('Chip accessibility', () => {
  it.each<[string, () => VNode]>([
    ['a removable chip', () => h(Chip, { removable: true }, () => 'Pizza')],
    ['a plain chip', () => h(Chip, null, () => 'Pizza')],
    ['a disabled removable chip', () => h(Chip, { removable: true, disabled: true }, () => 'Pizza')],
    [
      'a chip with a longer name',
      () => h(Chip, { removable: true }, () => ['Pizza', h('span', { hidden: true }, ' remove')]),
    ],
  ])('has no axe violations: %s', async (_name, ui) => {
    const { container } = mountView(ui);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('names the button by the text of the chip and reaches it with Tab', async () => {
    mountView(() => h(Chip, { removable: true }, () => 'Pizza'));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Pizza' }));
  });

  it('skips a disabled button when tabbing', async () => {
    mountView(() => h(Chip, { removable: true, disabled: true }, () => 'Pizza'));
    await userEvent.tab();
    expect(document.activeElement).toBe(document.body);
  });
});
