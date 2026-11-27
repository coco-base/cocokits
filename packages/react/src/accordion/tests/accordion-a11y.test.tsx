// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { accordionMeta } from '@cocokits/machines/accordion';
import { drawnIconsIn, withPartIcons } from '../../internal/tests/part-icon-fixtures';
import { Example } from './fixtures';

afterEach(cleanup);

describe('Accordion accessibility (axe)', () => {
  it('has no violations when closed and when open', async () => {
    const { container } = render(<Example />);
    expect((await axe(container)).violations).toEqual([]);
    await userEvent.click(screen.getByRole('button', { name: 'Shipping' }));
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no violations with a disabled item', async () => {
    const { container } = render(<Example lockReturns defaultValue="shipping" />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no violations when the open item cannot be collapsed, and when collapsible', async () => {
    const first = render(<Example defaultValue="shipping" />);
    expect((await axe(first.container)).violations).toEqual([]);
    first.unmount();
    const second = render(<Example collapsible defaultValue="shipping" />);
    expect((await axe(second.container)).violations).toEqual([]);
  });

  it('has no violations when multiple with a force-mounted closed content', async () => {
    const { container } = render(<Example type="multiple" defaultValue={['shipping']} forceMountWarranty />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('follows the APG accordion pattern: a heading with one button, and a labelled region', () => {
    render(<Example defaultValue="shipping" />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    for (const heading of screen.getAllByRole('heading')) {
      expect(heading.children).toHaveLength(1);
      expect(heading.firstElementChild?.tagName).toBe('BUTTON');
    }
    expect(screen.getByRole('region', { name: 'Shipping' }).textContent).toContain('Orders leave');
    expect(accordionMeta.apg).toContain('/patterns/accordion/');
    expect(accordionMeta.roles.content).toBe('region');
  });
});

describe('Accordion accessibility with the theme icons', () => {
  it('has no violations with the indicator icon, closed and open', async () => {
    const { container } = render(withPartIcons(<Example />));
    expect(drawnIconsIn(container)).toContain('chevron-down');
    expect((await axe(container)).violations).toEqual([]);
    await userEvent.click(screen.getByRole('button', { name: 'Shipping' }));
    expect((await axe(container)).violations).toEqual([]);
  });
});
