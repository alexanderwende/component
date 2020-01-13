import { Component } from '../component.js';
import { SelectorDeclaration, DEFAULT_SELECTOR_DECLARATION } from './selector-declaration.js';
import { getPropertyDescriptor } from './utils/get-property-descriptor.js';
import { microTask } from '../tasks.js';

/**
 * Decorates a {@link Component} property as a selector
 *
 * @param options The selector declaration
 */
export function selector<Type extends Component = Component> (options: SelectorDeclaration<Type>) {

    return function (
        target: Object,
        propertyKey: PropertyKey,
        propertyDescriptor?: PropertyDescriptor,
    ): any {

        const descriptor = propertyDescriptor || getPropertyDescriptor(target, propertyKey);
        const hiddenKey = Symbol(`__${ propertyKey.toString() }`);

        const getter = descriptor?.get || function (this: any) { return this[hiddenKey]; };
        const setter = descriptor?.set || function (this: any, value: any) { this[hiddenKey] = value; };

        const wrappedDescriptor: PropertyDescriptor = {
            configurable: true,
            enumerable: true,
            get (this: Type): any {
                return getter.call(this);
            },
            set (this: Type, value: any): void {
                setter.call(this, value);
                // selectors are queried during the update cycle, this means, when they change
                // we cannot trigger another update from within the current update cycle
                // we need to schedule an update just after this update is over
                // also, selectors are not properties, so they don't appear in the property maps
                // that's why we invoke requestUpdate without any parameters
                microTask(() => this.requestUpdate());
            }
        }

        const constructor = target.constructor as typeof Component;

        options = { ...DEFAULT_SELECTOR_DECLARATION, ...options };

        prepareConstructor(constructor);

        if (options.query === null) {

            constructor.selectors.delete(propertyKey);

        } else {

            constructor.selectors.set(propertyKey, { ...options } as SelectorDeclaration);
        }

        if (!propertyDescriptor) {

            // if no propertyDescriptor was defined for this decorator, this decorator is a property
            // decorator which must return void and we can define the wrapped descriptor here
            Object.defineProperty(target, propertyKey, wrappedDescriptor);

        } else {

            // if a propertyDescriptor was defined for this decorator, this decorator is an accessor
            // decorator and we must return the wrapped property descriptor
            return wrappedDescriptor;
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
