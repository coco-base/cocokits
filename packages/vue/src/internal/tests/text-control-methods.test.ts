// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { h, nextTick, ref, type VNode } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import ChipList from '../../chip-list/ChipList.vue';
import Input from '../../input/Input.vue';
import Textarea from '../../textarea/Textarea.vue';
import { mountView } from './mount-helpers';

afterEach(cleanup);

interface Methods {
  focus: (options?: FocusOptions) => void;
  reset: () => void;
}

/** One row: the component, its control element and the attribute that shows invalid after touched. */
type Render = (props: Record<string, unknown>) => VNode;
const ROWS: readonly { name: string; render: Render; selector: string; props: Record<string, unknown> }[] = [
  { name: 'Input', render: (props) => h(Input, props), selector: 'input', props: {} },
  { name: 'Textarea', render: (props) => h(Textarea, props), selector: 'textarea', props: {} },
  { name: 'ChipList', render: (props) => h(ChipList, props), selector: 'input', props: { defaultValue: ['A'] } },
];

describe.each(ROWS)('$name public methods (Q30)', ({ render, selector, props }) => {
  function mount(extra: Record<string, unknown> = {}): { control: () => Methods; element: () => HTMLElement } {
    const control = ref<Methods | null>(null);
    mountView(() => render({ ref: control, 'aria-label': 'Field', invalid: true, ...props, ...extra }));
    return {
      control: () => {
        if (!control.value) throw new Error('Not mounted.');
        return control.value;
      },
      element: () => {
        const found = document.querySelector<HTMLElement>(selector);
        if (!found) throw new Error('No control rendered.');
        return found;
      },
    };
  }

  it('focus() moves the focus to the control element', () => {
    const { control, element } = mount();
    control().focus();
    expect(document.activeElement).toBe(element());
  });

  it('reset() clears the touched state, so the invalid fact stops showing', async () => {
    const { control, element } = mount();
    element().focus();
    await userEvent.tab();
    await nextTick();
    expect(element().getAttribute('aria-invalid')).toBe('true');
    control().reset();
    await nextTick();
    expect(element().hasAttribute('aria-invalid')).toBe(false);
  });

  it('reset() leaves a given touched prop alone', async () => {
    const { control, element } = mount({ touched: true });
    control().reset();
    await nextTick();
    expect(element().getAttribute('aria-invalid')).toBe('true');
  });
});
