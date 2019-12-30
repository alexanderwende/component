export interface Position {
    x: number;
    y: number;
}

export const DEFAULT_POSITION: Position = {
    x: 0,
    y: 0,
};

export function isPosition (position: any): position is Position {

    return typeof (position as Position).x !== 'undefined' && typeof (position as Position).y !== 'undefined';
}


export function hasPositionChanged (position?: Position, other?: Position): boolean {

    if (position && other) {

        return position.x !== other.x
            || position.y !== other.y;
    }

    return position !== other;
}
