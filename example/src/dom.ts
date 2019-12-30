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
