import { Behavior } from '../../behavior';
import { Escape } from '../../keys';
import { FocusChangeEvent, FocusMonitor } from '../focus-monitor';
import { FocusTrap } from '../focus-trap';
import { Overlay } from '../overlay';
import { OverlayService } from '../overlay-service';
import { OverlayController } from './overlay-controller';
import { OverlayControllerConfig } from './overlay-controller-config';
import { PropertyChangeEvent } from 'src/component';

export class DefaultOverlayController extends Behavior implements OverlayController {

    protected focusTrap?: FocusTrap | FocusMonitor;

    protected previousFocus?: HTMLElement;

    constructor (public overlay: Overlay, protected overlayService: OverlayService, protected config: Partial<OverlayControllerConfig>) {

        super();

        this.focusTrap = this.config.trapFocus
            ? new FocusTrap(config)
            : new FocusMonitor();
    }

    attach (element?: HTMLElement) {

        if (this.hasAttached) return;

        super.attach(element);

        this.listen(this.overlay, 'keydown', event => this.handleKeydown(event as KeyboardEvent));
        this.listen(this.overlay, 'focus-changed', event => this.handleFocusChange(event as FocusChangeEvent));
        this.listen(this.overlay, 'open-changed', event =>
            (event as PropertyChangeEvent<boolean>).detail.current
                ? this.handleOpen()
                : this.handleClose()
        );
    }

    async open (event?: Event): Promise<boolean> {

        this.storeFocus();

        const result = await this.overlayService.openOverlay(this.overlay, event);

        return result;
    }

    async close (event?: Event): Promise<boolean> {

        const result = await this.overlayService.closeOverlay(this.overlay, event);

        this.restoreFocus(event);

        return result;
    }

    async toggle (event?: Event): Promise<boolean> {

        if (this.overlayService.isOverlayOpen(this.overlay)) {

            return this.close(event);

        } else {

            return this.open(event);
        }
    }

    protected handleOpen () {

        console.log('handleOpen...', this);

        if (this.focusTrap) {

            this.focusTrap.attach(this.overlay);
        }
    }

    protected handleClose () {

        console.log('handleClose...', this);

        if (this.focusTrap) {

            this.focusTrap.detach();
        }
    }

    protected handleFocusChange (event: FocusChangeEvent) {

        const hasFocus = event.detail.type === 'focusin';

        if (!hasFocus) {

            // when loosing focus, we wait for potential focusin events on child or parent overlays by delaying
            // the active check in a new macrotask via setTimeout
            setTimeout(() => {

                // then we check if the overlay is active and if not, we close it
                if (!this.overlayService.isOverlayActive(this.overlay)) {

                    // we have to get the parent before closing the overlay - when overlay is closed, it doesn't have a parent
                    const parent = this.overlayService.getParentOverlay(this.overlay);

                    if (this.config.closeOnFocusLoss) {

                        this.close(event);
                    }

                    if (parent) {

                        // if we have a parent overlay, we let the parent know that our overlay has lost focus,
                        // by dispatching the FocusChangeEvent on the parent overlay to be handled or ignored
                        // by the parent's OverlayController
                        parent.dispatchEvent(event);
                    }
                }
            }, 0);
        }
    }

    protected handleKeydown (event: KeyboardEvent) {

        console.log('overlay-controller.handleKeydown()...', event);

        switch (event.key) {

            case Escape:

                if (!this.overlayService.isOverlayOpen(this.overlay)) return;

                if (!this.config.closeOnEscape) return;

                this.close(event);
                event.preventDefault();
                event.stopPropagation();
                break;
        }
    }

    protected storeFocus () {

        this.previousFocus = document.activeElement as HTMLElement || undefined;
    }

    protected restoreFocus (event?: Event) {

        // we only restore the focus if the overlay is closed pressing Escape or programmatically
        const restoreFocus = this.config.restoreFocus
            && this.previousFocus
            && (this.isEscape(event) || !event);

        if (restoreFocus) {

            this.previousFocus!.focus();
        }

        this.previousFocus = undefined;
    }

    protected isEscape (event?: Event): boolean {

        return event && event.type === 'keydown' && (event as KeyboardEvent).key === Escape || false;
    }
}
