import {
  DestroyRef,
  Injectable,
  ViewContainerRef,
  inject,
  type ComponentRef,
  type Injector,
  type TemplateRef,
  type Type,
} from '@angular/core';
import { createPortalHost, type PortalHost } from '@cocokits/cdk/portal';
import { CckDirection } from './direction';
import { CCK_THEME } from './theme-provider';

interface Attached {
  /** The template or the component class that was attached. */
  readonly source: unknown;
  readonly trigger: Element;
  readonly host: PortalHost;
  /** Destroys the rendered view or component. */
  readonly destroy: () => void;
}

/** What `attachComponent` accepts. */
export interface AttachComponentOptions {
  /** The injector of the component; defaults to the injector of the view container. */
  readonly injector?: Injector;
}

/**
 * Renders an `ng-template` or a component into the top-layer portal host of an overlay. List it in the `providers`
 * of the overlay root, so each overlay has its own. The embedded view is created from the template at its
 * declaration site, so DI and context follow the declaration. It is created in the view container given to
 * `useContainer`, so it is checked with the declaration's change-detection tree (it is not a root view of the application), and its
 * nodes are moved into the host. Call
 * `attach` and `detach` from `afterRenderEffect`, never on the server; the server renders nothing.
 *
 * Use `attachComponent` when the content is a component of your own, such as the bubble of a one-attribute
 * Tooltip; it is created in the same view container, so it is checked the same way.
 *
 * @example
 * ```ts
 * afterRenderEffect({ write: () => {
 *   const [template, trigger, open] = [this.template(), this.trigger(), this.open()];
 *   untracked(() => (open && template && trigger ? this.portal.attach(template, undefined, trigger) : this.portal.detach()));
 * } });
 * ```
 */
@Injectable()
export class CckPortal {
  private viewContainer: ViewContainerRef | null = null;
  private readonly direction = inject(CckDirection);
  private readonly themeConfig = inject(CCK_THEME, { optional: true })?.themeConfig;
  private attached: Attached | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.detach();
    });
  }

  /**
   * Sets the view container the content is created in. Call it once from the part that holds the template (the
   * `ng-template` of the content: its container is the anchor the server already rendered), or from a root that is
   * a component. Do not inject the container of an `ng-container` root: a container on an `ng-container` moves
   * its comment and breaks hydration.
   *
   * @param viewContainer - The container of the declaration; the view joins its change-detection tree.
   */
  useContainer(viewContainer: ViewContainerRef): void {
    this.viewContainer = viewContainer;
  }

  /** The host element while attached, else `null`. */
  get host(): HTMLElement | null {
    return this.attached?.host.element ?? null;
  }

  /**
   * Creates the host and renders the template into it. Does nothing when this template and trigger are
   * already attached (a new `context` is then ignored); otherwise the previous attachment is detached first.
   *
   * @param template - The overlay content, declared inside the overlay root.
   * @param context - The template context.
   * @param trigger - The trigger element; its ancestors give the container, the modes and the direction.
   */
  attach<C>(template: TemplateRef<C>, context: C, trigger: Element): void {
    if (this.attached?.source === template && this.attached.trigger === trigger) return;
    const { host, viewContainer } = this.prepare(trigger);
    const view = viewContainer.createEmbeddedView(template, context);
    host.element.append(...(view.rootNodes as Node[]));
    this.attached = {
      source: template,
      trigger,
      host,
      destroy: () => {
        view.destroy();
      },
    };
  }

  /**
   * Creates the host and renders a component into it, as `attach` does for a template. A second call replaces
   * the first attachment; `detach` destroys it. Call it from `afterRenderEffect`, never on the server.
   *
   * @param component - The component class; its host element becomes the content.
   * @param trigger - The trigger element; its ancestors give the container, the modes and the direction.
   * @param options - The injector the component is created with.
   * @returns The component ref.
   */
  attachComponent<C>(component: Type<C>, trigger: Element, options: AttachComponentOptions = {}): ComponentRef<C> {
    const { host, viewContainer } = this.prepare(trigger);
    const ref = viewContainer.createComponent(component, options.injector ? { injector: options.injector } : {});
    host.element.append(ref.location.nativeElement as Node);
    this.attached = {
      source: component,
      trigger,
      host,
      destroy: () => {
        ref.destroy();
      },
    };
    return ref;
  }

  private prepare(trigger: Element): { host: PortalHost; viewContainer: ViewContainerRef } {
    this.detach();
    if (!this.viewContainer) throw new Error('CocoKits: CckPortal has no view container; call useContainer first.');
    const host = createPortalHost({
      getTrigger: () => trigger,
      modeCollections: this.themeConfig?.modeCollections,
      getDirection: () => this.direction.dir(),
    });
    return { host, viewContainer: this.viewContainer };
  }

  /** Destroys the rendered view and removes the host. Idempotent. */
  detach(): void {
    const attached = this.attached;
    if (!attached) return;
    this.attached = null;
    attached.destroy();
    attached.host.destroy();
  }
}
