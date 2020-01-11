import { BehaviorFactory, BehaviorMap, ConfigurationMap } from '../behavior/behavior-factory';
import { CenteredPositionController, CENTERED_POSITION_CONFIG } from './controller/centered-position-controller';
import { ConnectedPositionController, CONNECTED_POSITION_CONFIG } from './controller/connected-position-controller';
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
    centered: CENTERED_POSITION_CONFIG,
    connected: CONNECTED_POSITION_CONFIG,
};

export class PositionControllerFactory extends BehaviorFactory<PositionController, PositionConfig, PositionTypes> {

    constructor (
        protected behaviors = POSITION_CONTROLLERS,
        protected configurations = POSITION_CONFIGURATIONS,
    ) {

        super(behaviors, configurations);
    }
}
