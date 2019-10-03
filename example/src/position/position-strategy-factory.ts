import { Position } from "./position";
import { PositionStrategy } from "./position-strategy";
import { ConnectedPositionStrategy } from "./strategies/connected-position-strategy";
import { FixedPositionStrategy } from "./strategies/fixed-position-strategy";

export interface PositionStrategyMap {
    [key: string]: { new(...args: any[]): PositionStrategy };
}

export const DEFAULT_POSITION_STRATEGIES: PositionStrategyMap = {
    fixed: FixedPositionStrategy,
    connected: ConnectedPositionStrategy,
};

export class PositionStrategyFactory {

    constructor (protected strategies: PositionStrategyMap = DEFAULT_POSITION_STRATEGIES) { }

    createPositionStrategy (type: string, ...args: any[]): PositionStrategy {

        return this.strategies[type] ? new this.strategies[type](...args) : new FixedPositionStrategy(...args as [HTMLElement, Position]);
    }
}