// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { createRef, StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Avatar } from '../../avatar';
import { AvatarGroup } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Example(): ReactElement {
  return (
    <StrictMode>
      <AvatarGroup role="group" aria-label="Team" className="mine" id="team">
        <Avatar.Root role="img" aria-label="Ada Park">
          <Avatar.Fallback>AP</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root role="img" aria-label="Bob Kim">
          <Avatar.Fallback>BK</Avatar.Fallback>
        </Avatar.Root>
      </AvatarGroup>
    </StrictMode>
  );
}

describe('AvatarGroup', () => {
  it('renders a div with the class, keeps its children in order and passes native attributes', () => {
    const { container } = render(<Example />);
    const root = container.firstElementChild;
    expect(root?.tagName).toBe('DIV');
    expect(root?.className).toBe('cck-avatar-group mine');
    expect(root?.getAttribute('role')).toBe('group');
    expect(root?.id).toBe('team');
    expect([...(root?.children ?? [])].map((child) => child.textContent)).toEqual(['AP', 'BK']);
  });

  it('puts ref on the element and supports both render forms with the fixed class', () => {
    const ref = createRef<HTMLDivElement>();
    const { container, rerender } = render(<AvatarGroup ref={ref} />);
    expect(ref.current).toBe(container.firstElementChild);
    rerender(<AvatarGroup render={<section />}>x</AvatarGroup>);
    expect(container.querySelector('section')?.className).toBe('cck-avatar-group');
    expect(container.querySelector('section')?.textContent).toBe('x');
    rerender(<AvatarGroup render={(props) => <ul {...props} />}>y</AvatarGroup>);
    expect(container.querySelector('ul')?.className).toBe('cck-avatar-group');
  });

  it('has no violations (axe)', async () => {
    const { container } = render(<Example />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('server renders without window and hydrates without a warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<Example />);
    const serverHtml = container.innerHTML;
    expect(serverHtml).toContain('<div class="cck-avatar-group mine"');
    render(<Example />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
  });
});
