// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { createRef, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mergeRefs } from '../merge-refs';
import { renderElement } from '../render-element';

afterEach(cleanup);

describe('mergeRefs', () => {
  it('fills object and callback refs', () => {
    const object = createRef<HTMLElement>();
    const callback = vi.fn();
    const node = document.createElement('div');

    const cleanup = mergeRefs(object, callback, undefined)(node);

    expect(object.current).toBe(node);
    expect(callback).toHaveBeenCalledWith(node);
    cleanup?.();
    expect(object.current).toBeNull();
    expect(callback).toHaveBeenLastCalledWith(null);
  });

  it('runs the cleanup a callback ref returned instead of calling it with null', () => {
    const inner = vi.fn();
    const callback = vi.fn(() => inner);
    const cleanup = mergeRefs<HTMLElement>(callback)(document.createElement('div'));
    cleanup?.();
    expect(inner).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('renderElement', () => {
  const props = { className: 'cck-x', 'data-a': '' };

  it('creates the default tag without render', () => {
    expect(renderToStaticMarkup(renderElement(undefined, 'button', props, {}))).toBe(
      '<button class="cck-x" data-a=""></button>',
    );
  });

  it('merges under the element form: its own props win, className joins', () => {
    const element = <a href="#go" className="mine" data-a="own" />;
    expect(renderToStaticMarkup(renderElement(element, 'button', props, {}))).toBe(
      '<a href="#go" class="cck-x mine" data-a="own"></a>',
    );
  });

  it('hands all props and the state to the function form', () => {
    const fn = vi.fn((p: typeof props, s: { n: number }): ReactElement => <i {...p} data-n={s.n} />);
    expect(renderToStaticMarkup(renderElement(fn, 'button', props, { n: 2 }))).toBe(
      '<i class="cck-x" data-a="" data-n="2"></i>',
    );
    expect(fn).toHaveBeenCalledWith(props, { n: 2 });
  });

  it('puts the part ref on the element, not the element ref', () => {
    const own = vi.fn();
    const mine = vi.fn();
    render(renderElement(<a ref={own} />, 'button', { ref: mine }, {}));
    expect(mine).toHaveBeenCalled();
    expect(own).not.toHaveBeenCalled();
  });
});
