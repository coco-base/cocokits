// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { defineComponent, h, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  active,
  gone,
  item,
  mountView,
  must,
  option,
  record,
  selectRoot,
  selectView,
  stubOverlayBrowser,
  trigger,
  valueText,
} from './fixtures';

beforeEach(() => {
  stubOverlayBrowser();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select pointer', () => {
  it('highlights under the pointer, skips a disabled option, and a press in the list keeps the focus on the trigger', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.hover(option('Steak'));
    expect(active()).toBe('Steak');
    await user.hover(option('Pizza'));
    expect(active()).toBe('Steak');
    await user.pointer({ keys: '[MouseLeft>]', target: option('Steak') });
    expect(document.activeElement).toBe(trigger());
  });

  it('chooses on click, marks it selected and closes', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Burger' }));
    await gone();
    expect(valueText()).toBe('Burger');
    expect(recorded.values).toEqual(['Burger']);
    await user.click(trigger());
    await screen.findByRole('listbox');
    expect(option('Burger').getAttribute('aria-selected')).toBe('true');
    expect(option('Burger').hasAttribute('data-selected')).toBe(true);
    expect(option('Cake').getAttribute('aria-selected')).toBe('false');
  });

  it('does not choose a disabled option', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    expect(recorded.values).toEqual([]);
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('lets a preventDefault in the item listener veto the choice', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(
      selectView(recorded.props, {
        items: () => [
          item('Cake', 'Cake', {
            onClick: (event: Event) => {
              event.preventDefault();
            },
          }),
          item('Pizza'),
        ],
      }),
    );
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    expect(recorded.values).toEqual([]);
    await user.click(option('Pizza'));
    expect(recorded.values).toHaveLength(1);
  });

  it('refuses a choice with a prevented select event and keeps the list open', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(
      selectView(recorded.props, {
        items: () => [
          item('Cake', 'Cake', {
            onSelect: (event: Event) => {
              event.preventDefault();
            },
          }),
          item('Pizza'),
        ],
      }),
    );
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    expect(recorded.values).toEqual([]);
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.click(option('Pizza'));
    expect(recorded.values).toEqual(['Pizza']);
  });

  it('closes on an outside press with the outside-press reason', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.click(must(document.getElementById('empty')));
    await gone();
    expect(recorded.opens.at(-1)).toEqual(false);
    // The press moved the focus off the trigger: the highlighted item is chosen first.
    expect(recorded.values).toEqual(['Cake']);
  });

  it('closes when the trigger is clicked again', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.click(trigger());
    await gone();
    expect(recorded.opens.at(-1)).toEqual(false);
  });
});

describe('Select multiple', () => {
  it('toggles values, stays open, and shows the values joined with a comma', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView({ multiple: true, ...recorded.props }));
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    await user.click(option('Steak'));
    expect(recorded.values.at(-1)).toEqual(['Cake', 'Steak']);
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(option('Cake').getAttribute('aria-selected')).toBe('true');
    expect(valueText()).toBe('Cake, Steak');
    await user.click(option('Cake'));
    expect(recorded.values.at(-1)).toEqual(['Steak']);
    expect(recorded.values).toHaveLength(3);
  });
});

describe('Select value and open state', () => {
  it('is controlled with v-model', async () => {
    const user = userEvent.setup();
    const value = ref<unknown>('Cake');
    mountView(() =>
      selectView({ modelValue: value.value, 'onUpdate:modelValue': (next: unknown) => (value.value = next) })(),
    );
    expect(valueText()).toBe('Cake');
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Burger' }));
    expect(value.value).toBe('Burger');
    expect(valueText()).toBe('Burger');
  });

  it('keeps the value when the parent refuses the change', async () => {
    const user = userEvent.setup();
    mountView(selectView({ modelValue: 'Cake', 'onUpdate:modelValue': () => undefined }));
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Burger' }));
    expect(valueText()).toBe('Cake');
  });

  it('keeps its own value when it is not bound', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Steak' }));
    expect(valueText()).toBe('Steak');
  });

  it('shows a value written from outside without emitting valueChange', async () => {
    const value = ref<unknown>('Cake');
    const recorded = record();
    mountView(() => selectView({ modelValue: value.value, ...recorded.props })());
    value.value = 'Steak';
    await waitFor(() => {
      expect(valueText()).toBe('Steak');
    });
    expect(recorded.values).toEqual([]);
  });

  it('renders a component that wraps it', () => {
    const Wrapper = defineComponent({
      setup: () => () => selectRoot({ modelValue: 'Cake' }, { items: () => [item('Cake')] }),
    });
    mountView(() => h(Wrapper));
    expect(valueText()).toBe('Cake');
  });
});
