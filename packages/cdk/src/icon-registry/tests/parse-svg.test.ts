// @vitest-environment jsdom
import { checkIcon, heartFillIcon } from '@cocokits/icons';
import { describe, expect, it } from 'vitest';
import { parseSvg } from '../index';

describe('parseSvg', () => {
  it('returns the viewBox and the inner markup of a full svg', () => {
    const icon = parseSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${checkIcon.viewBox}">${checkIcon.body}</svg>`,
    );
    expect(icon?.viewBox).toBe(checkIcon.viewBox);
    expect(icon?.body).toContain('<path');
    expect(icon?.body).toContain('fill="currentColor"');
    expect(icon?.body).not.toContain('xmlns');
  });

  it('keeps every child of the svg, not only paths', () => {
    const icon = parseSvg('<svg viewBox="0 0 8 8"><g><circle cx="4" cy="4" r="3"/></g><path d="M0 0h1"/></svg>');
    expect(icon?.body).toContain('<g>');
    expect(icon?.body).toContain('<circle');
    expect(icon?.body).toContain('<path');
  });

  it('round-trips a pack icon with attributes', () => {
    const icon = parseSvg(`<svg viewBox="${heartFillIcon.viewBox}">${heartFillIcon.body}</svg>`);
    expect(icon?.viewBox).toBe(heartFillIcon.viewBox);
    expect(icon?.body.replace(/\s*\/>/g, '></path>')).toContain('d=');
  });

  it('falls back to the width and height for the viewBox', () => {
    expect(parseSvg('<svg width="20" height="10"><path d="M0 0h1"/></svg>')?.viewBox).toBe('0 0 20 10');
  });

  it('returns undefined for other markup or a missing viewBox', () => {
    expect(parseSvg('<p>text</p>')).toBeUndefined();
    expect(parseSvg('not markup')).toBeUndefined();
    expect(parseSvg('<svg><path d="M0 0h1"/></svg>')).toBeUndefined();
    expect(parseSvg('<svg width="2em" height="2em"></svg>')).toBeUndefined();
  });
});
