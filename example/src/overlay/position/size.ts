export interface Size {
    width: number | string;
    height: number | string;
    maxWidth: number | string;
    maxHeight: number | string;
}

export function hasSizeChanged (size?: Partial<Size>, other?: Partial<Size>): boolean {

    if (size && other) {

        return size.width !== other.width
            || size.height !== other.height
            || size.maxWidth !== other.maxWidth
            || size.maxHeight !== other.maxHeight;
    }

    return size !== other;
}
