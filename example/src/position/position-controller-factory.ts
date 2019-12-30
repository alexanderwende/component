import { BehaviorFactory, BehaviorMap, ConfigurationMap } from '../behavior-factory';
import { CenteredPositionController, DEFAULT_POSITION_CONFIG_CENTERED } from './controller/centered-position-controller';
import { ConnectedPositionController, DEFAULT_POSITION_CONFIG_CONNECTED } from './controller/connected-position-controller';
import { DEFAULT_POSITION_CONFIG, PositionConfig } from './position-config';
import { PositionController } from './position-controller';

export type PositionTypes = 'default' | 'centered' | 'connected';

export const POSITION_CONTROLLERS: BehaviorMap<PositionController, PositionTypes> = {
    default: PositionController,
    centered: CenteredPositionController,
    connected: ConnectedPositionController,
}

export const POSITION_CONFIGURATIONS: ConfigurationMap<PositionConfig, PositionTypes> = {
    default: DEFAULT_POSITION_CONFIG,
    centered: DEFAULT_POSITION_CONFIG_CENTERED,
    connected: DEFAULT_POSITION_CONFIG_CONNECTED,
};

export class PositionControllerFactory extends BehaviorFactory<PositionController, PositionConfig, PositionTypes> {

    constructor (
        protected behaviors = POSITION_CONTROLLERS,
        protected configurations = POSITION_CONFIGURATIONS,
    ) {

        super(behaviors, configurations);
    }
}
