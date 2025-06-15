export function getOriginalHeight(element: HTMLElement): number {
  element.style.opacity = '0';
  element.style.display = 'block';
  element.style.height = 'auto';

  const height = element.offsetHeight;
  element.style.height = '0';
  element.style.opacity = '1';

  return height;
}
