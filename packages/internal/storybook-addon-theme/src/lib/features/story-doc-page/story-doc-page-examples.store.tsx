/* eslint-disable max-lines */
import { createContext, useContext, useMemo } from 'react';
import {
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';

import {
  deepComparator,
  deepMerge,
  recordReduceMerge,
  repeatReduceMerge,
  resizeObserver$,
} from '@cocokits/common-utils';
interface StoryDocPageExampleStoreCellState {
  index: number;
  expandChanged: boolean;
  expanded: boolean;
  top: string;
  left: string;
  width: string;
  height: string;
}

interface StoryDocPageExampleStoreState {
  gridHeight: number;
  cellState: Record<number, StoryDocPageExampleStoreCellState>;
}

export interface StoryDocPageExampleStoreCellStyle {
  expandedChanged: boolean;
  isExpanded: boolean;
  host: {
    width: string;
    height: string;
    top: string;
    left: string;
    zIndex: string;
    padding: string;
    backgroundColor: string;
    boxShadow: string;
    borderRadius: string;
    border: string;
  };
  title: {
    font: string;
  };
  description: {
    height: string;
    opacity: string;
    marginBottom: string;
  };
  canvasContainer: {
    height: string;
  };
  sourceCode: {
    flex: string;
    height: string;
    opacity: string;
    margin: string;
  };
  expandButton: {
    opacity: string;
  };
  collapseButton: {
    opacity: string;
  };
}

class StoryDocPageExampleStore {
  private gridResizeSubscription: Subscription | null = null;

  private gridHostElem: HTMLDivElement | null = null;
  private state: StoryDocPageExampleStoreState | null = null;

  private cellStateSubject$ = new Subject<StoryDocPageExampleStoreState>();
  public cellState$ = this.cellStateSubject$.asObservable().pipe(
    shareReplay(1)
  );

  public registerHostElement(elem: HTMLDivElement, cellLength: number) {
    this.gridHostElem = elem;
    this.gridResizeSubscription?.unsubscribe();
    this.listenToGridResize(elem, cellLength);
  }

  private listenToGridResize(gridHostElem: HTMLDivElement, cellLength: number) {
    this.gridResizeSubscription = resizeObserver$(gridHostElem).subscribe((event) => {
      const gridHostRect = event.entries[0].contentRect;
      this.updateGridState(gridHostRect, cellLength);
    });
  }

  private updateGridState(gridHostRect: DOMRectReadOnly, cellLength: number) {
    if (!this.gridHostElem) {
      throw new Error('Can not use StoryDocPageExampleStore before initialize');
    }

    const GRID_GAP = 24;
    const MIN_CELL_WIDTH = 250;
    const CELL_HEIGHT = 300;
    const GRID_COLUMNS = Math.max(1, Math.floor((gridHostRect.width + GRID_GAP) / (MIN_CELL_WIDTH + GRID_GAP)));

    const totalHorizontalGap = (GRID_COLUMNS - 1) * GRID_GAP;
    const cellWidth = (gridHostRect.width - totalHorizontalGap) / GRID_COLUMNS;
    const cellState = repeatReduceMerge<StoryDocPageExampleStoreState['cellState']>(cellLength, (index) => {
      const row = Math.floor(index / GRID_COLUMNS);
      const column = index % GRID_COLUMNS;
      return {
        [index]: {
          index,
          expandChanged: false,
          expanded: this.state?.cellState[index]?.expanded ?? false,
          width: `${cellWidth}px`,
          height: `${CELL_HEIGHT}px`,
          top: `${row * (CELL_HEIGHT + GRID_GAP)}px`,
          left: `${column * (cellWidth + GRID_GAP)}px`,
        },
      } satisfies StoryDocPageExampleStoreState['cellState'];
    });

    const rows = Math.ceil(cellLength / GRID_COLUMNS);
    const totalRowsHeight = rows * CELL_HEIGHT;
    const totalVerticalGap = (rows - 1) * GRID_GAP;
    const gridHeight = totalRowsHeight + totalVerticalGap;

    this.state = { gridHeight, cellState };

    this.cellStateSubject$.next(this.state);
  }

  public setCellExpanded(index: number, expanded: boolean) {
    if (!this.state) {
      return;
    }

    // All other cells should be collapsed, when one cell is expanded
    const newCellState = recordReduceMerge(this.state.cellState, (cellState) => {
      const newExpanded = cellState.index === index ? expanded : false;
      return {
        [cellState.index]: {
          ...cellState,
          expandChanged: cellState.expanded !== newExpanded,
          expanded: newExpanded,
        },
      } satisfies StoryDocPageExampleStoreState['cellState'];
    });

    this.state = deepMerge(this.state, { cellState: newCellState });
    this.cellStateSubject$.next(this.state);
  }

  public getCellStyles$(index: number): Observable<StoryDocPageExampleStoreCellStyle> {
    return this.cellState$.pipe(
      map((state) => state.cellState[index]),
      distinctUntilChanged(deepComparator),
      switchMap(
        (cell) =>
          (cell.expanded ? fromEvent(window, 'resize') : of()).pipe(
            map(() => this.toStateStyle(cell, this.gridHostElem)),
            startWith(this.toStateStyle(cell, this.gridHostElem))
          )
      ),
      filter(Boolean),
    );
  }

  public getGridHeight$(): Observable<number> {
    return this.cellState$.pipe(
      map((state) => state.gridHeight),
      distinctUntilChanged()
    );
  }

  public isCellExpanded$(): Observable<boolean> {
    return this.cellState$.pipe(
      map((state) => Object.values(state.cellState).some((cell) => cell.expanded)),
      distinctUntilChanged()
    );
  }

  private toStateStyle(
    cell: StoryDocPageExampleStoreCellState | undefined,
    gridHostElem: HTMLDivElement | null
  ): StoryDocPageExampleStoreCellStyle | null {
    if (!gridHostElem) {
      throw new Error('Can not use StoryDocPageExampleStore before initialize');
    }

    if (!cell) {
      return null;
    }


    return cell.expanded
      ? this.getExpandedStyle(cell, gridHostElem)
      : this.getCollapsedStyle(cell);
  }

  private getCollapsedStyle(
    cell: StoryDocPageExampleStoreCellState
  ): StoryDocPageExampleStoreCellStyle {
    return {
      expandedChanged: cell.expandChanged,
      isExpanded: false,
      host: {
        width: cell.width,
        height: cell.height,
        top: cell.top,
        left: cell.left,
        zIndex: '1',
        padding: '0',
        backgroundColor: 'transparent',
        boxShadow: '0px 5px 10px 0px rgba(0, 0, 0, 0.0), 0px 15px 25px 0px rgba(0, 0, 0, 0.0)',
        borderRadius: '0',
        border: '1px solid transparent',
      },
      title: { font: 'var(--cck-doc-text-sm-medium)' },
      description: { height: '0', opacity: '0', marginBottom: '0px' },
      canvasContainer: { height: '250px' },
      sourceCode: { flex: '0', opacity: '0', margin: '0', height: '0' },
      expandButton: { opacity: '1' },
      collapseButton: { opacity: '0' },
    };
  }

  private getExpandedStyle(
    cell: StoryDocPageExampleStoreCellState,
    gridHostElem: HTMLDivElement
  ): StoryDocPageExampleStoreCellStyle {
    const isMobile = document.documentElement.classList.contains('cck-breakpoint--mobile');
    const NAVAR_HEIGHT = 64;
    const MARGIN_TOP = isMobile ? 0 : NAVAR_HEIGHT;
    const MARGIN_BOTTOM = isMobile ? NAVAR_HEIGHT : 0;
    const EXPANDED_CELL_VERTICAL_MARGIN = 12;
    const EXPANDED_CELL_HORIZONTAL_MARGIN = 16;

    const marginTop = MARGIN_TOP + EXPANDED_CELL_VERTICAL_MARGIN;
    const marginBottom = MARGIN_BOTTOM + EXPANDED_CELL_VERTICAL_MARGIN;
    const currentTop = -gridHostElem.getBoundingClientRect().top;

    return {
      expandedChanged: cell.expandChanged,
      isExpanded: true,
      host: {
        width: `calc(100% - ${EXPANDED_CELL_HORIZONTAL_MARGIN * 2}px)`,
        height: `${window.innerHeight - marginTop - marginBottom}px`,
        top: currentTop + marginTop + 'px',
        left: EXPANDED_CELL_HORIZONTAL_MARGIN + 'px',
        zIndex: '2',
        padding: '24px',
        backgroundColor: 'var(--cck-doc-color-bg-2)',
        boxShadow: '0px 5px 10px 0px rgba(0, 0, 0, 0.05), 0px 15px 25px 0px rgba(0, 0, 0, 0.07)',
        borderRadius: '6px',
        border: '1px solid var(--cck-doc-color-border-1)',
      },
      title: { font: 'var(--cck-doc-text-xl-medium)' },
      description: { height: '24px', opacity: '1', marginBottom: '16px' },
      canvasContainer: { height: '270px' },
      sourceCode: { flex: '1', opacity: '1', margin: '8px 0', height: 'auto' },
      expandButton: { opacity: '0' },
      collapseButton: { opacity: '1' },
    };
  }

  public destroy() {
    this.gridResizeSubscription?.unsubscribe();
    this.cellStateSubject$.complete();
  }
}

const StoryDocPageExampleStoreContent = createContext<StoryDocPageExampleStore | null>(null);

export function useCreateStoryDocPageExampleStore() {
  return useMemo(
    () => ({
      StoreProvider: StoryDocPageExampleStoreContent.Provider,
      store: new StoryDocPageExampleStore(),
    }),
    []
  );
}

export function useStoryDocPageExampleStore() {
  return useContext(StoryDocPageExampleStoreContent);
}


