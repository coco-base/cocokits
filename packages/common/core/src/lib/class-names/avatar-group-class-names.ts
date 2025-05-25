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
    // example: {
    //   name: '...',
    //   selectorStructure: [{ element: '...', modifier: '...' }],
    //   description: `...`,
    // },
  },
} satisfies LayoutClassNamesConfig;

export function getAvatarGroupClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof avatarGroupLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(avatarGroupLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(avatarGroupLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    // example: generateLayoutClassNameFromElement(avatarGroupLayoutClassNamesConfig, 'example', themeConfig),
  };
}
