// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Example } from './fixtures';

describe('Accordion on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the default-open item open and the others without content', () => {
    const html = renderToString(<Example defaultValue="returns" />);
    const triggers = [...html.matchAll(/<button\b[^>]*aria-expanded[^>]*>/g)].map((match) => match[0]);
    expect(triggers).toHaveLength(3);
    expect(triggers[0]).toContain('aria-expanded="false"');
    expect(triggers[0]).not.toContain('aria-controls');
    expect(triggers[1]).toContain('aria-expanded="true"');
    expect(triggers[1]).toContain('aria-controls="');
    expect(triggers[1]).toContain('aria-disabled="true"');
    expect(triggers[1]).toContain('data-state="open"');
    expect(html.match(/role="region"/g)).toHaveLength(1);
    expect(html).toContain('Send it back within 30 days.');
    expect(html).not.toContain('Orders leave');
    expect(html).not.toContain('--accordion-content');
  });

  it('renders every open item of a multiple accordion', () => {
    const html = renderToString(<Example type="multiple" defaultValue={['shipping', 'warranty']} />);
    expect(html.match(/role="region"/g)).toHaveLength(2);
    expect(html).not.toContain('aria-disabled');
    expect(html).toMatch(/<div\b[^>]*\sdata-multiple=""/);
  });

  it('renders a force-mounted closed content hidden, with its children', () => {
    const html = renderToString(<Example forceMountWarranty />);
    const region = /<div\b[^>]*role="region"[^>]*>/.exec(html)?.[0] ?? '';
    expect(region).toContain('hidden');
    expect(region).toContain('data-state="closed"');
    expect(html).toContain('Two years.');
  });

  it('renders a disabled item and the root orientation', () => {
    const html = renderToString(<Example lockReturns orientation="horizontal" />);
    expect(html).toContain('data-orientation="horizontal"');
    expect(html).not.toContain('data-multiple');
    expect(html).toMatch(/<button\b(?=[^>]*\bdisabled=)(?=[^>]*data-disabled="")/);
  });
});
