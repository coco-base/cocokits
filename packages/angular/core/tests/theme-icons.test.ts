import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { defineThemeConfig, type SvgIconSet } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { provideCckTheme, themeIcons } from '../src/index';

const icons: SvgIconSet = { star: { viewBox: '0 0 24 24', paths: [{ d: 'M0 0' }] } };
const partIconNames = { select: { dropdownIcon: 'star' } };
const themeConfig = defineThemeConfig({ name: 'test', components: {}, icons, partIconNames });

@Component({ selector: 'test-reader', template: `<i data-testid="out">{{ json }}</i>` })
class Reader {
  protected readonly json = JSON.stringify(themeIcons());
}

describe('themeIcons', () => {
  it('returns empty records without a provided theme', async () => {
    await render(Reader);
    expect(screen.getByTestId('out').textContent).toBe('{"icons":{},"partIconNames":{}}');
  });

  it('returns the fields of the provided theme', async () => {
    await render(Reader, { providers: [provideCckTheme(themeConfig)] });
    expect(JSON.parse(screen.getByTestId('out').textContent)).toEqual({ icons, partIconNames });
  });

  it('returns empty records for a theme that has no icon fields', async () => {
    await render(Reader, { providers: [provideCckTheme(defineThemeConfig({ name: 'bare', components: {} }))] });
    expect(screen.getByTestId('out').textContent).toBe('{"icons":{},"partIconNames":{}}');
  });
});
