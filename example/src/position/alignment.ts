import { Offset, hasOffsetChanged } from './offset';
import { Position } from './position';

export type AlignmentOption = 'start' | 'center' | 'end';

export interface Alignment {
    horizontal: AlignmentOption;
    vertical: AlignmentOption;
}

export interface AlignmentPair {
    origin: Alignment;
    target: Alignment;
    offset?: Offset;
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const DEFAULT_ALIGNMENT_PAIR: AlignmentPair = {
    origin: {
        horizontal: 'start',
        vertical: 'end'
    },
    target: {
        horizontal: 'start',
        vertical: 'start'
    }
};

export function isAlignment (alignment: any): alignment is Alignment {

    return typeof (alignment as Alignment).horizontal !== 'undefined' && typeof (alignment as Alignment).vertical !== 'undefined';
}

export function hasAlignmentChanged (alignment: Alignment, other: Alignment): boolean {

    if (alignment && other) {

        return alignment.horizontal !== other.horizontal
            || alignment.vertical !== other.vertical;
    }

    return alignment !== other;
}

export function hasAlignmentPairChanged (alignmentPair?: AlignmentPair, other?: AlignmentPair): boolean {

    if (alignmentPair && other) {

        return hasAlignmentChanged(alignmentPair.target, other.target)
            || hasAlignmentChanged(alignmentPair.origin, other.origin)
            || hasOffsetChanged(alignmentPair.offset, other.offset);
    }

    return alignmentPair !== other;
}

export function getAlignedPosition (elementBox: BoundingBox, elementAlignment: Alignment): Position {

    const position: Position = { x: 0, y: 0 };

    switch (elementAlignment.horizontal) {

        case 'start':
            position.x = elementBox.x;
            break;

        case 'center':
            position.x = elementBox.x + elementBox.width / 2;
            break;

        case 'end':
            position.x = elementBox.x + elementBox.width;
            break;
    }

    switch (elementAlignment.vertical) {

        case 'start':
            position.y = elementBox.y;
            break;

        case 'center':
            position.y = elementBox.y + elementBox.height / 2;
            break;

        case 'end':
            position.y = elementBox.y + elementBox.height;
            break;
    }

    return position;
}

export function getTargetPosition (originBox: BoundingBox, originAlignment: Alignment, targetBox: BoundingBox, targetAlignment: Alignment): Position {

    const originPosition = getAlignedPosition(originBox, originAlignment);
    const targetPosition = getAlignedPosition({ ...targetBox, x: 0, y: 0 }, targetAlignment);

    return {
        x: originPosition.x - targetPosition.x,
        y: originPosition.y - targetPosition.y,
    }
}
