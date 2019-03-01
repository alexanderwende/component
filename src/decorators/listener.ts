import { CustomElement } from '../custom-element';

/**
 * A {@link CustomElement} event listener declaration
 */
export interface ListenerDeclaration<Type extends CustomElement = CustomElement> {

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
     * * Worker.onmessage
     *
     * If a function is provided, the function will be invoked by custom element after its
     * {@link connectedCallback} has updated the custom element. The context of the function will
     * be the custom element instance.
     *
     * ```typescript
     * class MyElement extends CustomElement {
     *
     *      worker: Worker;
     *
     *      connectedCallback () {
     *          super.connectedCallback();
     *          this.worker = new Worker('worker.js');
     *      }
     *
     *      disconnectedCallback () {
     *          super.disconnectedCallback()
     *          this.worker.terminate();
     *      }
     *
     *      @listener<MyElement>({
     *          event: 'message',
     *          target: function () { return this.worker; }
     *      })
     *      onMessage (event: MessageEvent) {
     *          // do something with event.data
     *      }
     * }
     * ```
     */
    target?: EventTarget | ((this: Type) => EventTarget);
}

/**
 * Decorates a {@link CustomElement} method as an event listener
 *
 * @param options The listener declaration
 */
export function listener<Type extends CustomElement = CustomElement> (options: ListenerDeclaration<Type>) {

    return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {

        const constructor = target.constructor as typeof CustomElement;

        prepareConstructor(constructor);

        if (options.event === null) {

            constructor.listeners.delete(propertyKey);

        } else {

            constructor.listeners.set(propertyKey, { ...options } as ListenerDeclaration);
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
