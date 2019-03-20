import { Component } from '../component';
import { TemplateResult } from 'lit-html';
/**
 * A {@link Component} declaration
 */
export interface ComponentDeclaration<Type extends Component = Component> {
    /**
     * The selector of the component
     *
     * @remarks
     * The selector will be used to register the component constructor with the browser's
     * {@link window.customElements} API. If no selector is specified, the component class
     * needs to provide one in its static {@link Component.selector} property.
     * A selector defined in the {@link ComponentDeclaration} will take precedence over the
     * static class property.
     */
    selector: string;
    /**
     * Use Shadow DOM to render the components template?
     *
     * @remarks
     * Shadow DOM can be disabled by setting this option to `false`, in which case the
     * component's template will be rendered as child nodes of the component. This can be
     * useful if an isolated DOM and scoped CSS is not desired.
     *
     * Default value: `true`
     */
    shadow: boolean;
    /**
     * Automatically register the component with the browser's {@link window.customElements} API?
     *
     * @remarks
     * In cases where you want to employ a module system which registers components on a
     * conditional basis, you can disable automatic registration by setting this option to `false`.
     * Your module or bootstrap system will have to take care of defining the component later.
     *
     * Default value: `true`
     */
    define: boolean;
    /**
     * The component's styles
     *
     * @remarks
     * An array of CSS rulesets (https://developer.mozilla.org/en-US/docs/Web/CSS/Syntax#CSS_rulesets).
     * Styles defined using the decorator will be merged with styles defined in the component's
     * static {@link Component.styles} getter.
     *
     * ```typescript
     * @component({
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
    /**
     * The component's template
     *
     * @remarks
     * A function which returns a {@link #lit-html.TemplateResult}. The function's `element`
     * parameter will be the current component instance. This function will be invoked by the
     * component's render method.
     *
     * The method must return a {@link lit-html#TemplateResult} which is created using lit-html's
     * {@link lit-html#html | `html`} or {@link lit-html#svg | `svg`} template methods.
     *
     * Default value: `undefined`
     *
     * @param element The component instance requesting the template
     */
    template?: (element: Type, ...helpers: any[]) => TemplateResult | void;
}
/**
 * The default {@link ComponentDeclaration}
 */
export declare const DEFAULT_COMPONENT_DECLARATION: ComponentDeclaration;
//# sourceMappingURL=component-declaration.d.ts.map