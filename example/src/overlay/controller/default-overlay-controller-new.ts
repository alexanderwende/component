import { PropertyChangeEvent } from '@partkit/component';
import { Behavior } from '../../behavior';
import { dispatch } from '../../event-manager';
import { Escape } from '../../keys';
import { FocusChangeEvent, FocusMonitor } from '../focus-monitor';
import { FocusTrap } from '../focus-trap';
import { Overlay } from '../overlay';
import { OverlayService } from '../overlay-service-new';
import { OverlayController } from './overlay-controller';
import { OverlayControllerConfig } from './overlay-controller-config';

export class DefaultOverlayController extends Behavior implements OverlayController {

    protected previousFocus: HTMLElement = document.body;

    protected focusTrap?: FocusTrap | FocusMonitor;

    protected isClosing = false;

    constructor (public overlay: Overlay, protected overlayService: OverlayService, protected config: Partial<OverlayControllerConfig>) {

        super();

        this.focusTrap = this.config.trapFocus
            ? new FocusTrap(config)
            : new FocusMonitor();
    }

    attach (element?: HTMLElement): boolean {

        if (!super.attach(element)) return false;

        this.listen(this.overlay, 'command-open', event => this.handleOpen(event as CustomEvent));
        this.listen(this.overlay, 'command-close', event => this.handleClose(event as CustomEvent));

        this.listen(this.overlay, 'open-changed', event => this.handleOpenChange(event as PropertyChangeEvent<boolean>));
        this.listen(this.overlay, 'focus-changed', event => this.handleFocusChange(event as FocusChangeEvent));

        this.listen(this.overlay, 'keydown', event => this.handleKeydown(event as KeyboardEvent));

        return true;
    }

    open (event?: Event) {

        dispatch(this.overlay, 'command-open', {
            target: this.overlay,
            source: event,
        });
    }

    close (event?: Event) {

        dispatch(this.overlay, 'command-close', {
            target: this.overlay,
            source: event,
        });
    }

    toggle (event?: Event, open?: boolean) {

        open = (typeof open === 'boolean') ? open : !this.overlay.open;

        if (open) {
            this.open(event);
        } else {
            this.close(event);
        }
    }

    protected handleOpen (event: CustomEvent) {

        this.isClosing = false;

        console.log('OverlayController.handleOpen()...', event);

        this.storeFocus();
    }

    protected handleClose (event: CustomEvent) {

        this.isClosing = true;

        console.log('OverlayController.handleClose()...', event);

        this.restoreFocus(event);
    }

    protected handleOpenChange (event: PropertyChangeEvent<boolean>) {

        const open = event.detail.current;

        console.log('OverlayController.handleOpenChange()...', event);

        if (open) {

            if (this.focusTrap) {

                this.focusTrap.attach(this.overlay);
            }

        } else {

            if (this.focusTrap) {

                this.focusTrap.detach();
            }
        }
    }

    protected handleFocusChange (event: FocusChangeEvent) {

        const hasFocus = event.detail.type === 'focusin';

        console.log('OverlayController.handleFocusChange()...', this.isClosing, hasFocus);

        if (!hasFocus && !this.isClosing) {

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

                if (!this.overlay.open || !this.config.closeOnEscape) return;

                event.preventDefault();
                event.stopPropagation();

                this.close(event);

                break;
        }
    }



    protected storeFocus () {

        this.previousFocus = document.activeElement as HTMLElement || document.body;

        console.log('overlay-controller.storeFocus()...', this.previousFocus);
    }

    protected restoreFocus (event?: CustomEvent) {

        console.log('overlay-controller.restoreFocus()...', this.previousFocus, event);

        // we only restore the focus if the overlay is closed pressing Escape or programmatically
        const restoreFocus = this.config.restoreFocus && (!event || this.isEscape(event.detail.source));

        if (restoreFocus) {

            this.previousFocus!.focus();
        }

        // this.previousFocus = document.body;
    }

    protected isEscape (event?: Event): boolean {

        return event && (event as KeyboardEvent).key === Escape || false;
    }
}
