import { Behavior } from '../behavior';
import { Overlay } from "./overlay";
import { OverlayService } from "./overlay-service";
import { Enter, Space, Escape } from '../keys';

export class OverlayTrigger extends Behavior {

    protected overlayService = new OverlayService();

    constructor (public overlay: Overlay) {

        super();
    }

    attach (element: HTMLElement) {

        super.attach(element);

        this.element!.setAttribute('aria-haspopup', 'dialog');

        this.eventManager.listen(this.element!, 'keydown', (event: Event) => this.handleKeydown(event as KeyboardEvent));
        this.eventManager.listen(this.element!, 'mousedown', (event: Event) => this.handleMousedown(event as MouseEvent));

        this.eventManager.listen(this.overlay, 'open-changed', () => this.update());

        this.update();
    }

    detach () {

        if (!this.hasAttached) return;

        this.element!.removeAttribute('aria-haspopup');
        this.element!.removeAttribute('aria-expanded');

        super.detach();
    }

    update () {

        if (this.hasAttached) {

            this.element!.setAttribute('aria-expanded', this.overlay.open ? 'true' : 'false');
        }
    }

    protected handleKeydown (event: KeyboardEvent) {

        switch (event.key) {

            case Enter:
            case Space:
                this.overlayService.toggleOverlay(this.overlay, event);
                event.preventDefault();
                event.stopPropagation();
                break;

            case Escape:
                this.overlayService.closeOverlay(this.overlay, event);
                event.preventDefault();
                event.stopPropagation();
                break;
        }
    }

    protected handleMousedown (event: MouseEvent) {

        this.overlayService.toggleOverlay(this.overlay, event);
    }
}

export class TooltipOverlayTrigger extends OverlayTrigger {

    constructor (public overlay: Overlay) {

        super(overlay);
    }

    attach (element: HTMLElement) {

        // TODO: this will run the OverlayTrigger's attach method and add all default event handlers... we don't want that!
        super.attach(element);

        this.overlay.role = 'tooltip';

        this.element!.setAttribute('tabindex', '0');
        this.element!.setAttribute('aria-describedby', this.overlay.id);

        this.eventManager.listen(this.element!, 'mouseenter', () => this.openTooltip());
        this.eventManager.listen(this.element!, 'mouseleave', () => this.closeTooltip());

        this.eventManager.listen(this.element!, 'focus', () => this.openTooltip());
        this.eventManager.listen(this.element!, 'blur', () => this.closeTooltip());
    }

    detach () {

        this.element!.removeAttribute('tabindex');
        this.element!.removeAttribute('aria-describedby');

        super.detach();
    }

    update () { }

    protected openTooltip () { }

    protected closeTooltip () { }
}

export class MenuOverlayTrigger { }

export class ListboxOverlayTrigger { }

export class DialogOverlayTrigger extends OverlayTrigger { }

// export class TreeOverlayTrigger { }

// export class GridOverlayTrigger { }
