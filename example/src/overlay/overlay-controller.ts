import { Behavior } from '../behavior';
import { FocusTrap } from './focus-trap';
import { Overlay } from './overlay';
import { OverlayConfig } from './overlay-config';
import { OverlayService } from './overlay-service';
import { FocusChangeEvent } from './focus-monitor';
import { Escape, Space, Enter } from '../keys';

export class OverlayController extends Behavior {

    protected overlayService = new OverlayService();

    protected focusTrap?: FocusTrap;

    protected previousFocus?: HTMLElement;

    constructor (public overlay: Overlay, protected config: Partial<OverlayConfig>) {

        super();

        this.listen(this.overlay, 'keydown', (event: Event) => this.handleKeydown(event as KeyboardEvent));
        this.listen(this.overlay, 'open-changed', () => this.update());

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

    protected handleFocusChange (event: FocusChangeEvent) {

        const hasFocus = event.detail.type === 'focusin';

        if (!hasFocus) {

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

    protected isEscape (event?: Event): boolean {

        return event && event.type === 'keydown' && (event as KeyboardEvent).key === Escape || false;
    }
}
