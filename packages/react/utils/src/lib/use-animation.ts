import { useLayoutEffect, useRef } from 'react';

import { Animation, AnimationProperties } from '@cocokits/common-utils';

// TODO: it's defined in `@cocokits/core`, but since we can not import core into utils, we have to redefine it here.'
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Options for the `useAnimation` hook.
 */
export interface AnimationOption {
  /**
   * Initial partial values to apply immediately on mount.
   * - `dimension`   : width/height
   * - `transform`   : x, y, scale
   * - `opacity`     : opacity
   */
  initializeValues?: DeepPartial<AnimationProperties>;
}

/**
 * A custom hook that creates or reuses an `Animation` instance for the given element
 * ref, applies any initial values immediately, and returns the instance.
 *
 * Internally it calls `Animation.getOrCreateInstance(ref.current)` from
 * `@cocokits/common-utils`, sets up dimension, translate, scale, and opacity
 * (if provided), then applies them before the first paint via `useLayoutEffect`.
 *
 * @param ref
 *   A React ref pointing to an HTMLElement to animate.
 * @param options
 *   Optional settings:
 *   - `initializeValues` : partial animation properties to set immediately.
 *
 * @returns
 *   The `Animation` instance tied to the element, or `null` if the ref is not yet attached.
 *
 * @example
 * function FadeInBox() {
 *   const boxRef = useRef<HTMLDivElement>(null)
 *   const animation = useAnimation(boxRef, {
 *     initializeValues: {
 *       opacity: 0,
 *       transform: { scale: 0.5 }
 *     }
 *   })
 *
 *   // For other examples, check the Animation documentation.
 *   onClick = () => {
 *     if (animation) {
 *      animation
 *        .setDimension({ width: 100, height: 100 })
 *       .setTranslate({ x: 50, y: 50 })
 *       .animate()
 *     }
 *   }
 *
 *   return <div ref={boxRef} className="box" onClick={onClick}>Hello</div>
 * }
 * @see {@link Animation} for more details on the animation API.
 * @see {@link AnimationProperties} for the properties that can be set.
 */
export function useAnimation(ref: React.RefObject<HTMLElement>, options: AnimationOption = {}): Animation | null {
  const animationRef = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      const _animation = Animation.getOrCreateInstance(ref.current);
      animationRef.current = _animation;
      _animation
        .setDimension({
          width: options?.initializeValues?.dimension?.width,
          height: options?.initializeValues?.dimension?.height,
        })
        .setTranslate({
          x: options?.initializeValues?.transform?.x,
          y: options?.initializeValues?.transform?.y,
        })
        .setScale(options?.initializeValues?.transform?.scale)
        .setOpacity(options?.initializeValues?.opacity)
        .applyImmediately();
    }
  }, [ref.current]);

  return animationRef.current;
}
