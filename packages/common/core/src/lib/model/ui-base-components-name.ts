export type UIBaseComponentsName =
  | FormFieldComponentName
  | MenuComponentName
  | DividerComponentName
  | ToggleComponentName
  | RadioComponentName
  | CheckboxComponentName
  | ButtonComponentName
  | IconComponentName
  | _Tabs_ComponentNameOld
  | OverlayComponentName
  | AvatarComponentName
  | AccordionComponentName;

type FormFieldComponentName =
  | 'formField'
  | 'label'
  | 'error'
  | 'hint'
  | 'prefix'
  | 'suffix'
  | 'trailing'
  | 'leading'
  | 'input'
  | 'textarea'
  | 'select'
  | 'option'
  | 'optionGroup'
  | 'selectPreview'
  | 'chip'
  | 'chipList';

type MenuComponentName = 'menu' | 'menuItem';
type DividerComponentName = 'divider';
type ToggleComponentName = 'toggle';
type RadioComponentName = 'radioButton' | 'radioGroup';
type CheckboxComponentName = 'checkbox';
type ButtonComponentName = 'button' | 'iconButton';
type IconComponentName = 'svgIcon';
type _Tabs_ComponentNameOld = 'tabsOld' | 'tabOld' | 'tabLabelOld';
type OverlayComponentName = 'overlay';
type AvatarComponentName = 'avatar' | 'avatarGroup' | 'avatarLabel';
type AccordionComponentName = 'accordion' | 'accordionHeader' | 'accordionPanel';
