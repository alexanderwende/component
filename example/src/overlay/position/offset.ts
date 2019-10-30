export interface Offset {
    horizontal: string | number;
    vertical: string | number;
}

export function hasOffsetChanged (offset?: Offset, other?: Offset): boolean {

    if (offset && other) {

        return offset.horizontal !== other.horizontal
            || offset.vertical !== other.vertical;
    }

    return offset !== other;
}
