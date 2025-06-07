/** @module _hidden */

import { TransformProperty } from './animation.model';
import { isNotNullish } from '../ensure/ensure-nullish';

export function getTransform2dValue({
  x = 0,
  y = 0,
  scale = 1,
  scaleX,
  scaleY,
  rotateX,
  rotateY,
}: Partial<TransformProperty>): string {
  const transformations = [
    `translate(${x}px, ${y}px)`,
    isNotNullish(rotateX) ? `rotateX(${rotateX}deg)` : '',
    isNotNullish(rotateY) ? `rotateY(${rotateY}deg)` : '',
    `scale(${scale}, ${scale})`,
    isNotNullish(scaleX) ? `scaleX(${scaleX})` : '',
    isNotNullish(scaleY) ? `scaleY(${scaleY})` : '',
  ];

  return transformations.filter(Boolean).join(' ');
}

/**
 * No unit tests; implicitly tested via public functions that use this private helper.
 */
export function getAnimationValueOnProgress(progress: number, startValue?: number, endValue?: number) {
  if (startValue === undefined || endValue === undefined) {
    return startValue ?? endValue;
  }

  const progressFactor = endValue - startValue;
  const valueOnProgress = progress * progressFactor;
  return startValue + valueOnProgress;
}
