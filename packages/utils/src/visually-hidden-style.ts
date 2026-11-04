/**
 * The style that hides an element from sight and from the layout while it stays in the accessibility tree,
 * focusable and a control the browser validates (so never `display: none`). Values are strings with units,
 * so React, Vue and `Renderer2.setStyle` apply them alike. Use it for the hidden native form input and for
 * the focus guards of an overlay.
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
 * {@link visuallyHiddenStyle} as a `style` attribute value, for a template `style="…"` or a string binding.
 */
export const visuallyHiddenStyleText: string = Object.entries(visuallyHiddenStyle)
  .map(([name, value]) => `${name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}:${value}`)
  .join(';');
