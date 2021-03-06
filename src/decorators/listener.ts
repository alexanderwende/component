import { Component } from '../component.js';
import { ListenerDeclaration } from './listener-declaration.js';

/**
 * Decorates a {@link Component} method as an event listener
 *
 * @param options The listener declaration
 */
export function listener<Type extends Component = Component> (options: ListenerDeclaration<Type>) {

    return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {

        const constructor = target.constructor as typeof Component;

        prepareConstructor(constructor);

        if (options.event === null) {

            constructor.listeners.delete(propertyKey);

        } else {

            constructor.listeners.set(propertyKey, { ...options } as ListenerDeclaration);
        }
    }
}

/**
 * Prepares the component constructor by initializing static properties for the listener decorator,
 * so we don't modify a base class's static properties.
 *
 * @remarks
 * When the listener decorator stores listener declarations in the constructor, we have to make sure the
 * static listeners field is initialized on the current constructor. Otherwise we add listener declarations
 * to the base class's static field. We also make sure to initialize the listener maps with the values of
 * the base class's map to properly inherit all listener declarations.
 *
 * @param constructor The component constructor to prepare
 *
 * @internal
 * @private
 */
function prepareConstructor (constructor: typeof Component) {

    if (!constructor.hasOwnProperty('listeners')) constructor.listeners = new Map(constructor.listeners);
}
