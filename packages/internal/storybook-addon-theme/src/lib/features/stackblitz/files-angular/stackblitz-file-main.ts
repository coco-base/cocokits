export const main = `import { bootstrapApplication } from '@angular/platform-browser';

import { provideCocokits } from '@cocokits/angular-components';
import { framesXThemeConfig } from '@cocokits/theme-frames-x';
import { ExampleComponent } from './example/example.component';

bootstrapApplication(ExampleComponent, {
  providers: [
    provideCocokits(framesXThemeConfig),
  ]
})`;
