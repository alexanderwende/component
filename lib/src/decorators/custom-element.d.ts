import { CustomElement } from '../custom-element';
import { CustomElementDeclaration } from './custom-element-declaration';
/**
 * Decorates a {@link CustomElement} class
 *
 * @param options A custom element declaration
 */
export declare function customElement<Type extends CustomElement = CustomElement>(options?: Partial<CustomElementDeclaration<Type>>): (target: typeof CustomElement) => void;
//# sourceMappingURL=custom-element.d.ts.map