import { PropertyChangeEvent } from '@partkit/component';
import { Enter, Space } from '../../keys';
import { OverlayTrigger } from './overlay-trigger';
import { DEFAULT_OVERLAY_TRIGGER_CONFIG, OverlayTriggerConfig } from './overlay-trigger-config';
import { cancel } from 'example/src/events';

export const DIALOG_OVERLAY_TRIGGER_CONFIG: OverlayTriggerConfig = {
    ...DEFAULT_OVERLAY_TRIGGER_CONFIG
};

export class DialogOverlayTrigger extends OverlayTrigger {

    attach (element: HTMLElement): boolean {

        // we enforce the element by only attaching, if it is provided
        if (!element || !super.attach(element)) return false;

        this.element!.setAttribute('aria-haspopup', 'dialog');

        this.listen(this.element!, 'click', event => this.handleClick(event as MouseEvent));
        this.listen(this.element!, 'keydown', event => this.handleKeydown(event as KeyboardEvent));

        this.update();

        return true;
    }

    detach (): boolean {

        if (!this.hasAttached) return false;

        this.element!.removeAttribute('aria-haspopup');
        this.element!.removeAttribute('aria-expanded');

        return super.detach();
    }

    update () {

        if (!this.hasAttached) return;

        this.element!.setAttribute('aria-expanded', this.overlay.open ? 'true' : 'false');
    }

    protected handleOpenChange (event: PropertyChangeEvent<boolean>) {

        super.handleOpenChange(event);

        this.update();
    }

    protected handleClick (event: MouseEvent) {

        this.toggle();
    }

    protected handleKeydown (event: KeyboardEvent) {

        switch (event.key) {

            case Enter:
            case Space:

                // handle events that happen on the trigger element
                if (event.target === this.element) {

                    cancel(event);
                    this.toggle();
                    break;
                }

            default:

                super.handleKeydown(event);
                break;
        }
    }
}
