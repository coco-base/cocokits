import { Args } from '@storybook/types';
import { StoreState } from '../features/story-control/story-control.model';
import { isNotNullish } from '@cocokits/common-utils';

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
  const args = storyArgs['cckControl'] as StoreState['args'];

  let template = '';

  if ('type' in args) {
    template += `type="${args['type']}" `;
  }

  if ('color' in args) {
    template += `color="${args['color']}" `;
  }

  if ('size' in args) {
    template += `size="${args['size']}" `;
  }
  return template;
}

export function ngThemeArgsToTemplate(storyArgs: Args): string {
  const basePropTemplate = ngBasePropArgsToTemplate(storyArgs);
  const additionalTemplate = ngAdditionalArgsToTemplate(storyArgs);

  console.log('`${basePropTemplate} ${additionalTemplate}`', `${basePropTemplate} ${additionalTemplate}`);

  return `${basePropTemplate} ${additionalTemplate}`;
}
