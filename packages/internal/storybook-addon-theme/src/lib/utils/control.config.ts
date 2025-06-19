/* eslint-disable max-lines */
import { camelCase } from 'lodash';

import { ElementAnchorPoint } from '@cocokits/common-utils';
import { OverlayAnimationType } from '@cocokits/react-overlay';

import { AddonParametersControl, AddonParametersControlType } from '../model/addon.model';

export const customText = (
  displayName: string,
  defaultValue: string,
  storyArgKey?: string
): AddonParametersControl => ({
  displayName,
  default: defaultValue,
  storyArgKey: storyArgKey ?? camelCase(displayName),
  type: AddonParametersControlType.Text,
});

export const customNumber = (
  displayName: string,
  defaultValue: number,
  storyArgKey?: string
): AddonParametersControl => ({
  displayName,
  default: defaultValue,
  storyArgKey: storyArgKey ?? camelCase(displayName),
  type: AddonParametersControlType.Number,
});

export const customSelect = (
  displayName: string,
  options: string[],
  defaultValue?: string,
  storyArgKey?: string
): AddonParametersControl => ({
  displayName: displayName,
  default: defaultValue ?? options[0],
  options,
  storyArgKey: storyArgKey ?? camelCase(displayName),
  type: AddonParametersControlType.Select,
});

export const customBoolean = (
  displayName: string,
  defaultValue?: boolean,
  storyArgKey?: string
): AddonParametersControl => ({
  displayName,
  default: defaultValue ?? false,
  storyArgKey: storyArgKey ?? camelCase(displayName),
  type: AddonParametersControlType.Boolean,
});

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

export const addOnBlur = (defaultValue = false): AddonParametersControl => ({
  displayName: 'Add On Blur',
  default: defaultValue,
  storyArgKey: 'addOnBlur',
  type: AddonParametersControlType.Boolean,
});

export const open = (defaultValue = false): AddonParametersControl => ({
  displayName: 'Open',
  default: defaultValue,
  storyArgKey: 'open',
  type: AddonParametersControlType.Boolean,
});

export const closeOnSelectItem = (defaultValue = true): AddonParametersControl => ({
  displayName: 'Close On Select Item',
  default: defaultValue,
  storyArgKey: 'closeOnSelectItem',
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

export const removable = (defaultValue = false): AddonParametersControl => ({
  displayName: 'Removable',
  default: defaultValue,
  storyArgKey: 'removable',
  type: AddonParametersControlType.Boolean,
});

export const labelPosition = (defaultValue = 'before'): AddonParametersControl => ({
  displayName: 'Label Position',
  default: defaultValue,
  storyArgKey: 'labelPosition',
  options: ['before', 'after'],
  type: AddonParametersControlType.Select,
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

export const animationType = (defaultValue = OverlayAnimationType.BottomToCenter): AddonParametersControl => ({
  displayName: 'Animation Type',
  default: defaultValue,
  options: Object.values(OverlayAnimationType),
  storyArgKey: 'animationType',
  type: AddonParametersControlType.Select,
});

export const selectedRadio = (defaultValue = 'Radio-1'): AddonParametersControl => ({
  displayName: 'Selected',
  default: defaultValue,
  options: ['None', 'Radio-1', 'Radio-2', 'Radio-3'],
  storyArgKey: 'selectedRadio',
  type: AddonParametersControlType.Select,
});

export const hasBackdrop = (defaultValue = false): AddonParametersControl => ({
  displayName: 'Has Backdrop',
  default: defaultValue,
  storyArgKey: 'hasBackdrop',
  type: AddonParametersControlType.Boolean,
});

export const disableBackdropClose = (defaultValue = false): AddonParametersControl => ({
  displayName: 'Disable Backdrop Close',
  default: defaultValue,
  storyArgKey: 'disableBackdropClose',
  type: AddonParametersControlType.Boolean,
});

export const maxRows = (defaultValue = 5): AddonParametersControl => ({
  displayName: 'Max Rows',
  default: defaultValue,
  storyArgKey: 'maxRows',
  type: AddonParametersControlType.Number,
});

export const minRows = (defaultValue = 2): AddonParametersControl => ({
  displayName: 'Min Rows',
  default: defaultValue,
  storyArgKey: 'minRows',
  type: AddonParametersControlType.Number,
});

export const autoResize = (defaultValue = false): AddonParametersControl => ({
  displayName: 'Auto Resize',
  default: defaultValue,
  storyArgKey: 'autoResize',
  type: AddonParametersControlType.Boolean,
});

export const placeholderSrc = (): AddonParametersControl => ({
  displayName: 'Placeholder',
  default:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjwvc3ZnPg==',
  storyArgKey: 'placeholderSrc',
  images: [
    'none',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjwvc3ZnPg==',
  ],
  type: AddonParametersControlType.Image,
});

export const fallbackSrc = (): AddonParametersControl => ({
  displayName: 'Fallback',
  default:
    'data:image/jpeg;base64,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',
  storyArgKey: 'fallbackSrc',
  images: [
    'none',
    'data:image/jpeg;base64,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',
  ],
  type: AddonParametersControlType.Image,
});

export const srcUrl = (defaultValue = 'https://i.pravatar.cc?img=9'): AddonParametersControl => ({
  displayName: 'Src',
  default: defaultValue,
  storyArgKey: 'src',
  type: AddonParametersControlType.Text,
});

export const alt = (defaultValue = ''): AddonParametersControl => ({
  displayName: 'Alt',
  default: defaultValue,
  storyArgKey: 'alt',
  type: AddonParametersControlType.Text,
});

export const clickable = (defaultValue = true): AddonParametersControl => ({
  displayName: 'Clickable',
  default: defaultValue,
  storyArgKey: 'clickable',
  type: AddonParametersControlType.Boolean,
});

export const avatarDirection = (defaultValue = 'right'): AddonParametersControl => ({
  displayName: 'Direction',
  default: defaultValue,
  storyArgKey: 'avatarDirection',
  options: ['right', 'left'],
  type: AddonParametersControlType.Select,
});
