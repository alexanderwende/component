import { CustomElement } from '../custom-element';
export declare type PropertyReflector<Type extends CustomElement = CustomElement> = (this: Type, propertyKey: string, oldValue: any, newValue: any) => void;
export declare type PropertyNotifier<Type extends CustomElement = CustomElement> = (this: Type, propertyKey: string, oldValue: any, newValue: any) => void;
/**
 * A {@link CustomElement} property declaration
 *
 * @property observe    True if the property change should be observed and cause an update
 * @property notify     True if the property change should trigger a custom event
 */
export interface PropertyDeclaration<Type extends CustomElement = CustomElement> {
    /**
     * The name of the associated attribute
     *
     * @remarks
     * Will be the camel-cased property name if not specified.
     */
    attribute?: string;
    observe?: boolean;
    notify?: boolean | keyof Type | PropertyNotifier<Type>;
    /**
     * Controls how the property value will be reflected to attributes
     *
     * TODO: Improve description
     * @remarks
     * If true -> will be reflected automatically
     * If string -> will pick up method from custom element
     * If function -> will use that function with this being bound to custom element instance
     *
     * ```typescript
     * class MyElement extends CustomElement {
     *      // use a generic to support proper instance typing in the property reflector
     *      @property<MyElement>({
     *          reflect: (propertyKey: string, oldValue: any, newValue: any) {
     *              // do something here with those values
     *          }
     *      })
     *      myProperty = false;
     * }
     * ```
     */
    reflect?: boolean | keyof Type | PropertyReflector<Type>;
    hasChanged?: (oldValue: any, newValue: any) => boolean;
    toAttribute?: (value: any) => string | null;
    fromAttribute?: (value: string) => any;
}
/**
 * The default {@link CustomElement} property declaration
 */
export declare const DEFAULT_PROPERTY_DECLARATION: PropertyDeclaration;
/**
 * Decorates a {@link CustomElement} property
 *
 * @param options The property declaration
 */
export declare const property: <Type extends CustomElement = CustomElement>(options?: PropertyDeclaration<Type>) => (target: Object, propertyKey: string) => void;
//# sourceMappingURL=property.d.ts.map