import { render, TemplateResult } from 'lit-html';
import { AttributeReflector, isAttributeReflector, isPropertyChangeDetector, isPropertyKey, isPropertyNotifier, isPropertyReflector, ListenerDeclaration, PropertyDeclaration, PropertyNotifier, PropertyReflector, SelectorDeclaration } from './decorators/index.js';
import { LifecycleEvent, PropertyChangeEvent } from './events.js';

/**
 * @internal
 */
const ATTRIBUTE_REFLECTOR_ERROR = (attributeReflector: PropertyKey | Function) => new Error(`Error executing attribute reflector ${ String(attributeReflector) }.`);
/**
 * @internal
 */
const PROPERTY_REFLECTOR_ERROR = (propertyReflector: PropertyKey | Function) => new Error(`Error executing property reflector ${ String(propertyReflector) }.`);
/**
 * @internal
 */
const PROPERTY_NOTIFIER_ERROR = (propertyNotifier: PropertyKey | Function) => new Error(`Error executing property notifier ${ String(propertyNotifier) }.`);
/**
 * @internal
 */
const CHANGE_DETECTOR_ERROR = (changeDetector: PropertyKey | Function) => new Error(`Error executing property change detector ${ String(changeDetector) }.`);

/**
 * Extends the static {@link ListenerDeclaration} to include the bound listener
 * for a component instance.
 *
 * @internal
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
 * A type for property changes, as used in {@link updateCallback}
 */
// TODO: check if we can use different signature
// type Changes<C extends Component = Component> = Map<keyof C, any>
export type Changes = Map<PropertyKey, any>;

/**
 * The component base class
 */
export abstract class Component extends HTMLElement {

    /**
     * The component's cached {@link CSSStyleSheet} instance
     *
     * @internal
     * @private
     */
    private static _styleSheet: CSSStyleSheet | undefined;

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
    private static get styleSheet (): CSSStyleSheet | undefined {

        if (this.styles.length && !this.hasOwnProperty('_styleSheet')) {

            try {

                // create a style sheet and cache it in the constructor
                // this will work once constructable stylesheets arrive
                // https://wicg.github.io/construct-stylesheets/
                this._styleSheet = new CSSStyleSheet();
                this._styleSheet.replaceSync(this.styles.join('\n'));

            } catch (error) { }
        }

        return this._styleSheet;
    }

    /**
     * The component's cached {@link HTMLStyleElement} instance
     *
     * @internal
     * @private
     */
    private static _styleElement: HTMLStyleElement | undefined;

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
    private static get styleElement (): HTMLStyleElement | undefined {

        if (this.styles.length && !this.hasOwnProperty('_styleElement')) {

            this._styleElement = document.createElement('style');
            this._styleElement.title = this.selector;
            this._styleElement.textContent = this.styles.join('\n');
        }

        return this._styleElement;
    }

    /**
     * A map of attribute names and their respective property keys
     *
     * @remarks
     * This map is populated by the {@link property} decorator and can be used to obtain the
     * property key that belongs to an attribute name.
     *
     * @internal
     */
    static attributes: Map<string, PropertyKey> = new Map();

    /**
     * A map of property keys and their respective property declarations
     *
     * @remarks
     * This map is populated by the {@link property} decorator and can be used to obtain the
     * {@link PropertyDeclaration} of a property.
     *
     * @internal
     */
    static properties: Map<PropertyKey, PropertyDeclaration> = new Map();

    /**
     * A map of property keys and their respective listener declarations
     *
     * @remarks
     * This map is populated by the {@link listener} decorator and can be used to obtain the
     * {@link ListenerDeclaration} of a method.
     *
     * @internal
     */
    static listeners: Map<PropertyKey, ListenerDeclaration> = new Map();

    /**
     * A map of property keys and their respective selector declarations
     *
     * @remarks
     * This map is populated by the {@link selector} decorator and can be used to obtain the
     * {@link SelectorDeclaration} of a property.
     *
     * @internal
     */
    static selectors: Map<PropertyKey, SelectorDeclaration> = new Map();

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

    // TODO: create tests for style inheritance
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
    static get styles (): string[] {

        return [];
    }

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
     *          return [
     *              ...super.observedAttributes,
     *              'my-additional-attribute'
     *          ];
     *      }
     * }
     * ```
     */
    static get observedAttributes (): string[] {

        return [];
    }

    /**
     * @internal
     * @private
     */
    private _updateRequest: Promise<boolean> = Promise.resolve(true);

    /**
     * @internal
     * @private
     */
    private _changedProperties: Map<PropertyKey, any> = new Map();

    /**
     * @internal
     * @private
     */
    private _reflectingProperties: Map<PropertyKey, any> = new Map();

    /**
     * @internal
     * @private
     */
    private _notifyingProperties: Map<PropertyKey, any> = new Map();

    /**
     * @internal
     * @private
     */
    private _listenerDeclarations: InstanceListenerDeclaration[] = [];

    /**
     * @internal
     * @private
     */
    private _hasUpdated = false;

    /**
     * @internal
     * @private
     */
    private _hasRequestedUpdate = false;

    /**
     * @internal
     * @private
     */
    private _isReflecting = false;

    /**
     * The render root is where the {@link render} method will attach its DOM output
     */
    readonly renderRoot: Element | DocumentFragment;

    /**
     * The component constructor
     */
    constructor (...args: any[]) {

        super();

        this.renderRoot = this._createRenderRoot();
    }

    /**
     * Invoked each time the component is moved to a new document
     *
     * @remarks
     * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
     *
     * N.B.: When overriding this callback, make sure to include a super-call.
     */
    adoptedCallback () {

        this._notifyLifecycle('adopted');
    }

    /**
     * Invoked each time the component is appended into a document-connected element
     *
     * @remarks
     * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
     *
     * N.B.: When overriding this callback, make sure to include a super-call.
     */
    connectedCallback () {

        this.requestUpdate();

        this._notifyLifecycle('connected');
    }

    /**
     * Invoked each time the component is disconnected from the document's DOM
     *
     * @remarks
     * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
     *
     * N.B.: When overriding this callback, make sure to include a super-call.
     */
    disconnectedCallback () {

        this._unlisten();

        this._unselect();

        this._notifyLifecycle('disconnected');

        this._hasUpdated = false;
    }

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
    attributeChangedCallback (attribute: string, oldValue: string | null, newValue: string | null) {

        if (this._isReflecting || oldValue === newValue) return;

        this.reflectAttribute(attribute, oldValue, newValue);
    }

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
    updateCallback (changes: Changes, firstUpdate: boolean) { }

    /**
     * Dispatch a custom event
     *
     * @remarks
     * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
     *
     * @param eventName An event name
     * @param eventInit A {@link CustomEventInit} dictionary
     */
    protected notify (eventName: string, eventInit?: CustomEventInit) {

        // TODO: improve this! we should pull the dispatch method from example into ./events
        // and use it here; we should change notify() arguments to type, detail, init
        // maybe we should even rename it to dispatch...
        this.dispatchEvent(new CustomEvent(eventName, eventInit));
    }

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
    protected watch (executor: () => void) {

        // back up current changed properties
        const previousChanges = new Map(this._changedProperties);

        // execute the changes
        executor();

        // add all new or updated changed properties to the notifying properties
        for (const [propertyKey, oldValue] of this._changedProperties) {

            const added = !previousChanges.has(propertyKey);
            const updated = !added && this.hasChanged(propertyKey, previousChanges.get(propertyKey), oldValue);

            if (added || updated) {

                this._notifyingProperties.set(propertyKey, oldValue);
            }
        }
    }

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
    protected requestUpdate (propertyKey?: PropertyKey, oldValue?: any, newValue?: any): Promise<boolean> {

        if (propertyKey) {

            // if the {@link PropertyDeclaration}'s observe option is `false`, {@link hasChanged}
            // will return `false` and no update will be requested
            if (!this.hasChanged(propertyKey, oldValue, newValue)) return this._updateRequest;

            // store changed property for batch processing
            this._changedProperties.set(propertyKey, oldValue);

            // if we are in reflecting state, an attribute is reflecting to this property and we
            // can skip reflecting the property back to the attribute
            // property changes need to be tracked however and {@link render} must be called after
            // the attribute change is reflected to this property
            if (!this._isReflecting) this._reflectingProperties.set(propertyKey, oldValue);
        }

        if (!this._hasRequestedUpdate) {

            // enqueue update request if none was enqueued already
            this._enqueueUpdate();
        }

        return this._updateRequest;
    }

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
    protected render (...helpers: any[]) {

        const constructor = this.constructor as typeof Component;

        const template = constructor.template && constructor.template(this, ...helpers);

        if (template) render(template, this.renderRoot, { eventContext: this });
    }

    /**
     * Updates the component after an update was requested with {@link requestUpdate}
     *
     * @remarks
     * This method renders the template, reflects changed properties to attributes and
     * dispatches change events for properties which are marked for notification.
     * To handle updates differently, this method can be overridden.
     *
     * @param changes       A map of properties that changed in the update, containg the property key and the old value
     * @param reflections   A map of properties that were marked for reflection in the update, containg the property key and the old value
     * @param notifications A map of properties that were marked for notification in the update, containg the property key and the old value
     * @param firstUpdate   A boolean indicating if this is the first update of the component
     */
    protected update (changes: Changes, reflections: Changes, notifications: Changes, firstUpdate: boolean = false) {

        this.render();

        // in the first update we adopt the element's styles and set up declared listeners
        if (firstUpdate) {

            this._style();
            this._select();
            // bind listeners after render to ensure all DOM is rendered, all properties
            // are up-to-date and any user-created objects (e.g. workers) will be created in an
            // overridden connectedCallback; but before dispatching any property-change events
            // to make sure local listeners are bound first
            this._listen();

        } else {

            this._select();

            // TODO: can we check if selected nodes changed and if listeners are affected?
        }

        this.reflectProperties(reflections);
        this.notifyProperties(notifications);
    }

    /**
     * Resets the component after an update
     *
     * @description
     * Resets the component's property tracking maps which are used in the update cycle to track changes.
     */
    protected reset () {

        this._changedProperties = new Map();
        this._reflectingProperties = new Map();
        this._notifyingProperties = new Map();
    }

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
    protected hasChanged (propertyKey: PropertyKey, oldValue: any, newValue: any): boolean {

        const propertyDeclaration = this.getPropertyDeclaration(propertyKey);

        // observe is either `false` or a {@link PropertyChangeDetector}
        if (propertyDeclaration && isPropertyChangeDetector(propertyDeclaration.observe)) {

            try {
                return propertyDeclaration.observe.call(null, oldValue, newValue);

            } catch (error) {

                throw CHANGE_DETECTOR_ERROR(propertyDeclaration.observe);
            }
        }

        return false;
    }

    /**
     * Gets the {@link PropertyDeclaration} for a decorated property
     *
     * @param propertyKey The property key for which to retrieve the declaration
     */
    protected getPropertyDeclaration (propertyKey: PropertyKey): PropertyDeclaration | undefined {

        return (this.constructor as typeof Component).properties.get(propertyKey);
    }

    protected reflectProperties (properties?: Map<PropertyKey, any>) {

        properties = properties ?? this._reflectingProperties as Map<keyof this, any>;

        properties.forEach((oldValue, propertyKey) => {

            this.reflectProperty(propertyKey, oldValue, this[propertyKey as keyof this]);
        });
    }

    protected notifyProperties (properties?: Map<PropertyKey, any>) {

        properties = properties ?? this._notifyingProperties as Map<keyof this, any>;

        properties.forEach((oldValue, propertyKey) => {

            this.notifyProperty(propertyKey, oldValue, this[propertyKey as keyof this]);
        });
    }

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
    protected reflectAttribute (attributeName: string, oldValue: string | null, newValue: string | null) {

        const constructor = this.constructor as typeof Component;

        const propertyKey = constructor.attributes.get(attributeName);

        // ignore user-defined observed attributes
        // TODO: test this and remove the log
        if (!propertyKey) {

            console.log(`observed attribute "${ attributeName }" not found... ignoring...`);

            return;
        }

        const propertyDeclaration = this.getPropertyDeclaration(propertyKey)!;

        // don't reflect if {@link PropertyDeclaration.reflectAttribute} is false
        if (propertyDeclaration.reflectAttribute) {

            this._isReflecting = true;

            if (isAttributeReflector(propertyDeclaration.reflectAttribute)) {

                try {
                    propertyDeclaration.reflectAttribute.call(this, attributeName, oldValue, newValue);

                } catch (error) {

                    throw ATTRIBUTE_REFLECTOR_ERROR(propertyDeclaration.reflectAttribute);
                }

            } else if (isPropertyKey(propertyDeclaration.reflectAttribute)) {

                try {
                    (this[propertyDeclaration.reflectAttribute] as AttributeReflector)(attributeName, oldValue, newValue);

                } catch (error) {

                    throw ATTRIBUTE_REFLECTOR_ERROR(propertyDeclaration.reflectAttribute);
                }

            } else {

                this._reflectAttribute(attributeName, oldValue, newValue);
            }

            this._isReflecting = false;
        }
    }

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
    protected reflectProperty (propertyKey: PropertyKey, oldValue: any, newValue: any) {

        const propertyDeclaration = this.getPropertyDeclaration(propertyKey);

        // don't reflect if {@link propertyDeclaration.reflectProperty} is false
        if (propertyDeclaration && propertyDeclaration.reflectProperty) {

            // attributeChangedCallback is called synchronously, we can catch the state there
            this._isReflecting = true;

            if (isPropertyReflector(propertyDeclaration.reflectProperty)) {

                try {
                    propertyDeclaration.reflectProperty.call(this, propertyKey, oldValue, newValue);

                } catch (error) {

                    throw PROPERTY_REFLECTOR_ERROR(propertyDeclaration.reflectProperty);
                }

            } else if (isPropertyKey(propertyDeclaration.reflectProperty)) {

                try {
                    (this[propertyDeclaration.reflectProperty] as PropertyReflector)(propertyKey, oldValue, newValue);

                } catch (error) {

                    throw PROPERTY_REFLECTOR_ERROR(propertyDeclaration.reflectProperty);
                }

            } else {

                this._reflectProperty(propertyKey, oldValue, newValue);
            }

            this._isReflecting = false;
        }
    }

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
    protected notifyProperty (propertyKey: PropertyKey, oldValue: any, newValue: any) {

        const propertyDeclaration = this.getPropertyDeclaration(propertyKey);

        if (propertyDeclaration && propertyDeclaration.notify) {

            if (isPropertyNotifier(propertyDeclaration.notify)) {

                try {
                    propertyDeclaration.notify.call(this, propertyKey, oldValue, newValue);

                } catch (error) {

                    throw PROPERTY_NOTIFIER_ERROR(propertyDeclaration.notify.toString());
                }

            } else if (isPropertyKey(propertyDeclaration.notify)) {

                try {
                    (this[propertyDeclaration.notify] as PropertyNotifier)(propertyKey, oldValue, newValue);

                } catch (error) {

                    throw PROPERTY_NOTIFIER_ERROR(propertyDeclaration.notify);
                }

            } else {

                this._notifyProperty(propertyKey, oldValue, newValue);
            }
        }
    }

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
    private _createRenderRoot (): Element | DocumentFragment {

        return (this.constructor as typeof Component).shadow
            ? this.attachShadow({ mode: 'open' })
            : this;
    }

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
    private _style () {

        const constructor = this.constructor as typeof Component;
        const styleSheet = constructor.styleSheet;
        const styleElement = constructor.styleElement;
        const styles = constructor.styles;

        if (styleSheet) {

            // TODO: test this part once we have constructable stylesheets (Chrome 73)
            if (!constructor.shadow) {

                if ((document as DocumentOrShadowRoot).adoptedStyleSheets.includes(styleSheet)) return;

                (document as DocumentOrShadowRoot).adoptedStyleSheets = [
                    ...(document as DocumentOrShadowRoot).adoptedStyleSheets,
                    styleSheet
                ];

            } else {

                // this will work once constructable stylesheets arrive
                // https://wicg.github.io/construct-stylesheets/
                (this.renderRoot as ShadowRoot).adoptedStyleSheets = [styleSheet];
            }

        } else if (styleElement) {

            // TODO: test we don't duplicate stylesheets for non-shadow elements
            const styleAlreadyAdded = constructor.shadow
                ? false
                : Array.from(document.styleSheets).find(style => style.title === constructor.selector) && true || false;

            if (styleAlreadyAdded) return;

            // clone the cached style element
            const style = styleElement.cloneNode(true);

            if (constructor.shadow) {

                this.renderRoot.appendChild(style);

            } else {

                document.head.appendChild(style);
            }
        }
    }

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
    private _reflectAttribute (attributeName: string, oldValue: string | null, newValue: string | null) {

        const constructor = this.constructor as typeof Component;

        const propertyKey = constructor.attributes.get(attributeName)!;

        const propertyDeclaration = this.getPropertyDeclaration(propertyKey)!;

        const propertyValue = propertyDeclaration.converter.fromAttribute.call(this, newValue);

        this[propertyKey as keyof this] = propertyValue;
    }

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
    private _reflectProperty (propertyKey: PropertyKey, oldValue: any, newValue: any) {

        // this function is only called for properties which have a declaration
        const propertyDeclaration = this.getPropertyDeclaration(propertyKey)!;

        // if the default reflector is used, we need to check if an attribute for this property exists
        // if not, we won't reflect
        if (!propertyDeclaration.attribute) return;

        // if attribute is truthy, it's a string
        const attributeName = propertyDeclaration.attribute as string;

        // resolve the attribute value
        const attributeValue = propertyDeclaration.converter.toAttribute.call(this, newValue);

        // undefined means don't change
        if (attributeValue === undefined) {

            return;
        }
        // null means remove the attribute
        else if (attributeValue === null) {

            this.removeAttribute(attributeName);

        } else {

            this.setAttribute(attributeName, attributeValue);
        }
    }

    /**
     * Dispatch a {@link PropertyChangeEvent}
     *
     * @param propertyKey
     * @param oldValue
     * @param newValue
     *
     * @internal
     * @private
     */
    private _notifyProperty<T = any> (propertyKey: PropertyKey, oldValue: T, newValue: T): void {

        const event = new PropertyChangeEvent(propertyKey, {
            target: this,
            property: propertyKey.toString(),
            previous: oldValue,
            current: newValue,
        });

        this.dispatchEvent(event);
    }

    /**
     * Dispatch a {@link LifecycleEvent}
     *
     * @param lifecycle The lifecycle for which to raise the event (will be the event name)
     * @param detail    Optional event details
     *
     * @internal
     * @private
     */
    private _notifyLifecycle (lifecycle: 'adopted' | 'connected' | 'disconnected' | 'update', detail: object = {}) {

        const event = new LifecycleEvent(lifecycle, {
            target: this,
            ...detail,
        });

        this.dispatchEvent(event);
    }

    /**
     * Bind component listeners
     *
     * @internal
     * @private
     */
    private _listen () {

        (this.constructor as typeof Component).listeners.forEach((declaration, listener) => {

            const instanceDeclaration: InstanceListenerDeclaration = {

                // copy the class's static listener declaration into an instance listener declaration
                event: declaration.event,
                options: declaration.options,

                // bind the components listener method to the component instance and store it in the instance declaration
                listener: (this[listener as keyof this] as unknown as EventListener).bind(this),

                // determine the event target and store it in the instance declaration
                target: (declaration.target)
                    ? (typeof declaration.target === 'function')
                        ? declaration.target.call(this)
                        : declaration.target
                    : this
            };

            // add the bound event listener to the target
            instanceDeclaration.target.addEventListener(
                instanceDeclaration.event!,
                instanceDeclaration.listener,
                instanceDeclaration.options);

            // save the instance listener declaration in the component instance
            this._listenerDeclarations.push(instanceDeclaration);
        });
    }

    /**
     * Unbind component listeners
     *
     * @internal
     * @private
     */
    private _unlisten () {

        this._listenerDeclarations.forEach((declaration) => {

            declaration.target.removeEventListener(
                declaration.event!,
                declaration.listener,
                declaration.options);
        });
    }

    // TODO: Document this
    private _select () {

        (this.constructor as typeof Component).selectors.forEach((declaration, property) => {

            const element = declaration.all
                ? this.renderRoot.querySelectorAll(declaration.query!)
                : this.renderRoot.querySelector(declaration.query!);

            this[property as keyof this] = element as any;
        })
    }

    private _unselect () {

        (this.constructor as typeof Component).selectors.forEach((declaration, property) => {

            this[property as keyof this] = null as any;
        })
    }

    /**
     * Enqueue a request for an asynchronous update
     *
     * @internal
     * @private
     */
    private async _enqueueUpdate () {

        let resolve: (result: boolean) => void;

        const previousRequest = this._updateRequest;

        // mark the component as having requested an update, the {@link _requestUpdate}
        // method will not enqueue a further request for update if one is scheduled
        this._hasRequestedUpdate = true;

        this._updateRequest = new Promise<boolean>(res => resolve = res);

        // wait for the previous update to resolve
        // `await` is asynchronous and will return execution to the {@link requestUpdate} method
        // and essentially allows us to batch multiple synchronous property changes, before the
        // execution can resume here
        await previousRequest;

        // ask the scheduler for a new update
        const update = this._scheduleUpdate();

        // the actual update may be scheduled asynchronously as well, in which case we wait for it
        if (update) await update;

        // mark component as updated *after* the update to prevent infinte loops in the update process
        // N.B.: any property changes during the update will not trigger another update
        this._hasRequestedUpdate = false;

        // resolve the new {@link _updateRequest} after the result of the current update resolves
        resolve!(!this._hasRequestedUpdate);
    }

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
    private _scheduleUpdate (): Promise<void> | void {

        if (!this._hasUpdated) {

            this._performUpdate();

        } else {

            // schedule the update via requestAnimationFrame to avoid multiple redraws per frame
            return new Promise(resolve => requestAnimationFrame(() => {

                this._performUpdate();

                resolve();
            }));
        }
    }

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
    private _performUpdate () {

        // we have to wait until the component is connected before we can do any updates
        // the {@link connectedCallback} will call {@link requestUpdate} in any case, so we can
        // simply bypass any actual update and clean-up until then
        if (this.isConnected) {

            const changes = new Map(this._changedProperties);
            const reflections = new Map(this._reflectingProperties);
            const notifications = new Map(this._notifyingProperties);

            // pass a copy of the property changes to the update method, so property changes
            // are available in an overridden update method
            this.update(changes, reflections, notifications, !this._hasUpdated);

            // reset property maps directly after the update, so changes during the updateCallback
            // can be recorded for the next update, which has to be triggered manually though
            this.reset();

            this.updateCallback(changes, !this._hasUpdated);

            this._notifyLifecycle('update', { changes: changes, firstUpdate: !this._hasUpdated });

            this._hasUpdated = true;
        }
    }
}
