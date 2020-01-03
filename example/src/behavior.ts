import { EventBinding, EventManager } from './events';

export abstract class Behavior {

    protected _attached = false;

    protected _element: HTMLElement | undefined;

    protected eventManager = new EventManager();

    get hasAttached (): boolean {

        return this._attached;
    }

    /**
     * The element that the behavior is attached to
     *
     * @description
     * We only expose a getter for the element, so it can't be set directly, but has to be set via
     * the behavior's attach method.
     */
    get element (): HTMLElement | undefined {

        return this._element;
    }

    attach (element?: HTMLElement, ...args: any[]): boolean {

        if (this.hasAttached) return false;

        this._element = element;

        this._attached = true;

        return true;
    }

    detach (...args: any[]): boolean {

        if (!this.hasAttached) return false;

        this.eventManager.unlistenAll();

        this._element = undefined;

        this._attached = false;

        return true;
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
