import { describe, expect, it } from 'vitest';
import { visuallyHiddenStyle, visuallyHiddenStyleText } from '../src/index';

const kebab = (name: string): string => name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

describe('visuallyHiddenStyle', () => {
  it('takes the element out of sight and layout without display: none', () => {
    expect(visuallyHiddenStyle).toMatchObject({
      position: 'absolute',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
    });
    expect(visuallyHiddenStyle).toHaveProperty('clipPath', 'inset(50%)');
    expect(visuallyHiddenStyle).not.toHaveProperty('display');
    expect(visuallyHiddenStyle).not.toHaveProperty('visibility');
  });

  it('is the same style as the text form, declaration for declaration', () => {
    const fromObject = Object.entries(visuallyHiddenStyle).map(([name, value]) => `${kebab(name)}:${value}`);
    expect(visuallyHiddenStyleText.split(';')).toEqual(fromObject);
  });
});
