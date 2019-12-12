import { DEFAULT_POSITION_CONFIG, PositionConfig } from './position-config';
import { PositionStrategy, PositionController } from './position-strategy';
import { CenteredPositionStrategy, DEFAULT_POSITION_CONFIG_CENTERED, CenteredPositionController } from './strategies/centered-position-strategy';
import { ConnectedPositionStrategy, DEFAULT_POSITION_CONFIG_CONNECTED, ConnectedPositionController } from './strategies/connected-position-strategy';

export interface PositionStrategyMap {
    [key: string]: { new(target: HTMLElement, config?: Partial<PositionConfig>): PositionStrategy };
}

export interface PositionControllerMap {
    [key: string]: { new(config?: Partial<PositionConfig>): PositionController };
}

export interface PositionConfigMap {
    [key: string]: PositionConfig;
}

export const DEFAULT_POSITION_STRATEGIES: PositionStrategyMap = {
    default: PositionStrategy,
    centered: CenteredPositionStrategy,
    connected: ConnectedPositionStrategy,
};

export const DEFAULT_POSITION_CONTROLLERS: PositionControllerMap = {
    default: PositionController,
    centered: CenteredPositionController,
    connected: ConnectedPositionController,
};

export const DEFAULT_POSITION_CONFIGS: PositionConfigMap = {
    default: DEFAULT_POSITION_CONFIG,
    centered: DEFAULT_POSITION_CONFIG_CENTERED,
    connected: DEFAULT_POSITION_CONFIG_CONNECTED,
};

export class PositionStrategyFactory {

    constructor (
        protected strategies: PositionStrategyMap = DEFAULT_POSITION_STRATEGIES,
        protected configs: PositionConfigMap = DEFAULT_POSITION_CONFIGS
    ) { }

    createPositionStrategy (type: string, target: HTMLElement, config?: Partial<PositionConfig>): PositionStrategy {

        const strategy = this.strategies[type] || PositionStrategy;
        const configuration = { ...this.configs[type] || DEFAULT_POSITION_CONFIG, ...config };

        return new strategy(target, configuration);
    }
}

export class PositionControllerFactory {

    constructor (
        protected controllers: PositionControllerMap = DEFAULT_POSITION_CONTROLLERS,
        protected configs: PositionConfigMap = DEFAULT_POSITION_CONFIGS
    ) { }

    createPositionController (type: string, config?: Partial<PositionConfig>): PositionController {

        const controller = this.controllers[type] || PositionController;
        const configuration = { ...this.configs[type] || DEFAULT_POSITION_CONFIG, ...config };

        return new controller(configuration);
    }
}
