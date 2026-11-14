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
    expect(html).toContain('aria-labelledby="on-content"');
    expect(html).toContain('data-icon="close"');
    const off = /<div[^>]*id="off"[^>]*>/.exec(html)?.[0] ?? '';
    expect(off).toContain('data-disabled=""');
    const button = /<button[^>]*aria-labelledby="off-content"[^>]*>/.exec(html)?.[0] ?? '';
    expect(button).toContain('disabled=""');
    expect(button).toContain('type="button"');
  });

  it('gives a chip with no id a generated one that the content id follows', () => {
    const html = renderToString(<Chip>Pizza</Chip>);
    const id = /<div class="cck-chip" id="([^"]+)"/.exec(html)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`id="${id ?? ''}-content"`);
  });
});
