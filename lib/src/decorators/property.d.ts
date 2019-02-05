import { CustomElement } from '../custom-element';
import { PropertyDeclaration } from './property-declaration';
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
export declare const property: <Type extends CustomElement = CustomElement>(options?: PropertyDeclaration<Type>) => (target: Object, propertyKey: string) => void;
//# sourceMappingURL=property.d.ts.map