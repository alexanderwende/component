import { Behavior } from '../behavior';
import { Enter, Escape, Space } from '../keys';
import { Overlay } from './overlay';
import { OverlayService } from './overlay-service';

export interface OverlayTrigger extends Behavior {

    update (): void;
}

export class DefaultOverlayTrigger extends Behavior implements OverlayTrigger {

    protected overlayService = new OverlayService();

    constructor (public overlay: Overlay) {

        super();
    }

    attach (element: HTMLElement) {

        super.attach(element);

        this.element!.setAttribute('aria-haspopup', 'dialog');

        this.listen(this.element!, 'keydown', (event: Event) => this.handleKeydown(event as KeyboardEvent));
        this.listen(this.element!, 'mousedown', (event: Event) => this.handleMousedown(event as MouseEvent));

        this.listen(this.overlay, 'open-changed', () => this.update());
        this.listen(this.overlay, 'keydown', (event: Event) => this.handleKeydown(event as KeyboardEvent));

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

    protected handleKeydown (event: KeyboardEvent) {

        switch (event.key) {

            case Enter:
            case Space:

                if (event.target !== this.element) return;

                this.overlayService.toggleOverlay(this.overlay, event);
                event.preventDefault();
                event.stopPropagation();
                break;

            case Escape:

                if (this.overlayService.isOverlayOpen(this.overlay)) {

                    this.overlayService.closeOverlay(this.overlay, event);
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
        }
    }

    protected handleMousedown (event: MouseEvent) {

        console.log('overlay-trigger.handleMousedown()...');

        this.overlayService.toggleOverlay(this.overlay, event);
    }
}

export class TooltipOverlayTrigger extends Behavior implements OverlayTrigger {

    protected overlayService = new OverlayService();

    constructor (public overlay: Overlay) {

        super();
    }

    attach (element: HTMLElement) {

        super.attach(element);

        this.overlay.role = 'tooltip';

        this.element!.setAttribute('tabindex', '0');
        this.element!.setAttribute('aria-describedby', this.overlay.id);

        this.listen(this.element!, 'mouseenter', (event) => this.openTooltip(event));
        this.listen(this.element!, 'mouseleave', (event) => this.closeTooltip(event));

        this.listen(this.element!, 'focus', (event) => this.openTooltip(event));
        this.listen(this.element!, 'blur', (event) => this.closeTooltip(event));
    }

    detach () {

        if (!this.hasAttached) return;

        this.element!.removeAttribute('tabindex');
        this.element!.removeAttribute('aria-describedby');

        super.detach();
    }

    update () { }

    protected openTooltip (event: Event) {

        this.overlayService.openOverlay(this.overlay, event);

        // event.preventDefault();
        // event.stopPropagation();
    }

    protected closeTooltip (event: Event) {

        this.overlayService.closeOverlay(this.overlay, event);

        // event.preventDefault();
        // event.stopPropagation();
    }
}

export class MenuOverlayTrigger { }

export class ListboxOverlayTrigger { }

// export class DialogOverlayTrigger extends Behavior implements OverlayTrigger { }

// export class TreeOverlayTrigger { }

// export class GridOverlayTrigger { }
