import { PropertyChangeEvent } from 'src/component';
import { Enter, Space } from '../../keys';
import { DefaultOverlayController } from './default-overlay-controller';
import { OverlayController } from './overlay-controller';
import { DEFAULT_OVERLAY_CONTROLLER_CONFIG, OverlayControllerConfig } from './overlay-controller-config';

export const DIALOG_OVERLAY_CONTROLLER_CONFIG: OverlayControllerConfig = {
    ...DEFAULT_OVERLAY_CONTROLLER_CONFIG
};

export class DialogOverlayController extends DefaultOverlayController implements OverlayController {

    attach (element: HTMLElement) {

        if (this.hasAttached) return;

        super.attach(element);

        this.element!.setAttribute('aria-haspopup', 'dialog');

        this.listen(this.element!, 'keydown', (event: Event) => this.handleKeydown(event as KeyboardEvent));
        this.listen(this.element!, 'mousedown', (event: Event) => this.handleMousedown(event as MouseEvent));
        this.listen(this.overlay, 'open-changed', (event: Event) => this.handleOpenChange(event as PropertyChangeEvent<boolean>));

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

    protected handleOpenChange (event: PropertyChangeEvent<boolean>) {

        this.update();
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

            default:

                super.handleKeydown(event);
                break;
        }
    }

    protected handleMousedown (event: MouseEvent) {

        this.toggle(event);
    }
}
