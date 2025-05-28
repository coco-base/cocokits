import { camelCase, startCase } from 'lodash';

import { ThemeChangeEvent } from '@cocokits/storybook-addon-theme';

import { backtick, code } from './markdown.util';

export function toTitleCase(str: string): string {
  return startCase(camelCase(str)).replace(/\s/g, '');
}

export const tocItems = [
  { id: 'install-specific-components', name: 'Install Specific Components' },
  { id: 'override-theme-ui-configurations', name: 'Override Theme UI Configurations' },
  { id: 'merge-themes', name: 'Merge Themes' },
  { id: 'use-only-one-mode-from-each-collection', name: 'Use Only One Mode from Each Collection' },
  { id: 'change-token-selectors', name: 'Change Token Selectors' },
];

// region ---------------- Use Only One Mode from Each Collection ----------------
export function getUseOnlyOneModeOption1Step1Code(theme: ThemeChangeEvent) {
  const mixinNames = Object.entries(theme.selectedModes).map(
    ([collection, mode]) => `@include ${toTitleCase(theme.displayName)}.use_${collection}_${mode};`
  );

  const scss = `scss
@use "@cocokits/theme-${theme.id}/tokens-core" as ${toTitleCase(theme.displayName)};

${mixinNames.join('\n')}
  `;

  return code(scss);
}

export function getUseOnlyOneModeOption1Step2ClassSelector(theme: ThemeChangeEvent) {
  const selectors = Object.entries(theme.selectedModes)
    .map(([collection, mode]) => `cck-theme-${theme.id}__${collection}--${mode}`)
    .join(' ');

  const classSelectorCode = `html
<html class="${selectors}">
...
</html>
  `;

  return code(classSelectorCode);
}

export function getUseOnlyOneModeOption1Step2AttrSelector(theme: ThemeChangeEvent) {
  const selectors = Object.entries(theme.selectedModes)
    .map(([collection, mode]) => `${theme.id}__${collection}--${mode}`)
    .join(' ');

  const classSelectorCode = `html
<html data-cck-theme="${selectors}">
...
</html>
  `;

  return code(classSelectorCode);
}

export function getUseOnlyOneModeOption1code(theme: ThemeChangeEvent) {
  const mixinNames = Object.entries(theme.selectedModes).map(
    ([collection, mode]) => `@include ${toTitleCase(theme.displayName)}.variables_${collection}_${mode};`
  );

  const scss = `scss
@use "@cocokits/theme-${theme.id}/tokens-core" as ${toTitleCase(theme.displayName)};

:root {
  ${mixinNames.join('\n  ')}
}
  `;

  return code(scss);
}
// endregion

// region ---------------- Change Token Selectors ----------------
export function getChangeTokenSelectorsItems(theme: ThemeChangeEvent) {
  const lightFrom =
    theme.id === 'frames-x' ? '.cck-theme-frames-x__color-mode--light' : '.cck-theme-cocokits__brand-color-1--light';
  const darkFrom =
    theme.id === 'frames-x' ? '.cck-theme-frames-x__color-mode--dark' : '.cck-theme-cocokits__brand-color-1--dark';

  return `
- ${backtick(lightFrom)} -> ${backtick('.cck-theme-light')}
- ${backtick(darkFrom)} -> ${backtick('.cck-theme-dark')}
  `;
}

export function getChangeTokenSelectorsStep1Code(theme: ThemeChangeEvent) {
  const lightMixin =
    theme.id === 'frames-x'
      ? 'FramesX.variables_color_mode_light'
      : 'Cocokits.cck-theme-cocokits__brand-color-1--light';
  const darkMixin =
    theme.id === 'frames-x' ? 'FramesX.variables_color_mode_dark' : 'Cocokits.cck-theme-cocokits__brand-color-1--dark';

  const collectionNameWithLightAndDark = theme.id === 'frames-x' ? 'color-mode' : 'brand-color-1';

  const otherMixins = Object.entries(theme.selectedModes)
    .filter(([collection]) => collection !== collectionNameWithLightAndDark)
    .map(([collection, mode]) => `@include ${toTitleCase(theme.displayName)}.variables_${collection}_${mode};`);

  const scss = `scss
@use "@cocokits/theme-${theme.id}/tokens-core" as ${toTitleCase(theme.displayName)};

.cck-theme-light {
  @include ${lightMixin};
}

.cck-theme-dark {
  @include ${darkMixin};
}

:root {
  ${otherMixins.join('\n  ')}
}
  `;

  return code(scss);
}

export function getChangeTokenSelectorsStep2Code() {
  const html = `html
<html class="cck-theme-light">
  <!-- ... -->
</html>

<!-- Or switch to dark mode -->

<html class="cck-theme-dark">
  <!-- ... -->
</html>`;

  return code(html);
}
// endregion

// region ---------------- Merge Themes ----------------
export function getMergeThemesStep3Scss() {
  return code(`scss
  
@use "@cocokits/theme-cocokits/styles-core" as Cocokits;
@use "@cocokits/theme-frames-x/styles-core" as FramesX;

// Import styles from Frames X theme
@include FramesX.components_button;
@include FramesX.components_icon_button;
@include FramesX.components_radio_button;
@include FramesX.components_radio_group;

// Import styles from Cocokits theme
@include Cocokits.components_checkbox;
@include Cocokits.components_chip;
@include Cocokits.components_chip_list;
@include Cocokits.components_divider;
@include Cocokits.components_error;
@include Cocokits.components_form_field;
@include Cocokits.components_hint;
@include Cocokits.components_icon;
@include Cocokits.components_input;
@include Cocokits.components_label;
@include Cocokits.components_leading;
@include Cocokits.components_menu;
@include Cocokits.components_menu_item;
@include Cocokits.components_option;
@include Cocokits.components_option_group;
@include Cocokits.components_prefix;
@include Cocokits.components_select;
@include Cocokits.components_select_preview;
@include Cocokits.components_suffix;
@include Cocokits.components_textarea;
@include Cocokits.components_toggle;
@include Cocokits.components_trailing;
@include Cocokits.components_trailing;
@include Cocokits.components_avatar;
@include Cocokits.components_avatar_group;
@include Cocokits.components_avatar_label;

  
  `);
}
// endregion
