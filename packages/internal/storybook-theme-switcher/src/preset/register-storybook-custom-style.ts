export function registerStorybookCustomStyle() {
  // Add custom css selectors, use this prefix to select an element, inorder to override the style.
  // It will help us to easily debug and find our custom styles from browser
  document.documentElement.classList.add('cck-storybook-theme');
}
