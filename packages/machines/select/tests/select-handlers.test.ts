import { describe, expect, it, vi } from 'vitest';
import { getSelectProps, selectIds, selectKeymap, selectMeta, type SelectEvent } from '../index';
import { base, burger, event, key, opened, pizza } from './fixtures';

describe('handlers', () => {
  it('send the trigger click, and nothing when a consumer vetoed it', () => {
    const send = vi.fn();
    const click = new Event('click', { cancelable: true });
    getSelectProps(base(), send).trigger.onClick(click);
    expect(send).toHaveBeenCalledWith({ type: 'TRIGGER.CLICK', event: click });
    const vetoed = new Event('click', { cancelable: true });
    vetoed.preventDefault();
    getSelectProps(base(), send).trigger.onClick(vetoed);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('send option click and pointer move, but not for a disabled option', () => {
    const send = vi.fn<(sent: SelectEvent) => void>();
    const parts = getSelectProps(opened(), send);
    const click = new Event('click', { cancelable: true });
    parts.option(burger).onClick(click);
    parts.option(burger).onPointerMove(event);
    parts.option(pizza).onClick(click);
    parts.option(pizza).onPointerMove(event);
    expect(send.mock.calls.map(([sent]) => sent)).toEqual([
      { type: 'OPTION.CLICK', key: 'burger', event: click },
      { type: 'OPTION.POINTER_MOVE', key: 'burger', event },
    ]);
  });

  it('ignore a blur that is the window losing focus: the trigger is still the active element', () => {
    const send = vi.fn();
    const trigger: { ownerDocument?: { activeElement: unknown } } = {};
    trigger.ownerDocument = { activeElement: trigger };
    const stay = Object.defineProperty(new Event('blur'), 'target', { value: trigger });
    getSelectProps(opened(), send).trigger.onBlur(stay as FocusEvent);
    expect(send).not.toHaveBeenCalled();
    const moved = Object.defineProperty(new Event('blur'), 'target', {
      value: { ownerDocument: { activeElement: {} } },
    });
    getSelectProps(opened(), send).trigger.onBlur(moved as FocusEvent);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('send a dismissal with reason blur when the open trigger loses focus, and nothing when closed', () => {
    const send = vi.fn();
    const blur = new Event('blur');
    getSelectProps(opened(), send).trigger.onBlur(blur as FocusEvent);
    expect(send).toHaveBeenCalledWith({ type: 'LIST.DISMISS', reason: 'blur', event: blur });
    send.mockClear();
    getSelectProps(base(), send).trigger.onBlur(blur as FocusEvent);
    expect(send).not.toHaveBeenCalled();
  });

  it('stop the click a Space key up would raise', () => {
    const up = key(' ');
    getSelectProps(base(), vi.fn()).trigger.onKeyUp(up);
    expect(up.defaultPrevented).toBe(true);
    const other = key('a');
    getSelectProps(base(), vi.fn()).trigger.onKeyUp(other);
    expect(other.defaultPrevented).toBe(false);
  });
});

describe('meta', () => {
  it('links the APG pattern and declares roles and default elements', () => {
    expect(selectMeta.apg).toBe('https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/');
    expect(selectMeta.roles).toMatchObject({
      trigger: 'combobox',
      content: 'listbox',
      option: 'option',
      optionGroup: 'group',
    });
    expect(selectMeta.defaultElements).toMatchObject({ root: 'div', trigger: 'button', content: 'div', option: 'div' });
  });

  it('agrees with the keymap in both directions', () => {
    const metaKeys = selectMeta.keyboard.map((row) => row.key);
    for (const binding of selectKeymap) expect(metaKeys).toContain(binding.row);
    const handled = new Set(selectKeymap.map((binding) => binding.row));
    for (const row of selectMeta.keyboard) expect(handled.has(row.key)).toBe(true);
  });

  it('describes the form contract', () => {
    expect(selectMeta.form).toContain('hidden');
  });
});

describe('blocked submit', () => {
  it('gives the message element an id of the Select ids', () => {
    expect(selectIds('s1').validationMessage).toBe('s1-validation');
    expect(selectIds('s1', 'ctl').validationMessage).toBe('s1-validation');
    expect(getSelectProps(base(), vi.fn()).validationMessage).toEqual({ id: 's1-validation' });
  });

  it('marks the Select invalid and submitted, and describes the trigger by the message', () => {
    const parts = getSelectProps(base({ blockedSubmit: true, ariaDescribedBy: 'hint' }), vi.fn());
    expect(parts.trigger['aria-invalid']).toBe('true');
    expect(parts.root['data-invalid']).toBe('');
    expect(parts.trigger['aria-describedby']).toBe('hint s1-validation');
    expect(parts.control).toMatchObject({ invalid: true, submitted: true });
  });

  it('puts the message before the ids of the field hints', () => {
    const parts = getSelectProps(base({ blockedSubmit: true, ariaDescribedBy: 'hint' }), vi.fn(), {
      ids: { control: 'ctl', feedback: 'fb', label: 'lb', hints: ['fh'] },
    });
    expect(parts.trigger['aria-describedby']).toBe('hint s1-validation fh');
  });

  it('changes nothing without a blocked submit', () => {
    const parts = getSelectProps(base({ ariaDescribedBy: 'hint' }), vi.fn());
    expect(parts.trigger['aria-invalid']).toBeUndefined();
    expect(parts.root['data-invalid']).toBeUndefined();
    expect(parts.trigger['aria-describedby']).toBe('hint');
  });

  it('keeps a consumer invalid on', () => {
    const parts = getSelectProps(base({ invalid: true, blockedSubmit: false }), vi.fn());
    expect(parts.root['data-invalid']).toBe('');
  });
});

describe('kept content', () => {
  it('hides a closed list that stays mounted, and only that', () => {
    expect(getSelectProps(opened(), vi.fn()).content.hidden).toBeUndefined();
    const kept = getSelectProps(base({ mounted: true, keptClosed: true }), vi.fn()).content;
    expect(kept).toMatchObject({ hidden: true, 'data-state': 'closed' });
    expect(getSelectProps(base({ mounted: true }), vi.fn()).content.hidden).toBeUndefined();
  });
});
