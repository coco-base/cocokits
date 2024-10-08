import { Component, computed, contentChildren, input, TemplateRef, viewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';

function toNumber(value: any) {
  return parseInt(value);
}

interface RowHeaderCell {
  type: 'header';
  content: string;
}

interface RowBodyCell {
  type: 'cell';
  content: TemplateRef<any>;
  colSpan: number;
}

type Align = 'start' | 'center' | 'end';

type Cell = RowHeaderCell | RowBodyCell;

@Component({
  standalone: true,
  selector: 'story-table-cell',
  template: `
    <ng-template #tempRef>
      <ng-content></ng-content>
    </ng-template>
  `,
  encapsulation: ViewEncapsulation.None,
})
export class StoryTableCellComponent {
  row = input(0, { transform: Number });
  col = input(0, { transform: Number });
  colSpan = input(1, { transform: toNumber });

  tempRef = viewChild.required<TemplateRef<any>>('tempRef');
}

@Component({
  standalone: true,
  selector: 'story-table',
  templateUrl: 'story-table.component.html',
  styleUrl: 'story-table.component.scss',
  imports: [NgTemplateOutlet, NgClass],
  encapsulation: ViewEncapsulation.None,
})
export class StoryTableComponent {
  headers = input<string[]>([]);
  rowHeaders = input<string[]>([]);

  fullWidth = input(true);

  cellVAlign = input<Align>('center');
  cellHAlign = input<Align>('center');
  cellHeight = input<string>();

  headerCellVAlign = input<Align>('center');
  headerCellHAlign = input<Align>('center');

  rowHeaderCellVAlign = input<Align>('center');
  rowHeaderCellHAlign = input<Align>('start');

  cells = contentChildren(StoryTableCellComponent);

  hasRowHeader = computed(() => this.rowHeaders().length > 0);

  content = computed(() => {
    const content: Cell[][] = [];

    this.rowHeaders().forEach((header, index) => fillCell(content, index, 0, { type: 'header', content: header }));

    this.cells().forEach((cell) => {
      const row = cell.row();
      const col = this.hasRowHeader() ? cell.col() + 1 : cell.col();
      fillCell(content, row, col, { type: 'cell', content: cell.tempRef(), colSpan: cell.colSpan() });
    });

    return content;
  });
}

function fillCell<T>(table: (T | undefined)[][], row: number, col: number, content: T) {
  // Ensure the table has enough rows
  while (table.length <= row) {
    table.push([]);
  }

  // Ensure the row has enough columns
  while (table[row].length <= col) {
    table[row].push(undefined);
  }

  // Set the content at the correct position
  table[row][col] = content;
}
