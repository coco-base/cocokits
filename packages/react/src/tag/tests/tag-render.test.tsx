// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { tagAnatomy } from '@cocokits/machines/tag';
import { Tag } from '../index';

afterEach(cleanup);

describe('Tag render prop', () => {
  it('element form: another element gives the same class, keeps its own props and the ref', () => {
    const ref = createRef<HTMLSpanElement>();
    const own = createRef<HTMLElement>();
    render(
      <Tag
        data-testid="tag"
        ref={ref}
        id="t"
        render={
          <strong ref={own} className="mine">
            own
          </strong>
        }
      >
        Paid
      </Tag>,
    );
    const tag = screen.getByTestId('tag');
    expect(tag.tagName).toBe('STRONG');
    expect(tag.className).toBe(`${tagAnatomy.classes.root} mine`);
    expect(tag.id).toBe('t');
    expect(tag.textContent).toBe('Paid');
    expect(ref.current).toBe(tag);
    expect(own.current).toBe(tag);
  });

  it('function form: receives all props, ref, children and an empty state', () => {
    const ref = createRef<HTMLSpanElement>();
    let seen: unknown;
    render(
      <Tag
        data-testid="tag"
        ref={ref}
        render={(props, state) => {
          seen = state;
          return <em {...props} />;
        }}
      >
        Paid
      </Tag>,
    );
    const tag = screen.getByTestId('tag');
    expect(tag.tagName).toBe('EM');
    expect(tag.className).toBe(tagAnatomy.classes.root);
    expect(tag.textContent).toBe('Paid');
    expect(ref.current).toBe(tag);
    expect(seen).toEqual({});
  });

  it('a phrasing replacement has no axe violation', async () => {
    const { container } = render(
      <p>
        Invoice <Tag render={<b />}>Paid</Tag>
      </p>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
