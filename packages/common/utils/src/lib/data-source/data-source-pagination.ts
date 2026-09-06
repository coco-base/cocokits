/** @module data-source */

export interface PaginationConfig {
  pageIndex: number; // 0-based
  pageSize: number;
}

export class DataSourcePagination<T> {
  private pageIndex = 0; // 0-based
  private pageSize = 10;

  constructor(pageSize = 10, pageIndex = 0) {
    this.pageSize = Math.max(1, Math.floor(pageSize));
    this.pageIndex = Math.max(0, Math.floor(pageIndex));
  }

  public setPage(index: number) {
    this.pageIndex = Math.max(0, Math.floor(index));
  }

  public setPageSize(size: number) {
    this.pageSize = Math.max(1, Math.floor(size));
    // clamp pageIndex if necessary
    this.pageIndex = Math.max(0, this.pageIndex);
  }

  public next(totalItems: number) {
    const totalPages = this.getTotalPages(totalItems);
    if (this.pageIndex + 1 < totalPages) {
      this.pageIndex++;
    }
  }

  public prev() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  public first() {
    this.pageIndex = 0;
  }

  public last(totalItems: number) {
    const totalPages = this.getTotalPages(totalItems);
    this.pageIndex = Math.max(0, totalPages - 1);
  }

  public reset() {
    this.pageIndex = 0;
  }

  public getPagination(): PaginationConfig {
    return { pageIndex: this.pageIndex, pageSize: this.pageSize };
  }

  public getTotalPages(totalItems: number): number {
    if (!totalItems || totalItems <= 0) {
      return 0;
    }
    return Math.max(1, Math.ceil(totalItems / this.pageSize));
  }

  public hasNext(totalItems: number): boolean {
    return this.pageIndex + 1 < this.getTotalPages(totalItems);
  }

  public hasPrev(): boolean {
    return this.pageIndex > 0;
  }

  /**
   * Apply pagination to a data array and return the paginated slice.
   */
  public apply(data: T[]): T[] {
    const start = this.pageIndex * this.pageSize;
    if (start >= data.length) {
      return [];
    }
    return data.slice(start, start + this.pageSize);
  }
}
