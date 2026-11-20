// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { hintAnatomy, hintMeta } from '@cocokits/machines/hint';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { Hint } from '../index';

afterEach(cleanup);

describe('Hint', () => {
  it('renders the default element of the meta with the class, no role and no other attribute', () => {
    render(<Hint data-testid="hint">Help</Hint>);
    const hint = screen.getByTestId('hint');
    expect(hint.tagName.toLowerCase()).toBe(hintMeta.defaultElements?.root);
    expect(hint.className).toBe(hintAnatomy.classes.root);
    expect(hint.getAttributeNames().sort()).toEqual(['class', 'data-testid']);
  });

  it('passes id and native attributes, joins className and forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Hint data-testid="hint" ref={ref} id="email-hint" className="mine" style={{ color: 'red' }}>
        Help
      </Hint>,
    );
    const hint = screen.getByTestId('hint');
    expect(hint.id).toBe('email-hint');
    expect(hint.className).toBe(`${hintAnatomy.classes.root} mine`);
    expect(hint.style.color).toBe('red');
    expect(ref.current).toBe(hint);
  });

  it('puts the theme attribute on its root', () => {
    const config = defineThemeConfig({
      name: 'test',
      components: {
        hint: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(hintAnatomy.parts) },
        },
      },
    });
    render(
      <ThemeProvider themeConfig={config}>
        <Hint data-testid="hint">Help</Hint>
      </ThemeProvider>,
    );
    expect(screen.getByTestId('hint').getAttribute('data-probe')).toBe('on');
  });
});
