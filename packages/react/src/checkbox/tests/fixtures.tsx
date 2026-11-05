import { screen } from '@testing-library/react';
import { must } from '../../internal/tests/choice-fixtures';

/** The checkbox input. */
export const box = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('checkbox');

/** The checkbox root element. */
export const rootOf = (): HTMLElement => must(box().closest<HTMLElement>('.cck-checkbox'));
