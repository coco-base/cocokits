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
