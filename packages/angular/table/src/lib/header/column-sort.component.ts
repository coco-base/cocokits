import { Component, computed, effect, inject, input, Signal } from '@angular/core';
import { DataSource, SortDirection } from '@cocokits/common-utils';
import { TableDataSource } from '../table.tokes';
import { toSignal } from '@angular/core/rxjs-interop';
import { lastValueFrom, map } from 'rxjs';
import { IconButtonComponent } from '@cocokits/angular-button';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { Icons } from '@cocokits/common-icons';

@Component({
  selector: 'cck-column-sort',
  imports: [IconButtonComponent, SvgIconComponent],
  template: `
    <button cck-icon-button type="secondary" size="sm" (click)="onSortBtnClick()">
      <cck-svg-icon [icon]="sortIcon()" />
    </button>
  `,
  styles: ``,
})
export class ColumnSortComponent<T extends object> {
  field = input.required<keyof T>();
  removable = input<boolean>(false);

  private tableDataSource = inject(TableDataSource) as DataSource<T>;
  protected readonly Icons = Icons;

  protected sortDirection: Signal<SortDirection> = toSignal(
    this.tableDataSource.change$.pipe(
      map((changeData) => changeData.sortFields.find((sf) => sf.field === this.field())?.direction ?? 'none')
    ),
    { initialValue: 'none' }
  );

  protected sortIcon = computed(() => {
    const direction = this.sortDirection();
    if (direction === 'asc') {
      return Icons.arrowHeadUp;
    }
    if (direction === 'desc') {
      return Icons.arrowHeadDown;
    }
    return Icons.minus;
  });

  private fieldNames = toSignal(this.tableDataSource.fieldNames$, { initialValue: [] as (keyof T)[] });

  protected onSortBtnClick() {
    this.tableDataSource.toggleOrAddSortField(this.field(), this.removable());
  }

  private __validateField = effect(() => {
    const field = this.field();
    const fieldNames = this.fieldNames();

    const valid = fieldNames.includes(field);
    if (!valid) {
      throw new Error(
        `ColumnSortComponent: The provided field "${String(field)}" is not a valid field of the data source.`
      );
    }
  });
}
