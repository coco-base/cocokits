import { ElementAnchorPoint } from '@cocokits/common-utils';

import { AddonParametersControl, AddonParametersControlType } from '../model/addon.model';

export const text = (defaultValue: string): AddonParametersControl => ({
  displayName: 'Text',
  default: defaultValue,
  storyArgKey: 'text',
  type: AddonParametersControlType.Text,
});

export const label = (defaultValue = 'Label'): AddonParametersControl => ({
  displayName: 'Label',
  default: defaultValue,
  storyArgKey: 'label',
  type: AddonParametersControlType.Text,
});

export const placeholder = (defaultValue = 'Placeholder'): AddonParametersControl => ({
  displayName: 'Placeholder',
  default: defaultValue,
  storyArgKey: 'placeholder',
  type: AddonParametersControlType.Text,
});

export const hint = (defaultValue = ''): AddonParametersControl => ({
  displayName: 'Hint',
  default: defaultValue,
  storyArgKey: 'hint',
  type: AddonParametersControlType.Text,
});

export const error = (defaultValue = ''): AddonParametersControl => ({
  displayName: 'Error',
  default: defaultValue,
  storyArgKey: 'error',
  type: AddonParametersControlType.Text,
});

export const leading = (defaultValue = ''): AddonParametersControl => ({
  displayName: 'Leading',
  default: defaultValue,
  storyArgKey: 'leading',
  type: AddonParametersControlType.Text,
});

export const trailing = (defaultValue = ''): AddonParametersControl => ({
  displayName: 'Trailing',
  default: defaultValue,
  storyArgKey: 'trailing',
  type: AddonParametersControlType.Text,
});

export const type = (): AddonParametersControl => ({
  prop: 'type',
  type: AddonParametersControlType.SelectThemeConfig,
});

export const color = (): AddonParametersControl => ({
  prop: 'color',
  type: AddonParametersControlType.SelectThemeConfig,
});

export const size = (): AddonParametersControl => ({
  prop: 'size',
  type: AddonParametersControlType.SelectThemeConfig,
});

export const additional = (): AddonParametersControl => ({
  prop: 'additional',
  type: AddonParametersControlType.SelectThemeConfig,
});

export const anchorPoint = (defaultValue: ElementAnchorPoint): AddonParametersControl => ({
  displayName: 'Anchor Point',
  default: defaultValue,
  storyArgKey: 'anchorPoint',
  options: Object.values(ElementAnchorPoint),
  type: AddonParametersControlType.Select,
});

export const maxOptionsHeight = (defaultValue?: number): AddonParametersControl => ({
  displayName: 'Max Options Height',
  default: defaultValue,
  storyArgKey: 'maxOptionsHeight',
  type: AddonParametersControlType.Number,
});

export const disabled = (
  defaultValue = false,
  displayName = 'Disabled',
  storyArgKey = 'disabled'
): AddonParametersControl => ({
  displayName,
  default: defaultValue,
  storyArgKey,
  type: AddonParametersControlType.Boolean,
});

export const multiple = (defaultValue = false): AddonParametersControl => ({
  displayName: 'Multiple',
  default: defaultValue,
  storyArgKey: 'multiple',
  type: AddonParametersControlType.Boolean,
});

export const required = (defaultValue = false): AddonParametersControl => ({
  displayName: 'Required',
  default: defaultValue,
  storyArgKey: 'required',
  type: AddonParametersControlType.Boolean,
});

export const invalid = (defaultValue = false): AddonParametersControl => ({
  displayName: 'Invalid',
  default: defaultValue,
  storyArgKey: 'invalid',
  type: AddonParametersControlType.Boolean,
});

export const checked = (defaultValue = false): AddonParametersControl => ({
  displayName: 'Checked',
  default: defaultValue,
  storyArgKey: 'checked',
  type: AddonParametersControlType.Boolean,
});

export const indeterminate = (defaultValue = false): AddonParametersControl => ({
  displayName: 'Indeterminate',
  default: defaultValue,
  storyArgKey: 'indeterminate',
  type: AddonParametersControlType.Boolean,
});

export const hideRequiredMarker = (defaultValue = false): AddonParametersControl => ({
  displayName: 'Hide Required Marker',
  default: defaultValue,
  storyArgKey: 'hideRequiredMarker',
  type: AddonParametersControlType.Boolean,
});

export const leftIcon = (defaultValue: 'none' | 'heartFill' | 'heart' | 'link'): AddonParametersControl => ({
  displayName: 'Left Icon',
  default: defaultValue,
  icons: ['none', 'heartFill', 'heart', 'link'],
  storyArgKey: 'leftIcon',
  type: AddonParametersControlType.Icon,
});

export const rightIcon = (defaultValue: 'none' | 'heartFill' | 'heart' | 'link'): AddonParametersControl => ({
  displayName: 'Right Icon',
  default: defaultValue,
  icons: ['none', 'heartFill', 'heart', 'link'],
  storyArgKey: 'rightIcon',
  type: AddonParametersControlType.Icon,
});

export const icon = (defaultValue: 'copy' | 'heartFill' | 'heart' | 'link'): AddonParametersControl => ({
  displayName: 'Icon',
  default: defaultValue,
  icons: ['copy', 'heartFill', 'heart', 'link'],
  storyArgKey: 'icon',
  type: AddonParametersControlType.Icon,
});

export const prefixIcon = (defaultValue: 'none' | 'heartFill' | 'heart' | 'link' = 'none'): AddonParametersControl => ({
  displayName: 'Prefix Icon',
  default: defaultValue,
  icons: ['none', 'heartFill', 'heart', 'link'],
  storyArgKey: 'prefixIcon',
  type: AddonParametersControlType.Icon,
});

export const suffixIcon = (defaultValue: 'none' | 'heartFill' | 'heart' | 'link' = 'none'): AddonParametersControl => ({
  displayName: 'Suffix Icon',
  default: defaultValue,
  icons: ['none', 'heartFill', 'heart', 'link'],
  storyArgKey: 'suffixIcon',
  type: AddonParametersControlType.Icon,
});

export const inputNativeType = (defaultValue = ''): AddonParametersControl => ({
  displayName: 'Type',
  default: defaultValue,
  options: [
    'color',
    'date',
    'datetime-local',
    'email',
    'month',
    'number',
    'password',
    'search',
    'text',
    'time',
    'week',
  ],
  storyArgKey: 'type',
  type: AddonParametersControlType.Select,
});
