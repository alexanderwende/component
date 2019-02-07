import { CustomElement } from '../custom-element';
/**
 * A {@link CustomElement} declaration
 */
export interface CustomElementDeclaration {
    /**
     * The selector of the custom element
     *
     * @remarks
     * The selector will be used to register the custom element constructor with the browser's
     * {@link window.customElements} API. If no selector is specified, the custom element class
     * needs to provide one in its static {@link CustomElement.selector} property.
     * A selector defined in the {@link CustomElementDeclaration} will take precedence over the
     * static class property.
     */
    selector: string;
    /**
     * Use Shadow DOM to render the custom elements template?
     *
     * @remarks
     * Shadow Dom can be disabled by setting this option to `false`, in which case the custom
     * element's template will be rendered as child nodes of the custom element. This can be
     * useful if an isolated DOM and scoped CSS is not desired.
     *
     * Default value: `true`
     */
    shadow: boolean;
    /**
     * Automatically register the custom element with the browser's {@link window.customElements} API?
     *
     * @remarks
     * In cases where you want to employ a module system which registers custom elements on
     * a conditional basis, you can disable automatic registration by setting this option to
     * `false`. Your module or bootstrap system will have to take care of defining the custom
     * element later.
     *
     * Default value: `true`
     */
    define: boolean;
}
export declare const DEFAULT_CUSTOM_ELEMENT_DECLARATION: CustomElementDeclaration;
/**
 * Decorates a {@link CustomElement} class
 *
 * @param options A custom element declaration
 */
export declare const customElement: (options?: Partial<CustomElementDeclaration>) => (target: typeof CustomElement) => void;
//# sourceMappingURL=custom-element.d.ts.map