// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { heartIcon } from '@cocokits/icons';
import { IconProvider, ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { drawnIconsIn } from '../../internal/tests/part-icon-fixtures';
import { Chip } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const chip = (): HTMLElement => {
  const found = screen.getByText('Pizza').closest<HTMLElement>('.cck-chip');
  if (!found) throw new Error('Expected a chip.');
  return found;
};
const remove = (): HTMLElement => screen.getByRole('button', { name: 'Pizza' });

describe('Chip parts', () => {
  it('renders a div root with the content wrapper and no remove button', () => {
    render(<Chip>Pizza</Chip>);
    expect(chip().tagName).toBe('DIV');
    expect(chip().hasAttribute('data-disabled')).toBe(false);
    const wrapper = chip().querySelector('.cck-chip__content-wrapper');
    expect(wrapper?.tagName).toBe('SPAN');
    expect(wrapper?.textContent).toBe('Pizza');
    expect(wrapper?.id).toBe(`${chip().id}-content`);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('uses the author id and derives the content id from it', () => {
    render(<Chip id="mine">Pizza</Chip>);
    expect(chip().id).toBe('mine');
    expect(chip().querySelector('.cck-chip__content-wrapper')?.id).toBe('mine-content');
  });

  it('renders a native remove button named by the content', () => {
    render(<Chip removable>Pizza</Chip>);
    const button = remove();
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.className).toBe('cck-chip__remove');
    expect(button.getAttribute('aria-labelledby')).toBe(`${chip().id}-content`);
    expect(button.hasAttribute('data-disabled')).toBe(false);
  });

  it('passes native attributes to the root and the ref reaches it', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Chip ref={ref} className="mine" title="Topping">
        Pizza
      </Chip>,
    );
    expect(ref.current).toBe(chip());
    expect(chip().className).toBe('cck-chip mine');
    expect(chip().getAttribute('title')).toBe('Topping');
  });

  it('cannot replace the machine data attributes', () => {
    render(<Chip data-disabled="">Pizza</Chip>);
    expect(chip().hasAttribute('data-disabled')).toBe(false);
  });

  it('renders the root as the element given to render, keeping the parts', () => {
    render(
      <Chip removable render={<li data-own="" />}>
        Pizza
      </Chip>,
    );
    expect(chip().tagName).toBe('LI');
    expect(chip().hasAttribute('data-own')).toBe(true);
    expect(chip().querySelector('.cck-chip__content-wrapper')).not.toBeNull();
    expect(remove()).toBeTruthy();
  });

  it('gives the function form of render the merged props', () => {
    render(<Chip render={(props) => <section {...props} data-fn="" />}>Pizza</Chip>);
    expect(chip().tagName).toBe('SECTION');
    expect(chip().getAttribute('data-fn')).toBe('');
  });
});

describe('Chip remove event', () => {
  it('reports once, with no payload, for a click, Enter and Space', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <Chip removable onRemove={onRemove}>
        Pizza
      </Chip>,
    );
    await user.click(remove());
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenLastCalledWith();
    remove().focus();
    await user.keyboard('{Enter}');
    expect(onRemove).toHaveBeenCalledTimes(2);
    await user.keyboard(' ');
    expect(onRemove).toHaveBeenCalledTimes(3);
  });

  it('never removes itself', async () => {
    const user = userEvent.setup();
    render(<Chip removable>Pizza</Chip>);
    await user.click(remove());
    expect(chip()).toBeTruthy();
  });

  it('marks the chip and the button disabled and reports nothing', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <Chip removable disabled onRemove={onRemove}>
        Pizza
      </Chip>,
    );
    expect(chip().hasAttribute('data-disabled')).toBe(true);
    expect(remove().hasAttribute('disabled')).toBe(true);
    expect(remove().hasAttribute('data-disabled')).toBe(true);
    await user.click(remove());
    expect(onRemove).not.toHaveBeenCalled();
  });
});

describe('Chip remove icon', () => {
  it('draws the default close icon, aria-hidden, without a theme', () => {
    render(<Chip removable>Pizza</Chip>);
    expect(drawnIconsIn(remove())).toEqual(['close']);
    expect(remove().querySelector('.cck-svg-icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws the icon the theme names in components.chip.icons.remove', () => {
    const theme = defineThemeConfig({ name: 'test', components: { chip: { icons: { remove: 'heart' } } } });
    render(
      <ThemeProvider themeConfig={theme}>
        <IconProvider icons={{ heart: heartIcon }}>
          <Chip removable>Pizza</Chip>
        </IconProvider>
      </ThemeProvider>,
    );
    expect(drawnIconsIn(remove())).toEqual(['heart']);
  });

  it('draws no icon without removable', () => {
    render(<Chip>Pizza</Chip>);
    expect(drawnIconsIn(chip())).toEqual([]);
  });
});
