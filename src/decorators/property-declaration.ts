import { CustomElement } from '../custom-element';
import { kebabCase } from '../utils/string-utils';
import { AttributeConverter, ATTRIBUTE_CONVERTERS } from './attribute-converter';

/**
 * A function that will reflect an attribute value to a property
 */
export type AttributeReflector<Type extends CustomElement = CustomElement> = (this: Type, attributeName: string, oldValue: string, newValue: string) => void;

/**
 * A function that will reflect a property value to an attribute
 */
export type PropertyReflector<Type extends CustomElement = CustomElement> = (this: Type, propertyKey: PropertyKey, oldValue: any, newValue: any) => void;

/**
 * A function that will dispatch a custom event for a property change
 */
export type PropertyNotifier<Type extends CustomElement = CustomElement> = (this: Type, propertyKey: PropertyKey, oldValue: any, newValue: any) => void;

/**
 * A function that will return `true` if the `oldValue` and the `newValue` of a property are different, `false` otherwise
 */
export type PropertyChangeDetector = (oldValue: any, newValue: any) => boolean;

/**
 * A type guard for {@link AttributeReflector}
 *
 * @param reflector A reflector to test
 */
export function isAttributeReflector (reflector: any): reflector is AttributeReflector {

    return typeof reflector === 'function';
}

/**
 * A type guard for {@link PropertyReflector}
 *
 * @param reflector A reflector to test
 */
export function isPropertyReflector (reflector: any): reflector is PropertyReflector {

    return typeof reflector === 'function';
}

/**
 * A type guard for {@link PropertyNotifier}
 *
 * @param notifier A notifier to test
 */
export function isPropertyNotifier (notifier: any): notifier is PropertyNotifier {

    return typeof notifier === 'function';
}

/**
 * A type guard for {@link PropertyKey}
 *
 * @param key A property key to test
 */
export function isPropertyKey (key: any): key is PropertyKey {

    return typeof key === 'string' || typeof key === 'number' || typeof key === 'symbol';
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
 * @param propertyKey A property key to convert to an attribute name
 */
export function createAttributeName (propertyKey: PropertyKey): string {

    if (typeof propertyKey === 'string') {

        return kebabCase(propertyKey);

    } else if (typeof propertyKey === 'number') {

        // for numeric property indexes, we prefix the attribute and
        // replace any decimal points and plus signs with dashes
        return `attr-${ propertyKey }`.replace(/\.|\+/g, '-');

    } else {

        // TODO this could create multiple identical attribute names, if symbols don't have unique description

        return kebabCase(`attr-${ String(propertyKey) }`
            // replace invalid attribute characters
            .replace(/(\s|>|<|=|\+|\.|\(|\)|\/)+/g, '-')
            // remove the trailing dashes
            .replace(/\-$/, '')
        );
    }
}

/**
 * A {@link CustomElement} property declaration
 */
export interface PropertyDeclaration<Type extends CustomElement = CustomElement> {
    /**
     * Does property have an associated attribute?
     *
     * @remarks
     * Possible values:
     * * `false`: No attribute will be associated with this property
     * * `true`: The attribute name will be inferred by camel-casing the property name
     * * `string`: Use the provided string as the associated attribute name
     *
     * Default value: `true`
     */
    attribute: boolean | string;

    /**
     * Customize the conversion of values between property and associated attribute
     *
     * @remarks
     * Converters are only used when {@link reflectProperty} and/or {@link reflectAttribute} are set to true.
     * If custom reflectors are used, they have to take care or converting the property/attribute values.
     *
     * Default value: `ATTRIBUTE_CONVERTERS.default`
     */
    converter: AttributeConverter;

    /**
     * Should the associated attribute's value be automatically reflected to the property?
     *
     * @remarks
     * Possible values:
     * * `false`: The attribute value will not be reflected to the property automatically
     * * `true`: Any attribute change will be reflected automatically to the property using the default attribute reflector
     * * `PropertyKey`: A method on the custom element with that property key will be invoked to handle the attribute reflection
     * * `Function`: The provided function will be invoked with its `this` context bound to the custom element instance
     *
     * Default value: `true`
     */
    reflectAttribute: boolean | keyof Type | AttributeReflector<Type>;

    /**
     * Should the property value be automatically reflected to the associated attribute?
     *
     * @remarks
     * Possible values:
     * * `false`: The property value will not be reflected to the associated attribute automatically
     * * `true`: Any property change will be reflected automatically to the associated attribute using the default property reflector
     * * `PropertyKey`: A method on the custom element with that property key will be invoked to handle the property reflection
     * * `Function`: The provided function will be invoked with its `this` context bound to the custom element instance
     *
     * Default value: `true`
     */
    reflectProperty: boolean | keyof Type | PropertyReflector<Type>;

    /**
     * Should a property value change raise a custom event?
     *
     * @remarks
     * Possible values:
     * * `false`: Don't create a custom event for this property
     * * `true`: Create custom events for this property automatically
     * * `PropertyKey`: Use the method with this property key on the custom element to create custom events
     * * `Function`: Use the the provided function to create custom events (`this` context will be the custom element instance)
     *
     * Default value: `true`
     */
    notify: boolean | keyof Type | PropertyNotifier<Type>;

    /**
     * Configure how changes of this property should be monitored
     *
     * @remarks
     * By default a decorated property will be observed for changes (through a custom setter for the property).
     * Any `set`-operation of this property will therefore request an update of the custom element and initiate
     * a render as well as reflection and notification.
     *
     * Possible values:
     * * `false`: Don't observe changes of this property (this will bypass render, reflection and notification)
     * * `true`: Observe changes of this property using the {@link DEFAULT_PROPERTY_CHANGE_DETECTOR}
     * * `PropertyKey`: Use a method with this property key on the custom element to check if property value has changed
     * * `Function`: Use the provided method to check if property value has changed (`this` context will be custom element instance)
     *
     * Default value: `true` (uses {@link DEFAULT_PROPERTY_CHANGE_DETECTOR} internally)
     */
    observe: boolean | keyof Type | PropertyChangeDetector;
}

/**
 * The default property change detector
 *
 * @param oldValue  The old property value
 * @param newValue  The new property value
 */
export const DEFAULT_PROPERTY_CHANGE_DETECTOR: PropertyChangeDetector = (oldValue: any, newValue: any) => {
    // in case `oldValue` and `newValue` are `NaN`, `(NaN !== NaN)` returns `true`,
    // but `(NaN === NaN || NaN === NaN)` returns `false`
    return oldValue !== newValue && (oldValue === oldValue || newValue === newValue);
};

/**
 * The default {@link CustomElement} property declaration
 */
export const DEFAULT_PROPERTY_DECLARATION: PropertyDeclaration = {
    attribute: true,
    converter: ATTRIBUTE_CONVERTERS.default,
    reflectAttribute: true,
    reflectProperty: true,
    notify: true,
    observe: DEFAULT_PROPERTY_CHANGE_DETECTOR,
};
