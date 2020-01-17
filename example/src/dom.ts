/**
 * A CSS selector string
 *
 * @see
 * https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
 */
export type CSSSelector = string;

/**
 * Insert a Node after a reference Node
 *
 * @param newChild - The Node to insert
 * @param refChild - The reference Node after which to insert
 * @returns The inserted Node
 */
export const insertAfter = <T extends Node> (newChild: T, refChild: Node): T | undefined => {

    return refChild.parentNode?.insertBefore(newChild, refChild.nextSibling);
};

/**
 * Replace a reference Node with a new Node
 *
 * @param newChild - The Node to insert
 * @param refChild - The reference Node to replace
 * @returns The replaced reference Node
 */
export const replaceWith = <T extends Node, U extends Node> (newChild: T, refChild: U): U | undefined => {

    return refChild.parentNode?.replaceChild(newChild, refChild);
}

/**
 * Get the currently active element
 *
 * @description
 * Gets the currently active element, but pierces shadow roots to find the active element
 * also within a custom element which has a shadow root.
 */
export const activeElement = (): HTMLElement => {

    let shadowRoot: DocumentOrShadowRoot | null = document;
    let activeElement: Element = shadowRoot.activeElement ?? document.body;

    while (shadowRoot && shadowRoot.activeElement) {

        activeElement = shadowRoot.activeElement;
        shadowRoot = activeElement.shadowRoot;
    }

    return activeElement as HTMLElement;
}
