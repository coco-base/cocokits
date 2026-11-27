// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Radio } from '../../radio';
import { RadioGroup } from '../../radio-group';
import { Dialog } from '../index';
import { button, stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

/** A dialog whose first control is a RadioGroup with the second radio checked. */
function PlanDialog({ defaultOpen }: { readonly defaultOpen?: boolean }): ReactElement {
  return (
    <StrictMode>
      <Dialog.Root defaultOpen={defaultOpen}>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Plan</Dialog.Title>
          <RadioGroup aria-label="Plan" defaultValue="pro">
            <Radio value="free">Free</Radio>
            <Radio value="pro">Pro</Radio>
          </RadioGroup>
          <Dialog.Close>Cancel</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    </StrictMode>
  );
}

describe('Dialog first focus', () => {
  it('focuses the checked radio of a group, not the first radio', async () => {
    render(<PlanDialog />);
    await userEvent.click(button('Open'));
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Pro' }));
  });

  it('does not scroll the page when a dialog starts open', () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    render(<PlanDialog defaultOpen />);
    const pro = screen.getByRole('radio', { name: 'Pro' });
    expect(document.activeElement).toBe(pro);
    expect(focus.mock.contexts.at(-1)).toBe(pro);
    expect(focus.mock.lastCall).toEqual([{ preventScroll: true }]);
  });
});
