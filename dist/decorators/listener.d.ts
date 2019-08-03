import { Component } from '../component.js';
import { ListenerDeclaration } from './listener-declaration.js';
/**
 * Decorates a {@link Component} method as an event listener
 *
 * @param options The listener declaration
 */
export declare function listener<Type extends Component = Component>(options: ListenerDeclaration<Type>): (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => void;
//# sourceMappingURL=listener.d.ts.map