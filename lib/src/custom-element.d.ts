import { TemplateResult } from 'lit-html';
import { ListenerDeclaration } from './decorators/listener';
import { PropertyDeclaration } from "./decorators/property-declaration";
/**
 * Extends the static {@link ListenerDeclaration} to include the bound listener
 * for a custom element instance.
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
/**
 * The custom element base class
 */
export declare abstract class CustomElement extends HTMLElement {
    /**
     * The custom element's selector
     *
     * @remarks
     * Will be overridden by the {@link customElement} decorator's selector option, if provided.
     * Otherwise the decorator will use this property to define the custom element.
     */
    static selector: string;
    /**
     * Use Shadow DOM
     *
     * @remarks
     * Will be set by the {@link customElement} decorator's shadow option (defaults to `true`).
     */
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
     * When extending custom elements, make sure to return the super class's observedAttributes
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
    protected _hasUpdated: boolean;
    protected _hasRequestedUpdate: boolean;
    protected _isReflecting: boolean;
    /**
     * The custom element constructor
     */
    constructor();
    /**
     * Invoked each time the custom element is moved to a new document
     *
     * @remarks
     * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
     */
    adoptedCallback(): void;
    /**
     * Invoked each time the custom element is appended into a document-connected element
     *
     * @remarks
     * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
     */
    connectedCallback(): void;
    /**
     * Invoked each time the custom element is disconnected from the document's DOM
     *
     * @remarks
     * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
     */
    disconnectedCallback(): void;
    /**
     * Invoked each time one of the custom element's attributes is added, removed, or changed
     *
     * @remarks
     * Which attributes to notice change for is specified in {@link observedAttributes}.
     * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
     *
     * For decorated properties with an associated attribute, this is handled automatically.
     *
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
    attributeChangedCallback(attribute: string, oldValue: string | null, newValue: string | null): void;
    /**
     * Invoked each time the custom element updates
     *
     * @remarks
     * The updateCallback is invoked synchronously from the {@link update} method and therefore happens directly after
     * rendering, property reflection and property change events inside a {@link requestAnimationFrame}. It is safe to
     * use this callback to set additional attributes or styles on the rendered component that can't be achieved through
     * template bindings or reflection.
     *
     * @param changedProperties A map of properties that changed in the update, containg the property key and the old value
     * @param firstUpdate       A boolean indicating if this was the first update
     */
    updateCallback(changedProperties: Map<PropertyKey, any>, firstUpdate: boolean): void;
    /**
     * Creates the custom element's render root
     *
     * @remarks
     * The render root is where the {@link render} method will attach its DOM output.
     * When using the custom element with shadow mode, it will be a shadow root,
     * otherwise it will be the custom element itself.
     *
     * TODO: Can slots be used without shadow DOM?
     */
    protected createRenderRoot(): Element | DocumentFragment;
    /**
     * Returns the template of the custom element
     *
     * @remarks
     * Override this method to provide a template for your custom element. The method must
     * return a {@link lit-html#TemplateResult} which is created using lit-html's
     * {@link lit-html#html | `html`} or {@link lit-html#svg | `svg`} template methods.
     *
     * Return nothing if your component does not need to render a template.
     *
     * ```typescript
     * import { html } from 'lit-html';
     *
     * @customElement({
     *      selector: 'my-element'
     * })
     * class MyElement extends CustomElement {
     *
     *       myProperty = 'Hello';
     *
     *      template () {
     *
     *          html`<h1>${this.myProperty} World!</h1>`;
     *      }
     * }
     * ```
     */
    protected template(): TemplateResult | void;
    /**
     * Renders the custom element's template to its {@link _renderRoot}
     *
     * @remarks
     * Uses lit-html's {@link lit-html#render} method to render a {@link lit-html#TemplateResult}
     * to the custom element's render root.
     */
    protected render(): void;
    /**
     * Watch property changes occurring in the executor and raise custom events
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
     * this.watch(() => {
     *
     *      this.customProperty = true;
     *      // we can add more property modifications to notify in here
     * });
     * ```
     *
     * @param executor A function that performs the changes which should be notified
     */
    protected watch(executor: () => void): void;
    /**
     * Request an update of the custom element
     *
     * @remarks
     * This method is called automatically when the value of a decorated property or its associated
     * attribute changes. If you need the custom element to update based on a state change that is
     * not covered by a decorated property, call this method without any arguments.
     *
     * @param propertyKey   The name of the changed property that requests the update
     * @param oldValue      The old property value
     * @param newValue      the new property value
     * @returns             A Promise which is resolved when the update is completed
     */
    protected requestUpdate(propertyKey?: PropertyKey, oldValue?: any, newValue?: any): Promise<boolean>;
    /**
     * Updates the custom element after an update was requested with {@link requestUpdate}
     *
     * @remarks
     * This method renders the template, reflects changed properties to attributes and
     * dispatches change events for properties which are marked for notification.
     */
    protected update(): void;
    /**
     * Gets the {@link PropertyDeclaration} for a decorated property
     *
     * @param propertyKey The property key for which to retrieve the declaration
     */
    protected getPropertyDeclaration(propertyKey: PropertyKey): PropertyDeclaration | undefined;
    /**
     * Check if a property changed
     *
     * @remarks
     * This method resolves the {@link PropertyChangeDetector} for the property and returns its result.
     * If none is defined (the property declaration's observe option is `false`) it returns false.
     * It catches any error in custom {@link PropertyChangeDetector}s and throws a more helpful one.
     *
     * @param propertyKey   The key of the property to check
     * @param oldValue      The old property value
     * @param newValue      The new property value
     * @returns             `true` if the property changed, `false` otherwise
     */
    protected hasChanged(propertyKey: PropertyKey, oldValue: any, newValue: any): boolean;
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
    protected reflectAttribute(attributeName: string, oldValue: string | null, newValue: string | null): void;
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
    /**
     * Raise an event for a property change
     *
     * @remarks
     * This method checks, if any custom {@link PropertyNotifier} has been defined for the
     * property and invokes the appropriate notifier. If not, it will use the default
     * notifier {@link _notifyProperty}.
     *
     * It catches any error in custom {@link PropertyReflector}s and throws a more helpful one.
     *
     * @param propertyKey   The propert key of the property to raise an event for
     * @param oldValue      The old property value
     * @param newValue      The new property value
     */
    protected notifyProperty(propertyKey: PropertyKey, oldValue: any, newValue: any): void;
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
    protected _reflectAttribute(attributeName: string, oldValue: string | null, newValue: string | null): void;
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
     * Dispatch a property-changed event
     *
     * @param propertyKey
     * @param oldValue
     * @param newValue
     */
    protected _notifyProperty(propertyKey: PropertyKey, oldValue: any, newValue: any): void;
    /**
     * Dispatch a lifecycle event
     *
     * @param lifecycle The lifecycle for which to raise the event
     * @param detail    Optional event details
     */
    protected _notifyLifecycle(lifecycle: string, detail?: object): void;
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
     * Schedule the update of the custom element
     *
     * @remarks
     * Schedules the first update of the custom element as soon as possible and all consecutive updates
     * just before the next frame.
     */
    protected _scheduleUpdate(): Promise<void> | void;
    /**
     * Perform the custom element update
     *
     * @remarks
     * Invokes {@link updateCallback} after performing the update and cleans up the custom element
     * state.
     *
     * @private
     * @internal
     */
    private _performUpdate;
    /**
     * Enqueue a request for an asynchronous update
     *
     * @private
     * @internal
     */
    private _enqueueUpdate;
}
export {};
//# sourceMappingURL=custom-element.d.ts.map