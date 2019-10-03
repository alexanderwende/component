import { Position } from "./position";
import { PositionStrategy } from "./position-strategy";

export class PositionManager {

    constructor (public strategy: PositionStrategy) { }

    updatePosition (position?: Partial<Position>) {

        this.strategy.updatePosition(position);
    }

    destroy () {

        this.strategy.destroy();
    }
}
