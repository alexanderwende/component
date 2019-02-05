import { TemplateResult } from 'lit-html';
import { ListenerDeclaration } from './decorators/listener';
import { PropertyDeclaration } from "./decorators/property-declaration";
/**
 * Extends the static {@link ListenerDeclaration} to include the bound listener
 */
interface InstanceListenerDeclaration extends ListenerDeclaration {
    /**
     * The bound listener will be stored here, so it can be removed it later
     */
    listener: EventListener;
    /**
     * The event target will always be resolved to an actual {@link EventTarget}
     */
    target: EventTarget;
}
export interface CustomElementType<T extends CustomElement = CustomElement> {
    selector: string;
    shadow: boolean;
    propertyDeclarations: {
        [key: string]: PropertyDeclaration<T>;
    };
    listenerDeclarations: {
        [key: string]: ListenerDeclaration;
    };
    new (...args: any[]): T;
}
export declare class CustomElement extends HTMLElement {
    static selector: string;
    static shadow: boolean;
    static propertyDeclarations: {
        [key: string]: PropertyDeclaration;
    };
    static listenerDeclarations: {
        [key: string]: ListenerDeclaration;
    };
    static readonly observedAttributes: string[];
    protected _renderRoot: Element | DocumentFragment;
    protected _updateRequest: Promise<boolean>;
    protected _changedProperties: Map<string, any>;
    protected _notifyingProperties: Map<string, any>;
    protected _listenerDeclarations: InstanceListenerDeclaration[];
    protected _isConnected: boolean;
    protected _hasRequestedUpdate: boolean;
    protected _isReflecting: boolean;
    readonly isConnected: boolean;
    constructor();
    createRenderRoot(): Element | DocumentFragment;
    adoptedCallback(): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(attribute: string, oldValue: any, newValue: any): void;
    propertyChangedCallback(property: string, oldValue: any, newValue: any): void;
    template(): TemplateResult;
    render(): void;
    renderCallback(): void;
    update(changedProperties: Map<string, any>): void;
    /**
     * Raise custom events for property changes which occurred in the executor
     *
     * @remarks
     * Property changes should trigger custom events when they are caused by internal state changes,
     * but not if they are caused by a consumer of the custom element API directly, e.g.:
     *
     * ```typescript
     * document.querySelector('my-custom-element').customProperty = true;
     * ```.
     *
     * This means, we cannot automate this process through property setters, as we can't be sure who
     * invoked the setter - internal calls or external calls.
     *
     * One option is to manually raise the event, which can become tedious and forces us to use string-
     * based event names or property names, which are difficult to refactor, e.g.:
     *
     * ```typescript
     * this.customProperty = true;
     * // if we refactor the property name, we can easily miss the notify call
     * this.notify('customProperty');
     * ```
     *
     * A more convenient way is to execute the internal changes in a wrapper which can detect the changed
     * properties and will automatically raise the required events. This eliminates the need to manually
     * raise events and refactoring does no longer affect the process.
     *
     * @param executor A function that performs the changes which should be notified
     */
    notifyChanges(executor: () => void): void;
    /**
     * Dispatch a property-changed event.
     *
     * @param propertyKey
     * @param oldValue
     * @param newValue
     */
    protected _notify(propertyKey: string, oldValue: any, newValue: any): void;
    /**
     * Reflect a property to an attribute on the custom element.
     *
     * @param propertyKey
     * @param oldValue
     * @param newValue
     *
     * @internal
     * @private
     */
    protected _reflect(propertyKey: string, oldValue: any, newValue: any): void;
    /**
     * Bind custom element listeners.
     *
     * @internal
     * @private
     */
    protected _listen(): void;
    /**
     * Unbind custom element listeners.
     *
     * @internal
     * @private
     */
    protected _unlisten(): void;
    requestUpdate(propertyKey?: string, oldValue?: any, newValue?: any): Promise<boolean>;
    protected _performUpdate(): Promise<void>;
    private _enqueueUpdate;
    private _getPropertyDeclaration;
}
export {};
//# sourceMappingURL=custom-element.d.ts.map