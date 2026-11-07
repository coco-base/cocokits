---
'@cocokits/angular': minor
'@cocokits/theme-cocokits-angular': minor
---

BREAKING: 24 Angular parts now match only their tag, and the attribute form is removed. Markup that
puts one of them on another element stops working. Move each part to its tag, for example
`<div cckSelect>` becomes `<cck-select>`, and close it with the same tag.

- `cckAccordion` is `cck-accordion`
- `cckAccordionItem` is `cck-accordion-item`
- `cckBadge` is `cck-badge`
- `cckBadgeContainer` is `cck-badge-container`
- `cckCheckbox` is `cck-checkbox`
- `cckDialogDescription` is `cck-dialog-description`
- `cckFieldError` is `cck-field-error`
- `cckFormField` is `cck-form-field`
- `cckHint` is `cck-hint`
- `cckPopoverContent` is `cck-popover-content`
- `cckPopoverDescription` is `cck-popover-description`
- `cckPopoverArrow` is `cck-popover-arrow`
- `cckRadio` is `cck-radio`
- `cckRadioGroup` is `cck-radio-group`
- `cckSelect` is `cck-select`
- `cckSelectOption` is `cck-select-option`
- `cckSelectOptionGroup` is `cck-select-option-group`
- `cckSelectSeparator` is `cck-select-separator`
- `cckSwitch` is `cck-switch`
- `cckTabNavPanel` is `cck-tab-nav-panel`
- `cckTabs` is `cck-tabs`
- `cckTab` is `cck-tab`
- `cckTooltipContent` is `cck-tooltip-content`
- `cckTooltipArrow` is `cck-tooltip-arrow`

The `exportAs` names are unchanged (`#s="cckSelect"` still works). Parts on a native element
(`button[cckButton]`, `input[cckInput]`) and the attribute-only parts (`cckDialog`, `cckDialogTitle`,
`cckPopover`, `cckPopoverAnchor`, `cckPopoverTitle`, `cckTooltip`, `cckTooltipTrigger`, `cckLeading`,
`cckPrefix`, `cckSuffix`, `cckTrailing`) keep their selectors. The cocokits Angular theme directives
follow the new tags of their root parts.
