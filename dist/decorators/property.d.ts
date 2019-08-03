import { Component } from '../component.js';
import { PropertyDeclaration } from './property-declaration.js';
/**
 * A type extension to add additional properties to a {@link Component} constructor during decoration
 *
 * @internal
 * @private
 */
export declare type DecoratedComponentType = typeof Component & {
    overridden?: Set<string>;
};
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
export declare function property<Type extends Component = Component>(options?: Partial<PropertyDeclaration<Type>>): (target: Object, propertyKey: string | number | symbol, propertyDescriptor?: PropertyDescriptor | undefined) => any;
//# sourceMappingURL=property.d.ts.map