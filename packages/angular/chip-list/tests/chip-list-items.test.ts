import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { chipAnatomy } from '@cocokits/machines/chip';
import { describe, expect, it } from 'vitest';
import { CckChipListImports, type ChipListChangeDetails, type ChipListEntry } from '../index';

const { classes } = chipAnatomy;

@Component({
  imports: [...CckChipListImports],
  template: `<cck-chip-list aria-label="Dishes" [(value)]="value" (valueChangeDetails)="seen.push($event)" />`,
})
class Host {
  readonly value = signal<readonly ChipListEntry[]>([
    'Pizza',
    { value: 'Steak', removable: false },
    { value: 'Burger', selected: false },
    { value: 'Salad', disabled: true, selected: true },
  ]);
  readonly seen: ChipListChangeDetails[] = [];
}

const chips = (container: Element): Element[] => Array.from(container.querySelectorAll('cck-chip'));
const removeOf = (chip: Element | undefined): Element | null => chip?.querySelector(`.${classes.remove}`) ?? null;

describe('Chip list entries', () => {
  it('renders the facts of each entry: removable, selectable, disabled', async () => {
    const { container } = await render(Host);
    const rows = chips(container).map((chip) => ({
      text: chip.textContent.trim(),
      remove: removeOf(chip) !== null,
      toggle: chip.querySelector(`button.${classes.contentWrapper}`) !== null,
      pressed: chip.querySelector(`.${classes.contentWrapper}`)?.getAttribute('aria-pressed') ?? null,
      disabled: chip.hasAttribute('data-disabled'),
    }));
    expect(rows).toEqual([
      { text: 'Pizza', remove: true, toggle: false, pressed: null, disabled: false },
      { text: 'Steak', remove: false, toggle: false, pressed: null, disabled: false },
      { text: 'Burger', remove: true, toggle: true, pressed: 'false', disabled: false },
      { text: 'Salad', remove: false, toggle: true, pressed: 'true', disabled: true },
    ]);
  });

  it('toggles a selectable chip, replaces the item and reports the reason toggle', async () => {
    const { fixture } = await render(Host);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Burger' }));
    const host = fixture.componentInstance;
    expect(host.value()[2]).toEqual({ value: 'Burger', selected: true });
    expect(host.seen).toHaveLength(1);
    expect(host.seen[0]).toMatchObject({ reason: 'toggle' });
    expect(screen.getByRole('button', { name: 'Burger' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('does not toggle a disabled chip', async () => {
    const { fixture } = await render(Host);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Salad' }));
    expect(fixture.componentInstance.seen).toEqual([]);
  });

  it('removes only the entry whose button was pressed and keeps the items', async () => {
    const { fixture } = await render(Host);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Remove Pizza' }));
    expect(fixture.componentInstance.value().map((entry) => (typeof entry === 'string' ? entry : entry.value))).toEqual(
      ['Steak', 'Burger', 'Salad'],
    );
  });

  const keyRows = [
    {
      name: 'Backspace on a middle chip',
      start: 'Burger',
      key: '{Backspace}',
      left: ['Pizza', 'Steak', 'Salad'],
      focus: 'Remove Pizza',
    },
    {
      name: 'Delete on the first chip',
      start: 'Remove Pizza',
      key: '{Delete}',
      left: ['Steak', 'Burger', 'Salad'],
      focus: 'Burger',
    },
  ];
  it.each(keyRows)('$name removes the chip and moves the focus', async ({ start, key, left, focus }) => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    screen.getByRole('button', { name: start }).focus();
    await user.keyboard(key);
    await waitFor(() => {
      expect(
        fixture.componentInstance.value().map((entry) => (typeof entry === 'string' ? entry : entry.value)),
      ).toEqual(left);
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: focus }));
    });
  });

  it('does not remove a chip that is not removable or is disabled with Backspace', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    screen.getByRole('button', { name: 'Salad' }).focus();
    await user.keyboard('{Backspace}');
    expect(fixture.componentInstance.value()).toHaveLength(4);
  });

  it('moves the focus to the last chip with a focus stop on Backspace in an empty text box, and leaves text alone', async () => {
    const user = userEvent.setup();
    await render(Host);
    const input = screen.getByRole('textbox');
    input.focus();
    await user.keyboard('ab{Backspace}{Backspace}');
    expect(document.activeElement).toBe(input);
    await user.keyboard('{Backspace}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Burger' }));
  });

  it('puts the focus on the text box after the last chip with a stop is removed by Delete', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(`<cck-chip-list aria-label="Dishes" [(value)]="value" />`, {
      imports: [...CckChipListImports],
      componentProperties: { value: ['Pizza'] },
    });
    expect(fixture).toBeTruthy();
    screen.getByRole('button', { name: 'Remove Pizza' }).focus();
    await user.keyboard('{Delete}');
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('textbox'));
    });
  });
});
