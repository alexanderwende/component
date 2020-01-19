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

        // we enforce the element by only attaching, if it is provided
        if (!element || !super.attach(element)) return false;

        this.overlay.role = 'tooltip';

        this.element!.setAttribute('tabindex', '0');
        this.element!.setAttribute('aria-describedby', this.overlay.id);

        this.listen(this.element!, 'mouseenter', () => this.overlay.show());
        this.listen(this.element!, 'mouseleave', () => this.overlay.hide());
        this.listen(this.element!, 'focus', () => this.overlay.show());
        this.listen(this.element!, 'blur', () => this.overlay.hide());

        return true;
    }

    detach (): boolean {

        if (!this.hasAttached) return false;

        this.element!.removeAttribute('tabindex');
        this.element!.removeAttribute('aria-describedby');

        return super.detach();
    }
}
