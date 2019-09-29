import { createAttributeName, DEFAULT_PROPERTY_DECLARATION } from './property-declaration.js';
import { getPropertyDescriptor } from './utils/get-property-descriptor.js';
/**
 * Decorates a {@link Component} property
 *
 * @remarks
 * Many of the {@link PropertyDeclaration} options support custom functions, which will be invoked
 * with the component instance as `this`-context during execution. In order to support correct
 * typing in these functions, the `@property` decorator supports generic types. Here is an example
 * of how you can use this with a custom {@link PropertyReflector}:
 *
 * ```typescript
 * class MyElement extends Component {
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
export function property(options = {}) {
    return function (target, propertyKey, propertyDescriptor) {
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
         * the class we are decorating.
         */
        const descriptor = propertyDescriptor || getPropertyDescriptor(target, propertyKey);
        const hiddenKey = (typeof propertyKey === 'string') ? `__${propertyKey}` : Symbol();
        // if we found an accessor descriptor (from either this class or a parent) we use it, otherwise we create
        // default accessors to store the actual property value in a hidden field and retrieve it from there
        const getter = descriptor && descriptor.get || function () { return this[hiddenKey]; };
        const setter = descriptor && descriptor.set || function (value) { this[hiddenKey] = value; };
        // we define a new accessor descriptor which will wrap the previously retrieved or created accessors
        // and request an update of the component whenever the property is set
        const wrappedDescriptor = {
            configurable: true,
            enumerable: true,
            get() {
                return getter.call(this);
            },
            set(value) {
                const oldValue = this[propertyKey];
                setter.call(this, value);
                // don't pass `value` on as `newValue` - an inherited setter might modify it
                // instead get the new value by invoking the getter
                this.requestUpdate(propertyKey, oldValue, getter.call(this));
            }
        };
        const constructor = target.constructor;
        const declaration = Object.assign(Object.assign({}, DEFAULT_PROPERTY_DECLARATION), options);
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
        const attribute = constructor.properties.has(propertyKey) ? constructor.properties.get(propertyKey).attribute : undefined;
        // if attribute is truthy it's a string and it will exist in the attributes map
        if (attribute) {
            // remove the inherited attribute as it's overridden
            constructor.attributes.delete(attribute);
            // mark attribute as overridden for {@link component} decorator
            constructor.overridden.add(attribute);
        }
        if (declaration.attribute) {
            constructor.attributes.set(declaration.attribute, propertyKey);
        }
        // store the property declaration *after* processing the attributes, so we can still access the
        // inherited property declaration when processing the attributes
        constructor.properties.set(propertyKey, declaration);
        if (!propertyDescriptor) {
            // if no propertyDescriptor was defined for this decorator, this decorator is a property
            // decorator which must return void and we can define the wrapped descriptor here
            Object.defineProperty(target, propertyKey, wrappedDescriptor);
        }
        else {
            // if a propertyDescriptor was defined for this decorator, this decorator is an accessor
            // decorator and we must return the wrapped property descriptor
            return wrappedDescriptor;
        }
    };
}
;
/**
 * Prepares the component constructor by initializing static properties for the property decorator,
 * so we don't modify a base class's static properties.
 *
 * @remarks
 * When the property decorator stores property declarations and attribute mappings in the constructor,
 * we have to make sure those static fields are initialized on the current constructor. Otherwise we
 * add property declarations and attribute mappings to the base class's static fields. We also make
 * sure to initialize the constructors maps with the values of the base class's maps to properly
 * inherit all property declarations and attributes.
 *
 * @param constructor The component constructor to prepare
 *
 * @internal
 */
function prepareConstructor(constructor) {
    // this will give us a compile-time error if we refactor one of the static constructor properties
    // and we won't miss renaming the property keys
    const properties = 'properties';
    const attributes = 'attributes';
    const overridden = 'overridden';
    if (!constructor.hasOwnProperty(properties))
        constructor.properties = new Map(constructor.properties);
    if (!constructor.hasOwnProperty(attributes))
        constructor.attributes = new Map(constructor.attributes);
    if (!constructor.hasOwnProperty(overridden))
        constructor.overridden = new Set();
}
//# sourceMappingURL=property.js.map