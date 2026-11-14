import type { ButtonBaseProps } from '../internal/button-base-props';

/**
 * A button for actions. It renders a native `<button type="button">`. With an `as` other than `'button'`, or with
 * `asChild`, it renders a link (an `<a>`).
 *
 * For a Button with only an icon, use the IconButton; it needs `aria-label` or `aria-labelledby`.
 *
 * Native button attributes and listeners fall through to the rendered element. A disabled link blocks its click in
 * the capture phase. So your `@click.capture` runs first and can stop the guard with `preventDefault()`.
 *
 * @example
 * <Button @click="save">Save</Button>
 *
 * @cckPart root
 */
export type ButtonProps = ButtonBaseProps;
