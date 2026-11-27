// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { BadgeContainer } from '../../badge-container';
import { Badge } from '../index';

afterEach(cleanup);

describe('Badge render prop', () => {
  it('element form: renders the element with the class, the parts and the data-*', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge data-testid="badge" ref={ref} content={120} max={99} render={<em className="mine" />} />);
    const badge = screen.getByTestId('badge');
    expect(badge.tagName).toBe('EM');
    expect(badge.className).toBe('cck-badge mine');
    expect(badge.hasAttribute('data-truncated')).toBe(true);
    expect(badge.textContent).toBe('99+');
    expect(ref.current).toBe(badge);
  });

  it('element form: the parts win over the element own children', () => {
    render(<Badge data-testid="badge" content={5} render={<em>own</em>} />);
    expect(screen.getByTestId('badge').textContent).toBe('5');
  });

  it('element form: keeps the element own ref', () => {
    const own = createRef<HTMLElement>();
    render(<Badge data-testid="badge" content={1} render={<em ref={own} />} />);
    expect(own.current).toBe(screen.getByTestId('badge'));
  });

  it('function form: receives all props, ref and the state', () => {
    const ref = createRef<HTMLSpanElement>();
    let seen: unknown;
    render(
      <Badge
        data-testid="badge"
        ref={ref}
        hide
        render={(props, state) => {
          seen = state;
          return <i {...props} />;
        }}
      />,
    );
    const badge = screen.getByTestId('badge');
    expect(badge.tagName).toBe('I');
    expect(badge.className).toBe('cck-badge');
    expect(badge.hasAttribute('hidden')).toBe(true);
    expect(ref.current).toBe(badge);
    expect(seen).toEqual({ empty: false, truncated: false, hidden: true });
  });

  it('a phrasing replacement has no axe violation', async () => {
    const { container } = render(
      <button type="button">
        Inbox <Badge content={5} render={<b />} />
      </button>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('BadgeContainer render prop', () => {
  it('element form: renders the element with the class and data-position on it', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <BadgeContainer ref={ref} data-testid="container" position="bottom-left" render={<section />}>
        <Badge data-testid="badge" />
      </BadgeContainer>,
    );
    const container = screen.getByTestId('container');
    expect(container.tagName).toBe('SECTION');
    expect(container.className).toBe('cck-badge-container');
    expect(container.getAttribute('data-position')).toBe('bottom-left');
    expect(ref.current).toBe(container);
  });

  it("element form: replaces the element's own children by the container's", () => {
    render(
      <BadgeContainer position="bottom-left" render={<section>own</section>}>
        <Badge data-testid="badge" />
      </BadgeContainer>,
    );
    expect(screen.getByTestId('badge').parentElement?.textContent).toBe('');
  });

  it('function form: receives all props, children and the state', () => {
    let seen: unknown;
    render(
      <BadgeContainer
        data-testid="container"
        position="top-left"
        render={(props, state) => {
          seen = state;
          return <section {...props} />;
        }}
      >
        <Badge data-testid="badge" />
      </BadgeContainer>,
    );
    expect(screen.getByTestId('container').tagName).toBe('SECTION');
    expect(screen.getByTestId('container').getAttribute('data-position')).toBe('top-left');
    expect(seen).toEqual({ position: 'top-left' });
  });

  it('hidden wins over hidden={false} on the element given to render', () => {
    render(<Badge data-testid="badge" hide render={<em hidden={false} />} />);
    expect(screen.getByTestId('badge').hasAttribute('hidden')).toBe(true);
  });

  it('hidden wins over hidden={false} in the function form', () => {
    render(<Badge data-testid="badge" hide render={(props) => <em {...props} />} />);
    expect(screen.getByTestId('badge').hasAttribute('hidden')).toBe(true);
  });

  it('keeps the element own hidden when the badge is not hidden', () => {
    render(<Badge data-testid="badge" content={1} render={<em hidden />} />);
    expect(screen.getByTestId('badge').hasAttribute('hidden')).toBe(true);
  });
});
