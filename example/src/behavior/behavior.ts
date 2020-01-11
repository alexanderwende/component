import { EventBinding, EventManager } from '../events';
import { Task, animationFrameTask } from '../tasks';

const NOOP: () => void = () => { };

const UPDATE_CANCELED = () => new Error('Update canceled.')

export abstract class Behavior {

    protected _attached = false;

    protected _element: HTMLElement | undefined;

    // protected _animationFrame: number | undefined;

    // protected _updateControls: { animationFrame: number; resolve: (value: any) => void; reject: (reason: any) => void; } | undefined;

    // protected _updateRequest: Promise<any> = Promise.resolve();

    // protected _cancelUpdate = NOOP;

    protected _hasRequestedUpdate = false;

    protected _updateTask: Task = { promise: Promise.resolve(), cancel: NOOP };

    protected eventManager = new EventManager();

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

    attach (element?: HTMLElement, ...args: any[]): boolean {

        if (this.hasAttached) return false;

        this._element = element;

        this._attached = true;

        return true;
    }

    detach (...args: any[]): boolean {

        if (!this.hasAttached) return false;

        this.cancelUpdate();

        this.eventManager.unlistenAll();

        this._element = undefined;

        this._attached = false;

        return true;
    }

    /**
     * Request an update of the bhavior instance
     *
     * @remarks
     * This method schedules an update call using requestAnimationFrame. It returns a Promise
     * which will resolve with the return value of the update method, or reject if an error
     * occurrs during update or the update was canceled.
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

    cancelUpdate () {

        this._updateTask.cancel();

        this._hasRequestedUpdate = false;
    }


    // requestUpdate (...args: any[]): Promise<any> {

    //     if (this.hasAttached && !this._animationFrame) {

    //         this._updateRequest = new Promise((resolve, reject) => {

    //             this._cancelUpdate = () => {

    //                 if (this._animationFrame) {

    //                     cancelAnimationFrame(this._animationFrame);

    //                     this._animationFrame = undefined;
    //                     this._cancelUpdate = NOOP;
    //                 }

    //                 reject();
    //             };

    //             this._animationFrame = requestAnimationFrame(() => {

    //                 try {

    //                     const result = this.update(...args);

    //                     this._animationFrame = undefined;

    //                     this._cancelUpdate = NOOP;

    //                     resolve(result);

    //                 } catch (error) {

    //                     this._cancelUpdate = NOOP;

    //                     reject(error);
    //                 }
    //             });
    //         });
    //     }

    //     return this._updateRequest;
    // }

    // protected cancelUpdate () {

    //     if (this._updateControls) {

    //         cancelAnimationFrame(this._updateControls.animationFrame);

    //         this._updateControls.reject(UPDATE_CANCELED());

    //         this.resetUpdate();
    //     }
    // }

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
