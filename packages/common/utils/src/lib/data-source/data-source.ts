/** @module data-source */

import { BehaviorSubject, map } from 'rxjs';
import { DataSourceFilter } from './data-source-filter';
import { DataSourcePagination } from './data-source-pagination';
import { DataSourceSort } from './data-source-sort';
import { DataSourceChange, DataSourceFilterCondition, DataSourceFilterType, DEFAULT_SORT_DIRECTION, SortDirection } from './data-source.model';
import { DataSourceFilterConditionOrGroup, DataSourceFilterGroup, DataSourceFilterMatchType } from './data-source.model';
import { DataSourceFilterTextCondition, DataSourceFilterNumberCondition, DataSourceFilterDateCondition, DataSourceFilterBooleanCondition } from './data-source.model';
import { DataSourceFilterTextMatchType, DataSourceFilterNumberMatchType, DataSourceFilterDateMatchType, DataSourceFilterBooleanMatchType } from './data-source.model';
import { DataSourceFilterTextMatchTypeList, DataSourceFilterNumberMatchTypeList, DataSourceFilterDateMatchTypeList, DataSourceFilterBooleanMatchTypeList } from './data-source.model';
import { recordReduceMerge, reduceMerge } from '../uncategorized/reduce';
import { detectDataSourceFilterType, validateDataSourceItem } from './data-source.utils';
import { DeepNullable } from '../model/common.model';

export class DataSource<T> {
  private filter = new DataSourceFilter<T>();
  private sort = new DataSourceSort<T>();
  private pagination = new DataSourcePagination<T>();

  private rawData: T[] = [];
  private data: T[] = [];

  private filteredData: T[] = [];
  private sortedData: T[] = [];
  private paginatedData: T[] = [];

  private shouldAutoUpdate = true;
  private hasPaginator = false;

  private changeSubject$ = new BehaviorSubject<DataSourceChange<T>>(this.getChangeData());
  public change$ = this.changeSubject$.asObservable();

  private rawDataSubject$ = new BehaviorSubject<T[]>([]);
  public rawData$ = this.rawDataSubject$.asObservable();

  public fieldNames$ = this.rawData$.pipe(
    map((data) => (data.length > 0 ? (Object.keys(data[0] as string | number) as (keyof T)[]) : []))
  );

  public valueLookup$ = this.rawData$.pipe(
    map((rawData) => generateValueLookup(rawData))
  );

  setData(data: T[], clearConfig = true): void {
    this.rawData = data;
    if (clearConfig) {
      this.filter = new DataSourceFilter<T>();
      this.sort = new DataSourceSort<T>();
      this.pagination = new DataSourcePagination<T>();
      this.filteredData = data;
      this.sortedData = data;
      this.paginatedData = data;
    }
    this.rawDataSubject$.next(this.rawData);
    this.autoUpdate();
  }

  getData(): T[] {
    return this.data;
  }

  getTypes(): Record<keyof T, DataSourceFilterType> {
    const firstRow = this.rawData[0] as Record<keyof T, unknown>;
    return Object.keys(firstRow).reduce((types, key) => {
      types[key as keyof T] = detectDataSourceFilterType(firstRow[key as keyof T]);
      return types;
    }, {} as Record<keyof T, DataSourceFilterType>);
  }

  /**
   * Validates a filter condition for this data source.
   * @param condition The filter condition to validate
   * @returns null if the condition is valid, or an array of error messages if invalid
   */
  validateCondition(condition: Partial<DataSourceFilterCondition<T>>) {
    return validateDataSourceItem(condition, this.rawData);
  }

  public setPaginator(paginator: boolean): void {
    this.hasPaginator = paginator;
    this.autoUpdate();
  }

  // ------------------ Filter API (forwarded) ------------------
  public setFilterConditions(conditions: DataSourceFilterGroup<T>): void {
    this.filter.setConditions(conditions);
    this.autoUpdate();
  }

  public clearAllFilterConditions(): void {
    this.filter.clearAllConditions();
    this.autoUpdate();
  }

  public removeRootFilterConditionByField(field: keyof T): void {
    this.filter.removeRootConditionByField(field);
    this.autoUpdate();
  }

  public removeRootFilterCondition(condition: DataSourceFilterConditionOrGroup<T>): void {
    this.filter.removeRootCondition(condition);
    this.autoUpdate();
  }

  public addRootFilterCondition(newCondition: DataSourceFilterConditionOrGroup<T>): void {
    this.filter.addRootCondition(newCondition);
    this.autoUpdate();
  }

  public getFilterConditionGroup(): DataSourceFilterGroup<T> {
    return this.filter.getConditionGroup();
  }

  public getFilterConditions(): DataSourceFilterConditionOrGroup<T>[] {
    return this.filter.getConditions();
  }

  // ------------------ Sort API (forwarded) ------------------
  public setSortMulti(multi: boolean): void {
    this.sort.setMulti(multi);
    this.autoUpdate();
  }

  public isSortMulti(): boolean {
    return this.sort.isMulti();
  }

  public addSortField(field: keyof T, SortDirection = DEFAULT_SORT_DIRECTION, priority?: number): void {
    this.sort.add(field, SortDirection, priority);
    this.autoUpdate();
  }

  public removeSortField(field: keyof T): void {
    this.sort.remove(field);
    this.autoUpdate();
  }

  public setSort(field: keyof T, direction: SortDirection): void {
    this.sort.set(field, direction);
    this.autoUpdate();
  }

  public toggleSortField(field: keyof T, allowNone = true): void {
    this.sort.toggle(field, allowNone);
    this.autoUpdate();
  }

  public toggleOrAddSortField(field: keyof T, allowNone = true): void {
    console.log('----------- Toggling or adding sort field:', field);
    this.sort.toggleOrAdd(field, allowNone);
    this.autoUpdate();
  }

  public clearAllSorts(): void {
    this.sort.clearAll();
    this.autoUpdate();
  }

  public setSortPriority(field: keyof T, priority: number): void {
    this.sort.setPriority(field, priority);
    this.autoUpdate();
  }

  public getSortConfigs() {
    return this.sort.getSortConfigs();
  }

  // ------------------ Pagination API (forwarded) ------------------
  public setPaginationPage(page: number): void {
    this.pagination.setPage(page);
    this.autoUpdate();
  }

  public setPaginationPageSize(size: number): void {
    this.pagination.setPageSize(size);
    this.autoUpdate();
  }

  public setPagination(page: number, size: number) {
    this.pagination.setPage(page);
    this.pagination.setPageSize(size);
    this.autoUpdate();
  }

  public goToNextPaginationPage(): void {
    this.pagination.next(this.sortedData.length);
    this.autoUpdate();
  }

  public goToPrevPaginationPage(): void {
    this.pagination.prev();
    this.autoUpdate();
  }

  public goToFirstPaginationPage(): void {
    this.pagination.first();
    this.autoUpdate();
  }

  public goToLastPaginationPage(): void {
    this.pagination.last(this.sortedData.length);
    this.autoUpdate();
  }

  public resetPagination(): void {
    this.pagination.reset();
    this.autoUpdate();
  }

  public getPagination(): { pageIndex: number; pageSize: number; totalItems: number } {
    return {
      ...this.pagination.getPagination(),
      totalItems: this.paginatedData.length,
    };
  }

  public getPaginationTotalPages(): number {
    return this.pagination.getTotalPages(this.sortedData.length);
  }

  public hasNextPaginationPage(): boolean {
    return this.pagination.hasNext(this.sortedData.length);
  }

  public hasPrevPaginationPage(): boolean {
    return this.pagination.hasPrev();
  }

  // ------------------ Orchestration ------------------
  /**
   * Apply filter -> sort -> pagination pipeline and populate internal caches.
   */
  public applyAll(): void {
    this.filteredData = this.filter.apply(this.rawData);
    this.sortedData = this.sort.apply(this.filteredData);
    this.data = this.sortedData;
    if (this.hasPaginator) {
      this.paginatedData = this.pagination.apply(this.sortedData);
      this.data = this.paginatedData;
    }
    this.changeSubject$.next(this.getChangeData());
  }

  private getChangeData(): DataSourceChange<T> {
    return {
      data: this.data,
      conditionGroup: this.filter.getConditionGroup(),
      sortFields: this.sort.getSortConfigs(),
      pagination: {
        pageIndex: this.pagination.getPagination().pageIndex,
        pageSize: this.pagination.getPagination().pageSize,
        totalItems: this.paginatedData.length,
      },
    };
  }

  /**
   * Toggle automatic re-application of the pipeline when configurations change.
   * If enabled, configuration setters call `applyAll()` automatically.
   */
  public setAutoUpdate(autoUpdate: boolean): void {
    this.shouldAutoUpdate = autoUpdate;
  }

  private autoUpdate() {
    if (this.shouldAutoUpdate) {
      this.applyAll();
    }
  }

  // Expose internal results for consumers/tests
  public _getFilteredData(): T[] {
    return this.filteredData;
  }
  public _getSortedData(): T[] {
    return this.sortedData;
  }
  public _getPaginatedData(): T[] {
    return this.paginatedData;
  }
}


function generateValueLookup<T>(rawData: T[]): Record<keyof T, Set<T[keyof T]>> {
  return rawData.reduce(
        (valueLookup, rawDataItem) => {
          console.log(valueLookup, rawDataItem);
          if (typeof rawDataItem === 'object' && rawDataItem !== null) {
            (Object.keys(rawDataItem) as (keyof T)[]).forEach((key) => {
              const value = rawDataItem[key];
              if (value === undefined) {
                return;
              }
              if (!valueLookup[key]) {
                valueLookup[key] = new Set<T[keyof T]>();
              }
              valueLookup[key].add(value);
            });
          }
          return valueLookup;
        },
        {} as Record<keyof T, Set<T[keyof T]>>
      )
}