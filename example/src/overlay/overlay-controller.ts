import { Behavior } from '../behavior';
import { FocusTrap } from './focus-trap';
import { Overlay } from './overlay';
import { OverlayConfig } from './overlay-config';
import { OverlayService } from './overlay-service';
import { FocusChangeEvent } from './focus-monitor';

export class OverlayController extends Behavior {

    protected overlayService = new OverlayService();

    protected focusTrap?: FocusTrap;

    constructor (public overlay: Overlay, protected config: Partial<OverlayConfig>) {

        super();

        if (this.config.trapFocus) {

            this.focusTrap = new FocusTrap(this.config);

            this.listen(this.overlay, 'focus-changed', () => {});
        }
    }

    async open (event?: Event): Promise<boolean> {

        const result = await this.overlayService.openOverlay(this.overlay, event);

        if (this.focusTrap) {

            this.focusTrap.attach(this.overlay);
        }

        return result;
    }

    async close (event?: Event): Promise<boolean> {

        const result = await this.overlayService.closeOverlay(this.overlay, event);

        if (this.focusTrap) {

            this.focusTrap.detach();

            // TODO: handle focus restore in here based on event
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
}
