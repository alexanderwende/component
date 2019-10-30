export interface Size {
    width: string | number;
    height: string | number;
    maxWidth: string | number;
    maxHeight: string | number;
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
