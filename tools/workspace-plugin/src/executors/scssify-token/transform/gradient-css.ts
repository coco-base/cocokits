import { DesignTokenGradient } from '../token.model';

type Stop = DesignTokenGradient['value']['stops'][number];

/**
 * Generates a CSS gradient string for a given gradient design token.
 * It processes the token to construct the corresponding CSS value string
 * including the gradient type, angle, and color stops.
 *
 * @param token - A design token representing a gradient.
 * @returns A CSS gradient string for the gradient.
 */
export function gradientCss(token: DesignTokenGradient): string {
  const stops: string = token.value.stops.map((stop) => toStep(stop)).join(', ');
  return token.value.type === 'linear'
    ? `linear-gradient(${token.value.angle ? token.value.angle + 'deg, ' : ''}${stops})`
    : `radial-gradient(circle, ${stops})`;
}

/**
 * Converts a gradient stop to a string representing the color and position.
 * It processes the stop to include the color and, if present, the position as a percentage.
 *
 * @param stop - A stop in the gradient design token.
 * @returns A string representing the color and position of the stop.
 */
function toStep(stop: Stop): string {
  const positionPercentage = stop.position ? ` ${Math.floor(stop.position * 100)}%` : '';
  return `${stop.color}${positionPercentage}`;
}
