import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Radio anatomy: the Checkbox's parts around a native `input type="radio"`. */
export const radioAnatomy: Anatomy<
  'radio',
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
  block: 'radio',
  parts: {
    root: { name: 'Root', description: 'The root. It renders the facts as `data-*`; it has no role.' },
    wrapper: { name: 'Wrapper', description: 'Holds the dot and the label in a row.' },
    inputWrapper: { name: 'Input wrapper', description: 'The dot and hit area that the native input lies over.' },
    input: { name: 'Input', description: 'The native `input type="radio"`. The focus and ref target.' },
    backdrop: { name: 'Backdrop', description: 'Empty, decorative: the hover and press halo hook.' },
    background: { name: 'Background', description: 'Empty, decorative: the ring and the dot are drawn on it.' },
    label: { name: 'Label', description: 'The native `label` of the input; it holds the author content.' },
  },
});
