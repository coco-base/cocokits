import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports } from '../index';
import { must, trigger } from './helpers';
import { stubOverlayApis } from './overlay-stubs';

const TEMPLATE = `<form ngNativeValidate (submit)="$event.preventDefault()">
  <div cckSelect aria-label="Dish" name="dish" required [invalid]="invalid" aria-describedby="own">
    <div cckSelectOption value="Cake">Cake</div>
  </div>
  <p id="own">Pick one</p>
</form>`;

const root = (): Element => must(trigger().closest('.cck-select'));
const described = (): string =>
  (trigger().getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent.trim() ?? '')
    .join('|');

describe('Select invalid state after a blocked submit', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function submitEmpty(invalid = false): Promise<HTMLFormElement> {
    const { container } = await render(TEMPLATE, { imports: [...CckSelectImports], componentProperties: { invalid } });
    expect(trigger().hasAttribute('aria-invalid')).toBe(false);
    const form = must(container.querySelector<HTMLFormElement>('form'));
    form.requestSubmit();
    await waitFor(() => {
      expect(trigger().getAttribute('aria-invalid')).toBe('true');
    });
    return form;
  }

  it('marks the trigger and the root and describes the trigger by the validation message', async () => {
    await submitEmpty();
    expect(root().hasAttribute('data-invalid')).toBe(true);
    const message = must(document.querySelector<HTMLInputElement>('input[name="dish"]')).validationMessage;
    expect(message).not.toBe('');
    expect(described()).toBe(`Pick one|${message}`);
  });

  it('clears the state when a value is chosen', async () => {
    await submitEmpty();
    const user = userEvent.setup();
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    await waitFor(() => {
      expect(trigger().hasAttribute('aria-invalid')).toBe(false);
    });
    expect(root().hasAttribute('data-invalid')).toBe(false);
    expect(described()).toBe('Pick one');
  });

  it('clears the state on a form reset', async () => {
    const form = await submitEmpty();
    form.reset();
    await waitFor(() => {
      expect(trigger().hasAttribute('aria-invalid')).toBe(false);
    });
    expect(root().hasAttribute('data-invalid')).toBe(false);
    expect(described()).toBe('Pick one');
  });

  it('keeps a consumer invalid prop after the flag clears', async () => {
    const form = await submitEmpty(true);
    form.reset();
    await waitFor(() => {
      expect(described()).toBe('Pick one');
    });
    expect(root().hasAttribute('data-invalid')).toBe(true);
  });
});
