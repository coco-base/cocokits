// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { reactive, watch } from 'vue';
import { useOverlayPositioning, type PositioningValues } from '../overlay-positioning';

function setup(initial: PositioningValues) {
  const props = reactive<{ -readonly [K in keyof PositioningValues]: PositioningValues[K] }>(initial);
  const onHidden = vi.fn();
  return { props, onHidden, ...useOverlayPositioning(props, onHidden) };
}

describe('useOverlayPositioning', () => {
  it('passes nothing for unset props', () => {
    expect(setup({}).options()).toEqual({});
  });

  it('passes every set prop under the name of the positioning option', () => {
    const boundary = document.createElement('div');
    const { options } = setup({
      sideOffset: 8,
      alignOffset: 2,
      avoidCollisions: false,
      collisionPadding: 12,
      sticky: 'always',
      arrowPadding: 4,
      hideShiftedArrow: false,
      updatePositionStrategy: 'always',
      sideFlip: false,
      alignFlip: false,
      prioritizePosition: true,
      disableUpdateOnLayoutShift: true,
      collisionBoundary: [boundary, null],
    });
    expect(options()).toEqual({
      sideOffset: 8,
      alignOffset: 2,
      avoidCollisions: false,
      collisionPadding: 12,
      sticky: 'always',
      arrowPadding: 4,
      hideShiftedArrow: false,
      updatePositionStrategy: 'always',
      sideFlip: false,
      alignFlip: false,
      prioritizePosition: true,
      disableUpdateOnLayoutShift: true,
      collisionBoundary: [boundary],
    });
  });

  it('accepts one boundary element, and treats `null` and an empty list as none', () => {
    const boundary = document.createElement('div');
    expect(setup({ collisionBoundary: boundary }).options()).toEqual({ collisionBoundary: [boundary] });
    expect(setup({ collisionBoundary: null }).options()).toEqual({});
    expect(setup({ collisionBoundary: [null] }).options()).toEqual({});
  });

  it('passes the detached report only with `hideWhenDetached`', () => {
    const off = setup({ hideWhenDetached: false });
    expect(off.options()).toEqual({});
    const on = setup({ hideWhenDetached: true });
    expect(on.options()).toEqual({ hideWhenDetached: true, onAnchorHiddenChange: on.onHidden });
  });

  it('changes a source when an option changes, and not when an inline list or padding is rewritten equal', () => {
    const boundary = document.createElement('div');
    const { props, sources } = setup({ collisionBoundary: [boundary], collisionPadding: { top: 1 } });
    const seen = vi.fn();
    watch(sources, seen, { flush: 'sync' });
    props.collisionBoundary = [boundary];
    props.collisionPadding = { top: 1 };
    expect(seen).not.toHaveBeenCalled();
    props.collisionPadding = { top: 2 };
    expect(seen).toHaveBeenCalledTimes(1);
    props.collisionBoundary = [];
    expect(seen).toHaveBeenCalledTimes(2);
    props.updatePositionStrategy = 'always';
    expect(seen).toHaveBeenCalledTimes(3);
  });
});
