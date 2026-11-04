// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { popoverAnatomy, popoverMeta } from '@cocokits/machines/popover';
import { undeclaredData } from '../../internal/tests/declared-data';
import { mountView, popoverView, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Popover accessibility (axe)', () => {
  it('has no violations closed', async () => {
    mountView(popoverView({}));
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('has no violations open, with the host and the guards in the document', async () => {
    mountView(popoverView({}));
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    await settle();
    expect(screen.queryByRole('dialog')).not.toBeNull();
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('has no violations for a popover that starts open', async () => {
    mountView(popoverView({ rootProps: { open: true } }));
    await settle();
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('renders the roles and data attributes the meta declares', async () => {
    mountView(popoverView({}));
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    await settle();
    const content = screen.getByRole('dialog');
    expect(popoverMeta.roles.content).toBe(content.getAttribute('role'));
    for (const attribute of popoverMeta.dataAttrs.content) expect(content.hasAttribute(attribute)).toBe(true);
    const trigger = screen.getByRole('button', { name: 'Share' });
    for (const attribute of popoverMeta.dataAttrs.trigger) expect(trigger.hasAttribute(attribute)).toBe(true);
  });
});

describe('Popover data attributes', () => {
  it('emits only the data-* the meta declares on each part', async () => {
    mountView(popoverView({}));
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    await settle();
    const { undeclared, found } = undeclaredData(popoverAnatomy.classes, popoverMeta.dataAttrs);
    expect(found).toEqual(expect.arrayContaining(['trigger', 'content', 'close']));
    expect(undeclared).toEqual([]);
  });
});
