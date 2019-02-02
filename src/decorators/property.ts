import { CustomElementType, CustomElement } from '../custom-element';

export type PropertyReflector<Type extends CustomElement = CustomElement> = (this: Type, propertyKey: string, oldValue: any, newValue: any) => void;

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
    observe?: boolean,
    notify?: boolean,
    reflect?: boolean | string | PropertyReflector<Type>,
    hasChanged?: (oldValue: any, newValue: any) => boolean;
    toAttribute?: (value: any) => string | null;
    fromAttribute?: (value: string) => any;
}

/**
 * The default {@link CustomElement} property declaration
 */
export const DEFAULT_PROPERTY_DECLARATION: PropertyDeclaration = {
    observe: true,
    notify: false,
    reflect: false,
    hasChanged: (oldValue: any, newValue: any) => oldValue !== newValue && (oldValue === oldValue || newValue === newValue),
    toAttribute: value => value.toString(),
    fromAttribute: value => value
};

/**
 * Decorates a {@link CustomElement} property
 *
 * @param options The property declaration
 */
export const property = <Type extends CustomElement = CustomElement>(options: PropertyDeclaration<Type> = {}) => {

    return (target: Object, propertyKey: string): void => {

        const descriptor = getPropertyDescriptor(target, propertyKey);
        const hiddenKey = (typeof propertyKey === 'string') ? `_${ propertyKey }` : Symbol();
        const get = descriptor && descriptor.get || function (this: any) { return this[hiddenKey]; };
        const set = descriptor && descriptor.set || function (this: any, value: any) { this[hiddenKey] = value; };

        Object.defineProperty(target, propertyKey, {
            configurable: true,
            enumerable: true,
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

        const constructor = target.constructor as CustomElementType<Type>;

        constructor.propertyDeclarations[propertyKey] = { ...DEFAULT_PROPERTY_DECLARATION, ...options };
    };
};

/**
 * Get the {@link PropertyDescriptor} of a property from its prototype
 * or a parent prototype - excluding {@link Object.prototype} itself, to
 * ensure correct prototype inheritance.
 *
 * @param target        The prototype to get the descriptor from
 * @param propertyKey   The property key for which to get the descriptor
 *
 * @internal
 * @private
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
