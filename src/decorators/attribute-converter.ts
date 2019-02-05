/**
 * A function that will map an attribute value to a property value
 */
export type AttributeMapper = (value: string | null) => any;

/**
 * A function that will map a property value to an attribute value
 */
export type PropertyMapper = (value: any) => string | null | undefined;

/**
 * An object that holds an {@link AttributeMapper} and a {@link PropertyMapper}
 */
export interface AttributeConverter {
    toAttribute?: PropertyMapper;
    fromAttribute?: AttributeMapper;
}

/**
 * @internal
 * @private
 */
type AttributeConverterTypes = 'default' | 'boolean' | 'string' | 'number' | 'object' | 'array' | 'date';

/**
 * @internal
 * @private
 */
type AttributeConverterMap = { [P in AttributeConverterTypes]: AttributeConverter; }

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
export const ATTRIBUTE_CONVERTERS: AttributeConverterMap = {
    default: {
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
    },
    boolean: {
        fromAttribute: (value: string | null) => (value !== null),
        toAttribute: (value: boolean) => value ? '' : null
    },
    string: {
        fromAttribute: (value: string | null) => (value === null) ? null : value,
        // pass through null or undefined
        toAttribute: (value: string) => value
    },
    number: {
        fromAttribute: (value: string | null) => (value === null) ? null : Number(value),
        // pass through null or undefined using `value == null`
        toAttribute: (value: number) => (value == null) ? value : value.toString()
    },
    object: {
        // `JSON.parse()` will throw an error for empty strings - we consider it null
        fromAttribute: (value: string | null) => (value === null || value === '') ? null : JSON.parse(value),
        // pass through null or undefined using `value == null`
        toAttribute: (value: object) => (value == null) ? value : JSON.stringify(value)
    },
    array: {
        // `JSON.parse()` will throw an error for empty strings - we consider it null
        fromAttribute: (value: string | null) => (value === null || value === '') ? null : JSON.parse(value),
        // pass through null or undefined using `value == null`
        toAttribute: (value: object) => (value == null) ? value : JSON.stringify(value)
    },
    date: {
        // `new Date()` will return an `Invalid Date` for empty strings - we consider it null
        fromAttribute: (value: string | null) => (value === null || value === '') ? null : new Date(value),
        // pass through null or undefined using `value == null`
        toAttribute: (value: Date) => (value == null) ? value : value.toString()
    }
};
