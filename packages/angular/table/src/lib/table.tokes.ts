import { InjectionToken, inject } from '@angular/core';
import { DataSource } from "@cocokits/common-utils";

export const TableDataSource = new InjectionToken<DataSource<any>>('TableDataSource');
