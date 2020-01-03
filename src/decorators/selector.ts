import { Component } from '../component.js';
import { SelectorDeclaration, DEFAULT_SELECTOR_DECLARATION } from './selector-declaration.js';

export function selector<Type extends Component = Component> (options: SelectorDeclaration<Type>) {

    return function (target: Object, propertyKey: PropertyKey, propertyDescriptor?: PropertyDescriptor) {

        const constructor = target.constructor as typeof Component;

        options = { ...DEFAULT_SELECTOR_DECLARATION, ...options };

        prepareConstructor(constructor);

        if (options.query === null) {

            constructor.selectors.delete(propertyKey);

        } else {

            constructor.selectors.set(propertyKey, { ...options } as SelectorDeclaration<Type>);
        }
    }
}

/**
 * Prepares the component constructor by initializing static properties for the selector decorator,
 * so we don't modify a base class's static properties.
 *
 * @remarks
 * When the selector decorator stores selector declarations in the constructor, we have to make sure the
 * static selectors field is initialized on the current constructor. Otherwise we add selector declarations
 * to the base class's static field. We also make sure to initialize the selector map with the values of
 * the base class's map to properly inherit all selector declarations.
 *
 * @param constructor The component constructor to prepare
 *
 * @internal
 * @private
 */
function prepareConstructor (constructor: typeof Component) {

    if (!constructor.hasOwnProperty('selectors')) constructor.selectors = new Map(constructor.selectors);
}
