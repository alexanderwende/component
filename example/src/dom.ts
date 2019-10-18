export const insertAfter = <T extends Node> (newChild: T, refChild: Node): T => {
    return refChild.parentNode!.insertBefore(newChild, refChild.nextSibling);
};
