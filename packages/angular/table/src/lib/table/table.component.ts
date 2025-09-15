import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  OnInit,
  TemplateRef,
  ViewEncapsulation, } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

import { TableGridLine } from '../table.model';
import { TableDataSource } from '../table-data-source.store';

@Component({
  imports: [NgClass, NgTemplateOutlet],
  selector: 'cck-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [TableDataSource],
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class TableComponent<T = unknown> extends _UiBaseComponent implements OnInit<'table'> {
  protected readonly componentName = 'table';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.gridLine() === TableGridLine.Full, classes: this.classNames().gridFull },
    { if: this.gridLine() === TableGridLine.Table, classes: this.classNames().gridTable },
    { if: this.gridLine() === TableGridLine.Rows, classes: this.classNames().gridRows },
    { if: this.gridLine() === TableGridLine.TableRows, classes: this.classNames().gridTableRows },
    { if: this.gridLine() === TableGridLine.Column, classes: this.classNames().gridColumn },
    { if: this.gridLine() === TableGridLine.TableColumn, classes: this.classNames().gridTableColumn },
    { if: this.gridLine() === TableGridLine.Header, classes: this.classNames().gridHeader },
    { if: this.stripedRows(), classes: this.classNames().withStripedRows },
    { if: this.hoverEffect(), classes: this.classNames().withHoverEffect },
  ]);

  public dataSource = inject(TableDataSource<T>);

  _data = input.required<T[]>({ alias: 'data' });
  gridLine = input<TableGridLine>(TableGridLine.Full);
  stripedRows = input<boolean>(false);
  hoverEffect = input<boolean>(false);

  protected data = this.dataSource.data;

  tableHeader = contentChild<TemplateRef<any>>('tableHeader');
  tableBody = contentChild<TemplateRef<any>>('tableBody');

  ngOnInit() {
    this.dataSource.setData(this._data());
  }

  onClick() {
    // const sort = this.dataSource.sort();
    // if(!sort) {
    //   this.dataSource.setSort('number' as any, 'desc');
    //   return;
    // }
    // if(sort.key === 'number') {
    //   this.dataSource.setSort('name' as any, 'asc');
    // } else {
    //   this.dataSource.setSort('number' as any, 'desc');
    // }
  }
}
