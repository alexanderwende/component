/**
 * A function that will map an attribute value to a property value
 */
export declare type AttributeMapper = (value: string | null) => any;
/**
 * A function that will map a property value to an attribute value
 */
export declare type PropertyMapper = (value: any) => string | null | undefined;
/**
 * An object that holds an {@link AttributeMapper} and a {@link PropertyMapper}
 */
export interface AttributeConverter {
    toAttribute: PropertyMapper;
    fromAttribute: AttributeMapper;
}
/**
 * @internal
 * @private
 */
declare type AttributeConverterTypes = 'default' | 'boolean' | 'string' | 'number' | 'object' | 'array' | 'date';
/**
 * @internal
 * @private
 */
declare type AttributeConverterMap = {
    [P in AttributeConverterTypes]: AttributeConverter;
};
/**
 * A map of reusable {@link AttributeConverter}s
 *
 * @remark
 * For the most common types, a converter exists which can be referenced in the {@link PropertyDeclaration}.
 *
 * ```typescript
 * import { CustomElement, property, ATTRIBUTE_CONVERTERS } from 'custom-element';
 *
 * export class MyElement extends CustomElement {
 *
 *      @property({
 *          converter: ATTRIBUTE_CONVERTERS.boolean
 *      })
 *      myProperty = true;
 * }
 * ```
 *
 * TODO: Write tests for this
 */
export declare const ATTRIBUTE_CONVERTERS: AttributeConverterMap;
export {};
//# sourceMappingURL=attribute-converter.d.ts.map