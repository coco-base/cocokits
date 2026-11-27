import { afterEach, describe, expect, it, vi } from 'vitest';
import { composeEventHandlers } from '../compose-event-handlers';
import { isDevelopment } from '../dev';
import { mergeProps } from '../merge-props';

describe('composeEventHandlers', () => {
  it('runs the consumer first and ours second', () => {
    const calls: string[] = [];
    composeEventHandlers(
      () => calls.push('theirs'),
      () => calls.push('ours'),
    )?.({});
    expect(calls).toEqual(['theirs', 'ours']);
  });

  it('returns the one handler that exists, or nothing', () => {
    const only = vi.fn();
    expect(composeEventHandlers(only, undefined)).toBe(only);
    expect(composeEventHandlers(undefined, only)).toBe(only);
    expect(composeEventHandlers(undefined, undefined)).toBeUndefined();
  });

  it('leaves the veto to ours: a prevented event is still handed on', () => {
    const ours = vi.fn();
    composeEventHandlers((event: { defaultPrevented: boolean }) => {
      event.defaultPrevented = true;
    }, ours)?.({ defaultPrevented: false });
    expect(ours).toHaveBeenCalledWith({ defaultPrevented: true });
  });
});

describe('mergeProps', () => {
  it('lets the consumer win and ignores undefined consumer values', () => {
    expect(mergeProps({ type: 'button', id: 'a' }, { type: 'submit', id: undefined })).toEqual({
      type: 'submit',
      id: 'a',
    });
  });

  it('joins className after ours and merges style', () => {
    const merged = mergeProps(
      { className: 'cck-button', style: { color: 'red', margin: 1 } },
      { className: 'mine', style: { color: 'blue' } },
    );
    expect(merged).toEqual({ className: 'cck-button mine', style: { color: 'blue', margin: 1 } });
  });

  it('composes handlers with the consumer first', () => {
    const calls: string[] = [];
    const merged = mergeProps({ onClick: () => calls.push('ours') }, { onClick: () => calls.push('theirs') });
    (merged.onClick as () => void)();
    expect(calls).toEqual(['theirs', 'ours']);
  });

  it('keeps our handler when the consumer has none', () => {
    const ours = vi.fn();
    expect(mergeProps({ onClick: ours }, { onClick: undefined }).onClick).toBe(ours);
  });
});

describe('isDevelopment', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('is true outside production and false in production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isDevelopment()).toBe(true);
    vi.stubEnv('NODE_ENV', 'production');
    expect(isDevelopment()).toBe(false);
  });

  it('does not throw without a global process, as in a browser bundle that leaves it undefined', () => {
    vi.stubGlobal('process', undefined);
    expect(() => isDevelopment()).not.toThrow();
    expect(isDevelopment()).toBe(false);
  });
});
