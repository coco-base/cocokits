// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { tabNavMeta } from '@cocokits/machines/tab-nav';
import { Example } from './fixtures';

afterEach(cleanup);

describe('TabNav accessibility (axe)', () => {
  it('has no violations, also with a disabled link', async () => {
    const { container } = render(<Example active="activity" lockSettings />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is a labelled navigation landmark of links, not a tablist', () => {
    render(<Example />);
    expect(screen.getByRole('navigation', { name: 'Project' })).toBeTruthy();
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(tabNavMeta.roles.link).toBeNull();
  });
});
