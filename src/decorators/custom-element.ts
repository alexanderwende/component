import { CustomElementType } from '../custom-element';

export interface CustomElementDeclaration extends Object {
    selector: string;
    shadow?: boolean;
    define?: boolean;
}

export const DEFAULT_CUSTOM_ELEMENT_DECLARATION: CustomElementDeclaration = {
    selector: 'custom-element',
    shadow:   true,
    define:   true
};

export const customElement = (options: CustomElementDeclaration) => {

    options = { ...DEFAULT_CUSTOM_ELEMENT_DECLARATION, ...options };

    return (target: CustomElementType) => {

        target.selector = ('selector' in options) ? options.selector! : target.selector;
        target.shadow   = options.shadow!;

        if (options.define) {

            window.customElements.define(target.selector, target);
        }
    };
};
