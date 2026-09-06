import { describe, it, expect } from 'vitest';
import { DataSourcePagination } from './data-source-pagination';

interface Item { id: number }
const items: Item[] = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

describe('DataSourcePagination', () => {
  it('should default pageSize and index', () => {
    const p = new DataSourcePagination<Item>();
    const cfg = p.getPagination();
    expect(cfg.pageIndex).toBe(0);
    expect(cfg.pageSize).toBe(10);
  });

  it('should clamp setPage and setPageSize values', () => {
    const p = new DataSourcePagination<Item>(5, 2);
    expect(p.getPagination()).toEqual({ pageIndex: 2, pageSize: 5 });
    p.setPage(-1);
    expect(p.getPagination().pageIndex).toBe(0);
    p.setPageSize(0);
    expect(p.getPagination().pageSize).toBe(1);
  });

  it('should handle next, prev, last and first behavior', () => {
    const p = new DataSourcePagination<Item>(5, 0);
    expect(p.getTotalPages(items.length)).toBe(5);
    p.next(items.length);
    expect(p.getPagination().pageIndex).toBe(1);
    p.last(items.length);
    expect(p.getPagination().pageIndex).toBe(4);
    p.next(items.length);
    expect(p.getPagination().pageIndex).toBe(4);
    p.prev();
    expect(p.getPagination().pageIndex).toBe(3);
    p.first();
    expect(p.getPagination().pageIndex).toBe(0);
  });

  it('should report hasNext and hasPrev correctly', () => {
    const p = new DataSourcePagination<Item>(10, 0);
    expect(p.hasPrev()).toBe(false);
    expect(p.hasNext(items.length)).toBe(true);
    p.last(items.length);
    expect(p.hasNext(items.length)).toBe(false);
    expect(p.hasPrev()).toBe(true);
  });

  it('should return correct slice when applying pagination', () => {
    const p = new DataSourcePagination<Item>(10, 1);
    const out = p.apply(items);
    expect(out.length).toBe(10);
    expect(out[0].id).toBe(11);
    const p2 = new DataSourcePagination<Item>(10, 3);
    expect(p2.apply(items).length).toBe(0);
  });
});
