import { CssSelectorComponentMap } from './css-selector.model';

export const overlaySelectorsMap: CssSelectorComponentMap = {
  _: {
    '.cck-overlay__backdrop': {
      selector: '.cck-overlay__backdrop',
      description:
        'This selector applies styles to the backdrop of overlays. It typically covers the background, creating a dimmed effect to draw focus to the overlay content.',
      renderCondition:
        'Always included in the component to provide a visual separation between the overlay content and the rest of the page, used in modal dialogs, pop-ups, or any overlay component.',
      properties: ['background-color'],
    },
    '.cck-overlay__content': {
      selector: '.cck-overlay__content',
      description:
        'This selector applies styles to the content area of overlays. It ensures the content displayed on top of the backdrop is visually distinct and easily accessible to the user.',
      renderCondition:
        'Always included to style the main content of overlays, such as dialog boxes, ensuring that the content stands out and is the primary focus for the user.',
      properties: ['background-color'],
    },
  },
};
