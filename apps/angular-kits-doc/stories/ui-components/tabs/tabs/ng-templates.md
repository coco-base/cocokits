### Custom Tab Header
Use this template to display a custom header inside the tab. This is helpful when you want full control over how the tab header looks or behaves, such as adding icons, custom styling, or conditional content based on the tab's state.

**Selector:** `ng-template[cckTabHeader]`

**Reference:** `TabHeaderTemplateDirective`


It can be defined at:

- Under each `cck-tab`: applies only to that specific tab


**Context Properties:**

| Name       | Type      | Description                        |
|------------|-----------|------------------------------------| 
| `selected` | `boolean` | Whether the tab is currently selected. |

**Usage Example:**

```html
<cck-tabs>
  <cck-tab>
    <ng-template cckTabHeader let-selected="selected">
      <div style="display: flex; gap: 4px; align-items: center;">
        <cck-svg-icon [icon]="Icons.dashboard"/>
        <span [style.font-weight]="selected ? 'bold' : 'normal'">
          Dashboard
        </span>
      </div>
    </ng-template>
    <!-- Tab content here -->
  </cck-tab>
  
  <cck-tab>
    <ng-template cckTabHeader let-selected="selected">
      <div style="display: flex; gap: 4px; align-items: center;">
        <cck-svg-icon [icon]="Icons.settings"/>
        <span [style.color]="selected ? 'var(--cck-color-primary)' : 'inherit'">
          Settings
        </span>
      </div>
    </ng-template>
    <!-- Tab content here -->
  </cck-tab>
</cck-tabs>
```

For advanced examples check the overview tab

**Important:** When this template is used, the default tab header (just the text from the `header` input) will be replaced with your custom template. The tab's click functionality and selection behavior remain unchanged.