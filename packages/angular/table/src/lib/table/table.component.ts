import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  Input,
  input,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { _UiBaseComponent } from '@cocokits/angular-core';

import { TableGridLine } from '../table.model';
import { TableDataSource } from '../table.tokes';
import { DataSource, isArray } from '@cocokits/common-utils';
import { TableDataSource as TableDataSourceOld } from '../table-data-source.store';

@Component({
  imports: [NgClass, NgTemplateOutlet, AsyncPipe],
  selector: 'cck-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    TableDataSourceOld,
    {
      provide: TableDataSource,
      useClass: DataSource,
    }
  ],
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class TableComponent<T = any> extends _UiBaseComponent<'table'> implements OnInit {
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

  protected dataSource = inject(TableDataSource) as DataSource<T>;
  public dataSourceOld = inject(TableDataSourceOld) as TableDataSourceOld<T>;


  @Input() set data(data: T[] | { data: T[], clearConfig: boolean }) {
    isArray(data)
      ? this.dataSource.setData(data)
      : this.dataSource.setData(data.data, data.clearConfig);
  }

  _dataOld = input<T[]>([], { alias: 'dataOld' });
  gridLine = input<TableGridLine>(TableGridLine.Full);
  stripedRows = input<boolean>(false);
  hoverEffect = input<boolean>(false);

  @Input() set autoConfigUpdate(autoUpdate: boolean) {
    this.dataSource.setAutoUpdate(autoUpdate);
  }

  // ------ Sorting ------
  @Input() set sortMulti(multi: boolean) {
    this.dataSource.setSortMulti(multi);
  }
  // ------ paginator ------
  @Input() set paginator(paginator: boolean) {
    this.dataSource.setPaginator(paginator);
  }

  protected dataOld = this.dataSourceOld.data;

  tableHeader = contentChild<TemplateRef<any>>('tableHeader');
  tableBody = contentChild<TemplateRef<any>>('tableBody');

  ngOnInit() {
    // this.dataSource.setData(this._dataOld());
  }

  // onClick() {
  //   const sort = this.dataSourceOld.sort();
  //   if(!sort) {
  //     this.dataSourceOld.setSort('number' as any, 'desc');
  //     return;
  //   }
  //   if(sort.key === 'number') {
  //     this.dataSourceOld.setSort('name' as any, 'asc');
  //   } else {
  //     this.dataSourceOld.setSort('number' as any, 'desc');
  //   }
  // }
}
