import { html, render, TemplateResult } from 'lit-html';
import { ListenerDeclaration } from './decorators/listener';
import { PropertyDeclaration, PropertyNotifier, PropertyReflector } from "./decorators/property-declaration";
import { kebabCase } from './utils/string-utils';

const PROPERTY_REFLECTOR_ERROR = (propertyReflector: string) => new Error(`Error executing property reflector ${ propertyReflector }.`);
const PROPERTY_NOTIFIER_ERROR = (propertyNotifier: string) => new Error(`Error executing property notifier ${ propertyNotifier }.`);

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

    propertyDeclarations: { [key: string]: PropertyDeclaration<T> };

    listenerDeclarations: { [key: string]: ListenerDeclaration };

    new(...args: any[]): T;
}

export class CustomElement extends HTMLElement {

    static selector: string;

    static shadow: boolean;

    static propertyDeclarations: { [key: string]: PropertyDeclaration } = {};

    static listenerDeclarations: { [key: string]: ListenerDeclaration } = {};

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

        return (this.constructor as CustomElementType).shadow ?
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

    attributeChangedCallback (attribute: string, oldValue: any, newValue: any): void {
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

            // properties in the changedProperties map will always have a declaration
            const propertyDeclaration = this._getPropertyDeclaration(propertyKey)!;
            const newValue = this[propertyKey as keyof CustomElement];

            // TODO: only reflect if property change was not initiated by observed attribute
            if (propertyDeclaration.reflectProperty) {

                if (typeof propertyDeclaration.reflectProperty === 'function') {

                    try {
                        propertyDeclaration.reflectProperty.call(this, propertyKey, oldValue, newValue);
                    } catch (error) {
                        throw PROPERTY_REFLECTOR_ERROR(propertyDeclaration.reflectProperty.toString());
                    }

                } else if (typeof propertyDeclaration.reflectProperty === 'string') {

                    try {
                        (this[propertyDeclaration.reflectProperty as keyof this] as unknown as PropertyReflector)(propertyKey, oldValue, newValue);
                    } catch (error) {
                        throw PROPERTY_REFLECTOR_ERROR(propertyDeclaration.reflectProperty);
                    }

                } else {

                    this._reflect(propertyKey, oldValue, newValue);
                }
            }
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
     * Reflect a property to an attribute on the custom element.
     *
     * @param propertyKey
     * @param oldValue
     * @param newValue
     *
     * @internal
     * @private
     */
    protected _reflect (propertyKey: string, oldValue: any, newValue: any): void {

        const propertyDeclaration = this._getPropertyDeclaration(propertyKey)!;

        // resolve the attribute name
        const attributeName = (typeof propertyDeclaration.attribute === 'string') ? propertyDeclaration.attribute : kebabCase(propertyKey);
        // resolve the attribute value
        const attributeValue = propertyDeclaration.converter!.toAttribute!(newValue);

        if (attributeValue === undefined) {

            return;
        }
        else if (attributeValue === null) {

            this.removeAttribute(attributeName);

        } else {

            this.setAttribute(attributeName, attributeValue);
        }
    }

    /**
     * Bind custom element listeners.
     *
     * @internal
     * @private
     */
    protected _listen () {

        Object.entries((this.constructor as CustomElementType).listenerDeclarations).forEach(([listener, declaration]) => {

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
            instanceDeclaration.target.addEventListener(instanceDeclaration.event, instanceDeclaration.listener, instanceDeclaration.options);

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

            declaration.target.removeEventListener(declaration.event, declaration.listener, declaration.options);
        });
    }

    requestUpdate (propertyKey?: string, oldValue?: any, newValue?: any): Promise<boolean> {

        console.log('requestUpdate()... ', this.constructor.name);

        const constructor = this.constructor as typeof CustomElement;

        if (propertyKey && propertyKey in constructor.propertyDeclarations) {

            const { observe } = constructor.propertyDeclarations[propertyKey];

            // check if property is observed
            if (!observe) return this._updateRequest;
            console.log(`requestUpdate()... ${ propertyKey } observe: ${ !!observe }`);

            // check if property has changed
            if (typeof observe === 'function' && !observe(oldValue, newValue)) return this._updateRequest;
            console.log(`requestUpdate()... ${ propertyKey } changed`);

            // store changed property for batch processing
            this._changedProperties.set(propertyKey, oldValue);
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

    private _getPropertyDeclaration (propertyKey: string): PropertyDeclaration | undefined {

        return (this.constructor as typeof CustomElement).propertyDeclarations[propertyKey];
    }
}
