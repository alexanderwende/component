import { CustomElement, CustomElementType } from '../custom-element';
import { DEFAULT_PROPERTY_DECLARATION, PropertyDeclaration } from './property-declaration';

/**
 * Decorates a {@link CustomElement} property
 *
 * @remarks
 * Many of the {@link PropertyDeclaration} options support custom functions, which will be invoked
 * with the custom element instance as `this`-context during execution. In order to support correct
 * typing in these functions, the `@property` decorator supports generic types. Here is an example
 * of how you can use this with a custom {@link PropertReflector}:
 *
 * ```typescript
 * class MyElement extends CustomElement {
 *
 *      myHiddenProperty = true;
 *
 *      // use a generic to support proper instance typing in the property reflector
 *      @property<MyElement>({
 *          reflectProperty: (propertyKey: string, oldValue: any, newValue: any) {
 *              // the generic type allows for correct typing of this
 *              if (this.myHiddenProperty && newValue) {
 *                  this.setAttribute('my-property', '');
 *              } else {
 *                  this.removeAttribute('my-property');
 *              }
 *          }
 *      })
 *      myProperty = false;
 * }
 * ```
 *
 * @param options The property declaration
 */
export const property = <Type extends CustomElement = CustomElement> (options: PropertyDeclaration<Type> = {}) => {

    return (target: Object, propertyKey: string): void => {

        const descriptor = getPropertyDescriptor(target, propertyKey);
        const hiddenKey = (typeof propertyKey === 'string') ? `_${ propertyKey }` : Symbol();
        const get = descriptor && descriptor.get || function (this: any) { return this[hiddenKey]; };
        const set = descriptor && descriptor.set || function (this: any, value: any) { this[hiddenKey] = value; };

        Object.defineProperty(target, propertyKey, {
            configurable: true,
            enumerable: true,
            get (): any {
                return get.call(this);
            },
            set (value: any): void {
                const oldValue = this[propertyKey];
                set.call(this, value);
                this.requestUpdate(propertyKey, oldValue, value);
            }
        });

        const constructor = target.constructor as CustomElementType<Type>;

        // TODO: Merge the attribute converter if only one mapper is specified in the options
        constructor.propertyDeclarations[propertyKey] = { ...DEFAULT_PROPERTY_DECLARATION, ...options };
    };
};

/**
 * Get the {@link PropertyDescriptor} of a property from its prototype
 * or a parent prototype - excluding {@link Object.prototype} itself, to
 * ensure correct prototype inheritance.
 *
 * @param target        The prototype to get the descriptor from
 * @param propertyKey   The property key for which to get the descriptor
 *
 * @internal
 * @private
 */
function getPropertyDescriptor (target: Object, propertyKey: string | symbol): PropertyDescriptor | undefined {

    if (propertyKey in target) {

        while (target !== Object.prototype) {

            if (target.hasOwnProperty(propertyKey)) {

                return Object.getOwnPropertyDescriptor(target, propertyKey);
            }

            target = Object.getPrototypeOf(target);
        }
    }

    return undefined;
}
