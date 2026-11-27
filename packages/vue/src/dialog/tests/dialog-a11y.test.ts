// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { dialogAnatomy, dialogMeta } from '@cocokits/machines/dialog';
import { undeclaredData } from '../../internal/tests/declared-data';
import { dialogView, mountView, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

describe('Dialog accessibility (axe)', () => {
  it('has no violations closed', async () => {
    mountView(dialogView({}));
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('has no violations open, with the host in the document', async () => {
    mountView(dialogView({}));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await settle();
    expect(screen.queryByRole('dialog')).not.toBeNull();
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('has no violations for a dialog that starts open', async () => {
    mountView(dialogView({ rootProps: { open: true } }));
    await settle();
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('is a native dialog named by its Title and described by its Description (APG modal dialog)', async () => {
    mountView(dialogView({}));
    const trigger = screen.getByRole('button', { name: 'Delete' });
    await userEvent.click(trigger);
    await settle();
    const content = screen.getByRole('dialog', { name: 'Delete project', description: 'This cannot be undone.' });
    expect(content.localName).toBe(dialogMeta.defaultElements?.content);
    expect(dialogMeta.roles.content).toBeNull();
    expect(content.hasAttribute('role')).toBe(false);
    for (const attribute of dialogMeta.dataAttrs.content) expect(content.hasAttribute(attribute)).toBe(true);
    for (const attribute of dialogMeta.dataAttrs.trigger) expect(trigger.hasAttribute(attribute)).toBe(true);
  });
});

describe('Dialog data attributes', () => {
  it('emits only the data-* the meta declares on each part', async () => {
    mountView(dialogView({}));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await settle();
    const { undeclared, found } = undeclaredData(dialogAnatomy.classes, dialogMeta.dataAttrs);
    expect(found).toEqual(expect.arrayContaining(['trigger', 'content', 'title', 'description', 'close']));
    // `data-modal` is the stub of `showModal()` in jsdom, not an output of the component.
    expect(undeclared.filter((name) => name !== 'content: data-modal')).toEqual([]);
  });
});
