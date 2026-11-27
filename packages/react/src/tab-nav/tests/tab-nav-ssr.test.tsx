// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Example } from './fixtures';

const linksOf = (html: string): string[] => [...html.matchAll(/<a\b[^>]*>/g)].map((match) => match[0]);

describe('TabNav on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders every part with the active link marked and the indicator in place', () => {
    const html = renderToString(<Example active="activity" />);
    expect(html).toMatch(/<nav\b(?=[^>]*class="cck-tab-nav")(?=[^>]*aria-label="Project")/);
    expect(html).toContain('class="cck-tab-nav__list"');
    const links = linksOf(html);
    expect(links).toHaveLength(3);
    expect(links[0]).not.toContain('aria-current');
    expect(links[1]).toContain('aria-current="page"');
    expect(links[1]).toContain('data-active=""');
    expect(html).toMatch(/<span\b(?=[^>]*class="cck-tab-nav__indicator")(?=[^>]*aria-hidden="true")/);
  });

  it('marks a disabled link', () => {
    const links = linksOf(renderToString(<Example lockSettings />));
    expect(links[2]).toContain('aria-disabled="true"');
    expect(links[2]).toContain('data-disabled=""');
    expect(links[2]).toContain('tabindex="-1"');
  });

  it('writes no indicator variable on the server', () => {
    expect(renderToString(<Example />)).not.toContain('--active-tab');
  });
});
