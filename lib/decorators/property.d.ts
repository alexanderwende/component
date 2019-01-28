/**
 * A CustomElement property declaration
 *
 * @property observe    True if the property change should be observed and cause an update
 * @property notify     True if the property change should trigger a custom event
 */
export interface PropertyDeclaration {
    observe?: boolean;
    notify?: boolean;
    reflect?: boolean;
    hasChanged?: (oldValue: any, newValue: any) => boolean;
    toAttribute?: (value: any) => string;
    fromAttribute?: (value: string) => any;
}
export declare const DEFAULT_PROPERTY_DECLARATION: PropertyDeclaration;
export declare const property: (options?: PropertyDeclaration) => (target: Object, propertyKey: string) => void;
//# sourceMappingURL=property.d.ts.map