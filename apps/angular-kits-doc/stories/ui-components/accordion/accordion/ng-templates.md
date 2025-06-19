### Custom Accordion Header Icon
Use this template to display a custom icon inside the accordion header. This is helpful when you want full control over how the expand/collapse icon looks or behaves depending on the state of the accordion.

**Selector:** `ng-template[cckAccordionHeaderIcon]`

**Reference:** `AccordionHeaderIconTemplateDirective`


It can be defined at two levels:

- Under `cck-accordion:` applies to all panels
- Under each `cck-accordion-panel`: applies only to the target panel


**Context Properties:**

| Name          | Type      | Description                          |
|---------------|------ ----|--------------------------------------|
| `isExpanded`  | `boolean` | Whether the accordion is expanded.   |
| `disabled  `  | `boolean` | Whether the accordion is disabled.   |

**Usage Example:**

```html
<cck-accordion>
  <ng-template cckAccordionHeaderIcon let-isExpanded="isExpanded" let-disabled="disabled">
    <button cck-icon-button>
      <cck-svg-icon
        [icon]="isExpanded ? Icons.arrowUp : Icons.arrowDown"
        [style.opacity]="disabled ? 0.5 : 1"
      />
    </button>
  </ng-template>
</cck-accordion>
```

For advance example check the overview tab

**Important:** When this template is used, the default expand/collapse icon along with all its functionality (such as animation, hover effects, etc.) will be removed. However, the click handler remains unchanged, and only the custom icon from your template will be rendered.