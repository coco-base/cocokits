import {
  Component,
  computed,
  ContentChildren,
  effect,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
  QueryList,
  signal,
  ViewChildren,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ErrorComponent,
  FormFieldComponent,
  InputComponent,
  OptionComponent,
  SelectComponent,
} from '@cocokits/angular-form-field';
import { TableDataSource } from '../table.tokes';
import {
  DataSource,
  DataSourceFilterBooleanMatchTypeList,
  DataSourceFilterGroup,
  DataSourceFilterDateMatchTypeList,
  DataSourceFilterMatchType,
  DataSourceFilterNumberMatchTypeList,
  DataSourceFilterOperator,
  DataSourceFilterTextCondition,
  DataSourceFilterTextMatchTypeList,
  DataSourceFilterType,
  DataSourceFilterCondition,
  DeepNullable,
  DeepPartial,
  DataSourceFilterConditionOrGroup,
} from '@cocokits/common-utils';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconButtonComponent } from '@cocokits/angular-button';
import { MenuComponent, MenuItemComponent, MenuTriggerDirective } from '@cocokits/angular-menu';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { Icons } from '@cocokits/common-icons';
import { sign } from 'crypto';

const EMPTY_CONDITION = {} as DeepPartial<DataSourceFilterCondition<any>>;

// Actions
@Component({
  selector: 'cck-table-advanced-filter-actions',
  imports: [IconButtonComponent, MenuComponent, SvgIconComponent, MenuTriggerDirective, MenuItemComponent],
  template: `
    @if (isDeletable()) {
      <button cck-icon-button size="sm" (click)="deleteClick.emit()">
        <cck-svg-icon [icon]="Icons.minus" />
      </button>
    }

    <button cck-icon-button [cckMenuTrigger]="menu" size="sm">
      <cck-svg-icon [icon]="Icons.plus" />
    </button>

    <ng-template #menu>
      <cck-menu size="sm">
        <cck-menu-item (click)="addConditionClick.emit()">Add Condition</cck-menu-item>
        <cck-menu-item (click)="addGroupClick.emit()">Add Group</cck-menu-item>
      </cck-menu>
    </ng-template>
  `,
  styles: ``,
  host: {
    class: 'cck-table-advanced-filter-action',
    '[class.cck-table-advanced-filter-action--align-left]': 'align() === "left"',
    '[class.cck-table-advanced-filter-action--align-right]': 'align() === "right"',
  },
})
export class TableAdvancedFilterActions {
  public isDeletable = input(true);
  public align = input<'left' | 'right'>('right');

  public deleteClick = output<void>();
  public addConditionClick = output<void>();
  public addGroupClick = output<void>();

  protected readonly Icons = Icons;
}

// Condition
@Component({
  selector: 'cck-table-advanced-filter-condition',
  imports: [
    FormFieldComponent,
    SelectComponent,
    OptionComponent,
    FormsModule,
    InputComponent,
    ErrorComponent,
    TableAdvancedFilterActions,
  ],
  template: `
    <div class="cck-table-advanced-filter-item-row">
      @let conditionValue = condition();
      <!-- Filed -->
      <cck-form-field size="sm" [invalid]="canShowErrors().field && errors()?.field">
        <cck-select
          placeholder="Select Field"
          [value]="conditionValue.field"
          (singleValueChange)="onFieldChange($event)">
          @for (field of filedNames(); track field) {
            <cck-option [value]="field">{{ field }}</cck-option>
          }
        </cck-select>
      </cck-form-field>

      <!-- Type -->
      @if (conditionValue.field && !autoDetectType()) {
        <cck-form-field size="sm" [invalid]="canShowErrors().type && errors()?.type">
          <cck-select
            placeholder="Select Type"
            [value]="conditionValue.type"
            (singleValueChange)="onTypeChange($event)">
            @for (type of DataSourceFilterTypeValues; track type) {
              <cck-option [value]="type">{{ type }}</cck-option>
            }
          </cck-select>
        </cck-form-field>
      }

      <!-- Match Type -->
      @if (conditionValue.type && conditionValue.field) {
        <cck-form-field size="sm" [invalid]="canShowErrors().matchType && errors()?.matchType">
          <cck-select
            placeholder="Select Match Type"
            [value]="conditionValue.matchType"
            (singleValueChange)="onMatchTypeChange($event)">
            @for (matchType of matchTypeOptionMap[conditionValue.type]; track matchType) {
              <cck-option [value]="matchType">{{ matchType }}</cck-option>
            }
          </cck-select>
        </cck-form-field>
      }

      <!-- Filter -->
      @if (filterType()) {
        <cck-form-field size="sm" [invalid]="canShowErrors().filter && errors()?.filter">
          <input
            cck-input
            [type]="filterType()"
            [value]="conditionValue.filter ?? ''"
            (input)="onFilterChange($event)"
            placeholder="Enter a value" />
        </cck-form-field>
      }

      <cck-table-advanced-filter-actions
        (deleteClick)="deleteClick.emit()"
        (addConditionClick)="addConditionClick.emit()"
        (addGroupClick)="addGroupClick.emit()" />
    </div>

    @if(canShowErrors().field && errors()?.field) {
      <cck-error [force]="true">{{ errors()?.field }}</cck-error>
    }
    @if(canShowErrors().type && errors()?.type) {
      <cck-error [force]="true">{{ errors()?.type }}</cck-error>
    }
    @if(canShowErrors().matchType && errors()?.matchType) {
      <cck-error [force]="true">{{ errors()?.matchType }}</cck-error>
    }
    @if(canShowErrors().filter && errors()?.filter) {
      <cck-error [force]="true">{{ errors()?.filter }}</cck-error>
    }
  `,
  styles: ``,
  host: {
    class: 'cck-table-advanced-filter-condition',
  },
})
export class TableAdvancedFilterCondition<T> {
  private tableDataSource = inject(TableDataSource) as DataSource<T>;

  protected filedNames = toSignal(this.tableDataSource.fieldNames$, { initialValue: [] });

  protected DataSourceFilterTypeValues = Object.values(DataSourceFilterType);
  protected matchTypeOptionMap: Record<DataSourceFilterType, readonly DataSourceFilterMatchType[]> = {
    [DataSourceFilterType.Text]: DataSourceFilterTextMatchTypeList,
    [DataSourceFilterType.Number]: DataSourceFilterNumberMatchTypeList,
    [DataSourceFilterType.Date]: DataSourceFilterDateMatchTypeList,
    [DataSourceFilterType.Boolean]: DataSourceFilterBooleanMatchTypeList,
  };

  public canShowErrors = signal({
    field: false,
    type: false,
    matchType: false,
    filter: false,
  });

  public autoDetectType = input<boolean>(false);
  public defaultCondition = input<Partial<DataSourceFilterCondition<T>>>();
  public conditionChange = output<DataSourceFilterCondition<T>>();

  public deleteClick = output<void>();
  public addConditionClick = output<void>();
  public addGroupClick = output<void>();

  protected filterType = computed(() => {
    const condition = this.condition();

    if (
      !condition.type ||
      !condition.matchType ||
      condition.type === DataSourceFilterType.Boolean ||
      condition.matchType === DataSourceFilterMatchType.Blank ||
      condition.matchType === DataSourceFilterMatchType.NotBlank
    ) {
      return null;
    }

    return (
      {
        [DataSourceFilterType.Text]: 'text',
        [DataSourceFilterType.Number]: 'number',
        [DataSourceFilterType.Date]: 'date',
      } as const
    )[condition.type];
  });

  protected condition = linkedSignal<Partial<DataSourceFilterCondition<T>>>(() => this.defaultCondition() ?? {});

  protected errors = computed(() => {
    return this.tableDataSource.validateCondition(this.condition());
  });

  protected errorMessages = computed(() => {
    return this.errors() || {};
  });

  private __conditionChanged = effect(() => {
    const condition = this.condition();
    const defaultCondition = this.defaultCondition();
    const errorMessages = this.errors();

    if (condition === defaultCondition || errorMessages) {
      return;
    }

    this.conditionChange.emit(condition as DataSourceFilterCondition<any>);
  });

  protected onFieldChange(field: keyof T) {
    if (!this.autoDetectType()) {
      this.condition.set({ field });
      this.canShowErrors.set({ ...this.canShowErrors(), type: false, matchType: false, filter: false });
      return;
    }

    const types = this.tableDataSource.getTypes();
    const type = this.condition().field && field ? types[field] : DataSourceFilterType.Text;
    this.condition.set({ field, type });
    this.canShowErrors.set({ ...this.canShowErrors(), matchType: false, filter: false });
  }
  protected onTypeChange(type: DataSourceFilterType) {
    this.condition.set({
      field: this.condition().field,
      type,
    });
    this.canShowErrors.set({ ...this.canShowErrors(), matchType: false, filter: false });
  }
  protected onMatchTypeChange(matchType: DataSourceFilterMatchType) {
    this.condition.set({
      ...this.condition(),
      matchType,
      filter: undefined,
    } as DataSourceFilterCondition<T>);
    this.canShowErrors.set({ ...this.canShowErrors(), filter: false });
  }

  protected onFilterChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const valueParser = {
      [DataSourceFilterType.Text]: () => input.value,
      [DataSourceFilterType.Number]: () => parseInt(input.value, 10),
      [DataSourceFilterType.Date]: () => new Date(input.value),
      [DataSourceFilterType.Boolean]: () => !!input,
    }[input.type];

    this.condition.set({
      ...this.condition(),
      filter: valueParser ? valueParser() : undefined,
    } as DataSourceFilterCondition<T>);
  }
}

// Operator
@Component({
  selector: 'cck-table-advanced-filter-group',
  imports: [FormFieldComponent, SelectComponent, OptionComponent, FormsModule, TableAdvancedFilterActions],
  template: `
    <cck-form-field size="sm">
      <cck-select [(ngModel)]="operator">
        @for (operator of DataSourceFilterOperator; track operator) {
          <cck-option [value]="operator">{{ operator }}</cck-option>
        }
      </cck-select>
    </cck-form-field>

    <cck-table-advanced-filter-actions
      [isDeletable]="isDeletable()"
      (deleteClick)="deleteClick.emit()"
      (addConditionClick)="addConditionClick.emit()"
      (addGroupClick)="addGroupClick.emit()" />
  `,
  styles: ``,
  host: {
    class: 'cck-table-advanced-filter-group cck-table-advanced-filter-item-row',
  },
})
export class TableAdvancedFilterGroup {
  protected DataSourceFilterOperator = Object.values(DataSourceFilterOperator);

  public operator = model(DataSourceFilterOperator.AND);
  public isDeletable = input<boolean>(false);

  public deleteClick = output<void>();
  public addConditionClick = output<void>();
  public addGroupClick = output<void>();
}

@Component({
  selector: 'cck-table-advanced-filter-item',
  imports: [TableAdvancedFilterGroup, FormsModule, TableAdvancedFilterActions, TableAdvancedFilterCondition],
  template: `
    @let operator = conditionGroup().operator;
    @if (operator) {
      <cck-table-advanced-filter-group
        [operator]="operator"
        [isDeletable]="!!parent()"
        (deleteClick)="onDeleteGroup()"
        (addConditionClick)="onAddCondition(0)"
        (addGroupClick)="onAddGroup(0)" />
    }

    @for (condition of conditionGroup().conditions; track $index; let index = $index) {
      <div class="cck-table-advanced-filter-item-indent">
        @if ('operator' in condition) {
          <cck-table-advanced-filter-item [conditionGroup]="condition" [(parent)]="conditionGroup" [index]="$index" />
        } @else {
          <cck-table-advanced-filter-condition
            [defaultCondition]="condition"
            (deleteClick)="onDeleteCondition(index)"
            (addConditionClick)="onAddCondition(index + 1)"
            (addGroupClick)="onAddGroup(index + 1)" />
        }
      </div>
    }
    @if (!parent()) {
      <div class="cck-table-advanced-filter-item-indent">
        <cck-table-advanced-filter-actions
          [isDeletable]="false"
          [align]="'left'"
          (addConditionClick)="onAddCondition()"
          (addGroupClick)="onAddGroup()" />
      </div>
    }
  `,
  styles: ``,
  host: {
    class: 'cck-table-advanced-filter-item',
  },
})
export class TableAdvancedFilterItem<T> {
  public conditionGroup = model.required<Partial<DataSourceFilterGroup<T>>>();
  public parent = model<Partial<DataSourceFilterGroup<T>> | null>(null);
  public index = input<number>(0);

  onAddCondition(position: number = Infinity) {
    const group = this.conditionGroup();
    const conditionsCount = group.conditions?.length ?? 0;
    const insertAt = Math.min(Math.max(position ?? conditionsCount, 0), conditionsCount);
    const conditions = [...group.conditions ?? []];
    conditions.splice(insertAt, 0, {} as DataSourceFilterCondition<T>);

    this.conditionGroup.set({ ...group, conditions });
  }

  onAddGroup(position: number = Infinity) {
    const newGroup: DataSourceFilterGroup<any> = {
      operator: DataSourceFilterOperator.AND,
      conditions: [],
    };

    const group = this.conditionGroup();
    const conditionsCount = group.conditions?.length ?? 0;
    const insertAt = Math.min(Math.max(position ?? conditionsCount, 0), conditionsCount);
    const conditions = [...(group.conditions ?? [])];
    conditions.splice(insertAt, 0, newGroup);

    this.conditionGroup.set({ ...group, conditions });
  }

  onDeleteCondition(index: number) {
    const group = this.conditionGroup();
    const conditions = [...(group.conditions ?? [])];
    conditions.splice(index, 1);
    this.conditionGroup.set({ ...group, conditions });
  }

  onDeleteGroup() {
    const parent = this.parent();
    if (parent) {
      const conditions = [...(parent.conditions ?? [])];
      conditions.splice(this.index(), 1);
      this.parent.set({ ...parent, conditions });
    }
  }
}

@Component({
  selector: 'cck-table-advanced-filter',
  imports: [TableAdvancedFilterItem, ButtonComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <h4>Advanced Filter 2</h4>
    <cck-table-advanced-filter-item
      class="cck-table-advanced-filter-item-wrapper"
      [(conditionGroup)]="conditionGroup" />

    <button cck-button size="sm" (click)="onApplyClick()">Apply</button>
    <button cck-button size="sm" (click)="onCancelClick()">Cancel</button>
  `,
  styles: `
    .cck-table-advanced-filter {
      display: block;
      background: #f4f4f5;
      padding: 8px 24px;
    }

    .cck-table-advanced-filter-item-actions {
      height: 36px;
      /* height: 40px; */
    }

    .cck-table-advanced-filter-item-row {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      /* height: 40px; */
    }

    .cck-table-advanced-filter-condition {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cck-table-advanced-filter-item-row:hover {
      background-color: #e4e4e7;
    }

    .cck-table-advanced-filter-item-wrapper {
      padding-left: 24px;
    }

    .cck-table-advanced-filter-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      position: relative;
      /* height: 40px; */
    }

    .cck-table-advanced-filter-item-indent:before {
      content: '';
      position: absolute;
      /* top: -20px; */
      /* left: -20px; */
      top: -18px; /* half of row height */
      left: -18px; /* half of row height */
      border-left: 2px dashed #a2a5b5;
      width: 1px;
      height: 100%;
    }
    .cck-table-advanced-filter-item-indent:last-of-type:before {
      height: 36px; /* height of row */
    }

    .cck-table-advanced-filter-item-indent:after {
      content: '';
      position: absolute;
      border-top: 2px dashed #a2a5b5;
      /* top: 20px; */
      /* left: -20px; */
      top: 18px; /* half of row height */
      left: -18px; /* half of row height */
      width: 32px; /* padding of .cck-table-advanced-filter-item-indent */
    }

    .cck-table-advanced-filter-item-indent {
      padding-left: 32px;
      position: relative;
    }

    .cck-table-advanced-filter-action {
      display: flex;
      gap: 8px;
    }

    .cck-table-advanced-filter-action--align-left {
      margin-left: 0px;
    }

    .cck-table-advanced-filter-action--align-right {
      margin-left: auto;
    }

    .cck-table-advanced-filter-input-selector {
    }

    .cck-table-advanced-filter-match-type-selector {
    }

    .cck-table-advanced-filter-type-selector {
    }

    .cck-table-advanced-filter-group {
      display: flex;
    }

    .cck-table-advanced-filter-name-selector {
    }
  `,
  host: {
    class: 'cck-table-advanced-filter',
  },
})
export class TableAdvancedFilter<T> {
  private tableDataSource = inject(TableDataSource) as DataSource<T>;
  // protected conditionGroup = signal<DataSourceFilterConditionGroup<T>>({
  //   operator: DataSourceFilterOperator.AND,
  //   conditions: [],
  // });
  protected conditionGroup = model<Partial<DataSourceFilterGroup<any>>>({
    operator: DataSourceFilterOperator.AND,
    conditions: [
      {
        field: 'name',
        type: DataSourceFilterType.Text,
        matchType: DataSourceFilterMatchType.Contains,
        filter: 'John',
      },
      {
        field: 'age',
        type: DataSourceFilterType.Number,
        matchType: DataSourceFilterMatchType.GreaterThan,
        filter: 30,
      },
      {
        field: 'joinDate',
        type: DataSourceFilterType.Date,
        matchType: DataSourceFilterMatchType.Before,
        filter: new Date('2022-01-01'),
      },
      {
        operator: DataSourceFilterOperator.OR,
        conditions: [
          {
            field: 'isActive',
            type: DataSourceFilterType.Boolean,
            matchType: DataSourceFilterMatchType.True,
          },
          {
            operator: DataSourceFilterOperator.AND,
            conditions: [
              {
                field: 'roles',
                type: DataSourceFilterType.Boolean,
                matchType: DataSourceFilterMatchType.True,
              },
              {
                field: 'roles',
                type: DataSourceFilterType.Boolean,
                matchType: DataSourceFilterMatchType.Blank,
              },
            ],
          },
          {
            field: 'roles',
            type: DataSourceFilterType.Date,
            matchType: DataSourceFilterMatchType.Before,
            filter: new Date(),
          },
        ],
      },
    ],
  });


  onApplyClick() {
    console.log('Apply Clicked', this.conditionGroup());

    const validateConditionGroup = (a: Partial<DataSourceFilterGroup<any>>): boolean => {
      const conditions = a?.conditions;
      if (!conditions) {
        return true;
      }
      return !(conditions.some((item) =>
        'operator' in item
          ? validateConditionGroup(item)
          : !!this.tableDataSource.validateCondition(item as Partial<DataSourceFilterCondition<any>>)
      ));
    };

    const isValid = validateConditionGroup(this.conditionGroup());
    if(!isValid) {
    }
    console.log('Is Valid:', isValid);

  }

  onCancelClick() {
    console.log('Cancel Clicked');
  }
}
