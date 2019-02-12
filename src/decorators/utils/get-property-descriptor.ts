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
export function getPropertyDescriptor (target: Object, propertyKey: PropertyKey): PropertyDescriptor | undefined {

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
