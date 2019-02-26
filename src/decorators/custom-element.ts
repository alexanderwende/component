import { CustomElement } from '../custom-element';
import { CustomElementDeclaration, DEFAULT_CUSTOM_ELEMENT_DECLARATION } from './custom-element-declaration';
import { DecoratedCustomElementType } from './property';

/**
 * Decorates a {@link CustomElement} class
 *
 * @param options A custom element declaration
 */
export function customElement<Type extends CustomElement = CustomElement> (options: Partial<CustomElementDeclaration<Type>> = {}) {

    const declaration = { ...DEFAULT_CUSTOM_ELEMENT_DECLARATION, ...options };

    return (target: typeof CustomElement) => {

        const constructor = target as DecoratedCustomElementType;

        constructor.selector = declaration.selector || target.selector;
        constructor.shadow = declaration.shadow;
        constructor.template = declaration.template || target.template;

        // use keyof signatures to catch refactoring errors
        const observedAttributesKey: keyof typeof CustomElement = 'observedAttributes';
        const stylesKey: keyof typeof CustomElement = 'styles';

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
                    .reduce((attributes, attribute) => attributes.concat(
                        constructor.overridden && constructor.overridden.has(attribute) ? [] : attribute),
                        [] as string[]
                    )
                    // ...and recombine the list with the newly generated attributes (the Set prevents duplicates)
                    .concat([...target.attributes.keys()])
            )
        ];

        // delete the overridden Set from the constructor
        delete constructor.overridden;

        /**
         * We don't want to inherit styles automatically, unless explicitly requested, so we check if the
         * constructor declares a static styles property (which may use super.styles to explicitly inherit)
         * and if it doesn't, we ignore the parent class's styles (by not invoking the getter).
         * We then merge the decorator defined styles (if existing) into the styles and remove duplicates
         * by using a Set.
         */
        const styles = [
            ...new Set(
                (constructor.hasOwnProperty(stylesKey)
                    ? constructor.styles
                    : []
                ).concat(declaration.styles || [])
            )
        ];

        /**
         * Finally we override the {@link CustomElement.observedAttributes} getter with a new one, which returns
         * the unique set of user defined and decorator generated observed attributes.
         */
        Reflect.defineProperty(constructor, observedAttributesKey, {
            configurable: true,
            enumerable: false,
            get (): string[] {
                return observedAttributes;
            }
        });

        /**
         * We override the {@link CustomElement.styles} getter with a new one, which returns
         * the unique set of statically defined and decorator defined styles.
         */
        Reflect.defineProperty(constructor, stylesKey, {
            configurable: true,
            enumerable: true,
            get (): string[] {
                return styles;
            }
        });

        if (declaration.define) {

            window.customElements.define(constructor.selector, constructor);
        }
    };
};
