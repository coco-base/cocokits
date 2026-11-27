import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Checkbox anatomy: a root around a native `input type="checkbox"` and its label. */
export const checkboxAnatomy: Anatomy<
  'checkbox',
  {
    readonly root: AnatomyPart;
    readonly wrapper: AnatomyPart;
    readonly inputWrapper: AnatomyPart;
    readonly input: AnatomyPart;
    readonly backdrop: AnatomyPart;
    readonly background: AnatomyPart;
    readonly label: AnatomyPart;
  }
> = defineAnatomy({
  block: 'checkbox',
  parts: {
    root: { name: 'Root', description: 'The root. It renders the facts as `data-*`; it has no role.' },
    wrapper: { name: 'Wrapper', description: 'Holds the box and the label in a row.' },
    inputWrapper: { name: 'Input wrapper', description: 'The box and hit area that the native input lies over.' },
    input: { name: 'Input', description: 'The native `input type="checkbox"`. The focus and ref target.' },
    backdrop: { name: 'Backdrop', description: 'Empty, decorative: the hover and press halo hook.' },
    background: {
      name: 'Background',
      description: "Decorative: the box and the dash are drawn on it; it holds the theme's tick icon while checked.",
    },
    label: { name: 'Label', description: 'The native `label` of the input; it holds the author content.' },
  },
});
