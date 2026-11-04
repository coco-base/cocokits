import { APP_ID, inject, Injectable } from '@angular/core';

/**
 * Creates ids that are the same on the server and in the browser. The counter belongs to the
 * application, and ids carry the application's `APP_ID`, so two applications on one page that set different `APP_ID`s never clash. The
 * order of `getId` calls decides the number, and server and client render in the same order.
 */
@Injectable({ providedIn: 'root' })
export class IdGenerator {
  private readonly appId = inject(APP_ID);
  private next = 0;

  /**
   * Returns a new id.
   *
   * @param prefix - A readable start for the id, for example `cck-form-field`.
   * @returns `<prefix>-<app id>-<number>`, unique in the application.
   */
  getId(prefix: string): string {
    const id = `${prefix}-${this.appId}-${String(this.next)}`;
    this.next += 1;
    return id;
  }
}
