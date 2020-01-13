import { animationFrameTask, Task } from '@partkit/component/tasks';
import { EventBinding, EventManager } from '../events';

// TODO: move NOOP to some utility
const NOOP: () => void = () => { };

export abstract class Behavior {

    protected _attached = false;

    protected _element: HTMLElement | undefined;

    protected _hasRequestedUpdate = false;

    protected _updateTask: Task = { promise: Promise.resolve(), cancel: NOOP };

    protected _eventManager = new EventManager();

    /**
     * True if the behavior's {@link Behavior.attach} method was called
     *
     * @readonly
     */
    get hasAttached (): boolean {

        return this._attached;
    }

    /**
     * The element that the behavior is attached to
     *
     * @remarks
     * We only expose a getter for the element, so it can't be set directly, but has to be set via
     * the behavior's attach method.
     */
    get element (): HTMLElement | undefined {

        return this._element;
    }

    /**
     * Attaches the behavior instance to an HTMLElement
     *
     * @param element   An optional HTMLElement to attach the behavior to
     * @param args      Optional argumantes which can be passed to the attach method
     * @returns         A boolean indicating if the behavior was successfully attached
     */
    attach (element?: HTMLElement, ...args: any[]): boolean {

        if (this.hasAttached) return false;

        this._element = element;

        this._attached = true;

        return true;
    }

    /**
     * Detaches the behavior instance
     *
     * @remarks
     * Detaching a behavior will cancel any scheduled update, remove all bound listeners
     * bound with the {@link Behavior.listen} method and clear the behavior's element
     * reference.
     *
     * @param args  Optional arguments which can be passed to the detach method
     */
    detach (...args: any[]): boolean {

        if (!this.hasAttached) return false;

        this.cancelUpdate();

        this.unlistenAll();

        this._element = undefined;

        this._attached = false;

        return true;
    }

    /**
     * Request an update of the behavior instance
     *
     * @remarks
     * This method schedules an update call using requestAnimationFrame. It returns a Promise
     * which will resolve with the return value of the update method, or reject if an error
     * occurrs during update or the update was canceled. If an update has been scheduled
     * already, but hasn't executed yet, the scheduled update's promise is returned.
     */
    requestUpdate (...args: any[]): Promise<any> {

        if (this.hasAttached && !this._hasRequestedUpdate) {

            this._hasRequestedUpdate = true;

            this._updateTask = animationFrameTask(() => {

                this.update(...args);

                this._hasRequestedUpdate = false;
            });
        }

        return this._updateTask.promise;
    }

    /**
     * Cancel a requested but not yet executed update
     */
    cancelUpdate () {

        this._updateTask.cancel();

        this._hasRequestedUpdate = false;
    }

    /**
     * Update the behavior instance
     *
     * @remarks
     * This method is intended to be used synchronously, e.g. in the update cycle of a component
     * which is already scheduled via requestAnimationFrame. If a behavior wants to update itself
     * based on some event, it is recommended to use {@link Behavior.requestUpdate} instead.
     */
    update (...args: any[]): any {

        return this.hasAttached;
    }

    listen (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): EventBinding | undefined {

        return this._eventManager.listen(target, type, listener, options);
    }

    unlisten (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): EventBinding | undefined {

        return this._eventManager.unlisten(target, type, listener, options);
    }

    unlistenAll () {

        this._eventManager.unlistenAll();
    }

    dispatch (event: Event): boolean;
    dispatch<T = any> (type: string, detail?: T, eventInit?: Partial<EventInit>): boolean;
    dispatch<T = any> (eventOrType?: Event | string, detail?: T, eventInit?: Partial<EventInit>): boolean {

        if (this.hasAttached && this.element) {

            return (eventOrType instanceof Event)
                ? this._eventManager.dispatch(this.element, eventOrType)
                : this._eventManager.dispatch(this.element, eventOrType!, detail, eventInit);
        }

        return false;
    }
}
