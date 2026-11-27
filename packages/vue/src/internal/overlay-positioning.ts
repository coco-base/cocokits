import { computed, type WatchSource } from 'vue';
import type { OverlayPositionOptions } from '@cocokits/cdk/positioning';
import type { OverlayArrowProps, OverlayPositioningProps } from './overlay-positioning.types';

/** The props a content reads for its placement; a Select content has no arrow ones. */
export type PositioningValues = OverlayPositioningProps & OverlayArrowProps;

/** The positioning options a prop can set. */
type PlacementOptions = Partial<
  Pick<
    OverlayPositionOptions,
    | 'sideOffset'
    | 'alignOffset'
    | 'avoidCollisions'
    | 'collisionPadding'
    | 'sticky'
    | 'hideWhenDetached'
    | 'onAnchorHiddenChange'
    | 'arrowPadding'
    | 'hideShiftedArrow'
    | 'collisionBoundary'
    | 'updatePositionStrategy'
    | 'sideFlip'
    | 'alignFlip'
    | 'prioritizePosition'
    | 'disableUpdateOnLayoutShift'
  >
>;

const PASSED = [
  'sideOffset',
  'alignOffset',
  'avoidCollisions',
  'collisionPadding',
  'sticky',
  'arrowPadding',
  'hideShiftedArrow',
  'updatePositionStrategy',
  'sideFlip',
  'alignFlip',
  'prioritizePosition',
  'disableUpdateOnLayoutShift',
] as const;

/** The elements of a boundary prop as a list. */
function listOf(boundary: PositioningValues['collisionBoundary']): readonly Element[] {
  if (boundary === undefined || boundary === null) return [];
  return ('nodeType' in boundary ? [boundary] : boundary).filter((element): element is Element => element !== null);
}

/**
 * What a Popover, Tooltip or Select content hands to the positioning module. An unset prop is not passed, so the
 * positioning default applies.
 *
 * @param props - The props of the content.
 * @param onAnchorHiddenChange - Receives whether the anchor is fully hidden; only passed with `hideWhenDetached`.
 * @returns `options` for the module, and `sources` to watch: positioning restarts when one changes.
 */
export function useOverlayPositioning(
  props: PositioningValues,
  onAnchorHiddenChange: (hidden: boolean) => void,
): { readonly sources: WatchSource[]; readonly options: () => PlacementOptions } {
  // A padding object or a boundary list written inline in a template is new on every render; its members are what
  // count.
  const paddingKey = computed(() => {
    const padding = props.collisionPadding;
    return typeof padding === 'object' ? [padding.top, padding.right, padding.bottom, padding.left].join(';') : padding;
  });
  let boundary: readonly Element[] = [];
  const boundaries = computed(() => {
    const next = listOf(props.collisionBoundary);
    if (next.length !== boundary.length || next.some((element, index) => element !== boundary[index])) boundary = next;
    return boundary;
  });
  return {
    sources: [
      ...PASSED.filter((key) => key !== 'collisionPadding').map((key) => () => props[key]),
      paddingKey,
      boundaries,
      () => props.hideWhenDetached,
    ],
    options: () => {
      const set: Record<string, unknown> = {};
      for (const key of PASSED) {
        if (props[key] !== undefined) set[key] = props[key];
      }
      return {
        ...(set as PlacementOptions),
        ...(boundaries.value.length > 0 ? { collisionBoundary: boundaries.value } : {}),
        ...(props.hideWhenDetached ? { hideWhenDetached: true, onAnchorHiddenChange } : {}),
      };
    },
  };
}
