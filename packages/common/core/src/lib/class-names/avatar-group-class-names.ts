import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const avatarGroupLayoutClassNamesConfig = {
  componentName: 'avatarGroup',
  baseSelectorStructure: { block: 'avatar-group' },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of `AvatarGroup` component.',
    },
    leftDirection: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'direction-left' }],
      description: `Applied to the host element of the AvatarGroup component when the direction is set to 'left'.`,
    },
    rightDirection: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'direction-right' }],
      description: `Applied to the host element of the AvatarGroup component when the direction is set to 'right'.`,
    },
  },
} satisfies LayoutClassNamesConfig;

export function getAvatarGroupClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof avatarGroupLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(avatarGroupLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(avatarGroupLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    leftDirection: generateLayoutClassNameFromElement(avatarGroupLayoutClassNamesConfig, 'leftDirection', themeConfig),
    rightDirection: generateLayoutClassNameFromElement(
      avatarGroupLayoutClassNamesConfig,
      'rightDirection',
      themeConfig
    ),
  };
}
