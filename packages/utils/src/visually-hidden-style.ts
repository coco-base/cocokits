/**
 * The style that hides an element from sight and from the layout, while it stays in the accessibility tree.
 * The element can still take focus, and a form control is still validated by the browser. So the style never uses `display: none`.
 *
 * @remarks
 * The values are strings with units, so every framework can apply them in the same way.
 * Use it for a hidden native form input and for the focus guards of an overlay.
 *
 * @example
 * const note = document.createElement('span');
 * Object.assign(note.style, visuallyHiddenStyle);
 * note.textContent = 'Opens in a new tab';
 */
export const visuallyHiddenStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: '0',
  border: '0',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
} as const;

/**
 * The same style as {@link visuallyHiddenStyle}, written as the value of a `style` attribute.
 * Use it where a template or a string binding needs text, such as `style="..."`.
 *
 * @example
 * const note = document.createElement('span');
 * note.setAttribute('style', visuallyHiddenStyleText);
 */
export const visuallyHiddenStyleText: string = Object.entries(visuallyHiddenStyle)
  .map(([name, value]) => `${name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}:${value}`)
  .join(';');
