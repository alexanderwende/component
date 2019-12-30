import { BehaviorFactory, BehaviorMap, ConfigurationMap } from 'example/src/behavior-factory';
import { Overlay } from '../overlay';
import { DialogOverlayTrigger, DIALOG_OVERLAY_TRIGGER_CONFIG } from './dialog-overlay-trigger';
import { OverlayTrigger } from './overlay-trigger';
import { DEFAULT_OVERLAY_TRIGGER_CONFIG, OverlayTriggerConfig } from './overlay-trigger-config';
import { TooltipOverlayTrigger, TOOLTIP_OVERLAY_TRIGGER_CONFIG } from './tooltip-overlay-trigger';

export type OverlayTriggerTypes = 'default' | 'dialog' | 'tooltip';

export const OVERLAY_TRIGGERS: BehaviorMap<OverlayTrigger, OverlayTriggerTypes> = {
    default: OverlayTrigger,
    dialog: DialogOverlayTrigger,
    tooltip: TooltipOverlayTrigger,
};

export const OVERLAY_TRIGGER_CONFIGS: ConfigurationMap<OverlayTriggerConfig, OverlayTriggerTypes> = {
    default: DEFAULT_OVERLAY_TRIGGER_CONFIG,
    dialog: DIALOG_OVERLAY_TRIGGER_CONFIG,
    tooltip: TOOLTIP_OVERLAY_TRIGGER_CONFIG,
};

export class OverlayTriggerFactory extends BehaviorFactory<OverlayTrigger, OverlayTriggerConfig, OverlayTriggerTypes> {

    constructor (
        protected behaviors = OVERLAY_TRIGGERS,
        protected configurations = OVERLAY_TRIGGER_CONFIGS,
    ) {

        super(behaviors, configurations);
    }

    /**
     * Override the {@link create} method to enforce the overlay parameter
     */
    create (
        type: OverlayTriggerTypes,
        config: Partial<OverlayTriggerConfig>,
        overlay: Overlay,
        ...args: any[]
    ): OverlayTrigger {

        return super.create(type, config, overlay, ...args);
    }
}
