import { TemplateResult } from 'lit-html';
import { PropertyDeclaration } from './decorators/property';
export interface CustomElementType<T extends CustomElement = CustomElement> {
    selector: string;
    shadow: boolean;
    propertyDeclarations: {
        [key: string]: PropertyDeclaration;
    };
    new (...args: any[]): T;
}
export declare class CustomElement extends HTMLElement {
    static selector: string;
    static shadow: boolean;
    static propertyDeclarations: {
        [key: string]: PropertyDeclaration;
    };
    static readonly observedAttributes: string[];
    protected _renderRoot: Element | DocumentFragment;
    protected _updateRequest: Promise<boolean>;
    protected _changedProperties: Map<string, any>;
    protected _isConnected: boolean;
    protected _hasRequestedUpdate: boolean;
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
     */
    protected _reflect(propertyKey: string, oldValue: any, newValue: any): void;
    requestUpdate(propertyKey?: string, oldValue?: any, newValue?: any): Promise<boolean>;
    protected _performUpdate(): Promise<void>;
    private _enqueueUpdate;
    private _getPropertyDeclaration;
}
//# sourceMappingURL=custom-element.d.ts.map