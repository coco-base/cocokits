import type { Type } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { providers } from './helpers';

/** Renders the `app-root` component on the server, with the cocokits theme when `themed` is set. */
export const renderThemedApp = <T>(root: Type<T>, themed: boolean): Promise<string> =>
  renderApplication(
    (context) =>
      bootstrapApplication(root, { providers: [provideServerRendering(), ...(themed ? providers : [])] }, context),
    { document: '<html><body><app-root></app-root></body></html>' },
  );
