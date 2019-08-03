import { Component } from '../component.js';
import { ComponentDeclaration } from './component-declaration.js';
/**
 * Decorates a {@link Component} class
 *
 * @param options A {@link ComponentDeclaration}
 */
export declare function component<Type extends Component = Component>(options?: Partial<ComponentDeclaration<Type>>): (target: typeof Component) => void;
//# sourceMappingURL=component.d.ts.map