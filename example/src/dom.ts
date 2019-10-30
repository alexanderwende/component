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
 */
export const insertAfter = <T extends Node> (newChild: T, refChild: Node): T => {

    return refChild.parentNode!.insertBefore(newChild, refChild.nextSibling);
};
