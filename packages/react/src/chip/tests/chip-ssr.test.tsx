// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Chip } from '../index';

describe('Chip on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the parts, the icon and the disabled markers', () => {
    const html = renderToString(
      <>
        <Chip id="on" removable>
          Pizza
        </Chip>
        <Chip id="off" removable disabled>
          Salad
        </Chip>
      </>,
    );
    expect(html).toContain('<div class="cck-chip" id="on">');
    expect(html).toContain('<span class="cck-chip__content-wrapper" id="on-content">Pizza</span>');
    expect(html).toContain('aria-labelledby="on-remove on-content"');
    expect(html).toContain('aria-label="Remove"');
    expect(html).toContain('data-icon="close"');
    const off = /<div[^>]*id="off"[^>]*>/.exec(html)?.[0] ?? '';
    expect(off).toContain('data-disabled=""');
    // A disabled chip renders no remove button.
    expect(html).not.toContain('id="off-remove"');
  });

  it('gives a chip with no id a generated one that the content id follows', () => {
    const html = renderToString(<Chip>Pizza</Chip>);
    const id = /<div class="cck-chip" id="([^"]+)"/.exec(html)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`id="${id ?? ''}-content"`);
  });

  it('renders a selectable chip as a toggle button with a check and the remove button beside it', () => {
    const html = renderToString(
      <Chip id="c" selected removable>
        Pizza
      </Chip>,
    );
    expect(html).toContain('<span class="cck-chip__check" aria-hidden="true" data-state="checked">');
    expect(html).toMatch(/<button[^>]*class="cck-chip__content-wrapper"[^>]*aria-pressed="true"[^>]*data-selected=""/);
    expect(html).toMatch(/<button[^>]*class="cck-chip__remove"/);
    expect(html).toContain('data-icon="check"');
  });
});
