import { html, render, TemplateResult } from 'lit-html';
import { PropertyDeclaration } from './decorators/property';
import { kebabCase } from './utils/string-utils';

export interface CustomElementType<T extends CustomElement = CustomElement> {

    selector: string;

    shadow: boolean;

    propertyDeclarations: { [key: string]: PropertyDeclaration };

    new (...args: any[]): T;
}

export class CustomElement extends HTMLElement {

    static selector: string;

    static shadow: boolean;

    static propertyDeclarations: { [key: string]: PropertyDeclaration } = {};

    static get observedAttributes (): string[] {

        return [];
    }

    protected _renderRoot: Element | DocumentFragment;

    protected _updateRequest: Promise<boolean> = new Promise(resolve => resolve(true));

    protected _changedProperties: Map<string, any> = new Map();

    protected _isConnected = false;

    protected _hasRequestedUpdate = false;

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

        this.requestUpdate();
    }

    disconnectedCallback (): void {

        console.log('disconnected... ', this.constructor.name);
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

        // TODO: update host bindings, reflected attributes, dispatch events...

        this.render();

        changedProperties.forEach((oldValue: any, propertyKey: string) => {

            // properties in the changedProperties map will always have a declaration
            const propertyDeclaration = this._getPropertyDeclaration(propertyKey)!;
            const newValue            = this[propertyKey as keyof CustomElement];

            // TODO: only reflect if property change was not initiated by observed attribute
            if (propertyDeclaration.reflect) this._reflect(propertyKey, oldValue, newValue);

            // TODO: only notify, if property change was not initiated by setting it from
            //  the outside and not during constructor phase
            if (propertyDeclaration.notify) this._notify(propertyKey, oldValue, newValue);
        });
    }

    /**
     * Dispatch a property-changed event.
     *
     * @param propertyKey
     * @param oldValue
     * @param newValue
     */
    protected _notify (propertyKey: string, oldValue: any, newValue: any): void {

        const eventName = `${kebabCase(propertyKey)}-changed`;

        this.dispatchEvent(new CustomEvent(eventName, {
            composed: true,
            detail:   {
                property: propertyKey,
                previous: oldValue,
                current:  newValue
            }
        }));
    }

    /**
     * Reflect a property to an attribute on the custom element.
     *
     * @param propertyKey
     * @param oldValue
     * @param newValue
     */
    protected _reflect (propertyKey: string, oldValue: any, newValue: any): void {

        // TODO: resolve proper toAttribute mapper, attribute name...
        const attributeName = kebabCase(propertyKey);

        if (newValue === null) {

            this.removeAttribute(attributeName);

        } else {

            this.setAttribute(attributeName, newValue);
        }
    }

    requestUpdate (propertyKey?: string, oldValue?: any, newValue?: any): Promise<boolean> {

        console.log('requestUpdate()... ', this.constructor.name);

        const constructor = this.constructor as typeof CustomElement;

        if (propertyKey && propertyKey in constructor.propertyDeclarations) {

            const propertyDeclaration = constructor.propertyDeclarations[propertyKey];

            // check if property is observed
            if (!propertyDeclaration.observe) return this._updateRequest;

            // check if property has changed
            if (propertyDeclaration.hasChanged && !propertyDeclaration.hasChanged(oldValue, newValue)) return this._updateRequest;

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