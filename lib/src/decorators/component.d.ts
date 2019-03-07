import { Component } from '../component';
import { ComponentDeclaration } from './component-declaration';
/**
 * Decorates a {@link Component} class
 *
 * @param options A {@link ComponentDeclaration}
 */
export declare function component<Type extends Component = Component>(options?: Partial<ComponentDeclaration<Type>>): (target: typeof Component) => void;
//# sourceMappingURL=component.d.ts.map