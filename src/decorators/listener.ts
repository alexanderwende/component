import { Component } from '../component';

/**
 * A {@link Component} event listener declaration
 */
export interface ListenerDeclaration<Type extends Component = Component> {

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
     * An alternative event target (by default this will be the {@link Component} instance)
     *
     * @remarks
     * This can be useful if you want to listen to e.g.:
     * * window.onresize
     * * document.onload
     * * document.onscroll
     * * Worker.onmessage
     *
     * If a function is provided, the function will be invoked by component after its
     * {@link connectedCallback} has updated the component. The context of the function will
     * be the component instance.
     *
     * ```typescript
     * class MyElement extends Component {
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
 * Decorates a {@link Component} method as an event listener
 *
 * @param options The listener declaration
 */
export function listener<Type extends Component = Component> (options: ListenerDeclaration<Type>) {

    return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {

        const constructor = target.constructor as typeof Component;

        prepareConstructor(constructor);

        if (options.event === null) {

            constructor.listeners.delete(propertyKey);

        } else {

            constructor.listeners.set(propertyKey, { ...options } as ListenerDeclaration);
        }
    }
}

/**
 * Prepares the component constructor by initializing static properties for the listener decorator,
 * so we don't modify a base class's static properties.
 *
 * @remarks
 * When the listener decorator stores listener declarations in the constructor, we have to make sure the
 * static listeners field is initialized on the current constructor. Otherwise we add listener declarations
 * to the base class's static field. We also make sure to initialize the listener maps with the values of
 * the base class's map to properly inherit all listener declarations.
 *
 * @param constructor The component constructor to prepare
 *
 * @internal
 * @private
 */
function prepareConstructor (constructor: typeof Component) {

    if (!constructor.hasOwnProperty('listeners')) constructor.listeners = new Map(constructor.listeners);
}
