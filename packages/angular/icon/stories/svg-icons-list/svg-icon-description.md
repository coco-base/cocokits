This page contains a list of available icons under you selected theme package.
Find you icon and the send the icon object to the `SvgIcon` component

For example:

```typescript
import { svgIconMap } from '@cocokits/theme-YOUR_THEME_NAME'; // <-- Replace YOUR_THEME_NAME with yout theme name
import { SvgIconComponent } from '@cocokits/angular-icon';

@Component({
  standalone: true,
  imports: [SvgIconComponent],
  template: `
    <cck-svg-icon [icon]="svgIconMap['NAME_OF_ICON']" /> // <-- Replace NAME_OF_ICON with your icon name
  `
})
export class HighlightComponent {
  protected readonly svgIconMap = svgIconMap;
}
```

