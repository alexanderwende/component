import { PropertyChangeEvent } from '@partkit/component';
import { Enter, Space } from '../../keys';
import { DefaultOverlayController } from './default-overlay-controller-new';
import { DEFAULT_OVERLAY_CONTROLLER_CONFIG, OverlayControllerConfig } from './overlay-controller-config';
import { FocusTrap } from '../focus-trap';

export const DIALOG_OVERLAY_CONTROLLER_CONFIG: OverlayControllerConfig = {
    ...DEFAULT_OVERLAY_CONTROLLER_CONFIG
};

export class DialogOverlayController extends DefaultOverlayController {

    attach (element: HTMLElement): boolean {

        if (!super.attach(element)) return false;

        this.element!.setAttribute('aria-haspopup', 'dialog');

        this.listen(this.element!, 'click', (event: Event) => this.handleClick(event as MouseEvent));
        this.listen(this.element!, 'keydown', (event: Event) => this.handleKeydown(event as KeyboardEvent));

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

        this.toggle(event);
    }

    protected handleKeydown (event: KeyboardEvent) {

        switch (event.key) {

            case Enter:
            case Space:

                // handle events that happen on the trigger element
                if (event.target === this.element) {

                    event.preventDefault();
                    event.stopPropagation();
                    this.toggle(event);
                    break;
                }

            default:

                super.handleKeydown(event);
                break;
        }
    }
}
