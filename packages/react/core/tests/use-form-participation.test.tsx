// @vitest-environment jsdom
import { renderToString } from 'react-dom/server';
import { act, cleanup, render } from '@testing-library/react';
import { StrictMode, useEffect, useRef, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useFormParticipation, type FormParticipationBinding } from '../src/index';

function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}

let latest: FormParticipationBinding | undefined;
const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

interface ProbeProps {
  readonly model: string;
  readonly disabled: boolean;
  readonly onReset?: (event: Event) => void;
  /** Whether the component that owns the input is rendered; the form stays either way. */
  readonly input?: boolean;
}

/** The input and its hook; unmounting it leaves the surrounding form in the document. */
function Control({
  model,
  onReset,
}: Pick<ProbeProps, 'model'> & { readonly onReset?: ((event: Event) => void) | undefined }): ReactElement {
  const ref = useRef<HTMLInputElement>(null);
  const state = useFormParticipation({ elementRef: ref, getValue: () => model, onReset });
  useEffect(() => {
    latest = state;
  });
  return (
    <input
      ref={ref}
      defaultValue="start"
      data-fieldset-disabled={String(state.fieldsetDisabled)}
      data-submitted={String(state.submitted)}
    />
  );
}

function Probe({ model, onReset, disabled, input = true }: ProbeProps): ReactElement {
  return (
    <form>
      <fieldset disabled={disabled}>{input ? <Control model={model} onReset={onReset} /> : null}</fieldset>
    </form>
  );
}

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
  latest = undefined;
});

const wrappers = [
  { name: 'plain', wrap: (node: ReactElement) => node },
  { name: 'StrictMode', wrap: (node: ReactElement) => <StrictMode>{node}</StrictMode> },
];

describe.each(wrappers)('useFormParticipation ($name)', ({ wrap }) => {
  it('starts false and follows the fieldset', async () => {
    const view = render(wrap(<Probe model="m" disabled={false} />));
    expect(latest?.fieldsetDisabled).toBe(false);
    view.rerender(wrap(<Probe model="m" disabled />));
    await act(nextTask);
    expect(latest?.fieldsetDisabled).toBe(true);
    view.rerender(wrap(<Probe model="m" disabled={false} />));
    await act(nextTask);
    expect(latest?.fieldsetDisabled).toBe(false);
  });

  it('syncValue writes the latest model value', () => {
    const view = render(wrap(<Probe model="one" disabled={false} />));
    const input = must(view.container.querySelector('input'));
    act(() => latest?.syncValue());
    expect(input.value).toBe('one');
    view.rerender(wrap(<Probe model="two" disabled={false} />));
    act(() => latest?.syncValue());
    expect(input.value).toBe('two');
  });

  it('reports a submit, and a reset calls the latest onReset once, syncs and clears submitted', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = render(wrap(<Probe model="m" disabled={false} onReset={first} />));
    view.rerender(wrap(<Probe model="m" disabled={false} onReset={second} />));
    const form = must(view.container.querySelector('form'));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
    act(() => {
      form.requestSubmit();
    });
    expect(latest?.submitted).toBe(true);
    const input = must(view.container.querySelector('input'));
    input.value = 'typed';
    act(() => {
      form.reset();
    });
    await act(nextTask);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('m');
    expect(latest?.submitted).toBe(false);
  });

  it('removes its listeners when the input unmounts while the form stays in the document', async () => {
    const onReset = vi.fn();
    const view = render(wrap(<Probe model="m" disabled={false} onReset={onReset} />));
    const form = must(view.container.querySelector('form'));
    const syncValue = latest?.syncValue;
    const removed = vi.spyOn(document, 'removeEventListener');
    view.rerender(wrap(<Probe model="m" disabled={false} onReset={onReset} input={false} />));
    expect(removed.mock.calls.map(([type]) => type)).toEqual(expect.arrayContaining(['reset', 'submit']));
    expect(form.isConnected).toBe(true);
    expect(form.querySelector('input')).toBeNull();
    form.reset();
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await nextTask();
    expect(onReset).not.toHaveBeenCalled();
    expect(() => syncValue?.()).not.toThrow();
  });
});

describe('useFormParticipation on the server', () => {
  it('renders the starting values and creates nothing', () => {
    const onReset = vi.fn();
    const html = renderToString(<Probe model="m" disabled onReset={onReset} />);
    expect(html).toContain('<fieldset disabled=""');
    expect(html).toContain('data-fieldset-disabled="false"');
    expect(html).toContain('data-submitted="false"');
    expect(onReset).not.toHaveBeenCalled();
  });
});
