import { Logger } from '../../../utils/logger';
import { DesignTokenShadow } from '../token.model';

/**
 * Generates a CSS value for a given shadow design token. It processes the token
 * to determine whether it represents a blur or a shadow and constructs the corresponding
 * CSS value string.
 *
 * @param token - A design token representing a shadow.
 * @returns {string | null} - A CSS value string for the shadow or null if the token is unsupported.
 */
export function shadowCss(token: DesignTokenShadow): string | null {
  if (isBlur(token.value)) {
    return `${token.value.blur}`;
  }

  if (isShadow(token.value)) {
    const shadows = token.value.map((value) => {
      const { inset, offsetX, offsetY, blur, spread, color } = value;
      return `${inset ? 'inset' : ''} ${offsetX} ${offsetY} ${blur} ${spread} ${color}`.trim();
    });

    return shadows.join(', ');
  }

  Logger.warning(`Unsupported shadow: ${JSON.stringify(token)}. This value will be skipped from generator`);
  return null;
}

/**
 * Checks if the value represents a blur.
 */
function isBlur(value: DesignTokenShadow['value']): value is { blur: string } {
  const values = Object.keys(value);
  return values.length === 1 && values[0] === 'blur';
}

/**
 * Checks if the value represents a shadow.
 */
function isShadow(
  value: DesignTokenShadow['value']
): value is { color: string; offsetX: string; offsetY: string; blur: string; spread: string; inset?: boolean } {
  const firstItem = value[0];
  return (
    'color' in firstItem &&
    'offsetX' in firstItem &&
    'offsetY' in firstItem &&
    'blur' in firstItem &&
    'spread' in firstItem
  );
}
