import { Component } from '../component.js';
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
//# sourceMappingURL=listener-declaration.d.ts.map