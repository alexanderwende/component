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

        /**
         * When defining classes in TypeScript, class fields actually don't exist on the class's prototype, but
         * rather, they are instantiated in the constructor and exist only on the instance. Accessor properties
         * are an exception however and exist on the prototype. Furthermore, accessors are inherited and will
         * be invoked when setting (or getting) a property on an instance of a child class, even if that class
         * defines the property field on its own. Only if the child class defines new accessors will the parent
         * class's accessors not be inherited.
         * To keep this behavior intact, we need to ensure, that when we create accessors for properties, which
         * are not declared as accessors, we invoke the parent class's accessor as expected.
         * The {@link getPropertyDescriptor} function allows us to look for accessors on the prototype chain of
         * the class we are decorating. If it finds an accessor on the current class, we don't need to worry as
         * this accessor would anturally override any parent class's accessor.
         */
        const descriptor = getPropertyDescriptor(target, propertyKey);
        const hiddenKey = (typeof propertyKey === 'string') ? `_${ propertyKey }` : Symbol();

        // if we found an accessor descriptor (from either this class or a parent) we use it, otherwise we create
        // default accessors to store the actual property value in a hidden field and retrieve it from there
        const get = descriptor && descriptor.get || function (this: any) { return this[hiddenKey]; };
        const set = descriptor && descriptor.set || function (this: any, value: any) { this[hiddenKey] = value; };

        // we define a new accessor descriptor which will wrap the previously retrieved or created accessors
        // and request an update of the CustomElement whenever the property is set
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
