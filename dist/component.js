import { render } from 'lit-html';
import { createEventName, isAttributeReflector, isPropertyChangeDetector, isPropertyKey, isPropertyNotifier, isPropertyReflector } from "./decorators/property-declaration";
/**
 * @internal
 */
const ATTRIBUTE_REFLECTOR_ERROR = (attributeReflector) => new Error(`Error executing attribute reflector ${String(attributeReflector)}.`);
/**
 * @internal
 */
const PROPERTY_REFLECTOR_ERROR = (propertyReflector) => new Error(`Error executing property reflector ${String(propertyReflector)}.`);
/**
 * @internal
 */
const PROPERTY_NOTIFIER_ERROR = (propertyNotifier) => new Error(`Error executing property notifier ${String(propertyNotifier)}.`);
/**
 * @internal
 */
const CHANGE_DETECTOR_ERROR = (changeDetector) => new Error(`Error executing property change detector ${String(changeDetector)}.`);
/**
 * The component base class
 */
export class Component extends HTMLElement {
    /**
     * The component constructor
     */
    constructor() {
        super();
        /**
         * @internal
         * @private
         */
        this._updateRequest = Promise.resolve(true);
        /**
         * @internal
         * @private
         */
        this._changedProperties = new Map();
        /**
         * @internal
         * @private
         */
        this._reflectingProperties = new Map();
        /**
         * @internal
         * @private
         */
        this._notifyingProperties = new Map();
        /**
         * @internal
         * @private
         */
        this._listenerDeclarations = [];
        /**
         * @internal
         * @private
         */
        this._hasUpdated = false;
        /**
         * @internal
         * @private
         */
        this._hasRequestedUpdate = false;
        /**
         * @internal
         * @private
         */
        this._isReflecting = false;
        this.renderRoot = this._createRenderRoot();
    }
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
    static get styleSheet() {
        if (this.styles.length && !this.hasOwnProperty('_styleSheet')) {
            try {
                // create a style sheet and cache it in the constructor
                // this will work once constructable stylesheets arrive
                // https://wicg.github.io/construct-stylesheets/
                this._styleSheet = new CSSStyleSheet();
                this._styleSheet.replaceSync(this.styles.join('\n'));
            }
            catch (error) { }
        }
        return this._styleSheet;
    }
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
    static get styleElement() {
        if (this.styles.length && !this.hasOwnProperty('_styleElement')) {
            this._styleElement = document.createElement('style');
            this._styleElement.title = this.selector;
            this._styleElement.textContent = this.styles.join('\n');
        }
        return this._styleElement;
    }
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
    static get styles() {
        return [];
    }
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
    static get observedAttributes() {
        return [];
    }
    /**
     * Invoked each time the component is moved to a new document
     *
     * @remarks
     * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
     *
     * N.B.: When overriding this callback, make sure to include a super-call.
     */
    adoptedCallback() {
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
    connectedCallback() {
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
    disconnectedCallback() {
        this._unlisten();
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
    attributeChangedCallback(attribute, oldValue, newValue) {
        if (this._isReflecting || oldValue === newValue)
            return;
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
    updateCallback(changes, firstUpdate) { }
    /**
     * Dispatch a custom event
     *
     * @remarks
     * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
     *
     * @param eventName An event name
     * @param eventInit A {@link CustomEventInit} dictionary
     */
    notify(eventName, eventInit) {
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
    watch(executor) {
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
    requestUpdate(propertyKey, oldValue, newValue) {
        if (propertyKey) {
            // if the {@link PropertyDeclaration}'s observe option is `false`, {@link hasChanged}
            // will return `false` and no update will be requested
            if (!this.hasChanged(propertyKey, oldValue, newValue))
                return this._updateRequest;
            // store changed property for batch processing
            this._changedProperties.set(propertyKey, oldValue);
            // if we are in reflecting state, an attribute is reflecting to this property and we
            // can skip reflecting the property back to the attribute
            // property changes need to be tracked however and {@link render} must be called after
            // the attribute change is reflected to this property
            if (!this._isReflecting)
                this._reflectingProperties.set(propertyKey, oldValue);
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
    render(...helpers) {
        const constructor = this.constructor;
        const template = constructor.template && constructor.template(this, ...helpers);
        if (template)
            render(template, this.renderRoot, { eventContext: this });
    }
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
    update(changes) {
        this.render();
        // reflect all properties marked for reflection
        this._reflectingProperties.forEach((oldValue, propertyKey) => {
            this.reflectProperty(propertyKey, oldValue, this[propertyKey]);
        });
        // notify all properties marked for notification
        this._notifyingProperties.forEach((oldValue, propertyKey) => {
            this.notifyProperty(propertyKey, oldValue, this[propertyKey]);
        });
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
    hasChanged(propertyKey, oldValue, newValue) {
        const propertyDeclaration = this.getPropertyDeclaration(propertyKey);
        // observe is either `false` or a {@link PropertyChangeDetector}
        if (propertyDeclaration && isPropertyChangeDetector(propertyDeclaration.observe)) {
            try {
                return propertyDeclaration.observe.call(null, oldValue, newValue);
            }
            catch (error) {
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
    getPropertyDeclaration(propertyKey) {
        return this.constructor.properties.get(propertyKey);
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
    reflectAttribute(attributeName, oldValue, newValue) {
        const constructor = this.constructor;
        const propertyKey = constructor.attributes.get(attributeName);
        // ignore user-defined observed attributes
        // TODO: test this and remove the log
        if (!propertyKey) {
            console.log(`observed attribute "${attributeName}" not found... ignoring...`);
            return;
        }
        const propertyDeclaration = this.getPropertyDeclaration(propertyKey);
        // don't reflect if {@link PropertyDeclaration.reflectAttribute} is false
        if (propertyDeclaration.reflectAttribute) {
            this._isReflecting = true;
            if (isAttributeReflector(propertyDeclaration.reflectAttribute)) {
                try {
                    propertyDeclaration.reflectAttribute.call(this, attributeName, oldValue, newValue);
                }
                catch (error) {
                    throw ATTRIBUTE_REFLECTOR_ERROR(propertyDeclaration.reflectAttribute);
                }
            }
            else if (isPropertyKey(propertyDeclaration.reflectAttribute)) {
                try {
                    this[propertyDeclaration.reflectAttribute](attributeName, oldValue, newValue);
                }
                catch (error) {
                    throw ATTRIBUTE_REFLECTOR_ERROR(propertyDeclaration.reflectAttribute);
                }
            }
            else {
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
    reflectProperty(propertyKey, oldValue, newValue) {
        const propertyDeclaration = this.getPropertyDeclaration(propertyKey);
        // don't reflect if {@link propertyDeclaration.reflectProperty} is false
        if (propertyDeclaration && propertyDeclaration.reflectProperty) {
            // attributeChangedCallback is called synchronously, we can catch the state there
            this._isReflecting = true;
            if (isPropertyReflector(propertyDeclaration.reflectProperty)) {
                try {
                    propertyDeclaration.reflectProperty.call(this, propertyKey, oldValue, newValue);
                }
                catch (error) {
                    throw PROPERTY_REFLECTOR_ERROR(propertyDeclaration.reflectProperty);
                }
            }
            else if (isPropertyKey(propertyDeclaration.reflectProperty)) {
                try {
                    this[propertyDeclaration.reflectProperty](propertyKey, oldValue, newValue);
                }
                catch (error) {
                    throw PROPERTY_REFLECTOR_ERROR(propertyDeclaration.reflectProperty);
                }
            }
            else {
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
    notifyProperty(propertyKey, oldValue, newValue) {
        const propertyDeclaration = this.getPropertyDeclaration(propertyKey);
        if (propertyDeclaration && propertyDeclaration.notify) {
            if (isPropertyNotifier(propertyDeclaration.notify)) {
                try {
                    propertyDeclaration.notify.call(this, propertyKey, oldValue, newValue);
                }
                catch (error) {
                    throw PROPERTY_NOTIFIER_ERROR(propertyDeclaration.notify.toString());
                }
            }
            else if (isPropertyKey(propertyDeclaration.notify)) {
                try {
                    this[propertyDeclaration.notify](propertyKey, oldValue, newValue);
                }
                catch (error) {
                    throw PROPERTY_NOTIFIER_ERROR(propertyDeclaration.notify);
                }
            }
            else {
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
    _createRenderRoot() {
        return this.constructor.shadow
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
    _adoptStyles() {
        const constructor = this.constructor;
        const styleSheet = constructor.styleSheet;
        const styleElement = constructor.styleElement;
        const styles = constructor.styles;
        if (styleSheet) {
            // TODO: test this part once we have constructable stylesheets (Chrome 73)
            if (!constructor.shadow) {
                if (document.adoptedStyleSheets.includes(styleSheet))
                    return;
                document.adoptedStyleSheets = [
                    ...document.adoptedStyleSheets,
                    styleSheet
                ];
            }
            else {
                // this will work once constructable stylesheets arrive
                // https://wicg.github.io/construct-stylesheets/
                this.renderRoot.adoptedStyleSheets = [styleSheet];
            }
        }
        else if (styleElement) {
            // TODO: test we don't duplicate stylesheets for non-shadow elements
            const styleAlreadyAdded = constructor.shadow
                ? false
                : Array.from(document.styleSheets).find(style => style.title === constructor.selector) && true || false;
            if (styleAlreadyAdded)
                return;
            // clone the cached style element
            const style = styleElement.cloneNode(true);
            if (constructor.shadow) {
                this.renderRoot.appendChild(style);
            }
            else {
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
    _reflectAttribute(attributeName, oldValue, newValue) {
        const constructor = this.constructor;
        const propertyKey = constructor.attributes.get(attributeName);
        const propertyDeclaration = this.getPropertyDeclaration(propertyKey);
        const propertyValue = propertyDeclaration.converter.fromAttribute(newValue);
        this[propertyKey] = propertyValue;
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
    _reflectProperty(propertyKey, oldValue, newValue) {
        // this function is only called for properties which have a declaration
        const propertyDeclaration = this.getPropertyDeclaration(propertyKey);
        // if the default reflector is used, we need to check if an attribute for this property exists
        // if not, we won't reflect
        if (!propertyDeclaration.attribute)
            return;
        // if attribute is truthy, it's a string
        const attributeName = propertyDeclaration.attribute;
        // resolve the attribute value
        const attributeValue = propertyDeclaration.converter.toAttribute(newValue);
        // undefined means don't change
        if (attributeValue === undefined) {
            return;
        }
        // null means remove the attribute
        else if (attributeValue === null) {
            this.removeAttribute(attributeName);
        }
        else {
            this.setAttribute(attributeName, attributeValue);
        }
    }
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
    _notifyProperty(propertyKey, oldValue, newValue) {
        const eventName = createEventName(propertyKey, '', 'changed');
        this.dispatchEvent(new CustomEvent(eventName, {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: {
                property: propertyKey,
                previous: oldValue,
                current: newValue,
            },
        }));
    }
    /**
     * Dispatch a lifecycle event
     *
     * @param lifecycle The lifecycle for which to raise the event (will be the event name)
     * @param detail    Optional event details
     *
     * @internal
     * @private
     */
    _notifyLifecycle(lifecycle, detail) {
        this.dispatchEvent(new CustomEvent(lifecycle, Object.assign({ composed: true }, (detail ? { detail: detail } : {}))));
    }
    /**
     * Bind component listeners
     *
     * @internal
     * @private
     */
    _listen() {
        this.constructor.listeners.forEach((declaration, listener) => {
            const instanceDeclaration = {
                // copy the class's static listener declaration into an instance listener declaration
                event: declaration.event,
                options: declaration.options,
                // bind the components listener method to the component instance and store it in the instance declaration
                listener: this[listener].bind(this),
                // determine the event target and store it in the instance declaration
                target: (declaration.target)
                    ? (typeof declaration.target === 'function')
                        ? declaration.target.call(this)
                        : declaration.target
                    : this
            };
            // add the bound event listener to the target
            instanceDeclaration.target.addEventListener(instanceDeclaration.event, instanceDeclaration.listener, instanceDeclaration.options);
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
    _unlisten() {
        this._listenerDeclarations.forEach((declaration) => {
            declaration.target.removeEventListener(declaration.event, declaration.listener, declaration.options);
        });
    }
    /**
     * Enqueue a request for an asynchronous update
     *
     * @internal
     * @private
     */
    async _enqueueUpdate() {
        let resolve;
        const previousRequest = this._updateRequest;
        // mark the component as having requested an update, the {@link _requestUpdate}
        // method will not enqueue a further request for update if one is scheduled
        this._hasRequestedUpdate = true;
        this._updateRequest = new Promise(res => resolve = res);
        // wait for the previous update to resolve
        // `await` is asynchronous and will return execution to the {@link requestUpdate} method
        // and essentially allows us to batch multiple synchronous property changes, before the
        // execution can resume here
        await previousRequest;
        const result = this._scheduleUpdate();
        // the actual update may be scheduled asynchronously as well
        if (result)
            await result;
        // resolve the new {@link _updateRequest} after the result of the current update resolves
        resolve(!this._hasRequestedUpdate);
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
    _scheduleUpdate() {
        if (!this._hasUpdated) {
            this._performUpdate();
        }
        else {
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
    _performUpdate() {
        // we have to wait until the component is connected before we can do any updates
        // the {@link connectedCallback} will call {@link requestUpdate} in any case, so we can
        // simply bypass any actual update and clean-up until then
        if (this.isConnected) {
            const changes = new Map(this._changedProperties);
            // pass a copy of the property changes to the update method, so property changes
            // are available in an overridden update method
            this.update(changes);
            // reset property maps directly after the update, so changes during the updateCallback
            // can be recorded for the next update, which has to be triggered manually though
            this._changedProperties = new Map();
            this._reflectingProperties = new Map();
            this._notifyingProperties = new Map();
            // in the first update we adopt the element's styles and set up declared listeners
            if (!this._hasUpdated) {
                this._adoptStyles();
                // bind listeners after the update, this way we ensure all DOM is rendered, all properties
                // are up-to-date and any user-created objects (e.g. workers) will be created in an
                // overridden connectedCallback
                this._listen();
            }
            this.updateCallback(changes, !this._hasUpdated);
            this._notifyLifecycle('update', { changes: changes, firstUpdate: !this._hasUpdated });
            this._hasUpdated = true;
        }
        // mark component as updated *after* the update to prevent infinte loops in the update process
        // N.B.: any property changes during the update will not trigger another update
        this._hasRequestedUpdate = false;
    }
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
Component.attributes = new Map();
/**
 * A map of property keys and their respective property declarations
 *
 * @remarks
 * This map is populated by the {@link property} decorator and can be used to obtain the
 * {@link PropertyDeclaration} of a property.
 *
 * @internal
 */
Component.properties = new Map();
/**
 * A map of property keys and their respective listener declarations
 *
 * @remarks
 * This map is populated by the {@link property} decorator and can be used to obtain the
 * {@link ListenerDeclaration} of a method.
 *
 * @internal
 */
Component.listeners = new Map();
//# sourceMappingURL=component.js.map