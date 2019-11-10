import { EventBinding, EventManager } from "./event-manager";

export abstract class Behavior {

    protected _attached = false;

    protected _element: HTMLElement | undefined;

    protected eventManager = new EventManager();

    get hasAttached (): boolean {

        return this._attached;
    }

    get element (): HTMLElement | undefined {

        return this._element;
    }

    attach (element?: HTMLElement, ...args: any[]) {

        this._element = element;

        this._attached = true;
    }

    detach (...args: any[]) {

        this.eventManager.unlistenAll();

        this._element = undefined;

        this._attached = false;
    }

    listen (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): EventBinding | undefined {

        return this.eventManager.listen(target, type, listener, options);
    }

    unlisten (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): EventBinding | undefined {

        return this.eventManager.unlisten(target, type, listener, options);
    }

    dispatch (event: Event): boolean;
    dispatch<T = any> (type: string, detail?: T, eventInit?: Partial<EventInit>): boolean;
    dispatch<T = any> (eventOrType?: Event | string, detail?: T, eventInit?: Partial<EventInit>): boolean {

        if (this.hasAttached && this.element) {

            return (eventOrType instanceof Event)
                ? this.eventManager.dispatch(this.element, eventOrType)
                : this.eventManager.dispatch(this.element, eventOrType!, detail, eventInit);
        }

        return false;
    }
}
