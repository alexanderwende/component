import { PropertyChangeEvent } from '@partkit/component';
import { macroTask } from '@partkit/component/tasks';
import { Behavior } from '../../behavior/behavior';
import { activeElement } from '../../dom';
import { FocusChangeEvent, FocusMonitor, FocusTrap } from '../../focus';
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

        // if it's an event bubbling up from a nested overlay, ignore it
        if (event.detail.target !== this.overlay) return;

        const open = event.detail.current;

        console.log('OverlayTrigger.handleOpenChange()...', this.overlay.id, event.detail.current);

        if (open) {

            this.storeFocus();

            this.focusBehavior?.attach(this.overlay);

        } else {

            this.focusBehavior?.detach();
        }
    }

    protected handleFocusChange (event: FocusChangeEvent) {

        // this overlay trigger only handles FocusChangeEvents which were dispatched on its own overlay
        // if the event's target is not this trigger's overlay, then the event is bubbling from a nested overlay
        if (event.target !== this.overlay) return;

        console.log('OverlayTrigger.handleFocusChange()... %s, %s, bubbling: %s', this.overlay.id, event.detail.hasFocus, event.target !== this.overlay);

        // we only need to handle focus loss
        if (event.detail.hasFocus) return;

        // the FocusChangeEvent is dispatched after the focus has changed, so we can check if our overlay is
        // still active - the focus might have moved to a nested overlay (higher in the stack)
        if (this.overlay.static.isOverlayActive(this.overlay)) return;

        // if this trigger's overlay is no longer active we can close it

        // we have to get the parent before closing the overlay - when overlay is closed, it doesn't have a parent
        const parent = this.overlay.static.getParentOverlay(this.overlay);

        if (this.config.closeOnFocusLoss) this.close(event);

        // if we have a parent overlay, we let the parent know that our overlay has lost focus by dispatching the
        // FocusChangeEvent on the parent overlay to be handled or ignored by the parent's OverlayTrigger
        macroTask(() => parent?.dispatchEvent(event));
    }

    protected handleKeydown (event: KeyboardEvent) {

        switch (event.key) {

            case Escape:

                if (!this.overlay.open || !this.config.closeOnEscape) return;

                console.log('OverlayTrigger.handleKeydown()...', event);

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
