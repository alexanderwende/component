/**
 * The default attribute converter
 *
 * @remarks
 * This converter is used as the default converter for decorated properties unless a different one
 * is specified. The converter tries to infer the property type when converting to attributes and
 * uses `JSON.parse()` when converting strings from attributes. If `JSON.parse()` throws an error,
 * the converter will use the attribute value as a string.
 */
export const AttributeConverterDefault = {
    fromAttribute: (value) => {
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
    toAttribute: (value) => {
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
export const AttributeConverterBoolean = {
    fromAttribute: (value) => (value !== null),
    toAttribute: (value) => value ? '' : null
};
export const AttributeConverterString = {
    fromAttribute: (value) => (value === null) ? null : value,
    // pass through null or undefined
    toAttribute: (value) => value
};
export const AttributeConverterNumber = {
    fromAttribute: (value) => (value === null) ? null : Number(value),
    // pass through null or undefined using `value == null`
    toAttribute: (value) => (value == null) ? value : value.toString()
};
export const AttributeConverterObject = {
    // `JSON.parse()` will throw an error for empty strings - we consider it null
    fromAttribute: (value) => (value === null || value === '') ? null : JSON.parse(value),
    // pass through null or undefined using `value == null`
    toAttribute: (value) => (value == null) ? value : JSON.stringify(value)
};
export const AttributeConverterArray = {
    // `JSON.parse()` will throw an error for empty strings - we consider it null
    fromAttribute: (value) => (value === null || value === '') ? null : JSON.parse(value),
    // pass through null or undefined using `value == null`
    toAttribute: (value) => (value == null) ? value : JSON.stringify(value)
};
export const AttributeConverterDate = {
    // `new Date()` will return an `Invalid Date` for empty strings - we consider it null
    fromAttribute: (value) => (value === null || value === '') ? null : new Date(value),
    // pass through null or undefined using `value == null`
    toAttribute: (value) => (value == null) ? value : value.toString()
};
//# sourceMappingURL=attribute-converter.js.map