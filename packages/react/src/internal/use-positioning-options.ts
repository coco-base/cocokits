'use client';

import { useMemo, useState } from 'react';
import type { OverlayPositionOptions } from '@cocokits/cdk/positioning';
import type { OverlayArrowProps, OverlayPositioningProps } from './overlay-positioning.types';

/** The positioning options an overlay content passes on, and whether `hideWhenDetached` has hidden it. */
export interface PositioningOptions {
  /** Only the options the author set, so the positioning defaults apply to the rest. */
  readonly options: Partial<OverlayPositionOptions>;
  /** Whether the anchor is fully hidden by its clipping ancestors; only with `hideWhenDetached`. */
  readonly anchorHidden: boolean;
  /** Whether the arrow cannot point at the anchor; only with an arrow element. */
  readonly arrowHidden: boolean;
}

type Boundary = OverlayPositioningProps['collisionBoundary'];

/** The boundary list of a prop value; an inline array is a new object on every render, its elements are what count. */
function boundaryList(value: Boundary): readonly (Element | null)[] | undefined {
  if (value === undefined) return undefined;
  if (value === null) return [];
  return value instanceof Element ? [value] : value;
}

/** Whether two boundary lists hold the same elements in the same order. */
function sameBoundary(a: readonly (Element | null)[] | undefined, b: readonly (Element | null)[] | undefined): boolean {
  if (a === b) return true;
  return a?.length === b?.length && (a?.every((element, index) => element === b?.[index]) ?? false);
}

/** Keeps the previous list while the elements are the same, so an effect does not restart for a new array. */
function useStableBoundary(value: Boundary): readonly (Element | null)[] | undefined {
  const next = boundaryList(value);
  const [stable, setStable] = useState(next);
  if (sameBoundary(stable, next)) return stable;
  setStable(next);
  return next;
}

/** The options the arrow and the update strategy add; only what is set, and the arrow ones only with an arrow. */
function extraOptions(
  props: OverlayPositioningProps & OverlayArrowProps,
  boundary: readonly (Element | null)[] | undefined,
  arrow: Element | null,
  setArrowHidden: (hidden: boolean) => void,
): Partial<OverlayPositionOptions> {
  const { updatePositionStrategy, arrowPadding } = props;
  return {
    ...(boundary === undefined ? {} : { collisionBoundary: boundary }),
    ...(updatePositionStrategy === undefined ? {} : { updatePositionStrategy }),
    ...(arrow === null
      ? {}
      : {
          getArrow: () => arrow,
          onArrowHiddenChange: setArrowHidden,
          ...(arrowPadding === undefined ? {} : { arrowPadding }),
        }),
  };
}

/**
 * Turns the shared positioning props into the options of `startOverlayPosition`. The result is stable while the
 * values are, so an effect can depend on it. A padding object written inline is a new object on every render:
 * its four values are what count.
 *
 * @param props - The shared positioning props of a content, and `arrowPadding` for one that holds an arrow.
 * @param arrow - The arrow element of the content, `null` while there is none; the arrow options are passed only with one.
 * @returns The options to spread into `startOverlayPosition`, and the anchor-hidden and arrow-hidden facts.
 */
export function usePositioningOptions(
  props: OverlayPositioningProps & OverlayArrowProps,
  arrow: Element | null = null,
): PositioningOptions {
  const {
    sideOffset,
    alignOffset,
    avoidCollisions,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    arrowPadding,
  } = props;
  const boundary = useStableBoundary(props.collisionBoundary);
  const [anchorHidden, setAnchorHidden] = useState(false);
  const [arrowHidden, setArrowHidden] = useState(false);
  const paddingObject = typeof collisionPadding === 'object' ? collisionPadding : undefined;
  const hasPaddingObject = paddingObject !== undefined;
  const paddingNumber = typeof collisionPadding === 'number' ? collisionPadding : undefined;
  const { top, right, bottom, left } = paddingObject ?? {};
  const options = useMemo<Partial<OverlayPositionOptions>>(() => {
    const padding = hasPaddingObject
      ? {
          ...(top === undefined ? {} : { top }),
          ...(right === undefined ? {} : { right }),
          ...(bottom === undefined ? {} : { bottom }),
          ...(left === undefined ? {} : { left }),
        }
      : paddingNumber;
    return {
      ...(sideOffset === undefined ? {} : { sideOffset }),
      ...(alignOffset === undefined ? {} : { alignOffset }),
      ...(avoidCollisions === undefined ? {} : { avoidCollisions }),
      ...(padding === undefined ? {} : { collisionPadding: padding }),
      ...(sticky === undefined ? {} : { sticky }),
      ...(hideWhenDetached ? { hideWhenDetached, onAnchorHiddenChange: setAnchorHidden } : {}),
      ...extraOptions({ updatePositionStrategy, arrowPadding }, boundary, arrow, setArrowHidden),
    };
  }, [
    sideOffset,
    alignOffset,
    avoidCollisions,
    hasPaddingObject,
    paddingNumber,
    top,
    right,
    bottom,
    left,
    sticky,
    hideWhenDetached,
    boundary,
    updatePositionStrategy,
    arrow,
    arrowPadding,
  ]);
  return { options, anchorHidden, arrowHidden: arrow !== null && arrowHidden };
}
