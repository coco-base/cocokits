import { describe, expect, it, vi } from 'vitest';
import { formFieldIds } from '../../form-field';
import {
  getSelectPreviewValues,
  getSelectProps,
  itemLabel,
  getSelectValueText,
  isSelectEmpty,
  selectAnatomy,
  selectFormValues,
  selectIds,
  selectItemId,
  selectKeymap,
  selectMeta,
  selectOptionId,
  valueToFormString,
  type SelectEvent,
  type SelectItem,
  type SelectState,
} from '../index';
import { base, burger, cake, dataKeys, event, key, opened, pizza, steak } from './fixtures';

describe('classes', () => {
  it('renders the part classes', () => {
    const parts = getSelectProps(opened(), vi.fn());
    expect(selectAnatomy.classes).toMatchObject({
      root: 'cck-select',
      trigger: 'cck-select__trigger',
      placeholder: 'cck-select__placeholder',
      value: 'cck-select__value',
      dropdownIcon: 'cck-select__dropdown-icon',
      content: 'cck-select__content',
      option: 'cck-select__option',
      optionIndicator: 'cck-select__option-indicator',
      optionContent: 'cck-select__option-content',
      optionGroup: 'cck-select__option-group',
      optionGroupLabel: 'cck-select__option-group-label',
    });
    expect(parts.root.class).toBe('cck-select');
    expect(parts.trigger.class).toBe('cck-select__trigger');
    expect(parts.placeholder.class).toBe('cck-select__placeholder');
    expect(parts.value.class).toBe('cck-select__value');
    expect(parts.dropdownIcon.class).toBe('cck-select__dropdown-icon');
    expect(parts.content.class).toBe('cck-select__content');
    expect(parts.optionIndicator.class).toBe('cck-select__option-indicator');
    expect(parts.optionContent.class).toBe('cck-select__option-content');
    expect(parts.option(cake).class).toBe('cck-select__option');
    expect(parts.optionGroup({ key: 'g' }).class).toBe('cck-select__option-group');
    expect(parts.optionGroupLabel({ key: 'g' }).class).toBe('cck-select__option-group-label');
  });

  it('marks the decorative parts aria-hidden', () => {
    const parts = getSelectProps(base(), vi.fn());
    expect(parts.dropdownIcon['aria-hidden']).toBe('true');
    expect(parts.optionIndicator['aria-hidden']).toBe('true');
  });
});

describe('trigger ARIA (select-only combobox)', () => {
  it('is a button with the combobox role that has a listbox popup', () => {
    expect(getSelectProps(base(), vi.fn()).trigger).toMatchObject({
      type: 'button',
      role: 'combobox',
      'aria-haspopup': 'listbox',
      id: selectIds('s1').trigger,
    });
  });

  it('renders aria-expanded always and aria-controls only while the list is mounted', () => {
    const closed = getSelectProps(base(), vi.fn()).trigger;
    expect(closed['aria-expanded']).toBe('false');
    expect(closed['aria-controls']).toBeUndefined();
    const open = getSelectProps(opened(), vi.fn()).trigger;
    expect(open['aria-expanded']).toBe('true');
    expect(open['aria-controls']).toBe(selectIds('s1').content);
    expect(getSelectProps(base({ mounted: true }), vi.fn()).trigger['aria-controls']).toBe(selectIds('s1').content);
  });

  it('points aria-activedescendant at the highlighted option while open only', () => {
    expect(getSelectProps(opened(), vi.fn()).trigger['aria-activedescendant']).toBe(selectOptionId('s1', 'cake'));
    expect(getSelectProps(base({ highlighted: 'cake' }), vi.fn()).trigger['aria-activedescendant']).toBeUndefined();
    expect(
      getSelectProps(opened({ highlighted: undefined }), vi.fn()).trigger['aria-activedescendant'],
    ).toBeUndefined();
  });

  it('renders the native and ARIA facts', () => {
    const trigger = getSelectProps(base({ disabled: true, readOnly: true, required: true }), vi.fn()).trigger;
    expect(trigger.disabled).toBe(true);
    expect(trigger['aria-readonly']).toBe('true');
    expect(trigger['aria-required']).toBe('true');
    const plain = getSelectProps(base(), vi.fn()).trigger;
    expect(plain.disabled).toBeUndefined();
    expect(plain['aria-readonly']).toBeUndefined();
    expect(plain['aria-required']).toBeUndefined();
  });

  it('gates aria-invalid on touched or submitted, and keeps data-invalid raw', () => {
    expect(getSelectProps(base({ invalid: true }), vi.fn()).trigger['aria-invalid']).toBeUndefined();
    expect(getSelectProps(base({ invalid: true, touched: true }), vi.fn()).trigger['aria-invalid']).toBe('true');
    expect(getSelectProps(base({ invalid: true }), vi.fn()).root['data-invalid']).toBe('');
  });

  it('labels the trigger and the list the same way', () => {
    const parts = getSelectProps(opened({ labelledBy: 'lbl', ariaLabel: 'Dish' }), vi.fn());
    expect(parts.trigger['aria-labelledby']).toBe('lbl');
    expect(parts.content['aria-labelledby']).toBe('lbl');
    expect(parts.trigger['aria-label']).toBe('Dish');
    expect(parts.content['aria-label']).toBe('Dish');
  });

  it('names the list by the label of the field when the author gave no name', () => {
    const ids = formFieldIds('f1');
    expect(getSelectProps(opened(), vi.fn(), { ids }).content['aria-labelledby']).toBe(ids.label);
    expect(getSelectProps(opened({ labelledBy: 'lbl' }), vi.fn(), { ids }).content['aria-labelledby']).toBe('lbl');
    const named = getSelectProps(opened({ ariaLabel: 'Dish' }), vi.fn(), { ids }).content;
    expect(named['aria-labelledby']).toBeUndefined();
    expect(getSelectProps(opened(), vi.fn()).content['aria-labelledby']).toBeUndefined();
  });

  it('uses the control id of a field and adds its feedback id after the author ids', () => {
    const ids = formFieldIds('f1');
    const trigger = getSelectProps(base({ ariaDescribedBy: 'mine' }), vi.fn(), { ids }).trigger;
    expect(trigger.id).toBe(ids.control);
    expect(trigger['aria-describedby']).toBe(`mine ${ids.feedback}`);
    expect(getSelectProps(base(), vi.fn()).trigger['aria-describedby']).toBeUndefined();
  });

  it('lets a field disable, require and invalidate the Select', () => {
    const parts = getSelectProps(base(), vi.fn(), { state: { disabled: true, required: true, invalid: true } });
    expect(parts.trigger.disabled).toBe(true);
    expect(parts.root).toMatchObject({ 'data-disabled': '', 'data-required': '', 'data-invalid': '' });
  });
});

describe('content and options', () => {
  it('renders the listbox role, multiselectable only with multiple, and the placement', () => {
    const single = getSelectProps(opened(), vi.fn()).content;
    expect(single).toMatchObject({
      role: 'listbox',
      'data-state': 'open',
      'data-side': 'bottom',
      'data-align': 'start',
    });
    expect(single['aria-multiselectable']).toBeUndefined();
    expect(single['data-multiple']).toBeUndefined();
    const multiple = getSelectProps(opened({ multiple: true, side: 'top', align: 'end' }), vi.fn()).content;
    expect(multiple).toMatchObject({
      'aria-multiselectable': 'true',
      'data-multiple': '',
      'data-side': 'top',
      'data-align': 'end',
    });
  });

  it('keeps DOM focus on the trigger when the list is pressed', () => {
    const pressed = new Event('mousedown', { cancelable: true });
    getSelectProps(opened(), vi.fn()).content.onMouseDown(pressed);
    expect(pressed.defaultPrevented).toBe(true);
  });

  it('renders role, selection, highlight and disabled on an option', () => {
    const parts = getSelectProps(opened({ value: 'Burger', highlighted: 'burger' }), vi.fn());
    const burgerProps = parts.option(burger);
    expect(burgerProps).toMatchObject({
      role: 'option',
      'aria-selected': 'true',
      'data-selected': '',
      'data-highlighted': '',
    });
    expect(burgerProps.id).toBe(selectOptionId('s1', 'burger'));
    const pizzaProps = parts.option(pizza);
    expect(pizzaProps).toMatchObject({ 'aria-selected': 'false', 'aria-disabled': 'true', 'data-disabled': '' });
    expect(pizzaProps['data-selected']).toBeUndefined();
    expect(pizzaProps['data-highlighted']).toBeUndefined();
  });

  it('selects several options with multiple, and compares object values with isItemEqual', () => {
    const multiple = getSelectProps(opened({ multiple: true, value: ['Cake', 'Steak'] }), vi.fn());
    expect(multiple.option(cake)['aria-selected']).toBe('true');
    expect(multiple.option(steak)['aria-selected']).toBe('true');
    expect(multiple.option(burger)['aria-selected']).toBe('false');
    const first = { key: 'a', value: { id: 1 } };
    const second = { key: 'b', value: { id: 2 } };
    const state: SelectState<{ id: number }> = {
      id: 's1',
      open: true,
      items: [first, second],
      value: { id: 2 },
      isItemEqual: (a, b) => a.id === b.id,
    };
    const parts = getSelectProps(state, vi.fn());
    expect(parts.option(first)['aria-selected']).toBe('false');
    expect(parts.option(second)['aria-selected']).toBe('true');
  });

  it('never lets two option keys share an id', () => {
    expect(selectOptionId('s1', 'a b')).not.toBe(selectOptionId('s1', 'a_b'));
  });

  it('labels a group by its label element', () => {
    const parts = getSelectProps(opened(), vi.fn());
    const group = parts.optionGroup({ key: 'g1', disabled: true });
    const label = parts.optionGroupLabel({ key: 'g1' });
    expect(group).toMatchObject({ role: 'group', 'aria-disabled': 'true', 'data-disabled': '' });
    expect(group['aria-labelledby']).toBe(label.id);
    expect(parts.optionGroup({ key: 'g2' })['aria-disabled']).toBeUndefined();
    expect(parts.optionGroup({ key: 'g1' })['aria-labelledby']).not.toBe(
      parts.optionGroup({ key: 'g2' })['aria-labelledby'],
    );
  });
});

describe('root facts and the value', () => {
  it('renders the state, multiple and placeholder-shown', () => {
    expect(getSelectProps(base(), vi.fn()).root).toMatchObject({
      'data-state': 'closed',
      'data-placeholder-shown': '',
    });
    const filled = getSelectProps(opened({ multiple: true, value: ['Cake'] }), vi.fn()).root;
    expect(filled).toMatchObject({ 'data-state': 'open', 'data-multiple': '' });
    expect(filled['data-placeholder-shown']).toBeUndefined();
    expect(getSelectProps(base(), vi.fn()).trigger['data-state']).toBe('closed');
  });

  it('shows the placeholder for an empty value, including the clearing empty string', () => {
    for (const value of [undefined, null, '']) {
      expect(isSelectEmpty(base({ value }))).toBe(true);
      expect(getSelectProps(base({ value }), vi.fn()).root['data-placeholder-shown']).toBe('');
    }
    expect(isSelectEmpty(base({ value: 'Cake' }))).toBe(false);
    expect(isSelectEmpty(base({ multiple: true, value: [] }))).toBe(true);
    expect(isSelectEmpty(base({ multiple: true, value: ['Cake'] }))).toBe(false);
  });

  it('renders exactly the attributes the meta declares', () => {
    const all = base({
      open: true,
      multiple: true,
      value: [],
      disabled: true,
      readOnly: true,
      required: true,
      invalid: true,
    });
    const parts = getSelectProps(all, vi.fn());
    expect(dataKeys(parts.root)).toEqual([...selectMeta.dataAttrs.root].sort());
    expect(dataKeys(parts.trigger)).toEqual([...selectMeta.dataAttrs.trigger].sort());
    expect(dataKeys(parts.content)).toEqual([...selectMeta.dataAttrs.content].sort());
    const option = getSelectProps(opened({ value: 'Cake' }), vi.fn()).option({ ...cake, disabled: true });
    expect(dataKeys(option)).toEqual([...selectMeta.dataAttrs.option].sort());
    expect(dataKeys(parts.optionGroup({ key: 'g', disabled: true }))).toEqual(
      [...selectMeta.dataAttrs.optionGroup].sort(),
    );
  });

  it('joins the labels of the selected values with a comma', () => {
    expect(getSelectValueText(base({ value: 'Cake' }))).toBe('Cake');
    expect(getSelectValueText(base({ multiple: true, value: ['Cake', 'Steak'] }))).toBe('Cake, Steak');
    expect(getSelectValueText(base({ value: '' }))).toBe('');
    const objects: SelectState<{ id: number }> = {
      id: 's',
      open: false,
      items: [],
      value: { id: 7 },
      itemToStringLabel: (v) => `#${String(v.id)}`,
    };
    expect(getSelectValueText(objects)).toBe('#7');
  });

  it('shows the label of the matching option, then itemToStringLabel, then String(value)', () => {
    const labelled = [
      { key: 'c', value: 'cake', label: ' Cake ' },
      { key: 'p', value: 'pie' },
    ];
    const state = (value: string[], over: Partial<SelectState> = {}): SelectState =>
      base({ items: labelled, multiple: true, value, ...over });
    expect(getSelectValueText(state(['cake', 'pie', 'tea']))).toBe(' Cake , pie, tea');
    expect(getSelectValueText(state(['pie', 'cake']))).toBe('pie,  Cake ');
    expect(getSelectValueText(state(['pie', 'tea'], { itemToStringLabel: (v) => v.toUpperCase() }))).toBe('PIE, TEA');
  });

  it('keeps the label apart from the form string', () => {
    const state = base({
      items: [{ key: 'c', value: 'cake', label: 'Cake' }],
      value: 'cake',
      itemToStringLabel: (v) => `label ${v}`,
      itemToStringValue: (v) => `form ${v}`,
    });
    expect(getSelectValueText(state)).toBe('Cake');
    expect(selectFormValues(state)).toEqual(['form cake']);
    expect(valueToFormString(state, 'x')).toBe('form x');
    expect(itemLabel(state, { key: 'k', value: 'x' })).toBe('label x');
  });

  it('counts a null option as selected with canSelectNullableOptions', () => {
    const nullItem: SelectItem<string | null> = { key: 'none', value: null, label: 'None' };
    const state = (over: Partial<SelectState<string | null>> = {}): SelectState<string | null> => ({
      id: 's1',
      open: true,
      items: [nullItem, cake],
      value: null,
      ...over,
    });
    expect(isSelectEmpty(state())).toBe(true);
    expect(isSelectEmpty(state({ canSelectNullableOptions: true }))).toBe(false);
    expect(getSelectValueText(state({ canSelectNullableOptions: true }))).toBe('None');
    const parts = getSelectProps(state({ canSelectNullableOptions: true }), vi.fn());
    expect(parts.root['data-placeholder-shown']).toBeUndefined();
    expect(parts.option(nullItem)['aria-selected']).toBe('true');
    expect(selectFormValues(state({ canSelectNullableOptions: true }))).toEqual(['']);
    expect(getSelectProps(state(), vi.fn()).root['data-placeholder-shown']).toBe('');
  });

  it('uses the option id as the element id and the active descendant', () => {
    const custom = { key: 'k', value: 'Cake', id: 'my-cake' };
    const parts = getSelectProps(base({ open: true, items: [custom], highlighted: 'k' }), vi.fn());
    expect(parts.option(custom).id).toBe('my-cake');
    expect(parts.trigger['aria-activedescendant']).toBe('my-cake');
    expect(selectItemId('s1', custom)).toBe('my-cake');
    expect(selectItemId('s1', { key: 'k' })).toBe(selectOptionId('s1', 'k'));
  });

  it('renders a decorative separator that has no data attributes', () => {
    expect(selectAnatomy.classes.separator).toBe('cck-select__separator');
    expect(getSelectProps(opened(), vi.fn()).separator).toEqual({
      class: 'cck-select__separator',
      'aria-hidden': 'true',
    });
    expect(selectMeta.dataAttrs.separator).toEqual([]);
    expect(selectMeta.defaultElements?.separator).toBe('div');
  });

  it('gives the preview the selected values, none while empty', () => {
    expect(getSelectPreviewValues(base({ value: 'Cake' }))).toEqual(['Cake']);
    expect(getSelectPreviewValues(base({ value: '' }))).toEqual([]);
    expect(getSelectPreviewValues(base({ multiple: true, value: ['Cake', 'Steak'] }))).toEqual(['Cake', 'Steak']);
    expect(getSelectPreviewValues(base({ multiple: true }))).toEqual([]);
  });

  it('gives the form one string per selected value', () => {
    expect(selectFormValues(base({ value: 'Cake' }))).toEqual(['Cake']);
    expect(selectFormValues(base({ value: '' }))).toEqual(['']);
    expect(selectFormValues(base())).toEqual(['']);
    expect(selectFormValues(base({ multiple: true, value: ['Cake', 'Steak'] }))).toEqual(['Cake', 'Steak']);
    expect(selectFormValues(base({ multiple: true, value: [] }))).toEqual([]);
  });

  it('gives the hidden inputs the effective name, the native facts and the values', () => {
    const state = base({ value: 'Cake', name: 'dish', required: true });
    expect(getSelectProps(state, vi.fn()).formInput).toEqual({
      name: 'dish',
      disabled: undefined,
      required: true,
      values: ['Cake'],
    });
    expect(getSelectProps(base({ controlPath: ['order', 'dish'], disabled: true }), vi.fn()).formInput).toMatchObject({
      name: 'order.dish',
      disabled: true,
      values: [''],
    });
    expect(getSelectProps(base({ multiple: true, value: ['Cake', 'Steak'] }), vi.fn()).formInput.values).toEqual([
      'Cake',
      'Steak',
    ]);
    const inField = getSelectProps(base({ value: 'Cake' }), vi.fn(), { state: { required: true, disabled: true } });
    expect(inField.formInput).toMatchObject({ required: true, disabled: true });
  });

  it('reports the field control state: filled when it has a value, focused, and the id', () => {
    const ids = formFieldIds('f1');
    const parts = getSelectProps(base({ value: 'Cake', focused: true }), vi.fn(), { ids });
    expect(parts.control).toMatchObject({ id: ids.control, filled: true, focused: true });
    expect(getSelectProps(base({ value: '' }), vi.fn()).control.filled).toBe(false);
  });
});

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

  it('puts the message before the id of the field feedback', () => {
    const parts = getSelectProps(base({ blockedSubmit: true, ariaDescribedBy: 'hint' }), vi.fn(), {
      ids: { control: 'ctl', feedback: 'fb', label: 'lb' },
    });
    expect(parts.trigger['aria-describedby']).toBe('hint s1-validation fb');
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
