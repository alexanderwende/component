/**
 * A function that will map an attribute value to a property value
 */
export type AttributeMapper<T = any> = (value: string | null) => T | null;

/**
 * A function that will map a property value to an attribute value
 */
export type PropertyMapper<T = any> = (value: T | null) => string | null | undefined;

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
export const AttributeConverterDefault: AttributeConverter = {
    fromAttribute: (value: string | null) => {
        // `JSON.parse()` will throw an error for empty strings - we consider it null
        if (value === null || value === '') {
            return null;
        }
        else
            try {
                // `JSON.parse()` will successfully parse `boolean`, `number` and `JSON.stringify`'d values
                return JSON.parse(value);
            }
            catch (error) {
                // if it throws, it means we're probably dealing with a regular string
                return value;
            }
    },
    toAttribute: (value: any) => {
        switch (typeof value) {
            case 'boolean':
                return value ? '' : null;
            case 'object':
                return (value == null) ? value : JSON.stringify(value);
            case 'undefined':
                return value;
            case 'string':
                return value;
            default: // number, bigint, symbol, function
                return value.toString();
        }
    }
};

/**
 * Handles boolean attributes, like `disabled`, which are considered true if they are set with
 * any value at all. In order to set the attribute to false, the attribute has to be removed by
 * setting the attribute value to `null`.
 */
export const AttributeConverterBoolean: AttributeConverter<boolean> = {
    fromAttribute: (value: string | null) => (value !== null),
    toAttribute: (value: boolean | null) => value ? '' : null
}

/**
 * Handles boolean ARIA attributes, like `aria-checked` or `aria-selected`, which have to be
 * set explicitly to `true` or `false`.
 */
export const AttributeConverterARIABoolean: AttributeConverter<boolean> = {
    fromAttribute: (value) => value === 'true',
    // pass through null or undefined using `value == null`
    toAttribute: (value) => (value == null) ? value : value.toString()
};

export const AttributeConverterString: AttributeConverter<string> = {
    fromAttribute: (value: string | null) => (value === null) ? null : value,
    // pass through null or undefined
    toAttribute: (value: string | null) => value
}

export const AttributeConverterNumber: AttributeConverter<number> = {
    fromAttribute: (value: string | null) => (value === null) ? null : Number(value),
    // pass through null or undefined using `value == null`
    toAttribute: (value: number | null) => (value == null) ? value : value.toString()
}

export const AttributeConverterObject: AttributeConverter<object> = {
    // `JSON.parse()` will throw an error for empty strings - we consider it null
    fromAttribute: (value: string | null) => (value === null || value === '') ? null : JSON.parse(value),
    // pass through null or undefined using `value == null`
    toAttribute: (value: object | null) => (value == null) ? value : JSON.stringify(value)
}

export const AttributeConverterArray: AttributeConverter<any[]> = {
    // `JSON.parse()` will throw an error for empty strings - we consider it null
    fromAttribute: (value: string | null) => (value === null || value === '') ? null : JSON.parse(value),
    // pass through null or undefined using `value == null`
    toAttribute: (value: any[] | null) => (value == null) ? value : JSON.stringify(value)
};

export const AttributeConverterDate: AttributeConverter<Date> = {
    // `new Date()` will return an `Invalid Date` for empty strings - we consider it null
    fromAttribute: (value: string | null) => (value === null || value === '') ? null : new Date(value),
    // pass through null or undefined using `value == null`
    toAttribute: (value: Date | null) => (value == null) ? value : value.toString()
}
