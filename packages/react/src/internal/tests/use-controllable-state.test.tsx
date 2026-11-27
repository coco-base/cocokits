// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CancelableChangeDetails } from '../cancelable-change-details';
import { useControllableState } from '../use-controllable-state';

afterEach(cleanup);

const options = (value: boolean | undefined, onChange?: (value: boolean, details: string) => void) => ({
  value,
  defaultValue: false,
  onChange,
  name: 'test',
});

describe('useControllableState', () => {
  it('changes its own state when uncontrolled, and reports only a change', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState(options(undefined, onChange)));
    act(() => {
      result.current[1](false, 'same');
    });
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      result.current[1](true, 'user');
    });
    expect(result.current[0]).toBe(true);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true, 'user');
  });

  it('keeps the prop when controlled, and reports the request', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useControllableState(options(value, onChange)), {
      initialProps: { value: false as boolean | undefined },
    });
    act(() => {
      result.current[1](true, 'user');
    });
    expect(result.current[0]).toBe(false);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true, 'user');
    rerender({ value: true });
    expect(result.current[0]).toBe(true);
  });

  it('gives the same setter on every render', () => {
    const { result, rerender } = renderHook(() => useControllableState(options(undefined)));
    const first = result.current[1];
    rerender();
    expect(result.current[1]).toBe(first);
  });

  it('reports a second request before the next render against the first one', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState(options(undefined, onChange)));
    act(() => {
      result.current[1](true, 'a');
      result.current[1](true, 'b');
    });
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true, 'a');
  });

  describe('cancelable', () => {
    const cancelable = (
      value: boolean | undefined,
      onChange: (value: boolean, details: CancelableChangeDetails<'user'>) => void,
    ) => ({ value, defaultValue: false, onChange, name: 'test', cancelable: true });
    const plain = { reason: 'user', event: null } as const;

    it('gives cancel() and isCanceled, and keeps an uncontrolled state when canceled', () => {
      const onChange = vi.fn((_value: boolean, details: CancelableChangeDetails<'user'>) => {
        expect(details.isCanceled).toBe(false);
        details.cancel();
        expect(details.isCanceled).toBe(true);
      });
      const { result } = renderHook(() => useControllableState(cancelable(undefined, onChange)));
      let accepted = true;
      act(() => {
        accepted = result.current[1](true, plain);
      });
      expect(accepted).toBe(false);
      expect(result.current[0]).toBe(false);
      expect(onChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'user', isCanceled: true }));
    });

    it('accepts a change that is not canceled', () => {
      const { result } = renderHook(() => useControllableState(cancelable(undefined, vi.fn())));
      let accepted = false;
      act(() => {
        accepted = result.current[1](true, plain);
      });
      expect(accepted).toBe(true);
      expect(result.current[0]).toBe(true);
    });

    it('reports a canceled request of a controlled value as refused too', () => {
      const { result } = renderHook(() =>
        useControllableState(
          cancelable(false, (_value, details) => {
            details.cancel();
          }),
        ),
      );
      let accepted = true;
      act(() => {
        accepted = result.current[1](true, plain);
      });
      expect(accepted).toBe(false);
    });
  });
});
