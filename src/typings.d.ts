interface ShadowRoot {
    adoptedStyleSheets: CSSStyleSheet[];
}

interface DocumentOrShadowRoot {
    adoptedStyleSheets: CSSStyleSheet[];
}

interface CSSStyleSheet {
    replaceSync (cssText: string): void;
    replace (cssText: string): Promise<unknown>;
}
