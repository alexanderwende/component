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
     *          target: () => this.worker
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
export declare function listener<Type extends CustomElement = CustomElement>(options: ListenerDeclaration<Type>): (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => void;
//# sourceMappingURL=listener.d.ts.map