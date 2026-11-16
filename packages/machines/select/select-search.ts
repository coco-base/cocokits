import type { SelectSearchProps } from './select-search.types';
import { createSelectSearchKeyDown } from './select-keyboard';
import { selectItemId, selectOptionDescriptionId } from './select-ids';
import { getSelectCountText, visibleSelectItems } from './select-values';
import { selectAnatomy } from './select.anatomy';
import type { SelectEvent, SelectParts, SelectState } from './select.types';

const DEFAULT_SEARCH_LABEL = 'Search';

/** The parts a Select adds for its search, footer, count and option content. */
export type SelectExtraParts<T> = Pick<
  SelectParts<T>,
  'header' | 'search' | 'empty' | 'footer' | 'count' | 'optionLeading' | 'optionDescription'
>;

function searchProps<T>(
  state: SelectState<T>,
  send: (event: SelectEvent) => void,
  contentId: string,
  shown: ReadonlySet<string>,
): SelectSearchProps {
  const active = state.items.find((item) => item.key === state.highlighted);
  return {
    class: selectAnatomy.classes.search,
    type: 'search',
    role: 'combobox',
    'aria-expanded': 'true',
    'aria-controls': contentId,
    'aria-autocomplete': 'list',
    'aria-activedescendant': active && shown.has(active.key) ? selectItemId(state.id, active) : undefined,
    'aria-label': state.searchLabel ?? DEFAULT_SEARCH_LABEL,
    autocomplete: 'off',
    value: state.query ?? '',
    onInput: (event) => {
      send({ type: 'SEARCH.INPUT', value: (event.target as { value?: string } | null)?.value ?? '', event });
    },
    onKeyDown: createSelectSearchKeyDown(state as SelectState<unknown>, send),
  };
}

/**
 * The keys of the options the query shows, in document order; every option without `filter`.
 *
 * @param state - The Select state.
 * @returns The set of keys.
 */
export function shownSelectKeys<T>(state: SelectState<T>): ReadonlySet<string> {
  return new Set(visibleSelectItems(state).map((item) => item.key));
}

/**
 * Computes the props of the parts a Select adds for its search (header, search, empty), its footer, its count and
 * the content of an option (leading, description). Pure.
 *
 * @param state - The Select state.
 * @param send - Receives the events of the handlers.
 * @param contentId - The id of the list, which the search controls.
 * @returns The props of each part.
 */
export function getSelectExtraParts<T>(
  state: SelectState<T>,
  send: (event: SelectEvent) => void,
  contentId: string,
): SelectExtraParts<T> {
  const { classes } = selectAnatomy;
  const countText = getSelectCountText(state);
  return {
    header: { class: classes.header },
    search: searchProps(state, send, contentId, shownSelectKeys(state)),
    empty: { class: classes.empty, role: 'status' },
    footer: { class: classes.footer },
    count: countText === undefined ? null : { class: classes.count, text: countText },
    optionLeading: { class: classes.optionLeading, 'aria-hidden': 'true' },
    optionDescription: (item) => ({
      class: classes.optionDescription,
      id: selectOptionDescriptionId(state.id, item),
    }),
  };
}
