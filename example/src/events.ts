import { Escape } from './keys';

export interface EventBinding {
    readonly target: EventTarget;
    readonly type: string;
    readonly listener: EventListenerOrEventListenerObject | null;
    readonly options?: EventListenerOptions | boolean;
}

export function isEventBinding (binding: any): binding is EventBinding {

    return typeof binding === 'object'
        && typeof (binding as EventBinding).target === 'object'
        && typeof (binding as EventBinding).type === 'string'
        && (typeof (binding as EventBinding).listener === 'function'
            || typeof (binding as EventBinding).listener === 'object');
}


export function isEscape (event?: Event): boolean {

    return (event as KeyboardEvent)?.key === Escape;
}

/**
 * Dispatches a CustomEvent on the target
 */
export function dispatch<T = any> (target: EventTarget, type: string, detail?: T, eventInit?: Partial<EventInit>): boolean {

    return target.dispatchEvent(new CustomEvent(type, {
        bubbles: true,
        composed: true,
        cancelable: true,
        ...eventInit,
        detail
    }));
}

/**
 * A class for managing event listeners
 *
 * @description
 * The EventManager class can be used to handle multiple event listeners on multiple targets. It caches all event listeners
 * and can remove them separately or all together. This can be useful when event listeners need to be added and removed during
 * the lifetime of a component and makes manually saving references to targets, listeners and options unnecessary.
 *
 * ```ts
 *  // create an EventManager instance
 *  const manager = new EventManager();
 *
 *  // you can save a reference (an EventBinding) to the added event listener if you need to manually remove it later
 *  const binding = manager.listen(document, 'scroll', (event) => {...});
 *
 *  // ...or ignore the reference if you don't need it
 *  manager.listen(document.body, 'click', (event) => {...});
 *
 *  // you can remove a specific event listener using a reference
 *  manager.unlisten(binding);
 *
 *  // ...or remove all previously added event listeners in one go
 *  manager.unlistenAll();
 * ```
 */
export class EventManager {

    protected bindings = new Set<EventBinding>();

    /**
     * Checks if an EventBinding exists that matches the binding object
     */
    hasBinding (binding: EventBinding): boolean;

    /**
     * Checks if an EventBinding exists that matches the target, type, listener and options
     */
    hasBinding (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): boolean;

    hasBinding (
        targetOrBinding: EventBinding | EventTarget,
        type?: string,
        listener?: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions
    ): boolean {

        return (isEventBinding(targetOrBinding)
            ? this.findBinding(targetOrBinding)
            : this.findBinding(targetOrBinding, type!, listener!, options)) !== undefined;
    }

    /**
     * Finds an existing EventBinding that matches the binding object
     */
    findBinding (binding: EventBinding): EventBinding | undefined;

    /**
     * Finds an existing EventBinding that matches the target, type, listener and options
     */
    findBinding (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): EventBinding | undefined;

    findBinding (
        bindingOrTarget: EventBinding | EventTarget,
        type?: string,
        listener?: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions
    ): EventBinding | undefined {

        let searchBinding: EventBinding = isEventBinding(bindingOrTarget) ? bindingOrTarget : this.createBinding(bindingOrTarget, type!, listener!, options);

        let foundBinding: EventBinding | undefined;

        if (this.bindings.has(searchBinding)) return searchBinding;

        for (let binding of this.bindings.values()) {

            if (this.compareBindings(searchBinding, binding)) {

                foundBinding = binding;
                break;
            }
        }

        return foundBinding;
    }

    /**
     * Adds the event listener to the target of the binding object
     *
     * @returns The {@link EventBinding} which was added or undefined a matching event binding already exists
     */
    listen (binding: EventBinding): EventBinding | undefined;

    /**
     * Adds the event listener to the target
     *
     * @returns The {@link EventBinding} which was added or undefined a matching event binding already exists
     */
    listen (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): EventBinding | undefined;

    listen (
        bindingOrTarget: EventBinding | EventTarget,
        type?: string,
        listener?: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions
    ): EventBinding | undefined {

        const binding = isEventBinding(bindingOrTarget)
            ? bindingOrTarget
            : this.createBinding(bindingOrTarget, type!, listener!, options);

        if (!this.hasBinding(binding)) {

            binding.target.addEventListener(binding.type, binding.listener, binding.options);

            this.bindings.add(binding);

            return binding;
        }
    }

    /**
     * Removes the event listener from the target of the binding object
     *
     * @returns The {@link EventBinding} which was removed or undefined if no matching event binding exists
     */
    unlisten (binding: EventBinding): EventBinding | undefined;

    /**
     * Removes the event listener from the target
     *
     * @returns The {@link EventBinding} which was removed or undefined if no matching event binding exists
     */
    unlisten (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): EventBinding | undefined;

    unlisten (
        bindingOrTarget: EventBinding | EventTarget,
        type?: string,
        listener?: EventListenerOrEventListenerObject | null,
        options?: EventListenerOptions | boolean
    ): EventBinding | undefined {

        const binding = isEventBinding(bindingOrTarget)
            ? this.findBinding(bindingOrTarget)
            : this.findBinding(bindingOrTarget, type!, listener!, options);

        if (binding) {

            binding.target.removeEventListener(binding.type, binding.listener, binding.options);

            this.bindings.delete(binding);

            return binding;
        }
    }

    /**
     * Removes all event listeners from their targets
     */
    unlistenAll () {

        this.bindings.forEach(binding => this.unlisten(binding));
    }

    /**
     * Dispatches an Event on the target
     */
    dispatch<T = any> (target: EventTarget, event: Event): boolean;

    /**
     * Dispatches a CustomEvent on the target
     */
    dispatch<T = any> (target: EventTarget, type: string, detail?: T, eventInit?: Partial<EventInit>): boolean;

    dispatch<T = any> (target: EventTarget, eventOrType?: Event | string, detail?: T, eventInit: Partial<EventInit> = {}): boolean {

        if (eventOrType instanceof Event) {

            return target.dispatchEvent(eventOrType);
        }

        return target.dispatchEvent(new CustomEvent(eventOrType!, {
            bubbles: true,
            composed: true,
            cancelable: true,
            ...eventInit,
            detail
        }));
    }

    /**
     * Creates an {@link EventBinding} object
     *
     * @internal
     */
    protected createBinding (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): EventBinding {

        return Object.freeze({
            target,
            type,
            listener,
            options
        });
    }

    /**
     * Compares two {@link EventBinding} objects
     *
     * @returns `true` if the binding objects have the same target, type listener and options
     *
     * @internal
     */
    protected compareBindings (binding: EventBinding, other: EventBinding): boolean {

        if (binding === other) return true;

        return binding.target === other.target
            && binding.type === other.type
            && this.compareListeners(binding.listener, other.listener)
            && this.compareOptions(binding.options, other.options);
    }

    /**
     * Compares two event listeners
     *
     * @returns `true` if the listeners are the same
     *
     * @internal
     */
    protected compareListeners (listener: EventListenerOrEventListenerObject | null, other: EventListenerOrEventListenerObject | null): boolean {

        // catches both listeners being null, a function or the same EventListenerObject
        if (listener === other) return true;

        // compares the handlers of two EventListenerObjects
        if (typeof listener === 'object' && typeof other === 'object') {

            return (listener as EventListenerObject).handleEvent === (other as EventListenerObject).handleEvent;
        }

        return false;
    }

    /**
     * Compares two event listener options
     *
     * @returns `true` if the options are the same
     *
     * @internal
     */
    protected compareOptions (options?: boolean | AddEventListenerOptions, other?: boolean | AddEventListenerOptions): boolean {

        // catches both options being undefined or same boolean value
        if (options === other) return true;

        // compares two options objects
        if (typeof options === 'object' && typeof other === 'object') {

            return options.capture === other.capture
                && options.passive === other.passive
                && options.once === other.once;
        }

        return false;
    }
}
