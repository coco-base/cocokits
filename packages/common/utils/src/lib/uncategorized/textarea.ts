/** @module common */

/**
 * Automatically resizes a textarea element based on its content, adjusting its height between the minimum and maximum number of rows.
 *
 * This function listens for user input and dynamically adjusts the height of the textarea as the content changes. It respects
 * the minimum and maximum row constraints, ensuring the textarea doesn't exceed these limits. It also provides methods to
 * recalculate sizes, manually update the height, and destroy the event listeners.
 *
 * @param textarea The `HTMLTextAreaElement` that will be resized based on its content.
 * @param minRow The minimum number of rows the textarea should display. Defaults to 1.
 * @param maxRow The maximum number of rows the textarea should display. Defaults to 5.
 *
 * @returns An object with methods to `recalculateValues`, manually `update` the height, and `destroy` the event listeners.
 *
 * @example
 * ```typescript
 * const textarea = document.querySelector('textarea');
 * const resizer = autoResizeTextarea(textarea, 2, 8);
 *
 * // Manually update the textarea size
 * resizer.update();
 *
 * // Recalculate values after a layout change
 * resizer.recalculateValues();
 *
 * // Destroy the auto-resize functionality
 * resizer.destroy();
 * ```
 */
export function autoResizeTextarea(textarea: HTMLTextAreaElement, minRow = 1, maxRow = 5) {
  const parent = textarea.parentElement ?? document;

  let minHeight = 0;
  let maxHeight = 0;
  let borderSize = 0;
  let paddingSize = 0;

  const recalculateValues = () => {
    const clone = textarea.cloneNode() as HTMLTextAreaElement;
    clone.style.position = 'absolute';
    clone.style.height = '0';
    clone.style.visibility = 'none';

    parent.appendChild(clone);
    borderSize = clone.offsetHeight - clone.clientHeight;
    paddingSize = clone.clientHeight;

    clone.value = Array(minRow).fill(0).join('\n');
    minHeight = clone.scrollHeight - paddingSize + borderSize;

    clone.value = Array(maxRow).fill(0).join('\n');
    maxHeight = clone.scrollHeight - paddingSize + borderSize;

    clone.remove();

    update();
  };

  const update = () => {
    textarea.style.height = '0';
    const currentHeight = textarea.scrollHeight + paddingSize;
    const height = Math.max(minHeight, Math.min(currentHeight, maxHeight));
    textarea.style.height = height + 'px';
  };

  const destroy = () => {
    textarea.removeEventListener('click', recalculateValues);
    textarea.removeEventListener('input', update);
  };

  textarea.addEventListener('click', recalculateValues);
  textarea.addEventListener('input', update);

  recalculateValues();
  update();

  return {
    recalculateValues,
    update,
    destroy,
  };
}
