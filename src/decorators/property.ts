import { CustomElement } from '../custom-element';

/**
 * Gets the {@link PropertyDescriptor} of a property from its prototype
 * or a parent prototype - excluding {@link Object.prototype} itself, to
 * ensure correct prototype inheritance.
 *
 * @param target        The prototype to get the descriptor from
 * @param propertyKey   The property key for which to get the descriptor
 */
function getPropertyDescriptor (target: Object, propertyKey: string | symbol): PropertyDescriptor | undefined {

    if (propertyKey in target) {

        while (target !== Object.prototype) {

            if (target.hasOwnProperty(propertyKey)) {

                return Object.getOwnPropertyDescriptor(target, propertyKey);
            }

            target = Object.getPrototypeOf(target);
        }
    }

    return undefined;
}

/**
 * A CustomElement property declaration
 *
 * @property observe    True if the property change should be observed and cause an update
 * @property notify     True if the property change should trigger a custom event
 */
export interface PropertyDeclaration {
    observe?: boolean,
    notify?: boolean,
    reflect?: boolean,
    hasChanged?: (oldValue: any, newValue: any) => boolean;
    toAttribute?: (value: any) => string;
    fromAttribute?: (value: string) => any;
}

export const DEFAULT_PROPERTY_DECLARATION: PropertyDeclaration = {
    observe:       true,
    notify:        false,
    reflect:       false,
    hasChanged:    (oldValue: any, newValue: any) => oldValue !== newValue && (oldValue === oldValue || newValue === newValue),
    toAttribute:   value => value.toString(),
    fromAttribute: value => value
};

export const property = (options: PropertyDeclaration = {}) => {

    return (target: Object, propertyKey: string): void => {

        const descriptor = getPropertyDescriptor(target, propertyKey);
        const hiddenKey  = (typeof propertyKey === 'string') ? `_${propertyKey}` : Symbol();
        const get        = descriptor && descriptor.get || function (this: any) { return this[hiddenKey]; };
        const set        = descriptor && descriptor.set || function (this: any, value: any) { this[hiddenKey] = value; };

        Object.defineProperty(target, propertyKey, {
            configurable: true,
            enumerable:   true,
            get (): any {
                return get.call(this);
            },
            set (value: any): void {
                console.log(`setting ${propertyKey}...`, value);
                const oldValue = this[propertyKey];
                set.call(this, value);
                this.requestUpdate(propertyKey, oldValue, value);
            }
        });

        const constructor = target.constructor as typeof CustomElement;

        constructor.propertyDeclarations[propertyKey] = { ...DEFAULT_PROPERTY_DECLARATION, ...options };
    };
};