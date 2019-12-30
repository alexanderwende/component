import { OverlayTrigger } from './overlay-trigger';
import { DEFAULT_OVERLAY_TRIGGER_CONFIG, OverlayTriggerConfig } from './overlay-trigger-config';

export const TOOLTIP_OVERLAY_TRIGGER_CONFIG: OverlayTriggerConfig = {
    ...DEFAULT_OVERLAY_TRIGGER_CONFIG,
    trapFocus: false,
    autoFocus: false,
    restoreFocus: false,
};

export class TooltipOverlayTrigger extends OverlayTrigger {

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
