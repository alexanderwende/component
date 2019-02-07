import { html, render, TemplateResult } from 'lit-html';
import { ListenerDeclaration } from './decorators/listener';
import { PropertyDeclaration, PropertyNotifier, PropertyReflector, isPropertyReflector, isPropertyKey } from "./decorators/property-declaration";
import { kebabCase } from './utils/string-utils';

const PROPERTY_REFLECTOR_ERROR = (propertyReflector: PropertyKey | Function) => new Error(`Error executing property reflector ${ String(propertyReflector) }.`);
const PROPERTY_NOTIFIER_ERROR = (propertyNotifier: PropertyKey | Function) => new Error(`Error executing property notifier ${ String(propertyNotifier) }.`);

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

export class CustomElement extends HTMLElement {

    static selector: string;

    static shadow: boolean;

    /**
     * A map of attribute names and their respective property keys
     *
     * @internal
     * @private
     */
    static attributes: Map<string, PropertyKey> = new Map();

    /**
     * A map of property keys and their respective property declarations
     *
     * @internal
     * @private
     */
    static properties: Map<PropertyKey, PropertyDeclaration> = new Map();

    /**
     * A map of property keys and their respective listener declarations
     *
     * @internal
     * @private
     */
    static listeners: Map<PropertyKey, ListenerDeclaration> = new Map();

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
    static get observedAttributes (): string[] {

        return [];
    }

    protected _renderRoot: Element | DocumentFragment;

    protected _updateRequest: Promise<boolean> = Promise.resolve(true);

    protected _changedProperties: Map<string, any> = new Map();

    protected _notifyingProperties: Map<string, any> = new Map();

    protected _listenerDeclarations: InstanceListenerDeclaration[] = [];

    protected _isConnected = false;

    protected _hasRequestedUpdate = false;

    protected _isReflecting = false;

    get isConnected (): boolean {

        return this._isConnected;
    }

    constructor () {

        super();

        this._renderRoot = this.createRenderRoot();

        console.log('constructed... ', this.constructor.name);
    }

    createRenderRoot (): Element | DocumentFragment {

        return (this.constructor as typeof CustomElement).shadow ?
            this.attachShadow({ mode: 'open' }) :
            this;
    }

    adoptedCallback (): void {
    }

    connectedCallback (): void {

        console.log('connected... ', this.constructor.name);

        this._listen();

        this.requestUpdate();
    }

    disconnectedCallback (): void {

        console.log('disconnected... ', this.constructor.name);

        this._unlisten();
    }

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
    attributeChangedCallback (attribute: string, oldValue: any, newValue: any): void {

        if (oldValue !== newValue) this._reflectAttribute(attribute, oldValue, newValue);
    }

    propertyChangedCallback (property: string, oldValue: any, newValue: any): void {
    }

    template (): TemplateResult {

        return html``;
    }

    render (): void {

        console.log('render()... ', this.constructor.name);

        render(this.template(), this._renderRoot);

        this.renderCallback();
    }

    renderCallback (): void {

        console.log('rendered... ', this.constructor.name);
    }

    update (changedProperties: Map<string, any>): void {

        console.log('update()... ', changedProperties);

        // TODO: Check if at least one changed property requests render
        this.render();

        changedProperties.forEach((oldValue: any, propertyKey: string) => {

            this.reflectProperty(propertyKey, oldValue, this[propertyKey as keyof CustomElement]);
        });

        this._notifyingProperties.forEach((oldValue, propertyKey) => {

            const propertyDeclaration = this._getPropertyDeclaration(propertyKey)!;
            const newValue = this[propertyKey as keyof CustomElement];

            if (propertyDeclaration.notify) {

                if (typeof propertyDeclaration.notify === 'function') {

                    try {
                        propertyDeclaration.notify.call(this, propertyKey, oldValue, newValue);
                    } catch (error) {
                        throw PROPERTY_NOTIFIER_ERROR(propertyDeclaration.notify.toString());
                    }

                } else if (typeof propertyDeclaration.notify === 'string') {

                    try {
                        (this[propertyDeclaration.notify as keyof this] as unknown as PropertyNotifier)(propertyKey, oldValue, newValue);
                    } catch (error) {
                        throw PROPERTY_NOTIFIER_ERROR(propertyDeclaration.notify);
                    }

                } else {

                    this._notify(propertyKey, oldValue, newValue);
                }
            }
        });
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
    reflectProperty (propertyKey: PropertyKey, oldValue: any, newValue: any) {

        const propertyDeclaration = this._getPropertyDeclaration(propertyKey);

        // TODO: only reflect if property change was not initiated by observed attribute

        if (propertyDeclaration && propertyDeclaration.reflectProperty) {

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
        }
    }

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
    notifyChanges (executor: () => void) {

        // back up current changed properties
        const previousChanges = new Map(this._changedProperties);

        // execute the changes
        executor();

        // add all new or updated changed properties to the notifying properties
        for (const [propertyKey, oldValue] of this._changedProperties) {

            if (!previousChanges.has(propertyKey) || previousChanges.get(propertyKey) !== oldValue) {

                this._notifyingProperties.set(propertyKey, oldValue);
            }
        }
    }

    /**
     * Dispatch a property-changed event.
     *
     * @param propertyKey
     * @param oldValue
     * @param newValue
     */
    protected _notify (propertyKey: string, oldValue: any, newValue: any): void {

        const eventName = `${ kebabCase(propertyKey) }-changed`;

        this.dispatchEvent(new CustomEvent(eventName, {
            composed: true,
            detail: {
                property: propertyKey,
                previous: oldValue,
                current: newValue
            }
        }));

        console.log(`notify ${ eventName }...`);
    }

    /**
     * The default property reflector
     *
     * @remarks
     * If no {@link PropertyReflector} is defined in the {@link PropertyDeclaration} this
     * method is used to reflect the property value to its associated attribute.
     *
     * @param propertyKey   The propert key of the property to reflect
     * @param oldValue      The old property value
     * @param newValue      The new property value
     *
     * @internal
     * @private
     */
    protected _reflectProperty (propertyKey: PropertyKey, oldValue: any, newValue: any) {

        // this function is only called for properties which have a declaration
        const propertyDeclaration = this._getPropertyDeclaration(propertyKey)!;

        // the attribute name stored in the declaration is always a string (set by the property decorator)
        // TODO: update types for stored property declarations?
        const attributeName = propertyDeclaration.attribute as string;
        // resolve the attribute value
        const attributeValue = propertyDeclaration.converter.toAttribute(newValue);

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

    protected _reflectAttribute (attributeName: string, olldValue: string, newValue: string) {

        // TODO: handle custom _reflectAttribute function

        // TODO: when a custom element is extended and a property is overridden with a different
        // attribute name in its property declaration, the base class's old attribute name will
        // still be in the list of observed attributes. in that case we won't find a matching
        // propertyKey for the old attribute name and we should ignore it.

        const constructor = this.constructor as typeof CustomElement;

        if (!constructor.attributes.has(attributeName)) {

            console.log(`observed attribute "${ attributeName }" not found... ignoring...`);

            return;
        }

        const propertyKey = constructor.attributes.get(attributeName)!;

        const propertyDeclaration = this._getPropertyDeclaration(propertyKey)!;

        const propertyValue = propertyDeclaration.converter!.fromAttribute!(newValue);

        // TODO: this is wrong, as it prevents custom element update
        this._isReflecting = true;

        this[propertyKey as keyof this] = propertyValue;

        this._isReflecting = false;
    }

    /**
     * Bind custom element listeners.
     *
     * @internal
     * @private
     */
    protected _listen () {

        (this.constructor as typeof CustomElement).listeners.forEach((declaration, listener) => {

            const instanceDeclaration: InstanceListenerDeclaration = {

                // copy the class's static listener declaration into an instance listener declaration
                event: declaration.event,
                options: declaration.options,

                // bind the components listener method to the component instance and store it in the instance declaration
                listener: (this[listener as keyof this] as unknown as EventListener).bind(this),

                // determine the event target and store it in the instance declaration
                target: (declaration.target) ?
                    (typeof declaration.target === 'function') ?
                        declaration.target() :
                        declaration.target :
                    this
            };

            // add the bound event listener to the target
            instanceDeclaration.target.addEventListener(instanceDeclaration.event as string, instanceDeclaration.listener, instanceDeclaration.options);

            // save the instance listener declaration on the component instance
            this._listenerDeclarations.push(instanceDeclaration);
        });
    }

    /**
     * Unbind custom element listeners.
     *
     * @internal
     * @private
     */
    protected _unlisten () {

        this._listenerDeclarations.forEach((declaration) => {

            declaration.target.removeEventListener(declaration.event as string, declaration.listener, declaration.options);
        });
    }

    requestUpdate (propertyKey?: string, oldValue?: any, newValue?: any): Promise<boolean> {

        console.log('requestUpdate()... ', this.constructor.name);

        if (this._isReflecting) {

            console.log(`requestUpdate()... reflecting`);

            return this._updateRequest;
        }

        if (propertyKey) {

            const propertyDeclaration = this._getPropertyDeclaration(propertyKey);

            if (propertyDeclaration) {

                const { observe } = propertyDeclaration;

                // check if property is observed
                if (!observe) return this._updateRequest;
                console.log(`requestUpdate()... ${ propertyKey } observe: ${ !!observe }`);

                // check if property has changed
                if (typeof observe === 'function' && !observe(oldValue, newValue)) return this._updateRequest;
                console.log(`requestUpdate()... ${ propertyKey } changed`);

                // store changed property for batch processing
                this._changedProperties.set(propertyKey, oldValue);
            }
        }

        if (!this._hasRequestedUpdate) {

            // enqueue update request if none was enqueued already
            this._enqueueUpdate();
        }

        return this._updateRequest;
    }

    protected _performUpdate (): Promise<void> {

        console.log('performUpdate()... ', this.constructor.name);

        return new Promise(resolve => {

            requestAnimationFrame(() => {

                this.update(this._changedProperties);

                this._changedProperties = new Map();

                this._notifyingProperties = new Map();

                // TODO: Should this be moved before the update call?
                // During the update, other property changes might occur...
                this._hasRequestedUpdate = false;

                resolve();
            });
        });
    }

    private async _enqueueUpdate () {

        console.log('enqueueUpdate()... ', this.constructor.name);

        let resolve: (result: boolean) => void;

        const previousRequest = this._updateRequest;

        this._hasRequestedUpdate = true;

        this._updateRequest = new Promise<boolean>(res => resolve = res);

        await previousRequest;

        const result = this._performUpdate();

        await result;

        resolve!(!this._hasRequestedUpdate);
    }

    private _getPropertyDeclaration (propertyKey: PropertyKey): PropertyDeclaration | undefined {

        return (this.constructor as typeof CustomElement).properties.get(propertyKey);
    }
}
