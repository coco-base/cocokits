export function scrollToStoryById(storyId: string, offsetTop = 80) {
  const element = document.getElementById(storyId);
  if (!element) {
    return;
  }

  const elementPosition = element.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: elementPosition - offsetTop,
    behavior: 'smooth',
  });
}
