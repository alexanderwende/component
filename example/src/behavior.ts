import { EventBinding, EventManager } from "./event-manager";

export abstract class Behavior {

    protected _element: HTMLElement | undefined;

    protected eventManager = new EventManager();

    get hasAttached (): boolean {

        return this._element !== undefined;
    }

    get element (): HTMLElement | undefined {

        return this._element;
    }

    attach (element: HTMLElement, ...args: any[]) {

        this._element = element;
    }

    detach (...args: any[]) {

        this.eventManager.unlistenAll();

        this._element = undefined;
    }

    listen (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {

        this.eventManager.listen(target, type, listener, options);
    }

    unlisten (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean) {

        this.eventManager.unlisten(target, type, listener, options);
    }

    dispatch (event: Event): boolean;
    dispatch<T = any> (type: string, detail?: T, eventInit?: Partial<EventInit>): boolean;
    dispatch<T = any> (eventOrType?: Event | string, detail?: T, eventInit?: Partial<EventInit>): boolean {

        if (this.hasAttached) {

            return (eventOrType instanceof Event)
                ? this.eventManager.dispatch(this.element!, eventOrType)
                : this.eventManager.dispatch(this.element!, eventOrType!, detail, eventInit);
        }

        return false;
    }
}
