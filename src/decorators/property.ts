import { CustomElement } from '../custom-element';
import { createAttributeName, DEFAULT_PROPERTY_DECLARATION, PropertyDeclaration } from './property-declaration';
import { getPropertyDescriptor } from './utils/get-property-descriptor';

/**
 * A type extension to add additional properties to a {@link CustomElement} constructor during decoration
 *
 * @internal
 * @private
 */
export type DecoratedCustomElementType = typeof CustomElement & { overridden?: Set<string> };

/**
 * Decorates a {@link CustomElement} property
 *
 * @remarks
 * Many of the {@link PropertyDeclaration} options support custom functions, which will be invoked
 * with the custom element instance as `this`-context during execution. In order to support correct
 * typing in these functions, the `@property` decorator supports generic types. Here is an example
 * of how you can use this with a custom {@link PropertyReflector}:
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
 * @param options A property declaration
 */
export const property = <Type extends CustomElement = CustomElement> (options: Partial<PropertyDeclaration<Type>> = {}) => {

    return (target: Object, propertyKey: PropertyKey): void => {

        // TODO: We might not have to do this
        // class fields in typescript get initialized in the constructor and the field(/property) itself does not
        // get stored on the class's prototype. only getters and setters are stored on the prototype.
        // as such, when we decorate a property on a class, the property definition itself on the sub-class is
        // most likely intended to oerride the base class's setter/getter and we should not execute the base
        // class's setter/getter in the sub-class anymore. we should only be interested in setters/getters on the
        // sub-class and wrap them
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

        const constructor = target.constructor as DecoratedCustomElementType;

        const declaration: PropertyDeclaration<Type> = { ...DEFAULT_PROPERTY_DECLARATION, ...options };

        // generate the default attribute name
        if (declaration.attribute === true) {

            declaration.attribute = createAttributeName(propertyKey);
        }

        // set the default property change detector
        if (declaration.observe === true) {

            declaration.observe = DEFAULT_PROPERTY_DECLARATION.observe;
        }

        prepareConstructor(constructor);

        // check if we inherited an observed attribute for the property from the base class
        const attribute = constructor.properties.has(propertyKey) ? constructor.properties.get(propertyKey)!.attribute : undefined;

        // if attribute is truthy it's a string and it will exist in the attributes map
        if (attribute) {

            // remove the inherited attribute as it's overridden
            constructor.attributes.delete(attribute as string);

            // mark attribute as overridden for {@link customElement} decorator
            constructor.overridden!.add(attribute as string);
        }

        if (declaration.attribute) {

            constructor.attributes.set(declaration.attribute, propertyKey);
        }

        // store the property declaration last, so we can still access the inherited declaration
        // when processing the attributes
        constructor.properties.set(propertyKey, declaration as PropertyDeclaration);
    };
};

/**
 * Prepares the custom element constructor by initializing static properties for the property decorator,
 * so we don't modify a base class's static properties.
 *
 * @remarks
 * When the property decorator stores property declarations and attribute mappings in the constructor,
 * we have to make sure those static fields are initialized on the current constructor. Otherwise we
 * add property declarations and attribute mappings to the base class's static fields. We also make
 * sure to initialize the constructors maps with the values of the base class's maps to properly
 * inherit all property declarations and attributes.
 *
 * @param constructor The custom element constructor to prepare
 *
 * @internal
 * @private
 */
function prepareConstructor (constructor: DecoratedCustomElementType) {

    // this will give us a compile-time error if we refactor one of the static constructor properties
    // and we won't miss renaming the property keys
    const properties: keyof DecoratedCustomElementType = 'properties';
    const attributes: keyof DecoratedCustomElementType = 'attributes';
    const overridden: keyof DecoratedCustomElementType = 'overridden';

    if (!constructor.hasOwnProperty(properties)) constructor.properties = new Map(constructor.properties);
    if (!constructor.hasOwnProperty(attributes)) constructor.attributes = new Map(constructor.attributes);
    if (!constructor.hasOwnProperty(overridden)) constructor.overridden = new Set();
}
