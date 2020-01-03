import { PropertyChangeEvent } from '@partkit/component';
import { Behavior } from '../../behavior';
import { activeElement } from '../../dom';
import { FocusChangeEvent, FocusMonitor } from '../../focus/focus-monitor';
import { FocusTrap } from '../../focus/focus-trap';
import { Escape } from '../../keys';
import { Overlay } from '../overlay';
import { OverlayTriggerConfig } from './overlay-trigger-config';

export class OverlayTrigger extends Behavior {

    protected previousFocus: HTMLElement = document.body;

    protected focusBehavior?: FocusMonitor;

    constructor (protected config: Partial<OverlayTriggerConfig>, public overlay: Overlay) {

        super();

        this.focusBehavior = this.config.trapFocus
            ? new FocusTrap(this.config)
            : new FocusMonitor();
    }

    attach (element?: HTMLElement): boolean {

        if (!super.attach(element)) return false;

        this.listen(this.overlay, 'open-changed', event => this.handleOpenChange(event as PropertyChangeEvent<boolean>));
        this.listen(this.overlay, 'focus-changed', event => this.handleFocusChange(event as FocusChangeEvent));

        this.listen(this.overlay, 'keydown', event => this.handleKeydown(event as KeyboardEvent));

        return true;
    }

    // TODO: remove event parameter...
    open (event?: Event) {

        this.overlay.open = true;
    }

    close (event?: Event) {

        this.overlay.open = false;
    }

    toggle (event?: Event, open?: boolean) {

        this.overlay.open = open ?? !this.overlay.open;
    }

    protected handleOpenChange (event: PropertyChangeEvent<boolean>) {

        const open = event.detail.current;

        console.log('OverlayTrigger.handleOpenChange()...', event);

        if (open) {

            this.storeFocus();

            if (this.focusBehavior) {

                this.focusBehavior.attach(this.overlay);
            }

        } else {

            if (this.focusBehavior) {

                this.focusBehavior.detach();
            }
        }
    }

    protected handleFocusChange (event: FocusChangeEvent) {

        const hasFocus = event.detail.type === 'focusin';

        console.log('OverlayTrigger.handleFocusChange()...', hasFocus);

        if (!hasFocus) {

            // when loosing focus, we wait for potential focusin events on child or parent overlays by delaying
            // the active check in a new macrotask via setTimeout
            setTimeout(() => {

                // then we check if the overlay is active and if not, we close it
                if (!this.overlay.static.isOverlayActive(this.overlay)) {

                    // we have to get the parent before closing the overlay - when overlay is closed, it doesn't have a parent
                    const parent = this.overlay.static.getParentOverlay(this.overlay);

                    if (this.config.closeOnFocusLoss) {

                        this.close(event);
                    }

                    if (parent) {

                        // if we have a parent overlay, we let the parent know that our overlay has lost focus,
                        // by dispatching the FocusChangeEvent on the parent overlay to be handled or ignored
                        // by the parent's OverlayTrigger
                        parent.dispatchEvent(event);
                    }
                }
            }, 0);
        }
    }

    protected handleKeydown (event: KeyboardEvent) {

        console.log('OverlayTrigger.handleKeydown()...', event);

        switch (event.key) {

            case Escape:

                if (!this.overlay.open || !this.config.closeOnEscape) return;

                event.preventDefault();
                event.stopPropagation();

                this.close(event);

                if (!this.config.restoreFocus) return;

                this.listen(this.overlay, 'open-changed', () => {

                    console.log('once: open-changed restoreFocus...');
                    this.restoreFocus();

                }, { once: true });

                break;
        }
    }



    protected storeFocus () {

        this.previousFocus = activeElement();

        console.log('OverlayTrigger.storeFocus()...', this.previousFocus);
    }

    protected restoreFocus () {

        this.previousFocus.focus();

        console.log('OverlayTrigger.restoreFocus()...', this.previousFocus);
    }
}
