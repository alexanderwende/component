import { TemplateResult } from 'lit-html';
import { ListenerDeclaration } from './decorators/listener';
import { PropertyDeclaration } from "./decorators/property-declaration";
/**
 * A type for property changes, as used in ${@link Component.updateCallback}
 */
export declare type Changes = Map<PropertyKey, any>;
/**
 * The component base class
 */
export declare abstract class Component extends HTMLElement {
    /**
     * The component's cached {@link CSSStyleSheet} instance
     *
     * @internal
     * @private
     */
    private static _styleSheet;
    /**
     * The component's {@link CSSStyleSheet}
     *
     * @remarks
     * When constructable stylesheets are available, this getter will create a {@link CSSStyleSheet}
     * instance and cache it for use with each instance of the component.
     *
     * @internal
     * @private
     */
    private static readonly styleSheet;
    /**
     * The component's cached {@link HTMLStyleElement} instance
     *
     * @internal
     * @private
     */
    private static _styleElement;
    /**
     * The component's {@link HTMLStyleElement}
     *
     * @remarks
     * This getter will create a {@link HTMLStyleElement} node and cache it for use with each
     * instance of the component.
     *
     * @internal
     * @private
     */
    private static readonly styleElement;
    /**
     * A map of attribute names and their respective property keys
     *
     * @remarks
     * This map is populated by the {@link property} decorator and can be used to obtain the
     * property key that belongs to an attribute name.
     *
     * @internal
     */
    static attributes: Map<string, PropertyKey>;
    /**
     * A map of property keys and their respective property declarations
     *
     * @remarks
     * This map is populated by the {@link property} decorator and can be used to obtain the
     * {@link PropertyDeclaration} of a property.
     *
     * @internal
     */
    static properties: Map<PropertyKey, PropertyDeclaration>;
    /**
     * A map of property keys and their respective listener declarations
     *
     * @remarks
     * This map is populated by the {@link property} decorator and can be used to obtain the
     * {@link ListenerDeclaration} of a method.
     *
     * @internal
     */
    static listeners: Map<PropertyKey, ListenerDeclaration>;
    /**
     * The component's selector
     *
     * @remarks
     * Will be overridden by the {@link component} decorator's `selector` option, if provided.
     * Otherwise the decorator will use this property to define the component.
     */
    static selector: string;
    /**
     * Use Shadow DOM
     *
     * @remarks
     * Will be set by the {@link component} decorator's `shadow` option (defaults to `true`).
     */
    static shadow: boolean;
    /**
     * The component's styles
     *
     * @remarks
     * Can be set through the {@link component} decorator's `styles` option (defaults to `undefined`).
     * Styles set in the {@link component} decorator will be merged with the class's static property.
     * This allows to inherit styles from a parent component and add additional styles on the child component.
     * In order to inherit styles from a parent component, an explicit super call has to be included. By
     * default no styles are inherited.
     *
     * ```typescript
     * @component({
     *      selector: 'my-element'
     * })
     * class MyElement extends MyBaseElement {
     *
     *      static get styles (): string[] {
     *
     *          return [
     *              ...super.styles,
     *              ':host { background-color: green; }'
     *          ];
     *      }
     * }
     * ```
     */
    static readonly styles: string[];
    /**
     * The component's template
     *
     * @remarks
     * Can be set through the {@link component} decorator's `template` option (defaults to `undefined`).
     * If set in the {@link component} decorator, it will have precedence over the class's static property.
     *
     * @param element   The component instance
     * @param helpers   Any additional properties which should exist in the template scope
     */
    static template?: (element: any, ...helpers: any[]) => TemplateResult | void;
    /**
     * Override to specify attributes which should be observed, but don't have an associated property
     *
     * @remark
     * For properties which are decorated with the {@link property} decorator, an observed attribute
     * is automatically created and does not need to be specified here. Fot attributes that don't
     * have an associated property, return the attribute names in this getter. Changes to these
     * attributes can be handled in the {@link attributeChangedCallback} method.
     *
     * When extending components, make sure to return the super class's observedAttributes
     * if you override this getter (except if you don't want to inherit observed attributes):
     *
     * ```typescript
     * @component({
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
    /**
     * @internal
     * @private
     */
    private _updateRequest;
    /**
     * @internal
     * @private
     */
    private _changedProperties;
    /**
     * @internal
     * @private
     */
    private _reflectingProperties;
    /**
     * @internal
     * @private
     */
    private _notifyingProperties;
    /**
     * @internal
     * @private
     */
    private _listenerDeclarations;
    /**
     * @internal
     * @private
     */
    private _hasUpdated;
    /**
     * @internal
     * @private
     */
    private _hasRequestedUpdate;
    /**
     * @internal
     * @private
     */
    private _isReflecting;
    /**
     * The render root is where the {@link render} method will attach its DOM output
     */
    readonly renderRoot: Element | DocumentFragment;
    /**
     * The component constructor
     */
    constructor();
    /**
     * Invoked each time the component is moved to a new document
     *
     * @remarks
     * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
     *
     * N.B.: When overriding this callback, make sure to include a super-call.
     */
    adoptedCallback(): void;
    /**
     * Invoked each time the component is appended into a document-connected element
     *
     * @remarks
     * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
     *
     * N.B.: When overriding this callback, make sure to include a super-call.
     */
    connectedCallback(): void;
    /**
     * Invoked each time the component is disconnected from the document's DOM
     *
     * @remarks
     * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
     *
     * N.B.: When overriding this callback, make sure to include a super-call.
     */
    disconnectedCallback(): void;
    /**
     * Invoked each time one of the component's attributes is added, removed, or changed
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
     * @component({
     *      selector: 'my-element'
     * })
     * class MyElement extends Component {
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
     * Invoked each time the component updates
     *
     * @remarks
     * The `updateCallback` is invoked synchronously by the {@link update} method and therefore happens directly after
     * rendering, property reflection and property change events.
     *
     * N.B.: Changes made to properties or attributes inside this callback *won't* cause another update.
     * To cause an update, defer changes with the help of a Promise.
     *
     * ```typescript
     * @component({
     *      selector: 'my-element'
     * })
     * class MyElement extends Component {
     *
     *      updateCallback (changes: Changes, firstUpdate: boolean) {
     *
     *          Promise.resolve().then(() => {
     *              // perform changes which need to cause another update here
     *          });
     *      }
     * }
     * ```
     *
     * @param changes       A map of properties that changed in the update, containg the property key and the old value
     * @param firstUpdate   A boolean indicating if this was the first update
     */
    updateCallback(changes: Changes, firstUpdate: boolean): void;
    /**
     * Dispatch a custom event
     *
     * @remarks
     * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
     *
     * @param eventName An event name
     * @param eventInit A {@link CustomEventInit} dictionary
     */
    protected notify(eventName: string, eventInit?: CustomEventInit): void;
    /**
     * Watch property changes occurring in the executor and raise custom events
     *
     * @remarks
     * Property changes should trigger custom events when they are caused by internal state changes,
     * but not if they are caused by a consumer of the component API directly, e.g.:
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
     * Request an update of the component
     *
     * @remarks
     * This method is called automatically when the value of a decorated property or its associated
     * attribute changes. If you need the component to update based on a state change that is
     * not covered by a decorated property, call this method without any arguments.
     *
     * @param propertyKey   The name of the changed property that requests the update
     * @param oldValue      The old property value
     * @param newValue      the new property value
     * @returns             A Promise which is resolved when the update is completed
     */
    protected requestUpdate(propertyKey?: PropertyKey, oldValue?: any, newValue?: any): Promise<boolean>;
    /**
     * Renders the component's template to its {@link renderRoot}
     *
     * @remarks
     * Uses lit-html's {@link lit-html#render} method to render a {@link lit-html#TemplateResult} to the
     * component's render root. The component instance will be passed to the static template method
     * automatically. To make additional properties available to the template method, you can pass them to the
     * render method.
     *
     * ```typescript
     * const dateFormatter = (date: Date) => { // return some date transformation...
     * };
     *
     * @component({
     *      selector: 'my-element',
     *      template: (element, formatDate) => html`<span>Last updated: ${ formatDate(element.lastUpdated) }</span>`
     * })
     * class MyElement extends Component {
     *
     *      @property()
     *      lastUpdated: Date;
     *
     *      render () {
     *          // make the date formatter available in the template by passing it to render()
     *          super.render(dateFormatter);
     *      }
     * }
     * ```
     *
     * @param helpers   Any additional objects which should be available in the template scope
     */
    protected render(...helpers: any[]): void;
    /**
     * Updates the component after an update was requested with {@link requestUpdate}
     *
     * @remarks
     * This method renders the template, reflects changed properties to attributes and
     * dispatches change events for properties which are marked for notification.
     * To handle updates differently, this method can be overridden and a map of property
     * changes is provided.
     *
     * @param changes   A map of properties that changed in the update, containg the property key and the old value
     */
    protected update(changes?: Changes): void;
    /**
     * Check if a property changed
     *
     * @remarks
     * This method resolves the {@link PropertyChangeDetector} for the property and returns its result.
     * If none is defined (the property declaration's `observe` option is `false`) it returns false.
     * It catches any error in custom {@link PropertyChangeDetector}s and throws a more helpful one.
     *
     * @param propertyKey   The key of the property to check
     * @param oldValue      The old property value
     * @param newValue      The new property value
     * @returns             `true` if the property changed, `false` otherwise
     */
    protected hasChanged(propertyKey: PropertyKey, oldValue: any, newValue: any): boolean;
    /**
     * Gets the {@link PropertyDeclaration} for a decorated property
     *
     * @param propertyKey The property key for which to retrieve the declaration
     */
    protected getPropertyDeclaration(propertyKey: PropertyKey): PropertyDeclaration | undefined;
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
     * Creates the component's render root
     *
     * @remarks
     * The render root is where the {@link render} method will attach its DOM output. When using the component
     * with shadow mode, it will be a {@link ShadowRoot}, otherwise it will be the component itself.
     *
     * @internal
     * @private
     */
    private _createRenderRoot;
    /**
     * Adds the component's styles to its {@link renderRoot}
     *
     * @remarks
     * If constructable stylesheets are available, the component's {@link CSSStyleSheet} instance will be adopted
     * by the {@link ShadowRoot}. If not, a style element is created and attached to the {@link ShadowRoot}. If the
     * component is not using shadow mode, a script tag will be appended to the document's `<head>`. For multiple
     * instances of the same component only one stylesheet will be added to the document.
     *
     * @internal
     * @private
     */
    private _adoptStyles;
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
    private _reflectAttribute;
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
    private _reflectProperty;
    /**
     * Dispatch a property-changed event
     *
     * @param propertyKey
     * @param oldValue
     * @param newValue
     *
     * @internal
     * @private
     */
    private _notifyProperty;
    /**
     * Dispatch a lifecycle event
     *
     * @param lifecycle The lifecycle for which to raise the event (will be the event name)
     * @param detail    Optional event details
     *
     * @internal
     * @private
     */
    private _notifyLifecycle;
    /**
     * Bind component listeners
     *
     * @internal
     * @private
     */
    private _listen;
    /**
     * Unbind component listeners
     *
     * @internal
     * @private
     */
    private _unlisten;
    /**
     * Enqueue a request for an asynchronous update
     *
     * @internal
     * @private
     */
    private _enqueueUpdate;
    /**
     * Schedule the update of the component
     *
     * @remarks
     * Schedules the first update of the component as soon as possible and all consecutive updates
     * just before the next frame. In the latter case it returns a Promise which will be resolved after
     * the update is done.
     *
     * @internal
     * @private
     */
    private _scheduleUpdate;
    /**
     * Perform the component update
     *
     * @remarks
     * Invokes {@link updateCallback} after performing the update and cleans up the component
     * state. During the first update the element's styles will be added. Dispatches the update
     * lifecycle event.
     *
     * @internal
     * @private
     */
    private _performUpdate;
}
//# sourceMappingURL=component.d.ts.map