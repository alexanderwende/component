import { PropertyChangeEvent } from 'src/component';
import { Behavior } from '../behavior';
import { Enter, Escape, Space } from '../keys';
import { FocusChangeEvent } from './focus-monitor';
import { FocusTrap } from './focus-trap';
import { Overlay } from './overlay';
import { OverlayConfig } from './overlay-config';
import { OverlayService } from './overlay-service';

export class OverlayController extends Behavior {

    protected overlayService = new OverlayService();

    protected focusTrap?: FocusTrap;

    protected previousFocus?: HTMLElement;

    constructor (public overlay: Overlay, protected config: Partial<OverlayConfig>) {

        super();

        // TODO: these listeners will get detached when the controller gets detached, but not reattached on attach...
        this.listen(this.overlay, 'keydown', event => this.handleKeydown(event as KeyboardEvent));
        this.listen(this.overlay, 'open-changed', event => this.handleOpenChange(event as PropertyChangeEvent<boolean>));

        if (this.config.trapFocus) {

            this.focusTrap = new FocusTrap(this.config);

            this.listen(this.overlay, 'focus-changed', event => this.handleFocusChange(event as FocusChangeEvent));
        }
    }

    attach (element: HTMLElement) {

        super.attach(element);

        this.element!.setAttribute('aria-haspopup', 'dialog');

        this.listen(this.element!, 'keydown', (event: Event) => this.handleKeydown(event as KeyboardEvent));
        this.listen(this.element!, 'mousedown', (event: Event) => this.handleMousedown(event as MouseEvent));

        this.update();
    }

    detach () {

        if (!this.hasAttached) return;

        this.element!.removeAttribute('aria-haspopup');
        this.element!.removeAttribute('aria-expanded');

        super.detach();
    }

    update () {

        if (!this.hasAttached) return;

        this.element!.setAttribute('aria-expanded', this.overlay.open ? 'true' : 'false');
    }

    async open (event?: Event): Promise<boolean> {

        const result = await this.overlayService.openOverlay(this.overlay, event);

        if (this.focusTrap) {

            this.saveFocus();

            this.focusTrap.attach(this.overlay);
        }

        return result;
    }

    async close (event?: Event): Promise<boolean> {

        const result = await this.overlayService.closeOverlay(this.overlay, event);

        if (this.focusTrap) {

            this.focusTrap.detach();

            this.restoreFocus(event);
        }

        return result;
    }

    async toggle (event?: Event): Promise<boolean> {

        if (this.overlayService.isOverlayOpen(this.overlay)) {

            return this.close(event);

        } else {

            return this.open(event);
        }
    }

    protected handleOpenChange (event: PropertyChangeEvent<boolean>) {

        this.update();
    }

    protected handleFocusChange (event: FocusChangeEvent) {

        const hasFocus = event.detail.type === 'focusin';

        if (!hasFocus) {

            // TODO: the overlay-controller handles focus-loss and also creates the focus-trap in the first place
            // maybe the overlay-controller could dispatch the focus-loss event to its parent overlay, so the parent
            // overlay's controller could decide how to handle focus-loss and it doesn't have to be controlled in the
            // overlay-service
            // this would allow us to have modal overlays which don't close on focus-loss, but child overlays which do
            // in fact, a modal-overlay-controller could even restore the focus in case it wasn't lost to a child overlay

            // when loosing focus, we wait for potential focusin events on child overlays by delaying the active check with a promise
            Promise.resolve().then(() => {

                // then we check if the overlay is active and if not, we close it
                if (!this.overlayService.isOverlayActive(this.overlay)) this.close(event);
            })
        }
    }

    protected handleKeydown (event: KeyboardEvent) {

        switch (event.key) {

            case Enter:
            case Space:

                if (event.target !== this.element) return;

                this.toggle(event);
                event.preventDefault();
                event.stopPropagation();
                break;

            case Escape:

                if (!this.overlayService.isOverlayOpen(this.overlay)) return;

                this.close(event);
                event.preventDefault();
                event.stopPropagation();
                break;
        }
    }

    protected handleMousedown (event: MouseEvent) {

        this.toggle(event);
    }

    protected saveFocus () {

        this.previousFocus = document.activeElement as HTMLElement || undefined;
    }

    protected restoreFocus (event?: Event) {

        // we only restore the focus if the overlay is closed pressing Escape or programmatically
        const restoreFocus = this.config.restoreFocus
            && this.previousFocus
            && (this.isEscape(event) || !event);

        if (restoreFocus) {

            console.log('OverlayController.restoreFocus...', event);
            this.previousFocus!.focus();
        }

        this.previousFocus = undefined;
    }

    protected isEscape (event?: Event): boolean {

        return event && event.type === 'keydown' && (event as KeyboardEvent).key === Escape || false;
    }
}