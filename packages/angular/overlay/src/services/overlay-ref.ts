import { TemplateRef, Type } from '@angular/core';

import { OnceReplaySubject } from '@cocokits/common-utils';

import { OverlayConfig } from '../models/overlay-config.model';

export class OverlayRef<TData = unknown, TResult = unknown> {
  private closeReplaySubject$ = new OnceReplaySubject<TResult | undefined>();
  public close$ = this.closeReplaySubject$.asObservable();

  public get data() {
    return this.config.data;
  }

  // eslint-disable-next-line no-empty-function
  constructor(
    public componentOrTemplate: Type<any> | TemplateRef<any>,
    public config: OverlayConfig<TData>
  ) {}

  public close(result?: TResult) {
    this.closeReplaySubject$.next(result);
  }
}
