import { DialogBody } from './dialog-body';
import { DialogClose } from './dialog-close';
import { DialogContent } from './dialog-content';
import { DialogDescription } from './dialog-description';
import { DialogFooter } from './dialog-footer';
import { DialogHeader } from './dialog-header';
import { DialogRoot } from './dialog-root';
import { DialogTitle } from './dialog-title';
import { DialogTrigger } from './dialog-trigger';
import type {
  DialogCloseProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogPart,
  DialogRootProps,
  DialogSectionProps,
  DialogTitleProps,
  DialogTriggerProps,
} from './dialog.types';

/** The shape of the {@link Dialog} namespace. */
interface DialogNamespace {
  readonly Root: DialogPart<DialogRootProps>;
  readonly Trigger: DialogPart<DialogTriggerProps>;
  readonly Content: DialogPart<DialogContentProps>;
  readonly Header: DialogPart<DialogSectionProps>;
  readonly Body: DialogPart<DialogSectionProps>;
  readonly Footer: DialogPart<DialogSectionProps>;
  readonly Title: DialogPart<DialogTitleProps>;
  readonly Description: DialogPart<DialogDescriptionProps>;
  readonly Close: DialogPart<DialogCloseProps>;
}

/**
 * The Dialog parts as a namespace: `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Header`,
 * `Dialog.Body`, `Dialog.Footer`, `Dialog.Title`, `Dialog.Description` and `Dialog.Close`. A modal dialog on the native
 * `<dialog>` element.
 */
export const Dialog: DialogNamespace = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
};
