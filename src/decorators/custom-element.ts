import { CustomElement } from '../custom-element';
import { DecoratedCustomElementType } from './property';

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

export const DEFAULT_CUSTOM_ELEMENT_DECLARATION: CustomElementDeclaration = {
    selector: '',
    shadow: true,
    define: true
};

/**
 * Decorates a {@link CustomElement} class
 *
 * @param options A custom element declaration
 */
export const customElement = (options: Partial<CustomElementDeclaration> = {}) => {

    const declaration = { ...DEFAULT_CUSTOM_ELEMENT_DECLARATION, ...options };

    return (target: typeof CustomElement) => {

        const constructor = target as DecoratedCustomElementType;

        constructor.selector = declaration.selector || target.selector;
        constructor.shadow = declaration.shadow;

        /**
         * Property decorators get called before class decorators, so at this point all decorated properties
         * have stored their associated attributes in {@link CustomElement.attributes}.
         * We can now combine them with the user-defined {@link CustomElement.observedAttributes} and,
         * by using a Set, eliminate all duplicates in the process.
         *
         * As the user-defined {@link CustomElement.observedAttributes} will also include decorator generated
         * observed attributes, we always inherit all observed attributes from a base class. For that reason
         * we have to keep track of attribute overrides when extending any {@link CustomElement} base class.
         * This is done in the {@link property} decorator. Here we have to make sure to remove overridden
         * attributes.
         */
        const observedAttributes = [
            ...new Set(
                // we take the inherited observed attributes...
                constructor.observedAttributes
                    // ...remove overridden generated attributes...
                    .reduce((attributes, attribute) => attributes.concat(constructor.overridden.has(attribute) ? [] : attribute), [] as string[])
                    // ...and recombine the list with the newly generated attributes (the Set prevents duplicates)
                    .concat([...target.attributes.keys()])
            )
        ];

        // TODO: delete the overridden Set from the constructor

        /**
         * Finally we override the {@link CustomElement.observedAttributes} getter with a new one, which returns
         * the unique set of user defined and decorator generated observed attributes.
         *
         * N.B.: When extending an existing custom element, and oerriding a property with a different associated
         * attribute name, the base class's original attribute name remains in the {@link CustomElement.observedAttributes}
         * array. Changing the old attribute on the extended class will try to reflect the attribute, but won't
         * find the attribute in the extended class's {@link CustomElement.attributes} Map and will therefore be
         * ignored.
         */
        Reflect.defineProperty(constructor, 'observedAttributes', {
            configurable: true,
            enumerable: false,
            get (): string[] {
                return observedAttributes;
            }
        });

        if (declaration.define) {

            window.customElements.define(constructor.selector, constructor);
        }
    };
};
