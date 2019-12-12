import { DefaultOverlayController } from './default-overlay-controller-new';
import { DEFAULT_OVERLAY_CONTROLLER_CONFIG, OverlayControllerConfig } from './overlay-controller-config';

export const TOOLTIP_OVERLAY_CONTROLLER_CONFIG: OverlayControllerConfig = {
    ...DEFAULT_OVERLAY_CONTROLLER_CONFIG,
    trapFocus: false,
    autoFocus: false,
    restoreFocus: false,
};

export class TooltipOverlayController extends DefaultOverlayController {

    attach (element: HTMLElement): boolean {

        if (!super.attach(element)) return false;

        this.overlay.role = 'tooltip';

        this.element!.setAttribute('tabindex', '0');
        this.element!.setAttribute('aria-describedby', this.overlay.id);

        this.listen(this.element!, 'mouseenter', (event) => this.open(event));
        this.listen(this.element!, 'mouseleave', (event) => this.close(event));
        this.listen(this.element!, 'focus', (event) => this.open(event));
        this.listen(this.element!, 'blur', (event) => this.close(event));

        return true;
    }

    detach (): boolean {

        if (!this.hasAttached) return false;

        this.element!.removeAttribute('tabindex');
        this.element!.removeAttribute('aria-describedby');

        return super.detach();
    }
}
