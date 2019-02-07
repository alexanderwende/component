import { CustomElement } from '../custom-element';

/**
 * A {@link CustomElement} event listener declaration
 */
export interface ListenerDeclaration {

    /**
     * The event to listen to
     *
     * @remarks
     * Setting event to `null` allows to unbind an inherited event listener.
     */
    event: string | null;

    /**
     * An options object that specifies characteristics about the event listener
     */
    options?: AddEventListenerOptions;

    /**
     * An alternative event target (by default this will be the {@link CustomElement} instance)
     *
     * @remarks
     * This can be useful if you want to listen to e.g.:
     * * window.onresize
     * * document.onload
     * * document.onscroll
     * * Worker.onmessage - TODO: This could be interesting to solve, we might need to get the worker from the
     *   component instance, maybe a use case for di @self()
     */
    target?: EventTarget | (() => EventTarget);
}

/**
 * Decorates a {@link CustomElement} method as an event listener
 *
 * @param options The listener declaration
 */
export function listener (options: ListenerDeclaration) {

    return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {

        const constructor = target.constructor as typeof CustomElement;

        prepareConstructor(constructor);

        if (options.event === null) {

            constructor.listeners.delete(propertyKey);

        } else {

            constructor.listeners.set(propertyKey, { ...options });
        }
    }
}

/**
 * Prepares the custom element constructor by initializing static properties for the listener decorator,
 * so we don't modify a base class's static properties.
 *
 * @remarks
 * When the listener decorator stores listener declarations in the constructor, we have to make sure the
 * static listeners field is initialized on the current constructor. Otherwise we add listener declarations
 * to the base class's static field. We also make sure to initialize the listener maps with the values of
 * the base class's map to properly inherit all listener declarations.
 *
 * @param constructor The custom element constructor to prepare
 *
 * @internal
 * @private
 */
function prepareConstructor (constructor: typeof CustomElement) {

    if (!constructor.hasOwnProperty('listeners')) constructor.listeners = new Map(constructor.listeners);
}
