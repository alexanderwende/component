/**
 * Get the {@link PropertyDescriptor} of a property from its prototype
 * or a parent prototype - excluding {@link Object.prototype} itself.
 *
 * @param target        The prototype to get the descriptor from
 * @param propertyKey   The property key for which to get the descriptor
 *
 * @internal
 * @private
 */
export declare function getPropertyDescriptor(target: Object, propertyKey: PropertyKey): PropertyDescriptor | undefined;
//# sourceMappingURL=get-property-descriptor.d.ts.map