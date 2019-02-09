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
export declare class CustomElement extends HTMLElement {
    static selector: string;
    static shadow: boolean;
    /**
     * A map of attribute names and their respective property keys
     *
     * @internal
     * @private
     */
    static attributes: Map<string, PropertyKey>;
    /**
     * A map of property keys and their respective property declarations
     *
     * @internal
     * @private
     */
    static properties: Map<PropertyKey, PropertyDeclaration>;
    /**
     * A map of property keys and their respective listener declarations
     *
     * @internal
     * @private
     */
    static listeners: Map<PropertyKey, ListenerDeclaration>;
    /**
     * Override to specify attributes which should be observed, but don't have an associated property
     *
     * @remark
     * For properties which are decorated with the {@link property} decorator, an observed attribute
     * is automatically created and does not need to be specified here. Fot attributes that don't
     * have an associated property, return the attribute names in this getter. Changes to these
     * attributes can be handled in the {@link attributeChangedCallback} method.
     *
     * When extending custom elements, make sure you return the super class's observedAttributes
     * if you override this getter (except if you don't want to inherit observed attributes):
     *
     * ```typescript
     * @customElement({
     *      selector: 'my-element'
     * })
     * class MyElement extends MyBaseElement {
     *
     *      static get observedAttributes (): string[] {
     *
     *          return [...super.observedAttributes, 'my-additional-attribute'];
     *      }
     * }
     * ```
     */
    static readonly observedAttributes: string[];
    protected _renderRoot: Element | DocumentFragment;
    protected _updateRequest: Promise<boolean>;
    protected _changedProperties: Map<PropertyKey, any>;
    protected _reflectingProperties: Map<PropertyKey, any>;
    protected _notifyingProperties: Map<PropertyKey, any>;
    protected _listenerDeclarations: InstanceListenerDeclaration[];
    protected _isConnected: boolean;
    protected _hasRequestedUpdate: boolean;
    protected _isReflecting: boolean;
    readonly isConnected: boolean;
    constructor();
    protected createRenderRoot(): Element | DocumentFragment;
    adoptedCallback(): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * React to attribute changes
     *
     * @remarks
     * This method can be overridden to customize the handling of attribute changes. When overriding
     * this method, a super-call should be included, to ensure attribute changes for decorated properties
     * are processed correctly.
     *
     * ```typescript
     * @customElement({
     *      selector: 'my-element'
     * })
     * class MyElement extends CustomElement {
     *
     *      attributeChangedCallback (attribute: string, oldValue: any, newValue: any) {
     *
     *          super.attributeChangedCallback(attribute, oldValue, newValue);
     *
     *          // do custom handling...
     *      }
     * }
     * ```
     *
     * @param attribute The name of the changed attribute
     * @param oldValue  The old value of the attribute
     * @param newValue  The new value of the attribute
     */
    attributeChangedCallback(attribute: string, oldValue: any, newValue: any): void;
    propertyChangedCallback(property: string, oldValue: any, newValue: any): void;
    template(): TemplateResult;
    render(): void;
    renderCallback(): void;
    protected update(changedProperties?: Map<PropertyKey, any>): void;
    /**
     * Reflect an attribute value to its associated property
     *
     * @remarks
     * This method checks, if any custom {@link AttributeReflector} has been defined for the
     * associated property and invokes the appropriate reflector. If not, it will use the default
     * reflector {@link _reflectAttribute}.
     *
     * It catches any error in custom {@link AttributeReflector}s and throws a more helpful one.
     *
     * @param attributeName The propert key of the property to reflect
     * @param oldValue      The old property value
     * @param newValue      The new property value
     */
    protected reflectAttribute(attributeName: string, oldValue: string, newValue: string): void;
    /**
     * Reflect a property value to its associated attribute
     *
     * @remarks
     * This method checks, if any custom {@link PropertyReflector} has been defined for the
     * property and invokes the appropriate reflector. If not, it will use the default
     * reflector {@link _reflectProperty}.
     *
     * It catches any error in custom {@link PropertyReflector}s and throws a more helpful one.
     *
     * @param propertyKey   The propert key of the property to reflect
     * @param oldValue      The old property value
     * @param newValue      The new property value
     */
    protected reflectProperty(propertyKey: PropertyKey, oldValue: any, newValue: any): void;
    protected notifyProperty(propertyKey: PropertyKey, oldValue: any, newValue: any): void;
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
     * ```typescript
     * this.notifyChanges(() => {
     *
     *      this.customProperty = true;
     *      // we can add more property modifications to notify in here
     * });
     * ```
     *
     * @param executor A function that performs the changes which should be notified
     */
    notifyChanges(executor: () => void): void;
    /**
     * The default attribute reflector
     *
     * @remarks
     * If no {@link AttributeReflector} is defined in the {@link PropertyDeclaration} this
     * method is used to reflect the attribute value to its associated property.
     *
     * @param attributeName The name of the attribute to reflect
     * @param oldValue      The old attribute value
     * @param newValue      The new attribute value
     *
     * @internal
     * @private
     */
    protected _reflectAttribute(attributeName: string, oldValue: string, newValue: string): void;
    /**
     * The default property reflector
     *
     * @remarks
     * If no {@link PropertyReflector} is defined in the {@link PropertyDeclaration} this
     * method is used to reflect the property value to its associated attribute.
     *
     * @param propertyKey   The property key of the property to reflect
     * @param oldValue      The old property value
     * @param newValue      The new property value
     *
     * @internal
     * @private
     */
    protected _reflectProperty(propertyKey: PropertyKey, oldValue: any, newValue: any): void;
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
    /**
     * Dispatch a property-changed event.
     *
     * @param propertyKey
     * @param oldValue
     * @param newValue
     */
    protected _notify(propertyKey: PropertyKey, oldValue: any, newValue: any): void;
    /**
     * Request an update of the custom element
     *
     * @remarks
     * This method is called automatically when the value of a decorated property or its associated
     * attribute changes. If you need the custom element to update based on a state change that is
     * not covered by a decorated property, call this method without any arguments.
     *
     * @param propertyKey   The name of the changed property that requested the update
     * @param oldValue      The old property value
     * @param newValue      the new property value
     * @returns             A Promise which is resolved when the update is completed
     */
    requestUpdate(propertyKey?: PropertyKey, oldValue?: any, newValue?: any): Promise<boolean>;
    /**
     * Schedule the update of the custom element
     *
     * @remarks
     * Schedules the update of the custom element just before the next frame
     * and cleans up the custom elements state afterwards.
     */
    protected _scheduleUpdate(): Promise<void>;
    /**
     * Enqueue a request for an asynchronous update
     */
    private _enqueueUpdate;
    /**
     * Gets the {@link PropertyDeclaration} for a decorated property
     *
     * @param propertyKey The property key for which to retrieve the declaration
     *
     * @internal
     * @private
     */
    private _getPropertyDeclaration;
}
export {};
//# sourceMappingURL=custom-element.d.ts.map