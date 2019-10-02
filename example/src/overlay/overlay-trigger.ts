import { Overlay, HiddenChangeEvent } from "./overlay";

export class OverlayTrigger {

    protected listeners: { target: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions }[];

    constructor (public element: HTMLElement, public overlay: Overlay) {

        this.listeners = [
            {
                target: this.element,
                type: 'click',
                listener: () => this.overlay.toggle()
            },
            {
                target: this.overlay,
                type: 'hidden-changed',
                listener: () => this.update()
            }
        ]

        this.init();
    }

    init () {

        this.listeners.forEach(listener => listener.target.addEventListener(listener.type, listener.listener, listener.options));

        this.element.setAttribute('aria-haspopup', 'dialog');

        this.update();
    }

    update () {

        this.element.setAttribute('aria-expanded', this.overlay.hidden ? 'false' : 'true');
    }

    destroy () {

        this.element.removeAttribute('aria-haspopup');
        this.element.removeAttribute('aria-expanded');

        this.listeners.forEach(listener => listener.target.removeEventListener(listener.type, listener.listener, listener.options));
    }
}
