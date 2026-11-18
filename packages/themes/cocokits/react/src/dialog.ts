import { Dialog as BaseDialog } from '@cocokits/react/dialog';
import { DialogContent, type DialogContentComponent } from './dialog-content';
import { DialogRoot, type DialogRootComponent } from './dialog-root';

/** The cocokits {@link Dialog} parts: the themed `Root` and `Content` and the base parts. */
interface DialogNamespace {
  readonly Root: DialogRootComponent;
  readonly Trigger: typeof BaseDialog.Trigger;
  readonly Content: DialogContentComponent;
  readonly Title: typeof BaseDialog.Title;
  readonly Description: typeof BaseDialog.Description;
  readonly Close: typeof BaseDialog.Close;
  readonly Header: typeof BaseDialog.Header;
  readonly Body: typeof BaseDialog.Body;
  readonly Footer: typeof BaseDialog.Footer;
}

/**
 * The cocokits Dialog as a namespace: the themed `Dialog.Root` and `Dialog.Content` and the base `Dialog.Trigger`,
 * `Dialog.Title`, `Dialog.Description`, `Dialog.Close`, `Dialog.Header`, `Dialog.Body` and `Dialog.Footer`. The root
 * takes `size`, which the content draws.
 */
export const Dialog: DialogNamespace = {
  Root: DialogRoot,
  Trigger: BaseDialog.Trigger,
  Content: DialogContent,
  Title: BaseDialog.Title,
  Description: BaseDialog.Description,
  Close: BaseDialog.Close,
  Header: BaseDialog.Header,
  Body: BaseDialog.Body,
  Footer: BaseDialog.Footer,
};
