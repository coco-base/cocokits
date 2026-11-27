// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { hintAnatomy } from '@cocokits/machines/hint';
import { Hint } from '../index';

afterEach(cleanup);

describe('Hint render prop', () => {
  it('default element is a div with the class', () => {
    render(<Hint data-testid="hint">Help</Hint>);
    expect(screen.getByTestId('hint').tagName).toBe('DIV');
    expect(screen.getByTestId('hint').className).toBe(hintAnatomy.classes.root);
  });

  it('element form: another element gives the same class, keeps its own props and the ref', () => {
    const ref = createRef<HTMLDivElement>();
    const own = createRef<HTMLParagraphElement>();
    render(
      <Hint
        data-testid="hint"
        ref={ref}
        id="h"
        render={
          <p ref={own} className="mine">
            own
          </p>
        }
      >
        Help
      </Hint>,
    );
    const hint = screen.getByTestId('hint');
    expect(hint.tagName).toBe('P');
    expect(hint.className).toBe(`${hintAnatomy.classes.root} mine`);
    expect(hint.id).toBe('h');
    expect(hint.textContent).toBe('Help');
    expect(ref.current).toBe(hint);
    expect(own.current).toBe(hint);
  });

  it('function form: receives all props, ref and children', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Hint data-testid="hint" ref={ref} render={(props) => <span {...props} />}>
        Help
      </Hint>,
    );
    const hint = screen.getByTestId('hint');
    expect(hint.tagName).toBe('SPAN');
    expect(hint.className).toBe(hintAnatomy.classes.root);
    expect(hint.textContent).toBe('Help');
    expect(ref.current).toBe(hint);
  });
});
