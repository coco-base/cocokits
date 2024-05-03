export const svgIconMap: Record<string, { name: string; content: string; viewBox: string }> = {
  'caret-tr': {
    name: 'caret-tr',
    content: '<path d="M352 160v192L160 160z" />',
    viewBox: '0 0 512 512',
  },
  'caret-br': {
    name: 'caret-br',
    content: '<path d="M352 352H160l192-192z" />',
    viewBox: '0 0 512 512',
  },
  'caret-bl': {
    name: 'caret-bl',
    content: '<path d="M160 352V160l192 192z" />',
    viewBox: '0 0 512 512',
  },
  'caret-tl': {
    name: 'caret-tl',
    content: '<path d="M160 160h192L160 352z" />',
    viewBox: '0 0 512 512',
  },
  'caret-alt-up': {
    name: 'caret-alt-up',
    content: '<path d="m256 160 128 192H128z" />',
    viewBox: '0 0 512 512',
  },
  'caret-alt-right': {
    name: 'caret-alt-right',
    content: '<path d="M352 256 160 384V128z" />',
    viewBox: '0 0 512 512',
  },
  "name: 'caret-alt-down": {
    name: 'caret-alt-down',
    content: '<path d="M256 352 128 160h256z" />',
    viewBox: '0 0 512 512',
  },
  'caret-alt-left': {
    name: 'caret-alt-left',
    content: '<path d="m160 256 192-128v256z" />',
    viewBox: '0 0 512 512',
  },
  'caret-alt-to-top': {
    name: 'caret-alt-to-top',
    content: '<path d="m128 352 128-192 128 192zm256-224H128v32h256z" />',
    viewBox: '0 0 512 512',
  },
  'caret-alt-to-right': {
    name: 'caret-alt-to-right',
    content: '<path d="m128 128 192 128-192 128zm224 256V128h-32v256z" />',
    viewBox: '0 0 512 512',
  },
  'caret-alt-to-bottom': {
    name: 'caret-alt-to-bottom',
    content: '<path d="M384 128 256 320 128 128zM128 352h256v-32H128z" />',
    viewBox: '0 0 512 512',
  },
};
