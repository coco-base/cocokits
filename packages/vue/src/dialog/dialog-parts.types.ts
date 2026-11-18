import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * The top row of the content: the title and the Close part. It renders a `<div>` and adds no role; the
 * `DialogTitle` still names the dialog.
 *
 * @example
 * <DialogHeader>
 *   <DialogTitle>Delete project</DialogTitle>
 *   <DialogClose aria-label="Close">x</DialogClose>
 * </DialogHeader>
 *
 * @cckPart header
 */
export interface DialogHeaderProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its class. It is ignored with
   * `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. When
   * not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The middle of the content: the description and your own content. It renders a `<div>` and adds no role.
 *
 * @example
 * <DialogBody>
 *   <DialogDescription>This cannot be undone.</DialogDescription>
 * </DialogBody>
 *
 * @cckPart body
 */
export interface DialogBodyProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its class. It is ignored with
   * `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. When
   * not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The bottom row of the content: the actions. It renders a `<div>` and adds no role.
 *
 * @example
 * <DialogFooter>
 *   <DialogClose>Cancel</DialogClose>
 * </DialogFooter>
 *
 * @cckPart footer
 */
export interface DialogFooterProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its class. It is ignored with
   * `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. When
   * not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The heading that names the dialog. It renders an `<h2>`. Use `as` or `asChild` for another heading level.
 *
 * The content refers to it with `aria-labelledby` while it is mounted.
 *
 * @example
 * <DialogTitle>Delete project</DialogTitle>
 *
 * @cckPart title
 */
export interface DialogTitleProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The text that describes the dialog. It renders a `<p>`. The content refers to it with `aria-describedby` while it
 * is mounted.
 *
 * @example
 * <DialogDescription>This cannot be undone.</DialogDescription>
 *
 * @cckPart description
 */
export interface DialogDescriptionProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * A `<button>` that closes the dialog. Native button attributes and listeners fall through to it. A listener that
 * calls `preventDefault()` does not stop it from closing the dialog.
 *
 * A Close button with only an icon needs `aria-label` or `aria-labelledby`.
 *
 * With `as`, a tag or component other than `button` gets `role="button"`, `tabindex="0"` and no `type`. Enter
 * activates it on keydown and Space on keyup. A key listener that calls `preventDefault()` stops that. With
 * `asChild`, the child must render a `<button>`.
 *
 * @example
 * <DialogClose>Cancel</DialogClose>
 *
 * @cckPart close
 */
export interface DialogCloseProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
