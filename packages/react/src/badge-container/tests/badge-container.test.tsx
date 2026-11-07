// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef, StrictMode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { badgeContainerAnatomy, badgeContainerMeta } from '@cocokits/machines/badge-container';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { Badge } from '../../badge';
import { BadgeContainer } from '../index';

afterEach(cleanup);

// An option that targets every part of the anatomy.
const allPartsConfig = defineThemeConfig({
  name: 'test',
  components: {
    [badgeContainerAnatomy.block]: {
      probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(badgeContainerAnatomy.parts) },
    },
  },
});

const badge = (name = 'badge'): HTMLElement => screen.getByTestId(name);

describe('BadgeContainer (rendered contract)', () => {
  it('renders a div with the class, no style and the children in order', () => {
    render(
      <BadgeContainer data-testid="container">
        <button type="button">Inbox</button>
        <Badge content={2} />
      </BadgeContainer>,
    );
    const container = screen.getByTestId('container');
    expect(container.tagName).toBe('DIV');
    expect(container.className).toBe('cck-badge-container');
    expect(container.hasAttribute('style')).toBe(false);
    expect([...container.children].map((child) => child.tagName)).toEqual(['BUTTON', 'SPAN']);
    expect(container.hasAttribute('role')).toBe(false);
  });

  it('joins className, merges style and forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<BadgeContainer data-testid="container" ref={ref} className="mine" style={{ color: 'red' }} />);
    const container = screen.getByTestId('container');
    expect(ref.current).toBe(container);
    expect(container.className).toBe('cck-badge-container mine');
    expect(container.style.color).toBe('red');
  });

  it('puts data-position on the container root, top-right by default, and none on the badge', () => {
    const { rerender } = render(
      <BadgeContainer data-testid="container">
        <button type="button">Inbox</button>
        <Badge data-testid="badge" content={2} />
      </BadgeContainer>,
    );
    expect(screen.getByTestId('container').getAttribute('data-position')).toBe('top-right');
    expect(badge().hasAttribute('data-position')).toBe(false);
    rerender(
      <BadgeContainer data-testid="container" position="bottom-left">
        <Badge data-testid="badge" content={2} hide />
      </BadgeContainer>,
    );
    expect(screen.getByTestId('container').getAttribute('data-position')).toBe('bottom-left');
    expect(badge().hasAttribute('hidden')).toBe(true);
  });

  it('renders the badge as a direct child of the container, with no wrapper', () => {
    render(
      <StrictMode>
        <BadgeContainer data-testid="container">
          <Badge data-testid="badge" content={2} />
        </BadgeContainer>
      </StrictMode>,
    );
    expect(badge().parentElement).toBe(screen.getByTestId('container'));
  });

  it('renders the default element of the meta, with the declared data-* only', () => {
    render(<BadgeContainer data-testid="container" />);
    const container = screen.getByTestId('container');
    expect(container.tagName.toLowerCase()).toBe(badgeContainerMeta.defaultElements?.root);
    const names = container.getAttributeNames().filter((name) => name.startsWith('data-') && name !== 'data-testid');
    expect(names.every((name) => badgeContainerMeta.dataAttrs.root.includes(name))).toBe(true);
  });
});

describe('BadgeContainer theme', () => {
  it('puts the theme attribute on every rendered part', () => {
    const { container } = render(
      <ThemeProvider themeConfig={allPartsConfig}>
        <BadgeContainer />
      </ThemeProvider>,
    );
    for (const className of Object.values(badgeContainerAnatomy.classes)) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});
