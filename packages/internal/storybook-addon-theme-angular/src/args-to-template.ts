import { Args } from '@storybook/types';

import { isNotNullish } from '@cocokits/common-utils';
import { StoreState } from '@cocokits/storybook-addon-theme';

export function ngAdditionalArgsToTemplate(storyArgs: Args): string {
  const args = storyArgs['cckControl'] as StoreState['args'];
  const additional = args.themeComponentConfig.additional;

  if (!additional) {
    return '';
  }

  const additionalKeys = Object.keys(additional);

  const template = additionalKeys
    .filter((key) => isNotNullish(args[key]))
    .reduce((result, key) => `${result} data-cck-${key}=${args[key]}`, '');

  return template;
}

export function ngBasePropArgsToTemplate(storyArgs: Args): string {
  const args = storyArgs['cckControl'] as StoreState['args'] & { type?: string; color?: string; size?: string };

  let template = '';

  if ('type' in args) {
    template += `type="${args.type}" `;
  }

  if ('color' in args) {
    template += `color="${args.color}" `;
  }

  if ('size' in args) {
    template += `size="${args.size}" `;
  }
  return template;
}

export function ngThemeArgsToTemplate(storyArgs: Args): string {
  const basePropTemplate = ngBasePropArgsToTemplate(storyArgs);
  const additionalTemplate = ngAdditionalArgsToTemplate(storyArgs);

  return `${basePropTemplate} ${additionalTemplate}`;
}
