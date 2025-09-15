/* eslint-disable */
import { computed, Injectable, Signal, signal, inject } from '@angular/core';
import {
  FilterModel,
  FilterCondition,
  ColumnFilterConfig,
  SimpleFilterConfig,
  FilterOperator,
  FilterType,
  LogicalOperator,
  FilterMatcher,
  GlobalFilterMatcher,
  ColumnFilterGroup,
  PaginationModel,
  PaginationInfo,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  SortModel,
  SortConfig,
  SortDirection,
  SortInfo,
  SortComparator,
  ColumnSortConfig,
} from './filter.types';
import { FilterService } from './filter.service';
import { FilterUtils } from './filter.utils';

@Injectable()
export class TableDataSource<T> {
  private filterService = inject(FilterService);

  // Sorting state
  public sortModel = signal<SortModel<T>>({
    sorts: [],
  });

  // Multi-sort enabled flag
  public multiSortEnabled = signal<boolean>(false);

  // Column sort configurations
  private columnSortConfigs = signal<Map<keyof T, ColumnSortConfig<T>>>(new Map());

  // Custom sort comparators for specific columns
  private customComparators = signal<Map<keyof T, SortComparator<T>>>(new Map());

  // Filtering state
  public filterModel = signal<FilterModel<T>>({
    columnGroups: [],
    globalFilter: '',
    globalFilterFields: [],
  });

  // Column operators for same-column conditions (default: AND)
  private columnOperators = signal<Map<keyof T, LogicalOperator>>(new Map());

  // Column filter configurations
  private columnConfigs = signal<Map<keyof T, ColumnFilterConfig<T>>>(new Map());

  // Custom filter matchers for specific columns
  private customMatchers = signal<Map<keyof T, FilterMatcher<T>>>(new Map());

  // Custom global filter matcher
  private customGlobalMatcher = signal<GlobalFilterMatcher<T> | null>(null);

  // Raw data signal
  private rawData = signal<T[]>([]);

  // =============================================================================
  // PAGINATION STATE
  // =============================================================================

  // Pagination state
  public pagination = signal<PaginationModel>({
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  });

  // Available page size options
  public pageSizeOptions = signal<readonly number[]>(DEFAULT_PAGE_SIZE_OPTIONS);

  // =============================================================================
  // SORTING METHODS
  // =============================================================================

  /**
   * Set single column sort (replaces all existing sorts)
   */
  public setSort(field: keyof T, direction: SortDirection): void {
    this.sortModel.set({
      sorts: [
        {
          field,
          direction,
          priority: 0,
        },
      ],
    });
  }

  /**
   * Add or update a sort for a specific column (multi-sort)
   */
  public addSort(field: keyof T, direction: SortDirection, priority?: number): void {
    const current = this.sortModel();
    const existingSorts = current.sorts.filter((s) => s.field !== field);

    const newSort: SortConfig<T> = {
      field,
      direction,
      priority: priority ?? existingSorts.length,
    };

    const allSorts = [...existingSorts, newSort];

    // Sort by priority
    allSorts.sort((a, b) => (a.priority || 0) - (b.priority || 0));

    // Reassign priorities to maintain order
    allSorts.forEach((sort, index) => {
      sort.priority = index;
    });

    this.sortModel.set({
      sorts: allSorts,
    });
  }

  /**
   * Toggle sort for a column (cycles through: none -> asc -> desc -> none)
   */
  public toggleSort(field: keyof T, multiSort: boolean = false): void {
    const current = this.sortModel();
    const existingSort = current.sorts.find((s) => s.field === field);

    if (!multiSort) {
      // Single sort mode - replace all sorts
      if (!existingSort) {
        this.setSort(field, 'asc');
      } else if (existingSort.direction === 'asc') {
        this.setSort(field, 'desc');
      } else {
        this.clearSort();
      }
    } else {
      // Multi sort mode - add/update/remove specific field
      if (!existingSort) {
        this.addSort(field, 'asc');
      } else if (existingSort.direction === 'asc') {
        this.addSort(field, 'desc', existingSort.priority);
      } else {
        this.removeSort(field);
      }
    }
  }

  /**
   * Remove sort for a specific column
   */
  public removeSort(field: keyof T): void {
    const current = this.sortModel();
    const filteredSorts = current.sorts.filter((s) => s.field !== field);

    // Reassign priorities
    filteredSorts.forEach((sort, index) => {
      sort.priority = index;
    });

    this.sortModel.set({
      sorts: filteredSorts,
    });
  }

  /**
   * Clear all sorts
   */
  public clearSort(): void {
    this.sortModel.set({
      sorts: [],
    });
  }

  /**
   * Set multiple sorts at once
   */
  public setSorts(sorts: SortConfig<T>[]): void {
    // Ensure priorities are set and ordered
    const sortedSorts = [...sorts].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    sortedSorts.forEach((sort, index) => {
      sort.priority = index;
    });

    this.sortModel.set({
      sorts: sortedSorts,
    });
  }

  /**
   * Enable or disable multi-column sorting
   */
  public setMultiSortEnabled(enabled: boolean): void {
    this.multiSortEnabled.set(enabled);

    // If disabling multi-sort and we have multiple sorts, keep only the first one
    if (!enabled) {
      const current = this.sortModel();
      if (current.sorts.length > 1) {
        this.sortModel.set({
          sorts: current.sorts.slice(0, 1),
        });
      }
    }
  }

  /**
   * Get sort information for a specific column
   */
  public getColumnSort(field: keyof T): SortConfig<T> | undefined {
    return this.sortModel().sorts.find((s) => s.field === field);
  }

  /**
   * Check if a column is currently sorted
   */
  public isColumnSorted(field: keyof T): boolean {
    return this.sortModel().sorts.some((s) => s.field === field);
  }

  /**
   * Get sort priority for a column (0-based, undefined if not sorted)
   */
  public getColumnSortPriority(field: keyof T): number | undefined {
    const sort = this.getColumnSort(field);
    return sort?.priority;
  }

  // =============================================================================
  // SORT CONFIGURATION METHODS
  // =============================================================================

  /**
   * Set sort configuration for a specific column
   */
  public setColumnSortConfig(field: keyof T, config: ColumnSortConfig<T>): void {
    const current = this.columnSortConfigs();
    const newConfigs = new Map(current);
    newConfigs.set(field, config);
    this.columnSortConfigs.set(newConfigs);
  }

  /**
   * Set sort configurations for multiple columns
   */
  public setColumnSortConfigs(configs: ColumnSortConfig<T>[]): void {
    const configMap = new Map<keyof T, ColumnSortConfig<T>>();
    configs.forEach((config) => {
      configMap.set(config.field, config);
    });
    this.columnSortConfigs.set(configMap);
  }

  /**
   * Get sort configuration for a specific column
   */
  public getColumnSortConfig(field: keyof T): ColumnSortConfig<T> | undefined {
    return this.columnSortConfigs().get(field);
  }

  /**
   * Set custom comparator for a column
   */
  public setCustomComparator(field: keyof T, comparator: SortComparator<T>): void {
    const current = this.customComparators();
    const newComparators = new Map(current);
    newComparators.set(field, comparator);
    this.customComparators.set(newComparators);
  }

  /**
   * Check if a column is sortable
   */
  public isColumnSortable(field: keyof T): boolean {
    const config = this.getColumnSortConfig(field);
    return config?.sortable !== false; // Default to true
  }

  // =============================================================================
  // FILTERING METHODS
  // =============================================================================

  /**
   * Set a complete filter model with multiple conditions
   */
  public setFilter(filterModel: FilterModel<T>): void {
    this.filterModel.set(filterModel);
  }

  /**
   * Add a single filter condition
   */
  public addFilterCondition(condition: FilterCondition<T>): void {
    const current = this.filterModel();

    // Find or create column group
    const existingGroupIndex = current.columnGroups.findIndex((group) => group.field === condition.field);

    const newColumnGroups = [...current.columnGroups];

    if (existingGroupIndex >= 0) {
      // Add to existing group
      const existingGroup = newColumnGroups[existingGroupIndex];
      newColumnGroups[existingGroupIndex] = {
        ...existingGroup,
        conditions: [...existingGroup.conditions, condition],
      };
    } else {
      // Create new group
      const newGroup: ColumnFilterGroup<T> = {
        field: condition.field,
        operator: this.columnOperators().get(condition.field) || 'AND',
        conditions: [condition],
      };
      newColumnGroups.push(newGroup);
    }

    this.filterModel.set({
      ...current,
      columnGroups: newColumnGroups,
    });

    // Reset to first page when filter changes
    this.resetPagination();
  }

  /**
   * Add multiple filter conditions to the same column
   * Example: addColumnConditions('age', [
   *   { operator: 'greaterThan', value: 25 },
   *   { operator: 'lessThan', value: 45 }
   * ])
   */
  public addColumnConditions(
    field: keyof T,
    conditions: Array<{ operator: FilterOperator; value: any; value2?: any; type?: FilterType }>,
    groupOperator: LogicalOperator = 'AND'
  ): void {
    const current = this.filterModel();

    // Set the column operator
    this.setColumnOperator(field, groupOperator);

    // Create filter conditions
    const filterConditions: FilterCondition<T>[] = conditions.map((condition) => ({
      field,
      operator: condition.operator,
      value: condition.value,
      value2: condition.value2,
      type: condition.type || FilterUtils.detectFilterType(condition.value),
    }));

    // Find existing group or create new one
    const existingGroupIndex = current.columnGroups.findIndex((group) => group.field === field);
    const newColumnGroups = [...current.columnGroups];

    if (existingGroupIndex >= 0) {
      // Replace existing group
      newColumnGroups[existingGroupIndex] = {
        field,
        operator: groupOperator,
        conditions: filterConditions,
      };
    } else {
      // Create new group
      const newGroup: ColumnFilterGroup<T> = {
        field,
        operator: groupOperator,
        conditions: filterConditions,
      };
      newColumnGroups.push(newGroup);
    }

    this.filterModel.set({
      ...current,
      columnGroups: newColumnGroups,
    });
  }

  /**
   * Remove a filter condition by field
   */
  public removeFilterCondition(field: keyof T): void {
    const current = this.filterModel();
    this.filterModel.set({
      ...current,
      columnGroups: current.columnGroups.filter((group) => group.field !== field),
    });
  }

  /**
   * Set a simple column filter (single condition)
   */
  public setColumnFilter(
    field: keyof T,
    operator: FilterOperator,
    value: any,
    value2?: any,
    type: FilterType = FilterType.Text
  ): void {
    const current = this.filterModel();

    const newCondition: FilterCondition<T> = {
      field,
      operator,
      value: serializeFilterValue(value, type),
      value2: serializeFilterValue(value2, type),
      type,
    };

    // Find existing group or create new one
    const existingGroupIndex = current.columnGroups.findIndex((group) => group.field === field);
    const newColumnGroups = [...current.columnGroups];

    if (existingGroupIndex >= 0) {
      // Replace existing group with single condition
      newColumnGroups[existingGroupIndex] = {
        field,
        operator: this.columnOperators().get(field) || 'AND',
        conditions: [newCondition],
      };
    } else {
      // Create new group
      const newGroup: ColumnFilterGroup<T> = {
        field,
        operator: this.columnOperators().get(field) || 'AND',
        conditions: [newCondition],
      };
      newColumnGroups.push(newGroup);
    }

    this.filterModel.set({
      ...current,
      columnGroups: newColumnGroups,
    });
  }

  /**
   * Set multiple column filters at once
   */
  public setColumnFilters(filters: SimpleFilterConfig<T>): void {
    const columnGroups: ColumnFilterGroup<T>[] = [];

    Object.entries(filters).forEach(([field, config]) => {
      if (config && typeof config === 'object' && 'operator' in config) {
        const filterConfig = config as { operator: FilterOperator; value: any; value2?: any };
        const condition: FilterCondition<T> = {
          field: field as keyof T,
          operator: filterConfig.operator,
          value: filterConfig.value,
          value2: filterConfig.value2,
          type: this.getColumnConfig(field as keyof T)?.type || FilterType.Text,
        };

        const group: ColumnFilterGroup<T> = {
          field: field as keyof T,
          operator: this.columnOperators().get(field as keyof T) || 'AND',
          conditions: [condition],
        };
        columnGroups.push(group);
      }
    });

    const current = this.filterModel();
    this.filterModel.set({
      ...current,
      columnGroups,
    });
  }

  /**
   * Clear a specific column filter
   */
  public clearColumnFilter(field: keyof T): void {
    this.removeFilterCondition(field);
  }

  /**
   * Clear all column filters
   */
  public clearAllColumnFilters(): void {
    const current = this.filterModel();
    this.filterModel.set({
      ...current,
      columnGroups: [],
    });
  }

  /**
   * Set global filter
   */
  public setGlobalFilter(searchTerm: string, fields?: (keyof T)[]): void {
    const current = this.filterModel();
    this.filterModel.set({
      ...current,
      globalFilter: searchTerm,
      globalFilterFields: fields || current.globalFilterFields,
    });
    // Reset to first page when global filter changes
    this.resetPagination();
  }

  /**
   * Clear global filter
   */
  public clearGlobalFilter(): void {
    const current = this.filterModel();
    this.filterModel.set({
      ...current,
      globalFilter: '',
    });
  }

  /**
   * Set the logical operator for conditions within a specific column (AND/OR)
   */
  public setColumnOperator(field: keyof T, operator: LogicalOperator): void {
    const current = this.columnOperators();
    const newOperators = new Map(current);
    newOperators.set(field, operator);
    this.columnOperators.set(newOperators);

    // Update the column group if it exists
    const filterModel = this.filterModel();
    const groupIndex = filterModel.columnGroups.findIndex((group) => group.field === field);
    if (groupIndex >= 0) {
      const newColumnGroups = [...filterModel.columnGroups];
      newColumnGroups[groupIndex] = {
        ...newColumnGroups[groupIndex],
        operator,
      };
      this.filterModel.set({
        ...filterModel,
        columnGroups: newColumnGroups,
      });
    }
  }

  /**
   * Clear all filters (both column and global)
   */
  public clearAllFilters(): void {
    this.filterModel.set({
      columnGroups: [],
      globalFilter: '',
      globalFilterFields: [],
    });
    this.columnOperators.set(new Map());
    // Reset to first page when filters are cleared
    this.resetPagination();
  }

  // =============================================================================
  // PAGINATION METHODS
  // =============================================================================

  /**
   * Set pagination configuration
   */
  public setPagination(page: number | string, pageSize: number | string): void {
    const current = this.paginationModel();
    const newPageSize = Math.max(1, Number(pageSize));
    const maxPage = Math.max(0, Math.ceil(current.totalItems / newPageSize) - 1);
    const newPage = Math.max(0, Math.min(Number(page), maxPage));

    this.pagination.set({
      page: newPage,
      pageSize: newPageSize,
      totalItems: current.totalItems,
      totalPages: Math.ceil(current.totalItems / newPageSize),
    });

    console.log('setPagination', this.pagination());
  }

  /**
   * Set current page
   */
  public setPage(page: number | string): void {
    const current = this.paginationModel();
    const maxPage = Math.max(0, current.totalPages - 1);
    const newPage = Math.max(0, Math.min(Number(page), maxPage));

    this.pagination.update((state) => ({
      ...state,
      page: newPage,
    }));
  }

  /**
   * Set page size
   */
  public setPageSize(pageSize: number | string): void {
    const current = this.paginationModel();
    const newPageSize = Math.max(1, Number(pageSize));
    const currentItemIndex = current.page * current.pageSize;
    const newPage = Math.floor(currentItemIndex / newPageSize);
    const newTotalPages = Math.ceil(current.totalItems / newPageSize);

    this.pagination.set({
      page: Math.max(0, Math.min(newPage, newTotalPages - 1)),
      pageSize: newPageSize,
      totalItems: current.totalItems,
      totalPages: newTotalPages,
    });
  }

  /**
   * Go to next page
   */
  public nextPage(): void {
    const current = this.paginationModel();
    if (current.page < current.totalPages - 1) {
      this.setPage(current.page + 1);
    }
  }

  /**
   * Go to previous page
   */
  public previousPage(): void {
    const current = this.paginationModel();
    if (current.page > 0) {
      this.setPage(current.page - 1);
    }
  }

  /**
   * Go to first page
   */
  public firstPage(): void {
    this.setPage(0);
  }

  /**
   * Go to last page
   */
  public lastPage(): void {
    const current = this.paginationModel();
    this.setPage(current.totalPages - 1);
  }

  /**
   * Reset pagination to first page
   */
  public resetPagination(): void {
    this.pagination.update((state) => ({
      ...state,
      page: 0,
    }));
  }

  /**
   * Set available page size options
   */
  public setPageSizeOptions(options: readonly number[]): void {
    this.pageSizeOptions.set(options);
  }

  /**
   * Check if next page is available
   */
  public canGoNext(): boolean {
    const current = this.paginationModel();
    return current.page < current.totalPages - 1;
  }

  /**
   * Check if previous page is available
   */
  public canGoPrevious(): boolean {
    const current = this.paginationModel();
    return current.page > 0;
  }

  /**
   * Get pagination information for display
   */
  public getPaginationInfo(): PaginationInfo {
    const current = this.paginationModel();
    const startIndex = current.totalItems === 0 ? 0 : current.page * current.pageSize + 1;
    const endIndex = Math.min((current.page + 1) * current.pageSize, current.totalItems);

    return {
      currentPage: current.page + 1, // 1-based for display
      pageSize: current.pageSize,
      totalItems: current.totalItems,
      totalPages: current.totalPages,
      startIndex,
      endIndex,
      hasPrevious: this.canGoPrevious(),
      hasNext: this.canGoNext(),
    };
  }

  // =============================================================================
  // COLUMN CONFIGURATION METHODS
  // =============================================================================

  /**
   * Set configuration for a specific column
   */
  public setColumnConfig(field: keyof T, config: ColumnFilterConfig<T>): void {
    const current = this.columnConfigs();
    const newConfigs = new Map(current);
    newConfigs.set(field, config);
    this.columnConfigs.set(newConfigs);
  }

  /**
   * Set configurations for multiple columns
   */
  public setColumnConfigs(configs: ColumnFilterConfig<T>[]): void {
    const configMap = new Map<keyof T, ColumnFilterConfig<T>>();
    configs.forEach((config) => {
      configMap.set(config.field, config);
    });
    this.columnConfigs.set(configMap);
  }

  /**
   * Get configuration for a specific column
   */
  public getColumnConfig(field: keyof T): ColumnFilterConfig<T> | undefined {
    return this.columnConfigs().get(field);
  }

  /**
   * Set custom filter matcher for a column
   */
  public setCustomMatcher(field: keyof T, matcher: FilterMatcher<T>): void {
    const current = this.customMatchers();
    const newMatchers = new Map(current);
    newMatchers.set(field, matcher);
    this.customMatchers.set(newMatchers);
  }

  /**
   * Set custom global filter matcher
   */
  public setCustomGlobalMatcher(matcher: GlobalFilterMatcher<T>): void {
    this.customGlobalMatcher.set(matcher);
  }

  // =============================================================================
  // DATA MANAGEMENT
  // =============================================================================

  /**
   * Set the raw data for the table
   */
  public setData(data: T[]): void {
    this.rawData.set(data);
    // Reset pagination when data changes
    this.resetPagination();
    console.log('setData', data, this.rawData());
  }

  /**
   * Get the raw data
   */
  public getRawData(): T[] {
    return this.rawData();
  }

  /**
   * Computed data with filtering and sorting applied (before pagination)
   */
  public filteredSortedData = computed(() => {
    let processedData = this.rawData();
    console.log('Raw data:', processedData);

    // Apply filtering
    processedData = this.applyFiltering(
      processedData,
      this.filterModel(),
      this.columnConfigs(),
      this.customMatchers(),
      this.customGlobalMatcher()
    );
    console.log(
      'Filtered data:',
      processedData,
      this.filterModel(),
      this.columnConfigs(),
      this.customMatchers(),
      this.customGlobalMatcher()
    );

    // Apply sorting
    const sortModel = this.sortModel();
    if (sortModel.sorts.length > 0) {
      processedData = this.applySorting(processedData, sortModel);
    }

    console.log('Sorted data:', processedData, this.sortModel());

    return processedData;
  });

  /**
   * Computed pagination model with updated totals
   */
  public paginationModel = computed(() => {
    const current = this.pagination();
    const totalFilteredItems = this.filteredSortedData().length;
    const newTotalPages = Math.max(1, Math.ceil(totalFilteredItems / current.pageSize));
    const newPage = Math.min(current.page, newTotalPages - 1);

    console.log('pagination Model:', {
      ...current,
      page: Math.max(0, newPage),
      totalItems: totalFilteredItems,
      totalPages: newTotalPages,
    });

    return {
      ...current,
      page: Math.max(0, newPage),
      totalItems: totalFilteredItems,
      totalPages: newTotalPages,
    };
  });

  /**
   * Computed paginated data (final data for display)
   */
  public data = computed(() => {
    const fullData = this.filteredSortedData();
    return this.applyPagination(fullData, this.paginationModel());
  });

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get current filter state
   */
  public getFilterModel(): FilterModel<T> {
    return this.filterModel();
  }

  /**
   * Get current sort state
   */
  public getSortModel(): SortModel<T> {
    return this.sortModel();
  }

  /**
   * Get sort information for display
   */
  public getSortInfo(): SortInfo<T> {
    const model = this.sortModel();
    return {
      sorts: model.sorts,
      isMultiSort: this.multiSortEnabled(),
      primarySort: model.sorts[0],
    };
  }

  /**
   * Check if any sorts are active
   */
  public hasActiveSorts(): boolean {
    return this.sortModel().sorts.length > 0;
  }

  /**
   * Check if any filters are active
   */
  public hasActiveFilters(): boolean {
    const filter = this.filterModel();
    return filter.columnGroups.length > 0 || (filter.globalFilter?.trim().length || 0) > 0;
  }

  /**
   * Get filtered data count
   */
  public getFilteredCount(originalData: T[]): number {
    const filter = this.filterModel();
    const configs = this.columnConfigs();
    const matchers = this.customMatchers();
    const globalMatcher = this.customGlobalMatcher();

    return this.applyFiltering(originalData, filter, configs, matchers, globalMatcher).length;
  }

  /**
   * Get current pagination state
   */
  public getPaginationModel(): PaginationModel {
    return this.paginationModel();
  }

  /**
   * Get total number of items after filtering
   */
  public getTotalItems(): number {
    return this.paginationModel().totalItems;
  }

  /**
   * Check if pagination is needed (more than one page)
   */
  public isPaginationNeeded(): boolean {
    const current = this.paginationModel();
    return current.totalPages > 1;
  }

  // =============================================================================
  // PRIVATE FILTERING IMPLEMENTATION
  // =============================================================================

  private applyFiltering(
    data: T[],
    filterModel: FilterModel<T>,
    configs: Map<keyof T, ColumnFilterConfig<T>>,
    customMatchers: Map<keyof T, FilterMatcher<T>>,
    globalMatcher: GlobalFilterMatcher<T> | null
  ): T[] {
    return data.filter((item) => {
      // Apply column filters using new column groups
      const passesColumnFilters = this.filterService.applyColumnGroups(item, filterModel.columnGroups, customMatchers);

      // Apply global filter
      const passesGlobalFilter =
        !filterModel.globalFilter?.trim() ||
        this.filterService.applyGlobalFilter(
          item,
          filterModel.globalFilter,
          filterModel.globalFilterFields || [],
          globalMatcher || undefined
        );

      return passesColumnFilters && passesGlobalFilter;
    });
  }

  /**
   * Apply sorting to the data (supports multi-column sorting)
   */
  private applySorting(data: T[], sortModel: SortModel<T>): T[] {
    if (sortModel.sorts.length === 0) {
      return data;
    }

    return [...data].sort((a, b) => {
      // Apply sorts in priority order
      for (const sortConfig of sortModel.sorts) {
        const comparison = this.compareValues(a, b, sortConfig);
        if (comparison !== 0) {
          return comparison;
        }
      }
      return 0;
    });
  }

  /**
   * Compare two values for a specific sort configuration
   */
  private compareValues(a: T, b: T, sortConfig: SortConfig<T>): number {
    const { field, direction } = sortConfig;

    // Check for custom comparator
    const customComparator = this.customComparators().get(field);
    if (customComparator) {
      return customComparator(a, b, field, direction);
    }

    // Default comparison logic
    const aValue = a[field];
    const bValue = b[field];

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Handle different data types
    let comparison = 0;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      // String comparison (case-insensitive)
      comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      // Numeric comparison
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      // Date comparison
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      // Generic comparison (convert to string)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      comparison = aStr.localeCompare(bStr);
    }

    return direction === 'desc' ? -comparison : comparison;
  }

  /**
   * Apply pagination to the data
   */
  private applyPagination(data: T[], paginationModel: PaginationModel): T[] {
    if (paginationModel.pageSize <= 0 || data.length === 0) {
      return data;
    }

    const startIndex = paginationModel.page * paginationModel.pageSize;
    const endIndex = startIndex + paginationModel.pageSize;

    return data.slice(startIndex, endIndex);
  }
}

function serializeFilterValue(value: any, type: FilterType): any {
  if (value == null) return value;

  switch (type) {
    case FilterType.Number:
      return Number(value);
    case FilterType.Date:
      return new Date(value).toISOString();
    case FilterType.Text:
    case FilterType.Set:
    default:
      return String(value).toLowerCase();
  }
}
