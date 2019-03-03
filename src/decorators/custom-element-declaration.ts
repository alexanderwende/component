import { CustomElement } from '../custom-element';
import { TemplateResult } from 'lit-html';

// TODO: rename to ComponentDeclaration

/**
 * A {@link CustomElement} declaration
 */
export interface CustomElementDeclaration<Type extends CustomElement = CustomElement> {
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
     * Shadow DOM can be disabled by setting this option to `false`, in which case the custom
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
    // TODO: test media queries
    /**
     * The custom element's styles
     *
     * @remarks
     * An array of CSS rulesets (https://developer.mozilla.org/en-US/docs/Web/CSS/Syntax#CSS_rulesets).
     * Styles defined using the decorator will be merged with styles defined in the custom element's
     * static {@link CustomElement.styles} getter.
     *
     * ```typescript
     * @customElement({
     *      styles: [
     *          'h1, h2 { font-size: 16pt; }',
     *          '@media screen and (min-width: 900px) { article { padding: 1rem 3rem; } }'
     *      ]
     * })
     * ```
     *
     * Default value: `undefined`
     */
    styles?: string[];
    // TODO: update documentation
    /**
     * The custom element's template
     *
     * @remarks
     * A static function which returns a {@link #lit-html.TemplateResult}. The function's `element`
     * parameter will be the current custom element instance. This function will be invoked by the
     * custom element's render method.
     *
     * The method must return a {@link lit-html#TemplateResult} which is created using lit-html's
     * {@link lit-html#html | `html`} or {@link lit-html#svg | `svg`} template methods.
     *
     * Default value: `undefined`
     *
     * @param element The custom element instance requesting the template
     */
    template?: (element: Type, ...helpers: any[]) => TemplateResult | void;
}

/**
 * The default {@link CustomElementDeclaration}
 */
export const DEFAULT_CUSTOM_ELEMENT_DECLARATION: CustomElementDeclaration = {
    selector: '',
    shadow: true,
    define: true,
};
