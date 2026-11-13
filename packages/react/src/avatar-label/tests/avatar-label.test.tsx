// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { createRef, StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Avatar } from '../../avatar';
import { AvatarLabel, type AvatarLabelProps } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Example(props: AvatarLabelProps): ReactElement {
  return (
    <StrictMode>
      <AvatarLabel name="Ada Park" description="Engineer" {...props}>
        <Avatar.Root aria-hidden="true">
          <Avatar.Fallback>AP</Avatar.Fallback>
        </Avatar.Root>
      </AvatarLabel>
    </StrictMode>
  );
}

describe('AvatarLabel', () => {
  it('renders the avatar first, then the text with the name and the description', () => {
    const { container } = render(<Example />);
    const root = container.firstElementChild;
    expect(root?.tagName).toBe('DIV');
    expect(root?.className).toBe('cck-avatar-label');
    expect([...(root?.children ?? [])].map((child) => child.className)).toEqual([
      'cck-avatar',
      'cck-avatar-label__text',
    ]);
    const text = root?.lastElementChild;
    expect([...(text?.children ?? [])].map((child) => [child.tagName, child.className, child.textContent])).toEqual([
      ['SPAN', 'cck-avatar-label__name', 'Ada Park'],
      ['SPAN', 'cck-avatar-label__description', 'Engineer'],
    ]);
  });

  it('leaves out what is not set or empty, and the text when both are missing', () => {
    const { container, rerender } = render(<Example description="" />);
    expect(container.querySelector('.cck-avatar-label__description')).toBeNull();
    expect(container.querySelector('.cck-avatar-label__name')?.textContent).toBe('Ada Park');
    rerender(<Example name="" description={undefined} />);
    expect(container.querySelector('.cck-avatar-label__text')).toBeNull();
    rerender(<Example name={undefined} description="Engineer" />);
    expect(container.querySelector('.cck-avatar-label__name')).toBeNull();
    expect(container.querySelector('.cck-avatar-label__description')?.textContent).toBe('Engineer');
  });

  it('passes native attributes, merges className and puts ref on the element', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Example ref={ref} id="who" className="mine" role="group" aria-label="Ada" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current?.className).toBe('cck-avatar-label mine');
    expect(ref.current?.id).toBe('who');
    expect(ref.current?.getAttribute('aria-label')).toBe('Ada');
  });

  it('supports both render forms with the avatar and the text kept', () => {
    const { container, rerender } = render(<Example render={<section />} />);
    expect(container.querySelector('section > .cck-avatar')).not.toBeNull();
    expect(container.querySelector('section > .cck-avatar-label__text')).not.toBeNull();
    rerender(<Example render={(props, state) => <article {...props} data-name={String(state.hasName)} />} />);
    expect(container.querySelector('article')?.getAttribute('data-name')).toBe('true');
    expect(container.querySelector('article > .cck-avatar-label__text')).not.toBeNull();
  });

  it('has no violations with the avatar hidden from readers (axe)', async () => {
    const { container } = render(<Example />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('server renders without window and hydrates without a warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<Example />);
    const serverHtml = container.innerHTML;
    expect(serverHtml).toContain('<span class="cck-avatar-label__name">Ada Park</span>');
    render(<Example />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
  });
});
