import { Component } from '../component.js';

/**
 * A {@link Component} selector declaration
 */
export interface SelectorDeclaration<Type extends Component = Component> {
    /**
     * The selector to query
     *
     * @remarks
     * Setting query to `null` allows to unbind an inherited selector.
     */
    query: string | null;

    /**
     * Use querySelectorAll for querying
     *
     * Default value: `false`
     */
    all?: boolean;
}

export const DEFAULT_SELECTOR_DECLARATION: SelectorDeclaration = {
    query: null,
    all: false,
};
