import { CustomElementType } from '../custom-element';
export interface CustomElementDeclaration extends Object {
    selector?: string;
    shadow?: boolean;
    define?: boolean;
}
export declare const DEFAULT_CUSTOM_ELEMENT_DECLARATION: CustomElementDeclaration;
export declare const customElement: (options?: CustomElementDeclaration) => (target: CustomElementType<import("../custom-element").CustomElement>) => void;
//# sourceMappingURL=custom-element.d.ts.map