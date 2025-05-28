#### Custom Avatar Content
Use this template to display custom content inside the avatar component. This is useful for advanced scenarios, such as displaying multiple images as a single avatar, or having full control over the avatar's image rendering and logic.

**Selector:** `ng-template[cckAvatar]`  
**Reference:** `AvatarTemplateDirective`

**Context Properties:**

This template does not provide any context properties.


<br/>
**Usage Example:**

```html
<cck-avatar>
  <ng-template cckAvatar>
    <picture>
      <source media="(min-width: 1024px)" srcset="assets/avatar-large1.jpg">
      <source media="(min-width: 600px)" srcset="assets/avatar-medium1.jpg">
      <img src="assets/avatar-small1.jpg" alt="User avatar">
    </picture>
  </ng-template>
</cck-avatar>
```

**Important:** When a custom template is provided, all default content, css selectors, styles, and component configurations related to child elements will be removed. Only your custom template and the host component will be rendered.