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
export declare function listener(options: ListenerDeclaration): (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => void;
//# sourceMappingURL=listener.d.ts.map