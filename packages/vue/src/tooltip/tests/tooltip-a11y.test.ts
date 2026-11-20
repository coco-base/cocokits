// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { tooltipAnatomy, tooltipMeta } from '@cocokits/machines/tooltip';
import { undeclaredData } from '../../internal/tests/declared-data';
import {
  accessibleDescription,
  mountView,
  settle,
  shownContent,
  stubOverlayBrowser,
  tooltipDescription,
  tooltipView,
} from './fixtures';

// A tooltip is no landmark: the page-level `region` rule asks for a landmark around every text outside one,
// which a component test without a page cannot have. Every other rule runs.
const noPageLandmarks = { rules: { region: { enabled: false } } };

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Tooltip accessibility (axe)', () => {
  it('has no violations closed', async () => {
    mountView(tooltipView({}));
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('has no violations open, and describes the trigger by the hidden description', async () => {
    mountView(tooltipView({}));
    await userEvent.tab();
    await userEvent.tab();
    await settle();
    const content = shownContent();
    const trigger = screen.getByRole('button', { name: 'Copy link' });
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltipDescription()?.id);
    expect(accessibleDescription(trigger)).toBe('Copy the link');
    expect(content.getAttribute('aria-hidden')).toBe('true');
    expect(content.hasAttribute('tabindex')).toBe(false);
    expect((await axe(document.body, noPageLandmarks)).violations).toEqual([]);
  });

  it('has no violations for a tooltip that starts open', async () => {
    mountView(tooltipView({ rootProps: { open: true } }));
    await settle();
    expect((await axe(document.body, noPageLandmarks)).violations).toEqual([]);
  });

  it('renders the roles and data attributes the meta declares', async () => {
    mountView(tooltipView({ rootProps: { open: true } }));
    await settle();
    const content = shownContent();
    expect(tooltipMeta.roles.content).toBe(content.getAttribute('role'));
    for (const attribute of tooltipMeta.dataAttrs.content) expect(content.hasAttribute(attribute)).toBe(true);
    const trigger = screen.getByRole('button', { name: 'Copy link' });
    for (const attribute of tooltipMeta.dataAttrs.trigger) expect(trigger.hasAttribute(attribute)).toBe(true);
  });
});

describe('Tooltip data attributes', () => {
  it('emits only the data-* the meta declares on each part', async () => {
    mountView(tooltipView({ rootProps: { open: true } }));
    await settle();
    const { undeclared, found } = undeclaredData(tooltipAnatomy.classes, tooltipMeta.dataAttrs);
    expect(found).toEqual(expect.arrayContaining(['trigger', 'content']));
    expect(undeclared).toEqual([]);
  });
});
