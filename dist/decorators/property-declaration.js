import { AttributeConverterDefault } from './attribute-converter.js';
import { kebabCase } from './utils/string-utils.js';
/**
 * A type guard for {@link AttributeReflector}
 *
 * @param reflector A reflector to test
 */
export function isAttributeReflector(reflector) {
    return typeof reflector === 'function';
}
/**
 * A type guard for {@link PropertyReflector}
 *
 * @param reflector A reflector to test
 */
export function isPropertyReflector(reflector) {
    return typeof reflector === 'function';
}
/**
 * A type guard for {@link PropertyNotifier}
 *
 * @param notifier A notifier to test
 */
export function isPropertyNotifier(notifier) {
    return typeof notifier === 'function';
}
/**
 * A type guard for {@link PropertyChangeDetector}
 *
 * @param detector A detector to test
 */
export function isPropertyChangeDetector(detector) {
    return typeof detector === 'function';
}
/**
 * A type guard for {@link PropertyKey}
 *
 * @param key A property key to test
 */
export function isPropertyKey(key) {
    return typeof key === 'string' || typeof key === 'number' || typeof key === 'symbol';
}
/**
 * Encodes a string for use as html attribute removing invalid attribute characters
 *
 * @param value A string to encode for use as html attribute
 * @returns     An encoded string usable as html attribute
 */
export function encodeAttribute(value) {
    return kebabCase(value.replace(/\W+/g, '-').replace(/\-$/, ''));
}
/**
 * A helper function to create an attribute name from a property key
 *
 * @remarks
 * Numeric property indexes or symbols can contain invalid characters for attribute names. This method
 * sanitizes those characters and replaces sequences of invalid characters with a dash.
 * Attribute names are not allowed to start with numbers either and are prefixed with 'attr-'.
 *
 * N.B.: When using custom symbols as property keys, use unique descriptions for the symbols to avoid
 * clashing attribute names.
 *
 * ```typescript
 * const a = Symbol();
 * const b = Symbol();
 *
 * a !== b; // true
 *
 * createAttributeName(a) !== createAttributeName(b); // false --> 'attr-symbol' === 'attr-symbol'
 *
 * const c = Symbol('c');
 * const d = Symbol('d');
 *
 * c !== d; // true
 *
 * createAttributeName(c) !== createAttributeName(d); // true --> 'attr-symbol-c' === 'attr-symbol-d'
 * ```
 *
 * @param propertyKey   A property key to convert to an attribute name
 * @returns             The generated attribute name
 */
export function createAttributeName(propertyKey) {
    if (typeof propertyKey === 'string') {
        return kebabCase(propertyKey);
    }
    else {
        // TODO: this could create multiple identical attribute names, if symbols don't have unique description
        return `attr-${encodeAttribute(String(propertyKey))}`;
    }
}
/**
 * A helper function to create an event name from a property key
 *
 * @remarks
 * Event names don't have the same restrictions as attribute names when it comes to invalid
 * characters. However, for consistency's sake, we apply the same rules for event names as
 * for attribute names.
 *
 * @param propertyKey   A property key to convert to an attribute name
 * @param prefix        An optional prefix, e.g.: 'on'
 * @param suffix        An optional suffix, e.g.: 'changed'
 * @returns             The generated event name
 */
export function createEventName(propertyKey, prefix, suffix) {
    let propertyString = '';
    if (typeof propertyKey === 'string') {
        propertyString = kebabCase(propertyKey);
    }
    else {
        // TODO: this could create multiple identical event names, if symbols don't have unique description
        propertyString = encodeAttribute(String(propertyKey));
    }
    return `${prefix ? `${kebabCase(prefix)}-` : ''}${propertyString}${suffix ? `-${kebabCase(suffix)}` : ''}`;
}
/**
 * The default property change detector
 *
 * @param oldValue  The old property value
 * @param newValue  The new property value
 * @returns         A boolean indicating if the property value changed
 */
export const DEFAULT_PROPERTY_CHANGE_DETECTOR = (oldValue, newValue) => {
    // in case `oldValue` and `newValue` are `NaN`, `(NaN !== NaN)` returns `true`,
    // but `(NaN === NaN || NaN === NaN)` returns `false`
    return oldValue !== newValue && (oldValue === oldValue || newValue === newValue);
};
// TODO: maybe provide flat array/object change detector? date change detector?
/**
 * The default {@link PropertyDeclaration}
 */
export const DEFAULT_PROPERTY_DECLARATION = {
    attribute: true,
    converter: AttributeConverterDefault,
    reflectAttribute: true,
    reflectProperty: true,
    notify: true,
    observe: DEFAULT_PROPERTY_CHANGE_DETECTOR,
};
//# sourceMappingURL=property-declaration.js.map