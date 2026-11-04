// @vitest-environment jsdom
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

interface RadioProps {
  readonly name: string;
  readonly model: boolean;
  readonly onReset?: (event: Event) => void;
  readonly onUncheckedByGroup?: (event: Event) => void;
}

/** A radio and its hook; `latest` holds the binding of the radio that rendered last. */
function Radio({ name, model, onReset, onUncheckedByGroup }: RadioProps): ReactElement {
  const ref = useRef<HTMLInputElement>(null);
  const state = useFormParticipation({ elementRef: ref, getChecked: () => model, onReset, onUncheckedByGroup });
  useEffect(() => {
    latest = state;
  });
  return <input ref={ref} type="radio" name={name} defaultChecked={model} />;
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

describe.each(wrappers)('useFormParticipation in checked mode ($name)', ({ wrap }) => {
  it('syncValue writes the latest checked state', () => {
    const view = render(wrap(<Radio name="a" model={false} />));
    const input = must(view.container.querySelector('input'));
    view.rerender(wrap(<Radio name="a" model />));
    input.checked = false;
    act(() => latest?.syncValue());
    expect(input.checked).toBe(true);
  });

  it('calls the latest onUncheckedByGroup once when the user checks another radio of the group', () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = render(
      wrap(
        <form>
          <Radio name="g" model onUncheckedByGroup={first} />
          <input type="radio" name="g" data-testid="other" />
        </form>,
      ),
    );
    view.rerender(
      wrap(
        <form>
          <Radio name="g" model onUncheckedByGroup={second} />
          <input type="radio" name="g" data-testid="other" />
        </form>,
      ),
    );
    act(() => {
      must(view.container.querySelectorAll('input')[1]).click();
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect((second.mock.calls[0] as [Event])[0].type).toBe('change');
  });

  it('reports nothing for a radio of another name', () => {
    const onUncheckedByGroup = vi.fn();
    const view = render(
      wrap(
        <form>
          <Radio name="g" model onUncheckedByGroup={onUncheckedByGroup} />
          <input type="radio" name="other" />
        </form>,
      ),
    );
    act(() => {
      must(view.container.querySelectorAll('input')[1]).click();
    });
    expect(onUncheckedByGroup).not.toHaveBeenCalled();
  });

  it('a reset calls the latest onReset once, syncs the checked state and clears submitted', async () => {
    const onReset = vi.fn();
    const view = render(
      wrap(
        <form>
          <Radio name="a" model onReset={onReset} />
        </form>,
      ),
    );
    const input = must(view.container.querySelector('input'));
    input.checked = false;
    act(() => {
      must(view.container.querySelector('form')).reset();
    });
    await act(nextTask);
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(input.checked).toBe(true);
  });
});
