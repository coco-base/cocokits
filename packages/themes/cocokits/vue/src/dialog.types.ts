import type {
  DialogContentEmits as BaseDialogContentEmits,
  DialogContentProps as BaseDialogContentProps,
  DialogRootProps as BaseDialogRootProps,
} from '@cocokits/vue/dialog';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type DialogOptions = CocokitsThemeConfig['components']['dialog'];

/** The `size` values of the cocokits theme. */
export type DialogSize = DialogOptions['size']['values'][number];

/**
 * Props of the cocokits DialogRoot. It renders the base DialogRoot and keeps `size` for its `DialogContent`, which
 * draws it as `data-size` on the window. The root renders no element and no attribute itself. The option resolves as
 * the size of the root, then `ThemeProvider` override, then config default; `null` removes the attribute. Bind the
 * open state with `v-model:open`.
 *
 * @example
 * <DialogRoot size="lg">
 *   <DialogTrigger>Open</DialogTrigger>
 *   <DialogContent><DialogTitle>Delete project</DialogTitle></DialogContent>
 * </DialogRoot>
 * @cckPart root
 */
export interface DialogRootProps extends BaseDialogRootProps {
  /**
   * Width, padding and gap of the window, drawn on the content. The `DialogContent` of this dialog reads it.
   */
  readonly size?: DialogSize | null | undefined;
}

/**
 * Props of the cocokits DialogContent. It renders the base DialogContent and draws the window, from the `size` of its `DialogRoot`. It has no option of its own.
 *
 * @example
 * <DialogContent><DialogTitle>Delete project</DialogTitle></DialogContent>
 * @cckPart content
 */
export type DialogContentProps = BaseDialogContentProps;

/** Events of the cocokits DialogContent: the events of the base DialogContent. */
export type DialogContentEmits = BaseDialogContentEmits;
