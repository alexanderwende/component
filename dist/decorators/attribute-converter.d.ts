/**
 * A function that will map an attribute value to a property value
 */
export declare type AttributeMapper<T = any> = (value: string | null) => T | null;
/**
 * A function that will map a property value to an attribute value
 */
export declare type PropertyMapper<T = any> = (value: T | null) => string | null | undefined;
/**
 * An object that holds an {@link AttributeMapper} and a {@link PropertyMapper}
 *
 * @remarks
 * For the most common types, a converter exists which can be referenced in the {@link PropertyDeclaration}.
 *
 * ```typescript
 * export class MyElement extends Component {
 *
 *      @property({
 *          converter: AttributeConverterBoolean
 *      })
 *      myProperty = true;
 * }
 * ```
 */
export interface AttributeConverter<T = any> {
    toAttribute: PropertyMapper<T>;
    fromAttribute: AttributeMapper<T>;
}
/**
 * The default attribute converter
 *
 * @remarks
 * This converter is used as the default converter for decorated properties unless a different one
 * is specified. The converter tries to infer the property type when converting to attributes and
 * uses `JSON.parse()` when converting strings from attributes. If `JSON.parse()` throws an error,
 * the converter will use the attribute value as a string.
 */
export declare const AttributeConverterDefault: AttributeConverter;
/**
 * Handles boolean attributes, like `disabled`, which are considered true if they are set with
 * any value at all. In order to set the attribute to false, the attribute has to be removed by
 * setting the attribute value to `null`.
 */
export declare const AttributeConverterBoolean: AttributeConverter<boolean>;
/**
 * Handles boolean ARIA attributes, like `aria-checked` or `aria-selected`, which have to be
 * set explicitly to `true` or `false`.
 */
export declare const AttributeConverterARIABoolean: AttributeConverter<boolean>;
export declare const AttributeConverterString: AttributeConverter<string>;
export declare const AttributeConverterNumber: AttributeConverter<number>;
export declare const AttributeConverterObject: AttributeConverter<object>;
export declare const AttributeConverterArray: AttributeConverter<any[]>;
export declare const AttributeConverterDate: AttributeConverter<Date>;
//# sourceMappingURL=attribute-converter.d.ts.map