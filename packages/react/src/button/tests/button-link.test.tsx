// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { Button, type ButtonProps } from '../index';
import { makeLink, strict } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  window.location.hash = '';
});

const navigate = vi.fn();
const LinkComponent = makeLink(navigate);

interface Extras {
  readonly button?: Partial<ButtonProps>;
  /** Handlers on the rendered element itself; the function form owns its element and takes none. */
  readonly element?: { readonly onClick?: () => void };
}
type Link = (extras?: Extras) => ReactElement;

const forms: readonly [string, Link][] = [
  [
    'element',
    ({ button, element } = {}) => (
      <Button nativeButton={false} {...button} render={<a href="#go" {...element} />}>
        Go
      </Button>
    ),
  ],
  [
    'function',
    ({ button } = {}) => (
      <Button nativeButton={false} {...button} render={(props) => <a {...props} href="#go" />}>
        Go
      </Button>
    ),
  ],
  [
    'component',
    ({ button, element } = {}) => (
      <Button nativeButton={false} {...button} render={<LinkComponent href="#go" {...element} />}>
        Go
      </Button>
    ),
  ],
];

describe.each(forms)('Button as a link (%s form)', (_form, link) => {
  it('renders an <a> with the class, no type and no role', () => {
    render(strict(link()));
    const anchor = screen.getByRole('link', { name: 'Go' });
    expect(anchor.tagName).toBe('A');
    expect(anchor.classList.contains('cck-button')).toBe(true);
    expect(anchor.hasAttribute('type')).toBe(false);
    expect(anchor.hasAttribute('role')).toBe(false);
    expect(anchor.hasAttribute('tabindex')).toBe(false);
    expect(anchor.getAttribute('href')).toBe('#go');
  });

  it('follows on Enter and does nothing on Space', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(link({ button: { onClick } }));
    await user.tab();
    await user.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
    expect(window.location.hash).toBe('#go');
  });

  it('keeps all props: ref, className, aria-label and a data attribute', () => {
    const ref = vi.fn();
    render(link({ button: { ref, className: 'mine', 'aria-label': 'Open', ...{ 'data-x': '1' } } }));
    const anchor = screen.getByRole('link', { name: 'Open' });
    expect(ref).toHaveBeenCalledWith(anchor);
    expect(anchor.className).toBe('cck-button mine');
    expect(anchor.getAttribute('data-x')).toBe('1');
  });

  describe('disabled', () => {
    it('renders the markers and keeps href', () => {
      render(strict(link({ button: { disabled: true } })));
      const anchor = screen.getByRole('link', { name: 'Go' });
      expect(anchor.getAttribute('aria-disabled')).toBe('true');
      expect(anchor.getAttribute('tabindex')).toBe('-1');
      expect(anchor.getAttribute('data-disabled')).toBe('');
      expect(anchor.getAttribute('href')).toBe('#go');
    });

    it('blocks click and Enter, and runs no handler of the Button, the element or an ancestor', async () => {
      const user = userEvent.setup();
      const button = vi.fn();
      const element = vi.fn();
      const ancestor = vi.fn();
      navigate.mockClear();
      render(
        <div onClick={ancestor}>
          {link({ button: { disabled: true, onClick: button }, element: { onClick: element } })}
        </div>,
      );
      const anchor = screen.getByRole('link', { name: 'Go' });
      await user.click(anchor);
      anchor.focus();
      await user.keyboard('{Enter}');
      expect(window.location.hash).toBe('');
      expect(navigate).not.toHaveBeenCalled();
      expect([button, element, ancestor].map((mock) => mock.mock.calls.length)).toEqual([0, 0, 0]);
    });

    it('is skipped by Tab', async () => {
      const user = userEvent.setup();
      render(
        <>
          {link({ button: { disabled: true } })}
          <button>after</button>
        </>,
      );
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
    });

    it('runs the consumer capture handler first and lets its preventDefault veto the guard', async () => {
      const calls: string[] = [];
      const extras = (veto: boolean): Extras => ({
        button: {
          disabled: true,
          onClickCapture: (event) => {
            calls.push('capture');
            if (veto) event.preventDefault();
          },
          onClick: () => calls.push('button'),
        },
        element: { onClick: () => calls.push('element') },
      });
      const { rerender } = render(link(extras(false)));
      await userEvent.click(screen.getByRole('link', { name: 'Go' }));
      expect(calls).toEqual(['capture']);

      calls.length = 0;
      rerender(link(extras(true)));
      await userEvent.click(screen.getByRole('link', { name: 'Go' }));
      expect(calls[0]).toBe('capture');
      expect(calls).toContain('button');
      expect(window.location.hash).toBe('');
    });
  });
});

describe('Button kind check (development)', () => {
  const kindErrors = (spy: MockInstance<typeof console.error>): unknown[][] =>
    spy.mock.calls.filter((call) => typeof call[0] === 'string' && call[0].startsWith('CocoKits:'));
  const spyError = (): MockInstance<typeof console.error> =>
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

  it('logs a CocoKits error for render={<a />} with nativeButton left true', () => {
    const error = spyError();
    render(<Button render={<a href="#go" />}>x</Button>);
    expect(kindErrors(error).length).toBeGreaterThan(0);
  });

  it('logs a CocoKits error for nativeButton={false} on a <button>', () => {
    const error = spyError();
    render(
      <Button nativeButton={false} render={<button />}>
        x
      </Button>,
    );
    expect(kindErrors(error).length).toBeGreaterThan(0);
  });

  it('logs a CocoKits error for nativeButton={false} on a <div>', () => {
    const error = spyError();
    render(
      <Button nativeButton={false} render={<div />}>
        x
      </Button>,
    );
    expect(kindErrors(error).length).toBeGreaterThan(0);
  });

  it.each([
    ['the default button', <Button>x</Button>],
    ['a button element', <Button render={<button />}>x</Button>],
    [
      'a link element',
      <Button nativeButton={false} render={<a href="#go" />}>
        x
      </Button>,
    ],
    [
      'a link function',
      <Button nativeButton={false} render={(props) => <a {...props} href="#go" />}>
        x
      </Button>,
    ],
    [
      'a link component',
      <Button nativeButton={false} render={<LinkComponent href="#go" />}>
        x
      </Button>,
    ],
  ])('logs nothing for %s', (_name, ui) => {
    const error = spyError();
    render(strict(ui));
    expect(kindErrors(error)).toEqual([]);
  });

  it('logs nothing in production mode', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const error = spyError();
    render(
      <Button nativeButton={false} render={<div />}>
        x
      </Button>,
    );
    expect(kindErrors(error)).toEqual([]);
  });
});
