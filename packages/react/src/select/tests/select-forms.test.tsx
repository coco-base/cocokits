// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useActionState, type ReactElement, type SyntheticEvent } from 'react';
import { selectAnatomy } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { Dishes, firstDetails, gone, must, nextTask, Opt, stubTopLayer, trigger, valueText } from './fixtures';

const { classes } = selectAnatomy;

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const options = [
  <Opt key="c" value="Cake">
    Cake
  </Opt>,
  <Opt key="p" value="Pizza">
    Pizza
  </Opt>,
];
const submitHandler = (): ReturnType<typeof vi.fn<(event: SyntheticEvent<HTMLFormElement>) => void>> =>
  vi.fn((event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
  });
const dataOf = (handler: ReturnType<typeof submitHandler>, call = 0): FormData => {
  const form = handler.mock.calls[call]?.[0].target;
  if (!(form instanceof HTMLFormElement)) throw new Error('Expected a submit event of a form.');
  return new FormData(form);
};

describe('Select native participation', () => {
  it('submits the value under its name, and the empty string while nothing is selected', async () => {
    const user = userEvent.setup();
    const handler = submitHandler();
    const { container } = render(
      <form onSubmit={handler}>
        <Dishes name="dish">{options}</Dishes>
      </form>,
    );
    container.querySelector('form')?.requestSubmit();
    expect(dataOf(handler).getAll('dish')).toEqual(['']);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    container.querySelector('form')?.requestSubmit();
    expect(dataOf(handler, 1).getAll('dish')).toEqual(['Pizza']);
  });

  it('submits one entry per value with multiple, and none while empty', () => {
    const handler = submitHandler();
    const { container, unmount } = render(
      <form onSubmit={handler}>
        <Dishes name="dish" multiple defaultValue={['Cake', 'Pizza']}>
          {options}
        </Dishes>
      </form>,
    );
    container.querySelector('form')?.requestSubmit();
    expect(dataOf(handler).getAll('dish')).toEqual(['Cake', 'Pizza']);
    unmount();
    const empty = render(
      <form onSubmit={handler}>
        <Dishes name="dish" multiple>
          {options}
        </Dishes>
      </form>,
    );
    empty.container.querySelector('form')?.requestSubmit();
    expect(dataOf(handler, 1).has('dish')).toBe(false);
  });

  it('renders hidden inputs for a name or for required, and none otherwise', () => {
    const { container, rerender } = render(<Dishes>{options}</Dishes>);
    expect(container.querySelector('input')).toBeNull();
    rerender(
      <Dishes key="named" name="dish" defaultValue="Cake">
        {options}
      </Dishes>,
    );
    const input = container.querySelector('input');
    expect(input?.name).toBe('dish');
    expect(input?.value).toBe('Cake');
    expect(input?.getAttribute('aria-hidden')).toBe('true');
    expect(input?.tabIndex).toBe(-1);
    expect(input?.hasAttribute('class')).toBe(false);
    rerender(
      <Dishes key="required" required>
        {options}
      </Dishes>,
    );
    expect(container.querySelector('input')?.required).toBe(true);
    expect(container.querySelector('input')?.hasAttribute('name')).toBe(false);
  });

  it('belongs to the form named by form', () => {
    const handler = submitHandler();
    const { container } = render(
      <>
        <form id="orders" onSubmit={handler} />
        <Dishes name="dish" form="orders" defaultValue="Cake">
          {options}
        </Dishes>
      </>,
    );
    container.querySelector('form')?.requestSubmit();
    expect(dataOf(handler).get('dish')).toBe('Cake');
  });

  it('blocks the submit while required and empty, focuses the trigger, and passes once chosen', async () => {
    const user = userEvent.setup();
    const handler = submitHandler();
    const { container } = render(
      <form onSubmit={handler}>
        <Dishes name="dish" required>
          {options}
        </Dishes>
      </form>,
    );
    const form = must(container.querySelector('form'));
    expect(form.checkValidity()).toBe(false);
    form.requestSubmit();
    expect(handler).not.toHaveBeenCalled();
    await nextTask();
    expect(document.activeElement).toBe(trigger());
    expect(trigger().getAttribute('aria-required')).toBe('true');
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    await gone();
    expect(form.checkValidity()).toBe(true);
    form.requestSubmit();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('blocks the submit of a required multiple Select with no value', () => {
    const { container } = render(
      <form>
        <Dishes name="dish" required multiple>
          {options}
        </Dishes>
      </form>,
    );
    expect(must(container.querySelector('form')).checkValidity()).toBe(false);
  });

  it('does not submit a disabled Select, and a disabling fieldset disables it', async () => {
    const handler = submitHandler();
    const { container } = render(
      <form onSubmit={handler}>
        <fieldset disabled>
          <Dishes name="dish" defaultValue="Cake">
            {options}
          </Dishes>
        </fieldset>
      </form>,
    );
    container.querySelector('form')?.requestSubmit();
    expect(dataOf(handler).has('dish')).toBe(false);
    await waitFor(() => {
      expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-disabled')).toBe(true);
    });
  });

  it('restores the value at mount on reset and reports form-reset', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <Dishes name="dish" defaultValue="Cake" onValueChange={onValueChange}>
          {options}
        </Dishes>
      </form>,
    );
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    await gone();
    onValueChange.mockClear();
    container.querySelector('form')?.reset();
    await waitFor(() => {
      expect(valueText()).toBe('Cake');
    });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[0]).toBe('Cake');
    expect(firstDetails(onValueChange)).toMatchObject({ reason: 'form-reset' });
    expect(firstDetails(onValueChange)?.event?.type).toBe('reset');
    expect(container.querySelector<HTMLInputElement>('input[name="dish"]')?.value).toBe('Cake');
  });

  it('keeps a controlled null over defaultValue on reset', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <Dishes name="dish" placeholder="Choose" value={null} defaultValue="Cake" onValueChange={onValueChange}>
          {options}
        </Dishes>
      </form>,
    );
    container.querySelector('form')?.reset();
    await nextTask();
    expect(onValueChange).not.toHaveBeenCalledWith('Cake', expect.anything());
    expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose');
  });

  it('restores an empty single value on reset', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Dishes name="dish" placeholder="Choose">
          {options}
        </Dishes>
      </form>,
    );
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    await gone();
    container.querySelector('form')?.reset();
    await waitFor(() => {
      expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose');
    });
  });

  it('works with a React form action: the action reads the value from FormData', async () => {
    const user = userEvent.setup();
    const seen = vi.fn();
    function Action(): ReactElement {
      const [, submit] = useActionState((_previous: null, data: FormData) => {
        seen(data.get('dish'));
        return null;
      }, null);
      return (
        <form action={submit}>
          <Dishes name="dish" defaultValue="Pizza">
            {options}
          </Dishes>
          <button>Send</button>
        </form>
      );
    }
    render(<Action />);
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => {
      expect(seen).toHaveBeenCalledWith('Pizza');
    });
  });
});

describe('Select in a FormField', () => {
  function Field({ disabled }: { readonly disabled?: boolean }): ReactElement {
    return (
      <FormField label={<Label>Dish</Label>} hint={<Hint>Pick one</Hint>} required disabled={disabled}>
        <Dishes label={null} placeholder="Choose">
          {options}
        </Dishes>
      </FormField>
    );
  }

  it('is the control of the field: control id, label for, described by the feedback, required marker', () => {
    const { container } = render(<Field />);
    const label = screen.getByText('Dish', { selector: 'label' });
    expect(trigger().id).toMatch(/-control$/);
    expect(label.getAttribute('for')).toBe(trigger().id);
    const feedback = must(container.querySelector<HTMLElement>('.cck-form-field__feedback-wrapper'));
    expect(trigger().getAttribute('aria-describedby')).toBe(feedback.id);
    expect(trigger().getAttribute('aria-required')).toBe('true');
    expect(label.textContent).toContain('*');
    expect(screen.getByRole('combobox', { name: /Dish/ })).toBe(trigger());
  });

  it('merges an author aria-describedby with the field description ids, and keeps both after updates', async () => {
    const user = userEvent.setup();
    function Described(): ReactElement {
      return (
        <>
          <p id="mine">Mine</p>
          <FormField label={<Label>Dish</Label>} hint={<Hint>Pick one</Hint>}>
            <Dishes label={null} triggerProps={{ 'aria-describedby': 'mine' }} placeholder="Choose">
              <Opt value="Cake">Cake</Opt>
            </Dishes>
          </FormField>
        </>
      );
    }
    const { container } = render(<Described />);
    const feedback = must(container.querySelector<HTMLElement>('.cck-form-field__feedback-wrapper'));
    const ids = (): string[] => (trigger().getAttribute('aria-describedby') ?? '').split(' ').sort();
    expect(ids()).toEqual(['mine', feedback.id].sort());
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    await gone();
    expect(ids()).toEqual(['mine', feedback.id].sort());
  });

  it('gives the field its facts: filled, focused, required', async () => {
    const user = userEvent.setup();
    const { container } = render(<Field />);
    const field = must(container.querySelector<HTMLElement>('.cck-form-field'));
    expect(field.hasAttribute('data-required')).toBe(true);
    expect(field.hasAttribute('data-filled')).toBe(false);
    await user.tab();
    expect(field.hasAttribute('data-focused')).toBe(true);
    await user.keyboard('{ArrowDown}{Enter}');
    await gone();
    expect(field.hasAttribute('data-filled')).toBe(true);
  });

  it('takes the field state: a disabled field disables the Select', () => {
    render(<Field disabled />);
    expect(trigger().disabled).toBe(true);
  });

  it('focuses the trigger and does not open when the label is clicked', async () => {
    const user = userEvent.setup();
    render(<Field />);
    await user.click(screen.getByText('Dish', { selector: 'label' }));
    expect(document.activeElement).toBe(trigger());
    expect(screen.queryByRole('listbox')).toBeNull();
    await user.click(trigger());
    expect(await screen.findByRole('listbox')).toBeTruthy();
  });

  it('lines the list up with the input wrapper of the field, not the trigger', async () => {
    const user = userEvent.setup();
    const { container } = render(<Field />);
    const wrapper = must(container.querySelector<HTMLElement>('.cck-form-field__input-wrapper'));
    wrapper.getBoundingClientRect = () => new DOMRect(40, 10, 300, 48);
    await user.click(trigger());
    const list = await screen.findByRole('listbox');
    await waitFor(() => {
      expect(list.style.getPropertyValue('--anchor-width')).toBe('300px');
    });
  });

  it('lines the list up with the trigger outside a field', async () => {
    const user = userEvent.setup();
    render(<Dishes>{options}</Dishes>);
    trigger().getBoundingClientRect = () => new DOMRect(0, 0, 180, 40);
    await user.click(trigger());
    const list = await screen.findByRole('listbox');
    await waitFor(() => {
      expect(list.style.getPropertyValue('--anchor-width')).toBe('180px');
    });
  });
});

describe('Select autofill', () => {
  const inputOf = (container: HTMLElement): HTMLInputElement => must(container.querySelector('input[name="dish"]'));
  const fill = (input: HTMLInputElement, value: string): void => {
    fireEvent.change(input, { target: { value } });
  };
  const items = [
    { value: 'cake', label: 'Cake' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'soup', label: 'Soup', disabled: true },
  ];

  it('puts autocomplete off on the hidden inputs, or the given token', () => {
    const { container, rerender } = render(<Dishes name="dish">{options}</Dishes>);
    expect(inputOf(container).getAttribute('autocomplete')).toBe('off');
    rerender(
      <Dishes name="dish" autoComplete="country">
        {options}
      </Dishes>,
    );
    expect(inputOf(container).getAttribute('autocomplete')).toBe('country');
  });

  it('picks the item a browser writes to the hidden input of a closed Select through the items data', () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Dishes
        name="dish"
        items={items}
        itemToStringValue={(value) => value.toUpperCase()}
        onValueChange={onValueChange}
      />,
    );
    fill(inputOf(container), 'PIZZA');
    expect(onValueChange.mock.calls[0]?.[0]).toBe('pizza');
    expect(firstDetails(onValueChange)).toMatchObject({ reason: 'user' });
    expect(firstDetails(onValueChange)?.event?.type).toBe('change');
    expect(valueText()).toBe('Pizza');
    expect(inputOf(container).value).toBe('PIZZA');
  });

  it('restores the input when nothing matches, the entry is disabled, or there are no items', () => {
    const onValueChange = vi.fn();
    const { container, unmount } = render(
      <Dishes name="dish" items={items} defaultValue="cake" onValueChange={onValueChange} />,
    );
    fill(inputOf(container), 'nothing');
    expect(inputOf(container).value).toBe('cake');
    fill(inputOf(container), 'soup');
    expect(inputOf(container).value).toBe('cake');
    expect(onValueChange).not.toHaveBeenCalled();
    unmount();
    const bare = render(<Dishes name="dish" defaultValue="Cake" onValueChange={onValueChange} />);
    fill(inputOf(bare.container), 'Pizza');
    expect(inputOf(bare.container).value).toBe('Cake');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('matches the mounted items while the list is open, and skips a disabled one', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Dishes name="dish" onValueChange={onValueChange}>
        <Opt value="Cake" disabled>
          Cake
        </Opt>
        <Opt value="Pizza">Pizza</Opt>
      </Dishes>,
    );
    await user.click(trigger());
    await screen.findByRole('listbox');
    fill(inputOf(container), 'Cake');
    expect(onValueChange).not.toHaveBeenCalled();
    fill(inputOf(container), 'Pizza');
    expect(onValueChange.mock.calls[0]?.[0]).toBe('Pizza');
  });

  it('ignores the write in a multiple Select', () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Dishes name="dish" multiple defaultValue={['cake']} items={items} onValueChange={onValueChange} />,
    );
    fill(inputOf(container), 'pizza');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(inputOf(container).value).toBe('cake');
  });
});
