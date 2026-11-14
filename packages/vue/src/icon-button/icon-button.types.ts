import type { ButtonProps } from '../button';

/**
 * A button that shows only an icon. It has the behaviour and props of the Button: it renders a native
 * `<button type="button">`. With an `as` other than `'button'`, or with `asChild`, it renders a link (an `<a>`).
 *
 * It has no text, so it needs a name: `aria-label` or `aria-labelledby`, or a labelled `SvgIcon` inside. In
 * development, a missing name logs a `CocoKits:` error. Keep the icon inside decorative, so the button carries the
 * name. A toggle keeps one name and sets `aria-pressed`.
 *
 * Native button attributes and listeners fall through to the rendered element. A disabled link blocks its click in
 * the capture phase. So your `@click.capture` runs first and can stop the guard with `preventDefault()`.
 *
 * @example
 * <IconButton aria-label="Add item"><SvgIcon icon-name="plus" /></IconButton>
 *
 * @cckPart root
 */
export type IconButtonProps = ButtonProps;
