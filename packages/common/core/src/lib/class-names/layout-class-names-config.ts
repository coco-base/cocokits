import { accordionLayoutClassNamesConfig } from './accordion-class-names';
import { accordionHeaderLayoutClassNamesConfig } from './accordion-header-class-names';
import { accordionPanelLayoutClassNamesConfig } from './accordion-panel-class-names';
import { avatarLayoutClassNamesConfig } from './avatar-class-names';
import { avatarGroupLayoutClassNamesConfig } from './avatar-group-class-names';
import { avatarLabelLayoutClassNamesConfig } from './avatar-label-class-names';
import { badgeLayoutClassNamesConfig } from './badge-class-names';
import { badgeContainerLayoutClassNamesConfig } from './badge-container-class-names';
import { buttonLayoutClassNamesConfig } from './button-class-names';
import { checkboxLayoutClassNamesConfig } from './checkbox-class-names';
import { chipLayoutClassNamesConfig } from './chip-class-names';
import { chipListLayoutClassNamesConfig } from './chip-list-class-names';
import { dividerLayoutClassNamesConfig } from './divider-class-names';
import { errorLayoutClassNamesConfig } from './error-class-names';
import { formFieldLayoutClassNamesConfig } from './form-field-class-names';
import { hintLayoutClassNamesConfig } from './hint-class-names';
import { iconButtonLayoutClassNamesConfig } from './icon-button-class-names';
import { svgIconLayoutClassNamesConfig } from './icon-class-names';
import { inputLayoutClassNamesConfig } from './input-class-names';
import { labelLayoutClassNamesConfig } from './label-class-names';
import { leadingLayoutClassNamesConfig } from './leading-class-names';
import { menuLayoutClassNamesConfig } from './menu-class-names';
import { menuItemLayoutClassNamesConfig } from './menu-item-class-names';
import { optionLayoutClassNamesConfig } from './option-class-names';
import { optionGroupLayoutClassNamesConfig } from './option-group-class-names';
import { overlayLayoutClassNamesConfig } from './overlay-class-names';
import { prefixLayoutClassNamesConfig } from './prefix-class-names';
import { radioButtonLayoutClassNamesConfig } from './radio-button-class-names';
import { radioGroupLayoutClassNamesConfig } from './radio-group-class-names';
import { selectLayoutClassNamesConfig } from './select-class-names';
import { selectPreviewLayoutClassNamesConfig } from './select-preview-class-names';
import { suffixLayoutClassNamesConfig } from './suffix-class-names';
import { tabLayoutClassNamesConfig } from './tab-class-names';
import { tabLayoutClassNamesConfigOld } from './tab-class-names-old';
import { tabLabelLayoutClassNamesConfigOld } from './tab-label-class-names-old';
import { tabsLayoutClassNamesConfig } from './tabs-class-names';
import { tabsLayoutClassNamesConfigOld } from './tabs-class-names-old';
import { textareaClassNamesConfig } from './textarea-class-names';
import { toggleLayoutClassNamesConfig } from './toggle-class-names';
import { trailingLayoutClassNamesConfig } from './trailing-class-names';

/**
 * TODO: Add type definitions:
 *
 * If we use the normal way to add type then the autocomplete don't show the elements name any more
 * Because we define it as string. But without types the typescript will understand the key of `elements` map
 */

export const layoutClassNamesConfigRecord = {
  svgIcon: svgIconLayoutClassNamesConfig,
  button: buttonLayoutClassNamesConfig,
  iconButton: iconButtonLayoutClassNamesConfig,
  checkbox: checkboxLayoutClassNamesConfig,
  radioGroup: radioGroupLayoutClassNamesConfig,
  radioButton: radioButtonLayoutClassNamesConfig,
  formField: formFieldLayoutClassNamesConfig,
  label: labelLayoutClassNamesConfig,
  error: errorLayoutClassNamesConfig,
  hint: hintLayoutClassNamesConfig,
  prefix: prefixLayoutClassNamesConfig,
  suffix: suffixLayoutClassNamesConfig,
  trailing: trailingLayoutClassNamesConfig,
  leading: leadingLayoutClassNamesConfig,
  input: inputLayoutClassNamesConfig,
  textarea: textareaClassNamesConfig,
  select: selectLayoutClassNamesConfig,
  option: optionLayoutClassNamesConfig,
  optionGroup: optionGroupLayoutClassNamesConfig,
  selectPreview: selectPreviewLayoutClassNamesConfig,
  chip: chipLayoutClassNamesConfig,
  chipList: chipListLayoutClassNamesConfig,
  menu: menuLayoutClassNamesConfig,
  menuItem: menuItemLayoutClassNamesConfig,
  divider: dividerLayoutClassNamesConfig,
  toggle: toggleLayoutClassNamesConfig,
  tabsOld: tabsLayoutClassNamesConfigOld,
  tabOld: tabLayoutClassNamesConfigOld,
  tabLabelOld: tabLabelLayoutClassNamesConfigOld,
  overlay: overlayLayoutClassNamesConfig,
  avatar: avatarLayoutClassNamesConfig,
  avatarGroup: avatarGroupLayoutClassNamesConfig,
  avatarLabel: avatarLabelLayoutClassNamesConfig,
  accordion: accordionLayoutClassNamesConfig,
  accordionHeader: accordionHeaderLayoutClassNamesConfig,
  accordionPanel: accordionPanelLayoutClassNamesConfig,
  tabs: tabsLayoutClassNamesConfig,
  tab: tabLayoutClassNamesConfig,
  badge: badgeLayoutClassNamesConfig,
  badgeContainer: badgeContainerLayoutClassNamesConfig,
};
