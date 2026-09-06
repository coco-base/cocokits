import { moduleMetadata } from '@storybook/angular';

import { AvatarComponent, AvatarLabelComponent } from '@cocokits/angular-avatar';
import { IconButtonComponent } from '@cocokits/angular-button';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { ColumnSortComponent, FilterType, TableComponent, TableGridLine } from '@cocokits/angular-table';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';
import { Component, ElementRef, viewChild } from '@angular/core';
import { Icons } from '@cocokits/common-icons';
import { DatePipe, JsonPipe } from '@angular/common';
import { data } from './data';
import { ColumnAdvancedFilterOverlayComponent } from '../../../../../../../packages/angular/table/src/lib/header/column-advanced-filter-overlay.component';
import { TableAdvancedFilter } from '../../../../../../../packages/angular/table/src/lib/table-advanced-filter/table-advanced-filter.component';

@Component({
  selector: 'story-table-sort-single-column',
  imports: [JsonPipe, TableComponent, AvatarComponent, AvatarLabelComponent, IconButtonComponent, SvgIconComponent],
  template: `
    <div>
      <h4>Pagination</h4>
      <!-- Pagination -->
      <div class="card">
        <input #paginationInputPageSize type="number" />
        <select #paginationSelectPageSize>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <button
          (click)="table.dataSourceOld.setPagination(paginationInputPageSize.value, paginationSelectPageSize.value)">
          Set Page Size
        </button>
        <hr />
        currentPage: {{ table.dataSourceOld.getPaginationInfo().currentPage }} <br />
        pageSize: {{ table.dataSourceOld.getPaginationInfo().pageSize }} <br />
        totalItems: {{ table.dataSourceOld.getPaginationInfo().totalItems }} <br />
        totalPages: {{ table.dataSourceOld.getPaginationInfo().totalPages }} <br />
        startIndex: {{ table.dataSourceOld.getPaginationInfo().startIndex }} <br />
        endIndex: {{ table.dataSourceOld.getPaginationInfo().endIndex }} <br />
        hasPrevious: {{ table.dataSourceOld.getPaginationInfo().hasPrevious }} <br />
        hasNext: {{ table.dataSourceOld.getPaginationInfo().hasNext }} <br />
        <hr />
        Total Date: {{ data.length }} <br />
        Total Date in Table: {{ table.dataSourceOld.data().length }}
      </div>

      <h4>Sorting</h4>
      <!-- Sorting -->
      <div class="card">
        {{ table.dataSourceOld.getSortModel().sorts | json }}
        <hr />
        Multi: <input type="checkbox" #multiSortCheckbox />
        <button (click)="table.dataSourceOld.setMultiSortEnabled(multiSortCheckbox.checked)">Set Multi</button>
        <button (click)="table.dataSourceOld.clearSort()">Clear All</button>
        <hr />
        Number:
        <select #sortNumber>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
          <option value="null">---</option>
        </select>
        <br />
        <button (click)="table.dataSourceOld.addSort('number', sortNumber.value)">Add</button>
        <button (click)="table.dataSourceOld.setSort('number', sortNumber.value)">Set</button>
        <button (click)="table.dataSourceOld.toggleSort('number', multiSortCheckbox.checked)">Toggle</button>
        <button (click)="table.dataSourceOld.removeSort('number')">Remove</button>
        <hr />

        Name:
        <select #sortName>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
          <option value="null">---</option>
        </select>
        <br />
        <br />
        <button (click)="table.dataSourceOld.addSort('name', sortName.value)">Add</button>
        <button (click)="table.dataSourceOld.setSort('name', sortName.value)">Set</button>
        <button (click)="table.dataSourceOld.toggleSort('name', multiSortCheckbox.checked)">Toggle</button>
        <button (click)="table.dataSourceOld.removeSort('name')">Remove</button>
        <hr />

        Date:
        <select #sortDate>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
          <option value="null">---</option>
        </select>

        <br />
        <button (click)="table.dataSourceOld.addSort('date', sortDate.value)">Add</button>
        <button (click)="table.dataSourceOld.setSort('date', sortDate.value)">Set</button>
        <button (click)="table.dataSourceOld.toggleSort('date', multiSortCheckbox.checked)">Toggle</button>
        <button (click)="table.dataSourceOld.removeSort('date')">Remove</button>
        <hr />

        Active:
        <select #sortActive>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
          <option value="null">---</option>
        </select>
        <br />
        <button (click)="table.dataSourceOld.addSort('active', sortActive.value)">Add</button>
        <button (click)="table.dataSourceOld.setSort('active', sortActive.value)">Set</button>
        <button (click)="table.dataSourceOld.toggleSort('active', multiSortCheckbox.checked)">Toggle</button>
        <button (click)="table.dataSourceOld.removeSort('active')">Remove</button>
        <hr />

        <hr />
      </div>
    </div>

    <cck-table #table style="width: 100%;" [data]="data ?? []">
      <ng-template #tableHeader>
        <tr>
          <th>Number</th>
          <th>User</th>
          <th>Date</th>
          <th>Active</th>
          <!-- <th>Actions</th> -->
        </tr>
      </ng-template>

      <ng-template #tableBody let-data>
        <tr>
          <td>#{{ data.number }}</td>
          <td>
            <cck-avatar-label [title]="data.name">
              <cck-avatar size="xs" [src]="data.avatar" />
            </cck-avatar-label>
          </td>
          <td>{{ data.date }}</td>
          <td>{{ data.active ? 'Yes' : 'No' }}</td>
          <!-- <td>
          <div style="display: flex; gap: 4px;">
            <button cck-icon-button size="sm" type="secondary">
              <cck-svg-icon [icon]="Icons.heart"/>
            </button>
            <button cck-icon-button size="sm" type="secondary">
              <cck-svg-icon [icon]="Icons.instagram"/>
            </button>
            <button cck-icon-button size="sm" type="secondary">
              <cck-svg-icon [icon]="Icons.link"/>
            </button>
          </div>
        </td> -->
        </tr>
      </ng-template>
    </cck-table>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: row;
    }
    hr {
      margin: 12px 0px;
      background-color: #bbb;
    }
    .card {
      border: 1px solid;
      padding: 12px;
    }
  `,
})
class Test {
  Icons = Icons;

  data = [
    { number: 0, avatar: 'https://i.pravatar.cc?img=1', name: 'Freya Nilsen', date: '20 Mar 2025', active: true },
    { number: 1, avatar: 'https://i.pravatar.cc?img=1', name: 'Freya Nilsen', date: '20 Mar 2025', active: true },
    { number: 2, avatar: 'https://i.pravatar.cc?img=2', name: 'Liv Hansen', date: '21 Mar 2025', active: false },
    { number: 3, avatar: 'https://i.pravatar.cc?img=3', name: 'Ingrid Halvorsen', date: '17 Mar 2025', active: true },
    { number: 4, avatar: 'https://i.pravatar.cc?img=4', name: 'Kasper Madsen', date: '19 Mar 2025', active: false },
    { number: 5, avatar: 'https://i.pravatar.cc?img=5', name: 'Soren Jorge', date: '18 Mar 2025', active: true },
    { number: 6, avatar: 'https://i.pravatar.cc?img=6', name: 'Bjorn Eriksson', date: '16 Mar 2025', active: false },
    { number: 7, avatar: 'https://i.pravatar.cc?img=7', name: 'Astrid Lindholm', date: '22 Mar 2025', active: true },
    { number: 8, avatar: 'https://i.pravatar.cc?img=8', name: 'Emma Larsen', date: '15 Mar 2025', active: false },
    { number: 9, avatar: 'https://i.pravatar.cc?img=9', name: 'Noah Jensen', date: '14 Mar 2025', active: true },
    { number: 10, avatar: 'https://i.pravatar.cc?img=10', name: 'Lucas Andersen', date: '13 Mar 2025', active: false },
    { number: 11, avatar: 'https://i.pravatar.cc?img=11', name: 'Ella Petersen', date: '12 Mar 2025', active: true },
    { number: 12, avatar: 'https://i.pravatar.cc?img=12', name: 'William Hansen', date: '11 Mar 2025', active: false },
    { number: 13, avatar: 'https://i.pravatar.cc?img=13', name: 'Olivia Nielsen', date: '10 Mar 2025', active: true },
    { number: 14, avatar: 'https://i.pravatar.cc?img=14', name: 'Sophia Thomsen', date: '09 Mar 2025', active: false },
    {
      number: 15,
      avatar: 'https://i.pravatar.cc?img=15',
      name: 'Alexander Kristensen',
      date: '08 Mar 2025',
      active: true,
    },
    {
      number: 16,
      avatar: 'https://i.pravatar.cc?img=16',
      name: 'Isabella Mortensen',
      date: '07 Mar 2025',
      active: false,
    },
    { number: 17, avatar: 'https://i.pravatar.cc?img=17', name: 'Mia Sørensen', date: '06 Mar 2025', active: true },
    { number: 18, avatar: 'https://i.pravatar.cc?img=18', name: 'Lucas Rasmussen', date: '05 Mar 2025', active: false },
    { number: 19, avatar: 'https://i.pravatar.cc?img=19', name: 'Ella Holm', date: '04 Mar 2025', active: true },
    { number: 20, avatar: 'https://i.pravatar.cc?img=20', name: 'Noah Lund', date: '03 Mar 2025', active: false },
    { number: 21, avatar: 'https://i.pravatar.cc?img=21', name: 'Emma Knudsen', date: '02 Mar 2025', active: true },
    {
      number: 22,
      avatar: 'https://i.pravatar.cc?img=22',
      name: 'William Mikkelsen',
      date: '01 Mar 2025',
      active: false,
    },
    {
      number: 23,
      avatar: 'https://i.pravatar.cc?img=23',
      name: 'Sophia Vestergaard',
      date: '28 Feb 2025',
      active: true,
    },
    { number: 24, avatar: 'https://i.pravatar.cc?img=24', name: 'Olivia Poulsen', date: '27 Feb 2025', active: false },
    {
      number: 25,
      avatar: 'https://i.pravatar.cc?img=25',
      name: 'Alexander Laursen',
      date: '26 Feb 2025',
      active: true,
    },
    { number: 26, avatar: 'https://i.pravatar.cc?img=26', name: 'Mia Jeppesen', date: '25 Feb 2025', active: false },
    { number: 27, avatar: 'https://i.pravatar.cc?img=27', name: 'Lucas Olesen', date: '24 Feb 2025', active: true },
    {
      number: 28,
      avatar: 'https://i.pravatar.cc?img=28',
      name: 'Ella Frederiksen',
      date: '23 Feb 2025',
      active: false,
    },
    { number: 29, avatar: 'https://i.pravatar.cc?img=29', name: 'Noah Carlsen', date: '22 Feb 2025', active: true },
    {
      number: 30,
      avatar: 'https://i.pravatar.cc?img=30',
      name: 'Emma Bjerregaard',
      date: '21 Feb 2025',
      active: false,
    },
    { number: 31, avatar: 'https://i.pravatar.cc?img=31', name: 'William Sørensen', date: '20 Feb 2025', active: true },
    { number: 32, avatar: 'https://i.pravatar.cc?img=32', name: 'Sophia Madsen', date: '19 Feb 2025', active: false },
    { number: 33, avatar: 'https://i.pravatar.cc?img=33', name: 'Olivia Andersen', date: '18 Feb 2025', active: true },
    {
      number: 34,
      avatar: 'https://i.pravatar.cc?img=34',
      name: 'Alexander Nielsen',
      date: '17 Feb 2025',
      active: false,
    },
    { number: 35, avatar: 'https://i.pravatar.cc?img=35', name: 'Mia Thomsen', date: '16 Feb 2025', active: true },
    {
      number: 36,
      avatar: 'https://i.pravatar.cc?img=36',
      name: 'Lucas Kristensen',
      date: '15 Feb 2025',
      active: false,
    },
    { number: 37, avatar: 'https://i.pravatar.cc?img=37', name: 'Ella Mortensen', date: '14 Feb 2025', active: true },
    { number: 38, avatar: 'https://i.pravatar.cc?img=38', name: 'Noah Sørensen', date: '13 Feb 2025', active: false },
    { number: 39, avatar: 'https://i.pravatar.cc?img=39', name: 'Emma Rasmussen', date: '12 Feb 2025', active: true },
    { number: 40, avatar: 'https://i.pravatar.cc?img=40', name: 'William Knudsen', date: '11 Feb 2025', active: false },
    { number: 41, avatar: 'https://i.pravatar.cc?img=41', name: 'Sophia Holm', date: '10 Feb 2025', active: true },
    { number: 42, avatar: 'https://i.pravatar.cc?img=42', name: 'Olivia Lund', date: '09 Feb 2025', active: false },
    {
      number: 43,
      avatar: 'https://i.pravatar.cc?img=43',
      name: 'Alexander Knudsen',
      date: '08 Feb 2025',
      active: true,
    },
    { number: 44, avatar: 'https://i.pravatar.cc?img=44', name: 'Mia Sørensen', date: '07 Feb 2025', active: false },
    { number: 45, avatar: 'https://i.pravatar.cc?img=45', name: 'Lucas Rasmussen', date: '06 Feb 2025', active: true },
    { number: 46, avatar: 'https://i.pravatar.cc?img=46', name: 'Ella Holm', date: '05 Feb 2025', active: false },
    { number: 47, avatar: 'https://i.pravatar.cc?img=47', name: 'Noah Lund', date: '04 Feb 2025', active: true },
    { number: 48, avatar: 'https://i.pravatar.cc?img=48', name: 'Emma Knudsen', date: '03 Feb 2025', active: false },
    {
      number: 49,
      avatar: 'https://i.pravatar.cc?img=49',
      name: 'William Mikkelsen',
      date: '02 Feb 2025',
      active: true,
    },
    {
      number: 50,
      avatar: 'https://i.pravatar.cc?img=50',
      name: 'Sophia Vestergaard',
      date: '01 Feb 2025',
      active: false,
    },
    { number: 51, avatar: 'https://i.pravatar.cc?img=51', name: 'Olivia Poulsen', date: '31 Jan 2025', active: true },
    {
      number: 52,
      avatar: 'https://i.pravatar.cc?img=52',
      name: 'Alexander Laursen',
      date: '30 Jan 2025',
      active: false,
    },
    { number: 53, avatar: 'https://i.pravatar.cc?img=53', name: 'Mia Jeppesen', date: '29 Jan 2025', active: true },
    { number: 54, avatar: 'https://i.pravatar.cc?img=54', name: 'Lucas Olesen', date: '28 Jan 2025', active: false },
    { number: 55, avatar: 'https://i.pravatar.cc?img=55', name: 'Ella Frederiksen', date: '27 Jan 2025', active: true },
    { number: 56, avatar: 'https://i.pravatar.cc?img=56', name: 'Noah Carlsen', date: '26 Jan 2025', active: false },
    { number: 57, avatar: 'https://i.pravatar.cc?img=57', name: 'Emma Bjerregaard', date: '25 Jan 2025', active: true },
    {
      number: 58,
      avatar: 'https://i.pravatar.cc?img=58',
      name: 'William Sørensen',
      date: '24 Jan 2025',
      active: false,
    },
    { number: 59, avatar: 'https://i.pravatar.cc?img=59', name: 'Sophia Madsen', date: '23 Jan 2025', active: true },
    { number: 60, avatar: 'https://i.pravatar.cc?img=60', name: 'Olivia Andersen', date: '22 Jan 2025', active: false },
    {
      number: 61,
      avatar: 'https://i.pravatar.cc?img=61',
      name: 'Alexander Nielsen',
      date: '21 Jan 2025',
      active: true,
    },
    { number: 62, avatar: 'https://i.pravatar.cc?img=62', name: 'Mia Thomsen', date: '20 Jan 2025', active: false },
    { number: 63, avatar: 'https://i.pravatar.cc?img=63', name: 'Lucas Kristensen', date: '19 Jan 2025', active: true },
    { number: 64, avatar: 'https://i.pravatar.cc?img=64', name: 'Ella Mortensen', date: '18 Jan 2025', active: false },
    { number: 65, avatar: 'https://i.pravatar.cc?img=65', name: 'Noah Sørensen', date: '17 Jan 2025', active: true },
    { number: 66, avatar: 'https://i.pravatar.cc?img=66', name: 'Emma Rasmussen', date: '16 Jan 2025', active: false },
    { number: 67, avatar: 'https://i.pravatar.cc?img=67', name: 'William Knudsen', date: '15 Jan 2025', active: true },
    { number: 68, avatar: 'https://i.pravatar.cc?img=68', name: 'Sophia Holm', date: '14 Jan 2025', active: false },
    { number: 69, avatar: 'https://i.pravatar.cc?img=69', name: 'Olivia Lund', date: '13 Jan 2025', active: true },
    {
      number: 70,
      avatar: 'https://i.pravatar.cc?img=70',
      name: 'Alexander Knudsen',
      date: '12 Jan 2025',
      active: false,
    },
    { number: 71, avatar: 'https://i.pravatar.cc?img=71', name: 'Mia Sørensen', date: '11 Jan 2025', active: true },
    { number: 72, avatar: 'https://i.pravatar.cc?img=72', name: 'Lucas Rasmussen', date: '10 Jan 2025', active: false },
    { number: 73, avatar: 'https://i.pravatar.cc?img=73', name: 'Ella Holm', date: '09 Jan 2025', active: true },
    { number: 74, avatar: 'https://i.pravatar.cc?img=74', name: 'Noah Lund', date: '08 Jan 2025', active: false },
    { number: 75, avatar: 'https://i.pravatar.cc?img=75', name: 'Emma Knudsen', date: '07 Jan 2025', active: true },
    {
      number: 76,
      avatar: 'https://i.pravatar.cc?img=76',
      name: 'William Mikkelsen',
      date: '06 Jan 2025',
      active: false,
    },
    {
      number: 77,
      avatar: 'https://i.pravatar.cc?img=77',
      name: 'Sophia Vestergaard',
      date: '05 Jan 2025',
      active: true,
    },
    { number: 78, avatar: 'https://i.pravatar.cc?img=78', name: 'Olivia Poulsen', date: '04 Jan 2025', active: false },
    {
      number: 79,
      avatar: 'https://i.pravatar.cc?img=79',
      name: 'Alexander Laursen',
      date: '03 Jan 2025',
      active: true,
    },
    { number: 80, avatar: 'https://i.pravatar.cc?img=80', name: 'Mia Jeppesen', date: '02 Jan 2025', active: false },
    { number: 81, avatar: 'https://i.pravatar.cc?img=81', name: 'Lucas Olesen', date: '01 Jan 2025', active: true },
  ];

  table = viewChild(TableComponent);

  // Number
  operatorNumber1 = viewChild<ElementRef<HTMLSelectElement>>('operatorNumber1');
  inputNumber1 = viewChild<ElementRef<HTMLInputElement>>('inputNumber1');
  inputNumber1_2 = viewChild<ElementRef<HTMLInputElement>>('inputNumber1_2');
  operatorGroupNumber = viewChild<ElementRef<HTMLSelectElement>>('operatorGroupNumber');
  operatorNumber2 = viewChild<ElementRef<HTMLSelectElement>>('operatorNumber2');
  inputNumber2 = viewChild<ElementRef<HTMLInputElement>>('inputNumber2');
  inputNumber2_2 = viewChild<ElementRef<HTMLInputElement>>('inputNumber2_2');

  addNumberFilter() {
    this.table()?.dataSourceOld.addFilterCondition({
      field: 'number',
      operator: this.operatorNumber1()?.nativeElement.value as any,
      value: this.inputNumber1()?.nativeElement.value,
      value2: this.inputNumber1_2()?.nativeElement.value,
      type: FilterType.Number,
    });
  }

  addNumberFilterGroup() {
    this.table()?.dataSourceOld.addColumnConditions(
      'number',
      [
        {
          operator: this.operatorNumber1()?.nativeElement.value as any,
          value: this.inputNumber1()?.nativeElement.value,
          value2: this.inputNumber1_2()?.nativeElement.value,
          type: FilterType.Number,
        },
        {
          operator: this.operatorNumber2()?.nativeElement.value as any,
          value: this.inputNumber2()?.nativeElement.value,
          value2: this.inputNumber2_2()?.nativeElement.value,
          type: FilterType.Number,
        },
      ],
      this.operatorGroupNumber()?.nativeElement.value as any
    );
  }

  // Name

  operatorName = viewChild<ElementRef<HTMLSelectElement>>('operatorName');
  inputName = viewChild<ElementRef<HTMLInputElement>>('inputName');
  operatorGroupName = viewChild<ElementRef<HTMLSelectElement>>('operatorGroupName');
  operatorName2 = viewChild<ElementRef<HTMLSelectElement>>('operatorName2');
  inputName2 = viewChild<ElementRef<HTMLInputElement>>('inputName2');

  addNameFilter() {
    this.table()?.dataSourceOld.addFilterCondition({
      field: 'name',
      operator: this.operatorName()?.nativeElement.value as any,
      value: this.inputName()?.nativeElement.value,
      value2: this.inputName2()?.nativeElement.value,
      type: FilterType.Text,
    });
  }

  addNameFilterGroup() {
    this.table()?.dataSourceOld.addColumnConditions(
      'name',
      [
        {
          operator: this.operatorName()?.nativeElement.value as any,
          value: this.inputName()?.nativeElement.value,
          type: FilterType.Text,
        },
        {
          operator: this.operatorName2()?.nativeElement.value as any,
          value: this.inputName2()?.nativeElement.value,
          type: FilterType.Text,
        },
      ],
      this.operatorGroupName()?.nativeElement.value as any
    );
  }

  // Date
  operatorDate1 = viewChild<ElementRef<HTMLSelectElement>>('operatorDate1');
  inputDate1 = viewChild<ElementRef<HTMLInputElement>>('inputDate1');
  inputDate1_2 = viewChild<ElementRef<HTMLInputElement>>('inputDate1_2');
  operatorGroupDate = viewChild<ElementRef<HTMLSelectElement>>('operatorGroupDate');
  operatorDate2 = viewChild<ElementRef<HTMLSelectElement>>('operatorDate2');
  inputDate2 = viewChild<ElementRef<HTMLInputElement>>('inputDate2');
  inputDate2_2 = viewChild<ElementRef<HTMLInputElement>>('inputDate2_2');

  addDateFilter() {
    this.table()?.dataSourceOld.addFilterCondition({
      field: 'date',
      operator: this.operatorDate1()?.nativeElement.value as any,
      value: this.inputDate1()?.nativeElement.value,
      value2: this.inputDate1_2()?.nativeElement.value,
      type: FilterType.Date,
    });
  }

  addDateFilterGroup() {
    this.table()?.dataSourceOld.addColumnConditions(
      'date',
      [
        {
          operator: this.operatorDate1()?.nativeElement.value as any,
          value: this.inputDate1()?.nativeElement.value,
          value2: this.inputDate1_2()?.nativeElement.value,
          type: FilterType.Date,
        },
        {
          operator: this.operatorDate2()?.nativeElement.value as any,
          value: this.inputDate2()?.nativeElement.value,
          value2: this.inputDate2_2()?.nativeElement.value,
          type: FilterType.Date,
        },
      ],
      this.operatorGroupDate()?.nativeElement.value as any
    );
  }
}

export const SortSingleColumn: StoryObj<TableComponent> = {
  name: 'Sort Single Column',
  decorators: [
    moduleMetadata({
      imports: [
        AvatarComponent,
        AvatarLabelComponent,
        IconButtonComponent,
        SvgIconComponent,
        Test,
        DatePipe,
        ColumnSortComponent,
        ColumnAdvancedFilterOverlayComponent,
        TableAdvancedFilter
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'TODO: ...',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <cck-table
            <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
            <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
            <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
          >
          </cck-table>
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        // CCK_CONTROL.size(),
        // CCK_CONTROL.color(),
        // CCK_CONTROL.additional(),
        // CCK_CONTROL.customSelect('Grid Line', Object.values(TableGridLine), TableGridLine.Full),
        // CCK_CONTROL.customBoolean('Striped Rows', false),
        CCK_CONTROL.customBoolean('Multi Columns', false),
        CCK_CONTROL.customBoolean('Removable', false),
      ],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
        data,
      },
      template: `
        <cck-table [data]="data" [paginator]="false" [sortMulti]="cckControl.multiColumns" #table>
          <!-- <cck-column-advanced-filter-overlay/> -->
          <cck-table-advanced-filter/>
          <ng-template #tableHeader>
            <tr>
              <th>
                Number
                <cck-column-sort [field]="'number'" [removable]="cckControl.removable" />
              </th>
              <th>
                User
                <cck-column-sort [field]="'name'" [removable]="cckControl.removable" />
              </th>
              <th>
                Date
                <cck-column-sort [field]="'date'" [removable]="cckControl.removable" />
              </th>
              <th>
                Active
                <cck-column-sort [field]="'active'" [removable]="cckControl.removable" />
              </th>
            </tr>
          </ng-template>

          <ng-template #tableBody let-data>
            <tr>
              <td>#{{ data.number }}</td>
              <td>
                <cck-avatar-label [title]="data.name">
                  <cck-avatar size="xs" [src]="data.avatar" />
                </cck-avatar-label>
              </td>
              <td>{{ data.date | date:'dd/MM/yyyy' }}</td>
              <td>{{ data.active ? 'Yes' : 'No' }}</td>
            </tr>
          </ng-template>
        </cck-table>
      
      `,
    };
  },
};
