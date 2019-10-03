import { Position } from "../position";
import { DEFAULT_POSITION, PositionStrategy } from "../position-strategy";

export const DEFAULT_POSITION_FIXED: Position = {
    ...DEFAULT_POSITION,
    top: '50vh',
    left: '50vw',
    offsetHorizontal: '-50%',
    offsetVertical: '-50%',
};

export class FixedPositionStrategy extends PositionStrategy {

    constructor (public target: HTMLElement, defaultPosition: Position = DEFAULT_POSITION_FIXED) {

        super(target, defaultPosition);
    }

    protected getPosition (): Position {

        return this.defaultPosition;
    }

    protected applyPosition (position: Position) {

        super.applyPosition(position);

        this.target.style.transform = `translate(${ position.offsetHorizontal, position.offsetVertical })`;
    }
}
