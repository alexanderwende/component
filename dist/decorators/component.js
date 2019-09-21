import { DEFAULT_COMPONENT_DECLARATION } from './component-declaration.js';
/**
 * Decorates a {@link Component} class
 *
 * @param options A {@link ComponentDeclaration}
 */
export function component(options = {}) {
    const declaration = Object.assign({}, DEFAULT_COMPONENT_DECLARATION, options);
    return (target) => {
        const constructor = target;
        constructor.selector = declaration.selector || target.selector;
        constructor.shadow = declaration.shadow;
        constructor.template = declaration.template || target.template;
        // use keyof signatures to catch refactoring errors
        const observedAttributesKey = 'observedAttributes';
        const stylesKey = 'styles';
        /**
         * Property decorators get called before class decorators, so at this point all decorated properties
         * have stored their associated attributes in {@link Component.attributes}.
         * We can now combine them with the user-defined {@link Component.observedAttributes} and,
         * by using a Set, eliminate all duplicates in the process.
         *
         * As the user-defined {@link Component.observedAttributes} will also include decorator generated
         * observed attributes, we always inherit all observed attributes from a base class. For that reason
         * we have to keep track of attribute overrides when extending any {@link Component} base class.
         * This is done in the {@link property} decorator. Here we have to make sure to remove overridden
         * attributes.
         */
        const observedAttributes = [
            ...new Set(
            // we take the inherited observed attributes...
            constructor.observedAttributes
                // ...remove overridden generated attributes...
                .reduce((attributes, attribute) => attributes.concat(constructor.overridden && constructor.overridden.has(attribute) ? [] : attribute), [])
                // ...and recombine the list with the newly generated attributes (the Set prevents duplicates)
                .concat([...target.attributes.keys()]))
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
            ...new Set((constructor.hasOwnProperty(stylesKey)
                ? constructor.styles
                : []).concat(declaration.styles || []))
        ];
        /**
         * Finally we override the {@link Component.observedAttributes} getter with a new one, which returns
         * the unique set of user defined and decorator generated observed attributes.
         */
        Reflect.defineProperty(constructor, observedAttributesKey, {
            configurable: true,
            enumerable: false,
            get() {
                return observedAttributes;
            }
        });
        /**
         * We override the {@link Component.styles} getter with a new one, which returns
         * the unique set of statically defined and decorator defined styles.
         */
        Reflect.defineProperty(constructor, stylesKey, {
            configurable: true,
            enumerable: true,
            get() {
                return styles;
            }
        });
        if (declaration.define) {
            window.customElements.define(constructor.selector, constructor);
        }
    };
}
;
//# sourceMappingURL=component.js.map